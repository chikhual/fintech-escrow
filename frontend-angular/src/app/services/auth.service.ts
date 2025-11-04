import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError, timer, timeout } from 'rxjs';
import { catchError, switchMap, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  is_kyc_verified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  two_factor_code?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  curp?: string;
  rfc?: string;
  ine_number?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use authApiUrl if available, otherwise construct from apiUrl
  private apiUrl: string;
  
  private initializeApiUrl(): string {
    try {
      // First try authApiUrl if available
      if ((environment as any).authApiUrl) {
        return (environment as any).authApiUrl;
      }
      
      // Fallback to constructing from apiUrl
      if (!environment.apiUrl) {
        console.warn('API URL not configured, using default localhost:8001');
        return 'http://localhost:8001';
      }
      
      if (environment.apiUrl.includes('localhost')) {
        return environment.apiUrl.replace(':8000', ':8001');
      }
      
      return `${environment.apiUrl}/auth`;
    } catch (error) {
      console.error('Error initializing API URL:', error);
      return 'http://localhost:8001'; // Safe fallback
    }
  }
  private tokenKey = 'consufin_access_token';
  private refreshTokenKey = 'consufin_refresh_token';
  private userKey = 'consufin_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenRefreshTimer: any = null;
  private readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiration
  private isRefreshing = false;
  private refreshQueue: Array<{ resolve: (token: TokenResponse) => void, reject: (error: any) => void }> = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.apiUrl = this.initializeApiUrl();
    // Check if token is expired
    const token = this.getToken();
    if (token) {
      // Validate token and start refresh timer
      if (this.isTokenExpired(token)) {
        this.refreshAccessToken().subscribe({
          next: () => {
            this.getCurrentUser().subscribe({
              error: () => this.logout()
            });
          },
          error: () => this.logout()
        });
      } else {
        this.startTokenRefreshTimer();
        this.getCurrentUser().subscribe({
          error: () => this.logout()
        });
      }
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    console.log('🔐 Attempting login to:', `${this.apiUrl}/login`);
    console.log('📧 Email:', credentials.email);
    
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      timeout(30000), // 30 second timeout
      tap(response => {
        console.log('✅ Login successful, received token');
        this.setToken(response.access_token);
        if (response.refresh_token) {
          this.setRefreshToken(response.refresh_token);
        }
        // Start automatic token refresh
        this.startTokenRefreshTimer();
        // Get user info after login - handle errors gracefully
        this.getCurrentUser().subscribe({
          next: (user) => {
            console.log('✅ User info retrieved:', user.email);
            this.setCurrentUser(user);
            this.router.navigate(['/consufin/usuario']);
          },
          error: (err) => {
            console.error('⚠️ Error getting user info after login:', err);
            // Still navigate even if getCurrentUser fails
            // User info can be fetched later
            this.router.navigate(['/consufin/usuario']);
          }
        });
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Login error:', error);
        console.error('   Status:', error.status);
        console.error('   Status Text:', error.statusText);
        console.error('   Error:', error.error);
        console.error('   URL:', error.url);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => {
        // After registration, automatically log in
        this.login({
          email: userData.email,
          password: userData.password
        }).subscribe({
          next: () => {
            this.router.navigate(['/consufin/validacion']);
          },
          error: (err) => {
            console.error('Auto-login after registration failed:', err);
            // Still navigate to KYC if login fails
            this.router.navigate(['/consufin/validacion']);
          }
        });
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
      tap(user => this.setCurrentUser(user)),
      catchError((error: HttpErrorResponse) => {
        // If token expired, try to refresh
        if (error.status === 401) {
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              const newHeaders = this.getAuthHeaders();
              return this.http.get<User>(`${this.apiUrl}/me`, { headers: newHeaders });
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  refreshAccessToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Observable<TokenResponse>(observer => {
        this.refreshQueue.push({
          resolve: (token: TokenResponse) => {
            observer.next(token);
            observer.complete();
          },
          reject: (error: any) => {
            observer.error(error);
          }
        });
      });
    }

    this.isRefreshing = true;

    // Try the refresh endpoint - backend expects refresh_token in request body
    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        if (response.refresh_token) {
          this.setRefreshToken(response.refresh_token);
        }
        this.startTokenRefreshTimer();
        
        // Process queued requests
        this.isRefreshing = false;
        this.refreshQueue.forEach(({ resolve }) => resolve(response));
        this.refreshQueue = [];
      }),
      catchError((error) => {
        // If refresh fails, logout user and reject queued requests
        console.error('Token refresh failed:', error);
        this.isRefreshing = false;
        this.refreshQueue.forEach(({ reject }) => reject(error));
        this.refreshQueue = [];
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Assume expired if we can't decode
    }
  }

  private getTokenExpirationTime(token: string): number | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000; // Return in milliseconds
    } catch (error) {
      return null;
    }
  }

  private startTokenRefreshTimer(): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const token = this.getToken();
    if (!token) {
      return;
    }

    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) {
      return;
    }

    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    const refreshTime = Math.max(0, timeUntilExpiration - this.TOKEN_REFRESH_BUFFER);

    console.log(`Token will refresh in ${Math.floor(refreshTime / 1000 / 60)} minutes`);

    this.tokenRefreshTimer = setTimeout(() => {
      console.log('Refreshing access token...');
      this.refreshAccessToken().subscribe({
        next: () => {
          console.log('Token refreshed successfully');
        },
        error: (error) => {
          console.error('Failed to refresh token:', error);
          // Will trigger logout in refreshAccessToken
        }
      });
    }, refreshTime);
  }

  logout(): void {
    // Clear token refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/consufin']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    // Permitir acceso con tokens mock de desarrollo
    if (token === 'dev-token-quick-access' || token === 'direct-access-token') {
      return true;
    }
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthHeaders(): HttpHeaders {
    let token = this.getToken();
    
    // Check if token is expired or about to expire
    if (token && this.isTokenExpired(token)) {
      // Try to refresh synchronously (in a real scenario, you might want to handle this differently)
      console.warn('Token expired, attempting refresh...');
      // This will be handled by the interceptor or the calling method
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

