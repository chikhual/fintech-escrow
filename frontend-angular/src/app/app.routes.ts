import { Routes } from '@angular/router';
import { TaskDashboardComponent } from './components/task-dashboard/task-dashboard.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';

export const routes: Routes = [
  { path: '', component: TaskDashboardComponent },
  { path: 'tasks', component: TaskManagerComponent },
  { path: '**', redirectTo: '' }
];
