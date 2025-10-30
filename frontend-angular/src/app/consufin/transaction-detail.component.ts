import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consufin-transaction-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Transacción • Detalle</h2>

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
export class ConsufinTransactionDetailComponent {}



