import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackButtonComponent } from './back-button.component';

@Component({
  selector: 'app-consufin-transaction-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <app-back-button />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Transacción • Acciones</h2>

        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-4">Línea de tiempo</h3>
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 flex items-center" *ngFor="let s of steps; let i = index">
              <div class="flex items-center">
                <div [ngClass]="{
                      'bg-emerald-600 text-white': currentStep > i,
                      'bg-indigo-600 text-white': currentStep === i,
                      'bg-gray-200 text-gray-700': currentStep < i
                    }" class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium">{{ i+1 }}</div>
                <span class="ml-2 text-sm" [ngClass]="currentStep >= i ? 'text-gray-900' : 'text-gray-500'">{{ s }}</span>
              </div>
              <div *ngIf="i < steps.length - 1" class="h-1 flex-1 mx-2" [ngClass]="currentStep > i ? 'bg-emerald-600' : 'bg-gray-200'"></div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <button *ngIf="isBuyer"
                  (click)="openAcceptReject()"
                  [ngClass]="{
                    'bg-emerald-600 text-white': decision==='accepted',
                    'bg-red-600 text-white': decision==='rejected',
                    'bg-gray-100 text-gray-800': !decision
                  }"
                  class="px-4 py-3 border rounded">Aceptar / Rechazar</button>
          <button [disabled]="!accepted"
                  (click)="deposit()"
                  class="px-4 py-3 border rounded disabled:opacity-50"
                  [ngClass]="{'bg-gray-100 text-gray-800': true}">Depositar fondos</button>
          <button *ngIf="isSeller"
                  (click)="openUpload('envio')"
                  [ngClass]="evidenceEnvio>0 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'"
                  class="px-4 py-3 border rounded">Subir evidencia de envío</button>
          <button (click)="openUpload('entrega')"
                  [ngClass]="evidenceEntrega>0 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'"
                  class="px-4 py-3 border rounded">Subir evidencia de entrega</button>
          <button *ngIf="deliveryConfirmed" (click)="openApproveDispute()" 
                  [ngClass]="{
                    'bg-emerald-600 text-white': approved,
                    'bg-red-600 text-white': disputed,
                    'bg-gray-100 text-gray-800': !approved && !disputed
                  }"
                  class="px-4 py-3 border rounded md:col-span-2">Aprobar / Disputar</button>
        </div>

        <div class="flex justify-end">
          <a [class.opacity-50]="!canContinue" [class.pointer-events-none]="!canContinue" routerLink="/consufin/transaccion/preview#details" class="px-4 py-2 bg-indigo-600 text-white rounded">Continuar a distribución</a>
        </div>

        <!-- Modal: Subir evidencia -->
        <div *ngIf="showUpload" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow p-6 w-full max-w-md">
            <h3 class="font-semibold text-gray-900 mb-3">Subir evidencia de {{ uploadType==='envio' ? 'envío' : 'entrega' }}</h3>
            <input type="file" (change)="onFiles($event)" accept="image/*,.pdf" multiple class="mb-3" />
            <p class="text-xs text-gray-600 mb-2">Puedes subir de 1 a 5 archivos (imágenes o PDF).</p>
            <textarea class="w-full border rounded px-3 py-2 mb-4" rows="3" placeholder="Notas"></textarea>
            <div class="flex justify-end gap-3">
              <button (click)="closeModals()" class="px-4 py-2 border rounded">Cancelar</button>
              <button (click)="confirmUpload()" class="px-4 py-2 bg-emerald-600 text-white rounded">Guardar</button>
            </div>
          </div>
        </div>

        <!-- Modal: Aceptar/Rechazar -->
        <div *ngIf="showAcceptReject" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow p-6 w-full max-w-md">
            <h3 class="font-semibold text-gray-900 mb-4">Confirmar operación</h3>
            <p class="text-sm text-gray-600 mb-4">¿Se efectuó de forma satisfactoria?</p>
            <div class="flex justify-end gap-3">
              <button (click)="reject()" class="px-4 py-2 border rounded">Rechazar</button>
              <button (click)="accept()" class="px-4 py-2 bg-emerald-600 text-white rounded">Aceptar</button>
            </div>
          </div>
        </div>

        <!-- Modal: Aprobar/Disputar -->
        <div *ngIf="showApproveDispute" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow p-6 w-full max-w-md">
            <h3 class="font-semibold text-gray-900 mb-4">Revisión de entrega</h3>
            <div class="flex justify-end gap-3">
              <button (click)="dispute()" class="px-4 py-2 border rounded">Disputar</button>
              <button (click)="approve()" class="px-4 py-2 bg-emerald-600 text-white rounded">Aprobar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConsufinTransactionActionsComponent {
  // Orden solicitado
  steps = ['Acuerdo', 'Envío', 'Inspección', 'Pago', 'Cierre'];
  currentStep = 0;
  role: 'Comprador' | 'Vendedor' | 'Broker' = 'Comprador';
  get isBuyer() { return this.role === 'Comprador'; }
  get isSeller() { return this.role === 'Vendedor'; }

  showUpload = false;
  uploadType: 'envio' | 'entrega' = 'entrega';
  showAcceptReject = false;
  showApproveDispute = false;

  accepted = false;
  deposited = false;
  deliveryConfirmed = false;
  decision: 'accepted' | 'rejected' | '' = '';
  evidenceEnvio = 0;
  evidenceEntrega = 0;
  approved = false;
  disputed = false;
  
  get canContinue(): boolean {
    return this.deposited || this.approved;
  }

  constructor() {
    try {
      const raw = sessionStorage.getItem('lastTransaction');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.role) this.role = data.role;
      }
    } catch {}
  }

  openUpload(type: 'envio' | 'entrega') {
    this.uploadType = type;
    this.showUpload = true;
  }
  confirmUpload() {
    this.showUpload = false;
    if (this.uploadType === 'envio') { this.currentStep = Math.max(this.currentStep, 1); if (this.tempFilesCount>0) this.evidenceEnvio = this.tempFilesCount; }
    if (this.uploadType === 'entrega') { this.deliveryConfirmed = true; this.currentStep = Math.max(this.currentStep, 2); if (this.tempFilesCount>0) this.evidenceEntrega = this.tempFilesCount; }
    this.tempFilesCount = 0;
  }
  openAcceptReject() { this.showAcceptReject = true; }
  accept() { this.accepted = true; this.decision = 'accepted'; this.showAcceptReject = false; this.currentStep = Math.max(this.currentStep, 3); }
  reject() { this.decision = 'rejected'; this.showAcceptReject = false; location.assign('/consufin/transaccion/rechazo'); }
  deposit() { this.deposited = true; this.currentStep = Math.max(this.currentStep, 3); }
  openApproveDispute() { this.showApproveDispute = true; }
  approve() { 
    this.approved = true; 
    this.disputed = false;
    this.showApproveDispute = false; 
    this.currentStep = Math.max(this.currentStep, 4); 
  }
  dispute() { 
    this.disputed = true;
    this.approved = false;
    this.showApproveDispute = false; 
    location.assign('/consufin/transaccion/disputa'); 
  }
  closeModals() { this.showUpload = this.showAcceptReject = this.showApproveDispute = false; }

  tempFilesCount = 0;
  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.tempFilesCount = Math.min(Math.max(files.length, 0), 5);
  }
}


