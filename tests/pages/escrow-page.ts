import { Page, Locator, expect } from '@playwright/test';

export interface TransactionDetails {
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  currency: string;
  category: string;
  condition: string;
  inspectionPeriod: number;
}

export interface DeliveryTerms {
  shippingMethod: string;
  estimatedDelivery: number;
  shippingCost: number;
  insurance: boolean;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export interface ShippingDetails {
  trackingNumber: string;
  carrier: string;
  shippingDate: string;
  estimatedDelivery: string;
}

export interface DisputeDetails {
  reason: string;
  description: string;
  resolution: string;
}

export interface DisputeDecision {
  decision: string;
  reason: string;
  refundAmount?: number;
}

export interface TransactionFilter {
  status: string;
  dateRange: string;
  amount: string;
}

export interface RatingForm {
  rating: number;
  communication: number;
  itemCondition: number;
  shipping: number;
  overall: number;
  comment: string;
}

export class EscrowPage {
  readonly page: Page;
  readonly itemNameInput: Locator;
  readonly itemDescriptionInput: Locator;
  readonly itemPriceInput: Locator;
  readonly currencySelect: Locator;
  readonly categorySelect: Locator;
  readonly conditionSelect: Locator;
  readonly inspectionPeriodInput: Locator;
  readonly productImageUpload: Locator;
  readonly shippingMethodSelect: Locator;
  readonly estimatedDeliveryInput: Locator;
  readonly shippingCostInput: Locator;
  readonly insuranceCheckbox: Locator;
  readonly specialTermsTextarea: Locator;
  readonly buyerEmailInput: Locator;
  readonly submitTransactionButton: Locator;
  readonly acceptTransactionButton: Locator;
  readonly rejectTransactionButton: Locator;
  readonly makePaymentButton: Locator;
  readonly paymentMethodSelect: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly cvvInput: Locator;
  readonly cardholderNameInput: Locator;
  readonly confirmPaymentButton: Locator;
  readonly markAsShippedButton: Locator;
  readonly trackingNumberInput: Locator;
  readonly carrierInput: Locator;
  readonly shippingDateInput: Locator;
  readonly shippingReceiptUpload: Locator;
  readonly submitShippingButton: Locator;
  readonly confirmDeliveryButton: Locator;
  readonly inspectItemButton: Locator;
  readonly approveTransactionButton: Locator;
  readonly createDisputeButton: Locator;
  readonly disputeReasonSelect: Locator;
  readonly disputeDescriptionTextarea: Locator;
  readonly disputeResolutionSelect: Locator;
  readonly disputeEvidenceUpload: Locator;
  readonly submitDisputeButton: Locator;
  readonly disputeDecisionSelect: Locator;
  readonly disputeDecisionReasonTextarea: Locator;
  readonly refundAmountInput: Locator;
  readonly submitDisputeDecisionButton: Locator;
  readonly cancelTransactionButton: Locator;
  readonly cancellationReasonTextarea: Locator;
  readonly confirmCancellationButton: Locator;
  readonly transactionSearchInput: Locator;
  readonly transactionStatusFilter: Locator;
  readonly transactionDateFilter: Locator;
  readonly transactionAmountFilter: Locator;
  readonly clearSearchButton: Locator;
  readonly viewDetailsButton: Locator;
  readonly messagesTab: Locator;
  readonly messageInput: Locator;
  readonly sendMessageButton: Locator;
  readonly evidenceTab: Locator;
  readonly additionalEvidenceUpload: Locator;
  readonly evidenceDescriptionTextarea: Locator;
  readonly submitEvidenceButton: Locator;
  readonly ratePartnerButton: Locator;
  readonly ratingStars: Locator;
  readonly communicationRating: Locator;
  readonly itemConditionRating: Locator;
  readonly shippingRating: Locator;
  readonly overallRating: Locator;
  readonly ratingCommentTextarea: Locator;
  readonly submitRatingButton: Locator;
  readonly exportHistoryButton: Locator;
  readonly exportFormatSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Transaction creation elements
    this.itemNameInput = page.locator('input[name="itemName"]');
    this.itemDescriptionInput = page.locator('textarea[name="itemDescription"]');
    this.itemPriceInput = page.locator('input[name="itemPrice"]');
    this.currencySelect = page.locator('select[name="currency"]');
    this.categorySelect = page.locator('select[name="category"]');
    this.conditionSelect = page.locator('select[name="condition"]');
    this.inspectionPeriodInput = page.locator('input[name="inspectionPeriod"]');
    this.productImageUpload = page.locator('input[type="file"][data-testid="product-images"]');
    this.shippingMethodSelect = page.locator('select[name="shippingMethod"]');
    this.estimatedDeliveryInput = page.locator('input[name="estimatedDelivery"]');
    this.shippingCostInput = page.locator('input[name="shippingCost"]');
    this.insuranceCheckbox = page.locator('input[name="insurance"]');
    this.specialTermsTextarea = page.locator('textarea[name="specialTerms"]');
    this.buyerEmailInput = page.locator('input[name="buyerEmail"]');
    this.submitTransactionButton = page.locator('button[data-testid="submit-transaction"]');
    
