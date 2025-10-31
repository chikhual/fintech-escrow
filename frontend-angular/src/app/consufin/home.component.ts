import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consufin-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="lg:hidden -m-2.5 p-2.5 text-gray-700" (click)="mobileOpen = true" aria-label="Abrir menú">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-6">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-900">CONSUFIN</h1>
          </div>
          <nav class="hidden lg:flex items-center gap-4 text-sm">
            <a routerLink="/consufin/comprador" class="text-gray-600 hover:text-gray-900">Comprador</a>
            <a routerLink="/consufin/transacciones" class="text-gray-600 hover:text-gray-900">Mis transacciones</a>
            <a routerLink="/consufin/integraciones" class="text-gray-600 hover:text-gray-900">Integraciones</a>
            <a routerLink="/consufin/validacion" class="text-gray-600 hover:text-gray-900">Validación KYC</a>
            <a routerLink="/consufin/ayuda" class="text-gray-600 hover:text-gray-900">Ayuda</a>
            <a routerLink="/consufin/contacto" class="text-gray-600 hover:text-gray-900">Contáctanos</a>
            <a routerLink="/consufin/registro" class="ml-2 inline-block px-3 py-1.5 bg-indigo-600 text-white rounded">Login / Registro</a>
          </nav>
        </div>
        <!-- Mobile drawer -->
        <div *ngIf="mobileOpen" class="lg:hidden fixed inset-0 z-50">
          <div class="fixed inset-0 bg-black/20" (click)="mobileOpen = false"></div>
          <div class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div class="text-lg font-semibold">Menú</div>
              <button class="-m-2.5 p-2.5" (click)="mobileOpen = false" aria-label="Cerrar menú">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-6">
                  <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
            <nav class="mt-6 space-y-2 text-base">
              <a (click)="mobileOpen=false" routerLink="/consufin/comprador" class="block rounded px-3 py-2 hover:bg-gray-50">Comprador</a>
              <a (click)="mobileOpen=false" routerLink="/consufin/transacciones" class="block rounded px-3 py-2 hover:bg-gray-50">Mis transacciones</a>
              <a (click)="mobileOpen=false" routerLink="/consufin/integraciones" class="block rounded px-3 py-2 hover:bg-gray-50">Integraciones</a>
              <a (click)="mobileOpen=false" routerLink="/consufin/validacion" class="block rounded px-3 py-2 hover:bg-gray-50">Validación KYC</a>
              <a (click)="mobileOpen=false" routerLink="/consufin/ayuda" class="block rounded px-3 py-2 hover:bg-gray-50">Ayuda</a>
              <a (click)="mobileOpen=false" routerLink="/consufin/contacto" class="block rounded px-3 py-2 hover:bg-gray-50">Contáctanos</a>
              <a (click)="mobileOpen=false" routerLink="/consufin/registro" class="block rounded px-3 py-2 bg-indigo-600 text-white text-center">Login / Registro</a>
            </nav>
          </div>
        </div>
      </header>

      <!-- HERO -->
      <div class="relative isolate px-6 pt-20 lg:px-8 bg-white">
        <div aria-hidden="true" class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
        </div>
        <div class="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40 text-center">
          <h1 class="text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">Protege cada compra y venta con CONSUFIN</h1>
          <p class="mt-6 text-lg text-gray-600">Custodia el pago, verifica identidad y libera fondos solo cuando ambas partes estén conformes. Simple, seguro y transparente.</p>
          <div class="mt-10 flex items-center justify-center gap-x-4">
            <a routerLink="/consufin/transaccion/nueva" class="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Comenzar</a>
            <a routerLink="/consufin/faq" class="text-sm font-semibold text-gray-900">Conoce más <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div aria-hidden="true" class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" class="relative left-1/2 aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72rem]"></div>
        </div>
      </div>

      <main class="max-w-6xl mx-auto px-6 py-10">
        <section class="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 class="text-4xl font-extrabold text-gray-900 leading-tight mb-4">Nunca compres o vendas sin CONSUFIN</h2>
            <p class="text-gray-700 mb-6">Un tercero confiable retiene el pago hasta que ambas partes confirman satisfacción. Pagos seguros, sin contracargos y con trazabilidad.</p>
            <div class="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <select class="border rounded px-3 py-2 w-full sm:w-48">
                <option>Estoy Comprando</option>
                <option>Estoy Vendiendo</option>
                <option>Soy Broker</option>
              </select>
              <input type="number" placeholder="Monto $" class="border rounded px-3 py-2 w-full" />
              <a routerLink="/consufin/transaccion/nueva" class="px-4 py-2 bg-emerald-600 text-white rounded text-center">Comenzar ahora</a>
            </div>
            <ul class="mt-6 space-y-2 text-gray-700">
              <li>✔ Acuerdo de términos</li>
              <li>✔ Comprador deposita en custodia</li>
              <li>✔ Vendedor entrega/trasfiere</li>
              <li>✔ Comprador aprueba • fondos liberados</li>
            </ul>
            <div class="mt-4 text-sm text-gray-600">
              <a routerLink="/consufin/faq" class="text-indigo-600">¿Cómo funciona? Ver preguntas frecuentes →</a>
            </div>
          </div>
          <div class="bg-gradient-to-br from-indigo-50 to-white rounded-xl border p-6">
            <h3 class="font-semibold text-gray-900 mb-3">Proceso (ej. vehículos)</h3>
            <ol class="space-y-3 text-gray-700 list-decimal ml-5">
              <li>Publicación/selección del vehículo</li>
              <li>Depósito en CONSUFIN (ESCROW)</li>
              <li>Entrega y verificación documental</li>
              <li>Aprobación del comprador</li>
              <li>Liberación de fondos al vendedor</li>
            </ol>
          </div>
        </section>

        <!-- Otros servicios que ofrecemos (bento claro) -->
        <section class="bg-gray-50 rounded-2xl p-8 sm:p-12 mb-12">
          <div class="mx-auto max-w-2xl lg:max-w-7xl">
            <h2 class="text-center text-sm font-semibold text-indigo-600">CONSUFIN</h2>
            <p class="mx-auto mt-2 max-w-lg text-center text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              OTROS SERVICIOS QUE OFRECEMOS
            </p>
            <div class="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
              <!-- Préstamos empresariales (alto) -->
              <div class="relative lg:row-span-2">
                <div class="absolute inset-px rounded-lg bg-white lg:rounded-l-3xl"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-lg lg:rounded-l-3xl">
                  <div class="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                    <p class="mt-2 text-lg font-medium tracking-tight text-gray-900 text-center lg:text-left">PRESTAMOS EMPRESARIALES</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-600 text-center lg:text-left">Crédito empresarial y personal con cálculo en línea. Simula tu crédito y conoce plazos, tasas y requisitos.</p>
                  </div>
                  <div class="relative min-h-[320px] w-full grow max-lg:mx-auto max-lg:max-w-sm">
                    <div class="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[32px] border-x-[12px] border-t-[12px] border-gray-700 bg-gray-900 shadow-2xl">
                      <img alt="" src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-mobile-friendly.png" class="h-full w-full object-cover object-top" />
                    </div>
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 lg:rounded-l-3xl"></div>
              </div>

              <!-- Calculadora costos -->
              <div class="relative">
                <div class="absolute inset-px rounded-lg bg-white"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-lg">
                  <div class="px-8 pt-8 sm:px-10 sm:pt-10">
                    <p class="mt-2 text-lg font-medium tracking-tight text-gray-900 text-center lg:text-left">CALCULADORA COSTOS</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-600 text-center lg:text-left">Verifica las comisiones con base a los montos.</p>
                  </div>
                  <div class="flex flex-1 items-center justify-center px-8 sm:px-10 pb-6 lg:pb-2">
                    <img alt="" src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-performance.png" class="w-full max-lg:max-w-xs" />
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5"></div>
              </div>

              <!-- Cargas masivas -->
              <div class="relative lg:col-start-2 lg:row-start-2">
                <div class="absolute inset-px rounded-lg bg-white"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-lg">
                  <div class="px-8 pt-8 sm:px-10 sm:pt-10">
                    <p class="mt-2 text-lg font-medium tracking-tight text-gray-900 text-center lg:text-left">CARGAS MASIVAS</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-600 text-center lg:text-left">Plantillas precreadas para altas de múltiples productos/servicios.</p>
                  </div>
                  <div class="flex flex-1 items-center justify-center py-6 lg:pb-2">
                    <img alt="" src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-security.png" class="h-[152px] object-cover" />
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5"></div>
              </div>

              <!-- Acompañamiento (alto) -->
              <div class="relative lg:row-span-2">
                <div class="absolute inset-px rounded-lg bg-white lg:rounded-r-3xl"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-lg lg:rounded-r-3xl">
                  <div class="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                    <p class="mt-2 text-lg font-medium tracking-tight text-gray-900 text-center lg:text-left">ACOMPAÑAMIENTO</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-600 text-center lg:text-left">Asesor especializado (opcional).</p>
                  </div>
                  <div class="relative min-h-[320px] w-full grow">
                    <div class="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl outline outline-white/10">
                      <div class="flex bg-gray-900 outline outline-white/5">
                        <div class="-mb-px flex text-sm font-medium text-gray-400">
                          <div class="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">NotificationSetting.jsx</div>
                          <div class="border-r border-gray-600/10 px-4 py-2">App.jsx</div>
                        </div>
                      </div>
                      <div class="px-6 pt-6 pb-14 text-gray-300 text-sm"><!-- Ejemplo de código / demo --></div>
                    </div>
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 lg:rounded-r-3xl"></div>
              </div>
            </div>
          </div>
        </section>


        <!-- Proceso en 5 pasos (según imagen de referencia) -->
        <section class="bg-white rounded-xl shadow p-8 mb-12">
          <p class="text-gray-800 text-center mb-8">
            La página despliega una visualización del proceso por medio de íconos. Así funciona el ESCROW:
          </p>
          <div class="grid grid-cols-9 gap-6 items-start text-center">
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">1</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Comprador y Vendedor acuerdan términos</p>
            </div>
            <div class="hidden md:flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6 text-emerald-600">
                <path d="M4 12h14" />
                <path d="M14 6l6 6-6 6" />
              </svg>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">2</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Comprador deposita el pago en custodia a CONSUFIN</p>
            </div>
            <div class="hidden md:flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6 text-emerald-600">
                <path d="M4 12h14" />
                <path d="M14 6l6 6-6 6" />
              </svg>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">3</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Vendedor entrega bienes o servicios</p>
            </div>
            <div class="hidden md:flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6 text-emerald-600">
                <path d="M4 12h14" />
                <path d="M14 6l6 6-6 6" />
              </svg>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">4</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Comprador aprueba la recepción</p>
            </div>
            <div class="hidden md:flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6 text-emerald-600">
                <path d="M4 12h14" />
                <path d="M14 6l6 6-6 6" />
              </svg>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">5</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">CONSUFIN libera fondos al Vendedor</p>
            </div>
          </div>
          <div class="mt-8 flex flex-col items-center gap-3">
            <a routerLink="/consufin/transaccion/nueva" class="px-5 py-2.5 bg-emerald-600 text-white rounded">Comenzar ahora</a>
            <a routerLink="/consufin/faq" class="text-xs text-emerald-700">Aprender más sobre ESCROW</a>
          </div>
        </section>

        <!-- Features grid (alternativa de diseño tipo heroicons) -->
        <section class="bg-white rounded-xl shadow p-8 mb-12">
          <div class="max-w-2xl mx-auto text-center">
            <h2 class="text-sm font-semibold text-indigo-600">Seguridad y rapidez</h2>
            <p class="mt-2 text-3xl font-semibold text-gray-900">Todo lo que necesitas para operar con confianza</p>
            <p class="mt-4 text-gray-700">Custodia, validación, notificaciones y un panel claro de estado para ambas partes.</p>
          </div>
          <div class="mx-auto mt-10 max-w-4xl">
            <dl class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="relative pl-12">
                <dt class="font-semibold text-gray-900">
                  <div class="absolute left-0 top-0 h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span class="text-white">↑</span>
                  </div>
                  Depósitos seguros
                </dt>
                <dd class="mt-2 text-gray-700">Fondos en custodia con trazabilidad y liberación bilateral.</dd>
              </div>
              <div class="relative pl-12">
                <dt class="font-semibold text-gray-900">
                  <div class="absolute left-0 top-0 h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span class="text-white">🔒</span>
                  </div>
                  Certificados y cifrado
                </dt>
                <dd class="mt-2 text-gray-700">Buenas prácticas de seguridad y verificación de identidad.</dd>
              </div>
              <div class="relative pl-12">
                <dt class="font-semibold text-gray-900">
                  <div class="absolute left-0 top-0 h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span class="text-white">↻</span>
                  </div>
                  Flujo simple
                </dt>
                <dd class="mt-2 text-gray-700">Pasos claros de acuerdo, depósito, entrega, aprobación y pago.</dd>
              </div>
              <div class="relative pl-12">
                <dt class="font-semibold text-gray-900">
                  <div class="absolute left-0 top-0 h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span class="text-white">🖐</span>
                  </div>
                  Seguridad avanzada
                </dt>
                <dd class="mt-2 text-gray-700">Auditoría, KYC/AML y evidencias para minimizar riesgos.</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- Nuevo layout de workflow -->
        <section class="overflow-hidden bg-white py-16 sm:py-24">
          <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div class="lg:pt-4 lg:pr-8">
                <div class="lg:max-w-lg">
                  <h2 class="text-sm font-semibold text-indigo-600">CONSUFIN</h2>
                  <p class="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                    Operación más eficiente
                  </p>
                  <p class="mt-6 text-base text-gray-700">
                    Gestiona tus transacciones con herramientas diseñadas para proteger compradores y vendedores. Custodia segura, verificación documental y flujo transparente.
                  </p>
                  <dl class="mt-10 max-w-xl space-y-6 text-sm text-gray-600 lg:max-w-none">
                    <div *ngFor="let f of workflowFeatures" class="relative pl-9">
                      <dt class="inline font-semibold text-gray-900">
                        <span class="absolute top-1 left-1 h-5 w-5 text-indigo-600" [ngSwitch]="f.icon">
                          <!-- cloud -->
                          <svg *ngSwitchCase="'cloud'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.58-1.37A4.5 4.5 0 1 1 17.5 18H7Z"/>
                            <path d="M12 12v8m0 0 3-3m-3 3-3-3"/>
                          </svg>
                          <!-- lock -->
                          <svg *ngSwitchCase="'lock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <rect x="6" y="10" width="12" height="8" rx="2"/>
                            <path d="M8 10V7a4 4 0 1 1 8 0v3"/>
                          </svg>
                          <!-- server -->
                          <svg *ngSwitchCase="'server'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <rect x="3" y="4" width="18" height="6" rx="2"/>
                            <rect x="3" y="14" width="18" height="6" rx="2"/>
                          </svg>
                        </span>
                        {{ f.name }}
                      </dt>
                      <dd class="inline">{{ f.description }}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <img
                alt="Product screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
                class="w-full max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 md:-ml-4 lg:-ml-0"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: []
})
export class ConsufinHomeComponent { 
  mobileOpen = false;
  
  workflowFeatures = [
    { 
      name: 'Sube y resguarda evidencias.', 
      description: 'Carga comprobantes de pago, entrega y documentos en PDF o imagen con respaldo seguro.',
      icon: 'cloud' 
    },
    { 
      name: 'Certificados y cifrado.', 
      description: 'Operaciones bajo custodia con verificación de identidad (KYC/AML) y buenas prácticas de seguridad.',
      icon: 'lock' 
    },
    { 
      name: 'Historial y respaldos.', 
      description: 'Conserva el historial completo de transacciones y recupera tu información cuando la necesites.',
      icon: 'server' 
    }
  ];
}



