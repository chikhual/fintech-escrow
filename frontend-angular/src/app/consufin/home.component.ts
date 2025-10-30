import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consufin-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900">CONSUFIN • ESCROW</h1>
          <nav class="space-x-4 text-sm">
            <a routerLink="/consufin/transacciones" class="text-gray-600 hover:text-gray-900">Mis transacciones</a>
            <a routerLink="/consufin/integraciones" class="text-gray-600 hover:text-gray-900">Integraciones</a>
            <a routerLink="/consufin/validacion" class="text-gray-600 hover:text-gray-900">Validación KYC</a>
            <a routerLink="/consufin/ayuda" class="text-gray-600 hover:text-gray-900">Ayuda</a>
            <a routerLink="/consufin/contacto" class="text-gray-600 hover:text-gray-900">Contáctanos</a>
            <a routerLink="/consufin/registro" class="ml-4 inline-block px-3 py-1.5 bg-indigo-600 text-white rounded">Login / Registro</a>
          </nav>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-6 py-10">
        <section class="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 class="text-4xl font-extrabold text-gray-900 leading-tight mb-4">Nunca compres o vendas sin un ESCROW.</h2>
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

        <section class="grid md:grid-cols-3 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow p-5">
            <h4 class="font-semibold text-gray-900 mb-1">Préstamos</h4>
            <p class="text-gray-600 text-sm">Financiamiento respaldado por flujo ESCROW.</p>
          </div>
          <div class="bg-white rounded-lg shadow p-5">
            <h4 class="font-semibold text-gray-900 mb-1">Oferta x ESCROW</h4>
            <p class="text-gray-600 text-sm">Promociona bienes con enlace seguro (QR/Link).</p>
          </div>
          <div class="bg-white rounded-lg shadow p-5">
            <h4 class="font-semibold text-gray-900 mb-1">Calculadora de costos</h4>
            <p class="text-gray-600 text-sm">Conoce comisiones y distribución estimada.</p>
            <a routerLink="/consufin/calculadora" class="inline-block mt-3 text-indigo-600">Abrir calculadora →</a>
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
export class ConsufinHomeComponent {}



