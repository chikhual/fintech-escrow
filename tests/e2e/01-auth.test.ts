import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';

test.describe('Authentication Flow', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('@auth @smoke User can register successfully', async ({ page }) => {
    // Navigate to registration page
    await authPage.goto();
    await authPage.clickRegister();

    // Fill registration form
    await authPage.fillRegistrationForm({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      phone: '+525512345678',
      password: 'Test123!',
      confirmPassword: 'Test123!',
      role: 'buyer',
      acceptTerms: true
    });

    // Submit registration
    await authPage.submitRegistration();

    // Verify email verification step
    await expect(page.locator('text=Verificación de Email')).toBeVisible();
    await expect(page.locator('text=Hemos enviado un enlace de verificación')).toBeVisible();

    // Mock email verification (in real test, would check email)
    await authPage.mockEmailVerification();

    // Verify KYC step appears
    await expect(page.locator('text=Verificación de Identidad')).toBeVisible();
    await expect(page.locator('text=CURP')).toBeVisible();
    await expect(page.locator('text=RFC')).toBeVisible();
    await expect(page.locator('text=INE')).toBeVisible();
  });

  test('@auth @smoke User can login successfully', async ({ page }) => {
    // Navigate to login page
    await authPage.goto();
    await authPage.clickLogin();

    // Fill login form
    await authPage.fillLoginForm({
      email: 'buyer@test.com',
      password: 'Test123!'
    });

    // Submit login
    await authPage.submitLogin();

    // Verify successful login
    await expect(dashboardPage.getUserMenu()).toBeVisible();
    await expect(dashboardPage.getWelcomeMessage()).toContainText('Bienvenido');
  });

  test('@auth @smoke User can logout successfully', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Verify logged in
    await expect(dashboardPage.getUserMenu()).toBeVisible();

    // Logout
    await dashboardPage.logout();

    // Verify logged out
    await expect(authPage.getLoginButton()).toBeVisible();
    await expect(page.url()).toContain('/login');
  });

  test('@auth @smoke User cannot login with invalid credentials', async ({ page }) => {
    await authPage.goto();
    await authPage.clickLogin();

    // Fill with invalid credentials
    await authPage.fillLoginForm({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });

    // Submit login
    await authPage.submitLogin();

    // Verify error message
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible();
    await expect(page.locator('text=Email o contraseña incorrectos')).toBeVisible();
  });

  test('@auth @smoke User cannot register with existing email', async ({ page }) => {
    await authPage.goto();
    await authPage.clickRegister();

    // Fill with existing email
    await authPage.fillRegistrationForm({
      firstName: 'Test',
      lastName: 'User',
      email: 'buyer@test.com', // Already exists
      phone: '+525512345678',
      password: 'Test123!',
      confirmPassword: 'Test123!',
      role: 'buyer',
      acceptTerms: true
    });

    // Submit registration
    await authPage.submitRegistration();

    // Verify error message
    await expect(page.locator('text=Email ya registrado')).toBeVisible();
    await expect(page.locator('text=Este email ya está en uso')).toBeVisible();
  });

  test('@auth @smoke User can reset password', async ({ page }) => {
    await authPage.goto();
    await authPage.clickLogin();
    await authPage.clickForgotPassword();

    // Fill email for password reset
    await authPage.fillEmailForReset('buyer@test.com');
    await authPage.submitPasswordReset();

    // Verify reset email sent
    await expect(page.locator('text=Email de recuperación enviado')).toBeVisible();
    await expect(page.locator('text=Revisa tu bandeja de entrada')).toBeVisible();

    // Mock password reset (in real test, would check email)
    await authPage.mockPasswordReset();

    // Verify new password form
    await expect(page.locator('text=Nueva Contraseña')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('@auth @smoke User can complete KYC verification', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to KYC verification
    await dashboardPage.gotoKYC();

    // Fill KYC form
    await authPage.fillKYCForm({
      curp: 'TEST123456HDFRRL01',
      rfc: 'TEST123456ABC',
      ine: '123456789012345678',
      address: 'Calle Test 123, Colonia Test, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '01234'
    });

    // Upload documents
    await authPage.uploadDocument('ine', 'tests/fixtures/ine-sample.jpg');
    await authPage.uploadDocument('proof_of_address', 'tests/fixtures/proof-of-address.pdf');

    // Submit KYC
    await authPage.submitKYC();

    // Verify KYC submitted
    await expect(page.locator('text=Verificación enviada')).toBeVisible();
    await expect(page.locator('text=Revisaremos tus documentos')).toBeVisible();
  });

  test('@auth @smoke User can configure 2FA', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to security settings
    await dashboardPage.gotoSecuritySettings();

    // Enable 2FA
    await authPage.enable2FA();

    // Verify QR code appears
    await expect(page.locator('text=Escanea el código QR')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();

    // Mock 2FA setup (in real test, would use authenticator app)
    await authPage.mock2FASetup();

    // Verify 2FA enabled
    await expect(page.locator('text=2FA habilitado')).toBeVisible();
    await expect(page.locator('text=Autenticación de dos factores activa')).toBeVisible();
  });

  test('@auth @smoke User session expires after timeout', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Verify logged in
    await expect(dashboardPage.getUserMenu()).toBeVisible();

    // Wait for session timeout (in real test, would configure shorter timeout)
    await page.waitForTimeout(1000); // Mock timeout

    // Try to access protected page
    await page.goto('/dashboard');

    // Verify redirected to login
    await expect(page.url()).toContain('/login');
    await expect(page.locator('text=Sesión expirada')).toBeVisible();
  });

  test('@auth @smoke User can change password', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to security settings
    await dashboardPage.gotoSecuritySettings();

    // Click change password
    await authPage.clickChangePassword();

    // Fill password change form
    await authPage.fillPasswordChangeForm({
      currentPassword: 'Test123!',
      newPassword: 'NewTest123!',
      confirmPassword: 'NewTest123!'
    });

    // Submit password change
    await authPage.submitPasswordChange();

    // Verify password changed
    await expect(page.locator('text=Contraseña actualizada')).toBeVisible();
    await expect(page.locator('text=Tu contraseña ha sido cambiada')).toBeVisible();

    // Logout and login with new password
    await dashboardPage.logout();
    await authPage.login('buyer@test.com', 'NewTest123!');

    // Verify login successful
    await expect(dashboardPage.getUserMenu()).toBeVisible();
  });

  test('@auth @smoke User can update profile information', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to profile
    await dashboardPage.gotoProfile();

    // Update profile information
    await authPage.updateProfile({
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+525598765432',
      address: 'Nueva Dirección 456, Colonia Nueva, CDMX'
    });

    // Save changes
    await authPage.saveProfile();

    // Verify profile updated
    await expect(page.locator('text=Perfil actualizado')).toBeVisible();
    await expect(page.locator('text=Updated Name')).toBeVisible();
  });

  test('@auth @smoke User cannot access admin functions without admin role', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Try to access admin page
    await page.goto('/admin');

    // Verify access denied
    await expect(page.locator('text=Acceso Denegado')).toBeVisible();
    await expect(page.locator('text=No tienes permisos para acceder')).toBeVisible();
  });

  test('@auth @smoke Admin can access admin functions', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to admin page
    await page.goto('/admin');

    // Verify admin page loads
    await expect(page.locator('text=Panel de Administración')).toBeVisible();
    await expect(page.locator('text=Gestión de Usuarios')).toBeVisible();
    await expect(page.locator('text=Estadísticas del Sistema')).toBeVisible();
  });

  test('@auth @smoke User can configure notification preferences', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to notification settings
    await dashboardPage.gotoNotificationSettings();

    // Configure notifications
    await authPage.configureNotifications({
      email: true,
      sms: false,
      push: true,
      criticalOnly: false
    });

    // Save settings
    await authPage.saveNotificationSettings();

    // Verify settings saved
    await expect(page.locator('text=Configuración guardada')).toBeVisible();
    await expect(page.locator('text=Preferencias de notificación actualizadas')).toBeVisible();
  });

  test('@auth @smoke User can delete account', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to account settings
    await dashboardPage.gotoAccountSettings();

    // Click delete account
    await authPage.clickDeleteAccount();

    // Confirm deletion
    await authPage.confirmAccountDeletion('Test123!');

    // Verify account deleted
    await expect(page.locator('text=Cuenta eliminada')).toBeVisible();
    await expect(page.locator('text=Tu cuenta ha sido eliminada')).toBeVisible();

    // Verify redirected to home
    await expect(page.url()).toContain('/');
  });
});
