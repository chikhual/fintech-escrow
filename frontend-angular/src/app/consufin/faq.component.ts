import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './back-button.component';

@Component({
  selector: 'app-consufin-faq',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <app-back-button />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
        <div class="space-y-4 text-gray-800">
          <div>
            <h3 class="font-semibold">¿Qué es ESCROW?</h3>
            <p>Un tercero mantiene los fondos hasta confirmación bilateral.</p>
          </div>
          <div>
            <h3 class="font-semibold">¿Cómo deposito?</h3>
            <p>Vía transferencia (SPEI) a la cuenta designada en tu transacción.</p>
          </div>
          <div>
            <h3 class="font-semibold">¿Qué pasa si hay disputa?</h3>
            <p>Se activa el periodo de inspección y mediación según términos.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinFaqComponent {}


