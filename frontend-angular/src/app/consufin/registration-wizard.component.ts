import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackButtonComponent } from './back-button.component';
import { AuthService, RegisterRequest } from '../services/auth.service';

type RegistrationStep = 1 | 2 | 3 | 4;
type UserType = 'client' | 'broker';
type PersonType = 'fisica' | 'moral';

@Component({
  selector: 'app-registration-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8">
        <app-back-button />
        
        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Paso {{ currentStep }} de 4</span>
            <span class="text-sm text-gray-500">{{ progressPercent }}% Completo</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                 [style.width.%]="progressPercent"></div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {{ successMessage }}
        </div>

        <!-- STEP 1: Información Básica -->
        <div *ngIf="currentStep === 1">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">📝 Registro {{ userType === 'broker' ? 'Broker' : 'Cliente' }} - Información Básica</h2>
          <p class="text-gray-600 mb-6">Paso 1 de 4</p>

          <div class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                📧 Correo Electrónico *
              </label>
              <div class="flex gap-2">
                <input 
                  type="email" 
                  [(ngModel)]="step1.email" 
                  class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ejemplo@correo.com"
                  [class.border-red-300]="step1.email && !isValidEmail(step1.email)" />
                <button 
                  (click)="verifyEmail()"
                  [disabled]="!isValidEmail(step1.email) || emailVerifying"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                  {{ emailVerified ? '✅ Verificado' : (emailVerifying ? 'Verificando...' : 'Verificar') }}
                </button>
              </div>
              <p *ngIf="step1.email && isValidEmail(step1.email)" class="text-xs text-green-600 mt-1">
                ✅ Formato válido
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">🔒 Contraseña *</label>
              <input 
                type="password" 
                [(ngModel)]="step1.password" 
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••••••••••" />
              <div class="mt-2 space-y-1 text-xs">
                <p [ngClass]="step1.password.length >= 8 ? 'text-green-600' : 'text-gray-400'">
                  ✓ Mínimo 8 caracteres
                </p>
                <p [ngClass]="hasUpperCase(step1.password) ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos 1 mayúscula
                </p>
                <p [ngClass]="hasLowerCase(step1.password) ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos 1 minúscula
                </p>
                <p [ngClass]="hasNumber(step1.password) ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos 1 número
                </p>
                <p [ngClass]="hasSpecialChar(step1.password) ? 'text-green-600' : 'text-gray-400'">
                  ✓ Al menos 1 carácter especial
                </p>
              </div>
              <div class="mt-2">
                <span class="text-xs text-gray-600">Fortaleza: </span>
                <span class="text-xs font-medium" [ngClass]="getPasswordStrength().color">
                  {{ getPasswordStrength().text }}
                </span>
                <div class="mt-1 flex gap-1">
                  <div *ngFor="let i of [1,2,3,4,5]" 
                       class="h-1 flex-1 rounded"
                       [ngClass]="i <= getPasswordStrength().level ? getPasswordStrength().barColor : 'bg-gray-200'">
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">🔒 Confirmar Contraseña *</label>
              <input 
                type="password" 
                [(ngModel)]="step1.confirmPassword" 
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                [class.border-red-300]="step1.confirmPassword && step1.password !== step1.confirmPassword" />
              <p *ngIf="step1.confirmPassword && step1.password !== step1.confirmPassword" 
                 class="text-xs text-red-600 mt-1">
                ❌ Las contraseñas no coinciden
              </p>
            </div>

            <!-- Person Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">🏢 Tipo de Persona *</label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  (click)="step1.personType = 'fisica'"
                  [ngClass]="step1.personType === 'fisica' 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-700 border-gray-300'"
                  class="px-4 py-3 border-2 rounded-lg font-medium transition">
                  Persona Física
                </button>
                <button 
                  (click)="step1.personType = 'moral'"
                  [ngClass]="step1.personType === 'moral' 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-700 border-gray-300'"
                  class="px-4 py-3 border-2 rounded-lg font-medium transition">
                  Persona Moral (Empresa)
                </button>
              </div>
            </div>

            <!-- Usage Intent -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">🎯 Uso Principal de la Plataforma</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="step1.usageIntent.comprar" class="rounded" />
                  <span>Comprar productos/servicios</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="step1.usageIntent.vender" class="rounded" />
                  <span>Vender productos/servicios</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="step1.usageIntent.ambos" class="rounded" />
                  <span class="font-medium">Ambos (recomendado)</span>
                </label>
              </div>
            </div>

            <!-- Terms -->
            <div class="space-y-2 pt-4 border-t">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="step1.acceptTerms" class="mt-1 rounded" />
                <span class="text-sm">Acepto los <a href="#" class="text-indigo-600 underline">Términos y Condiciones</a></span>
              </label>
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="step1.acceptPrivacy" class="mt-1 rounded" />
                <span class="text-sm">Acepto el <a href="#" class="text-indigo-600 underline">Aviso de Privacidad</a></span>
              </label>
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="step1.acceptCommunications" class="mt-1 rounded" />
                <span class="text-sm">Acepto recibir comunicaciones de CONSUFIN ESCROW</span>
              </label>
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                (click)="goBack()"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                ⬅️ Anterior
              </button>
              <button 
                (click)="nextStep()"
                [disabled]="!isStep1Valid()"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                Continuar ➡️
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 2: Verificación 2FA -->
        <div *ngIf="currentStep === 2">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">🔐 Configurar Autenticación</h2>
          <p class="text-gray-600 mb-6">Paso 2 de 4</p>

          <div class="space-y-4">
            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">📱 Número de Teléfono *</label>
              <div class="flex gap-2">
                <select [(ngModel)]="step2.phoneCountry" class="w-32 border rounded-lg px-3 py-2">
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input 
                  type="tel" 
                  [(ngModel)]="step2.phone" 
                  class="flex-1 border rounded-lg px-3 py-2"
                  placeholder="55 1234 5678"
                  maxlength="10" />
                <button 
                  (click)="sendPhoneCode()"
                  [disabled]="!isValidPhone(step2.phone) || phoneCodeSending"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                  {{ phoneVerified ? '✅ Verificado' : (phoneCodeSending ? 'Enviando...' : 'Verificar') }}
                </button>
              </div>
            </div>

            <!-- SMS Code -->
            <div *ngIf="phoneCodeSending || phoneCodeSent">
              <label class="block text-sm font-medium text-gray-700 mb-1">💬 Código de Verificación SMS</label>
              <div class="flex gap-2 items-center">
                <input 
                  type="text" 
                  [(ngModel)]="step2.phoneCode"
                  maxlength="6"
                  class="w-32 border rounded-lg px-3 py-2 text-center text-2xl tracking-widest"
                  placeholder="_ _ _ _ _ _" />
                <span class="text-sm text-gray-500" *ngIf="codeExpiryTime > 0">
                  ⏰ {{ formatTime(codeExpiryTime) }}
                </span>
              </div>
              <button 
                (click)="sendPhoneCode()"
                class="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                📱 Reenviar Código
              </button>
              <p *ngIf="phoneVerified" class="text-xs text-green-600 mt-1">
                ✅ Teléfono verificado correctamente
              </p>
            </div>

            <!-- Additional 2FA Methods -->
            <div class="pt-4 border-t">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">🛡️ Métodos de Autenticación Adicionales</h3>
              
              <label class="flex items-start gap-2 mb-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="step2.email2FA" class="mt-1 rounded" />
                <div>
                  <span class="text-sm font-medium">📧 Email como backup 2FA</span>
                  <p class="text-xs text-gray-600">Recibir códigos por correo como alternativa</p>
                </div>
              </label>

              <label class="flex items-start gap-2 mb-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="step2.totp2FA" class="mt-1 rounded" />
                <div>
                  <span class="text-sm font-medium">📱 App Autenticador (Google/Microsoft)</span>
                  <p class="text-xs text-gray-600">Usar aplicaciones como Google Authenticator</p>
                  <button *ngIf="step2.totp2FA" class="mt-1 text-xs text-indigo-600">
                    [📱 Configurar App] [📱 Escanear QR]
                  </button>
                </div>
              </label>

              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="step2.biometric2FA" class="mt-1 rounded" />
                <div>
                  <span class="text-sm font-medium">🔍 Autenticación Biométrica</span>
                  <p class="text-xs text-gray-600">Huella digital o reconocimiento facial</p>
                  <button *ngIf="step2.biometric2FA" class="mt-1 text-xs text-indigo-600">
                    [🤳 Configurar Biometría]
                  </button>
                </div>
              </label>
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                (click)="previousStep()"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                ⬅️ Anterior
              </button>
              <button 
                (click)="nextStep()"
                [disabled]="!isStep2Valid()"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                Continuar ➡️
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 3: Información Personal -->
        <div *ngIf="currentStep === 3">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">👤 Información Personal</h2>
          <p class="text-gray-600 mb-6">Paso 3 de 4</p>

          <div class="space-y-4">
            <!-- Personal Data -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre(s) *</label>
                <input 
                  type="text" 
                  [(ngModel)]="step3.firstName" 
                  class="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                <input 
                  type="text" 
                  [(ngModel)]="step3.lastName" 
                  class="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento *</label>
              <input 
                type="date" 
                [(ngModel)]="step3.birthDate" 
                class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">📍 Ubicación</label>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">País *</label>
                  <select [(ngModel)]="step3.country" class="w-full border rounded-lg px-3 py-2">
                    <option value="MX">México 🇲🇽</option>
                    <option value="US">Estados Unidos 🇺🇸</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Estado *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="step3.state" 
                    class="w-full border rounded-lg px-3 py-2"
                    placeholder="Ciudad de México" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Ciudad *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="step3.city" 
                    class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Código Postal *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="step3.zipCode" 
                    class="w-full border rounded-lg px-3 py-2"
                    maxlength="5" />
                </div>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">🏠 Dirección Completa</label>
              <input 
                type="text" 
                [(ngModel)]="step3.street" 
                class="w-full border rounded-lg px-3 py-2 mb-2"
                placeholder="Calle y Número *" />
              <div class="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  [(ngModel)]="step3.neighborhood" 
                  class="border rounded-lg px-3 py-2"
                  placeholder="Colonia *" />
                <input 
                  type="text" 
                  [(ngModel)]="step3.municipality" 
                  class="border rounded-lg px-3 py-2"
                  placeholder="Delegación/Municipio *" />
              </div>
            </div>

            <!-- Contact -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">📱 Información de Contacto</label>
              <div class="grid grid-cols-2 gap-3">
                <input 
                  type="tel" 
                  [(ngModel)]="step3.landline" 
                  class="border rounded-lg px-3 py-2"
                  placeholder="Teléfono fijo (opcional)" />
                <div>
                  <input 
                    type="tel" 
                    [(ngModel)]="step3.mobile" 
                    class="border rounded-lg px-3 py-2"
                    placeholder="Teléfono móvil *"
                    disabled />
                  <p class="text-xs text-gray-500 mt-1">(Ya verificado)</p>
                </div>
              </div>
            </div>

            <!-- GPS -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">🌍 Ubicación GPS (Para verificación)</label>
              <button 
                (click)="getGPSLocation()"
                class="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
                🌍 Obtener Ubicación Actual
              </button>
              <p *ngIf="step3.gpsLocation" class="text-xs text-gray-600 mt-2">
                📍 Lat: {{ step3.gpsLocation.lat }}, Lng: {{ step3.gpsLocation.lng }} (Detectado)
              </p>
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                (click)="previousStep()"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                ⬅️ Anterior
              </button>
              <button 
                (click)="nextStep()"
                [disabled]="!isStep3Valid()"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                Continuar ➡️
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 4: Documentación KYC -->
        <div *ngIf="currentStep === 4">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">📄 Verificación de Identidad</h2>
          <p class="text-gray-600 mb-6">Paso 4 de 4</p>

          <div class="space-y-6">
            <!-- CURP -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                1️⃣ CURP (Clave Única de Registro de Población) *
              </label>
              <input 
                type="text" 
                [(ngModel)]="step4.curp" 
                class="w-full border rounded-lg px-3 py-2 uppercase"
                placeholder="AAAA######AAAAAA##"
                maxlength="18" />
              <p class="text-xs text-gray-600 mt-1">
                Formato: 4 letras + 6 números + 6 letras + 2 números
              </p>
              <p *ngIf="step4.curp && isValidCURP(step4.curp)" class="text-xs text-green-600 mt-1">
                ✅ Formato válido | ⏳ Verificando con RENAPO...
              </p>
            </div>

            <!-- INE -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                2️⃣ INE/Pasaporte (Identificación Oficial) *
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  (click)="uploadINE('front')"
                  class="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-center">
                  📷 Foto Frontal
                </button>
                <button 
                  (click)="uploadINE('back')"
                  class="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-center">
                  📷 Foto Reverso
                </button>
              </div>
              <p class="text-xs text-gray-600 mt-2">
                • Asegúrate de que sea legible<br>
                • Sin reflejos ni sombras<br>
                • Documento vigente
              </p>
            </div>

            <!-- RFC -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                3️⃣ RFC (Registro Federal de Contribuyentes) *
              </label>
              <input 
                type="text" 
                [(ngModel)]="step4.rfc" 
                class="w-full border rounded-lg px-3 py-2 uppercase"
                placeholder="AAAA######AAA"
                maxlength="13" />
              <p *ngIf="step4.rfc && isValidRFC(step4.rfc)" class="text-xs text-green-600 mt-1">
                ⏳ Verificando con SAT...
              </p>
            </div>

            <!-- Proof of Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                4️⃣ Comprobante de Domicilio (máximo 3 meses) *
              </label>
              <select [(ngModel)]="step4.proofOfAddressType" class="w-full border rounded-lg px-3 py-2 mb-2">
                <option value="luz">Recibo de Luz</option>
                <option value="agua">Recibo de Agua</option>
                <option value="telefono">Recibo de Teléfono</option>
                <option value="predial">Predial</option>
                <option value="banco">Estado de Cuenta Bancario</option>
              </select>
              <button 
                (click)="uploadDocument('proof_of_address')"
                class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-center">
                📷 Subir Comprobante
              </button>
              <p class="text-xs text-gray-600 mt-1">
                Archivos permitidos: PDF, JPG, PNG (máx 5MB)
              </p>
            </div>

            <!-- Selfie -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                5️⃣ Selfie de Verificación *
              </label>
              <button 
                (click)="takeSelfie()"
                class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-center">
                🤳 Tomar Selfie
              </button>
              <p class="text-xs text-gray-600 mt-1">
                • Usa buena iluminación<br>
                • Mira directamente a la cámara<br>
                • Sin lentes oscuros o sombreros
              </p>
            </div>

            <!-- Verification Status -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">✅ Estado de Verificación:</h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span>CURP:</span>
                  <span [ngClass]="step4.curpVerified ? 'text-green-600' : 'text-gray-400'">
                    {{ step4.curpVerified ? '✅ Verificado' : '❌ Pendiente' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>INE:</span>
                  <span [ngClass]="step4.ineVerified ? 'text-green-600' : 'text-yellow-600'">
                    {{ step4.ineVerified ? '✅ Verificado' : '⏳ En proceso...' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>RFC:</span>
                  <span [ngClass]="step4.rfcVerified ? 'text-green-600' : 'text-gray-400'">
                    {{ step4.rfcVerified ? '✅ Verificado' : '❌ Pendiente' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Comprobante:</span>
                  <span [ngClass]="step4.proofUploaded ? 'text-green-600' : 'text-red-600'">
                    {{ step4.proofUploaded ? '✅ Subido' : '❌ Pendiente' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Selfie:</span>
                  <span [ngClass]="step4.selfieUploaded ? 'text-green-600' : 'text-red-600'">
                    {{ step4.selfieUploaded ? '✅ Subido' : '❌ Pendiente' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                (click)="previousStep()"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                ⬅️ Anterior
              </button>
              <button 
                (click)="completeRegistration()"
                [disabled]="!isStep4Valid() || loading"
                class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {{ loading ? 'Registrando...' : '🎉 Finalizar Registro' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegistrationWizardComponent implements OnInit {
  currentStep: RegistrationStep = 1;
  userType: UserType = 'client';
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Step 1 Data
  step1 = {
    email: '',
    password: '',
    confirmPassword: '',
    personType: 'fisica' as PersonType,
    usageIntent: {
      comprar: false,
      vender: false,
      ambos: true
    },
    acceptTerms: false,
    acceptPrivacy: false,
    acceptCommunications: false
  };

  emailVerified = false;
  emailVerifying = false;

  // Step 2 Data
  step2 = {
    phone: '',
    phoneCountry: '+52',
    phoneCode: '',
    email2FA: false,
    totp2FA: false,
    biometric2FA: false
  };

  phoneVerified = false;
  phoneCodeSent = false;
  phoneCodeSending = false;
  codeExpiryTime = 0;
  codeTimer: any;

  // Step 3 Data
  step3 = {
    firstName: '',
    lastName: '',
    birthDate: '',
    country: 'MX',
    state: '',
    city: '',
    zipCode: '',
    street: '',
    neighborhood: '',
    municipality: '',
    landline: '',
    mobile: '',
    gpsLocation: null as { lat: number; lng: number } | null
  };

  // Step 4 Data
  step4 = {
    curp: '',
    rfc: '',
    curpVerified: false,
    ineVerified: false,
    rfcVerified: false,
    proofOfAddressType: 'luz',
    proofUploaded: false,
    selfieUploaded: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get user type from query params
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.userType = params['type'] === 'broker' ? 'broker' : 'client';
      }
      if (params['step']) {
        const step = parseInt(params['step']);
        if (step >= 1 && step <= 4) {
          this.currentStep = step as RegistrationStep;
        }
      }
    });
  }

  get progressPercent(): number {
    return (this.currentStep / 4) * 100;
  }

  // Step 1 Validations
  isValidEmail(email: string): boolean {
    return /.+@.+\..+/.test(email);
  }

  hasUpperCase(str: string): boolean {
    return /[A-Z]/.test(str);
  }

  hasLowerCase(str: string): boolean {
    return /[a-z]/.test(str);
  }

  hasNumber(str: string): boolean {
    return /\d/.test(str);
  }

  hasSpecialChar(str: string): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(str);
  }

  getPasswordStrength(): { level: number; text: string; color: string; barColor: string } {
    const pass = this.step1.password;
    if (!pass) return { level: 0, text: '', color: 'text-gray-400', barColor: 'bg-gray-200' };
    
    let level = 0;
    if (pass.length >= 8) level++;
    if (this.hasUpperCase(pass)) level++;
    if (this.hasLowerCase(pass)) level++;
    if (this.hasNumber(pass)) level++;
    if (this.hasSpecialChar(pass)) level++;

    const levels = [
      { text: 'Muy Débil', color: 'text-red-600', barColor: 'bg-red-500' },
      { text: 'Débil', color: 'text-orange-600', barColor: 'bg-orange-500' },
      { text: 'Media', color: 'text-yellow-600', barColor: 'bg-yellow-500' },
      { text: 'Fuerte', color: 'text-green-600', barColor: 'bg-green-500' },
      { text: 'Muy Fuerte', color: 'text-green-700', barColor: 'bg-green-600' }
    ];

    return {
      level: Math.min(level, 5),
      ...levels[Math.min(level - 1, 4)]
    };
  }

  isStep1Valid(): boolean {
    return (
      this.isValidEmail(this.step1.email) &&
      this.emailVerified &&
      this.step1.password.length >= 8 &&
      this.hasUpperCase(this.step1.password) &&
      this.hasLowerCase(this.step1.password) &&
      this.hasNumber(this.step1.password) &&
      this.hasSpecialChar(this.step1.password) &&
      this.step1.password === this.step1.confirmPassword &&
      this.step1.personType !== null &&
      (this.step1.usageIntent.comprar || this.step1.usageIntent.vender || this.step1.usageIntent.ambos) &&
      this.step1.acceptTerms &&
      this.step1.acceptPrivacy
    );
  }

  // Step 2 Validations
  isValidPhone(phone: string): boolean {
    return /^\d{10}$/.test(phone.replace(/\s/g, ''));
  }

  isStep2Valid(): boolean {
    return this.isValidPhone(this.step2.phone) && this.phoneVerified;
  }

  // Step 3 Validations
  isStep3Valid(): boolean {
    return (
      this.step3.firstName.trim().length > 0 &&
      this.step3.lastName.trim().length > 0 &&
      this.step3.birthDate &&
      this.step3.state.trim().length > 0 &&
      this.step3.city.trim().length > 0 &&
      this.step3.zipCode.trim().length > 0 &&
      this.step3.street.trim().length > 0 &&
      this.step3.neighborhood.trim().length > 0 &&
      this.step3.municipality.trim().length > 0
    );
  }

  // Step 4 Validations
  isValidCURP(curp: string): boolean {
    return /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/.test(curp);
  }

  isValidRFC(rfc: string): boolean {
    // RFC persona física: 4 letras + 6 números + 3 caracteres
    // RFC persona moral: 3 letras + 6 números + 3 caracteres
    return /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc);
  }

  isStep4Valid(): boolean {
    return (
      this.isValidCURP(this.step4.curp) &&
      this.step4.rfc && this.isValidRFC(this.step4.rfc) &&
      this.step4.proofUploaded &&
      this.step4.selfieUploaded
    );
  }

  // Navigation
  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep = (this.currentStep + 1) as RegistrationStep;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as RegistrationStep;
    }
  }

  goBack() {
    this.router.navigate(['/consufin/registro/seleccion']);
  }

  // Email Verification
  verifyEmail() {
    if (!this.isValidEmail(this.step1.email)) return;
    
    this.emailVerifying = true;
    // TODO: Call backend to send verification email
    setTimeout(() => {
      this.emailVerified = true;
      this.emailVerifying = false;
      this.successMessage = 'Email de verificación enviado. Revisa tu bandeja de entrada.';
    }, 1500);
  }

  // Phone Verification
  sendPhoneCode() {
    if (!this.isValidPhone(this.step2.phone)) return;
    
    this.phoneCodeSending = true;
    // TODO: Call backend to send SMS code
    setTimeout(() => {
      this.phoneCodeSent = true;
      this.phoneCodeSending = false;
      this.codeExpiryTime = 300; // 5 minutes
      this.startCodeTimer();
      this.successMessage = 'Código SMS enviado. Ingresa el código recibido.';
    }, 1500);
  }

  startCodeTimer() {
    if (this.codeTimer) clearInterval(this.codeTimer);
    this.codeTimer = setInterval(() => {
      if (this.codeExpiryTime > 0) {
        this.codeExpiryTime--;
      } else {
        clearInterval(this.codeTimer);
        this.phoneCodeSent = false;
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // GPS Location
  getGPSLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.step3.gpsLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.successMessage = 'Ubicación GPS obtenida correctamente.';
        },
        (error) => {
          this.errorMessage = 'No se pudo obtener la ubicación GPS. Permite el acceso en tu navegador.';
        }
      );
    } else {
      this.errorMessage = 'Tu navegador no soporta geolocalización.';
    }
  }

  // Document Uploads
  uploadINE(side: 'front' | 'back') {
    // TODO: Implement file upload
    alert(`Subir ${side === 'front' ? 'frontal' : 'reverso'} del INE`);
  }

  uploadDocument(type: string) {
    // TODO: Implement file upload
    alert(`Subir documento: ${type}`);
  }

  takeSelfie() {
    // TODO: Implement camera access
    alert('Tomar selfie con cámara');
  }

  // Complete Registration
  completeRegistration() {
    if (!this.isStep4Valid() || this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData: RegisterRequest = {
      email: this.step1.email,
      password: this.step1.password,
      first_name: this.step3.firstName,
      last_name: this.step3.lastName,
      phone: `${this.step2.phoneCountry}${this.step2.phone}`,
      role: this.userType === 'broker' ? 'broker' : 'client',
      curp: this.step4.curp,
      rfc: this.step4.rfc
    };

    this.authService.register(registerData).subscribe({
      next: (user) => {
        this.loading = false;
        this.successMessage = '¡Registro exitoso! Redirigiendo...';
        setTimeout(() => {
          this.router.navigate(['/consufin/validacion']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail || err.error?.message || 'Error al registrar. Verifica tus datos.';
      }
    });
  }
}

