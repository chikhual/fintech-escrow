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
import { ConsufinRejectComponent } from './consufin/reject.component';
import { ConsufinDisputeComponent } from './consufin/dispute.component';
import { RoleCenterComponent } from './consufin/role-center.component';
import { UserPortalComponent } from './consufin/user-portal.component';
import { RegistrationSelectionComponent } from './consufin/registration-selection.component';
import { RegistrationWizardComponent } from './consufin/registration-wizard.component';
import { InternalAccessComponent } from './consufin/internal-access.component';
import { VerificationDashboardComponent } from './consufin/verification-dashboard.component';
import { QuickAccessComponent } from './consufin/quick-access.component';
import { DirectAccessComponent } from './consufin/direct-access.component';
import { BrokerPortalComponent } from './consufin/broker-portal.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'consufin' },
  { path: 'broker', component: BrokerDashboardComponent },
  { path: 'tasks', component: TaskManagerComponent },
  // CONSUFIN
  { path: 'consufin', component: ConsufinHomeComponent },
  { path: 'consufin/registro', component: ConsufinAuthComponent }, // Mantener para login
  { path: 'consufin/registro/seleccion', component: RegistrationSelectionComponent },
  { path: 'consufin/registro/wizard', component: RegistrationWizardComponent },
  { path: 'consufin/acceso-interno', component: InternalAccessComponent },
  { path: 'consufin/verificacion', component: VerificationDashboardComponent },
  { path: 'consufin/transaccion/nueva', component: ConsufinWizardComponent },
  { path: 'consufin/transaccion/preview', component: ConsufinTransactionDetailComponent },
  { path: 'consufin/transaccion/acciones', component: ConsufinTransactionActionsComponent },
  { path: 'consufin/transaccion/rechazo', component: ConsufinRejectComponent },
  { path: 'consufin/transaccion/disputa', component: ConsufinDisputeComponent },
  { path: 'consufin/transacciones', component: ConsufinListComponent },
  { path: 'consufin/calculadora', component: ConsufinCalculatorComponent },
  { path: 'consufin/faq', component: ConsufinFaqComponent },
  { path: 'consufin/ayuda', component: ConsufinHelpComponent },
  { path: 'consufin/contacto', component: ConsufinContactComponent },
  { path: 'consufin/validacion', component: ConsufinKycComponent },
  { path: 'consufin/integraciones', component: ConsufinIntegrationsComponent },
  { path: 'consufin/settings', component: UserSettingsComponent },
  { path: 'consufin/roles', component: RoleCenterComponent },
  { path: 'consufin/usuario', component: UserPortalComponent },
  { path: 'consufin/comprador', redirectTo: 'consufin/usuario', pathMatch: 'full' }, // Redirect old route
  { path: 'consufin/acceso-rapido', component: QuickAccessComponent }, // Acceso directo para desarrollo
  { path: 'portal', component: DirectAccessComponent }, // Acceso externo directo - URL independiente
  { path: 'broker-portal', component: BrokerPortalComponent }, // Portal Broker - Acceso directo independiente
  { path: '**', redirectTo: 'consufin' }
];
