import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';

test.describe('Security Tests', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('@security @smoke SQL injection prevention', async ({ page }) => {
    // Test login form SQL injection
    await authPage.goto();
    await authPage.clickLogin();

    // Attempt SQL injection in email field
    await authPage.fillLoginForm({
      email: "admin@test.com'; DROP TABLE users; --",
      password: 'Test123!'
    });

    await authPage.submitLogin();

    // Should not be able to login with SQL injection
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible();

    // Verify users table still exists (no data loss)
    await page.goto('/api/users');
    const response = await page.request.get('/api/users');
    expect(response.status()).toBe(200);
  });

  test('@security @smoke XSS prevention', async ({ page }) => {
    // Test XSS in search field
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    await dashboardPage.gotoTransactions();

    // Attempt XSS in search field
    const xssPayload = '<script>alert("XSS")</script>';
    await page.locator('input[data-testid="transaction-search"]').fill(xssPayload);
    await page.keyboard.press('Enter');

    // Should not execute script
    await expect(page.locator('script')).toHaveCount(0);
    
    // Should display payload as text, not execute it
    await expect(page.locator('text=<script>alert("XSS")</script>')).toBeVisible();
  });

  test('@security @smoke CSRF protection', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Get CSRF token
    const csrfToken = await page.locator('meta[name="csrf-token"]').getAttribute('content');
    expect(csrfToken).toBeDefined();

    // Test CSRF protection on sensitive operations
    const response = await page.request.post('/api/transactions', {
      data: {
        itemName: 'Test Item',
        itemPrice: 1000
      },
      headers: {
        'X-CSRF-Token': 'invalid-token'
      }
    });

    expect(response.status()).toBe(403); // Should be forbidden
  });

  test('@security @smoke Authentication bypass prevention', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page.url()).toContain('/login');
    await expect(page.locator('text=Inicia sesión')).toBeVisible();

    // Try to access API without authentication
    const response = await page.request.get('/api/transactions');
    expect(response.status()).toBe(401); // Should be unauthorized
  });

  test('@security @smoke Session management', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Verify session is created
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session_id');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true); // Should be httpOnly
    expect(sessionCookie?.secure).toBe(true); // Should be secure

    // Test session timeout
    await page.waitForTimeout(1000); // Mock timeout
    await page.goto('/dashboard');
    
    // Should still be logged in (session not expired)
    await expect(dashboardPage.getUserMenu()).toBeVisible();
  });

  test('@security @smoke Password security', async ({ page }) => {
    // Test weak password rejection
    await authPage.goto();
    await authPage.clickRegister();

    await authPage.fillRegistrationForm({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+525512345678',
      password: '123', // Weak password
      confirmPassword: '123',
      role: 'buyer',
      acceptTerms: true
    });

    await authPage.submitRegistration();

    // Should reject weak password
    await expect(page.locator('text=Contraseña muy débil')).toBeVisible();

    // Test password hashing (verify password is not stored in plain text)
    await authPage.fillRegistrationForm({
      firstName: 'Test',
      lastName: 'User',
      email: 'test2@example.com',
      phone: '+525512345678',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      role: 'buyer',
      acceptTerms: true
    });

    await authPage.submitRegistration();

    // Verify password is hashed in database
    const response = await page.request.get('/api/users/test2@example.com');
    const userData = await response.json();
    expect(userData.password).not.toBe('StrongPassword123!'); // Should be hashed
    expect(userData.password).toMatch(/^\$2[aby]\$\d+\$/); // Should be bcrypt hash
  });

  test('@security @smoke Input validation', async ({ page }) => {
    // Test email validation
    await authPage.goto();
    await authPage.clickLogin();

    await authPage.fillLoginForm({
      email: 'invalid-email',
      password: 'Test123!'
    });

    await authPage.submitLogin();

    // Should show validation error
    await expect(page.locator('text=Email inválido')).toBeVisible();

    // Test phone validation
    await authPage.fillLoginForm({
      email: 'buyer@test.com',
      password: 'Test123!'
    });

    await authPage.submitLogin();
    await dashboardPage.gotoProfile();

    // Try to update with invalid phone
    await page.locator('input[name="phone"]').fill('invalid-phone');
    await page.locator('button[data-testid="save-profile"]').click();

    // Should show validation error
    await expect(page.locator('text=Teléfono inválido')).toBeVisible();
  });

  test('@security @smoke File upload security', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to profile
    await dashboardPage.gotoProfile();

    // Try to upload malicious file
    const maliciousFile = 'tests/fixtures/malicious.exe';
    await page.locator('input[type="file"]').setInputFiles(maliciousFile);

    // Should reject malicious file
    await expect(page.locator('text=Tipo de archivo no permitido')).toBeVisible();

    // Try to upload oversized file
    const oversizedFile = 'tests/fixtures/oversized.jpg';
    await page.locator('input[type="file"]').setInputFiles(oversizedFile);

    // Should reject oversized file
    await expect(page.locator('text=Archivo demasiado grande')).toBeVisible();
  });

  test('@security @smoke Rate limiting', async ({ page }) => {
    // Test login rate limiting
    const loginAttempts = Array(10).fill(null).map(() => 
      page.request.post('/api/auth/login', {
        data: { email: 'buyer@test.com', password: 'wrongpassword' }
      })
    );

    const responses = await Promise.all(loginAttempts);
    
    // Some requests should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    // Test API rate limiting
    const apiRequests = Array(100).fill(null).map(() => 
      page.request.get('/api/transactions')
    );

    const apiResponses = await Promise.all(apiRequests);
    const rateLimitedApiResponses = apiResponses.filter(r => r.status() === 429);
    expect(rateLimitedApiResponses.length).toBeGreaterThan(0);
  });

  test('@security @smoke HTTPS enforcement', async ({ page }) => {
    // Test HTTP to HTTPS redirect
    await page.goto('http://localhost:4200');
    
    // Should redirect to HTTPS
    await expect(page.url()).toMatch(/^https:/);
  });

  test('@security @smoke Security headers', async ({ page }) => {
    // Test security headers
    const response = await page.request.get('/');
    const headers = response.headers();

    // Check for security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toContain('max-age');
    expect(headers['content-security-policy']).toBeDefined();
  });

  test('@security @smoke Data encryption', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Test sensitive data encryption
    const response = await page.request.get('/api/users/profile');
    const userData = await response.json();

    // Sensitive data should be encrypted or masked
    expect(userData.curp).toMatch(/^\*{10,}$/); // Should be masked
    expect(userData.rfc).toMatch(/^\*{10,}$/); // Should be masked
    expect(userData.ine).toMatch(/^\*{10,}$/); // Should be masked
  });

  test('@security @smoke Authorization checks', async ({ page }) => {
    // Login as buyer
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Try to access admin functions
    const adminResponse = await page.request.get('/api/admin/users');
    expect(adminResponse.status()).toBe(403); // Should be forbidden

    // Try to access other user's data
    const userResponse = await page.request.get('/api/users/seller@test.com');
    expect(userResponse.status()).toBe(403); // Should be forbidden

    // Try to modify other user's transaction
    const transactionResponse = await page.request.put('/api/transactions/999', {
      data: { status: 'completed' }
    });
    expect(transactionResponse.status()).toBe(403); // Should be forbidden
  });

  test('@security @smoke Logging and monitoring', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Perform sensitive operations
    await dashboardPage.gotoTransactions();
    await page.locator('button[data-testid="create-transaction"]').click();

    // Check that security events are logged
    const logsResponse = await page.request.get('/api/admin/logs');
    const logs = await logsResponse.json();
    
    // Should have security-related logs
    const securityLogs = logs.filter(log => 
      log.message.includes('login') || 
      log.message.includes('transaction') ||
      log.message.includes('access')
    );
    expect(securityLogs.length).toBeGreaterThan(0);
  });

  test('@security @smoke API security', async ({ page }) => {
    // Test API without proper headers
    const response = await page.request.get('/api/transactions', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect(response.status()).toBe(401); // Should be unauthorized

    // Test API with invalid token
    const invalidTokenResponse = await page.request.get('/api/transactions', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    expect(invalidTokenResponse.status()).toBe(401); // Should be unauthorized

    // Test API with malformed token
    const malformedTokenResponse = await page.request.get('/api/transactions', {
      headers: {
        'Authorization': 'Bearer malformed.token.here'
      }
    });
    expect(malformedTokenResponse.status()).toBe(401); // Should be unauthorized
  });

  test('@security @smoke Data sanitization', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Test data sanitization in forms
    await dashboardPage.gotoProfile();

    // Try to input malicious data
    const maliciousInput = '<script>alert("XSS")</script>';
    await page.locator('input[name="firstName"]').fill(maliciousInput);
    await page.locator('button[data-testid="save-profile"]').click();

    // Data should be sanitized
    const firstNameValue = await page.locator('input[name="firstName"]').inputValue();
    expect(firstNameValue).not.toContain('<script>');
    expect(firstNameValue).toContain('&lt;script&gt;'); // Should be HTML encoded
  });

  test('@security @smoke Session hijacking prevention', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Get session cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session_id');
    
    // Test session cookie security
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
    expect(sessionCookie?.sameSite).toBe('Strict');

    // Test session regeneration on sensitive operations
    await page.locator('button[data-testid="change-password"]').click();
    
    // Session should be regenerated
    const newCookies = await page.context().cookies();
    const newSessionCookie = newCookies.find(cookie => cookie.name === 'session_id');
    expect(newSessionCookie?.value).not.toBe(sessionCookie?.value);
  });
});
