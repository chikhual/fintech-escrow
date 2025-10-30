import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consufin-help',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Ayuda</h2>
        <p class="text-gray-700">Escríbenos o consulta la sección de preguntas frecuentes.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinHelpComponent {}