    // Transaction actions elements
    this.acceptTransactionButton = page.locator('button[data-testid="accept-transaction"]');
    this.rejectTransactionButton = page.locator('button[data-testid="reject-transaction"]');
    this.makePaymentButton = page.locator('button[data-testid="make-payment"]');
    this.markAsShippedButton = page.locator('button[data-testid="mark-shipped"]');
    this.confirmDeliveryButton = page.locator('button[data-testid="confirm-delivery"]');
    this.inspectItemButton = page.locator('button[data-testid="inspect-item"]');
    this.approveTransactionButton = page.locator('button[data-testid="approve-transaction"]');
    this.createDisputeButton = page.locator('button[data-testid="create-dispute"]');
    this.cancelTransactionButton = page.locator('button[data-testid="cancel-transaction"]');
    
    // Payment elements
    this.paymentMethodSelect = page.locator('select[name="paymentMethod"]');
    this.cardNumberInput = page.locator('input[name="cardNumber"]');
    this.expiryMonthInput = page.locator('input[name="expiryMonth"]');
    this.expiryYearInput = page.locator('input[name="expiryYear"]');
    this.cvvInput = page.locator('input[name="cvv"]');
    this.cardholderNameInput = page.locator('input[name="cardholderName"]');
    this.confirmPaymentButton = page.locator('button[data-testid="confirm-payment"]');
    
    // Shipping elements
    this.trackingNumberInput = page.locator('input[name="trackingNumber"]');
    this.carrierInput = page.locator('input[name="carrier"]');
    this.shippingDateInput = page.locator('input[name="shippingDate"]');
    this.shippingReceiptUpload = page.locator('input[type="file"][data-testid="shipping-receipt"]');
    this.submitShippingButton = page.locator('button[data-testid="submit-shipping"]');
    
    // Dispute elements
    this.disputeReasonSelect = page.locator('select[name="disputeReason"]');
    this.disputeDescriptionTextarea = page.locator('textarea[name="disputeDescription"]');
    this.disputeResolutionSelect = page.locator('select[name="disputeResolution"]');
    this.disputeEvidenceUpload = page.locator('input[type="file"][data-testid="dispute-evidence"]');
    this.submitDisputeButton = page.locator('button[data-testid="submit-dispute"]');
    this.disputeDecisionSelect = page.locator('select[name="disputeDecision"]');
    this.disputeDecisionReasonTextarea = page.locator('textarea[name="disputeDecisionReason"]');
    this.refundAmountInput = page.locator('input[name="refundAmount"]');
    this.submitDisputeDecisionButton = page.locator('button[data-testid="submit-dispute-decision"]');
    
    // Cancellation elements
    this.cancellationReasonTextarea = page.locator('textarea[name="cancellationReason"]');
    this.confirmCancellationButton = page.locator('button[data-testid="confirm-cancellation"]');
    
    // Search and filter elements
    this.transactionSearchInput = page.locator('input[data-testid="transaction-search"]');
    this.transactionStatusFilter = page.locator('select[data-testid="status-filter"]');
    this.transactionDateFilter = page.locator('select[data-testid="date-filter"]');
    this.transactionAmountFilter = page.locator('select[data-testid="amount-filter"]');
    this.clearSearchButton = page.locator('button[data-testid="clear-search"]');
    
