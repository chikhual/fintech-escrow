import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { EscrowPage } from '../pages/escrow-page';
import { DashboardPage } from '../pages/dashboard-page';

test.describe('ESCROW Transaction Flow', () => {
  let authPage: AuthPage;
  let escrowPage: EscrowPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    escrowPage = new EscrowPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('@escrow @smoke Seller can create new ESCROW transaction', async ({ page }) => {
    // Login as seller
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    // Navigate to create transaction
    await dashboardPage.gotoCreateTransaction();

    // Fill transaction details
    await escrowPage.fillTransactionDetails({
      itemName: 'iPhone 15 Pro Max',
      itemDescription: 'Nuevo iPhone 15 Pro Max 256GB en caja sellada',
      itemPrice: 35000,
      currency: 'MXN',
      category: 'Electronics',
      condition: 'Nuevo',
      inspectionPeriod: 3
    });

    // Add product images
    await escrowPage.uploadProductImages([
      'tests/fixtures/iphone-front.jpg',
      'tests/fixtures/iphone-back.jpg',
      'tests/fixtures/iphone-box.jpg'
    ]);

    // Set delivery terms
    await escrowPage.setDeliveryTerms({
      shippingMethod: 'FedEx',
      estimatedDelivery: 2,
      shippingCost: 500,
      insurance: true
    });

    // Add special terms
    await escrowPage.addSpecialTerms('Producto debe estar en perfecto estado. No se aceptan devoluciones por daños causados por el comprador.');

    // Select buyer
    await escrowPage.selectBuyer('buyer@test.com');

    // Review and submit
    await escrowPage.reviewTransaction();
    await escrowPage.submitTransaction();

    // Verify transaction created
    await expect(page.locator('text=Transacción creada exitosamente')).toBeVisible();
    await expect(page.locator('text=Esperando aceptación del comprador')).toBeVisible();
  });

  test('@escrow @smoke Buyer can accept ESCROW transaction', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to pending transactions
    await dashboardPage.gotoPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Review transaction details
    await escrowPage.reviewTransactionDetails();

    // Accept transaction
    await escrowPage.acceptTransaction();

    // Confirm acceptance
    await escrowPage.confirmAcceptance();

    // Verify transaction accepted
    await expect(page.locator('text=Transacción aceptada')).toBeVisible();
    await expect(page.locator('text=Esperando pago')).toBeVisible();
  });

  test('@escrow @smoke Buyer can make payment for ESCROW transaction', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to payment pending transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click make payment
    await escrowPage.clickMakePayment();

    // Select payment method
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

  test('@escrow @smoke Seller can mark item as shipped', async ({ page }) => {
    // Login as seller
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    // Navigate to ready to ship transactions
    await dashboardPage.gotoReadyToShipTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click mark as shipped
    await escrowPage.clickMarkAsShipped();

    // Fill shipping details
    await escrowPage.fillShippingDetails({
      trackingNumber: '1Z999AA1234567890',
      carrier: 'FedEx',
      shippingDate: '2024-01-30',
      estimatedDelivery: '2024-02-01'
    });

    // Upload shipping receipt
    await escrowPage.uploadShippingReceipt('tests/fixtures/shipping-receipt.pdf');

    // Submit shipping
    await escrowPage.submitShipping();

    // Verify item shipped
    await expect(page.locator('text=Artículo marcado como enviado')).toBeVisible();
    await expect(page.locator('text=En tránsito')).toBeVisible();
  });

  test('@escrow @smoke Buyer can confirm item delivery', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to in transit transactions
    await dashboardPage.gotoInTransitTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click confirm delivery
    await escrowPage.clickConfirmDelivery();

    // Confirm item received
    await escrowPage.confirmItemReceived();

    // Verify delivery confirmed
    await expect(page.locator('text=Entrega confirmada')).toBeVisible();
    await expect(page.locator('text=Período de inspección iniciado')).toBeVisible();
  });

  test('@escrow @smoke Buyer can approve transaction after inspection', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to inspection period transactions
    await dashboardPage.gotoInspectionPeriodTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Inspect item
    await escrowPage.inspectItem();

    // Approve transaction
    await escrowPage.approveTransaction();

    // Confirm approval
    await escrowPage.confirmApproval();

    // Verify transaction approved
    await expect(page.locator('text=Transacción aprobada')).toBeVisible();
    await expect(page.locator('text=Esperando aprobación del vendedor')).toBeVisible();
  });

  test('@escrow @smoke Seller can approve transaction completion', async ({ page }) => {
    // Login as seller
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    // Navigate to pending approval transactions
    await dashboardPage.gotoPendingApprovalTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Approve completion
    await escrowPage.approveCompletion();

    // Confirm approval
    await escrowPage.confirmCompletionApproval();

    // Verify transaction completed
    await expect(page.locator('text=Transacción completada')).toBeVisible();
    await expect(page.locator('text=Fondos liberados')).toBeVisible();
  });

  test('@escrow @smoke Buyer can create dispute during inspection period', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to inspection period transactions
    await dashboardPage.gotoInspectionPeriodTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click create dispute
    await escrowPage.clickCreateDispute();

    // Fill dispute details
    await escrowPage.fillDisputeDetails({
      reason: 'item_damaged',
      description: 'El iPhone llegó con la pantalla rota',
      resolution: 'refund'
    });

    // Upload evidence
    await escrowPage.uploadDisputeEvidence([
      'tests/fixtures/damaged-phone-1.jpg',
      'tests/fixtures/damaged-phone-2.jpg'
    ]);

    // Submit dispute
    await escrowPage.submitDispute();

    // Verify dispute created
    await expect(page.locator('text=Disputa creada')).toBeVisible();
    await expect(page.locator('text=En revisión')).toBeVisible();
  });

  test('@escrow @smoke Advisor can resolve dispute', async ({ page }) => {
    // Login as advisor
    await authPage.goto();
    await authPage.login('advisor@test.com', 'Test123!');

    // Navigate to disputes
    await dashboardPage.gotoDisputes();

    // Find the dispute
    await escrowPage.findDispute('iPhone 15 Pro Max');

    // Review dispute details
    await escrowPage.reviewDisputeDetails();

    // Review evidence
    await escrowPage.reviewDisputeEvidence();

    // Make decision
    await escrowPage.makeDisputeDecision({
      decision: 'refund_buyer',
      reason: 'Evidencia clara de daño en el producto',
      refundAmount: 35000
    });

    // Submit decision
    await escrowPage.submitDisputeDecision();

    // Verify dispute resolved
    await expect(page.locator('text=Disputa resuelta')).toBeVisible();
    await expect(page.locator('text=Reembolso procesado')).toBeVisible();
  });

  test('@escrow @smoke User can cancel transaction before payment', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to pending payment transactions
    await dashboardPage.gotoPaymentPendingTransactions();

    // Find the transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click cancel transaction
    await escrowPage.clickCancelTransaction();

    // Provide cancellation reason
    await escrowPage.provideCancellationReason('Cambié de opinión');

    // Confirm cancellation
    await escrowPage.confirmCancellation();

    // Verify transaction cancelled
    await expect(page.locator('text=Transacción cancelada')).toBeVisible();
    await expect(page.locator('text=Sin penalización')).toBeVisible();
  });

  test('@escrow @smoke User can view transaction history', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transaction history
    await dashboardPage.gotoTransactionHistory();

    // Verify transaction history loads
    await expect(page.locator('text=Historial de Transacciones')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Filter transactions
    await escrowPage.filterTransactions({
      status: 'completed',
      dateRange: 'last_30_days',
      amount: 'all'
    });

    // Verify filtered results
    await expect(page.locator('tr')).toHaveCount(1); // Should have at least one completed transaction

    // Export transaction history
    await escrowPage.exportTransactionHistory('PDF');

    // Verify export started
    await expect(page.locator('text=Exportando historial')).toBeVisible();
  });

  test('@escrow @smoke User can search transactions', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transactions
    await dashboardPage.gotoTransactions();

    // Search for specific transaction
    await escrowPage.searchTransactions('iPhone');

    // Verify search results
    await expect(page.locator('text=Resultados de búsqueda')).toBeVisible();
    await expect(page.locator('tr')).toContainText('iPhone');

    // Clear search
    await escrowPage.clearSearch();

    // Verify all transactions shown
    await expect(page.locator('tr')).toHaveCount(2); // Should show all transactions
  });

  test('@escrow @smoke User can view transaction details', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transactions
    await dashboardPage.gotoTransactions();

    // Find and click on transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');
    await escrowPage.clickViewDetails();

    // Verify transaction details page
    await expect(page.locator('text=Detalles de Transacción')).toBeVisible();
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
    await expect(page.locator('text=$35,000 MXN')).toBeVisible();

    // Verify all sections are present
    await expect(page.locator('text=Información del Producto')).toBeVisible();
    await expect(page.locator('text=Información de Pago')).toBeVisible();
    await expect(page.locator('text=Información de Envío')).toBeVisible();
    await expect(page.locator('text=Historial de Actividad')).toBeVisible();
  });

  test('@escrow @smoke User can send messages in transaction', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transaction details
    await dashboardPage.gotoTransactions();
    await escrowPage.findTransaction('iPhone 15 Pro Max');
    await escrowPage.clickViewDetails();

    // Go to messages tab
    await escrowPage.clickMessagesTab();

    // Send message
    await escrowPage.sendMessage('¿El iPhone incluye cargador?');

    // Verify message sent
    await expect(page.locator('text=¿El iPhone incluye cargador?')).toBeVisible();
    await expect(page.locator('text=Enviado')).toBeVisible();

    // Switch to seller account
    await page.context().clearCookies();
    await authPage.goto();
    await authPage.login('seller@test.com', 'Test123!');

    // Navigate to same transaction
    await dashboardPage.gotoTransactions();
    await escrowPage.findTransaction('iPhone 15 Pro Max');
    await escrowPage.clickViewDetails();
    await escrowPage.clickMessagesTab();

    // Verify message received
    await expect(page.locator('text=¿El iPhone incluye cargador?')).toBeVisible();

    // Reply to message
    await escrowPage.sendMessage('Sí, incluye cargador original y cable USB-C');

    // Verify reply sent
    await expect(page.locator('text=Sí, incluye cargador original')).toBeVisible();
  });

  test('@escrow @smoke User can upload additional evidence', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transaction details
    await dashboardPage.gotoTransactions();
    await escrowPage.findTransaction('iPhone 15 Pro Max');
    await escrowPage.clickViewDetails();

    // Go to evidence tab
    await escrowPage.clickEvidenceTab();

    // Upload additional evidence
    await escrowPage.uploadAdditionalEvidence([
      'tests/fixtures/additional-evidence-1.jpg',
      'tests/fixtures/additional-evidence-2.pdf'
    ]);

    // Add evidence description
    await escrowPage.addEvidenceDescription('Fotos adicionales del producto recibido');

    // Submit evidence
    await escrowPage.submitEvidence();

    // Verify evidence uploaded
    await expect(page.locator('text=Evidencia subida exitosamente')).toBeVisible();
    await expect(page.locator('text=Fotos adicionales del producto recibido')).toBeVisible();
  });

  test('@escrow @smoke Transaction expires after timeout', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to expired transactions
    await dashboardPage.gotoExpiredTransactions();

    // Find expired transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Verify transaction expired
    await expect(page.locator('text=Transacción expirada')).toBeVisible();
    await expect(page.locator('text=Tiempo de espera agotado')).toBeVisible();

    // Verify refund processed
    await expect(page.locator('text=Reembolso procesado')).toBeVisible();
  });

  test('@escrow @smoke User can rate transaction partner', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to completed transactions
    await dashboardPage.gotoCompletedTransactions();

    // Find completed transaction
    await escrowPage.findTransaction('iPhone 15 Pro Max');

    // Click rate partner
    await escrowPage.clickRatePartner();

    // Fill rating form
    await escrowPage.fillRatingForm({
      rating: 5,
      communication: 5,
      itemCondition: 5,
      shipping: 4,
      overall: 5,
      comment: 'Excelente vendedor, producto en perfecto estado'
    });

    // Submit rating
    await escrowPage.submitRating();

    // Verify rating submitted
    await expect(page.locator('text=Calificación enviada')).toBeVisible();
    await expect(page.locator('text=Gracias por tu feedback')).toBeVisible();
  });
});
