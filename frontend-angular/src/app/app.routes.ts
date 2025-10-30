import { Routes } from '@angular/router';
import { TaskDashboardComponent } from './components/task-dashboard/task-dashboard.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { BrokerDashboardComponent } from './components/broker-dashboard/broker-dashboard.component';
import { ConsufinHomeComponent } from './consufin/home.component';
import { ConsufinAuthComponent } from './consufin/auth.component';
import { ConsufinWizardComponent } from './consufin/wizard.component';
import { ConsufinTransactionDetailComponent } from './consufin/transaction-detail.component';
import { ConsufinCalculatorComponent } from './consufin/calculator.component';
import { ConsufinListComponent } from './consufin/list.component';
import { ConsufinFaqComponent } from './consufin/faq.component';
import { ConsufinHelpComponent } from './consufin/help.component';
import { ConsufinContactComponent } from './consufin/contact.component';
import { ConsufinKycComponent } from './consufin/kyc.component';
import { ConsufinIntegrationsComponent } from './consufin/integrations.component';
import { UserSettingsComponent } from './consufin/settings.component';
import { ConsufinTransactionActionsComponent } from './consufin/transaction-actions.component';

export const routes: Routes = [
  { path: '', component: TaskDashboardComponent },
  { path: 'broker', component: BrokerDashboardComponent },
  { path: 'tasks', component: TaskManagerComponent },
  // CONSUFIN
  { path: 'consufin', component: ConsufinHomeComponent },
  { path: 'consufin/registro', component: ConsufinAuthComponent },
  { path: 'consufin/transaccion/nueva', component: ConsufinWizardComponent },
  { path: 'consufin/transaccion/preview', component: ConsufinTransactionDetailComponent },
  { path: 'consufin/transaccion/acciones', component: ConsufinTransactionActionsComponent },
  { path: 'consufin/transacciones', component: ConsufinListComponent },
  { path: 'consufin/calculadora', component: ConsufinCalculatorComponent },
  { path: 'consufin/faq', component: ConsufinFaqComponent },
  { path: 'consufin/ayuda', component: ConsufinHelpComponent },
  { path: 'consufin/contacto', component: ConsufinContactComponent },
  { path: 'consufin/validacion', component: ConsufinKycComponent },
  { path: 'consufin/integraciones', component: ConsufinIntegrationsComponent },
  { path: 'consufin/settings', component: UserSettingsComponent },
  { path: '**', redirectTo: '' }
];
