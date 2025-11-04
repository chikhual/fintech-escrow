import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    sales: number;
    specialty?: string;
    responseTime?: string;
  };
  images: string[];
  featured: boolean;
  escrow: boolean;
  rating: number;
  reviews: number;
  views: number;
  description: string;
  specifications?: { [key: string]: string };
  documents?: string[];
  guarantees?: string[];
  publishedDate: string;
  status: 'active' | 'sold' | 'paused';
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Top Navigation Bar -->
      <header class="bg-white border-b sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <a routerLink="/consufin" class="text-xl font-bold text-gray-900">CONSUFIN</a>
              <nav class="hidden md:flex items-center gap-4 text-sm">
                <a routerLink="/consufin/marketplace" class="text-gray-700 hover:text-gray-900 font-medium">Explorar</a>
                <a href="#categorias" class="text-gray-600 hover:text-gray-900">Categorías</a>
                <a routerLink="/consufin/ayuda" class="text-gray-600 hover:text-gray-900">Cómo Funciona</a>
              </nav>
            </div>
            <div class="flex items-center gap-3">
              <button class="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span>Guardados</span>
              </button>
              <a routerLink="/consufin/registro" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                👤 Entrar
              </a>
            </div>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-16 sm:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              🛡️ Compra y Vende con Total Seguridad
            </h1>
            <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Miles de productos protegidos por ESCROW. Transacciones verificadas y seguras.
            </p>
            
            <!-- Search Bar -->
            <div class="max-w-2xl mx-auto mb-8">
              <div class="flex gap-2">
                <input 
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="searchProducts()"
                  type="text" 
                  placeholder="Buscar productos, marcas, vendedores..."
                  class="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg">
                <button 
                  (click)="searchProducts()"
                  class="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                  🔍 Buscar
                </button>
              </div>
            </div>

            <!-- Categories Quick Access -->
            <div class="flex flex-wrap justify-center gap-3 mb-8">
              <button 
                *ngFor="let cat of categories" 
                (click)="filterByCategory(cat.id)"
                class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition">
                {{ cat.icon }} {{ cat.name }} ({{ cat.count }})
              </button>
            </div>

            <!-- Stats -->
            <div class="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Estadísticas en Tiempo Real</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-indigo-600">{{ stats.activeProducts.toLocaleString() }}</div>
                  <div class="text-sm text-gray-600">productos activos</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-green-600">{{ stats.totalValue }}</div>
                  <div class="text-sm text-gray-600">en transacciones</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-blue-600">{{ stats.verifiedUsers.toLocaleString() }}</div>
                  <div class="text-sm text-gray-600">usuarios verificados</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-yellow-600">{{ stats.satisfaction }}%</div>
                  <div class="text-sm text-gray-600">satisfacción</div>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap justify-center gap-4 mt-8">
              <a routerLink="/consufin/marketplace" [queryParams]="{view: 'catalog'}" class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                🛒 Explorar Productos
              </a>
              <a routerLink="/consufin/transaccion/nueva" class="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                🏪 Vender Aquí
              </a>
              <a routerLink="/consufin/ayuda" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
                📚 Cómo Funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="py-12 bg-white" *ngIf="!showProductDetail && !showCatalog">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-gray-900">⭐ Productos Destacados</h2>
            <a routerLink="/consufin/marketplace" [queryParams]="{view: 'catalog'}" class="text-indigo-600 hover:text-indigo-700 font-medium">
              Ver Todos los Productos ➡️
            </a>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              *ngFor="let product of featuredProducts"
              (click)="viewProduct(product)"
              class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
              <div class="aspect-w-16 aspect-h-9 bg-gray-200">
                <div class="w-full h-48 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-6xl">
                  📷
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-semibold text-gray-900 text-lg">{{ product.title }}</h3>
                  <span *ngIf="product.featured" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🔥</span>
                </div>
                <div class="text-xl font-bold text-indigo-600 mb-2">{{ product.price | currency:'MXN':'symbol':'1.0-0' }}</div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🔒 ESCROW</span>
                  <div class="flex items-center">
                    <span *ngFor="let star of getStars(product.rating)" class="text-yellow-400">⭐</span>
                    <span *ngIf="product.rating < 5" class="text-gray-300">⭐</span>
                  </div>
                </div>
                <div class="text-sm text-gray-600 mb-3">{{ product.seller.name }}</div>
                <button class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Catalog View -->
      <section class="py-8" *ngIf="showCatalog && !showProductDetail">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              🛒 Explorar Productos ({{ filteredProducts.length }} productos encontrados)
            </h2>
            <div class="flex items-center gap-3">
              <select [(ngModel)]="sortBy" (change)="applyFilters()" class="border rounded-lg px-3 py-2 text-sm">
                <option value="relevance">Relevancia</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="newest">Más Recientes</option>
                <option value="rating">Mejor Calificación</option>
              </select>
              <button class="p-2 border rounded-lg hover:bg-gray-50">📋</button>
            </div>
          </div>

          <div class="flex gap-6">
            <!-- Filters Sidebar -->
            <aside class="hidden lg:block w-64 flex-shrink-0">
              <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                <div>
                  <h3 class="font-semibold text-gray-900 mb-3">🏷️ Categoría</h3>
                  <div class="space-y-2">
                    <label *ngFor="let cat of categories" class="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        [checked]="selectedCategories.includes(cat.id)"
                        (change)="toggleCategory(cat.id)"
                        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                      <span class="text-sm text-gray-700">{{ cat.icon }} {{ cat.name }} ({{ cat.count }})</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 class="font-semibold text-gray-900 mb-3">💰 Precio</h3>
                  <div class="space-y-2">
                    <input type="range" min="0" max="10000000" [(ngModel)]="priceRange[0]" (input)="applyFilters()" class="w-full">
                    <input type="range" min="0" max="10000000" [(ngModel)]="priceRange[1]" (input)="applyFilters()" class="w-full">
                    <div class="flex justify-between text-sm text-gray-600">
                      <span>{{ priceRange[0] | currency:'MXN':'symbol':'1.0-0' }}</span>
                      <span>{{ priceRange[1] | currency:'MXN':'symbol':'1.0-0' }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="font-semibold text-gray-900 mb-3">⭐ Calificación</h3>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [(ngModel)]="filterFiveStars" (change)="applyFilters()" class="rounded">
                      <span class="text-sm">5 estrellas (456)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [(ngModel)]="filterFourStars" (change)="applyFilters()" class="rounded">
                      <span class="text-sm">4+ estrellas (789)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 class="font-semibold text-gray-900 mb-3">🔒 Protección</h3>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [(ngModel)]="onlyEscrow" (change)="applyFilters()" class="rounded">
                      <span class="text-sm">Solo con ESCROW</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [(ngModel)]="onlyVerified" (change)="applyFilters()" class="rounded">
                      <span class="text-sm">Vendedor verificado</span>
                    </label>
                  </div>
                </div>

                <button (click)="clearFilters()" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Limpiar Filtros
                </button>
              </div>
            </aside>

            <!-- Products Grid -->
            <div class="flex-1">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                  *ngFor="let product of filteredProducts"
                  (click)="viewProduct(product)"
                  class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div class="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div class="w-full h-48 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-6xl">
                      📷
                    </div>
                  </div>
                  <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ product.title }}</h3>
                    <div class="text-xl font-bold text-indigo-600 mb-2">{{ product.price | currency:'MXN':'symbol':'1.0-0' }}</div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🔒 ESCROW</span>
                      <span class="text-xs text-gray-600">📍 {{ product.location }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ product.description }}</p>
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span *ngFor="let star of getStars(product.rating)" class="text-yellow-400 text-sm">⭐</span>
                        <span class="text-xs text-gray-600">({{ product.reviews }})</span>
                      </div>
                      <div class="text-xs text-gray-600">
                        <span *ngIf="product.seller.verified">✅</span> {{ product.seller.name }}
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        💬 Preguntar
                      </button>
                      <button class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                        🛒 Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="mt-8 flex justify-center gap-2">
                <button *ngFor="let page of getPages()" 
                  (click)="currentPage = page"
                  [ngClass]="currentPage === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'"
                  class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  {{ page }}
                </button>
                <button (click)="nextPage()" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Product Detail View -->
      <section class="py-8" *ngIf="showProductDetail && selectedProduct">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Breadcrumb -->
          <nav class="text-sm text-gray-600 mb-6">
            <a routerLink="/consufin" class="hover:text-indigo-600">🏠 Inicio</a>
            <span> > </span>
            <a (click)="showCatalog = true; showProductDetail = false" class="hover:text-indigo-600 cursor-pointer">{{ selectedProduct.category }}</a>
            <span> > </span>
            <span class="text-gray-900">{{ selectedProduct.title }}</span>
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left: Gallery -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
                  <div class="w-full h-96 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-9xl">
                    📷
                  </div>
                </div>
                <div class="flex gap-2 mb-4">
                  <div *ngFor="let i of [1,2,3,4]" class="w-20 h-20 bg-gray-200 rounded border-2 border-gray-300 cursor-pointer hover:border-indigo-500"></div>
                  <div class="w-20 h-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl cursor-pointer">
                    +6
                  </div>
                </div>
                <div class="flex gap-3">
                  <button class="px-4 py-2 border rounded-lg hover:bg-gray-50">🎥 Video</button>
                  <button class="px-4 py-2 border rounded-lg hover:bg-gray-50">📐 Vista 360°</button>
                </div>
              </div>

              <!-- Description -->
              <div class="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">📝 Descripción Completa</h3>
                <p class="text-gray-700 leading-relaxed mb-4">{{ selectedProduct.description }}</p>
                <div class="space-y-2">
                  <p *ngFor="let feature of ['Sistema de navegación avanzado', 'Asientos premium', 'Techo panorámico', 'Sistema de sonido de alta calidad']" 
                     class="text-gray-700">
                    • {{ feature }}
                  </p>
                </div>
              </div>

              <!-- How ESCROW Works -->
              <div class="bg-indigo-50 rounded-lg border border-indigo-200 p-6 mt-6">
                <h3 class="text-xl font-semibold text-indigo-900 mb-4">🔒 Cómo Funciona el ESCROW</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-white rounded-lg p-4">
                    <div class="text-2xl font-bold text-indigo-600 mb-2">1️⃣</div>
                    <h4 class="font-semibold text-gray-900 mb-1">Pago Seguro</h4>
                    <p class="text-sm text-gray-600">Tu dinero se mantiene protegido en una cuenta ESCROW</p>
                  </div>
                  <div class="bg-white rounded-lg p-4">
                    <div class="text-2xl font-bold text-indigo-600 mb-2">2️⃣</div>
                    <h4 class="font-semibold text-gray-900 mb-1">Inspección</h4>
                    <p class="text-sm text-gray-600">Tienes 7 días para inspeccionar el producto</p>
                  </div>
                  <div class="bg-white rounded-lg p-4">
                    <div class="text-2xl font-bold text-indigo-600 mb-2">3️⃣</div>
                    <h4 class="font-semibold text-gray-900 mb-1">Aceptación</h4>
                    <p class="text-sm text-gray-600">Si todo está bien, los fondos se liberan al vendedor</p>
                  </div>
                  <div class="bg-white rounded-lg p-4">
                    <div class="text-2xl font-bold text-indigo-600 mb-2">4️⃣</div>
                    <h4 class="font-semibold text-gray-900 mb-1">Garantía</h4>
                    <p class="text-sm text-gray-600">Si hay problemas, te devolvemos tu dinero</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Product Info & Actions -->
            <div class="lg:col-span-1">
              <!-- Product Info -->
              <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedProduct.title }}</h1>
                <div class="text-3xl font-bold text-indigo-600 mb-4">{{ selectedProduct.price | currency:'MXN':'symbol':'1.0-0' }}</div>
                <div class="text-sm text-gray-600 mb-4">💳 Desde {{ (selectedProduct.price / 60) | currency:'MXN':'symbol':'1.0-0' }}/mes</div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div class="font-semibold text-green-900 mb-2">🔒 Protegido por ESCROW</div>
                  <div class="text-sm text-green-700 space-y-1">
                    <div>✅ Transacción 100% segura</div>
                    <div>⚡ Inspección 7 días garantizada</div>
                  </div>
                </div>

                <!-- Specifications -->
                <div class="mb-6">
                  <h3 class="font-semibold text-gray-900 mb-3">📋 Especificaciones</h3>
                  <div class="space-y-2 text-sm" *ngIf="selectedProduct.specifications">
                    <div *ngFor="let spec of getSpecEntries(selectedProduct.specifications)" class="flex justify-between">
                      <span class="text-gray-600">{{ spec.key }}:</span>
                      <span class="font-medium text-gray-900">{{ spec.value }}</span>
                    </div>
                  </div>
                </div>

                <!-- Seller Info -->
                <div class="border-t border-gray-200 pt-6 mb-6">
                  <h3 class="font-semibold text-gray-900 mb-4">👤 Vendedor</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                        {{ selectedProduct.seller.name.charAt(0) }}
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900">{{ selectedProduct.seller.name }}</div>
                        <div class="flex items-center gap-2 text-sm">
                          <span *ngFor="let star of getStars(selectedProduct.seller.rating)" class="text-yellow-400">⭐</span>
                          <span class="text-gray-600">{{ selectedProduct.seller.rating }}/5 ({{ selectedProduct.seller.sales }} ventas)</span>
                        </div>
                      </div>
                    </div>
                    <div class="space-y-2 text-sm text-gray-700 mb-4">
                      <div *ngIf="selectedProduct.seller.verified">✅ Verificado desde 2019</div>
                      <div *ngIf="selectedProduct.seller.specialty">🏷️ {{ selectedProduct.seller.specialty }}</div>
                      <div>📍 {{ selectedProduct.location }}</div>
                      <div *ngIf="selectedProduct.seller.responseTime">⚡ Responde en {{ selectedProduct.seller.responseTime }}</div>
                    </div>
                    <div class="flex gap-2">
                      <button class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">📞 Llamar</button>
                      <button class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">💬 Chatear</button>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="border-t border-gray-200 pt-6">
                  <button 
                    routerLink="/consufin/transaccion/nueva"
                    class="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition mb-3">
                    🛒 Comprar con ESCROW
                  </button>
                  <div class="flex gap-2 mb-3">
                    <button class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">💬 Hacer Pregunta</button>
                    <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">❤️</button>
                    <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">📤</button>
                  </div>
                  <div class="text-xs text-gray-500 text-center space-y-1">
                    <div>📊 {{ selectedProduct.views }} personas vieron hoy</div>
                    <div>🔥 12 personas preguntaron</div>
                  </div>
                </div>
              </div>

              <!-- Registration CTA (if not logged in) -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 class="font-semibold text-gray-900 mb-3">🔒 ¿Quieres Comprar este Producto?</h3>
                <p class="text-sm text-gray-700 mb-4">
                  Para realizar una compra protegida con ESCROW necesitas crear una cuenta GRATUITA
                </p>
                <div class="space-y-2 text-sm text-gray-700 mb-4">
                  <div>✅ Sin costo de registro</div>
                  <div>✅ Primera transacción sin fee</div>
                  <div>✅ Acceso a ofertas exclusivas</div>
                </div>
                <a routerLink="/consufin/registro" class="block w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-center hover:bg-indigo-700 mb-2">
                  🆕 Crear Cuenta GRATIS
                </a>
                <a routerLink="/consufin/registro" class="block text-center text-sm text-indigo-600 hover:text-indigo-700">
                  🔑 ¿Ya tienes cuenta? Iniciar Sesión
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class MarketplaceComponent implements OnInit {
  searchQuery = '';
  showCatalog = false;
  showProductDetail = false;
  selectedProduct: Product | null = null;
  
  // Filters
  selectedCategories: string[] = [];
  priceRange = [0, 10000000];
  filterFiveStars = false;
  filterFourStars = false;
  onlyEscrow = true;
  onlyVerified = false;
  sortBy = 'relevance';
  currentPage = 1;
  itemsPerPage = 12;

  stats = {
    activeProducts: 12847,
    totalValue: '$2,847M MXN',
    verifiedUsers: 8923,
    satisfaction: 99.2
  };

  categories: Category[] = [
    { id: 'autos', name: 'Autos', icon: '🚗', count: 234 },
    { id: 'inmuebles', name: 'Inmuebles', icon: '🏠', count: 156 },
    { id: 'electronicos', name: 'Electrónicos', icon: '📱', count: 445 },
    { id: 'joyas', name: 'Joyas', icon: '💍', count: 89 },
    { id: 'arte', name: 'Arte', icon: '🎨', count: 67 }
  ];

  allProducts: Product[] = [
    {
      id: '1',
      title: 'Tesla Model Y 2023',
      price: 890000,
      category: 'autos',
      location: 'Ciudad de México',
      seller: {
        name: 'Juan Motors',
        verified: true,
        rating: 5,
        sales: 89,
        specialty: 'Especialista en autos eléctricos',
        responseTime: '<2 horas'
      },
      images: [],
      featured: true,
      escrow: true,
      rating: 5,
      reviews: 23,
      views: 1247,
      description: 'Tesla Model Y 2023 en perfecto estado. Vehículo eléctrico con 5,000 km. Todas las características premium incluidas.',
      specifications: {
        'Año': '2023',
        'Kilometraje': '5,000 km',
        'Motor': 'Eléctrico',
        'Autonomía': '533 km',
        'Color': 'Blanco'
      },
      publishedDate: '2025-10-15',
      status: 'active'
    },
    {
      id: '2',
      title: 'Casa en Polanco',
      price: 8500000,
      category: 'inmuebles',
      location: 'Ciudad de México',
      seller: {
        name: 'Inmobiliaria Premium',
        verified: true,
        rating: 5,
        sales: 156,
        specialty: 'Propiedades de lujo',
        responseTime: '<1 hora'
      },
      images: [],
      featured: true,
      escrow: true,
      rating: 5,
      reviews: 15,
      views: 892,
      description: 'Hermosa casa en Polanco con 3 recámaras, jardín y cochera doble. Perfecta ubicación cerca de zonas comerciales.',
      publishedDate: '2025-10-14',
      status: 'active'
    },
    {
      id: '3',
      title: 'Rolex Submariner',
      price: 245000,
      category: 'joyas',
      location: 'Guadalajara',
      seller: {
        name: 'Joyería Fina',
        verified: true,
        rating: 5,
        sales: 234,
        specialty: 'Relojes de lujo',
        responseTime: '<3 horas'
      },
      images: [],
      featured: true,
      escrow: true,
      rating: 5,
      reviews: 45,
      views: 567,
      description: 'Rolex Submariner auténtico con caja y papeles. Reloj en excelente estado.',
      publishedDate: '2025-10-13',
      status: 'active'
    },
    {
      id: '4',
      title: 'iPhone 15 Pro Max',
      price: 28000,
      category: 'electronicos',
      location: 'Monterrey',
      seller: {
        name: 'TechStore',
        verified: true,
        rating: 4.5,
        sales: 567,
        specialty: 'Tecnología',
        responseTime: '<1 hora'
      },
      images: [],
      featured: false,
      escrow: true,
      rating: 4,
      reviews: 89,
      views: 2341,
      description: 'iPhone 15 Pro Max nuevo en caja sellada. Capacidad 256GB. Garantía de Apple.',
      publishedDate: '2025-10-12',
      status: 'active'
    }
  ];

  featuredProducts: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'catalog') {
      this.showCatalog = true;
    }
    if (params.get('product')) {
      const product = this.allProducts.find(p => p.id === params.get('product'));
      if (product) {
        this.viewProduct(product);
      }
    }

    this.featuredProducts = this.allProducts.filter(p => p.featured);
    this.filteredProducts = [...this.allProducts];
  }

  searchProducts() {
    this.showCatalog = true;
    this.showProductDetail = false;
    this.applyFilters();
  }

  filterByCategory(categoryId: string) {
    if (!this.selectedCategories.includes(categoryId)) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
    this.applyFilters();
  }

  toggleCategory(categoryId: string) {
    if (this.selectedCategories.includes(categoryId)) {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.showCatalog = true;
    this.showProductDetail = false;
    
    let filtered = [...this.allProducts];

    // Category filter
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(p => this.selectedCategories.includes(p.category));
    }

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.seller.name.toLowerCase().includes(query)
      );
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= this.priceRange[0] && p.price <= this.priceRange[1]);

    // Rating filter
    if (this.filterFiveStars) {
      filtered = filtered.filter(p => p.rating === 5);
    } else if (this.filterFourStars) {
      filtered = filtered.filter(p => p.rating >= 4);
    }

    // ESCROW filter
    if (this.onlyEscrow) {
      filtered = filtered.filter(p => p.escrow);
    }

    // Verified seller filter
    if (this.onlyVerified) {
      filtered = filtered.filter(p => p.seller.verified);
    }

    // Sort
    switch (this.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    this.filteredProducts = filtered;
    this.currentPage = 1;
  }

  clearFilters() {
    this.selectedCategories = [];
    this.priceRange = [0, 10000000];
    this.filterFiveStars = false;
    this.filterFourStars = false;
    this.onlyEscrow = true;
    this.onlyVerified = false;
    this.searchQuery = '';
    this.applyFilters();
  }

  viewProduct(product: Product) {
    this.selectedProduct = product;
    this.showProductDetail = true;
    this.showCatalog = false;
    this.router.navigate(['/consufin/marketplace'], { queryParams: { product: product.id } });
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getSpecEntries(specs?: { [key: string]: string }): Array<{key: string, value: string}> {
    if (!specs) return [];
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    return Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
    }
  }
}
