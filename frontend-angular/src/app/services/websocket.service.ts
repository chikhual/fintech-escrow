import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private wsUrl = (environment as any).notificationApiUrl || 
    (environment.apiUrl.includes('localhost') 
      ? environment.apiUrl.replace(':8000', ':8004')
      : `${environment.apiUrl}/notifications`);
  
  private wsUrlWithProtocol = this.wsUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private heartbeatInterval: any = null;
  private isConnecting = false;
  
  private messageSubject = new Subject<WebSocketMessage>();
  public messages$ = this.messageSubject.asObservable();
  
  private connectionStatus = new BehaviorSubject<'connected' | 'disconnected' | 'connecting'>('disconnected');
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {}

  connect(userId: number, token: string): void {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.connectionStatus.next('connecting');
    this.reconnectAttempts = 0;

    try {
      // WebSocket URL with token as query parameter or header
      const wsUrl = `${this.wsUrlWithProtocol}/ws/${userId}?token=${encodeURIComponent(token)}`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.connectionStatus.next('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Ignore heartbeat echo
          if (message.type === 'heartbeat' || message.startsWith('Echo:')) {
            return;
          }
          
          this.messageSubject.next({
            type: message.type || 'notification',
            data: message.data || message,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // If not JSON, treat as plain text notification
          if (event.data && !event.data.startsWith('Echo:')) {
            this.messageSubject.next({
              type: 'notification',
              data: { message: event.data },
              timestamp: new Date().toISOString()
            });
          }
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.connectionStatus.next('disconnected');
        
        // Notify subscribers about connection error
        this.messageSubject.next({
          type: 'connection_error',
          data: { 
            message: 'Error de conexión con el servidor. Reintentando...',
            reconnect: true,
            timestamp: new Date().toISOString()
          }
        });
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket closed', event.code, event.reason);
        this.isConnecting = false;
        this.connectionStatus.next('disconnected');
        this.stopHeartbeat();
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect(userId, token);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.connectionStatus.next('disconnected');
    }
  }

  private attemptReconnect(userId: number, token: string): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(userId, token);
      }
    }, this.reconnectInterval);
  }

  private startHeartbeat(): void {
    // Send heartbeat every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    this.connectionStatus.next('disconnected');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

