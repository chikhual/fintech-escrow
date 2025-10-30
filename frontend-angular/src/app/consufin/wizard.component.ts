import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consufin-wizard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Nueva transacción</h2>

        <div class="bg-white rounded-xl shadow p-6 space-y-6">
          <div class="grid md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Rol</label>
              <select class="w-full border rounded px-3 py-2" [(ngModel)]="role" [ngModelOptions]="{standalone: true}">
                <option>Comprador</option>
                <option>Vendedor</option>
                <option>Broker</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Moneda</label>
              <select class="w-full border rounded px-3 py-2" [(ngModel)]="currency" [ngModelOptions]="{standalone: true}">
                <option>Dolar USA</option>
                <option>Dolar CAN</option>
                <option>Libra UK</option>
                <option>Peso MX</option>
                <option>Euro EUR</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Días de inspección</label>
              <input type="number" min="5" class="w-full border rounded px-3 py-2" [(ngModel)]="inspectionDays" [ngModelOptions]="{standalone: true}" />
              <p class="text-xs text-gray-500 mt-1">Mínimo 5 días.</p>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Quién paga comisión</label>
              <select class="w-full border rounded px-3 py-2" [(ngModel)]="feePayer" [ngModelOptions]="{standalone: true}">
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
              <select class="w-full border rounded px-3 py-2" [(ngModel)]="category" [ngModelOptions]="{standalone: true}">
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
              <input type="number" class="w-full border rounded px-3 py-2" [(ngModel)]="amount" [ngModelOptions]="{standalone: true}" />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Nombre / Título</label>
              <input class="w-full border rounded px-3 py-2" [(ngModel)]="title" [ngModelOptions]="{standalone: true}" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Descripción</label>
              <input class="w-full border rounded px-3 py-2" [(ngModel)]="description" [ngModelOptions]="{standalone: true}" />
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
              <input class="w-full border rounded px-3 py-2" placeholder="correo@dominio.com" [(ngModel)]="counterpartyEmail" [ngModelOptions]="{standalone: true}" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Teléfono (10 dígitos MX)</label>
              <input class="w-full border rounded px-3 py-2" placeholder="55XXXXXXXX" [(ngModel)]="counterpartyPhone" [ngModelOptions]="{standalone: true}" />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input id="terms" type="checkbox" class="h-4 w-4" [(ngModel)]="accepted" [ngModelOptions]="{standalone: true}" />
            <label for="terms" class="text-sm text-gray-700">Acepto Términos, Instrucciones de CONSUFIN y Aviso de Privacidad.</label>
          </div>

          <div class="flex justify-end gap-3">
            <a routerLink="/consufin" class="px-4 py-2 border rounded">Cancelar</a>
            <button (click)="create()" [disabled]="!isValid()" class="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed">Crear transacción</button>
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
export class ConsufinWizardComponent {
  constructor(private router: Router) {}
  role = '';
  currency = '';
  inspectionDays: number | null = 5;
  feePayer = '';
  category = '';
  amount: number | null = null;
  title = '';
  description = '';
  counterpartyEmail = '';
  counterpartyPhone = '';
  accepted = false;

  isValid(): boolean {
    const emailOk = /.+@.+\..+/.test(this.counterpartyEmail);
    const phoneOk = /^\d{10}$/.test(this.counterpartyPhone);
    return !!this.role && !!this.currency && !!this.feePayer && !!this.category &&
      !!this.title && !!this.description && emailOk && phoneOk &&
      this.accepted && (this.amount ?? 0) > 0 && (this.inspectionDays ?? 0) >= 5;
  }

  create(): void {
    if (!this.isValid()) return;
    const transactionId = `TX-${Date.now()}`;
    const link = `${location.origin}/consufin/transaccion/preview?id=${transactionId}`;
    const payload = {
      id: transactionId,
      role: this.role,
      currency: this.currency,
      inspectionDays: this.inspectionDays,
      feePayer: this.feePayer,
      category: this.category,
      amount: this.amount,
      title: this.title,
      description: this.description,
      counterpartyEmail: this.counterpartyEmail,
      counterpartyPhone: this.counterpartyPhone,
      link
    };
    try { sessionStorage.setItem('lastTransaction', JSON.stringify(payload)); } catch {}
    this.router.navigate(['/consufin/transaccion/preview']);
  }
}



