import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consufin-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Mis transacciones</h2>
        <p class="text-gray-600 mb-4">Historial y estado de operaciones en ESCROW.</p>
        <div class="border rounded p-4 text-gray-700">(Demo) No hay transacciones aún.</div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinListComponent {}


