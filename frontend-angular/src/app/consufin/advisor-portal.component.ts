import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type ActiveSection = 'dashboard' | 'asesorias' | 'comunicacion' | 'resguardo' | 'evaluacion' | 'documentos' | 'reportes' | 'configuracion';

interface AdvisorProfile {
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

interface AdvisorySummary {
  active: number;
  in_evaluation: number;
  completed: number;
  in_dispute: number;
  total_volume: number;
}

interface HonorarySummary {
  this_month: number;
  pending: number;
  average_percentage: number;
}

interface MetricsSummary {
  success_rate: number;
  avg_time_days: number;
  satisfaction_rating: number;
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
  selector: 'app-advisor-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <!-- Logo/Header -->
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-xl font-bold text-gray-900">ASESOR DASHBOARD</h1>
          <p class="text-xs text-gray-500 mt-1">Portal Asesor</p>
        </div>
        
        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            *ngFor="let section of sections"
            (click)="setActiveSection(section.id)"
            [ngClass]="activeSection === section.id 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left">
            <span class="text-lg">{{ section.icon }}</span>
            <span class="font-medium">{{ section.label }}</span>
          </button>
        </nav>

        <!-- Advisor Profile Section -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              {{ advisorProfile.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 text-sm truncate">{{ advisorProfile.name }}</div>
              <div class="text-xs text-gray-500">
                <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  🎓 {{ advisorProfile.level }}
                </span>
              </div>
            </div>
          </div>
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-red-700 hover:bg-red-50 transition text-left">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H3a3 3 0 01-3-3V7a3 3 0 013-3h10a3 3 0 013 3v1"></path>
            </svg>
            <span class="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 ml-64">
        <!-- Top Header -->
        <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ getActiveSectionIcon() }} {{ getActiveSectionLabel() }}
                </h2>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <div class="p-6">
          <!-- Dashboard Section -->
          <div *ngIf="activeSection === 'dashboard'" class="space-y-6">
            <!-- Advisor Profile Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0">
                  <div class="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-4xl">
                    {{ advisorProfile.name.charAt(0) }}
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h2 class="text-2xl font-bold text-gray-900">{{ advisorProfile.name }}</h2>
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      🎓 {{ advisorProfile.level }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <span class="font-semibold">Rating:</span>
                      <span class="flex items-center">
                        <span *ngFor="let star of getStars(advisorProfile.rating)" class="text-yellow-400">⭐</span>
                        <span class="ml-1">{{ advisorProfile.rating }}/5</span>
                      </span>
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="font-semibold">🎯 Especialidad:</span>
                      <span>{{ advisorProfile.specialty }}</span>
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <span>📍</span>
                      <span>{{ advisorProfile.location }}</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <span>📞</span>
                      <span>{{ advisorProfile.phone }}</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <span>📧</span>
                      <span>{{ advisorProfile.email }}</span>
                    </span>
                  </div>
                  <div class="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <span>🏆 {{ advisorProfile.certifications.join(' | ') }}</span>
                    <span class="ml-2">💼 {{ advisorProfile.years_experience }} años experiencia</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Asesorías Card -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🤝</span>
                  <span>ASESORÍAS</span>
                </h3>
                <div class="space-y-2 mb-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Activas:</span>
                    <span class="font-semibold text-gray-900">{{ advisorySummary.active }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">En evaluación:</span>
                    <span class="font-semibold text-blue-600">{{ advisorySummary.in_evaluation }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Completadas:</span>
                    <span class="font-semibold text-green-600">{{ advisorySummary.completed }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">En disputa:</span>
                    <span class="font-semibold text-red-600">{{ advisorySummary.in_dispute }}</span>
                  </div>
                </div>
                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">💼 Vol. asesorado:</span>
                    <span class="font-bold text-gray-900">{{ advisorySummary.total_volume | currency:'MXN':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              </div>

              <!-- Honorarios Card -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>💰</span>
                  <span>HONORARIOS</span>
                </h3>
                <div class="space-y-3 mb-4">
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm text-gray-600">Este mes:</span>
                      <span class="font-bold text-green-600">{{ honorarySummary.this_month | currency:'MXN':'symbol':'1.0-0' }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm text-gray-600">Pendientes:</span>
                      <span class="font-bold text-yellow-600">{{ honorarySummary.pending | currency:'MXN':'symbol':'1.0-0' }}</span>
                    </div>
                  </div>
                </div>
                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">📊 Tarifa promedio:</span>
                    <span class="font-bold text-gray-900">{{ honorarySummary.average_percentage }}%</span>
                  </div>
                </div>
              </div>

              <!-- Métricas Card -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📈</span>
                  <span>MÉTRICAS</span>
                </h3>
                <div class="space-y-2 mb-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Éxito:</span>
                    <span class="font-semibold text-green-600">{{ metricsSummary.success_rate }}%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Tiempo promedio:</span>
                    <span class="font-semibold text-gray-900">{{ metricsSummary.avg_time_days }} días</span>
                  </div>
                </div>
                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">⭐ Satisfacción:</span>
                    <span class="font-bold text-gray-900">
                      <span class="flex items-center">
                        <span *ngFor="let star of getStars(metricsSummary.satisfaction_rating)" class="text-yellow-400">⭐</span>
                        <span class="ml-1">{{ metricsSummary.satisfaction_rating }}/5</span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alerts Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                      {{ alert.due_date }}
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
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
          </div>

          <!-- Asesorías Section -->
          <div *ngIf="activeSection === 'asesorias'" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Mis Asesorías</h3>
              <p class="text-gray-600">Gestiona todas tus asesorías activas y en evaluación.</p>
            </div>
          </div>

          <!-- Comunicación Section -->
          <div *ngIf="activeSection === 'comunicacion'" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Centro de Comunicación</h3>
              <p class="text-gray-600">Facilita comunicación entre las partes y gestiona sesiones de negociación.</p>
            </div>
          </div>

          <!-- Resguardo Section -->
          <div *ngIf="activeSection === 'resguardo'" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Servicios de Resguardo</h3>
              <p class="text-gray-600">Gestiona la custodia de bienes intangibles y servicios de resguardo.</p>
            </div>
          </div>

          <!-- Evaluación Section -->
          <div *ngIf="activeSection === 'evaluacion'" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Evaluación y Revisión</h3>
              <p class="text-gray-600">Analiza información, valida documentación y evalúa términos de negociación.</p>
            </div>
          </div>

          <!-- Documentos Section -->
          <div *ngIf="activeSection === 'documentos'" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Centro Documental</h3>
              <p class="text-gray-600">Accede y gestiona todos los documentos de tus asesorías.</p>
            </div>
          </div>

          <!-- Reportes Section -->
          <div *ngIf="activeSection === 'reportes'" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Reportes</h3>
              <p class="text-gray-600">Genera reportes detallados de tu actividad como asesor.</p>
            </div>
          </div>

          <!-- Configuración Section -->
          <div *ngIf="activeSection === 'configuracion'" class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Configuración</h3>
              <p class="text-gray-600">Configura tu perfil, honorarios y preferencias.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AdvisorPortalComponent implements OnInit {
  activeSection: ActiveSection = 'dashboard';

  advisorProfile: AdvisorProfile = {
    id: 1,
    name: 'María López González',
    photo: '',
    rating: 4.9,
    specialty: 'Inmuebles',
    location: 'Ciudad de México',
    phone: '+52 55 1234-5678',
    email: 'maria.lopez@consufin.com',
    level: 'Asesor Senior',
    certifications: ['Certificación AMPI'],
    years_experience: 15
  };

  advisorySummary: AdvisorySummary = {
    active: 12,
    in_evaluation: 8,
    completed: 234,
    in_dispute: 2,
    total_volume: 89500000
  };

  honorarySummary: HonorarySummary = {
    this_month: 125000,
    pending: 45000,
    average_percentage: 1.8
  };

  metricsSummary: MetricsSummary = {
    success_rate: 98,
    avg_time_days: 12,
    satisfaction_rating: 4.9
  };

  alerts: Alert[] = [
    {
      id: 1,
      type: 'urgent',
      icon: '🚨',
      message: 'URGENTE: Mediación requerida Casa Polanco ($8.5M)',
      transaction_id: 'T003456',
      action: 'Revisar'
    },
    {
      id: 2,
      type: 'info',
      icon: '📋',
      message: 'Pendiente: Evaluación documentos Depto Roma ($2.3M)',
      transaction_id: 'T003457',
      action: 'Evaluar'
    },
    {
      id: 3,
      type: 'warning',
      icon: '⏰',
      message: 'Vence HOY: Período inspección BMW X5 ($785K)',
      transaction_id: 'T003458',
      due_date: 'Hoy',
      action: 'Revisar'
    },
    {
      id: 4,
      type: 'info',
      icon: '💬',
      message: 'Nueva consulta: Negociación arte contemporáneo ($1.2M)',
      action: 'Ver'
    },
    {
      id: 5,
      type: 'info',
      icon: '📞',
      message: 'Programada: Videollamada 3:00 PM - Ambas partes',
      due_date: 'Hoy 3:00 PM',
      action: 'Unirse'
    }
  ];

  quickActions: QuickAction[] = [
    { id: 'new-assignment', label: 'Nuevas Asignaciones', icon: '📋', route: '/asesorias/nueva' },
    { id: 'my-advisories', label: 'Mis Asesorías', icon: '👥', route: '/asesorias' },
    { id: 'reports', label: 'Reportes', icon: '📊', route: '/reportes' },
    { id: 'communication', label: 'Centro de Comunicación', icon: '💬', route: '/comunicacion' },
    { id: 'custody', label: 'Servicios Resguardo', icon: '🛡️', route: '/resguardo' }
  ];

  sections: Array<{ id: ActiveSection; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'asesorias', label: 'Asesorías', icon: '🤝' },
    { id: 'comunicacion', label: 'Comunicación', icon: '💬' },
    { id: 'resguardo', label: 'Resguardo', icon: '🛡️' },
    { id: 'evaluacion', label: 'Evaluación', icon: '🔍' },
    { id: 'documentos', label: 'Documentos', icon: '📁' },
    { id: 'reportes', label: 'Reportes', icon: '📊' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' }
  ];

  setActiveSection(id: string) {
    this.activeSection = id as ActiveSection;
  }

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('🤵 Advisor Portal: Inicializando...');
    this.loadMockData();
  }

  private loadMockData() {
    console.log('✅ Advisor Portal: Datos mock cargados');
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  handleAlertAction(alert: Alert) {
    console.log('Acción en alerta:', alert);
    if (alert.transaction_id) {
      this.activeSection = 'asesorias';
    }
  }

  handleQuickAction(action: QuickAction) {
    console.log('Acción rápida:', action);
    if (action.route) {
      const routeParts = action.route.split('/');
      if (routeParts.length > 1) {
        const sectionId = routeParts[1] as ActiveSection;
        if (this.sections.find(s => s.id === sectionId)) {
          this.activeSection = sectionId;
        }
      }
    }
  }

  getActiveSectionIcon(): string {
    const section = this.sections.find(s => s.id === this.activeSection);
    return section?.icon || '🏠';
  }

  getActiveSectionLabel(): string {
    const section = this.sections.find(s => s.id === this.activeSection);
    return section?.label || 'Dashboard';
  }

  logout() {
    console.log('Logout del asesor');
    localStorage.clear();
    this.router.navigate(['/']);
  }
}

