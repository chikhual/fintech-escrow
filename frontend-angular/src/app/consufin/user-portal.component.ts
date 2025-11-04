import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { TransactionService, EscrowTransaction } from '../services/transaction.service';
import { NotificationService, Notification } from '../services/notification.service';
import { WebSocketService } from '../services/websocket.service';
import { catchError, of, Subject, takeUntil } from 'rxjs';

type ActiveSection = 'dashboard' | 'perfil' | 'transacciones' | 'crear-venta' | 'productos' | 'notificaciones' | 'configuracion';
type ActiveSubSection = 'persona' | 'empresa' | 'bancaria' | 'ventas' | 'compras' | 'disputas' | 'buscar' | 'publicar' | 'general' | 'notif' | 'trans';
type ActiveRole = 'comprador' | 'vendedor' | 'completo';

@Component({
  selector: 'app-user-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar Navigation -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <!-- Logo/Header -->
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-xl font-bold text-gray-900">🏠 FINTECH ESCROW</h1>
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
            (click)="activeSection = 'perfil'; activeSubSection = 'persona'"
            [ngClass]="activeSection === 'perfil' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium">Perfil</span>
          </button>

          <button 
            (click)="activeSection = 'transacciones'; activeSubSection = 'compras'"
            [ngClass]="activeSection === 'transacciones' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="font-medium">Mis Transacciones</span>
          </button>

          <button 
            (click)="activeSection = 'crear-venta'"
            [ngClass]="activeSection === 'crear-venta' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="font-medium">Crear Nueva Venta</span>
          </button>

          <button 
            (click)="activeSection = 'productos'; activeSubSection = 'buscar'"
            [ngClass]="activeSection === 'productos' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="font-medium">Productos</span>
          </button>

          <button 
            (click)="activeSection = 'notificaciones'"
            [ngClass]="activeSection === 'notificaciones' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="font-medium">Notificaciones</span>
            <span *ngIf="unreadCount > 0" class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{{ unreadCount }}</span>
          </button>

          <button 
            (click)="activeSection = 'configuracion'; activeSubSection = 'general'"
            [ngClass]="activeSection === 'configuracion' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Configuración</span>
          </button>
        </nav>

        <!-- User Profile Footer -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span class="text-indigo-600 font-semibold text-sm">{{ userInitials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
              <p class="text-xs text-gray-500 flex items-center gap-1">
                <span>✅ Verificado</span>
              </p>
            </div>
          </div>
          <button (click)="logout()" class="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
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
                <button *ngIf="loading" (click)="loadTransactions()" class="text-xs text-indigo-600 hover:text-indigo-800">
                  🔄 Actualizar
                </button>
              </div>
              <div *ngIf="errorMessage" class="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {{ errorMessage }}
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
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">🔔 Notificaciones Recientes</h3>
                <button (click)="activeSection = 'notificaciones'" class="text-sm text-indigo-600 hover:text-indigo-800">
                  Ver todas
                </button>
              </div>
              <div class="space-y-3">
                <div *ngIf="loading && recentNotifications.length === 0" class="text-center py-4 text-gray-500">
                  Cargando notificaciones...
                </div>
                <div *ngIf="!loading && recentNotifications.length === 0" class="text-center py-4 text-gray-500">
                  No hay notificaciones recientes
                </div>
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

          <!-- PERFIL SECTION -->
          <div *ngIf="activeSection === 'perfil'" class="max-w-7xl mx-auto">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-4">Perfil</h1>
              <div class="flex gap-2 border-b">
                <button 
                  (click)="activeSubSection = 'persona'"
                  [ngClass]="activeSubSection === 'persona' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  1) Registro Persona
                </button>
                <button 
                  (click)="activeSubSection = 'empresa'"
                  [ngClass]="activeSubSection === 'empresa' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  2) Registro Empresa
                </button>
                <button 
                  (click)="activeSubSection = 'bancaria'"
                  [ngClass]="activeSubSection === 'bancaria' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  3) Datos Bancarios
                </button>
            </div>
          </div>

            <!-- Registro Persona -->
            <div *ngIf="activeSubSection === 'persona'" class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Datos Personales</h2>
              <form class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" [(ngModel)]="profileData.firstName" name="firstName" 
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input type="text" [(ngModel)]="profileData.lastName" name="lastName"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">CURP</label>
                    <input type="text" [(ngModel)]="profileData.curp" name="curp"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                    <input type="text" [(ngModel)]="profileData.rfc" name="rfc"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                    <input type="date" [(ngModel)]="profileData.birthDate" name="birthDate"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="tel" [(ngModel)]="profileData.phone" name="phone"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <textarea [(ngModel)]="profileData.address" name="address" rows="3"
                    class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
                <button type="button" (click)="saveProfile()" [disabled]="loading"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span *ngIf="!loading">Guardar Cambios</span>
                  <span *ngIf="loading">Guardando...</span>
                </button>
                <div *ngIf="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</div>
              </form>
          </div>

            <!-- Registro Empresa -->
            <div *ngIf="activeSubSection === 'empresa'" class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Datos de la Empresa</h2>
              <form class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                    <input type="text" [(ngModel)]="companyData.businessName" name="businessName"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">RFC Empresarial</label>
                    <input type="text" [(ngModel)]="companyData.businessRfc" name="businessRfc"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Empresa</label>
                    <select [(ngModel)]="companyData.businessType" name="businessType"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Seleccionar...</option>
                      <option value="sa">S.A.</option>
                      <option value="sapi">S.A.P.I.</option>
                      <option value="srl">S. de R.L.</option>
                      <option value="sc">S.C.</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Años de Experiencia</label>
                    <input type="number" [(ngModel)]="companyData.yearsExperience" name="yearsExperience"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                </div>
                <button type="button" (click)="saveCompany()" [disabled]="loading"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span *ngIf="!loading">Guardar Cambios</span>
                  <span *ngIf="loading">Guardando...</span>
                </button>
                <div *ngIf="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</div>
              </form>
          </div>

            <!-- Datos Bancarios -->
            <div *ngIf="activeSubSection === 'bancaria'" class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Datos Bancarios</h2>
              <form class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                    <select [(ngModel)]="bankData.bank" name="bank"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Seleccionar banco...</option>
                      <option value="bbva">BBVA</option>
                      <option value="banamex">Citibanamex</option>
                      <option value="hsbc">HSBC</option>
                      <option value="santander">Santander</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">CLABE</label>
                    <input type="text" [(ngModel)]="bankData.clabe" name="clabe" maxlength="18"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta</label>
                    <input type="text" [(ngModel)]="bankData.accountNumber" name="accountNumber"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Titular de la Cuenta</label>
                    <input type="text" [(ngModel)]="bankData.accountHolder" name="accountHolder"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                </div>
                <button type="button" (click)="saveBank()" [disabled]="loading"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span *ngIf="!loading">Guardar Cambios</span>
                  <span *ngIf="loading">Guardando...</span>
                </button>
                <div *ngIf="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</div>
              </form>
            </div>
          </div>

          <!-- MIS TRANSACCIONES SECTION -->
          <div *ngIf="activeSection === 'transacciones'" class="max-w-7xl mx-auto">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-4">Mis Transacciones</h1>
              <div class="flex gap-2 border-b">
                <button 
                  (click)="activeSubSection = 'ventas'"
                  [ngClass]="activeSubSection === 'ventas' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  1) Ventas
                </button>
                <button 
                  (click)="activeSubSection = 'compras'"
                  [ngClass]="activeSubSection === 'compras' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  2) Compras
                </button>
                <button 
                  (click)="activeSubSection = 'disputas'"
                  [ngClass]="activeSubSection === 'disputas' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  3) Disputas
                </button>
              </div>
            </div>

            <!-- Ventas -->
            <div *ngIf="activeSubSection === 'ventas'" class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Mis Ventas</h2>
                <div class="flex gap-2">
                  <select class="border rounded-lg px-3 py-2 text-sm">
                    <option>Todas</option>
                    <option>En Proceso</option>
                    <option>Completadas</option>
                    <option>Pendientes</option>
                  </select>
                  <button (click)="loadTransactions()" [disabled]="loading" class="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    🔄 Actualizar
                  </button>
                </div>
              </div>
              <div *ngIf="loading" class="text-center py-8 text-gray-500">Cargando transacciones...</div>
              <div *ngIf="!loading && salesTransactions.length === 0" class="text-center py-8 text-gray-500">
                No tienes ventas aún
              </div>
              <div class="space-y-4">
                <div *ngFor="let sale of salesTransactions" class="border rounded-lg p-4 hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-semibold text-gray-900">#{{ sale.id }}</span>
                        <span class="text-xs px-2 py-1 rounded" [ngClass]="{
                          'bg-yellow-100 text-yellow-800': sale.status === 'pendiente',
                          'bg-blue-100 text-blue-800': sale.status === 'en_proceso',
                          'bg-green-100 text-green-800': sale.status === 'completada'
                        }">{{ sale.status }}</span>
                      </div>
                      <p class="text-gray-900 font-medium">{{ sale.product }}</p>
                      <p class="text-sm text-gray-600">Comprador: {{ sale.buyer }}</p>
                      <p class="text-sm text-gray-600">Monto: {{ sale.amount | currency:'MXN':'symbol':'1.0-0' }}</p>
                      <p class="text-xs text-gray-500 mt-1">Fecha: {{ sale.date }}</p>
                    </div>
                    <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Pagination Controls -->
              <div *ngIf="transactionPagination.totalPages > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div class="text-sm text-gray-700">
                  Mostrando {{ ((transactionPagination.currentPage - 1) * transactionPagination.pageSize) + 1 }} - 
                  {{ Math.min(transactionPagination.currentPage * transactionPagination.pageSize, transactionPagination.total) }} 
                  de {{ transactionPagination.total }}
                </div>
                <div class="flex gap-2">
                  <button 
                    (click)="onTransactionPageChange(transactionPagination.currentPage - 1)"
                    [disabled]="transactionPagination.currentPage === 1"
                    [ngClass]="transactionPagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                    class="px-3 py-2 border rounded-lg text-sm">
                    ← Anterior
                  </button>
                  <div class="flex gap-1">
                    <button 
                      *ngFor="let page of getPageNumbers(transactionPagination.currentPage, transactionPagination.totalPages)"
                      (click)="onTransactionPageChange(page)"
                      [ngClass]="page === transactionPagination.currentPage 
                        ? 'bg-indigo-600 text-white' 
                        : 'border hover:bg-gray-50'"
                      class="px-3 py-2 rounded-lg text-sm">
                      {{ page }}
                    </button>
                  </div>
                  <button 
                    (click)="onTransactionPageChange(transactionPagination.currentPage + 1)"
                    [disabled]="transactionPagination.currentPage === transactionPagination.totalPages"
                    [ngClass]="transactionPagination.currentPage === transactionPagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                    class="px-3 py-2 border rounded-lg text-sm">
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>

            <!-- Compras -->
            <div *ngIf="activeSubSection === 'compras'" class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Mis Compras</h2>
                <div class="flex gap-2">
                  <select class="border rounded-lg px-3 py-2 text-sm">
                    <option>Todas</option>
                    <option>En Proceso</option>
                    <option>Completadas</option>
                    <option>Pendientes</option>
                  </select>
                  <button (click)="loadTransactions()" [disabled]="loading" class="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    🔄 Actualizar
                  </button>
                </div>
              </div>
              <div *ngIf="loading" class="text-center py-8 text-gray-500">Cargando transacciones...</div>
              <div *ngIf="!loading && purchaseTransactions.length === 0" class="text-center py-8 text-gray-500">
                No tienes compras aún
              </div>
              <div class="space-y-4">
                <div *ngFor="let purchase of purchaseTransactions" class="border rounded-lg p-4 hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-semibold text-gray-900">#{{ purchase.id }}</span>
                        <span class="text-xs px-2 py-1 rounded" [ngClass]="{
                          'bg-yellow-100 text-yellow-800': purchase.status === 'pendiente',
                          'bg-blue-100 text-blue-800': purchase.status === 'en_proceso',
                          'bg-green-100 text-green-800': purchase.status === 'completada'
                        }">{{ purchase.status }}</span>
                      </div>
                      <p class="text-gray-900 font-medium">{{ purchase.product }}</p>
                      <p class="text-sm text-gray-600">Vendedor: {{ purchase.seller }}</p>
                      <p class="text-sm text-gray-600">Monto: {{ purchase.amount | currency:'MXN':'symbol':'1.0-0' }}</p>
                      <p class="text-xs text-gray-500 mt-1">Fecha: {{ purchase.date }}</p>
                    </div>
                    <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Pagination Controls -->
              <div *ngIf="transactionPagination.totalPages > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div class="text-sm text-gray-700">
                  Mostrando {{ ((transactionPagination.currentPage - 1) * transactionPagination.pageSize) + 1 }} - 
                  {{ Math.min(transactionPagination.currentPage * transactionPagination.pageSize, transactionPagination.total) }} 
                  de {{ transactionPagination.total }}
                </div>
                <div class="flex gap-2">
                  <button 
                    (click)="onTransactionPageChange(transactionPagination.currentPage - 1)"
                    [disabled]="transactionPagination.currentPage === 1"
                    [ngClass]="transactionPagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                    class="px-3 py-2 border rounded-lg text-sm">
                    ← Anterior
                  </button>
                  <div class="flex gap-1">
                    <button 
                      *ngFor="let page of getPageNumbers(transactionPagination.currentPage, transactionPagination.totalPages)"
                      (click)="onTransactionPageChange(page)"
                      [ngClass]="page === transactionPagination.currentPage 
                        ? 'bg-indigo-600 text-white' 
                        : 'border hover:bg-gray-50'"
                      class="px-3 py-2 rounded-lg text-sm">
                      {{ page }}
                    </button>
                  </div>
                  <button 
                    (click)="onTransactionPageChange(transactionPagination.currentPage + 1)"
                    [disabled]="transactionPagination.currentPage === transactionPagination.totalPages"
                    [ngClass]="transactionPagination.currentPage === transactionPagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                    class="px-3 py-2 border rounded-lg text-sm">
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>

            <!-- Disputas -->
            <div *ngIf="activeSubSection === 'disputas'" class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Disputas</h2>
                <button (click)="loadTransactions()" [disabled]="loading" class="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  🔄 Actualizar
                </button>
              </div>
              <div *ngIf="loading" class="text-center py-8 text-gray-500">Cargando disputas...</div>
              <div *ngIf="!loading && disputeTransactions.length === 0" class="text-center py-8 text-gray-500">
                No tienes disputas activas
              </div>
              <div class="space-y-4">
                <div *ngFor="let dispute of disputeTransactions" class="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-semibold text-gray-900">#{{ dispute.id }}</span>
                        <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-800">En Disputa</span>
                      </div>
                      <p class="text-gray-900 font-medium">{{ dispute.product }}</p>
                      <p class="text-sm text-gray-600">Razón: {{ dispute.reason }}</p>
                      <p class="text-xs text-gray-500 mt-1">Fecha: {{ dispute.date }}</p>
                    </div>
                    <button class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CREAR NUEVA VENTA SECTION -->
          <div *ngIf="activeSection === 'crear-venta'" class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Crear Nueva Venta</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <form class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Título del Producto</label>
                  <input type="text" [(ngModel)]="newSale.title" name="title"
                    class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: iPhone 15 Pro 256GB">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select [(ngModel)]="newSale.category" name="category"
                    class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Seleccionar categoría...</option>
                    <option value="electronica">Electrónica</option>
                    <option value="vehiculos">Vehículos</option>
                    <option value="inmuebles">Inmuebles</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Precio (MXN)</label>
                  <input type="number" [(ngModel)]="newSale.price" name="price"
                    class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea [(ngModel)]="newSale.description" name="description" rows="4"
                    class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe tu producto..."></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Imágenes (Mínimo 3, Máximo 10)</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p class="text-gray-600">Arrastra imágenes aquí o haz clic para seleccionar</p>
                    <input type="file" multiple accept="image/*" class="hidden" id="fileInput">
                  </div>
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Período de Inspección (días)</label>
                    <input type="number" [(ngModel)]="newSale.inspectionDays" name="inspectionDays" min="1" max="30"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fee ESCROW pagado por</label>
                    <select [(ngModel)]="newSale.feePaidBy" name="feePaidBy"
                      class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="comprador">Comprador</option>
                      <option value="vendedor">Vendedor</option>
                    </select>
                  </div>
                </div>
                <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {{ errorMessage }}
                </div>
                <div class="flex gap-3">
                  <button type="button" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Guardar Borrador
                  </button>
                  <button type="button" (click)="createSale()" [disabled]="loading"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span *ngIf="!loading">✅ Crear Venta</span>
                    <span *ngIf="loading">Creando...</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- PRODUCTOS SECTION -->
          <div *ngIf="activeSection === 'productos'" class="max-w-7xl mx-auto">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-4">Productos</h1>
              <div class="flex gap-2 border-b">
                <button 
                  (click)="activeSubSection = 'buscar'"
                  [ngClass]="activeSubSection === 'buscar' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  1) Buscar
                </button>
                <button 
                  (click)="activeSubSection = 'publicar'"
                  [ngClass]="activeSubSection === 'publicar' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  2) Publicar
                </button>
              </div>
            </div>

            <!-- Buscar Productos -->
            <div *ngIf="activeSubSection === 'buscar'">
              <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div class="flex gap-3">
                  <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar productos..."
                    (keyup.enter)="searchProducts()"
                    class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <button (click)="searchProducts()" [disabled]="loading"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    🔍 Buscar
                  </button>
                </div>
                <div class="mt-4 flex gap-2 flex-wrap">
                  <select class="border rounded-lg px-3 py-2 text-sm">
                    <option>Categoría</option>
                  </select>
                  <select class="border rounded-lg px-3 py-2 text-sm">
                    <option>Precio</option>
                  </select>
                  <select class="border rounded-lg px-3 py-2 text-sm">
                    <option>Ubicación</option>
                  </select>
                  <label class="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer">
                    <input type="checkbox" [(ngModel)]="onlyEscrow"> Solo con ESCROW
                  </label>
                  <label class="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer">
                    <input type="checkbox" [(ngModel)]="verifiedOnly"> Vendedor Verificado
                  </label>
                </div>
              </div>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let product of searchResults" class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition">
                  <div class="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <span class="text-gray-400">📷 Imagen</span>
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-1">{{ product.title }}</h3>
                  <p class="text-lg font-bold text-indigo-600 mb-2">{{ product.price | currency:'MXN':'symbol':'1.0-0' }}</p>
                  <p class="text-sm text-gray-600 mb-2">{{ product.seller }} ⭐⭐⭐⭐⭐</p>
                  <p class="text-xs text-gray-500 mb-3">{{ product.location }} | 🔒 ESCROW Incluido</p>
                  <button class="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                    🛒 Comprar
                  </button>
                </div>
              </div>
            </div>

            <!-- Publicar Producto -->
            <div *ngIf="activeSubSection === 'publicar'">
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <p class="text-gray-600 mb-4">Publicar un producto es igual a crear una nueva venta.</p>
                <button (click)="activeSection = 'crear-venta'" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Ir a Crear Nueva Venta
                </button>
              </div>
            </div>
          </div>

          <!-- NOTIFICACIONES SECTION -->
          <div *ngIf="activeSection === 'notificaciones'" class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Notificaciones</h1>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="mb-4 flex gap-2">
                <button class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Todas</button>
                <button class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Compras</button>
                <button class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Ventas</button>
                <button class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Urgentes</button>
            </div>
              <div class="space-y-3">
                <div *ngFor="let notif of allNotifications" class="border rounded-lg p-4 hover:bg-gray-50" [class.bg-indigo-50]="!notif.is_read">
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">{{ notif.icon }}</span>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">{{ notif.title }}</p>
                      <p class="text-sm text-gray-600 mt-1">{{ notif.message }}</p>
                      <p class="text-xs text-gray-500 mt-2">{{ notif.time }}</p>
          </div>
                    <button (click)="markNotificationRead(notif.id)" class="text-xs text-indigo-600 hover:text-indigo-800">
                      {{ notif.is_read ? 'Ver' : 'Marcar como leída' }}
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Pagination Controls -->
              <div *ngIf="notificationPagination.totalPages > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div class="text-sm text-gray-700">
                  Mostrando {{ ((notificationPagination.currentPage - 1) * notificationPagination.pageSize) + 1 }} - 
                  {{ Math.min(notificationPagination.currentPage * notificationPagination.pageSize, notificationPagination.total) }} 
                  de {{ notificationPagination.total }}
                </div>
                <div class="flex gap-2">
                  <button 
                    (click)="onNotificationPageChange(notificationPagination.currentPage - 1)"
                    [disabled]="notificationPagination.currentPage === 1"
                    [ngClass]="notificationPagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                    class="px-3 py-2 border rounded-lg text-sm">
                    ← Anterior
                  </button>
                  <div class="flex gap-1">
                    <button 
                      *ngFor="let page of getPageNumbers(notificationPagination.currentPage, notificationPagination.totalPages)"
                      (click)="onNotificationPageChange(page)"
                      [ngClass]="page === notificationPagination.currentPage 
                        ? 'bg-indigo-600 text-white' 
                        : 'border hover:bg-gray-50'"
                      class="px-3 py-2 rounded-lg text-sm">
                      {{ page }}
                    </button>
                  </div>
                  <button 
                    (click)="onNotificationPageChange(notificationPagination.currentPage + 1)"
                    [disabled]="notificationPagination.currentPage === notificationPagination.totalPages"
                    [ngClass]="notificationPagination.currentPage === notificationPagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                    class="px-3 py-2 border rounded-lg text-sm">
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- CONFIGURACION SECTION -->
          <div *ngIf="activeSection === 'configuracion'" class="max-w-4xl mx-auto">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-4">Configuración</h1>
              <div class="flex gap-2 border-b">
                <button 
                  (click)="activeSubSection = 'general'"
                  [ngClass]="activeSubSection === 'general' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  1) General
                </button>
                <button 
                  (click)="activeSubSection = 'notif'"
                  [ngClass]="activeSubSection === 'notif' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  2) Notificaciones
                </button>
                <button 
                  (click)="activeSubSection = 'trans'"
                  [ngClass]="activeSubSection === 'trans' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'"
                  class="px-4 py-2 transition">
                  3) Transacciones
                </button>
              </div>
            </div>

            <!-- General -->
            <div *ngIf="activeSubSection === 'general'" class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuración General</h2>
              <form class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                  <select class="w-full border rounded-lg px-3 py-2">
                    <option>Español</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                  <select class="w-full border rounded-lg px-3 py-2">
                    <option>America/Mexico_City (GMT-6)</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="settings.general.darkMode"> Modo Oscuro
                  </label>
                </div>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Guardar Cambios
                </button>
              </form>
            </div>

            <!-- Notificaciones -->
            <div *ngIf="activeSubSection === 'notif'" class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuración de Notificaciones</h2>
              <div class="space-y-6">
                <div>
                  <h3 class="font-semibold text-gray-900 mb-3">🛒 Como Comprador</h3>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="settings.notifications.buyer.email"> Email
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="settings.notifications.buyer.sms"> SMS
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="settings.notifications.buyer.push"> Push
                    </label>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-3">🏪 Como Vendedor</h3>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="settings.notifications.seller.email"> Email
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="settings.notifications.seller.sms"> SMS
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="settings.notifications.seller.push"> Push
                    </label>
                  </div>
                </div>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Guardar Cambios
                </button>
              </div>
            </div>

            <!-- Transacciones -->
            <div *ngIf="activeSubSection === 'trans'" class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuración de Transacciones</h2>
              <form class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Período de Inspección por Defecto (días)</label>
                  <input type="number" [(ngModel)]="settings.transactions.defaultInspectionDays" min="1" max="30"
                    class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monto Máximo sin Aprobación 2FA</label>
                  <input type="number" [(ngModel)]="settings.transactions.maxAmountWithout2FA"
                    class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" [(ngModel)]="settings.transactions.autoRelease"> Liberación Automática de Fondos
                  </label>
                </div>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
  styles: []
})
export class UserPortalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  activeSection: ActiveSection = 'dashboard';
  activeSubSection: ActiveSubSection = 'persona';
  activeRole: ActiveRole = 'completo';
  
  userName = 'Usuario';
  userInitials = 'U';
  unreadCount = 0;
  loading = false;
  errorMessage = '';

  // Profile Data
  profileData = {
    firstName: '',
    lastName: '',
    curp: '',
    rfc: '',
    birthDate: '',
    phone: '',
    address: ''
  };

  companyData = {
    businessName: '',
    businessRfc: '',
    businessType: '',
    yearsExperience: 0
  };

  bankData = {
    bank: '',
    clabe: '',
    accountNumber: '',
    accountHolder: ''
  };

  // Transactions
  salesTransactions: any[] = [];
  purchaseTransactions: any[] = [];
  disputeTransactions: any[] = [];
  allTransactions: EscrowTransaction[] = [];
  
  // Pagination for transactions
  transactionPagination = {
    currentPage: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  };
  
  // Pagination for notifications
  notificationPagination = {
    currentPage: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  };

  // New Sale
  newSale = {
    title: '',
    category: '',
    price: 0,
    description: '',
    inspectionDays: 5,
    feePaidBy: 'comprador'
  };

  // Search
  searchQuery = '';
  onlyEscrow = true;
  verifiedOnly = true;
  searchResults = [
    { title: 'MacBook Pro M3 16"', seller: 'TechStore MX', price: 45000, location: 'Ciudad de México' },
    { title: 'iPhone 15 Pro 256GB', seller: 'Juan P.', price: 28000, location: 'Guadalajara' }
  ];

  // Notifications
  allNotifications: any[] = [];
  recentNotifications: any[] = [];

  // Settings
  settings = {
    general: {
      darkMode: false
    },
    notifications: {
      buyer: { email: true, sms: true, push: true },
      seller: { email: true, sms: true, push: true }
    },
    transactions: {
      defaultInspectionDays: 5,
      maxAmountWithout2FA: 50000,
      autoRelease: true
    }
  };

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

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private transactionService: TransactionService,
    private notificationService: NotificationService,
    private websocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit() {
    // Permitir acceso directo con tokens mock (dev-token-quick-access o direct-access-token)
    const mockToken = localStorage.getItem('consufin_access_token');
    const isMockToken = mockToken === 'dev-token-quick-access' || mockToken === 'direct-access-token';
    
    if (!this.authService.isAuthenticated() && !isMockToken) {
      this.router.navigate(['/consufin/registro']);
      return;
    }
    
    // Si es un token mock, usar datos mock
    if (isMockToken) {
      const mockUser = localStorage.getItem('consufin_user');
      if (mockUser) {
        try {
          const user = JSON.parse(mockUser);
          this.userName = `${user.first_name} ${user.last_name}`;
          this.userInitials = `${user.first_name?.[0] || 'U'}${user.last_name?.[0] || ''}`;
          console.log('⚠️ Modo acceso directo: Usando datos mock');
        } catch (e) {
          console.error('Error parsing mock user:', e);
        }
      }
    } else {
      // Load initial data
      this.loadUserProfile();
    }
    
    this.loadTransactions();
    this.loadNotifications();
    this.loadUnreadCount();
    
    // Connect WebSocket for real-time notifications (solo si hay auth real)
    if (!isMockToken) {
      this.connectWebSocket();
    }
  }
  
  private connectWebSocket() {
    const user = this.authService.getCurrentUserValue();
    const token = this.authService.getToken();
    
    if (!user || !token) {
      return;
    }
    
    // Connect to WebSocket
    this.websocketService.connect(user.id, token);
    
    // Subscribe to WebSocket messages
    this.websocketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.handleWebSocketMessage(message);
      });
    
    // Subscribe to connection status
    this.websocketService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        console.log('WebSocket status:', status);
      });
  }
  
  private handleWebSocketMessage(message: any) {
    console.log('WebSocket message received:', message);
    
    // Handle different message types
    if (message.type === 'notification' || message.data?.type === 'notification') {
      // Reload notifications
      this.loadNotifications();
      this.loadUnreadCount();
      
      // Show toast notification if not in notifications section
      if (this.activeSection !== 'notificaciones') {
        const notificationData = message.data?.data || message.data;
        this.showNotificationToast(notificationData);
      }
    } else if (message.type === 'transaction_update' || message.data?.type === 'transaction_update') {
      // Reload transactions
      this.loadTransactions();
    }
  }
  
  private showNotificationToast(notification: any) {
    // Simple alert for now - can be replaced with a toast component
    const title = notification.title || notification.message || 'Nueva notificación';
    console.log('🔔 Nueva notificación:', title);
    // Optionally show a non-intrusive toast notification
  }

  ngOnDestroy() {
    // Disconnect WebSocket
    this.websocketService.disconnect();
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile() {
    this.loading = true;
    this.userService.getProfile()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading profile:', error);
          this.errorMessage = 'Error al cargar el perfil';
          // Fallback to stored user data
    const user = this.authService.getCurrentUserValue();
    if (user) {
            this.setUserData(user);
          }
          return of(null);
        })
      )
      .subscribe(user => {
        this.loading = false;
        if (user) {
          this.setUserData(user);
        }
      });
  }

  setUserData(user: any) {
      this.userName = `${user.first_name} ${user.last_name}`.trim() || 'Usuario';
      this.userInitials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || 'U';
    this.profileData.firstName = user.first_name || '';
    this.profileData.lastName = user.last_name || '';
    this.profileData.phone = user.phone || '';
    this.profileData.curp = user.curp || '';
    this.profileData.rfc = user.rfc || '';
    this.profileData.birthDate = user.birth_date || '';
    this.profileData.address = [
      user.address_street,
      user.address_city,
      user.address_state,
      user.address_zip_code
    ].filter(Boolean).join(', ');
    
    // Company data
    this.companyData.businessName = user.broker_business_name || '';
    this.companyData.businessRfc = user.broker_business_rfc || '';
    this.companyData.businessType = user.broker_business_type || '';
    this.companyData.yearsExperience = user.broker_years_experience || 0;
  }

  loadTransactions(page: number = 1, forceRefresh: boolean = false) {
    if (this.loading && !forceRefresh) {
      return; // Prevent concurrent requests
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.transactionPagination.currentPage = page;
    
    this.transactionService.getTransactions({ 
      page, 
      limit: this.transactionPagination.pageSize 
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading transactions:', error);
          this.loading = false;
          this.errorMessage = error.error?.detail || error.message || 'Error al cargar transacciones. Por favor, intenta de nuevo.';
          
          // Return empty response to prevent UI breakage
          return of({ 
            items: [], 
            pagination: { 
              page: 1, 
              limit: 20, 
              total: 0, 
              total_pages: 0 
            } 
          });
        })
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.errorMessage = '';
          this.allTransactions = response.items || [];
          this.transactionPagination.total = response.pagination?.total || 0;
          this.transactionPagination.totalPages = response.pagination?.total_pages || 
            Math.ceil((response.pagination?.total || 0) / (response.pagination?.limit || 20));
          this.transactionPagination.currentPage = response.pagination?.page || 1;
          
          this.processTransactions(this.allTransactions);
          // Update stats with current page items (for complete stats, would need separate call)
          this.updateStats(this.allTransactions);
        },
        error: (error) => {
          // This should not be reached due to catchError, but just in case
          this.loading = false;
          this.errorMessage = 'Error inesperado al cargar transacciones';
          console.error('Unexpected error in loadTransactions:', error);
        }
      });
  }
  
  onTransactionPageChange(page: number) {
    this.loadTransactions(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  processTransactions(transactions: EscrowTransaction[]) {
    const user = this.authService.getCurrentUserValue();
    if (!user) return;

    // Separate by role
    this.salesTransactions = transactions
      .filter(t => t.seller_id === user.id)
      .map(t => ({
        id: t.transaction_id,
        product: t.item_title,
        buyer: 'Usuario', // TODO: Get buyer name from API
        amount: t.price,
        status: this.mapStatus(t.status),
        date: new Date(t.created_at).toLocaleDateString('es-MX')
      }));

    this.purchaseTransactions = transactions
      .filter(t => t.buyer_id === user.id)
      .map(t => ({
        id: t.transaction_id,
        product: t.item_title,
        seller: 'Usuario', // TODO: Get seller name from API
        amount: t.total_amount,
        status: this.mapStatus(t.status),
        date: new Date(t.created_at).toLocaleDateString('es-MX')
      }));

    this.disputeTransactions = transactions
      .filter(t => t.status === 'disputed')
      .map(t => ({
        id: t.transaction_id,
        product: t.item_title,
        reason: 'Disputa activa',
        date: new Date(t.created_at).toLocaleDateString('es-MX')
      }));
  }

  mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending_agreement': 'pendiente',
      'pending_payment': 'en_proceso',
      'payment_received': 'en_proceso',
      'item_shipped': 'en_proceso',
      'inspection_period': 'en_proceso',
      'buyer_approved': 'completada',
      'funds_released': 'completada',
      'disputed': 'en_disputa'
    };
    return statusMap[status] || status;
  }

  updateStats(transactions: EscrowTransaction[]) {
    this.buyerStats = this.transactionService.calculateBuyerStats(transactions);
    this.sellerStats = this.transactionService.calculateSellerStats(transactions);
  }

  loadNotifications(page: number = 1, forceRefresh: boolean = false) {
    this.notificationPagination.currentPage = page;
    
    this.notificationService.getNotifications({ 
      page, 
      limit: this.notificationPagination.pageSize 
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading notifications:', error);
          // Return safe default to prevent UI breakage
          return of({ 
            notifications: [], 
            pagination: { 
              page: 1, 
              limit: 20, 
              total: 0, 
              total_pages: 0 
            } 
          });
        })
      )
      .subscribe({
        next: (response) => {
          this.allNotifications = (response.notifications || []).map(n => ({
            icon: this.getNotificationIcon(n.notification_type || 'system'),
            title: n.title || 'Sin título',
            message: n.message || '',
            time: this.formatTime(n.created_at || new Date().toISOString()),
            id: n.id || 0,
            is_read: n.is_read || false
          }));
          
          this.notificationPagination.total = response.pagination?.total || 0;
          this.notificationPagination.totalPages = response.pagination?.total_pages || 
            Math.ceil((response.pagination?.total || 0) / (response.pagination?.limit || 20));
          this.notificationPagination.currentPage = response.pagination?.page || 1;
          
          // Recent notifications for dashboard (always first page)
          if (page === 1) {
            this.recentNotifications = this.allNotifications
              .slice(0, 4)
              .map(n => ({
                icon: n.icon,
                message: n.title + ' - ' + n.message,
                time: n.time
              }));
          }
        },
        error: (error) => {
          // Should not reach here due to catchError, but handle just in case
          console.error('Unexpected error in loadNotifications:', error);
          this.allNotifications = [];
        }
      });
  }
  
  onNotificationPageChange(page: number) {
    this.loadNotifications(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(0))
      )
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'transaction': '🛒',
      'payment': '💳',
      'shipping': '🚚',
      'inspection': '⏰',
      'dispute': '⚖️',
      'system': '🔔'
    };
    return iconMap[type] || '🔔';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-MX');
  }

  saveProfile() {
    this.loading = true;
    this.userService.updateProfile({
      first_name: this.profileData.firstName,
      last_name: this.profileData.lastName,
      phone: this.profileData.phone,
      curp: this.profileData.curp,
      rfc: this.profileData.rfc,
      birth_date: this.profileData.birthDate,
      address_street: this.profileData.address.split(',')[0] || '',
      address_city: this.profileData.address.split(',')[1] || '',
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error saving profile:', error);
          this.errorMessage = 'Error al guardar el perfil';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(user => {
        this.loading = false;
        if (user) {
          this.setUserData(user);
          this.errorMessage = '';
          alert('Perfil actualizado correctamente');
        }
      });
  }

  saveCompany() {
    this.loading = true;
    this.userService.updateCompanyData(this.companyData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error saving company:', error);
          this.errorMessage = 'Error al guardar datos de empresa';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(user => {
        this.loading = false;
        if (user) {
          alert('Datos de empresa actualizados correctamente');
        }
      });
  }

  saveBank() {
    this.loading = true;
    this.userService.updateBankData(this.bankData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error saving bank data:', error);
          this.errorMessage = 'Error al guardar datos bancarios';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(user => {
        this.loading = false;
        if (user) {
          alert('Datos bancarios actualizados correctamente');
        }
      });
  }

  createSale() {
    const user = this.authService.getCurrentUserValue();
    if (!user) return;

    if (!this.newSale.title || !this.newSale.price) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    const transactionData = {
      seller_id: user.id,
      item: {
        title: this.newSale.title,
        description: this.newSale.description,
        category: this.newSale.category,
      },
      terms: {
        price: this.newSale.price,
        currency: 'MXN',
        inspection_period_days: this.newSale.inspectionDays
      }
    };

    this.transactionService.createTransaction(transactionData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error creating sale:', error);
          this.errorMessage = 'Error al crear la venta: ' + (error.error?.detail || error.message);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(transaction => {
        this.loading = false;
        if (transaction) {
          alert('Venta creada correctamente');
          this.newSale = {
            title: '',
            category: '',
            price: 0,
            description: '',
            inspectionDays: 5,
            feePaidBy: 'comprador'
          };
          this.loadTransactions();
        }
      });
  }

  searchProducts() {
    // TODO: Implement product search endpoint
    // For now, use transactions as products
    this.transactionService.getTransactions({ category: this.searchQuery })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([]))
      )
      .subscribe(transactions => {
        this.searchResults = transactions
          .filter(t => t.status === 'pending_agreement')
          .map(t => ({
            title: t.item_title,
            seller: 'Usuario', // TODO: Get seller name
            price: t.price,
            location: t.delivery_address || 'Ciudad de México'
          }));
      });
  }

  markNotificationRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => console.error('Error marking notification as read:', error))
      )
      .subscribe(() => {
        const notif = this.allNotifications.find(n => n.id === notificationId);
        if (notif) {
          notif.is_read = true;
        }
        this.loadUnreadCount();
      });
  }

  logout() {
    this.authService.logout();
  }
  
  // Helper method to generate page numbers for pagination
  getPageNumbers(currentPage: number, totalPages: number): number[] {
    const pages: number[] = [];
    const maxPages = 5; // Show max 5 page numbers
    
    if (totalPages <= maxPages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
      let end = Math.min(totalPages, start + maxPages - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxPages - 1) {
        start = Math.max(1, end - maxPages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  // Expose Math for template
  Math = Math;
}
