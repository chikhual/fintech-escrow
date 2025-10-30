import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';
import { EscrowPage } from '../pages/escrow-page';

test.describe('Mobile Experience Tests', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let escrowPage: EscrowPage;

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    escrowPage = new EscrowPage(page);
  });

  test('@mobile @smoke Mobile login flow works correctly', async ({ page }) => {
    // Test mobile login
    await authPage.goto();
    await authPage.clickLogin();

    // Verify mobile layout
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Fill login form
    await authPage.fillLoginForm({
      email: 'buyer@test.com',
      password: 'Test123!'
    });

    // Submit login
    await authPage.submitLogin();

    // Verify successful login on mobile
    await expect(dashboardPage.getUserMenu()).toBeVisible();
  });

  test('@mobile @smoke Mobile registration flow works correctly', async ({ page }) => {
    // Test mobile registration
    await authPage.goto();
    await authPage.clickRegister();

    // Verify mobile layout
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();

    // Fill registration form
    await authPage.fillRegistrationForm({
      firstName: 'Mobile',
      lastName: 'User',
      email: 'mobile@test.com',
      phone: '+525512345678',
      password: 'Test123!',
      confirmPassword: 'Test123!',
      role: 'buyer',
      acceptTerms: true
    });

    // Submit registration
    await authPage.submitRegistration();

    // Verify registration success on mobile
    await expect(page.locator('text=Verificación de Email')).toBeVisible();
  });

  test('@mobile @smoke Mobile dashboard is responsive', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to dashboard
    await dashboardPage.goto();

    // Verify mobile dashboard layout
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Test mobile navigation
    await page.locator('[data-testid="mobile-menu-toggle"]').click();
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Test navigation items
    await expect(page.locator('text=Transacciones')).toBeVisible();
    await expect(page.locator('text=Perfil')).toBeVisible();
    await expect(page.locator('text=Configuración')).toBeVisible();
  });

  test('@mobile @smoke Mobile transaction creation works', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    // Navigate to create transaction
    await dashboardPage.gotoCreateTransaction();

    // Verify mobile form layout
    await expect(page.locator('input[name="itemName"]')).toBeVisible();
    await expect(page.locator('textarea[name="itemDescription"]')).toBeVisible();

    // Fill transaction details
    await escrowPage.fillTransactionDetails({
      itemName: 'iPhone 15 Pro Max Mobile',
      itemDescription: 'Nuevo iPhone 15 Pro Max 256GB',
      itemPrice: 35000,
      currency: 'MXN',
      category: 'Electronics',
      condition: 'Nuevo',
      inspectionPeriod: 3
    });

    // Test mobile image upload
    await escrowPage.uploadProductImages([
      'tests/fixtures/iphone-mobile.jpg'
    ]);

    // Submit transaction
    await escrowPage.submitTransaction();

    // Verify transaction created on mobile
    await expect(page.locator('text=Transacción creada exitosamente')).toBeVisible();
  });

  test('@mobile @smoke Mobile payment flow works', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Verify mobile payment form
    await expect(page.locator('select[name="paymentMethod"]')).toBeVisible();
    await expect(page.locator('input[name="cardNumber"]')).toBeVisible();

    // Fill payment details
    await escrowPage.selectPaymentMethod('credit_card');
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment successful on mobile
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();
  });

  test('@mobile @smoke Mobile transaction list is responsive', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transactions
    await dashboardPage.gotoTransactions();

    // Verify mobile transaction list
    await expect(page.locator('[data-testid="mobile-transaction-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="transaction-card"]')).toBeVisible();

    // Test mobile transaction card
    const transactionCard = page.locator('[data-testid="transaction-card"]').first();
    await expect(transactionCard.locator('[data-testid="transaction-title"]')).toBeVisible();
    await expect(transactionCard.locator('[data-testid="transaction-price"]')).toBeVisible();
    await expect(transactionCard.locator('[data-testid="transaction-status"]')).toBeVisible();

    // Test mobile transaction actions
    await transactionCard.locator('[data-testid="transaction-actions"]').click();
    await expect(page.locator('[data-testid="mobile-action-menu"]')).toBeVisible();
  });

  test('@mobile @smoke Mobile search and filters work', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transactions
    await dashboardPage.gotoTransactions();

    // Test mobile search
    await page.locator('[data-testid="mobile-search-toggle"]').click();
    await expect(page.locator('[data-testid="mobile-search-input"]')).toBeVisible();

    await page.locator('[data-testid="mobile-search-input"]').fill('iPhone');
    await page.keyboard.press('Enter');

    // Verify search results
    await expect(page.locator('text=Resultados de búsqueda')).toBeVisible();

    // Test mobile filters
    await page.locator('[data-testid="mobile-filters-toggle"]').click();
    await expect(page.locator('[data-testid="mobile-filters"]')).toBeVisible();

    await page.locator('[data-testid="status-filter"]').selectOption('completed');
    await page.locator('[data-testid="apply-filters"]').click();

    // Verify filtered results
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
  });

  test('@mobile @smoke Mobile notifications work', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Test mobile notification permission
    const permission = await page.evaluate(() => {
      return Notification.requestPermission();
    });
    expect(permission).toBe('granted');

    // Test mobile notification display
    await page.evaluate(() => {
      new Notification('Test Notification', {
        body: 'This is a test notification',
        icon: '/static/images/icon.png'
      });
    });

    // Verify notification was created
    await expect(page.locator('text=Test Notification')).toBeVisible();
  });

  test('@mobile @smoke Mobile profile management works', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to profile
    await dashboardPage.gotoProfile();

    // Verify mobile profile layout
    await expect(page.locator('[data-testid="mobile-profile-form"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();

    // Test mobile profile update
    await page.locator('input[name="firstName"]').fill('Mobile Updated');
    await page.locator('button[data-testid="save-profile"]').click();

    // Verify profile updated
    await expect(page.locator('text=Perfil actualizado')).toBeVisible();
  });

  test('@mobile @smoke Mobile settings work', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to settings
    await page.goto('/settings');

    // Verify mobile settings layout
    await expect(page.locator('[data-testid="mobile-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-sections"]')).toBeVisible();

    // Test mobile settings navigation
    await page.locator('[data-testid="security-settings"]').click();
    await expect(page.locator('[data-testid="security-settings-form"]')).toBeVisible();

    await page.locator('[data-testid="notification-settings"]').click();
    await expect(page.locator('[data-testid="notification-settings-form"]')).toBeVisible();
  });

  test('@mobile @smoke Mobile touch interactions work', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to dashboard
    await dashboardPage.goto();

    // Test mobile touch interactions
    await page.locator('[data-testid="mobile-menu-toggle"]').tap();
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Test mobile swipe gestures
    await page.locator('[data-testid="transaction-card"]').first().swipe('left');
    await expect(page.locator('[data-testid="transaction-actions"]')).toBeVisible();

    // Test mobile pull-to-refresh
    await page.locator('[data-testid="transaction-list"]').swipe('down');
    await expect(page.locator('text=Actualizando...')).toBeVisible();
  });

  test('@mobile @smoke Mobile keyboard handling works', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to search
    await dashboardPage.gotoTransactions();
    await page.locator('[data-testid="mobile-search-toggle"]').click();

    // Test mobile keyboard
    await page.locator('[data-testid="mobile-search-input"]').focus();
    await page.keyboard.type('iPhone');

    // Verify input handling
    const inputValue = await page.locator('[data-testid="mobile-search-input"]').inputValue();
    expect(inputValue).toBe('iPhone');

    // Test mobile keyboard dismissal
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="mobile-search-input"]')).not.toBeVisible();
  });

  test('@mobile @smoke Mobile offline functionality works', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to dashboard
    await dashboardPage.goto();

    // Simulate offline mode
    await page.context().setOffline(true);

    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Test offline functionality
    await page.locator('[data-testid="mobile-menu-toggle"]').click();
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Simulate online mode
    await page.context().setOffline(false);

    // Verify online indicator
    await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();
  });

  test('@mobile @smoke Mobile performance is acceptable', async ({ page }) => {
    // Test mobile page load time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 seconds max for mobile

    // Test mobile login performance
    const loginStartTime = Date.now();
    await authPage.clickLogin();
    await authPage.fillLoginForm({ email: 'buyer@test.com', password: 'Test123!' });
    await authPage.submitLogin();
    await page.waitForLoadState('networkidle');
    const loginTime = Date.now() - loginStartTime;
    
    expect(loginTime).toBeLessThan(2000); // 2 seconds max for mobile login

    // Test mobile dashboard performance
    const dashboardStartTime = Date.now();
    await dashboardPage.goto();
    await page.waitForLoadState('networkidle');
    const dashboardTime = Date.now() - dashboardStartTime;
    
    expect(dashboardTime).toBeLessThan(3000); // 3 seconds max for mobile dashboard
  });

  test('@mobile @smoke Mobile accessibility works', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to dashboard
    await dashboardPage.goto();

    // Test mobile accessibility
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="mobile-nav"]')).toHaveAttribute('role', 'navigation');
    await expect(page.locator('[data-testid="transaction-card"]')).toHaveAttribute('role', 'button');

    // Test mobile screen reader support
    await expect(page.locator('[data-testid="transaction-title"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="transaction-status"]')).toHaveAttribute('aria-label');
  });

  test('@mobile @smoke Mobile error handling works', async ({ page }) => {
    // Test mobile error pages
    await page.goto('/nonexistent-page');
    
    // Verify mobile error page
    await expect(page.locator('[data-testid="mobile-error-page"]')).toBeVisible();
    await expect(page.locator('text=Página no encontrada')).toBeVisible();
    await expect(page.locator('[data-testid="go-back-button"]')).toBeVisible();

    // Test mobile error recovery
    await page.locator('[data-testid="go-back-button"]').click();
    await expect(page.url()).toContain('/dashboard');
  });
});
