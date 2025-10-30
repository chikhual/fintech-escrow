import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { EscrowPage } from '../pages/escrow-page';
import { DashboardPage } from '../pages/dashboard-page';

test.describe('Payment Processing Flow', () => {
  let authPage: AuthPage;
  let escrowPage: EscrowPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    escrowPage = new EscrowPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('@payment @smoke User can process credit card payment', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Fill payment details
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment successful
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();
    await expect(page.locator('text=Fondos en custodia')).toBeVisible();
  });

  test('@payment @smoke User can process debit card payment', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select debit card payment
    await escrowPage.selectPaymentMethod('debit_card');

    // Fill payment details
    await escrowPage.fillPaymentDetails({
      cardNumber: '4000056655665556',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment successful
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();
    await expect(page.locator('text=Fondos en custodia')).toBeVisible();
  });

  test('@payment @smoke User can process bank transfer payment', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select bank transfer payment
    await escrowPage.selectPaymentMethod('bank_transfer');

    // Verify bank transfer instructions
    await expect(page.locator('text=Instrucciones de Transferencia')).toBeVisible();
    await expect(page.locator('text=Banco:')).toBeVisible();
    await expect(page.locator('text=Cuenta:')).toBeVisible();
    await expect(page.locator('text=Referencia:')).toBeVisible();

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment pending
    await expect(page.locator('text=Pago pendiente de confirmación')).toBeVisible();
    await expect(page.locator('text=Esperando confirmación bancaria')).toBeVisible();
  });

  test('@payment @smoke Payment fails with invalid card', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Fill with invalid card details
    await escrowPage.fillPaymentDetails({
      cardNumber: '4000000000000002', // Declined card
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment failed
    await expect(page.locator('text=Pago rechazado')).toBeVisible();
    await expect(page.locator('text=Tu tarjeta fue declinada')).toBeVisible();
  });

  test('@payment @smoke Payment fails with insufficient funds', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Fill with insufficient funds card
    await escrowPage.fillPaymentDetails({
      cardNumber: '4000000000009995', // Insufficient funds
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment failed
    await expect(page.locator('text=Pago rechazado')).toBeVisible();
    await expect(page.locator('text=Fondos insuficientes')).toBeVisible();
  });

  test('@payment @smoke Payment fails with expired card', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Fill with expired card
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '01',
      expiryYear: '2020', // Expired
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment failed
    await expect(page.locator('text=Pago rechazado')).toBeVisible();
    await expect(page.locator('text=Tarjeta expirada')).toBeVisible();
  });

  test('@payment @smoke Payment fails with invalid CVV', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Fill with invalid CVV
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '999', // Invalid CVV
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment failed
    await expect(page.locator('text=Pago rechazado')).toBeVisible();
    await expect(page.locator('text=CVV inválido')).toBeVisible();
  });

  test('@payment @smoke User can retry failed payment', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Fill with invalid card details
    await escrowPage.fillPaymentDetails({
      cardNumber: '4000000000000002', // Declined card
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment failed
    await expect(page.locator('text=Pago rechazado')).toBeVisible();

    // Click retry payment
    await page.locator('button[data-testid="retry-payment"]').click();

    // Fill with valid card details
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment successful
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();
  });

  test('@payment @smoke User can cancel payment process', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Start filling payment details
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Cancel payment
    await page.locator('button[data-testid="cancel-payment"]').click();

    // Confirm cancellation
    await page.locator('button[data-testid="confirm-cancel-payment"]').click();

    // Verify payment cancelled
    await expect(page.locator('text=Pago cancelado')).toBeVisible();
    await expect(page.locator('text=Transacción pendiente de pago')).toBeVisible();
  });

  test('@payment @smoke User can view payment history', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment history
    await dashboardPage.gotoTransactionHistory();

    // Verify payment history loads
    await expect(page.locator('text=Historial de Pagos')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Verify payment details are shown
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
    await expect(page.locator('text=$35,000 MXN')).toBeVisible();
    await expect(page.locator('text=Procesado')).toBeVisible();
  });

  test('@payment @smoke User can download payment receipt', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to completed transactions
    await dashboardPage.gotoCompletedTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click view details
    await escrowPage.clickViewDetails();

    // Click download receipt
    await page.locator('button[data-testid="download-receipt"]').click();

    // Verify receipt download started
    await expect(page.locator('text=Descargando recibo')).toBeVisible();
  });

  test('@payment @smoke User can request refund', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to completed transactions
    await dashboardPage.gotoCompletedTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click view details
    await escrowPage.clickViewDetails();

    // Click request refund
    await page.locator('button[data-testid="request-refund"]').click();

    // Fill refund form
    await page.locator('textarea[name="refundReason"]').fill('Producto no cumple con las expectativas');
    await page.locator('select[name="refundType"]').selectOption('full');

    // Submit refund request
    await page.locator('button[data-testid="submit-refund-request"]').click();

    // Verify refund request submitted
    await expect(page.locator('text=Solicitud de reembolso enviada')).toBeVisible();
    await expect(page.locator('text=En revisión')).toBeVisible();
  });

  test('@payment @smoke Admin can process refund', async ({ page }) => {
    // Login as admin
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Navigate to refund requests
    await page.goto('/admin/refunds');

    // Find the refund request
    await page.locator('tr:has-text("iPhone 15 Pro Max")').first().click();

    // Review refund request
    await page.locator('button[data-testid="review-refund"]').click();

    // Approve refund
    await page.locator('button[data-testid="approve-refund"]').click();

    // Confirm approval
    await page.locator('button[data-testid="confirm-approve-refund"]').click();

    // Verify refund processed
    await expect(page.locator('text=Reembolso procesado')).toBeVisible();
    await expect(page.locator('text=Reembolso enviado al comprador')).toBeVisible();
  });

  test('@payment @smoke User can view payment status in real-time', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select credit card payment
    await escrowPage.selectPaymentMethod('credit_card');

    // Fill payment details
    await escrowPage.fillPaymentDetails({
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    });

    // Confirm payment
    await escrowPage.confirmPayment();

    // Verify payment status updates in real-time
    await expect(page.locator('text=Procesando pago...')).toBeVisible();
    await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();
    await expect(page.locator('text=Fondos en custodia')).toBeVisible();
  });

  test('@payment @smoke User can set up payment method preferences', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment settings
    await page.goto('/settings/payment');

    // Add new payment method
    await page.locator('button[data-testid="add-payment-method"]').click();

    // Fill payment method details
    await page.locator('input[name="cardNumber"]').fill('4242424242424242');
    await page.locator('input[name="expiryMonth"]').fill('12');
    await page.locator('input[name="expiryYear"]').fill('2025');
    await page.locator('input[name="cvv"]').fill('123');
    await page.locator('input[name="cardholderName"]').fill('Test User');

    // Save payment method
    await page.locator('button[data-testid="save-payment-method"]').click();

    // Verify payment method saved
    await expect(page.locator('text=Método de pago guardado')).toBeVisible();
    await expect(page.locator('text=****4242')).toBeVisible();
  });

  test('@payment @smoke User can delete payment method', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment settings
    await page.goto('/settings/payment');

    // Find the payment method
    await page.locator('tr:has-text("****4242")').first().click();

    // Click delete payment method
    await page.locator('button[data-testid="delete-payment-method"]').click();

    // Confirm deletion
    await page.locator('button[data-testid="confirm-delete-payment-method"]').click();

    // Verify payment method deleted
    await expect(page.locator('text=Método de pago eliminado')).toBeVisible();
    await expect(page.locator('text=****4242')).not.toBeVisible();
  });

  test('@payment @smoke User can view payment analytics', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment analytics
    await page.goto('/analytics/payments');

    // Verify analytics page loads
    await expect(page.locator('text=Analíticas de Pagos')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible(); // Chart

    // Verify payment statistics
    await expect(page.locator('text=Total Pagado')).toBeVisible();
    await expect(page.locator('text=Transacciones Completadas')).toBeVisible();
    await expect(page.locator('text=Método de Pago Preferido')).toBeVisible();
  });

  test('@payment @smoke User can export payment data', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment history
    await dashboardPage.gotoTransactionHistory();

    // Click export payments
    await page.locator('button[data-testid="export-payments"]').click();

    // Select export format
    await page.locator('select[name="exportFormat"]').selectOption('CSV');

    // Click export
    await page.locator('button[data-testid="confirm-export"]').click();

    // Verify export started
    await expect(page.locator('text=Exportando datos de pagos')).toBeVisible();
  });
});
