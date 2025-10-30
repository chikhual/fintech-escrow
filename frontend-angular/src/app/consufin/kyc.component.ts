import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consufin-kyc',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Validación KYC/AML</h2>
        <ul class="list-disc ml-6 text-gray-700 space-y-1">
          <li>CURP</li>
          <li>INE vigente</li>
          <li>RFC</li>
          <li>Teléfono (10 dígitos MX)</li>
          <li>Ubicación (GPS)</li>
          <li>Domicilio</li>
          <li>Documentos extra: banco, CFDI, comprobante domicilio</li>
        </ul>
        <p class="mt-4 text-sm text-gray-600">(Demo) Flujos conectarán con proveedor KYC.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinKycComponent {}


