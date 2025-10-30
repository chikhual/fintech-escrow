import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './back-button.component';

@Component({
  selector: 'app-consufin-integrations',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <app-back-button />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Integraciones</h2>
        <p class="text-gray-700">(Demo) Webhooks, API REST, notificaciones por correo/SMS.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinIntegrationsComponent {}


