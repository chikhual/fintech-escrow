import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  metadata?: any;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = (environment as any).notificationApiUrl || 
    (environment.apiUrl.includes('localhost') 
      ? environment.apiUrl.replace(':8000', ':8004')
      : `${environment.apiUrl}/notifications`);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  getNotifications(params?: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  }): Observable<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages?: number;
    };
  }> {
    let httpParams = new HttpParams();
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    if (params) {
      httpParams = httpParams.set('page', page.toString());
      httpParams = httpParams.set('limit', limit.toString());
      if (params.unread_only) httpParams = httpParams.set('unread_only', params.unread_only.toString());
    }

    // Create cache key
    const cacheKey = `notifications_${JSON.stringify(params || {})}`;
    
    // Try to get from cache first (shorter TTL for notifications - 2 minutes)
    const cached = this.cacheService.get<{
      notifications: Notification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages?: number;
      };
    }>(cacheKey);
    
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    const source$ = this.http.get<{
      notifications: Notification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages?: number;
      };
    }>(`${this.apiUrl}/notifications`, {
      headers: this.authService.getAuthHeaders(),
      params: httpParams
    }).pipe(
      tap(response => {
        // Add total_pages if not present
        if (!response.pagination.total_pages) {
          response.pagination.total_pages = Math.ceil(response.pagination.total / limit);
        }
        // Cache for 2 minutes (notifications change more frequently)
        this.cacheService.set(cacheKey, response, 2 * 60 * 1000);
      })
    );

    return source$;
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Invalidate notifications cache
        this.cacheService.invalidatePattern('notifications_');
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.getNotifications({ unread_only: true, limit: 1 }).subscribe({
        next: (response) => {
          observer.next(response.pagination.total);
          observer.complete();
        },
        error: (error) => {
          console.error('Error getting unread count:', error);
          observer.next(0);
          observer.complete();
        }
      });
    });
  }
}

