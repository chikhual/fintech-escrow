import { test, expect } from '@playwright/test';

test.describe('Authentication API Tests', () => {
  test('POST /api/auth/register - should register new user', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        firstName: 'API Test',
        lastName: 'User',
        email: 'apitest@example.com',
        phone: '+525512345678',
        password: 'Test123!',
        confirmPassword: 'Test123!',
        role: 'buyer',
        acceptTerms: true
      }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe('apitest@example.com');
    expect(data.user.role).toBe('buyer');
  });

  test('POST /api/auth/login - should login user', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.access_token).toBeDefined();
    expect(data.token_type).toBe('bearer');
  });

  test('POST /api/auth/login - should reject invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Credenciales inválidas');
  });

  test('GET /api/auth/me - should get current user', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Get current user
    const response = await request.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe('buyer@test.com');
  });

  test('GET /api/auth/me - should reject request without token', async ({ request }) => {
    const response = await request.get('/api/auth/me');

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Token requerido');
  });

  test('POST /api/auth/refresh - should refresh token', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Refresh token
    const response = await request.post('/api/auth/refresh', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.access_token).toBeDefined();
  });

  test('POST /api/auth/logout - should logout user', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Logout
    const response = await request.post('/api/auth/logout', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Sesión cerrada');
  });

  test('POST /api/auth/forgot-password - should send password reset email', async ({ request }) => {
    const response = await request.post('/api/auth/forgot-password', {
      data: {
        email: 'buyer@test.com'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Email de recuperación enviado');
  });

  test('POST /api/auth/reset-password - should reset password', async ({ request }) => {
    const response = await request.post('/api/auth/reset-password', {
      data: {
        token: 'mock-reset-token',
        newPassword: 'NewTest123!',
        confirmPassword: 'NewTest123!'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Contraseña actualizada');
  });

  test('POST /api/auth/change-password - should change password', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Change password
    const response = await request.post('/api/auth/change-password', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        currentPassword: 'Test123!',
        newPassword: 'NewTest123!',
        confirmPassword: 'NewTest123!'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Contraseña actualizada');
  });

  test('POST /api/auth/verify-email - should verify email', async ({ request }) => {
    const response = await request.post('/api/auth/verify-email', {
      data: {
        token: 'mock-verification-token'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Email verificado');
  });

  test('POST /api/auth/resend-verification - should resend verification email', async ({ request }) => {
    const response = await request.post('/api/auth/resend-verification', {
      data: {
        email: 'buyer@test.com'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Email de verificación reenviado');
  });
});
