import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consufin-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Transacción • Detalle</h2>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Comparte con QR</h3>
          <div class="flex items-center gap-6 flex-wrap">
            <img [src]="qrSrc" alt="QR" class="h-40 w-40 border rounded" />
            <div class="text-sm text-gray-700">
              <div class="mb-2">Enlace: <a [href]="transactionLink" class="text-indigo-600 break-all">{{ transactionLink }}</a></div>
              <div class="flex gap-3">
                <a [href]="'mailto:?subject=Transacción%20CONSUFIN&body=' + encodeURIComponent(transactionLink)" class="px-3 py-1.5 border rounded">Email</a>
                <a [href]="'https://wa.me/?text=' + encodeURIComponent(transactionLink)" target="_blank" class="px-3 py-1.5 border rounded">WhatsApp</a>
                <button (click)="copy()" class="px-3 py-1.5 border rounded">Copiar link</button>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Línea de tiempo</h3>
          <ol class="list-decimal ml-5 text-gray-700 space-y-1">
            <li>Acuerdo de términos</li>
            <li>Depósito en custodia (ESCROW)</li>
            <li>Entrega / Evidencias</li>
            <li>Aprobación del comprador</li>
            <li>Liberación de fondos</li>
          </ol>
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
    this.qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(this.transactionLink);
  }
  async copy() {
    try { await navigator.clipboard.writeText(this.transactionLink); } catch {}
  }
}



