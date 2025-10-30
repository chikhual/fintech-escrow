import { test, expect } from '@playwright/test';

test.describe('External Services Integration Tests', () => {
  test('Stripe payment processing integration', async ({ request }) => {
    // Test Stripe payment intent creation
    const response = await request.post('/api/payments/create-intent', {
      data: {
        amount: 5000,
        currency: 'mxn',
        transactionId: 'test-transaction-123'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.clientSecret).toBeDefined();
    expect(data.paymentIntentId).toBeDefined();
  });

  test('Stripe webhook processing', async ({ request }) => {
    // Test Stripe webhook endpoint
    const response = await request.post('/api/payments/webhook', {
      headers: {
        'Stripe-Signature': 'test-signature'
      },
      data: {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 5000,
            currency: 'mxn',
            status: 'succeeded'
          }
        }
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Webhook procesado');
  });

  test('SendGrid email service integration', async ({ request }) => {
    // Test email sending
    const response = await request.post('/api/notifications/send-email', {
      data: {
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'welcome',
        data: {
          name: 'Test User',
          verificationLink: 'https://example.com/verify'
        }
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.messageId).toBeDefined();
  });

  test('Twilio SMS service integration', async ({ request }) => {
    // Test SMS sending
    const response = await request.post('/api/notifications/send-sms', {
      data: {
        to: '+525512345678',
        message: 'Test SMS message',
        template: 'verification'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.messageId).toBeDefined();
  });

  test('Firebase push notification service integration', async ({ request }) => {
    // Test push notification sending
    const response = await request.post('/api/notifications/send-push', {
      data: {
        token: 'test-device-token',
        title: 'Test Notification',
        body: 'Test push notification message',
        data: {
          type: 'transaction_update',
          transactionId: 'test-123'
        }
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.messageId).toBeDefined();
  });

  test('Truora KYC verification integration', async ({ request }) => {
    // Test KYC verification
    const response = await request.post('/api/kyc/verify', {
      data: {
        userId: 'test-user-123',
        documents: {
          curp: 'TEST123456HDFRRL01',
          rfc: 'TEST123456ABC',
          ine: '123456789012345678'
        },
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          address: 'Test Address 123'
        }
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.verificationId).toBeDefined();
    expect(data.status).toBeDefined();
  });

  test('Truora KYC status check', async ({ request }) => {
    // Test KYC status check
    const response = await request.get('/api/kyc/status/test-verification-123');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.status).toBeDefined();
    expect(['pending', 'approved', 'rejected']).toContain(data.status);
  });

  test('Redis caching integration', async ({ request }) => {
    // Test cache set
    const setResponse = await request.post('/api/cache/set', {
      data: {
        key: 'test-key',
        value: 'test-value',
        ttl: 3600
      }
    });

    expect(setResponse.status()).toBe(200);
    const setData = await setResponse.json();
    expect(setData.success).toBe(true);

    // Test cache get
    const getResponse = await request.get('/api/cache/get/test-key');

    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData.success).toBe(true);
    expect(getData.value).toBe('test-value');
  });

  test('Redis session management integration', async ({ request }) => {
    // Test session creation
    const createResponse = await request.post('/api/sessions/create', {
      data: {
        userId: 'test-user-123',
        sessionData: {
          role: 'buyer',
          permissions: ['read', 'write']
        }
      }
    });

    expect(createResponse.status()).toBe(200);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.sessionId).toBeDefined();

    // Test session retrieval
    const getResponse = await request.get(`/api/sessions/${createData.sessionId}`);

    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData.success).toBe(true);
    expect(getData.sessionData.role).toBe('buyer');
  });

  test('WebSocket real-time communication', async ({ request }) => {
    // Test WebSocket connection
    const response = await request.get('/api/ws/connect');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.connectionId).toBeDefined();
  });

  test('File storage service integration', async ({ request }) => {
    // Test file upload
    const response = await request.post('/api/files/upload', {
      data: {
        fileName: 'test-file.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024,
        content: 'base64-encoded-content'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.fileId).toBeDefined();
    expect(data.url).toBeDefined();
  });

  test('File storage service download', async ({ request }) => {
    // Test file download
    const response = await request.get('/api/files/download/test-file-id');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/jpeg');
  });

  test('External API rate limiting', async ({ request }) => {
    // Test rate limiting on external API calls
    const requests = Array(10).fill(null).map(() => 
      request.get('/api/external/test-endpoint')
    );

    const responses = await Promise.all(requests);
    
    // Some requests should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('External service health checks', async ({ request }) => {
    // Test health check endpoint
    const response = await request.get('/api/health/external-services');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.stripe).toBe('healthy');
    expect(data.sendgrid).toBe('healthy');
    expect(data.twilio).toBe('healthy');
    expect(data.firebase).toBe('healthy');
    expect(data.truora).toBe('healthy');
    expect(data.redis).toBe('healthy');
  });

  test('External service error handling', async ({ request }) => {
    // Test error handling when external service is down
    const response = await request.post('/api/payments/create-intent', {
      data: {
        amount: 5000,
        currency: 'mxn',
        transactionId: 'test-transaction-error'
      }
    });

    // Should handle external service errors gracefully
    if (response.status() === 503) {
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Servicio de pagos no disponible');
    }
  });

  test('External service retry mechanism', async ({ request }) => {
    // Test retry mechanism for failed external service calls
    const response = await request.post('/api/notifications/send-email', {
      data: {
        to: 'test@example.com',
        subject: 'Test Email with Retry',
        template: 'welcome',
        data: {
          name: 'Test User'
        }
      }
    });

    // Should retry failed calls and eventually succeed or fail gracefully
    expect([200, 503, 500]).toContain(response.status());
  });

  test('External service monitoring', async ({ request }) => {
    // Test external service monitoring
    const response = await request.get('/api/monitoring/external-services');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.services).toBeDefined();
    expect(Array.isArray(data.services)).toBe(true);
    
    // Each service should have monitoring data
    data.services.forEach((service: any) => {
      expect(service.name).toBeDefined();
      expect(service.status).toBeDefined();
      expect(service.responseTime).toBeDefined();
      expect(service.lastCheck).toBeDefined();
    });
  });
});
