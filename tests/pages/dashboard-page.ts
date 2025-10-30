import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly userMenu: Locator;
  readonly welcomeMessage: Locator;
  readonly logoutButton: Locator;
  readonly createTransactionButton: Locator;
  readonly pendingTransactionsLink: Locator;
  readonly paymentPendingTransactionsLink: Locator;
  readonly readyToShipTransactionsLink: Locator;
  readonly inTransitTransactionsLink: Locator;
  readonly inspectionPeriodTransactionsLink: Locator;
  readonly pendingApprovalTransactionsLink: Locator;
  readonly completedTransactionsLink: Locator;
  readonly expiredTransactionsLink: Locator;
  readonly disputesLink: Locator;
  readonly transactionHistoryLink: Locator;
  readonly transactionsLink: Locator;
  readonly profileLink: Locator;
  readonly securitySettingsLink: Locator;
  readonly notificationSettingsLink: Locator;
  readonly accountSettingsLink: Locator;
  readonly kycLink: Locator;
  readonly adminLink: Locator;
  readonly projectManagementLink: Locator;
  readonly taskDashboardLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // User menu elements
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    
    // Transaction navigation elements
    this.createTransactionButton = page.locator('[data-testid="create-transaction"]');
    this.pendingTransactionsLink = page.locator('[data-testid="pending-transactions"]');
    this.paymentPendingTransactionsLink = page.locator('[data-testid="payment-pending-transactions"]');
    this.readyToShipTransactionsLink = page.locator('[data-testid="ready-to-ship-transactions"]');
    this.inTransitTransactionsLink = page.locator('[data-testid="in-transit-transactions"]');
    this.inspectionPeriodTransactionsLink = page.locator('[data-testid="inspection-period-transactions"]');
    this.pendingApprovalTransactionsLink = page.locator('[data-testid="pending-approval-transactions"]');
    this.completedTransactionsLink = page.locator('[data-testid="completed-transactions"]');
    this.expiredTransactionsLink = page.locator('[data-testid="expired-transactions"]');
    this.disputesLink = page.locator('[data-testid="disputes"]');
    this.transactionHistoryLink = page.locator('[data-testid="transaction-history"]');
    this.transactionsLink = page.locator('[data-testid="transactions"]');
    
    // Settings navigation elements
    this.profileLink = page.locator('[data-testid="profile"]');
    this.securitySettingsLink = page.locator('[data-testid="security-settings"]');
    this.notificationSettingsLink = page.locator('[data-testid="notification-settings"]');
    this.accountSettingsLink = page.locator('[data-testid="account-settings"]');
    this.kycLink = page.locator('[data-testid="kyc"]');
    
    // Admin navigation elements
    this.adminLink = page.locator('[data-testid="admin"]');
    this.projectManagementLink = page.locator('[data-testid="project-management"]');
    this.taskDashboardLink = page.locator('[data-testid="task-dashboard"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async gotoCreateTransaction() {
    await this.createTransactionButton.click();
  }

  async gotoPendingTransactions() {
    await this.pendingTransactionsLink.click();
  }

  async gotoPaymentPendingTransactions() {
    await this.paymentPendingTransactionsLink.click();
  }

  async gotoReadyToShipTransactions() {
    await this.readyToShipTransactionsLink.click();
  }

  async gotoInTransitTransactions() {
    await this.inTransitTransactionsLink.click();
  }

  async gotoInspectionPeriodTransactions() {
    await this.inspectionPeriodTransactionsLink.click();
  }

  async gotoPendingApprovalTransactions() {
    await this.pendingApprovalTransactionsLink.click();
  }

  async gotoCompletedTransactions() {
    await this.completedTransactionsLink.click();
  }

  async gotoExpiredTransactions() {
    await this.expiredTransactionsLink.click();
  }

  async gotoDisputes() {
    await this.disputesLink.click();
  }

  async gotoTransactionHistory() {
    await this.transactionHistoryLink.click();
  }

  async gotoTransactions() {
    await this.transactionsLink.click();
  }

  async gotoProfile() {
    await this.profileLink.click();
  }

  async gotoSecuritySettings() {
    await this.securitySettingsLink.click();
  }

  async gotoNotificationSettings() {
    await this.notificationSettingsLink.click();
  }

  async gotoAccountSettings() {
    await this.accountSettingsLink.click();
  }

  async gotoKYC() {
    await this.kycLink.click();
  }

  async gotoAdmin() {
    await this.adminLink.click();
  }

  async gotoProjectManagement() {
    await this.projectManagementLink.click();
  }

  async gotoTaskDashboard() {
    await this.taskDashboardLink.click();
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  getUserMenu() {
    return this.userMenu;
  }

  getWelcomeMessage() {
    return this.welcomeMessage;
  }
}
