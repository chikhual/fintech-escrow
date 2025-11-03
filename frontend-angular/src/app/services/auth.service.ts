import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use authApiUrl if available, otherwise construct from apiUrl
  private apiUrl = (environment as any).authApiUrl || 
    (environment.apiUrl.includes('localhost') 
      ? environment.apiUrl.replace(':8000', ':8001')
      : `${environment.apiUrl}/auth`);
  private tokenKey = 'consufin_access_token';
  private refreshTokenKey = 'consufin_refresh_token';
  private userKey = 'consufin_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if token is expired
    const token = this.getToken();
    if (token) {
      // Optionally validate token or get user info
      this.getCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.access_token);
        if (response.refresh_token) {
          this.setRefreshToken(response.refresh_token);
        }
        // Get user info after login - handle errors gracefully
        this.getCurrentUser().subscribe({
          next: (user) => {
            this.setCurrentUser(user);
            this.router.navigate(['/consufin']);
          },
          error: (err) => {
            console.error('Error getting user info after login:', err);
            // Still navigate even if getCurrentUser fails
            // User info can be fetched later
            this.router.navigate(['/consufin']);
          }
        });
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
      tap(user => this.setCurrentUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/consufin']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
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
    const token = this.getToken();
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