    // Transaction details elements
    this.viewDetailsButton = page.locator('button[data-testid="view-details"]');
    this.messagesTab = page.locator('button[data-testid="messages-tab"]');
    this.messageInput = page.locator('input[data-testid="message-input"]');
    this.sendMessageButton = page.locator('button[data-testid="send-message"]');
    this.evidenceTab = page.locator('button[data-testid="evidence-tab"]');
    this.additionalEvidenceUpload = page.locator('input[type="file"][data-testid="additional-evidence"]');
    this.evidenceDescriptionTextarea = page.locator('textarea[name="evidenceDescription"]');
    this.submitEvidenceButton = page.locator('button[data-testid="submit-evidence"]');
    
    // Rating elements
    this.ratePartnerButton = page.locator('button[data-testid="rate-partner"]');
    this.ratingStars = page.locator('div[data-testid="rating-stars"]');
    this.communicationRating = page.locator('select[name="communicationRating"]');
    this.itemConditionRating = page.locator('select[name="itemConditionRating"]');
    this.shippingRating = page.locator('select[name="shippingRating"]');
    this.overallRating = page.locator('select[name="overallRating"]');
    this.ratingCommentTextarea = page.locator('textarea[name="ratingComment"]');
    this.submitRatingButton = page.locator('button[data-testid="submit-rating"]');
    
    // Export elements
    this.exportHistoryButton = page.locator('button[data-testid="export-history"]');
    this.exportFormatSelect = page.locator('select[name="exportFormat"]');
  }

  async fillTransactionDetails(details: TransactionDetails) {
    await this.itemNameInput.fill(details.itemName);
    await this.itemDescriptionInput.fill(details.itemDescription);
    await this.itemPriceInput.fill(details.itemPrice.toString());
    await this.currencySelect.selectOption(details.currency);
    await this.categorySelect.selectOption(details.category);
    await this.conditionSelect.selectOption(details.condition);
    await this.inspectionPeriodInput.fill(details.inspectionPeriod.toString());
  }

  async uploadProductImages(imagePaths: string[]) {
    await this.productImageUpload.setInputFiles(imagePaths);
  }

  async setDeliveryTerms(terms: DeliveryTerms) {
    await this.shippingMethodSelect.selectOption(terms.shippingMethod);
    await this.estimatedDeliveryInput.fill(terms.estimatedDelivery.toString());
    await this.shippingCostInput.fill(terms.shippingCost.toString());
    
    if (terms.insurance) {
      await this.insuranceCheckbox.check();
    } else {
      await this.insuranceCheckbox.uncheck();
    }
  }

  async addSpecialTerms(terms: string) {
    await this.specialTermsTextarea.fill(terms);
  }

  async selectBuyer(email: string) {
    await this.buyerEmailInput.fill(email);
  }

  async reviewTransaction() {
    // Scroll to review section
    await this.page.locator('h2:has-text("Revisar Transacción")').scrollIntoViewIfNeeded();
  }

  async submitTransaction() {
    await this.submitTransactionButton.click();
  }

  async findTransaction(itemName: string) {
    await this.page.locator(`tr:has-text("${itemName}")`).first().click();
  }

  async reviewTransactionDetails() {
    // Scroll through transaction details
    await this.page.locator('h2:has-text("Detalles de Transacción")').scrollIntoViewIfNeeded();
  }

  async acceptTransaction() {
    await this.acceptTransactionButton.click();
  }

  async confirmAcceptance() {
    const confirmButton = this.page.locator('button[data-testid="confirm-acceptance"]');
    await confirmButton.click();
  }

  async clickMakePayment() {
    await this.makePaymentButton.click();
  }

  async selectPaymentMethod(method: string) {
    await this.paymentMethodSelect.selectOption(method);
  }

  async fillPaymentDetails(details: PaymentDetails) {
    await this.cardNumberInput.fill(details.cardNumber);
    await this.expiryMonthInput.fill(details.expiryMonth);
    await this.expiryYearInput.fill(details.expiryYear);
    await this.cvvInput.fill(details.cvv);
    await this.cardholderNameInput.fill(details.cardholderName);
  }

  async confirmPayment() {
    await this.confirmPaymentButton.click();
  }

  async clickMarkAsShipped() {
    await this.markAsShippedButton.click();
  }

  async fillShippingDetails(details: ShippingDetails) {
    await this.trackingNumberInput.fill(details.trackingNumber);
    await this.carrierInput.fill(details.carrier);
    await this.shippingDateInput.fill(details.shippingDate);
  }

