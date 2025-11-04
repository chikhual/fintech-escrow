import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

export interface EscrowTransaction {
  id: number;
  transaction_id: string;
  buyer_id: number;
  seller_id: number;
  item_title: string;
  item_description?: string;
  item_category?: string;
  item_condition?: string;
  price: number;
  currency: string;
  escrow_fee: number;
  total_amount: number;
  status: string;
  delivery_method?: string;
  delivery_address?: string;
  inspection_period_days?: number;
  created_at: string;
  updated_at?: string;
  agreement_date?: string;
  payment_date?: string;
  shipping_date?: string;
  delivery_date?: string;
  completion_date?: string;
}

export interface EscrowTransactionCreate {
  seller_id: number;
  item: {
    title: string;
    description?: string;
    category?: string;
    condition?: string;
    estimated_value?: number;
    images?: string[];
  };
  terms: {
    price: number;
    currency?: string;
    delivery_method?: string;
    delivery_address?: string;
    inspection_period_days?: number;
  };
}

export interface TransactionStats {
  total_transactions: number;
  total_value: number;
  total_fees: number;
  active_transactions: number;
  completed_transactions: number;
  disputed_transactions: number;
}

export interface BuyerStats {
  enProceso: number;
  completadas: number;
  pendientes: number;
  enDisputa: number;
  gastado: number;
  rating: number;
}

export interface SellerStats {
  enProceso: number;
  completadas: number;
  pendientes: number;
  enDisputa: number;
  vendido: number;
  rating: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = (environment as any).escrowApiUrl || 
    (environment.apiUrl.includes('localhost') 
      ? environment.apiUrl.replace(':8000', ':8002')
      : `${environment.apiUrl}/escrow`);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  getTransactions(params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<EscrowTransaction>> {
    let httpParams = new HttpParams();
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.category) httpParams = httpParams.set('category', params.category);
      httpParams = httpParams.set('page', page.toString());
      httpParams = httpParams.set('limit', limit.toString());
    }

    // Create cache key
    const cacheKey = `transactions_${JSON.stringify(params || {})}`;
    
    // Try to get from cache first
    const cached = this.cacheService.get<PaginatedResponse<EscrowTransaction>>(cacheKey);
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    // Make API call
    const source$ = new Observable<PaginatedResponse<EscrowTransaction>>(observer => {
      this.http.get<EscrowTransaction[] | PaginatedResponse<EscrowTransaction>>(
        `${this.apiUrl}/transactions`,
        {
          headers: this.authService.getAuthHeaders(),
          params: httpParams
        }
      ).subscribe({
        next: (response) => {
          // Handle both array and paginated response
          let paginatedResponse: PaginatedResponse<EscrowTransaction>;
          
          if (Array.isArray(response)) {
            // If backend returns array, wrap it
            paginatedResponse = {
              items: response,
              pagination: {
                page,
                limit,
                total: response.length,
                total_pages: Math.ceil(response.length / limit)
              }
            };
          } else {
            paginatedResponse = response as PaginatedResponse<EscrowTransaction>;
          }
          
          // Cache the response (5 minutes TTL)
          this.cacheService.set(cacheKey, paginatedResponse, 5 * 60 * 1000);
          observer.next(paginatedResponse);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });

    return source$;
  }

  // Keep backward compatibility
  getTransactionsArray(params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Observable<EscrowTransaction[]> {
    return new Observable(observer => {
      this.getTransactions(params).subscribe({
        next: (response) => {
          observer.next(response.items);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getTransaction(transactionId: number, useCache: boolean = true): Observable<EscrowTransaction> {
    const cacheKey = `transaction_${transactionId}`;
    
    if (useCache) {
      const cached = this.cacheService.get<EscrowTransaction>(cacheKey);
      if (cached) {
        return new Observable(observer => {
          observer.next(cached);
          observer.complete();
        });
      }
    }

    const source$ = this.http.get<EscrowTransaction>(
      `${this.apiUrl}/transactions/${transactionId}`,
      {
        headers: this.authService.getAuthHeaders()
      }
    );

    if (useCache) {
      return source$.pipe(
        tap(transaction => {
          this.cacheService.set(cacheKey, transaction, 5 * 60 * 1000);
          // Invalidate transactions list cache
          this.cacheService.invalidatePattern('transactions_');
        })
      );
    }

    return source$;
  }

  createTransaction(transactionData: EscrowTransactionCreate): Observable<EscrowTransaction> {
    return this.http.post<EscrowTransaction>(`${this.apiUrl}/transactions`, transactionData, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Invalidate transactions cache
        this.cacheService.invalidatePattern('transactions_');
      })
    );
  }

  acceptTransaction(transactionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${transactionId}/accept`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  processPayment(transactionId: number, paymentInfo: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${transactionId}/pay`, paymentInfo, {
      headers: this.authService.getAuthHeaders()
    });
  }

  markShipped(transactionId: number, shippingEvidence: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${transactionId}/ship`, shippingEvidence, {
      headers: this.authService.getAuthHeaders()
    });
  }

  markDelivered(transactionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${transactionId}/deliver`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  approveTransaction(transactionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${transactionId}/approve`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createDispute(transactionId: number, disputeData: { reason: string; description: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/${transactionId}/dispute`, disputeData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getStats(): Observable<TransactionStats> {
    return this.http.get<TransactionStats>(`${this.apiUrl}/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Helper methods to calculate stats from transactions
  calculateBuyerStats(transactions: EscrowTransaction[]): BuyerStats {
    const buyerTransactions = transactions.filter(t => t.status !== 'cancelled');
    const enProceso = buyerTransactions.filter(t => 
      ['pending_payment', 'payment_received', 'item_shipped', 'inspection_period'].includes(t.status)
    ).length;
    const completadas = buyerTransactions.filter(t => 
      ['buyer_approved', 'funds_released', 'completed'].includes(t.status)
    ).length;
    const pendientes = buyerTransactions.filter(t => 
      ['pending_agreement'].includes(t.status)
    ).length;
    const enDisputa = buyerTransactions.filter(t => 
      ['disputed'].includes(t.status)
    ).length;
    const gastado = buyerTransactions
      .filter(t => ['buyer_approved', 'funds_released', 'completed'].includes(t.status))
      .reduce((sum, t) => sum + t.total_amount, 0);

    return {
      enProceso,
      completadas,
      pendientes,
      enDisputa,
      gastado,
      rating: 4.8 // TODO: Get from backend
    };
  }

  calculateSellerStats(transactions: EscrowTransaction[]): SellerStats {
    const sellerTransactions = transactions.filter(t => t.status !== 'cancelled');
    const enProceso = sellerTransactions.filter(t => 
      ['pending_payment', 'payment_received', 'item_shipped', 'inspection_period'].includes(t.status)
    ).length;
    const completadas = sellerTransactions.filter(t => 
      ['buyer_approved', 'funds_released', 'completed'].includes(t.status)
    ).length;
    const pendientes = sellerTransactions.filter(t => 
      ['pending_agreement'].includes(t.status)
    ).length;
    const enDisputa = sellerTransactions.filter(t => 
      ['disputed'].includes(t.status)
    ).length;
    const vendido = sellerTransactions
      .filter(t => ['buyer_approved', 'funds_released', 'completed'].includes(t.status))
      .reduce((sum, t) => sum + t.price, 0);

    return {
      enProceso,
      completadas,
      pendientes,
      enDisputa,
      vendido,
      rating: 4.6 // TODO: Get from backend
    };
  }
}

