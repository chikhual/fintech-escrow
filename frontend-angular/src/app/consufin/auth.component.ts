import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from './back-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consufin-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-xl shadow w-full max-w-xl p-6">
        <app-back-button />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Crear cuenta en CONSUFIN</h2>
        <p class="text-gray-600 mb-6">Selecciona tu tipo de persona y registra tus datos.</p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <button (click)="selectType('fisica')"
                  [ngClass]="personType === 'fisica' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''"
                  class="px-3 py-2 border rounded transition">Persona Física</button>
          <button (click)="selectType('moral')"
                  [ngClass]="personType === 'moral' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''"
                  class="px-3 py-2 border rounded transition">Persona Moral</button>
        </div>
        <p class="text-xs text-gray-600 mb-4">Tipo seleccionado: <span class="font-medium text-gray-800">{{ personType === 'fisica' ? 'Persona Física' : 'Persona Moral' }}</span></p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Correo electrónico</label>
            <input type="email" [(ngModel)]="email" class="w-full border rounded px-3 py-2" placeholder="tucorreo@dominio.com" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Contraseña</label>
            <input type="password" [(ngModel)]="password" class="w-full border rounded px-3 py-2" placeholder="Mínimo 7 caracteres" />
            <p class="text-xs text-gray-500 mt-1">Debe incluir minúsculas, mayúsculas y número o caracter especial.</p>
          </div>
          <button (click)="register()" [disabled]="!isValid()"
                  class="w-full px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed">Registrarme</button>
          <p class="text-xs text-gray-500">Se enviará correo de verificación (2 pasos).</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinAuthComponent {
  personType: 'fisica' | 'moral' = 'fisica';
  selectType(type: 'fisica' | 'moral'): void { this.personType = type; }
  email = '';
  password = '';
  constructor(private router: Router) {}
  isValid(): boolean {
    const emailOk = /.+@.+\..+/.test(this.email);
    return emailOk && this.password.length >= 7;
  }
  register(): void {
    if (!this.isValid()) return;
    // Demo: navega a validación KYC/AML
    this.router.navigate(['/consufin/validacion']);
  }
}



