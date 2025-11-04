import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <a routerLink="/consufin" class="text-xl font-bold text-gray-900">CONSUFIN</a>
          </div>
          <nav class="hidden lg:flex items-center gap-4 text-sm">
            <a href="https://www.consufin.com.mx/#/Cotizar" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-900">PRESTAMOS</a>
            <a routerLink="/consufin/calculadora" class="text-gray-600 hover:text-gray-900">CALCULADORA</a>
            <a routerLink="/consufin/marketplace" class="text-gray-600 hover:text-gray-900 font-semibold">MARKETPLACE</a>
            <a routerLink="/consufin/transaccion/nueva" class="text-gray-600 hover:text-gray-900">ESCROW</a>
            <a routerLink="/consufin/ayuda" class="text-gray-600 hover:text-gray-900">AYUDA</a>
            <a routerLink="/consufin/contacto" class="text-gray-600 hover:text-gray-900">CONTACTANOS</a>
            <a routerLink="/consufin/registro" class="ml-2 inline-block px-3 py-1.5 bg-indigo-600 text-white rounded">Login / Registro</a>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">🏪 MARKETPLACE</h1>
          <p class="text-lg text-gray-600">Explora y compra productos de forma segura con ESCROW</p>
        </div>

        <!-- Placeholder Content -->
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <div class="max-w-2xl mx-auto">
            <div class="text-6xl mb-4">🛒</div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Marketplace en Construcción</h2>
            <p class="text-gray-600 mb-6">
              Estamos trabajando en crear un marketplace completo donde podrás:
            </p>
            <ul class="text-left space-y-3 text-gray-700 mb-8 max-w-md mx-auto">
              <li class="flex items-start gap-2">
                <span class="text-indigo-600 font-bold">✓</span>
                <span>Buscar productos y servicios</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-600 font-bold">✓</span>
                <span>Publicar tus productos para vender</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-600 font-bold">✓</span>
                <span>Comprar con protección ESCROW</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-600 font-bold">✓</span>
                <span>Gestionar transacciones desde un solo lugar</span>
              </li>
            </ul>
            <div class="flex gap-4 justify-center">
              <a routerLink="/consufin/transaccion/nueva" class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                Crear Nueva Transacción
              </a>
              <a routerLink="/consufin" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
                Volver al Inicio
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class MarketplaceComponent {}