  async uploadShippingReceipt(filePath: string) {
    await this.shippingReceiptUpload.setInputFiles(filePath);
  }

  async submitShipping() {
    await this.submitShippingButton.click();
  }

  async clickConfirmDelivery() {
    await this.confirmDeliveryButton.click();
  }

  async confirmItemReceived() {
    const confirmButton = this.page.locator('button[data-testid="confirm-item-received"]');
    await confirmButton.click();
  }

  async inspectItem() {
    await this.inspectItemButton.click();
  }

  async approveTransaction() {
    await this.approveTransactionButton.click();
  }

  async confirmApproval() {
    const confirmButton = this.page.locator('button[data-testid="confirm-approval"]');
    await confirmButton.click();
  }

  async clickCreateDispute() {
    await this.createDisputeButton.click();
  }

  async fillDisputeDetails(details: DisputeDetails) {
    await this.disputeReasonSelect.selectOption(details.reason);
    await this.disputeDescriptionTextarea.fill(details.description);
    await this.disputeResolutionSelect.selectOption(details.resolution);
  }

  async uploadDisputeEvidence(filePaths: string[]) {
    await this.disputeEvidenceUpload.setInputFiles(filePaths);
  }

  async submitDispute() {
    await this.submitDisputeButton.click();
  }

  async findDispute(itemName: string) {
    await this.page.locator(`tr:has-text("${itemName}")`).first().click();
  }

  async reviewDisputeDetails() {
    await this.page.locator('h2:has-text("Detalles de Disputa")').scrollIntoViewIfNeeded();
  }

  async reviewDisputeEvidence() {
    await this.page.locator('h3:has-text("Evidencias")').scrollIntoViewIfNeeded();
  }

  async makeDisputeDecision(decision: DisputeDecision) {
    await this.disputeDecisionSelect.selectOption(decision.decision);
    await this.disputeDecisionReasonTextarea.fill(decision.reason);
    
    if (decision.refundAmount) {
      await this.refundAmountInput.fill(decision.refundAmount.toString());
    }
  }

  async submitDisputeDecision() {
    await this.submitDisputeDecisionButton.click();
  }

  async clickCancelTransaction() {
    await this.cancelTransactionButton.click();
  }

  async provideCancellationReason(reason: string) {
    await this.cancellationReasonTextarea.fill(reason);
  }

  async confirmCancellation() {
    await this.confirmCancellationButton.click();
  }

  async searchTransactions(query: string) {
    await this.transactionSearchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async filterTransactions(filter: TransactionFilter) {
    await this.transactionStatusFilter.selectOption(filter.status);
    await this.transactionDateFilter.selectOption(filter.dateRange);
    await this.transactionAmountFilter.selectOption(filter.amount);
  }

  async clearSearch() {
    await this.clearSearchButton.click();
  }

  async clickViewDetails() {
    await this.viewDetailsButton.click();
  }

  async clickMessagesTab() {
    await this.messagesTab.click();
  }

  async sendMessage(message: string) {
    await this.messageInput.fill(message);
    await this.sendMessageButton.click();
  }

  async clickEvidenceTab() {
    await this.evidenceTab.click();
  }

  async uploadAdditionalEvidence(filePaths: string[]) {
    await this.additionalEvidenceUpload.setInputFiles(filePaths);
  }

  async addEvidenceDescription(description: string) {
    await this.evidenceDescriptionTextarea.fill(description);
  }

  async submitEvidence() {
    await this.submitEvidenceButton.click();
  }

  async clickRatePartner() {
    await this.ratePartnerButton.click();
  }

  async fillRatingForm(rating: RatingForm) {
    // Set star ratings
    const stars = this.ratingStars.locator('button');
    for (let i = 0; i < rating.rating; i++) {
      await stars.nth(i).click();
    }

    // Set specific ratings
    await this.communicationRating.selectOption(rating.communication.toString());
    await this.itemConditionRating.selectOption(rating.itemCondition.toString());
    await this.shippingRating.selectOption(rating.shipping.toString());
    await this.overallRating.selectOption(rating.overall.toString());
    await this.ratingCommentTextarea.fill(rating.comment);
  }

  async submitRating() {
    await this.submitRatingButton.click();
  }

  async exportTransactionHistory(format: string) {
    await this.exportFormatSelect.selectOption(format);
    await this.exportHistoryButton.click();
  }
}
