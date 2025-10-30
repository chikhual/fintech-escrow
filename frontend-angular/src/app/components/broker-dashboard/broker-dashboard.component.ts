import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-broker-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Panel de Broker</h1>
        <p class="text-gray-600 mt-2">Gestión de operaciones, comisiones y transacciones vinculadas.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Operaciones activas</h2>
          <p class="text-gray-600">0</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Comisiones pendientes</h2>
          <p class="text-gray-600">$0.00</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Alertas</h2>
          <p class="text-gray-600">Sin alertas</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Transacciones vinculadas</h2>
        </div>
        <div class="p-6 text-gray-600">Próximamente: tabla de transacciones con filtros.</div>
      </div>
    </div>
  `,
  styles: []
})
export class BrokerDashboardComponent {}


