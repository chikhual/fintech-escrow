# Backup routing CONSUFIN

Archivo: frontend-angular/src/app/app.routes.ts
Fecha: 2025-10-30

Antes:
- { path: '', component: TaskDashboardComponent }
- { path: '**', redirectTo: '' }

Después:
- { path: '', pathMatch: 'full', redirectTo: 'consufin' }
- { path: '**', redirectTo: 'consufin' }

Notas:
- vercel.json mantiene rewrites a index.html
- Sin más cambios en ruteo
