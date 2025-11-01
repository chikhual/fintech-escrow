import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-verification-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">📋 Dashboard de Verificación</h1>

        <!-- Progress Overview -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Progreso de Verificación</h2>
          
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Progreso General</span>
              <span class="text-sm font-bold text-indigo-600">{{ verificationProgress.percentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                [style.width.%]="verificationProgress.percentage">
              </div>
            </div>
          </div>

          <!-- Steps Checklist -->
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 border rounded-lg"
                 [ngClass]="verificationProgress.steps.email ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ verificationProgress.steps.email ? '✅' : '⏳' }}</span>
                <div>
                  <p class="font-medium text-gray-900">Correo Electrónico</p>
                  <p class="text-xs text-gray-600">Verifica tu correo electrónico</p>
                </div>
              </div>
              <button 
                *ngIf="!verificationProgress.steps.email"
                (click)="resendEmailVerification()"
                class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">
                Reenviar
              </button>
            </div>

            <div class="flex items-center justify-between p-3 border rounded-lg"
                 [ngClass]="verificationProgress.steps.phone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ verificationProgress.steps.phone ? '✅' : '⏳' }}</span>
                <div>
                  <p class="font-medium text-gray-900">Teléfono</p>
                  <p class="text-xs text-gray-600">Verifica tu número de teléfono</p>
                </div>
              </div>
              <button 
                *ngIf="!verificationProgress.steps.phone"
                (click)="sendPhoneCode()"
                class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">
                Enviar Código
              </button>
            </div>

            <div class="flex items-center justify-between p-3 border rounded-lg"
                 [ngClass]="verificationProgress.steps.documents ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ verificationProgress.steps.documents ? '✅' : '⏳' }}</span>
                <div>
                  <p class="font-medium text-gray-900">Documentos de Identidad</p>
                  <p class="text-xs text-gray-600">Sube y verifica tus documentos</p>
                </div>
              </div>
              <button 
                *ngIf="!verificationProgress.steps.documents"
                routerLink="/consufin/validacion"
                class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">
                Completar KYC
              </button>
            </div>

            <div class="flex items-center justify-between p-3 border rounded-lg"
                 [ngClass]="verificationProgress.steps.kyc ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ verificationProgress.steps.kyc ? '✅' : '⏳' }}</span>
                <div>
                  <p class="font-medium text-gray-900">Verificación KYC Completa</p>
                  <p class="text-xs text-gray-600">Todos los documentos han sido verificados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Phone Verification Modal -->
        <div *ngIf="showPhoneCodeInput" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Verificar Teléfono</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Código de Verificación</label>
                <input 
                  type="text" 
                  [(ngModel)]="phoneCode"
                  maxlength="6"
                  class="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest"
                  placeholder="_ _ _ _ _ _" />
              </div>
              <div class="flex gap-3">
                <button 
                  (click)="showPhoneCodeInput = false"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button 
                  (click)="verifyPhoneCode()"
                  [disabled]="phoneCode.length !== 6 || loading"
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                  Verificar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Display -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Estado Actual</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 border rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Estado General</p>
              <p class="text-lg font-semibold text-gray-900">{{ currentStatus }}</p>
            </div>
            <div class="p-4 border rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Pasos Completados</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ verificationProgress.completed_steps }} / {{ verificationProgress.total_steps }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VerificationDashboardComponent implements OnInit {
  verificationProgress: any = {
    percentage: 0,
    completed_steps: 0,
    total_steps: 4,
    steps: {
      email: false,
      phone: false,
      documents: false,
      kyc: false
    }
  };
  
  currentStatus = '';
  showPhoneCodeInput = false;
  phoneCode = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadVerificationStatus();
  }

  async loadVerificationStatus() {
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/auth/verification/status`, {
        headers: this.authService.getAuthHeaders()
      }).toPromise();
      
      this.verificationProgress = {
        percentage: response.verification_progress.percentage,
        completed_steps: response.verification_progress.completed_steps,
        total_steps: response.verification_progress.total_steps,
        steps: response.verification_progress.steps
      };
      
      this.currentStatus = this.getStatusLabel(response.status);
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending_email': 'Pendiente: Email',
      'email_verified': 'Email Verificado',
      'pending_phone': 'Pendiente: Teléfono',
      'phone_verified': 'Teléfono Verificado',
      'pending_documents': 'Pendiente: Documentos',
      'documents_submitted': 'Documentos Enviados',
      'under_review': 'En Revisión',
      'fully_verified': 'Verificado Completamente',
      'partially_verified': 'Verificado Parcialmente'
    };
    return labels[status] || status;
  }

  async resendEmailVerification() {
    this.loading = true;
    this.authService.getCurrentUser().subscribe(async user => {
      try {
        await this.http.post(`${environment.apiUrl}/auth/resend-verification`, {
          email: user?.email
        }).toPromise();
        alert('Correo de verificación reenviado');
      } catch (err: any) {
        alert('Error: ' + (err.error?.detail || err.error?.message || 'No se pudo reenviar el correo'));
      } finally {
        this.loading = false;
      }
    });
  }

  async sendPhoneCode() {
    this.loading = true;
    try {
      await this.http.post(`${environment.apiUrl}/auth/verification/send-phone-code`, {}, {
        headers: this.authService.getAuthHeaders()
      }).toPromise();
      
      this.showPhoneCodeInput = true;
    } catch (error: any) {
      alert('Error: ' + (error.error?.message || 'No se pudo enviar el código'));
    } finally {
      this.loading = false;
    }
  }

  async verifyPhoneCode() {
    if (this.phoneCode.length !== 6) return;
    
    this.loading = true;
    try {
      await this.http.post(`${environment.apiUrl}/auth/verification/verify-phone`, {
        code: this.phoneCode
      }, {
        headers: this.authService.getAuthHeaders()
      }).toPromise();
      
      this.showPhoneCodeInput = false;
      this.phoneCode = '';
      await this.loadVerificationStatus();
      alert('Teléfono verificado exitosamente');
    } catch (error: any) {
      alert('Error: ' + (error.error?.message || 'Código inválido'));
    } finally {
      this.loading = false;
    }
  }
}

