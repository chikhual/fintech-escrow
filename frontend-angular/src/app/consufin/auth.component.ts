import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consufin-auth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-xl shadow w-full max-w-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Crear cuenta en CONSUFIN</h2>
        <p class="text-gray-600 mb-6">Selecciona tu tipo de persona y registra tus datos.</p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <button class="px-3 py-2 border rounded bg-indigo-50 border-indigo-200 text-indigo-700">Persona Física</button>
          <button class="px-3 py-2 border rounded">Persona Moral</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Correo electrónico</label>
            <input type="email" class="w-full border rounded px-3 py-2" placeholder="tucorreo@dominio.com" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Contraseña</label>
            <input type="password" class="w-full border rounded px-3 py-2" placeholder="Mínimo 7 caracteres" />
            <p class="text-xs text-gray-500 mt-1">Debe incluir minúsculas, mayúsculas y número o caracter especial.</p>
          </div>
          <button class="w-full px-4 py-2 bg-emerald-600 text-white rounded">Registrarme</button>
          <p class="text-xs text-gray-500">Se enviará correo de verificación (2 pasos).</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinAuthComponent {}



