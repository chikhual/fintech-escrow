import { Component } from '@angular/core';

@Component({
  selector: 'app-back-button',
  standalone: true,
  template: `
    <button (click)="goBack()" class="mb-4 inline-flex items-center gap-2 px-3 py-1.5 border rounded text-sm bg-indigo-600 text-white hover:bg-indigo-700">
      ← Regresar
    </button>
  `,
  styles: []
})
export class BackButtonComponent {
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      location.assign('/consufin');
    }
  }
}


