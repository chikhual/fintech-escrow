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

        <section class="mb-12">
          <h3 class="font-semibold text-gray-900 mb-4">Otros servicios</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="font-semibold text-gray-900 mb-1">Préstamos</h4>
              <p class="text-gray-600 text-sm mb-4">Financiamiento respaldado por flujo ESCROW.</p>
              <div class="flex gap-3">
                <a routerLink="/consufin/contacto" class="px-4 py-2 border rounded">Solicitar información</a>
                <a routerLink="/consufin/ayuda" class="px-4 py-2 text-indigo-600">Ver requisitos →</a>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="font-semibold text-gray-900 mb-1">Oferta x ESCROW</h4>
              <p class="text-gray-600 text-sm mb-4">Promociona bienes con enlace seguro (QR/Link) y genera confianza.</p>
              <div class="flex gap-3">
                <a routerLink="/consufin/transaccion/nueva" class="px-4 py-2 bg-indigo-600 text-white rounded">Crear oferta</a>
                <a routerLink="/consufin/faq" class="px-4 py-2 text-indigo-600">Cómo funciona →</a>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-xl shadow p-6 mb-12">
          <h3 class="font-semibold text-gray-900 mb-4">Beneficios</h3>
          <div class="grid md:grid-cols-3 gap-6 text-gray-700">
            <div>✔ Custodia de fondos con trazabilidad</div>
            <div>✔ Validación KYC/AML y verificación documental</div>
            <div>✔ Notificaciones y línea de tiempo del proceso</div>
          </div>
        </section>

        <!-- Proceso en 5 pasos (según imagen de referencia) -->
        <section class="bg-white rounded-xl shadow p-8 mb-12">
          <p class="text-gray-800 text-center mb-8">
            La página despliega una visualización del proceso por medio de íconos. Así funciona el ESCROW:
          </p>
          <div class="grid grid-cols-5 gap-6 items-start text-center">
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">1</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Buyer y Seller acuerdan términos</p>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">2</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Buyer deposita el pago en Escrow</p>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">3</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Seller entrega bienes o servicios</p>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">4</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Buyer aprueba la recepción</p>
            </div>
            <div>
              <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span class="text-emerald-600 text-2xl">5</span>
              </div>
              <p class="mt-3 text-xs text-gray-700">Escrow libera fondos al Seller</p>
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

        <!-- Sección bento oscura (adaptación Tailwind) -->
        <section class="bg-gray-900 rounded-2xl p-8 sm:p-12 mb-12">
          <div class="mx-auto max-w-2xl lg:max-w-7xl">
            <h2 class="text-center text-sm font-semibold text-indigo-400">Opera más rápido</h2>
            <p class="mx-auto mt-2 max-w-lg text-center text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Todo lo que necesitas para desplegar tu operación
            </p>
            <div class="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
              <!-- Mobile friendly -->
              <div class="relative lg:row-span-2">
                <div class="absolute inset-px rounded-lg bg-gray-800 lg:rounded-l-[2rem]"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(0.5rem+1px)] lg:rounded-l-[calc(2rem+1px)]">
                  <div class="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                    <p class="mt-2 text-lg font-medium tracking-tight text-white text-center lg:text-left">Compatible con móvil</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-400 text-center lg:text-left">
                      Diseñado first-mobile y optimizado para cargas rápidas.
                    </p>
                  </div>
                  <div class="relative min-h-[480px] w-full grow max-lg:mx-auto max-lg:max-w-sm">
                    <div class="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[48px] border-x-[12px] border-t-[12px] border-gray-700 bg-gray-900 outline outline-white/20">
                      <img alt="" src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-mobile-friendly.png" class="h-full w-full object-cover object-top" />
                    </div>
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 lg:rounded-l-[2rem]"></div>
              </div>

              <!-- Performance -->
              <div class="relative">
                <div class="absolute inset-px rounded-lg bg-gray-800"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(0.5rem+1px)]">
                  <div class="px-8 pt-8 sm:px-10 sm:pt-10">
                    <p class="mt-2 text-lg font-medium tracking-tight text-white text-center lg:text-left">Rendimiento</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-400 text-center lg:text-left">Angular + Tailwind para UI ágil y accesible.</p>
                  </div>
                  <div class="flex flex-1 items-center justify-center px-8 sm:px-10 pb-4 lg:pb-2">
                    <img alt="" src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-03-performance.png" class="w-full max-lg:max-w-xs" />
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15"></div>
              </div>

              <!-- Security -->
              <div class="relative lg:col-start-2 lg:row-start-2">
                <div class="absolute inset-px rounded-lg bg-gray-800"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(0.5rem+1px)]">
                  <div class="px-8 pt-8 sm:px-10 sm:pt-10">
                    <p class="mt-2 text-lg font-medium tracking-tight text-white text-center lg:text-left">Seguridad</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-400 text-center lg:text-left">KYC/AML, auditoría y notificaciones.</p>
                  </div>
                  <div class="flex flex-1 items-center justify-center py-6 lg:pb-2">
                    <img alt="" src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-03-security.png" class="h-[152px] object-cover" />
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15"></div>
              </div>

              <!-- APIs -->
              <div class="relative lg:row-span-2">
                <div class="absolute inset-px rounded-lg bg-gray-800"></div>
                <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(0.5rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                  <div class="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                    <p class="mt-2 text-lg font-medium tracking-tight text-white text-center lg:text-left">APIs poderosas</p>
                    <p class="mt-2 max-w-lg text-sm text-gray-400 text-center lg:text-left">Webhooks y REST para integraciones.</p>
                  </div>
                  <div class="relative min-h-[480px] w-full grow">
                    <div class="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900/60 outline outline-white/10">
                      <div class="flex bg-gray-900 outline outline-white/5">
                        <div class="-mb-px flex text-sm font-medium text-gray-400">
                          <div class="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">notification.ts</div>
                          <div class="border-r border-gray-600/10 px-4 py-2">app.ts</div>
                        </div>
                      </div>
                      <div class="px-6 pt-6 pb-14 text-gray-400 text-sm">// Ejemplo de integración vendrá aquí</div>
                    </div>
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-white/15 lg:rounded-r-[2rem]"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-xl shadow p-6 mb-12">
          <h3 class="font-semibold text-gray-900 mb-4">Opciones de inicio</h3>
          <div class="grid sm:grid-cols-3 gap-4">
            <a routerLink="/consufin/transaccion/nueva" class="border rounded p-4 hover:bg-gray-50">
              <div class="font-semibold">Soy Comprador</div>
              <p class="text-sm text-gray-600">Deposita en custodia y recibe seguro.</p>
            </a>
            <a routerLink="/consufin/transaccion/nueva" class="border rounded p-4 hover:bg-gray-50">
              <div class="font-semibold">Soy Vendedor</div>
              <p class="text-sm text-gray-600">Entrega tras confirmación de fondos.</p>
            </a>
            <a routerLink="/consufin/transaccion/nueva" class="border rounded p-4 hover:bg-gray-50">
              <div class="font-semibold">Soy Broker</div>
              <p class="text-sm text-gray-600">Coordina documentos y fechas.</p>
            </a>
          </div>
        </section>

        <section class="grid md:grid-cols-2 gap-6 mb-12">
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="font-semibold text-gray-900 mb-2">QR de seguridad</h3>
            <ul class="text-gray-700 list-disc ml-5 space-y-1 text-sm">
              <li>QR público para brochures y anuncios.</li>
              <li>QR restringido ligado a correo/teléfono del destinatario.</li>
            </ul>
          </div>
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="font-semibold text-gray-900 mb-2">Cargas masivas (CSV)</h3>
            <p class="text-gray-700 text-sm">Plantillas precreadas para altas de múltiples productos/servicios.</p>
          </div>
        </section>

        <section class="bg-white rounded-xl shadow p-6 mb-12">
          <h3 class="font-semibold text-gray-900 mb-4">Distribución de pagos</h3>
          <div class="text-sm text-gray-700">
            <p class="mb-2">Define parcialidades, anticipos y liquidación. Incluye SPEI/SWIFT.</p>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-left">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2">Fecha</th>
                    <th class="px-3 py-2">Concepto</th>
                    <th class="px-3 py-2">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr>
                    <td class="px-3 py-2">Día 0</td>
                    <td class="px-3 py-2">Depósito a custodia</td>
                    <td class="px-3 py-2">—</td>
                  </tr>
                  <tr>
                    <td class="px-3 py-2">Día N</td>
                    <td class="px-3 py-2">Liberación tras aprobación</td>
                    <td class="px-3 py-2">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-xl shadow p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Asesor especializado (opcional)</h3>
          <p class="text-gray-700 text-sm mb-2">Para operaciones de alto valor (ej. > $800,000 MXN).</p>
          <ul class="list-disc ml-5 text-gray-700 text-sm space-y-1">
            <li>Revisión de documentos y términos</li>
            <li>Mediación y definición de días de inspección</li>
            <li>Servicio de resguardo para bienes intangibles</li>
            <li>Negociación de quién cubre comisión (comprador/vendedor/mitad/personalizado)</li>
          </ul>
        </section>
      </main>
    </div>
  `,
  styles: []
})
export class ConsufinHomeComponent { mobileOpen = false; }



