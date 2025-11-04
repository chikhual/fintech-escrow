import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type ActiveSection = 'dashboard' | 'transacciones' | 'clientes' | 'documentos' | 'comisiones' | 'reportes' | 'configuracion';

interface BrokerProfile {
  id: number;
  name: string;
  photo: string;
  rating: number;
  specialty: string;
  location: string;
  phone: string;
  email: string;
  level: string;
  certifications: string[];
  years_experience: number;
}

interface TransactionSummary {
  active: number;
  in_process: number;
  completed: number;
  in_dispute: number;
  total_volume: number;
}

interface CommissionSummary {
  this_month: number;
  pending: number;
  average_percentage: number;
}

interface ClientSummary {
  active: number;
  new: number;
  average_rating: number;
  level: string;
}

interface Alert {
  id: number;
  type: 'warning' | 'info' | 'success' | 'urgent';
  icon: string;
  message: string;
  action?: string;
  transaction_id?: string;
  due_date?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route?: string;
}

@Component({
  selector: 'app-broker-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <h1 class="text-2xl font-bold text-gray-900">🤝 BROKER DASHBOARD</h1>
            </div>
            <div class="flex items-center gap-4">
              <button (click)="logout()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-6">
        <!-- Broker Profile Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0">
              <div class="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-4xl">
                {{ brokerProfile.name.charAt(0) }}
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-2xl font-bold text-gray-900">{{ brokerProfile.name }}</h2>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  🏆 Broker Certificado
                </span>
              </div>
              <div class="flex items-center gap-4 mb-3 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  <span class="font-semibold">Rating:</span>
                  <span class="flex items-center">
                    <span *ngFor="let star of getStars(brokerProfile.rating)" class="text-yellow-400">⭐</span>
                    <span class="ml-1">{{ brokerProfile.rating }}/5</span>
                  </span>
                </span>
                <span class="flex items-center gap-1">
                  <span class="font-semibold">🎯 Especialidad:</span>
                  <span>{{ brokerProfile.specialty }}</span>
                </span>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  <span>📍</span>
                  <span>{{ brokerProfile.location }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <span>📞</span>
                  <span>{{ brokerProfile.phone }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <span>📧</span>
                  <span>{{ brokerProfile.email }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Transacciones Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔄</span>
              <span>TRANSACCIONES</span>
            </h3>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Activas:</span>
                <span class="font-semibold text-gray-900">{{ transactionSummary.active }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">En proceso:</span>
                <span class="font-semibold text-blue-600">{{ transactionSummary.in_process }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Completadas:</span>
                <span class="font-semibold text-green-600">{{ transactionSummary.completed }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">En disputa:</span>
                <span class="font-semibold text-red-600">{{ transactionSummary.in_dispute }}</span>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">📈 Vol. total:</span>
                <span class="font-bold text-gray-900">{{ transactionSummary.total_volume | currency:'MXN':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- Comisiones Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💰</span>
              <span>COMISIONES</span>
            </h3>
            <div class="space-y-3 mb-4">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600">Este mes:</span>
                  <span class="font-bold text-green-600">{{ commissionSummary.this_month | currency:'MXN':'symbol':'1.0-0' }}</span>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600">Pendientes:</span>
                  <span class="font-bold text-yellow-600">{{ commissionSummary.pending | currency:'MXN':'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">📊 Comisión prom:</span>
                <span class="font-bold text-gray-900">{{ commissionSummary.average_percentage }}%</span>
              </div>
            </div>
          </div>

          <!-- Clientes Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>👥</span>
              <span>CLIENTES</span>
            </h3>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Activos:</span>
                <span class="font-semibold text-gray-900">{{ clientSummary.active }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Nuevos:</span>
                <span class="font-semibold text-blue-600">{{ clientSummary.new }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Rating promedio:</span>
                <span class="font-semibold text-gray-900">
                  <span class="flex items-center">
                    <span *ngFor="let star of getStars(clientSummary.average_rating)" class="text-yellow-400">⭐</span>
                    <span class="ml-1">{{ clientSummary.average_rating }}/5</span>
                  </span>
                </span>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">🏆 Nivel:</span>
                <span class="font-bold text-indigo-600">{{ clientSummary.level }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerts Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔔</span>
            <span>ALERTAS Y ACCIONES PENDIENTES</span>
          </h3>
          <div class="space-y-3">
            <div 
              *ngFor="let alert of alerts" 
              [ngClass]="{
                'bg-yellow-50 border-yellow-200': alert.type === 'warning',
                'bg-blue-50 border-blue-200': alert.type === 'info',
                'bg-green-50 border-green-200': alert.type === 'success',
                'bg-red-50 border-red-200': alert.type === 'urgent'
              }"
              class="p-4 rounded-lg border flex items-start gap-3">
              <span class="text-xl">{{ alert.icon }}</span>
              <div class="flex-1">
                <p class="text-sm text-gray-700">{{ alert.message }}</p>
                <div *ngIf="alert.transaction_id" class="mt-1 text-xs text-gray-500">
                  TX #{{ alert.transaction_id }}
                </div>
                <div *ngIf="alert.due_date" class="mt-1 text-xs text-gray-500">
                  Vence: {{ alert.due_date }}
                </div>
              </div>
              <button 
                *ngIf="alert.action"
                (click)="handleAlertAction(alert)"
                class="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
                {{ alert.action }}
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎯</span>
            <span>ACCIONES RÁPIDAS</span>
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button 
              *ngFor="let action of quickActions"
              (click)="handleQuickAction(action)"
              class="px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2">
              <span>{{ action.icon }}</span>
              <span>{{ action.label }}</span>
            </button>
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
        <div *ngIf="activeSection === 'dashboard'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Dashboard Principal</h3>
          <p class="text-gray-600">Vista general de todas tus actividades como broker.</p>
        </div>

        <div *ngIf="activeSection === 'transacciones'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Mis Transacciones</h3>
          <p class="text-gray-600">Gestiona todas tus transacciones activas y en proceso.</p>
        </div>

        <div *ngIf="activeSection === 'clientes'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Clientes</h3>
          <p class="text-gray-600">Gestiona tu base de clientes y relaciones.</p>
        </div>

        <div *ngIf="activeSection === 'documentos'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Centro Documental</h3>
          <p class="text-gray-600">Accede y gestiona todos los documentos de tus transacciones.</p>
        </div>

        <div *ngIf="activeSection === 'comisiones'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Comisiones</h3>
          <p class="text-gray-600">Revisa y gestiona tus comisiones y pagos.</p>
        </div>

        <div *ngIf="activeSection === 'reportes'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Reportes</h3>
          <p class="text-gray-600">Genera reportes detallados de tu actividad.</p>
        </div>

        <div *ngIf="activeSection === 'configuracion'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Configuración</h3>
          <p class="text-gray-600">Configura tu perfil, comisiones y preferencias.</p>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class BrokerPortalComponent implements OnInit {
  activeSection: ActiveSection = 'dashboard';

  brokerProfile: BrokerProfile = {
    id: 1,
    name: 'Juan Carlos Mendoza',
    photo: '',
    rating: 4.9,
    specialty: 'Inmuebles',
    location: 'Ciudad de México',
    phone: '+52 55 1234-5678',
    email: 'juan.mendoza@broker.com',
    level: 'Platinum',
    certifications: ['Certificado CONSUFIN', 'Broker Profesional'],
    years_experience: 12
  };

  transactionSummary: TransactionSummary = {
    active: 8,
    in_process: 5,
    completed: 156,
    in_dispute: 1,
    total_volume: 25500000
  };

  commissionSummary: CommissionSummary = {
    this_month: 45000,
    pending: 12000,
    average_percentage: 2.5
  };

  clientSummary: ClientSummary = {
    active: 24,
    new: 3,
    average_rating: 4.8,
    level: 'Platinum'
  };

  alerts: Alert[] = [
    {
      id: 1,
      type: 'warning',
      icon: '⚠️',
      message: 'Vence KYC de cliente "María González" en 3 días',
      due_date: '3 días'
    },
    {
      id: 2,
      type: 'info',
      icon: '📋',
      message: 'Pendiente: Subir avalúo Casa Polanco',
      transaction_id: 'T002156',
      action: 'Subir'
    },
    {
      id: 3,
      type: 'success',
      icon: '💰',
      message: 'Fondos listos para liberación: Casa Satélite',
      transaction_id: 'T002158',
      action: 'Revisar'
    },
    {
      id: 4,
      type: 'info',
      icon: '🤝',
      message: 'Nueva solicitud de representación: Depto Roma Norte',
      action: 'Ver'
    },
    {
      id: 5,
      type: 'info',
      icon: '📞',
      message: 'Recordatorio: Call con cliente a las 3:00 PM',
      due_date: 'Hoy'
    }
  ];

  quickActions: QuickAction[] = [
    { id: 'new-transaction', label: 'Nueva Transacción', icon: '🆕', route: '/transacciones/nueva' },
    { id: 'manage-clients', label: 'Gestionar Clientes', icon: '👥', route: '/clientes' },
    { id: 'reports', label: 'Reportes', icon: '📊', route: '/reportes' },
    { id: 'documents', label: 'Centro Documental', icon: '📁', route: '/documentos' },
    { id: 'config-commissions', label: 'Configurar Comisiones', icon: '⚙️', route: '/configuracion/comisiones' }
  ];

  sections: Array<{ id: ActiveSection; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'transacciones', label: 'Transacciones', icon: '🔄' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'documentos', label: 'Documentos', icon: '📁' },
    { id: 'comisiones', label: 'Comisiones', icon: '💰' },
    { id: 'reportes', label: 'Reportes', icon: '📊' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' }
  ];

  setActiveSection(id: string) {
    this.activeSection = id as ActiveSection;
  }

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('🤝 Broker Portal: Inicializando...');
    // Configurar datos mock para acceso directo
    this.loadMockData();
  }

  private loadMockData() {
    // Datos mock para desarrollo
    // En producción, estos vendrían del backend
    console.log('✅ Broker Portal: Datos mock cargados');
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  handleAlertAction(alert: Alert) {
    console.log('Acción en alerta:', alert);
    // Implementar lógica de acción
    if (alert.transaction_id) {
      this.activeSection = 'transacciones';
    }
  }

  handleQuickAction(action: QuickAction) {
    console.log('Acción rápida:', action);
    if (action.route) {
      this.activeSection = action.route.split('/')[1] as ActiveSection;
    }
  }

  logout() {
    console.log('Logout del broker');
    // Limpiar datos y redirigir
    this.router.navigate(['/']);
  }
}

