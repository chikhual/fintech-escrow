import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from './back-button.component';

@Component({
  selector: 'app-consufin-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <app-back-button />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Calculadora de costos</h2>
        <div class="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Monto</label>
            <input type="number" class="w-full border rounded px-3 py-2" [(ngModel)]="amount" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Moneda</label>
            <select class="w-full border rounded px-3 py-2" [(ngModel)]="currency">
              <option>Dolar USA</option>
              <option>Dolar CAN</option>
              <option>Libra UK</option>
              <option>Peso MX</option>
              <option>Euro EUR</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Quién paga</label>
            <select class="w-full border rounded px-3 py-2" [(ngModel)]="payer">
              <option>Comprador</option>
              <option>Vendedor</option>
              <option>50% - 50%</option>
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
  currency = 'Dolar USA';
  payer = 'Comprador';
  // Tabla de comisiones (demo): por tramo de monto
  private computeFeeTotal(amount: number): number {
    // Estructura basada en la tabla (tarifa Standard)
    // Tramos en USD; para demo aplicamos mismos porcentajes a otras monedas.
    const tiers = [
      { upTo: 5000, rate: 0.026, min: 50 },
      { upTo: 50000, rate: 0.024, min: 130 },
      { upTo: 200000, rate: 0.019, min: 1200 },
      { upTo: 500000, rate: 0.015, min: 3800 },
      { upTo: 1000000, rate: 0.012, min: 7500 },
      { upTo: 3000000, rate: 0.010, min: 12000 },
      { upTo: 5000000, rate: 0.0095, min: 30000 },
      { upTo: 10000000, rate: 0.009, min: 47500 },
      { upTo: Infinity, rate: 0.007, min: 0 },
    ];
    const tier = tiers.find(t => amount <= t.upTo)!;
    const fee = amount * tier.rate;
    return Math.max(fee, tier.min);
  }
  get feeTotal(): number {
    return this.computeFeeTotal(this.amount || 0);
  }
  get fee(): number {
    // Si es 50%-50%, mostramos lo que pagaría cada parte (50% del total)
    if (this.payer === '50% - 50%') return this.feeTotal / 2;
    return this.feeTotal;
  }
}



