import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

type ActiveSection = 'dashboard' | 'datos-personales' | 'datos-empresa' | 'datos-bancarios' | 'compras' | 'ventas' | 'disputas';
type ActiveRole = 'comprador' | 'vendedor' | 'completo';

@Component({
  selector: 'app-user-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar Navigation -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <!-- Logo/Header -->
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-xl font-bold text-gray-900">CONSUFIN</h1>
          <p class="text-xs text-gray-500 mt-1">Portal de Usuario</p>
        </div>

        <!-- Navigation Items -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-2">
          <button 
            (click)="activeSection = 'dashboard'"
            [ngClass]="activeSection === 'dashboard' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="font-medium">Dashboard</span>
          </button>

          <button 
            (click)="activeSection = 'datos-personales'"
            [ngClass]="activeSection === 'datos-personales' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium">Datos Personales</span>
          </button>

          <button 
            (click)="activeSection = 'datos-empresa'"
            [ngClass]="activeSection === 'datos-empresa' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="font-medium">Datos de la Empresa</span>
          </button>

          <button 
            (click)="activeSection = 'datos-bancarios'"
            [ngClass]="activeSection === 'datos-bancarios' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">Datos Bancarios</span>
          </button>

          <button 
            (click)="activeSection = 'compras'"
            [ngClass]="activeSection === 'compras' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span class="font-medium">Compras</span>
          </button>

          <button 
            (click)="activeSection = 'ventas'"
            [ngClass]="activeSection === 'ventas' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="font-medium">Ventas</span>
          </button>

          <button 
            (click)="activeSection = 'disputas'"
            [ngClass]="activeSection === 'disputas' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="font-medium">Disputas</span>
          </button>
        </nav>

        <!-- User Profile Footer -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span class="text-indigo-600 font-semibold text-sm">{{ userInitials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
              <p class="text-xs text-gray-500">Usuario</p>
            </div>
          </div>
          <button (click)="logout()" class="mt-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 ml-64">
        <div class="p-6">
          <!-- DASHBOARD SECTION -->
          <div *ngIf="activeSection === 'dashboard'" class="max-w-7xl mx-auto">
            <!-- Welcome Header -->
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, {{ userName }}
              </h1>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Verificado
                </span>
              </div>
            </div>

            <!-- Role Selector -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">🔄 Selector de Rol Activo</h2>
              <div class="flex flex-wrap gap-3">
                <button 
                  (click)="activeRole = 'comprador'"
                  [ngClass]="activeRole === 'comprador' 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="px-4 py-2 rounded-lg border-2 font-medium transition">
                  🛒 Modo Comprador
                </button>
                <button 
                  (click)="activeRole = 'vendedor'"
                  [ngClass]="activeRole === 'vendedor' 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="px-4 py-2 rounded-lg border-2 font-medium transition">
                  🏪 Modo Vendedor
                </button>
                <button 
                  (click)="activeRole = 'completo'"
                  [ngClass]="activeRole === 'completo' 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="px-4 py-2 rounded-lg border-2 font-medium transition">
                  📊 Vista Completa
                </button>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <!-- Como Comprador -->
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">🛒 Como Comprador</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">En Proceso:</span>
                    <span class="font-semibold text-gray-900">{{ buyerStats.enProceso }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Completadas:</span>
                    <span class="font-semibold text-gray-900">{{ buyerStats.completadas }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pendientes:</span>
                    <span class="font-semibold text-gray-900">{{ buyerStats.pendientes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">En Disputa:</span>
                    <span class="font-semibold text-gray-900">{{ buyerStats.enDisputa }}</span>
                  </div>
                  <div class="pt-3 border-t border-gray-200 mt-3">
                    <div class="flex justify-between mb-2">
                      <span class="text-gray-600">💰 Gastado:</span>
                      <span class="font-semibold text-gray-900">{{ buyerStats.gastado | currency:'MXN':'symbol':'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">⭐ Rating:</span>
                      <span class="font-semibold text-gray-900">{{ buyerStats.rating }}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Como Vendedor -->
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">🏪 Como Vendedor</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">En Proceso:</span>
                    <span class="font-semibold text-gray-900">{{ sellerStats.enProceso }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Completadas:</span>
                    <span class="font-semibold text-gray-900">{{ sellerStats.completadas }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pendientes:</span>
                    <span class="font-semibold text-gray-900">{{ sellerStats.pendientes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">En Disputa:</span>
                    <span class="font-semibold text-gray-900">{{ sellerStats.enDisputa }}</span>
                  </div>
                  <div class="pt-3 border-t border-gray-200 mt-3">
                    <div class="flex justify-between mb-2">
                      <span class="text-gray-600">💰 Vendido:</span>
                      <span class="font-semibold text-gray-900">{{ sellerStats.vendido | currency:'MXN':'symbol':'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">⭐ Rating:</span>
                      <span class="font-semibold text-gray-900">{{ sellerStats.rating }}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Notifications -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">🔔 Notificaciones Recientes</h3>
              <div class="space-y-3">
                <div *ngFor="let notif of recentNotifications" class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span class="text-xl">{{ notif.icon }}</span>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{{ notif.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notif.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DATOS PERSONALES SECTION -->
          <div *ngIf="activeSection === 'datos-personales'" class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Datos Personales</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <p class="text-gray-600">Contenido de Datos Personales en desarrollo...</p>
            </div>
          </div>

          <!-- DATOS EMPRESA SECTION -->
          <div *ngIf="activeSection === 'datos-empresa'" class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Datos de la Empresa</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <p class="text-gray-600">Contenido de Datos de la Empresa en desarrollo...</p>
            </div>
          </div>

          <!-- DATOS BANCARIOS SECTION -->
          <div *ngIf="activeSection === 'datos-bancarios'" class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Datos Bancarios</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <p class="text-gray-600">Contenido de Datos Bancarios en desarrollo...</p>
            </div>
          </div>

          <!-- COMPRAS SECTION -->
          <div *ngIf="activeSection === 'compras'" class="max-w-7xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Compras</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <p class="text-gray-600">Historial de compras en desarrollo...</p>
            </div>
          </div>

          <!-- VENTAS SECTION -->
          <div *ngIf="activeSection === 'ventas'" class="max-w-7xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Ventas</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <p class="text-gray-600">Historial de ventas en desarrollo...</p>
            </div>
          </div>

          <!-- DISPUTAS SECTION -->
          <div *ngIf="activeSection === 'disputas'" class="max-w-7xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Disputas</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <p class="text-gray-600">Gestión de disputas en desarrollo...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class UserPortalComponent implements OnInit {
  activeSection: ActiveSection = 'dashboard';
  activeRole: ActiveRole = 'completo';
  
  userName = 'Usuario';
  userInitials = 'U';

  buyerStats = {
    enProceso: 2,
    completadas: 15,
    pendientes: 1,
    enDisputa: 0,
    gastado: 45000,
    rating: 4.8
  };

  sellerStats = {
    enProceso: 3,
    completadas: 8,
    pendientes: 2,
    enDisputa: 1,
    vendido: 32000,
    rating: 4.6
  };

  recentNotifications = [
    { icon: '🛒', message: 'Nueva invitación para comprar [Producto]', time: 'Hace 2 horas' },
    { icon: '🏪', message: 'Comprador aceptó tu producto [Producto X]', time: 'Hace 5 horas' },
    { icon: '⏰', message: 'Período de inspección por vencer (2 días)', time: 'Hace 1 día' },
    { icon: '💳', message: 'Pago recibido por venta de [Producto Y]', time: 'Hace 2 días' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/consufin/registro']);
      return;
    }

    // Get user info
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userName = `${user.first_name} ${user.last_name}`.trim() || 'Usuario';
      this.userInitials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || 'U';
    }
  }

  logout() {
    this.authService.logout();
  }
}

