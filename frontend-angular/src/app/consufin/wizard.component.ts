import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consufin-wizard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Nueva transacción</h2>

        <div class="bg-white rounded-xl shadow p-6 space-y-6">
          <div class="grid md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Rol</label>
              <select class="w-full border rounded px-3 py-2">
                <option>Comprador</option>
                <option>Vendedor</option>
                <option>Broker</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Moneda</label>
              <select class="w-full border rounded px-3 py-2">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>AUD</option>
                <option>CAD</option>
                <option>Peso MX</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Días de inspección</label>
              <input type="number" min="5" class="w-full border rounded px-3 py-2" value="5" />
              <p class="text-xs text-gray-500 mt-1">Mínimo 5 días.</p>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Quién paga comisión</label>
              <select class="w-full border rounded px-3 py-2">
                <option>Comprador</option>
                <option>Vendedor</option>
                <option>50% - 50%</option>
                <option>Personalizar</option>
              </select>
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm text-gray-700 mb-1">Categoría</label>
              <select class="w-full border rounded px-3 py-2">
                <option>Bienes muebles</option>
                <option>Bienes inmuebles</option>
                <option>Productos</option>
                <option>Servicios (intangible)</option>
                <option>Propiedad intelectual (intangible)</option>
                <option>Dominios (intangible)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Monto</label>
              <input type="number" class="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Nombre / Título</label>
              <input class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Descripción</label>
              <input class="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div class="border-t pt-4">
            <h3 class="font-semibold text-gray-900 mb-2">Resumen</h3>
            <ul class="text-gray-700 text-sm">
              <li>Subtotal: —</li>
              <li>Comisión ESCROW: —</li>
              <li>Precio comprador / Proceeds vendedor: —</li>
            </ul>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Email contraparte</label>
              <input class="w-full border rounded px-3 py-2" placeholder="correo@dominio.com" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Teléfono (10 dígitos MX)</label>
              <input class="w-full border rounded px-3 py-2" placeholder="55XXXXXXXX" />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input id="terms" type="checkbox" class="h-4 w-4" />
            <label for="terms" class="text-sm text-gray-700">Acepto Términos, Instrucciones de ESCROW y Aviso de Privacidad.</label>
          </div>

          <div class="flex justify-end gap-3">
            <a routerLink="/consufin" class="px-4 py-2 border rounded">Cancelar</a>
            <a routerLink="/consufin/transaccion/preview" class="px-4 py-2 bg-indigo-600 text-white rounded">Crear transacción</a>
          </div>
        </div>

        <div class="mt-6 text-sm text-gray-600">
          <p>Opcional: Generar QR público o QR ligado a teléfono/correo (acceso restringido).</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinWizardComponent {}



