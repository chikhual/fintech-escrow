import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-access',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Acceso Rápido (Desarrollo)</h2>
        
        <div *ngIf="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-600">{{ statusMessage }}</p>
        </div>

        <div *ngIf="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {{ error }}
        </div>

        <div *ngIf="!loading && !error" class="space-y-4">
          <p class="text-gray-600 mb-4">Haciendo login automático...</p>
          <button 
            (click)="tryLogin()"
            class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
            Reintentar Login
          </button>
          <button 
            (click)="goDirectly()"
            class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition">
            Ir Directamente (Sin Autenticación)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class QuickAccessComponent implements OnInit {
  loading = true;
  error = '';
  statusMessage = 'Iniciando sesión automáticamente...';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.tryLogin();
  }

  tryLogin() {
    this.loading = true;
    this.error = '';
    this.statusMessage = 'Iniciando sesión automáticamente...';

    const credentials = {
      email: 'vendedor@test.com',
      password: 'Vendedor1$'
    };

    console.log('🚀 Quick Access: Intentando login automático...');

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Quick Access: Login exitoso');
        this.statusMessage = '¡Login exitoso! Redirigiendo...';
        setTimeout(() => {
          this.router.navigate(['/consufin/usuario']);
        }, 500);
      },
      error: (err) => {
        console.error('❌ Quick Access: Error en login:', err);
        this.loading = false;
        
        if (err.status === 0) {
          this.error = 'Error de conexión: El backend no está respondiendo. Verifica que esté corriendo en http://localhost:8001';
        } else if (err.status === 401) {
          this.error = 'Credenciales incorrectas. Verifica que el usuario vendedor@test.com exista en la base de datos.';
        } else {
          this.error = `Error: ${err.error?.detail || err.message || 'Error desconocido'}`;
        }
        this.statusMessage = 'Error al iniciar sesión';
      }
    });
  }

  goDirectly() {
    console.log('⚠️ Quick Access: Accediendo directamente sin autenticación (solo desarrollo)');
    
    // Simular un usuario básico en localStorage para que el componente no falle
    const mockUser = {
      id: 1,
      email: 'vendedor@test.com',
      first_name: 'Usuario',
      last_name: 'Prueba',
      role: 'client',
      status: 'active'
    };
    
    localStorage.setItem('consufin_user', JSON.stringify(mockUser));
    localStorage.setItem('consufin_access_token', 'dev-token-quick-access');
    
    this.router.navigate(['/consufin/usuario']);
  }
}

