import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackButtonComponent } from './back-button.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-internal-access',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8">
        <app-back-button />
        
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">💼 CONSUFIN</h1>
          <h2 class="text-xl text-gray-700 mb-2">Acceso Interno</h2>
          <p class="text-gray-600">Ingresa con tus credenciales corporativas</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {{ successMessage }}
        </div>

        <!-- Login Form -->
        <div *ngIf="!isCreatingAdvisor" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              📧 Correo Corporativo *
            </label>
            <input 
              type="email" 
              [(ngModel)]="corporateEmail" 
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="benjamin@consufin.com.mx"
              [class.border-red-300]="corporateEmail && !isCorporateEmail(corporateEmail)" />
            <p *ngIf="corporateEmail && !isCorporateEmail(corporateEmail)" class="text-xs text-red-600 mt-1">
              Debe ser un correo corporativo de CONSUFIN (@consufin.com.mx)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">🔒 Contraseña Corporativa *</label>
            <input 
              type="password" 
              [(ngModel)]="corporatePassword" 
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tu contraseña corporativa"
              (keyup.enter)="loginCorporate()" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">🔐 Código 2FA Corporativo</label>
            <input 
              type="text" 
              [(ngModel)]="corporate2FA" 
              class="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest"
              placeholder="_ _ _ _ _ _"
              maxlength="6" />
            <p class="text-xs text-gray-500 mt-1">
              Código de autenticación de dos factores (aplicación corporativa)
            </p>
          </div>

          <button 
            (click)="loginCorporate()" 
            [disabled]="!isCorporateLoginValid() || loading"
            class="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition">
            <span *ngIf="!loading">🔓 Acceder</span>
            <span *ngIf="loading">Cargando...</span>
          </button>

          <div class="text-center pt-4 border-t">
            <p class="text-sm text-gray-600 mb-3">
              ¿Necesitas crear un nuevo asesor?
            </p>
            <button 
              (click)="showCreateAdvisor()"
              class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              + Crear Nuevo Asesor (Solo SUPER_USER)
            </button>
          </div>
        </div>

        <!-- Create Advisor Form (Super User Only) -->
        <div *ngIf="isCreatingAdvisor" class="space-y-4">
          <h3 class="text-xl font-bold text-gray-900 mb-4">👤 Crear Nuevo Asesor</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input 
                type="text" 
                [(ngModel)]="advisorForm.firstName" 
                class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input 
                type="text" 
                [(ngModel)]="advisorForm.lastName" 
                class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">📧 Correo Corporativo *</label>
            <input 
              type="email" 
              [(ngModel)]="advisorForm.email" 
              class="w-full border rounded-lg px-3 py-2"
              placeholder="asesor@consufin.com.mx"
              [class.border-red-300]="advisorForm.email && !isCorporateEmail(advisorForm.email)" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">🎯 Especialización *</label>
            <select [(ngModel)]="advisorForm.specialization" class="w-full border rounded-lg px-3 py-2">
              <option value="">Seleccionar...</option>
              <option value="bienes_inmuebles">Bienes Inmuebles</option>
              <option value="vehiculos">Vehículos</option>
              <option value="maquinaria">Maquinaria</option>
              <option value="servicios">Servicios Profesionales</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">🔒 Contraseña Temporal *</label>
            <input 
              type="password" 
              [(ngModel)]="advisorForm.temporaryPassword" 
              class="w-full border rounded-lg px-3 py-2"
              placeholder="Se generará automáticamente" />
            <p class="text-xs text-gray-500 mt-1">
              El asesor deberá cambiar esta contraseña en el primer acceso
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">📱 Teléfono *</label>
            <input 
              type="tel" 
              [(ngModel)]="advisorForm.phone" 
              class="w-full border rounded-lg px-3 py-2"
              placeholder="55 1234 5678"
              maxlength="10" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">🔐 Permisos y Límites</label>
            <div class="space-y-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="advisorForm.permissions.reviewDocuments" class="rounded" />
                <span class="text-sm">Revisar documentos KYC</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="advisorForm.permissions.communicateParties" class="rounded" />
                <span class="text-sm">Comunicarse con partes</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="advisorForm.permissions.evaluateTransactions" class="rounded" />
                <span class="text-sm">Evaluar transacciones</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="advisorForm.permissions.resolveDisputes" class="rounded" />
                <span class="text-sm">Resolver disputas</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">💰 Límite de Transacciones (MXN)</label>
            <input 
              type="number" 
              [(ngModel)]="advisorForm.transactionLimit" 
              class="w-full border rounded-lg px-3 py-2"
              min="0"
              placeholder="10000000" />
            <p class="text-xs text-gray-500 mt-1">
              Monto máximo que puede gestionar sin autorización adicional
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              (click)="cancelCreateAdvisor()"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button 
              (click)="createAdvisor()"
              [disabled]="!isAdvisorFormValid() || loading"
              class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700">
              {{ loading ? 'Creando...' : 'Crear Asesor' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class InternalAccessComponent {
  corporateEmail = '';
  corporatePassword = '';
  corporate2FA = '';
  
  isCreatingAdvisor = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  advisorForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    temporaryPassword: '',
    transactionLimit: 0,
    permissions: {
      reviewDocuments: true,
      communicateParties: true,
      evaluateTransactions: true,
      resolveDisputes: false
    }
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isCorporateEmail(email: string): boolean {
    return email.endsWith('@consufin.com.mx');
  }

  isCorporateLoginValid(): boolean {
    return (
      this.isCorporateEmail(this.corporateEmail) &&
      this.corporatePassword.length > 0 &&
      this.corporate2FA.length === 6
    );
  }

  isAdvisorFormValid(): boolean {
    return (
      this.advisorForm.firstName.trim().length > 0 &&
      this.advisorForm.lastName.trim().length > 0 &&
      this.isCorporateEmail(this.advisorForm.email) &&
      this.advisorForm.phone.length === 10 &&
      this.advisorForm.specialization.length > 0 &&
      this.advisorForm.temporaryPassword.length >= 8 &&
      this.advisorForm.transactionLimit > 0
    );
  }

  async loginCorporate() {
    this.loading = true;
    this.errorMessage = '';
    
    try {
      // TODO: Implementar endpoint de login corporativo con 2FA
      const response = await this.authService.login({
        email: this.corporateEmail,
        password: this.corporatePassword
      });
      
      // Verificar rol interno (ADVISOR, CONSUFIN_USER, SUPER_USER)
      if (!['advisor', 'consufin_user', 'super_user'].includes(response.user.role.toLowerCase())) {
        throw new Error('No tienes acceso corporativo');
      }
      
      // TODO: Verificar 2FA corporativo
      
      this.successMessage = 'Inicio de sesión exitoso';
      
      // Redirigir según rol
      if (response.user.role === 'super_user') {
        this.router.navigate(['/consufin/admin']);
      } else if (response.user.role === 'advisor') {
        this.router.navigate(['/consufin/advisor']);
      } else {
        this.router.navigate(['/consufin/usuario']);
      }
    } catch (error: any) {
      this.errorMessage = error.error?.detail || 'Error al iniciar sesión corporativa';
    } finally {
      this.loading = false;
    }
  }

  showCreateAdvisor() {
    // Verificar que el usuario tenga permisos de SUPER_USER
    // TODO: Verificar token y rol antes de permitir
    this.isCreatingAdvisor = true;
  }

  cancelCreateAdvisor() {
    this.isCreatingAdvisor = false;
    this.advisorForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      temporaryPassword: '',
      transactionLimit: 0,
      permissions: {
        reviewDocuments: true,
        communicateParties: true,
        evaluateTransactions: true,
        resolveDisputes: false
      }
    };
  }

  async createAdvisor() {
    this.loading = true;
    this.errorMessage = '';
    
    try {
      // TODO: Implementar endpoint para crear asesor (solo SUPER_USER)
      const response = await this.authService.register({
        email: this.advisorForm.email,
        password: this.advisorForm.temporaryPassword,
        first_name: this.advisorForm.firstName,
        last_name: this.advisorForm.lastName,
        phone: this.advisorForm.phone,
        role: 'advisor' // Role será ADVISOR
      });
      
      this.successMessage = `Asesor creado exitosamente. Se enviará un correo con las credenciales a ${this.advisorForm.email}`;
      
      // Reset form
      setTimeout(() => {
        this.cancelCreateAdvisor();
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.error?.detail || 'Error al crear asesor';
    } finally {
      this.loading = false;
    }
  }
}

