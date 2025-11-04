import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from './back-button.component';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-consufin-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-xl shadow w-full max-w-xl p-6">
        <app-back-button />
        
        <!-- Tabs -->
        <div class="flex border-b mb-6">
          <button 
            (click)="activeTab = 'login'"
            [ngClass]="activeTab === 'login' 
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
              : 'text-gray-600 hover:text-gray-900'"
            class="flex-1 py-3 text-center transition">
            Iniciar Sesión
          </button>
          <button 
            (click)="goToRegistrationSelection()"
            class="flex-1 py-3 text-center transition text-gray-600 hover:text-gray-900">
            Registrarse
          </button>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {{ successMessage }}
        </div>

        <!-- LOGIN TAB -->
        <div *ngIf="activeTab === 'login'">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h2>
          <p class="text-gray-600 mb-6">Ingresa tus credenciales para acceder a tu cuenta.</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input 
                type="email" 
                [(ngModel)]="loginEmail" 
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="tucorreo@dominio.com"
                [class.border-red-300]="loginEmail && !isValidEmail(loginEmail)" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                [(ngModel)]="loginPassword" 
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Tu contraseña"
                (keyup.enter)="login()" />
              <div class="mt-2 flex justify-end">
                <button 
                  (click)="forgotPassword()"
                  class="text-xs text-indigo-600 hover:text-indigo-800">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
            <button 
              (click)="login()" 
              [disabled]="!isLoginValid() || loading"
              class="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition">
              <span *ngIf="!loading">Iniciar Sesión</span>
              <span *ngIf="loading">Cargando...</span>
            </button>
          </div>
        </div>

        <!-- LOGIN ONLY - Registration redirects to selection page -->
        <div *ngIf="activeTab === 'login' && false" style="display: none;">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Crear cuenta en CONSUFIN</h2>
          <p class="text-gray-600 mb-6">Selecciona tu tipo de persona y registra tus datos.</p>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <button 
              (click)="selectType('fisica')"
              [ngClass]="personType === 'fisica' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              class="px-3 py-2 border-2 rounded-lg transition">
              Persona Física
            </button>
            <button 
              (click)="selectType('moral')"
              [ngClass]="personType === 'moral' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              class="px-3 py-2 border-2 rounded-lg transition">
              Persona Moral
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  [(ngModel)]="registerFirstName" 
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Juan" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input 
                  type="text" 
                  [(ngModel)]="registerLastName" 
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Pérez" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input 
                type="email" 
                [(ngModel)]="registerEmail" 
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="tucorreo@dominio.com"
                [class.border-red-300]="registerEmail && !isValidEmail(registerEmail)" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono (10 dígitos)</label>
              <input 
                type="tel" 
                [(ngModel)]="registerPhone" 
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="5551234567"
                maxlength="10"
                [class.border-red-300]="registerPhone && !isValidPhone(registerPhone)" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                [(ngModel)]="registerPassword" 
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Mínimo 8 caracteres" />
              <p class="text-xs text-gray-500 mt-1">
                Debe incluir mayúsculas, minúsculas y al menos un número.
              </p>
              <div *ngIf="registerPassword" class="mt-2 space-y-1 text-xs">
                <p [ngClass]="registerPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos 8 caracteres
                </p>
                <p [ngClass]="hasUpperCase(registerPassword) ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos una mayúscula
                </p>
                <p [ngClass]="hasLowerCase(registerPassword) ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos una minúscula
                </p>
                <p [ngClass]="hasNumber(registerPassword) ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos un número
                </p>
              </div>
            </div>
            <button 
              (click)="register()" 
              [disabled]="!isRegisterValid() || loading"
              class="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition">
              <span *ngIf="!loading">Registrarme</span>
              <span *ngIf="loading">Registrando...</span>
            </button>
            <p class="text-xs text-gray-500 text-center">
              Al registrarte, aceptas nuestros términos y condiciones. Se enviará correo de verificación (2 pasos).
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinAuthComponent {
  activeTab: 'login' | 'register' = 'login';
  personType: 'fisica' | 'moral' = 'fisica';
  
  // Login fields
  loginEmail = '';
  loginPassword = '';
  
  // Register fields
  registerEmail = '';
  registerPassword = '';
  registerFirstName = '';
  registerLastName = '';
  registerPhone = '';
  
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  selectType(type: 'fisica' | 'moral'): void {
    this.personType = type;
  }

  isValidEmail(email: string): boolean {
    return /.+@.+\..+/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^\d{10}$/.test(phone);
  }

  hasUpperCase(str: string): boolean {
    return /[A-Z]/.test(str);
  }

  hasLowerCase(str: string): boolean {
    return /[a-z]/.test(str);
  }

  hasNumber(str: string): boolean {
    return /\d/.test(str);
  }

  isLoginValid(): boolean {
    return this.isValidEmail(this.loginEmail) && this.loginPassword.length > 0;
  }

  isRegisterValid(): boolean {
    return (
      this.isValidEmail(this.registerEmail) &&
      this.registerPassword.length >= 8 &&
      this.hasUpperCase(this.registerPassword) &&
      this.hasLowerCase(this.registerPassword) &&
      this.hasNumber(this.registerPassword) &&
      this.registerFirstName.trim().length > 0 &&
      this.registerLastName.trim().length > 0 &&
      (this.registerPhone.length === 0 || this.isValidPhone(this.registerPhone))
    );
  }

  login(): void {
    if (!this.isLoginValid() || this.loading) {
      console.log('⚠️ Login blocked - invalid form or already loading');
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('🚀 Starting login process...');
    console.log('📧 Email:', this.loginEmail);

    const loginData: LoginRequest = {
      email: this.loginEmail,
      password: this.loginPassword
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('✅ Login response received:', response);
        this.loading = false;
        this.successMessage = '¡Inicio de sesión exitoso!';
        // Navigation handled by auth service
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Login error in component:', err);
        console.error('   Error type:', err.constructor.name);
        console.error('   Error status:', err.status);
        console.error('   Error message:', err.message);
        
        let errorDetail = 'Error desconocido';
        
        if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
          errorDetail = 'Timeout: El servidor no respondió a tiempo. Verifica que el backend esté corriendo en http://localhost:8001';
        } else if (err.status === 0) {
          errorDetail = 'Error de conexión: No se pudo conectar al servidor. Verifica que el backend esté corriendo y que no haya problemas de CORS.';
        } else if (err.status === 401) {
          errorDetail = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (err.status === 404) {
          errorDetail = 'Endpoint no encontrado. Verifica la URL del backend.';
        } else if (err.status >= 500) {
          errorDetail = 'Error del servidor. Revisa los logs del backend.';
        } else {
          errorDetail = err.error?.detail || err.error?.message || err.message || 'Error desconocido';
        }
        
        this.errorMessage = `Error al iniciar sesión: ${errorDetail}`;
        console.error('💬 Error message shown to user:', this.errorMessage);
      }
    });
  }

  register(): void {
    if (!this.isRegisterValid() || this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData: RegisterRequest = {
      email: this.registerEmail,
      password: this.registerPassword,
      first_name: this.registerFirstName,
      last_name: this.registerLastName,
      phone: this.registerPhone || undefined,
      role: 'buyer' // Default role
    };

    this.authService.register(registerData).subscribe({
      next: (user) => {
        this.loading = false;
        this.successMessage = '¡Registro exitoso! Redirigiendo...';
        // Navigation handled by auth service
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail || err.error?.message || 'Error al registrar. Verifica tus datos e intenta nuevamente.';
        if (err.error?.errors) {
          const errors = Object.values(err.error.errors).flat();
          this.errorMessage = errors.join(', ');
        }
      }
    });
  }

  forgotPassword(): void {
    // TODO: Implement forgot password flow
    this.errorMessage = 'Funcionalidad de recuperación de contraseña próximamente disponible.';
  }

  goToRegistrationSelection(): void {
    this.router.navigate(['/consufin/registro/seleccion']);
  }
}
