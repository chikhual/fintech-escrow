import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserPortalComponent } from './user-portal.component';

@Component({
  selector: 'app-direct-access',
  standalone: true,
  imports: [CommonModule, UserPortalComponent],
  template: `
    <app-user-portal></app-user-portal>
  `,
  styles: []
})
export class DirectAccessComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Configurar acceso directo sin autenticación
    console.log('🔓 Direct Access: Configurando acceso directo sin autenticación');
    
    // Crear datos mock de usuario para acceso directo
    const mockUser = {
      id: 1,
      email: 'vendedor@test.com',
      first_name: 'Usuario',
      last_name: 'Prueba',
      role: 'client',
      status: 'active',
      is_email_verified: true
    };
    
    // Guardar en localStorage para que el portal lo reconozca
    localStorage.setItem('consufin_user', JSON.stringify(mockUser));
    localStorage.setItem('consufin_access_token', 'direct-access-token');
    
    console.log('✅ Direct Access: Usuario mock configurado');
  }
}

