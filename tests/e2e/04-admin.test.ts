import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';

test.describe('Admin Functions', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('@admin @smoke Admin can view system dashboard', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to admin dashboard
    await page.goto('/admin');

    // Verify admin dashboard loads
    await expect(page.locator('text=Panel de Administración')).toBeVisible();
    await expect(page.locator('text=Estadísticas del Sistema')).toBeVisible();
    await expect(page.locator('text=Usuarios Activos')).toBeVisible();
    await expect(page.locator('text=Transacciones Totales')).toBeVisible();
    await expect(page.locator('text=Ingresos Totales')).toBeVisible();
  });

  test('@admin @smoke Admin can manage users', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to user management
    await page.goto('/admin/users');

    // Verify user management page loads
    await expect(page.locator('text=Gestión de Usuarios')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Search for a user
    await page.locator('input[data-testid="user-search"]').fill('buyer@test.com');
    await page.keyboard.press('Enter');

    // Verify search results
    await expect(page.locator('tr:has-text("buyer@test.com")')).toBeVisible();

    // Click on user to view details
    await page.locator('tr:has-text("buyer@test.com")').first().click();

    // Verify user details page
    await expect(page.locator('text=Detalles del Usuario')).toBeVisible();
    await expect(page.locator('text=buyer@test.com')).toBeVisible();
  });

  test('@admin @smoke Admin can update user role', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to user management
    await page.goto('/admin/users');

    // Find user
    await page.locator('input[data-testid="user-search"]').fill('buyer@test.com');
    await page.keyboard.press('Enter');

    // Click on user
    await page.locator('tr:has-text("buyer@test.com")').first().click();

    // Click edit user
    await page.locator('button[data-testid="edit-user"]').click();

    // Change role
    await page.locator('select[name="role"]').selectOption('advisor');

    // Save changes
    await page.locator('button[data-testid="save-user"]').click();

    // Verify role updated
    await expect(page.locator('text=Usuario actualizado')).toBeVisible();
    await expect(page.locator('text=advisor')).toBeVisible();
  });

  test('@admin @smoke Admin can suspend user account', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to user management
    await page.goto('/admin/users');

    // Find user
    await page.locator('input[data-testid="user-search"]').fill('buyer@test.com');
    await page.keyboard.press('Enter');

    // Click on user
    await page.locator('tr:has-text("buyer@test.com")').first().click();

    // Click suspend user
    await page.locator('button[data-testid="suspend-user"]').click();

    // Provide suspension reason
    await page.locator('textarea[name="suspensionReason"]').fill('Violación de términos de servicio');

    // Confirm suspension
    await page.locator('button[data-testid="confirm-suspend"]').click();

    // Verify user suspended
    await expect(page.locator('text=Usuario suspendido')).toBeVisible();
    await expect(page.locator('text=Estado: Suspendido')).toBeVisible();
  });

  test('@admin @smoke Admin can view all transactions', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to transactions
    await page.goto('/admin/transactions');

    // Verify transactions page loads
    await expect(page.locator('text=Gestión de Transacciones')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Filter transactions
    await page.locator('select[data-testid="status-filter"]').selectOption('completed');
    await page.locator('select[data-testid="date-filter"]').selectOption('last_30_days');

    // Verify filtered results
    await expect(page.locator('tr')).toHaveCount(1); // Should have at least one completed transaction
  });

  test('@admin @smoke Admin can view transaction details', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to transactions
    await page.goto('/admin/transactions');

    // Find transaction
    await page.locator('tr:has-text("iPhone 15 Pro Max")').first().click();

    // Verify transaction details
    await expect(page.locator('text=Detalles de Transacción')).toBeVisible();
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
    await expect(page.locator('text=$35,000 MXN')).toBeVisible();
  });

  test('@admin @smoke Admin can cancel transaction', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to transactions
    await page.goto('/admin/transactions');

    // Find transaction
    await page.locator('tr:has-text("iPhone 15 Pro Max")').first().click();

    // Click cancel transaction
    await page.locator('button[data-testid="cancel-transaction"]').click();

    // Provide cancellation reason
    await page.locator('textarea[name="cancellationReason"]').fill('Solicitud del administrador');

    // Confirm cancellation
    await page.locator('button[data-testid="confirm-cancel"]').click();

    // Verify transaction cancelled
    await expect(page.locator('text=Transacción cancelada')).toBeVisible();
    await expect(page.locator('text=Estado: Cancelada')).toBeVisible();
  });

  test('@admin @smoke Admin can view disputes', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to disputes
    await page.goto('/admin/disputes');

    // Verify disputes page loads
    await expect(page.locator('text=Gestión de Disputas')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Filter disputes
    await page.locator('select[data-testid="dispute-status-filter"]').selectOption('open');

    // Verify filtered results
    await expect(page.locator('tr')).toHaveCount(1); // Should have at least one open dispute
  });

  test('@admin @smoke Admin can resolve dispute', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to disputes
    await page.goto('/admin/disputes');

    // Find dispute
    await page.locator('tr:has-text("iPhone 15 Pro Max")').first().click();

    // Review dispute details
    await expect(page.locator('text=Detalles de Disputa')).toBeVisible();

    // Make decision
    await page.locator('select[name="disputeDecision"]').selectOption('refund_buyer');
    await page.locator('textarea[name="decisionReason"]').fill('Evidencia clara de daño en el producto');
    await page.locator('input[name="refundAmount"]').fill('35000');

    // Submit decision
    await page.locator('button[data-testid="submit-decision"]').click();

    // Verify dispute resolved
    await expect(page.locator('text=Disputa resuelta')).toBeVisible();
    await expect(page.locator('text=Estado: Resuelta')).toBeVisible();
  });

  test('@admin @smoke Admin can view system logs', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to system logs
    await page.goto('/admin/logs');

    // Verify logs page loads
    await expect(page.locator('text=Registros del Sistema')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Filter logs
    await page.locator('select[data-testid="log-level-filter"]').selectOption('ERROR');
    await page.locator('input[data-testid="log-date-filter"]').fill('2024-01-30');

    // Verify filtered results
    await expect(page.locator('tr')).toHaveCount(1); // Should have at least one error log
  });

  test('@admin @smoke Admin can view system metrics', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to system metrics
    await page.goto('/admin/metrics');

    // Verify metrics page loads
    await expect(page.locator('text=Métricas del Sistema')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible(); // Charts

    // Verify key metrics are displayed
    await expect(page.locator('text=Usuarios Activos')).toBeVisible();
    await expect(page.locator('text=Transacciones por Hora')).toBeVisible();
    await expect(page.locator('text=Tiempo de Respuesta')).toBeVisible();
    await expect(page.locator('text=Uso de Memoria')).toBeVisible();
  });

  test('@admin @smoke Admin can manage system settings', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to system settings
    await page.goto('/admin/settings');

    // Verify settings page loads
    await expect(page.locator('text=Configuración del Sistema')).toBeVisible();

    // Update system settings
    await page.locator('input[name="maxTransactionAmount"]').fill('1000000');
    await page.locator('input[name="inspectionPeriodDays"]').fill('5');
    await page.locator('input[name="escrowFeePercentage"]').fill('2.5');

    // Save settings
    await page.locator('button[data-testid="save-settings"]').click();

    // Verify settings saved
    await expect(page.locator('text=Configuración guardada')).toBeVisible();
  });

  test('@admin @smoke Admin can view audit trail', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to audit trail
    await page.goto('/admin/audit');

    // Verify audit trail page loads
    await expect(page.locator('text=Registro de Auditoría')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Filter audit trail
    await page.locator('select[data-testid="action-filter"]').selectOption('user_login');
    await page.locator('input[data-testid="user-filter"]').fill('buyer@test.com');

    // Verify filtered results
    await expect(page.locator('tr')).toHaveCount(1); // Should have at least one login event
  });

  test('@admin @smoke Admin can export system data', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to data export
    await page.goto('/admin/export');

    // Verify export page loads
    await expect(page.locator('text=Exportar Datos del Sistema')).toBeVisible();

    // Select data to export
    await page.locator('input[name="exportUsers"]').check();
    await page.locator('input[name="exportTransactions"]').check();
    await page.locator('input[name="exportLogs"]').check();

    // Select date range
    await page.locator('input[name="startDate"]').fill('2024-01-01');
    await page.locator('input[name="endDate"]').fill('2024-01-31');

    // Select export format
    await page.locator('select[name="exportFormat"]').selectOption('CSV');

    // Start export
    await page.locator('button[data-testid="start-export"]').click();

    // Verify export started
    await expect(page.locator('text=Exportando datos')).toBeVisible();
  });

  test('@admin @smoke Admin can view security alerts', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to security alerts
    await page.goto('/admin/security');

    // Verify security page loads
    await expect(page.locator('text=Alertas de Seguridad')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Filter alerts
    await page.locator('select[data-testid="severity-filter"]').selectOption('HIGH');

    // Verify filtered results
    await expect(page.locator('tr')).toHaveCount(1); // Should have at least one high severity alert
  });

  test('@admin @smoke Admin can manage API keys', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to API management
    await page.goto('/admin/api');

    // Verify API page loads
    await expect(page.locator('text=Gestión de API')).toBeVisible();

    // Create new API key
    await page.locator('button[data-testid="create-api-key"]').click();

    // Fill API key details
    await page.locator('input[name="keyName"]').fill('Test API Key');
    await page.locator('textarea[name="description"]').fill('API key for testing purposes');
    await page.locator('select[name="permissions"]').selectOption('read_write');

    // Create API key
    await page.locator('button[data-testid="create-key"]').click();

    // Verify API key created
    await expect(page.locator('text=API key creada')).toBeVisible();
    await expect(page.locator('text=Test API Key')).toBeVisible();
  });

  test('@admin @smoke Admin can view user activity', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to user activity
    await page.goto('/admin/activity');

    // Verify activity page loads
    await expect(page.locator('text=Actividad de Usuarios')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Filter activity
    await page.locator('input[data-testid="user-filter"]').fill('buyer@test.com');
    await page.locator('select[data-testid="activity-filter"]').selectOption('login');

    // Verify filtered results
    await expect(page.locator('tr')).toHaveCount(1); // Should have at least one login activity
  });

  test('@admin @smoke Admin can view system health', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to system health
    await page.goto('/admin/health');

    // Verify health page loads
    await expect(page.locator('text=Estado del Sistema')).toBeVisible();

    // Verify health indicators
    await expect(page.locator('text=Base de Datos')).toBeVisible();
    await expect(page.locator('text=Redis')).toBeVisible();
    await expect(page.locator('text=Stripe')).toBeVisible();
    await expect(page.locator('text=SendGrid')).toBeVisible();

    // Verify all services are healthy
    await expect(page.locator('text=✅ Saludable')).toBeVisible();
  });

  test('@admin @smoke Admin can view financial reports', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to financial reports
    await page.goto('/admin/reports/financial');

    // Verify reports page loads
    await expect(page.locator('text=Reportes Financieros')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible(); // Charts

    // Verify key financial metrics
    await expect(page.locator('text=Ingresos Totales')).toBeVisible();
    await expect(page.locator('text=Comisiones')).toBeVisible();
    await expect(page.locator('text=Reembolsos')).toBeVisible();
    await expect(page.locator('text=Ganancias Netas')).toBeVisible();
  });

  test('@admin @smoke Admin can manage notifications', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to notification management
    await page.goto('/admin/notifications');

    // Verify notifications page loads
    await expect(page.locator('text=Gestión de Notificaciones')).toBeVisible();

    // Send system notification
    await page.locator('button[data-testid="send-notification"]').click();

    // Fill notification details
    await page.locator('input[name="title"]').fill('Mantenimiento Programado');
    await page.locator('textarea[name="message"]').fill('El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 4:00 AM');
    await page.locator('select[name="type"]').selectOption('maintenance');

    // Send notification
    await page.locator('button[data-testid="send-notification-btn"]').click();

    // Verify notification sent
    await expect(page.locator('text=Notificación enviada')).toBeVisible();
  });
});
