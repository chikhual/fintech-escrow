import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from './back-button.component';

type RoleTab = 'Vendedor' | 'Comprador' | 'Broker' | 'Asesor';

@Component({
  selector: 'app-consufin-role-center',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <app-back-button />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Centro de Roles</h2>

        <div class="flex gap-2 mb-6">
          <button (click)="tab='Vendedor'" [ngClass]="tab==='Vendedor' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Vendedor</button>
          <button (click)="tab='Comprador'" [ngClass]="tab==='Comprador' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Comprador</button>
          <button (click)="tab='Broker'" [ngClass]="tab==='Broker' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Broker</button>
          <button (click)="tab='Asesor'" [ngClass]="tab==='Asesor' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Asesor</button>
        </div>

        <!-- VENDEDOR -->
        <div *ngIf="tab==='Vendedor'" class="space-y-4">
          <h3 class="font-semibold text-gray-900">Documentos del Vendedor</h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <label class="block">Avalúo<input type="file" (change)="onPick('seller_avaluo',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Confirmación de propiedad<input type="file" (change)="onPick('seller_propiedad',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Acta constitutiva (si aplica)<input type="file" (change)="onPick('seller_acta',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Libre de gravamen<input type="file" (change)="onPick('seller_gravamen',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Especificaciones técnicas<input type="file" (change)="onPick('seller_specs',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Contrato<input type="file" (change)="onPick('seller_contrato',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Documentos legales<input type="file" (change)="onPick('seller_legales',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Imágenes<input type="file" (change)="onPick('seller_imagenes',$event)" class="mt-1 block w-full" accept="image/*" multiple></label>
            <label class="block md:col-span-2">Cuenta bancaria<input type="text" [(ngModel)]="sellerAccount" placeholder="Banco / Cuenta / CLABE" class="mt-1 w-full border rounded px-3 py-2"></label>
          </div>
          <div class="flex justify-end">
            <button (click)="save()" class="px-4 py-2 bg-emerald-600 text-white rounded">Guardar</button>
          </div>
        </div>

        <!-- COMPRADOR -->
        <div *ngIf="tab==='Comprador'" class="space-y-4">
          <h3 class="font-semibold text-gray-900">Documentos del Comprador</h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <label class="block">Cuenta bancaria / Comprobantes de ingresos<input type="file" (change)="onPick('buyer_ingresos',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">CURP<input type="file" (change)="onPick('buyer_curp',$event)" class="mt-1 block w-full" accept="image/*,.pdf"></label>
            <label class="block">Acta constitutiva (si compra empresa)<input type="file" (change)="onPick('buyer_acta',$event)" class="mt-1 block w-full" accept="image/*,.pdf"></label>
            <label class="block">Contrato<input type="file" (change)="onPick('buyer_contrato',$event)" class="mt-1 block w-full" accept="image/*,.pdf"></label>
            <label class="block">Documentos legales<input type="file" (change)="onPick('buyer_legales',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
          </div>
          <div class="flex justify-end">
            <button (click)="save()" class="px-4 py-2 bg-emerald-600 text-white rounded">Guardar</button>
          </div>
        </div>

        <!-- BROKER -->
        <div *ngIf="tab==='Broker'" class="space-y-4">
          <h3 class="font-semibold text-gray-900">Documentación Broker (ambas partes)</h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <label class="block">Acta constitutiva<input type="file" (change)="onPick('broker_acta',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Certificación libre de gravamen<input type="file" (change)="onPick('broker_gravamen',$event)" class="mt-1 block w-full" accept="image/*,.pdf"></label>
            <label class="block">Especificaciones técnicas<input type="file" (change)="onPick('broker_specs',$event)" class="mt-1 block w-full" accept="image/*,.pdf" multiple></label>
            <label class="block">Contrato<input type="file" (change)="onPick('broker_contrato',$event)" class="mt-1 block w-full" accept="image/*,.pdf"></label>
            <label class="block">Imágenes<input type="file" (change)="onPick('broker_imagen',$event)" class="mt-1 block w-full" accept="image/*" multiple></label>
            <label class="block">Cuentas bancarias<input type="file" (change)="onPick('broker_cuentas',$event)" class="mt-1 block w-full" accept="image/*,.pdf"></label>
            <label class="block md:col-span-2">Fechas y requisitos<textarea [(ngModel)]="brokerPlan" rows="3" class="mt-1 w-full border rounded px-3 py-2" placeholder="Fechas clave, procedimientos y criterios de cierre"></textarea></label>
          </div>
          <div class="flex justify-end">
            <button (click)="save()" class="px-4 py-2 bg-emerald-600 text-white rounded">Guardar</button>
          </div>
        </div>

        <!-- ASESOR -->
        <div *ngIf="tab==='Asesor'" class="space-y-4">
          <h3 class="font-semibold text-gray-900">Funciones del Asesor</h3>
          <ul class="list-disc ml-5 text-sm text-gray-700">
            <li>Revisar información y documentos de comprador/vendedor</li>
            <li>Revisar términos de negociación y pago</li>
            <li>Comunicación conjunta y privada con ambas partes</li>
            <li>Evaluar personas, contratos y procesos</li>
            <li>Prestar servicio de resguardo para bienes intangibles</li>
            <li>Asegurar ingreso del monto del comprador y pago al vendedor</li>
          </ul>
          <label class="block text-sm">Notas del Asesor<textarea [(ngModel)]="advisorNotes" rows="3" class="mt-1 w-full border rounded px-3 py-2" placeholder="Resumen de observaciones"></textarea></label>
          <div class="flex justify-end">
            <button (click)="save()" class="px-4 py-2 bg-emerald-600 text-white rounded">Guardar</button>
          </div>
        </div>

        <p *ngIf="savedMsg" class="mt-4 text-sm text-emerald-700">{{ savedMsg }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class RoleCenterComponent {
  tab: RoleTab = 'Vendedor';
  sellerAccount = '';
  brokerPlan = '';
  advisorNotes = '';
  savedMsg = '';

  onPick(key: string, ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files).slice(0, 5).map(f => ({ name: f.name, size: f.size })) : [];
    try {
      const prev = JSON.parse(sessionStorage.getItem('roleUploads') || '{}');
      prev[key] = files;
      sessionStorage.setItem('roleUploads', JSON.stringify(prev));
    } catch {}
  }

  save() {
    try {
      const prev = JSON.parse(sessionStorage.getItem('roleUploads') || '{}');
      prev['sellerAccount'] = this.sellerAccount;
      prev['brokerPlan'] = this.brokerPlan;
      prev['advisorNotes'] = this.advisorNotes;
      sessionStorage.setItem('roleUploads', JSON.stringify(prev));
      this.savedMsg = 'Información guardada localmente (demo).';
      setTimeout(() => this.savedMsg = '', 3000);
    } catch {
      this.savedMsg = 'No fue posible guardar (demo).';
    }
  }
}


