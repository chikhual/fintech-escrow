import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consufin-transaction-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Transacción • Acciones</h2>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-4">Línea de tiempo</h3>
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 flex items-center" *ngFor="let s of steps; let i = index">
              <div class="flex items-center">
                <div [ngClass]="{
                      'bg-emerald-600 text-white': currentStep > i,
                      'bg-indigo-600 text-white': currentStep === i,
                      'bg-gray-200 text-gray-700': currentStep < i
                    }" class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium">{{ i+1 }}</div>
                <span class="ml-2 text-sm" [ngClass]="currentStep >= i ? 'text-gray-900' : 'text-gray-500'">{{ s }}</span>
              </div>
              <div *ngIf="i < steps.length - 1" class="h-1 flex-1 mx-2" [ngClass]="currentStep > i ? 'bg-emerald-600' : 'bg-gray-200'"></div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <button class="px-4 py-3 border rounded">Aceptar / Rechazar</button>
          <button class="px-4 py-3 border rounded">Depositar fondos</button>
          <button class="px-4 py-3 border rounded">Subir evidencia de envío/entrega</button>
          <button class="px-4 py-3 border rounded">Aprobar / Disputar</button>
        </div>

        <div class="flex justify-end">
          <a routerLink="/consufin/transaccion/preview#details" class="px-4 py-2 bg-indigo-600 text-white rounded">Continuar a distribución</a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinTransactionActionsComponent {
  steps = ['Acuerdo', 'Pago', 'Transferencia/Entrega', 'Inspección', 'Cierre'];
  currentStep = 0;
}


