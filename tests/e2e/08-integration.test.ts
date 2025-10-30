import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';
import { EscrowPage } from '../pages/escrow-page';

test.describe('Integration Tests', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let escrowPage: EscrowPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    escrowPage = new EscrowPage(page);
  });

  test('@integration @smoke Complete ESCROW transaction flow', async ({ page }) => {
    // Step 1: Seller creates transaction
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    await dashboardPage.gotoCreateTransaction();
    await escrowPage.fillTransactionDetails({
      itemName: 'MacBook Pro M3 Integration Test',
      itemDescription: 'MacBook Pro 14" con chip M3, 512GB SSD',
      itemPrice: 45000,
      currency: 'MXN',
      category: 'Electronics',
      condition: 'Nuevo',
      inspectionPeriod: 3
    });

    await escrowPage.uploadProductImages([
      'tests/fixtures/macbook-front.jpg',
      'tests/fixtures/macbook-back.jpg'
    ]);

    await escrowPage.setDeliveryTerms({
      shippingMethod: 'FedEx',
      estimatedDelivery: 2,
      shippingCost: 800,
      insurance: true
    });

    await escrowPage.selectBuyer('buyer@test.com');
    await escrowPage.submitTransaction();

    // Verify transaction created
    await expect(page.locator('text=Transacción creada exitosamente')).toBeVisible();

    // Step 2: Buyer accepts transaction
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    await dashboardPage.gotoPendingTransactions();
    await escrowPage.findTransaction('MacBook Pro M3 Integration Test');
    await escrowPage.acceptTransaction();
    await escrowPage.confirmAcceptance();

    // Verify transaction accepted
    await expect(page.locator('text=Transacción aceptada')).toBeVisible();

    // Step 3: Buyer makes payment
    await dashboardPage.gotoPaymentPendingTransactions();
    await escrowPage.findTransaction('MacBook Pro M3 Integration Test');
    await escrowPage.clickMakePayment();
    await escrowPage.selectPaymentMethod('credit_card');
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });
    await escrowPage.confirmPayment();

    // Verify payment successful
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();

    // Step 4: Seller ships item
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    await dashboardPage.gotoReadyToShipTransactions();
    await escrowPage.findTransaction('MacBook Pro M3 Integration Test');
    await escrowPage.clickMarkAsShipped();
    await escrowPage.fillShippingDetails({
      trackingNumber: '1Z999AA1234567890',
      carrier: 'FedEx',
      shippingDate: '2024-01-30',
      estimatedDelivery: '2024-02-01'
    });
    await escrowPage.uploadShippingReceipt('tests/fixtures/shipping-receipt.pdf');
    await escrowPage.submitShipping();

    // Verify item shipped
    await expect(page.locator('text=Artículo marcado como enviado')).toBeVisible();

    // Step 5: Buyer confirms delivery
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    await dashboardPage.gotoInTransitTransactions();
    await escrowPage.findTransaction('MacBook Pro M3 Integration Test');
    await escrowPage.clickConfirmDelivery();
    await escrowPage.confirmItemReceived();

    // Verify delivery confirmed
    await expect(page.locator('text=Entrega confirmada')).toBeVisible();

    // Step 6: Buyer approves transaction
    await dashboardPage.gotoInspectionPeriodTransactions();
    await escrowPage.findTransaction('MacBook Pro M3 Integration Test');
    await escrowPage.inspectItem();
    await escrowPage.approveTransaction();
    await escrowPage.confirmApproval();

    // Verify transaction approved
    await expect(page.locator('text=Transacción aprobada')).toBeVisible();

    // Step 7: Seller approves completion
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    await dashboardPage.gotoPendingApprovalTransactions();
    await escrowPage.findTransaction('MacBook Pro M3 Integration Test');
    await escrowPage.approveCompletion();
    await escrowPage.confirmCompletionApproval();

    // Verify transaction completed
    await expect(page.locator('text=Transacción completada')).toBeVisible();
    await expect(page.locator('text=Fondos liberados')).toBeVisible();
  });

  test('@integration @smoke Complete dispute resolution flow', async ({ page }) => {
    // Step 1: Create a transaction with dispute
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    await dashboardPage.gotoInspectionPeriodTransactions();
    await escrowPage.findTransaction('iPhone 15 Pro Max');
    await escrowPage.clickCreateDispute();
    await escrowPage.fillDisputeDetails({
      reason: 'item_damaged',
      description: 'El iPhone llegó con la pantalla rota',
      resolution: 'refund'
    });
    await escrowPage.uploadDisputeEvidence([
      'tests/fixtures/damaged-phone-1.jpg',
      'tests/fixtures/damaged-phone-2.jpg'
    ]);
    await escrowPage.submitDispute();

    // Verify dispute created
    await expect(page.locator('text=Disputa creada')).toBeVisible();

    // Step 2: Advisor reviews dispute
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('advisor@test.com', 'Test123!');

    await dashboardPage.gotoDisputes();
    await escrowPage.findDispute('iPhone 15 Pro Max');
    await escrowPage.reviewDisputeDetails();
    await escrowPage.reviewDisputeEvidence();
    await escrowPage.makeDisputeDecision({
      decision: 'refund_buyer',
      reason: 'Evidencia clara de daño en el producto',
      refundAmount: 35000
    });
    await escrowPage.submitDisputeDecision();

    // Verify dispute resolved
    await expect(page.locator('text=Disputa resuelta')).toBeVisible();
    await expect(page.locator('text=Reembolso procesado')).toBeVisible();
  });

  test('@integration @smoke Complete KYC verification flow', async ({ page }) => {
    // Step 1: User registers
    await authPage.goto();
    await authPage.clickRegister();
    await authPage.fillRegistrationForm({
      firstName: 'KYC',
      lastName: 'Test',
      email: 'kyc@test.com',
      phone: '+525512345678',
      password: 'Test123!',
      confirmPassword: 'Test123!',
      role: 'buyer',
      acceptTerms: true
    });
    await authPage.submitRegistration();

    // Step 2: Email verification
    await authPage.mockEmailVerification();

    // Step 3: KYC verification
    await authPage.fillKYCForm({
      curp: 'KYCT123456HDFRRL01',
      rfc: 'KYCT123456ABC',
      ine: '123456789012345678',
      address: 'Calle KYC 123, Colonia Test, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '01234'
    });

    await authPage.uploadDocument('ine', 'tests/fixtures/ine-sample.jpg');
    await authPage.uploadDocument('proof_of_address', 'tests/fixtures/proof-of-address.pdf');
    await authPage.submitKYC();

    // Verify KYC submitted
    await expect(page.locator('text=Verificación enviada')).toBeVisible();

    // Step 4: Admin approves KYC
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    await page.goto('/admin/kyc');
    await page.locator('tr:has-text("kyc@test.com")').first().click();
    await page.locator('button[data-testid="approve-kyc"]').click();
    await page.locator('button[data-testid="confirm-approve"]').click();

    // Verify KYC approved
    await expect(page.locator('text=KYC aprobado')).toBeVisible();

    // Step 5: User can now access full functionality
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('kyc@test.com', 'Test123!');

    await dashboardPage.goto();
    await expect(dashboardPage.getUserMenu()).toBeVisible();
  });

  test('@integration @smoke Complete notification flow', async ({ page }) => {
    // Step 1: Configure notification preferences
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    await dashboardPage.gotoNotificationSettings();
    await authPage.configureNotifications({
      email: true,
      sms: false,
      push: true,
      criticalOnly: false
    });
    await authPage.saveNotificationSettings();

    // Verify notification settings saved
    await expect(page.locator('text=Configuración guardada')).toBeVisible();

    // Step 2: Trigger notification
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    await dashboardPage.gotoCreateTransaction();
    await escrowPage.fillTransactionDetails({
      itemName: 'Notification Test Item',
      itemDescription: 'Item for testing notifications',
      itemPrice: 1000,
      currency: 'MXN',
      category: 'Electronics',
      condition: 'Nuevo',
      inspectionPeriod: 3
    });
    await escrowPage.selectBuyer('buyer@test.com');
    await escrowPage.submitTransaction();

    // Step 3: Verify notification received
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible();
    await page.locator('[data-testid="notification-badge"]').click();
    await expect(page.locator('text=Nueva transacción creada')).toBeVisible();
  });

  test('@integration @smoke Complete admin management flow', async ({ page }) => {
    // Step 1: Admin views system dashboard
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    await page.goto('/admin');
    await expect(page.locator('text=Panel de Administración')).toBeVisible();

    // Step 2: Admin manages users
    await page.goto('/admin/users');
    await page.locator('input[data-testid="user-search"]').fill('buyer@test.com');
    await page.keyboard.press('Enter');
    await page.locator('tr:has-text("buyer@test.com")').first().click();
    await page.locator('button[data-testid="edit-user"]').click();
    await page.locator('select[name="role"]').selectOption('advisor');
    await page.locator('button[data-testid="save-user"]').click();

    // Verify user role updated
    await expect(page.locator('text=Usuario actualizado')).toBeVisible();

    // Step 3: Admin views system metrics
    await page.goto('/admin/metrics');
    await expect(page.locator('text=Métricas del Sistema')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();

    // Step 4: Admin exports system data
    await page.goto('/admin/export');
    await page.locator('input[name="exportUsers"]').check();
    await page.locator('input[name="exportTransactions"]').check();
    await page.locator('select[name="exportFormat"]').selectOption('CSV');
    await page.locator('button[data-testid="start-export"]').click();

    // Verify export started
    await expect(page.locator('text=Exportando datos')).toBeVisible();
  });

  test('@integration @smoke Complete payment integration flow', async ({ page }) => {
    // Step 1: Create transaction
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    await dashboardPage.gotoCreateTransaction();
    await escrowPage.fillTransactionDetails({
      itemName: 'Payment Integration Test',
      itemDescription: 'Item for testing payment integration',
      itemPrice: 5000,
      currency: 'MXN',
      category: 'Electronics',
      condition: 'Nuevo',
      inspectionPeriod: 3
    });
    await escrowPage.selectBuyer('buyer@test.com');
    await escrowPage.submitTransaction();

    // Step 2: Buyer accepts and pays
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    await dashboardPage.gotoPendingTransactions();
    await escrowPage.findTransaction('Payment Integration Test');
    await escrowPage.acceptTransaction();
    await escrowPage.confirmAcceptance();

    await dashboardPage.gotoPaymentPendingTransactions();
    await escrowPage.findTransaction('Payment Integration Test');
    await escrowPage.clickMakePayment();
    await escrowPage.selectPaymentMethod('credit_card');
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });
    await escrowPage.confirmPayment();

    // Verify payment successful
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();

    // Step 3: Verify Stripe webhook processing
    await page.waitForTimeout(2000); // Wait for webhook processing
    await page.reload();
    await expect(page.locator('text=Fondos en custodia')).toBeVisible();
  });

  test('@integration @smoke Complete mobile integration flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Step 1: Mobile login
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Step 2: Mobile dashboard
    await dashboardPage.goto();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Step 3: Mobile transaction creation
    await page.locator('[data-testid="mobile-menu-toggle"]').click();
    await page.locator('text=Crear Transacción').click();

    await escrowPage.fillTransactionDetails({
      itemName: 'Mobile Integration Test',
      itemDescription: 'Item for testing mobile integration',
      itemPrice: 3000,
      currency: 'MXN',
      category: 'Electronics',
      condition: 'Nuevo',
      inspectionPeriod: 3
    });

    await escrowPage.selectBuyer('seller@test.com');
    await escrowPage.submitTransaction();

    // Verify mobile transaction created
    await expect(page.locator('text=Transacción creada exitosamente')).toBeVisible();

    // Step 4: Mobile payment
    await page.locator('[data-testid="mobile-menu-toggle"]').click();
    await page.locator('text=Pagos Pendientes').click();

    await escrowPage.findTransaction('Mobile Integration Test');
    await escrowPage.clickMakePayment();
    await escrowPage.selectPaymentMethod('credit_card');
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });
    await escrowPage.confirmPayment();

    // Verify mobile payment successful
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();
  });

  test('@integration @smoke Complete error handling flow', async ({ page }) => {
    // Step 1: Test network error handling
    await page.context().setOffline(true);
    await authPage.goto();
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    await page.context().setOffline(false);
    await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();

    // Step 2: Test API error handling
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Simulate API error
    await page.route('**/api/transactions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await dashboardPage.gotoTransactions();
    await expect(page.locator('text=Error del servidor')).toBeVisible();

    // Step 3: Test recovery from error
    await page.unroute('**/api/transactions');
    await page.reload();
    await expect(page.locator('table')).toBeVisible();
  });

  test('@integration @smoke Complete performance integration flow', async ({ page }) => {
    // Step 1: Test page load performance
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);

    // Step 2: Test login performance
    const loginStartTime = Date.now();
    await authPage.clickLogin();
    await authPage.fillLoginForm({ email: 'buyer@test.com', password: 'Test123!' });
    await authPage.submitLogin();
    await page.waitForLoadState('networkidle');
    const loginTime = Date.now() - loginStartTime;
    expect(loginTime).toBeLessThan(2000);

    // Step 3: Test dashboard performance
    const dashboardStartTime = Date.now();
    await dashboardPage.goto();
    await page.waitForLoadState('networkidle');
    const dashboardTime = Date.now() - dashboardStartTime;
    expect(dashboardTime).toBeLessThan(3000);

    // Step 4: Test API performance
    const apiStartTime = Date.now();
    const response = await page.request.get('/api/transactions');
    const apiTime = Date.now() - apiStartTime;
    expect(apiTime).toBeLessThan(500);
    expect(response.status()).toBe(200);
  });
});
