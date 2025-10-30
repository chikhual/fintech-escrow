import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consufin-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Transacción • Detalle</h2>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Código QR para compartir</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex items-center gap-6">
              <img [src]="qrSrc" alt="QR" class="h-40 w-40 border rounded" />
              <div class="text-sm text-gray-700">
                <div class="mb-2">Enlace: <a [href]="transactionLink" class="text-indigo-600 break-all">{{ transactionLink }}</a></div>
                <div class="flex gap-3 flex-wrap">
                  <a [href]="'mailto:?subject=Transacción%20CONSUFIN&body=' + encode(transactionLink)" class="px-3 py-1.5 border rounded">Email</a>
                  <a [href]="'https://wa.me/?text=' + encode(transactionLink)" target="_blank" class="px-3 py-1.5 border rounded">WhatsApp</a>
                  <button (click)="copy()" class="px-3 py-1.5 border rounded">Copiar link</button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Modo de QR</label>
              <select class="w-full border rounded px-3 py-2 mb-3" [(ngModel)]="qrMode">
                <option value="public">Público (para brochures/anuncios)</option>
                <option value="restricted">Restringido a correo/teléfono</option>
              </select>
              <div *ngIf="qrMode==='restricted'" class="grid grid-cols-1 gap-3">
                <input class="border rounded px-3 py-2" placeholder="Correo permitido (opcional)" [(ngModel)]="allowedEmail" />
                <input class="border rounded px-3 py-2" placeholder="Teléfono permitido (10 dígitos, opcional)" [(ngModel)]="allowedPhone" />
                <button (click)="regenerateQR()" class="px-3 py-2 bg-indigo-600 text-white rounded">Generar QR restringido</button>
                <p class="text-xs text-gray-500">Solo el propietario del medio podrá abrir el enlace.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Método de distribución del pago</h3>
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Esquema</label>
              <select class="w-full border rounded px-3 py-2" [(ngModel)]="distribution">
                <option>Liquidación total</option>
                <option>Anticipo + liquidación</option>
                <option>Parcialidades</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Referencia SPEI/SWIFT</label>
              <input class="w-full border rounded px-3 py-2" placeholder="CLABE / SWIFT" [(ngModel)]="paymentRef" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Cuenta destino</label>
              <input class="w-full border rounded px-3 py-2" placeholder="Banco / Cuenta" [(ngModel)]="beneficiary" />
            </div>
          </div>
          <div class="mt-4 overflow-x-auto text-sm">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left">Fecha</th>
                  <th class="px-3 py-2 text-left">Concepto</th>
                  <th class="px-3 py-2 text-left">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr *ngFor="let row of schedule">
                  <td class="px-3 py-2">{{ row.date }}</td>
                  <td class="px-3 py-2">{{ row.concept }}</td>
                  <td class="px-3 py-2">{{ row.amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-4">Línea de tiempo</h3>
          <div class="flex items-center justify-between gap-2">
            <ng-container *ngFor="let s of steps; let i = index">
              <div class="flex-1 flex items-center">
                <div class="flex items-center">
                  <div [ngClass]="{
                        'bg-emerald-600 text-white': currentStep > i,
                        'bg-indigo-600 text-white': currentStep === i,
                        'bg-gray-200 text-gray-700': currentStep < i
                      }" class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium"></div>
                  <span class="ml-2 text-sm" [ngClass]="currentStep >= i ? 'text-gray-900' : 'text-gray-500'">{{ s }}</span>
                </div>
                <div *ngIf="i < steps.length - 1" class="h-1 flex-1 mx-2" [ngClass]="currentStep > i ? 'bg-emerald-600' : 'bg-gray-200'"></div>
              </div>
            </ng-container>
          </div>
          <div class="mt-3 text-xs text-gray-600">Paso {{ currentStep + 1 }} de {{ steps.length }}</div>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <button class="px-4 py-2 border rounded">Aceptar / Rechazar</button>
          <button class="px-4 py-2 border rounded">Depositar fondos</button>
          <button class="px-4 py-2 border rounded">Subir evidencia de envío/entrega</button>
          <button class="px-4 py-2 border rounded">Aprobar / Disputar</button>
        </div>

        <div class="bg-gray-50 rounded p-4 text-sm text-gray-700">
          Notificaciones: correo y recordatorios automáticos para acelerar el flujo.
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinTransactionDetailComponent {
  transactionLink = '';
  qrSrc = '';
  qrMode: 'public' | 'restricted' = 'public';
  allowedEmail = '';
  allowedPhone = '';
  distribution = 'Liquidación total';
  paymentRef = '';
  beneficiary = '';
  steps = ['Acuerdo', 'Pago', 'Transferencia/Entrega', 'Inspección', 'Cierre'];
  currentStep = 0;
  schedule = [
    { date: 'Día 0', concept: 'Depósito a custodia', amount: '—' },
    { date: 'Día N', concept: 'Liberación tras aprobación', amount: '—' }
  ];
  constructor() {
    try {
      const raw = sessionStorage.getItem('lastTransaction');
      if (raw) {
        const data = JSON.parse(raw);
        this.transactionLink = data.link || location.href;
      } else {
        this.transactionLink = location.href;
      }
    } catch {
      this.transactionLink = location.href;
    }
    this.qrSrc = this.buildQR(this.transactionLink);
  }
  async copy() {
    try { await navigator.clipboard.writeText(this.transactionLink); } catch {}
  }
  encode(value: string): string { return encodeURIComponent(value); }
  regenerateQR() {
    const url = new URL(this.transactionLink);
    url.searchParams.set('qrMode', this.qrMode);
    if (this.allowedEmail) url.searchParams.set('allowEmail', this.allowedEmail);
    if (this.allowedPhone) url.searchParams.set('allowPhone', this.allowedPhone);
    this.transactionLink = url.toString();
    this.qrSrc = this.buildQR(this.transactionLink);
  }
  buildQR(data: string): string {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(data);
  }
}



