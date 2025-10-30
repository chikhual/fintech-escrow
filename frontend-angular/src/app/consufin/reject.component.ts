import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consufin-reject',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow p-8 max-w-lg w-full text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Transacción rechazada</h2>
        <p class="text-gray-700 mb-4">Hemos registrado tu rechazo. Un asesor de CONSUFIN revisará la operación y se pondrá en contacto.</p>
        <a href="/consufin" class="px-4 py-2 bg-indigo-600 text-white rounded">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinRejectComponent {}


