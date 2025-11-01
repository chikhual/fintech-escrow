import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BackButtonComponent } from './back-button.component';

@Component({
  selector: 'app-registration-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">
        <app-back-button />
        
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">🏦 CONSUFIN ESCROW</h1>
          <h2 class="text-2xl text-gray-700 mb-2">Crear Cuenta</h2>
          <p class="text-gray-600">Selecciona cómo quieres usar nuestra plataforma</p>
        </div>

        <!-- Cliente Card -->
        <div class="mb-6 p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 transition cursor-pointer" 
             (click)="selectType('client')"
             [ngClass]="selectedType === 'client' ? 'border-indigo-500 bg-indigo-50' : 'bg-white'">
          <div class="flex items-start gap-4">
            <div class="text-4xl">🛒</div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">COMPRADOR / VENDEDOR</h3>
              <p class="text-gray-700 mb-3">Compra y vende productos de forma segura</p>
              <ul class="space-y-1 text-sm text-gray-600 mb-4">
                <li>✅ Transacciones protegidas con ESCROW</li>
                <li>✅ Verificación KYC estándar</li>
                <li>✅ Sin límite de transacciones</li>
                <li>✅ Sin comisiones ocultas</li>
              </ul>
              <button class="w-full px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition">
                Registrarse como Cliente
              </button>
            </div>
          </div>
        </div>

        <!-- Broker Card -->
        <div class="mb-6 p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 transition cursor-pointer"
             (click)="selectType('broker')"
             [ngClass]="selectedType === 'broker' ? 'border-indigo-500 bg-indigo-50' : 'bg-white'">
          <div class="flex items-start gap-4">
            <div class="text-4xl">🤝</div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">BROKER PROFESIONAL</h3>
              <p class="text-gray-700 mb-3">Facilita transacciones como intermediario</p>
              <ul class="space-y-1 text-sm text-gray-600 mb-4">
                <li>✅ Comisiones especiales para brokers</li>
                <li>✅ Herramientas avanzadas de gestión</li>
                <li>✅ Verificación KYC profesional</li>
                <li>✅ Dashboard de analytics</li>
              </ul>
              <button class="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                Registrarse como Broker
              </button>
            </div>
          </div>
        </div>

        <!-- Separador para Acceso Interno -->
        <div class="my-8 flex items-center">
          <div class="flex-1 border-t border-gray-300"></div>
          <span class="px-4 text-sm text-gray-500">O</span>
          <div class="flex-1 border-t border-gray-300"></div>
        </div>

        <!-- Acceso Interno -->
        <div class="text-center">
          <p class="text-gray-700 mb-4">💼 ¿Eres empleado de CONSUFIN?</p>
          <button (click)="goToInternalAccess()" 
                  class="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
            Acceso Interno
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegistrationSelectionComponent {
  selectedType: 'client' | 'broker' | null = null;

  constructor(private router: Router) {}

  selectType(type: 'client' | 'broker') {
    this.selectedType = type;
    
    // Navegar al wizard de registro con el tipo seleccionado
    if (type === 'client') {
      this.router.navigate(['/consufin/registro/wizard'], { 
        queryParams: { type: 'client', step: '1' } 
      });
    } else if (type === 'broker') {
      this.router.navigate(['/consufin/registro/wizard'], { 
        queryParams: { type: 'broker', step: '1' } 
      });
    }
  }

  goToInternalAccess() {
    // Navegar a página de acceso interno
    this.router.navigate(['/consufin/acceso-interno']);
  }
}

