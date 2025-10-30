import { test, expect } from '@playwright/test';

test.describe('Transactions API Tests', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    // Login to get auth token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    authToken = loginData.access_token;
  });

  test('GET /api/transactions - should get user transactions', async ({ request }) => {
    const response = await request.get('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.transactions)).toBe(true);
  });

  test('POST /api/transactions - should create new transaction', async ({ request }) => {
    const response = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item',
        itemDescription: 'Item created via API test',
        itemPrice: 5000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.transaction.itemName).toBe('API Test Item');
    expect(data.transaction.status).toBe('pending_agreement');
  });

  test('GET /api/transactions/{id} - should get transaction details', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Details',
        itemDescription: 'Item for testing details API',
        itemPrice: 3000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Get transaction details
    const response = await request.get(`/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.transaction.id).toBe(transactionId);
    expect(data.transaction.itemName).toBe('API Test Item Details');
  });

  test('PUT /api/transactions/{id}/status - should update transaction status', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Status',
        itemDescription: 'Item for testing status update',
        itemPrice: 4000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Update transaction status
    const response = await request.put(`/api/transactions/${transactionId}/status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        new_status: 'accepted',
        notes: 'Accepted via API test'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.transaction.status).toBe('accepted');
  });

  test('GET /api/transactions/search - should search transactions', async ({ request }) => {
    const response = await request.get('/api/transactions/search', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        query: 'iPhone',
        status: 'all',
        category: 'Electronics'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.transactions)).toBe(true);
  });

  test('GET /api/transactions/filter - should filter transactions', async ({ request }) => {
    const response = await request.get('/api/transactions/filter', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        status: 'completed',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        minAmount: 1000,
        maxAmount: 50000
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.transactions)).toBe(true);
  });

  test('POST /api/transactions/{id}/messages - should send message', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Messages',
        itemDescription: 'Item for testing messages',
        itemPrice: 2000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Send message
    const response = await request.post(`/api/transactions/${transactionId}/messages`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        message: 'Test message via API',
        messageType: 'text'
      }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message.message).toBe('Test message via API');
  });

  test('GET /api/transactions/{id}/messages - should get transaction messages', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Messages List',
        itemDescription: 'Item for testing message list',
        itemPrice: 1500,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Get messages
    const response = await request.get(`/api/transactions/${transactionId}/messages`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.messages)).toBe(true);
  });

  test('POST /api/transactions/{id}/disputes - should create dispute', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Dispute',
        itemDescription: 'Item for testing disputes',
        itemPrice: 6000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Create dispute
    const response = await request.post(`/api/transactions/${transactionId}/disputes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        reason: 'item_damaged',
        description: 'Item arrived damaged',
        resolution: 'refund',
        evidence: ['damage1.jpg', 'damage2.jpg']
      }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.dispute.reason).toBe('item_damaged');
  });

  test('GET /api/transactions/{id}/disputes - should get transaction disputes', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Disputes List',
        itemDescription: 'Item for testing dispute list',
        itemPrice: 7000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Get disputes
    const response = await request.get(`/api/transactions/${transactionId}/disputes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.disputes)).toBe(true);
  });

  test('POST /api/transactions/{id}/evidence - should upload evidence', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Evidence',
        itemDescription: 'Item for testing evidence upload',
        itemPrice: 8000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Upload evidence
    const response = await request.post(`/api/transactions/${transactionId}/evidence`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        evidenceType: 'product_image',
        description: 'Product image evidence',
        files: ['evidence1.jpg', 'evidence2.jpg']
      }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.evidence.evidenceType).toBe('product_image');
  });

  test('GET /api/transactions/{id}/evidence - should get transaction evidence', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Evidence List',
        itemDescription: 'Item for testing evidence list',
        itemPrice: 9000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Get evidence
    const response = await request.get(`/api/transactions/${transactionId}/evidence`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.evidence)).toBe(true);
  });

  test('DELETE /api/transactions/{id} - should delete transaction', async ({ request }) => {
    // First create a transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        itemName: 'API Test Item Delete',
        itemDescription: 'Item for testing deletion',
        itemPrice: 1000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Delete transaction
    const response = await request.delete(`/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Transacción eliminada');
  });

  test('GET /api/transactions/stats - should get transaction statistics', async ({ request }) => {
    const response = await request.get('/api/transactions/stats', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.stats.totalTransactions).toBeDefined();
    expect(data.stats.completedTransactions).toBeDefined();
    expect(data.stats.pendingTransactions).toBeDefined();
    expect(data.stats.totalValue).toBeDefined();
  });
});
