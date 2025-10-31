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
                    <p class="mt-2 max-w-lg text-sm text-gray-600 text-center lg:text-left">Verifica las comisiones con base a los montos de las transacciones y determina quien debe de pagarlo</p>
                  </div>
                  <div class="flex flex-1 items-center justify-center px-8 sm:px-10 pb-6 lg:pb-2">
                    <a routerLink="/consufin/calculadora" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition text-center">
                      CALCULADORA
                    </a>
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

      <!-- Equipo -->
      <section class="bg-white py-16 sm:py-24">
        <div class="mx-auto grid max-w-7xl gap-12 px-6 lg:px-8 xl:grid-cols-3">
          <div class="max-w-xl">
            <h2 class="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Conoce a nuestro equipo
            </h2>
            <p class="mt-6 text-base text-gray-600">
              Somos un equipo dinámico apasionado por lo que hacemos y comprometidos con ofrecer los mejores resultados para nuestros clientes.
            </p>
          </div>
          <ul role="list" class="grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-12 xl:col-span-2">
            <li *ngFor="let person of teamMembers">
              <div class="flex items-center gap-x-6">
                <img
                  [alt]="person.name"
                  [src]="person.imageUrl"
                  class="h-16 w-16 rounded-full outline-1 -outline-offset-1 outline-black/5"
                />
                <div>
                  <h3 class="text-base font-semibold tracking-tight text-gray-900">{{ person.name }}</h3>
                  <p class="text-sm font-semibold text-indigo-600">{{ person.role }}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-white border-t">
        <div class="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div class="xl:grid xl:grid-cols-3 xl:gap-8">
            <!-- Logo y descripción -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <div class="h-1 w-12 bg-indigo-600 rounded-full"></div>
                  <div class="h-1 w-12 bg-indigo-600 rounded-full -mt-1 ml-3"></div>
                </div>
                <h3 class="text-xl font-bold text-gray-900">CONSUFIN</h3>
              </div>
              <p class="text-sm text-gray-600">
                Protegiendo cada transacción con custodia segura, verificación y transparencia.
              </p>
              <div class="flex space-x-4">
                <a href="#" class="text-gray-400 hover:text-indigo-600">
                  <span class="sr-only">Facebook</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-indigo-600">
                  <span class="sr-only">Instagram</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-indigo-600">
                  <span class="sr-only">X</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-indigo-600">
                  <span class="sr-only">GitHub</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.027 2.747-1.027.546 1.377.202 2.394.1 2.647.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                  </svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-indigo-600">
                  <span class="sr-only">YouTube</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Columnas de navegación -->
            <div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div class="md:grid md:grid-cols-2 md:gap-8">
                <!-- Soluciones -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">Soluciones</h3>
                  <ul role="list" class="mt-6 space-y-4">
                    <li><a routerLink="/consufin/transaccion/nueva" class="text-sm text-gray-600 hover:text-indigo-600">Nueva transacción</a></li>
                    <li><a routerLink="/consufin/calculadora" class="text-sm text-gray-600 hover:text-indigo-600">Calculadora de costos</a></li>
                    <li><a routerLink="/consufin/comprador" class="text-sm text-gray-600 hover:text-indigo-600">Portal Comprador</a></li>
                    <li><a routerLink="/consufin/roles" class="text-sm text-gray-600 hover:text-indigo-600">Centro de Roles</a></li>
                    <li><a routerLink="/consufin/integraciones" class="text-sm text-gray-600 hover:text-indigo-600">Integraciones</a></li>
                  </ul>
                </div>

                <!-- Soporte -->
                <div class="mt-10 md:mt-0">
                  <h3 class="text-sm font-semibold text-gray-900">Soporte</h3>
                  <ul role="list" class="mt-6 space-y-4">
                    <li><a routerLink="/consufin/contacto" class="text-sm text-gray-600 hover:text-indigo-600">Contacto</a></li>
                    <li><a routerLink="/consufin/ayuda" class="text-sm text-gray-600 hover:text-indigo-600">Ayuda</a></li>
                    <li><a routerLink="/consufin/faq" class="text-sm text-gray-600 hover:text-indigo-600">Preguntas frecuentes</a></li>
                  </ul>
                </div>
              </div>

              <div class="md:grid md:grid-cols-2 md:gap-8">
                <!-- Empresa -->
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">Empresa</h3>
                  <ul role="list" class="mt-6 space-y-4">
                    <li><a routerLink="/consufin" class="text-sm text-gray-600 hover:text-indigo-600">Acerca de</a></li>
                    <li><a href="https://www.consufin.com.mx" target="_blank" rel="noopener" class="text-sm text-gray-600 hover:text-indigo-600">Sitio web</a></li>
                    <li><a routerLink="/consufin/contacto" class="text-sm text-gray-600 hover:text-indigo-600">Carreras</a></li>
                    <li><a routerLink="/consufin/contacto" class="text-sm text-gray-600 hover:text-indigo-600">Prensa</a></li>
                  </ul>
                </div>

                <!-- Legal -->
                <div class="mt-10 md:mt-0">
                  <h3 class="text-sm font-semibold text-gray-900">Legal</h3>
                  <ul role="list" class="mt-6 space-y-4">
                    <li><a routerLink="/consufin/ayuda" class="text-sm text-gray-600 hover:text-indigo-600">Términos de servicio</a></li>
                    <li><a routerLink="/consufin/ayuda" class="text-sm text-gray-600 hover:text-indigo-600">Política de privacidad</a></li>
                    <li><a routerLink="/consufin/ayuda" class="text-sm text-gray-600 hover:text-indigo-600">Licencia</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Copyright -->
          <div class="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
            <p class="text-xs leading-5 text-gray-500">&copy; 2025 CONSUFIN. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
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

  teamMembers = [
    {
      name: 'Leslie Alexander',
      role: 'Co-Fundador / CEO',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Michael Foster',
      role: 'Co-Fundador / CTO',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Dries Vincent',
      role: 'Relaciones Comerciales',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Lindsay Walton',
      role: 'Desarrollador Front-end',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Courtney Henry',
      role: 'Diseñador',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Tom Cook',
      role: 'Director de Producto',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];
}



