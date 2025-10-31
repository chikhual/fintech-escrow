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

        <!-- Sección hero de Comprador -->
        <div class="overflow-hidden bg-white py-8 sm:py-12">
          <div class="mx-auto max-w-7xl px-0">
            <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div class="lg:pt-2 lg:pr-6">
                <div class="lg:max-w-lg">
                  <h3 class="text-sm font-semibold text-indigo-600">CONSUFIN</h3>
                  <p class="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Herramientas para el Comprador</p>
                  <p class="mt-4 text-base text-gray-700">Gestiona tus compras con custodia, verifica documentación y conserva historial y evidencias en un solo lugar.</p>
                  <dl class="mt-8 max-w-xl space-y-6 text-sm text-gray-700 lg:max-w-none">
                    <div *ngFor="let f of buyerFeatures" class="relative pl-9">
                      <dt class="inline font-semibold text-gray-900">
                        <span class="absolute top-0 left-0 h-5 w-5 text-indigo-600" [ngSwitch]="f.icon">
                          <!-- cloud -->
                          <svg *ngSwitchCase="'cloud'" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                            <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.58-1.37A4.5 4.5 0 1 1 17.5 18H7Z"/>
                            <path d="M12 8v8m0 0 3-3m-3 3-3-3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <!-- lock -->
                          <svg *ngSwitchCase="'lock'" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                            <path d="M6 10a4 4 0 1 1 8 0v2h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h1v-2Z"/>
                            <path d="M8 10a4 4 0 0 1 8 0v2H8v-2Z" fill="#fff" opacity=".3"/>
                          </svg>
                          <!-- server -->
                          <svg *ngSwitchCase="'server'" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                            <rect x="3" y="4" width="18" height="6" rx="2"/>
                            <rect x="3" y="14" width="18" height="6" rx="2"/>
                          </svg>
                        </span>
                        {{ f.name }}
                      </dt>
                      <dd class="inline"> {{ f.description }}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <img alt="Product screenshot" src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png" class="w-full max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 md:-ml-4 lg:-ml-0" />
            </div>
          </div>
        </div>

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
  buyerFeatures = [
    { name: 'Sube y resguarda evidencias', description: 'Carga comprobantes de pago, entrega y documentos en PDF o imagen.', icon: 'cloud' },
    { name: 'Seguridad y cifrado', description: 'Operaciones bajo custodia con verificación de identidad (KYC/AML).', icon: 'lock' },
    { name: 'Historial y respaldos', description: 'Conserva el historial de transacciones y recupera tu información.', icon: 'server' }
  ];
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


