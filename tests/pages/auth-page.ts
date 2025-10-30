import { Page, Locator, expect } from '@playwright/test';

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'buyer' | 'seller' | 'broker';
  acceptTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface KYCFormData {
  curp: string;
  rfc: string;
  ine: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  criticalOnly: boolean;
}

export class AuthPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly roleSelect: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly resetEmailInput: Locator;
  readonly curpInput: Locator;
  readonly rfcInput: Locator;
  readonly ineInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly twoFactorCodeInput: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmNewPasswordInput: Locator;
  readonly profileFirstNameInput: Locator;
  readonly profileLastNameInput: Locator;
  readonly profilePhoneInput: Locator;
  readonly profileAddressInput: Locator;
  readonly notificationEmailCheckbox: Locator;
  readonly notificationSMSCheckbox: Locator;
  readonly notificationPushCheckbox: Locator;
  readonly notificationCriticalCheckbox: Locator;
  readonly deleteAccountButton: Locator;
  readonly confirmDeleteInput: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Login form elements
    this.loginButton = page.locator('button[data-testid="login-button"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('a[data-testid="forgot-password"]');
    
    // Registration form elements
    this.registerButton = page.locator('button[data-testid="register-button"]');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.roleSelect = page.locator('select[name="role"]');
    this.termsCheckbox = page.locator('input[name="acceptTerms"]');
    
    // Password reset elements
    this.resetEmailInput = page.locator('input[name="resetEmail"]');
    
    // KYC form elements
    this.curpInput = page.locator('input[name="curp"]');
    this.rfcInput = page.locator('input[name="rfc"]');
    this.ineInput = page.locator('input[name="ine"]');
    this.addressInput = page.locator('input[name="address"]');
    this.cityInput = page.locator('input[name="city"]');
    this.stateInput = page.locator('input[name="state"]');
    this.zipCodeInput = page.locator('input[name="zipCode"]');
    
    // 2FA elements
    this.twoFactorCodeInput = page.locator('input[name="twoFactorCode"]');
    
    // Password change elements
    this.currentPasswordInput = page.locator('input[name="currentPassword"]');
    this.newPasswordInput = page.locator('input[name="newPassword"]');
    this.confirmNewPasswordInput = page.locator('input[name="confirmNewPassword"]');
    
    // Profile update elements
    this.profileFirstNameInput = page.locator('input[name="profileFirstName"]');
    this.profileLastNameInput = page.locator('input[name="profileLastName"]');
    this.profilePhoneInput = page.locator('input[name="profilePhone"]');
    this.profileAddressInput = page.locator('input[name="profileAddress"]');
    
    // Notification preferences elements
    this.notificationEmailCheckbox = page.locator('input[name="notificationEmail"]');
    this.notificationSMSCheckbox = page.locator('input[name="notificationSMS"]');
    this.notificationPushCheckbox = page.locator('input[name="notificationPush"]');
    this.notificationCriticalCheckbox = page.locator('input[name="notificationCritical"]');
    
    // Account deletion elements
    this.deleteAccountButton = page.locator('button[data-testid="delete-account"]');
    this.confirmDeleteInput = page.locator('input[name="confirmDelete"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickRegister() {
    await this.registerButton.click();
  }

  async fillLoginForm(data: LoginFormData) {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
  }

  async fillRegistrationForm(data: RegistrationFormData) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
    await this.roleSelect.selectOption(data.role);
    
    if (data.acceptTerms) {
      await this.termsCheckbox.check();
    }
  }

  async submitLogin() {
    await this.submitButton.click();
  }

  async submitRegistration() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.clickLogin();
    await this.fillLoginForm({ email, password });
    await this.submitLogin();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async fillEmailForReset(email: string) {
    await this.resetEmailInput.fill(email);
  }

  async submitPasswordReset() {
    await this.submitButton.click();
  }

  async mockEmailVerification() {
    // In a real test, this would check email and click verification link
    // For now, we'll mock it by navigating to the verification page
    await this.page.goto('/verify-email?token=mock-token');
  }

  async mockPasswordReset() {
    // In a real test, this would check email and click reset link
    // For now, we'll mock it by navigating to the reset page
    await this.page.goto('/reset-password?token=mock-token');
  }

  async fillKYCForm(data: KYCFormData) {
    await this.curpInput.fill(data.curp);
    await this.rfcInput.fill(data.rfc);
    await this.ineInput.fill(data.ine);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.zipCodeInput.fill(data.zipCode);
  }

  async uploadDocument(type: string, filePath: string) {
    const fileInput = this.page.locator(`input[type="file"][data-testid="${type}-upload"]`);
    await fileInput.setInputFiles(filePath);
  }

  async submitKYC() {
    await this.submitButton.click();
  }

  async enable2FA() {
    const enable2FAButton = this.page.locator('button[data-testid="enable-2fa"]');
    await enable2FAButton.click();
  }

  async mock2FASetup() {
    // In a real test, this would use an authenticator app
    // For now, we'll mock it by entering a test code
    await this.twoFactorCodeInput.fill('123456');
    await this.submitButton.click();
  }

  async clickChangePassword() {
    const changePasswordButton = this.page.locator('button[data-testid="change-password"]');
    await changePasswordButton.click();
  }

  async fillPasswordChangeForm(data: PasswordChangeFormData) {
    await this.currentPasswordInput.fill(data.currentPassword);
    await this.newPasswordInput.fill(data.newPassword);
    await this.confirmNewPasswordInput.fill(data.confirmPassword);
  }

  async submitPasswordChange() {
    await this.submitButton.click();
  }

  async updateProfile(data: ProfileUpdateData) {
    await this.profileFirstNameInput.fill(data.firstName);
    await this.profileLastNameInput.fill(data.lastName);
    await this.profilePhoneInput.fill(data.phone);
    await this.profileAddressInput.fill(data.address);
  }

  async saveProfile() {
    await this.submitButton.click();
  }

  async configureNotifications(preferences: NotificationPreferences) {
    if (preferences.email) {
      await this.notificationEmailCheckbox.check();
    } else {
      await this.notificationEmailCheckbox.uncheck();
    }

    if (preferences.sms) {
      await this.notificationSMSCheckbox.check();
    } else {
      await this.notificationSMSCheckbox.uncheck();
    }

    if (preferences.push) {
      await this.notificationPushCheckbox.check();
    } else {
      await this.notificationPushCheckbox.uncheck();
    }

    if (preferences.criticalOnly) {
      await this.notificationCriticalCheckbox.check();
    } else {
      await this.notificationCriticalCheckbox.uncheck();
    }
  }

  async saveNotificationSettings() {
    await this.submitButton.click();
  }

  async clickDeleteAccount() {
    await this.deleteAccountButton.click();
  }

  async confirmAccountDeletion(password: string) {
    await this.confirmDeleteInput.fill(password);
    const confirmButton = this.page.locator('button[data-testid="confirm-delete"]');
    await confirmButton.click();
  }

  getLoginButton() {
    return this.loginButton;
  }
}
