import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type ActiveRole = 'comprador' | 'vendedor' | 'completo';
type ActiveSection = 'dashboard' | 'transacciones' | 'ventas' | 'compras' | 'notificaciones' | 'perfil' | 'documentos' | 'configuracion';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  verified: boolean;
  photo: string;
  bio: string;
}

interface BuyerStats {
  in_process: number;
  completed: number;
  pending: number;
  in_dispute: number;
  total_spent: number;
  rating: number;
}

interface SellerStats {
  in_process: number;
  completed: number;
  pending: number;
  in_dispute: number;
  total_sold: number;
  rating: number;
}

interface Notification {
  id: number;
  type: 'buy' | 'sell' | 'system' | 'urgent';
  icon: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  transaction_id?: string;
}

interface Transaction {
  id: string;
  role: 'buyer' | 'seller';
  status: string;
  status_label: string;
  product_name: string;
  other_party: string;
  amount: number;
  date: string;
  time_remaining?: string;
  actions: string[];
}

@Component({
  selector: 'app-user-dual-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <h1 class="text-2xl font-bold text-gray-900">🏠 FINTECH ESCROW</h1>
              <span class="text-sm text-gray-500">Dashboard</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  {{ userProfile.name.charAt(0) }}
                </div>
                <div class="text-sm">
                  <div class="font-semibold text-gray-900">{{ userProfile.name }}</div>
                  <div class="text-gray-500 text-xs">
                    <span *ngIf="userProfile.verified">✅ Verificado</span>
                    <span *ngIf="!userProfile.verified">⏳ Pendiente</span>
                  </div>
                </div>
              </div>
              <button (click)="logout()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-6">
        <!-- Role Selector -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔄</span>
            <span>SELECTOR DE ROL ACTIVO</span>
          </h2>
          <div class="flex gap-4">
            <button
              (click)="activeRole = 'comprador'"
              [ngClass]="activeRole === 'comprador' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="flex-1 px-6 py-4 rounded-lg border-2 font-semibold transition">
              🛒 Modo Comprador
            </button>
            <button
              (click)="activeRole = 'vendedor'"
              [ngClass]="activeRole === 'vendedor' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="flex-1 px-6 py-4 rounded-lg border-2 font-semibold transition">
              🏪 Modo Vendedor
            </button>
            <button
              (click)="activeRole = 'completo'"
              [ngClass]="activeRole === 'completo' 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="flex-1 px-6 py-4 rounded-lg border-2 font-semibold transition">
              📊 Vista Completa
            </button>
          </div>
        </div>

        <!-- Dashboard Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Como Comprador -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛒</span>
              <span>COMO COMPRADOR</span>
            </h3>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">En Proceso:</span>
                <span class="font-semibold text-blue-600">{{ buyerStats.in_process }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Completadas:</span>
                <span class="font-semibold text-green-600">{{ buyerStats.completed }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Pendientes:</span>
                <span class="font-semibold text-yellow-600">{{ buyerStats.pending }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">En Disputa:</span>
                <span class="font-semibold text-red-600">{{ buyerStats.in_dispute }}</span>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">💰 Gastado:</span>
                <span class="font-bold text-gray-900">{{ buyerStats.total_spent | currency:'MXN':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">⭐ Rating:</span>
                <span class="font-bold text-gray-900">
                  <span class="flex items-center">
                    <span *ngFor="let star of getStars(buyerStats.rating)" class="text-yellow-400">⭐</span>
                    <span class="ml-1">{{ buyerStats.rating }}/5</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Como Vendedor -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏪</span>
              <span>COMO VENDEDOR</span>
            </h3>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">En Proceso:</span>
                <span class="font-semibold text-blue-600">{{ sellerStats.in_process }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Completadas:</span>
                <span class="font-semibold text-green-600">{{ sellerStats.completed }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Pendientes:</span>
                <span class="font-semibold text-yellow-600">{{ sellerStats.pending }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">En Disputa:</span>
                <span class="font-semibold text-red-600">{{ sellerStats.in_dispute }}</span>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">💰 Vendido:</span>
                <span class="font-bold text-gray-900">{{ sellerStats.total_sold | currency:'MXN':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">⭐ Rating:</span>
                <span class="font-bold text-gray-900">
                  <span class="flex items-center">
                    <span *ngFor="let star of getStars(sellerStats.rating)" class="text-yellow-400">⭐</span>
                    <span class="ml-1">{{ sellerStats.rating }}/5</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="border-b border-gray-200">
            <nav class="flex overflow-x-auto">
              <button
                *ngFor="let section of sections"
                (click)="setActiveSection(section.id)"
                [ngClass]="activeSection === section.id 
                  ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold bg-indigo-50' 
                  : 'text-gray-600 hover:bg-gray-50'"
                class="px-6 py-4 text-sm transition whitespace-nowrap">
                {{ section.icon }} {{ section.label }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Section Content -->
        
        <!-- Dashboard -->
        <div *ngIf="activeSection === 'dashboard'" class="space-y-6">
          <!-- Notificaciones Recientes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔔</span>
              <span>NOTIFICACIONES RECIENTES</span>
            </h3>
            <div class="space-y-3">
              <div 
                *ngFor="let notification of recentNotifications"
                [ngClass]="{'bg-blue-50': !notification.unread}"
                class="p-4 rounded-lg border border-gray-200 flex items-start gap-3">
                <span class="text-xl">{{ notification.icon }}</span>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <p class="text-sm text-gray-600">{{ notification.message }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
                </div>
                <button 
                  *ngIf="notification.transaction_id"
                  class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Ver
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Transacciones -->
        <div *ngIf="activeSection === 'transacciones'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>📦</span>
                <span>MIS TRANSACCIONES</span>
              </h3>
              <div class="flex gap-2">
                <select [(ngModel)]="transactionFilter" class="border rounded-lg px-3 py-2 text-sm">
                  <option value="all">Todas</option>
                  <option value="buyer">Como Comprador</option>
                  <option value="seller">Como Vendedor</option>
                  <option value="active">Activas</option>
                  <option value="completed">Completadas</option>
                </select>
              </div>
            </div>
            <div class="space-y-4">
              <div 
                *ngFor="let transaction of filteredTransactions"
                class="border rounded-lg p-4 hover:bg-gray-50">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-semibold text-gray-900">#{{ transaction.id }}</span>
                      <span [ngClass]="{
                        'bg-blue-100 text-blue-800': transaction.role === 'buyer',
                        'bg-green-100 text-green-800': transaction.role === 'seller'
                      }" class="px-2 py-1 rounded text-xs font-semibold">
                        {{ transaction.role === 'buyer' ? '🛒 COMPRADOR' : '🏪 VENDEDOR' }}
                      </span>
                      <span [ngClass]="getStatusClass(transaction.status)" 
                        class="px-2 py-1 rounded text-xs font-semibold">
                        {{ transaction.status_label }}
                      </span>
                    </div>
                    <p class="text-sm font-medium text-gray-900">{{ transaction.product_name }}</p>
                    <p class="text-xs text-gray-600">
                      {{ transaction.role === 'buyer' ? 'Vendedor' : 'Comprador' }}: {{ transaction.other_party }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-gray-900">{{ transaction.amount | currency:'MXN':'symbol':'1.0-0' }}</p>
                    <p class="text-xs text-gray-500">{{ transaction.date }}</p>
                    <p *ngIf="transaction.time_remaining" class="text-xs text-orange-600 mt-1">
                      Queda: {{ transaction.time_remaining }}
                    </p>
                  </div>
                </div>
                <div class="flex gap-2 mt-3">
                  <button 
                    *ngFor="let action of transaction.actions"
                    class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    {{ action }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ventas -->
        <div *ngIf="activeSection === 'ventas'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>🏪</span>
                <span>MIS VENTAS</span>
              </h3>
              <button class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                🆕 Crear Nueva Venta
              </button>
            </div>
            <p class="text-gray-600">Gestión completa de tus ventas activas y productos publicados.</p>
          </div>
        </div>

        <!-- Compras -->
        <div *ngIf="activeSection === 'compras'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛒</span>
              <span>BUSCAR PRODUCTOS</span>
            </h3>
            <div class="mb-4">
              <div class="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar productos..."
                  class="flex-1 border rounded-lg px-4 py-2">
                <button class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                  🔍 Buscar
                </button>
              </div>
              <div class="flex gap-2 mt-3">
                <select class="border rounded-lg px-3 py-2 text-sm">
                  <option>Categoría</option>
                </select>
                <select class="border rounded-lg px-3 py-2 text-sm">
                  <option>Precio</option>
                </select>
                <select class="border rounded-lg px-3 py-2 text-sm">
                  <option>Ubicación</option>
                </select>
                <label class="flex items-center gap-2 px-3 py-2 text-sm">
                  <input type="checkbox"> Solo con ESCROW
                </label>
              </div>
            </div>
            <p class="text-gray-600">Resultados de búsqueda de productos disponibles para compra.</p>
          </div>
        </div>

        <!-- Notificaciones -->
        <div *ngIf="activeSection === 'notificaciones'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>🔔</span>
                <span>NOTIFICACIONES</span>
              </h3>
              <div class="flex gap-2">
                <button 
                  *ngFor="let filter of notificationFilters"
                  (click)="notificationFilter = filter.id"
                  [ngClass]="notificationFilter === filter.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700'"
                  class="px-3 py-1 rounded text-sm">
                  {{ filter.label }}
                </button>
              </div>
            </div>
            <div class="space-y-3">
              <div 
                *ngFor="let notification of filteredNotifications"
                [ngClass]="{'bg-blue-50': !notification.unread}"
                class="p-4 rounded-lg border border-gray-200">
                <div class="flex items-start gap-3">
                  <span class="text-xl">{{ notification.icon }}</span>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ notification.title }}</p>
                    <p class="text-sm text-gray-600">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
                  </div>
                  <button *ngIf="notification.transaction_id" class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    Ver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Perfil -->
        <div *ngIf="activeSection === 'perfil'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span>
              <span>MI PERFIL</span>
            </h3>
            <p class="text-gray-600">Perfil público unificado con reputación dual como comprador y vendedor.</p>
          </div>
        </div>

        <!-- Documentos -->
        <div *ngIf="activeSection === 'documentos'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📁</span>
              <span>CENTRO DE DOCUMENTOS</span>
            </h3>
            <p class="text-gray-600">Gestión documental expandida para identidad, financieros y comerciales.</p>
          </div>
        </div>

        <!-- Configuración -->
        <div *ngIf="activeSection === 'configuracion'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚙️</span>
              <span>CONFIGURACIÓN DE CUENTA</span>
            </h3>
            <p class="text-gray-600">Panel de configuración unificado para perfil, seguridad, pagos y notificaciones.</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class UserDualPortalComponent implements OnInit {
  activeRole: ActiveRole = 'completo';
  activeSection: ActiveSection = 'dashboard';
  transactionFilter = 'all';
  notificationFilter = 'all';

  userProfile: UserProfile = {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+52 55 1234-5678',
    location: 'Ciudad de México',
    verified: true,
    photo: '',
    bio: ''
  };

  buyerStats: BuyerStats = {
    in_process: 2,
    completed: 15,
    pending: 1,
    in_dispute: 0,
    total_spent: 45000,
    rating: 4.8
  };

  sellerStats: SellerStats = {
    in_process: 3,
    completed: 8,
    pending: 2,
    in_dispute: 1,
    total_sold: 32000,
    rating: 4.6
  };

  transactions: Transaction[] = [
    {
      id: 'T001234',
      role: 'buyer',
      status: 'inspection',
      status_label: '⏳ En Inspección',
      product_name: 'MacBook Pro M3',
      other_party: 'TechStore MX',
      amount: 45000,
      date: '15/10/2025',
      time_remaining: '2d 14h',
      actions: ['Ver Detalles', 'Contactar Vendedor', 'Inspeccionar']
    },
    {
      id: 'T001235',
      role: 'seller',
      status: 'awaiting_payment',
      status_label: '💰 Esperando Pago',
      product_name: 'iPhone 15 Pro',
      other_party: 'Juan P.',
      amount: 28000,
      date: '14/10/2025',
      time_remaining: '1d 8h',
      actions: ['Ver Detalles', 'Contactar Comprador', 'Recordar Pago']
    }
  ];

  recentNotifications: Notification[] = [
    {
      id: 1,
      type: 'buy',
      icon: '🛒',
      title: 'Nueva invitación para comprar',
      message: '[Producto]',
      time: 'Hace 2 horas',
      unread: true
    },
    {
      id: 2,
      type: 'sell',
      icon: '🏪',
      title: 'Comprador aceptó tu producto',
      message: '[Producto X]',
      time: 'Hace 5 horas',
      unread: false
    },
    {
      id: 3,
      type: 'system',
      icon: '⏰',
      title: 'Período de inspección por vencer',
      message: '2 días',
      time: 'Hace 1 día',
      unread: false
    },
    {
      id: 4,
      type: 'sell',
      icon: '💳',
      title: 'Pago recibido por venta',
      message: '[Producto Y]',
      time: 'Hace 1 día',
      unread: false
    }
  ];

  allNotifications: Notification[] = [...this.recentNotifications];

  sections: Array<{ id: ActiveSection; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'transacciones', label: 'Transacciones', icon: '📦' },
    { id: 'ventas', label: 'Ventas', icon: '🏪' },
    { id: 'compras', label: 'Compras', icon: '🛒' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
    { id: 'perfil', label: 'Perfil', icon: '👤' },
    { id: 'documentos', label: 'Documentos', icon: '📁' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' }
  ];

  setActiveSection(id: string) {
    this.activeSection = id as ActiveSection;
  }

  notificationFilters = [
    { id: 'all', label: 'Todas' },
    { id: 'buy', label: 'Compras' },
    { id: 'sell', label: 'Ventas' },
    { id: 'urgent', label: 'Urgentes' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('👤 User Dual Portal: Inicializando...');
    // Configurar datos mock para acceso directo
    this.loadMockData();
  }

  private loadMockData() {
    // Datos mock para desarrollo
    console.log('✅ User Dual Portal: Datos mock cargados');
  }

  get filteredTransactions(): Transaction[] {
    if (this.transactionFilter === 'all') {
      return this.transactions;
    }
    if (this.transactionFilter === 'buyer') {
      return this.transactions.filter(t => t.role === 'buyer');
    }
    if (this.transactionFilter === 'seller') {
      return this.transactions.filter(t => t.role === 'seller');
    }
    return this.transactions;
  }

  get filteredNotifications(): Notification[] {
    if (this.notificationFilter === 'all') {
      return this.allNotifications;
    }
    return this.allNotifications.filter(n => n.type === this.notificationFilter);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'inspection': 'bg-yellow-100 text-yellow-800',
      'awaiting_payment': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'dispute': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  logout() {
    console.log('Logout del usuario');
    localStorage.clear();
    this.router.navigate(['/']);
  }
}

