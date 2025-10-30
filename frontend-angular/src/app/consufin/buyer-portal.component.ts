import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from './back-button.component';

type BuyerTab = 'Dashboard' | 'Transacciones' | 'Documentos' | 'Administración';

@Component({
  selector: 'app-buyer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <app-back-button />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Portal del Comprador</h2>

        <div class="flex gap-2 mb-6">
          <button (click)="tab='Dashboard'" [ngClass]="tab==='Dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Dashboard</button>
          <button (click)="tab='Transacciones'" [ngClass]="tab==='Transacciones' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Transacciones</button>
          <button (click)="tab='Documentos'" [ngClass]="tab==='Documentos' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Documentos</button>
          <button (click)="tab='Administración'" [ngClass]="tab==='Administración' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'" class="px-3 py-1.5 rounded">Administración</button>
        </div>

        <!-- DASHBOARD -->
        <div *ngIf="tab==='Dashboard'">
          <div class="grid md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 border rounded p-4">
              <div class="text-sm text-gray-500">Compras (monto)</div>
              <div class="text-2xl font-bold text-gray-900">{{ totalAmount | number:'1.2-2' }}</div>
            </div>
            <div class="bg-gray-50 border rounded p-4">
              <div class="text-sm text-gray-500">Número de transacciones</div>
              <div class="text-2xl font-bold text-gray-900">{{ transactions.length }}</div>
            </div>
            <div class="bg-gray-50 border rounded p-4">
              <div class="text-sm text-gray-500">Calificación</div>
              <div class="text-2xl font-bold text-gray-900">{{ rating | number:'1.1-1' }}/5</div>
              <p class="text-xs text-gray-500">Calificada por vendedores al cierre.</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">Resumen de actividad reciente del comprador.</p>
        </div>

        <!-- TRANSACCIONES -->
        <div *ngIf="tab==='Transacciones'">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-left">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2">Estatus</th>
                  <th class="px-3 py-2">Monto</th>
                  <th class="px-3 py-2">Fecha</th>
                  <th class="px-3 py-2">Vendedor</th>
                  <th class="px-3 py-2">Categoría</th>
                  <th class="px-3 py-2">Descripción</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr *ngFor="let t of transactions">
                  <td class="px-3 py-2">{{ t.status }}</td>
                  <td class="px-3 py-2">{{ t.amount | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td class="px-3 py-2">{{ t.date }}</td>
                  <td class="px-3 py-2">{{ t.seller }}</td>
                  <td class="px-3 py-2">{{ t.category }}</td>
                  <td class="px-3 py-2">
                    <span class="underline decoration-dotted cursor-help" [title]="t.description">Ver</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- DOCUMENTOS -->
        <div *ngIf="tab==='Documentos'" class="space-y-4 text-sm">
          <div class="grid md:grid-cols-2 gap-4">
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

        <!-- ADMINISTRACIÓN -->
        <div *ngIf="tab==='Administración'" class="space-y-4">
          <h3 class="font-semibold text-gray-900">Administración de información</h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <label class="block">Información Personal<textarea [(ngModel)]="personalInfo" rows="3" class="mt-1 w-full border rounded px-3 py-2"></textarea></label>
            <label class="block">Información Bancaria<textarea [(ngModel)]="bankInfo" rows="3" class="mt-1 w-full border rounded px-3 py-2"></textarea></label>
            <label class="block">Información Empresa<textarea [(ngModel)]="companyInfo" rows="3" class="mt-1 w-full border rounded px-3 py-2" placeholder="Solo si compra como empresa"></textarea></label>
            <label class="block">Información Extra<textarea [(ngModel)]="extraInfo" rows="3" class="mt-1 w-full border rounded px-3 py-2"></textarea></label>
          </div>
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
export class BuyerPortalComponent {
  tab: BuyerTab = 'Dashboard';
  transactions = this.getTransactions();
  get totalAmount(): number { return this.transactions.reduce((s, t) => s + (t.amount || 0), 0); }
  rating = 4.6;
  personalInfo = '';
  bankInfo = '';
  companyInfo = '';
  extraInfo = '';
  savedMsg = '';

  onPick(key: string, ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files).slice(0, 5).map(f => ({ name: f.name, size: f.size })) : [];
    try {
      const prev = JSON.parse(sessionStorage.getItem('buyerUploads') || '{}');
      prev[key] = files;
      sessionStorage.setItem('buyerUploads', JSON.stringify(prev));
    } catch {}
  }

  save() {
    try {
      const obj = { personalInfo: this.personalInfo, bankInfo: this.bankInfo, companyInfo: this.companyInfo, extraInfo: this.extraInfo };
      sessionStorage.setItem('buyerAdmin', JSON.stringify(obj));
      this.savedMsg = 'Información guardada localmente (demo).';
      setTimeout(() => this.savedMsg = '', 3000);
    } catch {}
  }

  getTransactions() {
    // demo: obtiene la última transacción o algunas simuladas
    try {
      const last = sessionStorage.getItem('lastTransaction');
      const base = last ? [JSON.parse(last)] : [];
      const mocks = [
        { status: 'En inspección', amount: 1200, date: '2025-10-30', seller: 'ACME Autos', category: 'Bienes muebles', description: 'Compra de refacciones' },
        { status: 'Cerrada', amount: 300, date: '2025-10-21', seller: 'Servicios MX', category: 'Servicios', description: 'Servicio de instalación' }
      ];
      return [...base, ...mocks];
    } catch { return []; }
  }
}


