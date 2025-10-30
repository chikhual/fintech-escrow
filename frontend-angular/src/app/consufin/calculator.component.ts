import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consufin-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Calculadora de costos</h2>
        <div class="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Monto</label>
            <input type="number" class="w-full border rounded px-3 py-2" [(ngModel)]="amount" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Moneda</label>
            <select class="w-full border rounded px-3 py-2" [(ngModel)]="currency">
              <option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Quién paga</label>
            <select class="w-full border rounded px-3 py-2" [(ngModel)]="payer">
              <option>Buyer</option><option>Seller</option><option>50% - 50%</option>
            </select>
          </div>
        </div>
        <div class="bg-gray-50 rounded p-4 text-gray-800">
          <p>Comisión estimada: {{ fee | number:'1.2-2' }} {{ currency }}</p>
          <p class="text-sm text-gray-600">(Demostrativo)</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConsufinCalculatorComponent {
  amount = 1000;
  currency = 'USD';
  payer = 'Buyer';
  get fee(): number {
    const base = this.amount * 0.025 + 5; // demo
    return Math.max(base, 10);
  }
}



