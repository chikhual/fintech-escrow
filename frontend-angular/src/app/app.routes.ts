import { Routes } from '@angular/router';
import { TaskDashboardComponent } from './components/task-dashboard/task-dashboard.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { BrokerDashboardComponent } from './components/broker-dashboard/broker-dashboard.component';

export const routes: Routes = [
  { path: '', component: TaskDashboardComponent },
  { path: 'broker', component: BrokerDashboardComponent },
  { path: 'tasks', component: TaskManagerComponent },
  { path: '**', redirectTo: '' }
];
