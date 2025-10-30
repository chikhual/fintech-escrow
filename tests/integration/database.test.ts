import { test, expect } from '@playwright/test';

test.describe('Database Integration Tests', () => {
  test('Database connection is working', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.database).toBe('healthy');
  });

  test('User CRUD operations work correctly', async ({ request }) => {
    // Create user
    const createResponse = await request.post('/api/auth/register', {
      data: {
        firstName: 'DB Test',
        lastName: 'User',
        email: 'dbtest@example.com',
        phone: '+525512345678',
        password: 'Test123!',
        confirmPassword: 'Test123!',
        role: 'buyer',
        acceptTerms: true
      }
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    const userId = createData.user.id;

    // Read user
    const readResponse = await request.get(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${createData.access_token}`
      }
    });

    expect(readResponse.status()).toBe(200);
    const readData = await readResponse.json();
    expect(readData.user.email).toBe('dbtest@example.com');

    // Update user
    const updateResponse = await request.put(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${createData.access_token}`
      },
      data: {
        firstName: 'DB Test Updated',
        lastName: 'User Updated'
      }
    });

    expect(updateResponse.status()).toBe(200);
    const updateData = await updateResponse.json();
    expect(updateData.user.firstName).toBe('DB Test Updated');

    // Delete user
    const deleteResponse = await request.delete(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${createData.access_token}`
      }
    });

    expect(deleteResponse.status()).toBe(200);
    const deleteData = await deleteResponse.json();
    expect(deleteData.success).toBe(true);
  });

  test('Transaction CRUD operations work correctly', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Create transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        itemName: 'DB Test Transaction',
        itemDescription: 'Transaction for database testing',
        itemPrice: 5000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Read transaction
    const readResponse = await request.get(`/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(readResponse.status()).toBe(200);
    const readData = await readResponse.json();
    expect(readData.transaction.itemName).toBe('DB Test Transaction');

    // Update transaction
    const updateResponse = await request.put(`/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        itemDescription: 'Updated transaction description',
        itemPrice: 6000
      }
    });

    expect(updateResponse.status()).toBe(200);
    const updateData = await updateResponse.json();
    expect(updateData.transaction.itemPrice).toBe(6000);

    // Delete transaction
    const deleteResponse = await request.delete(`/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(deleteResponse.status()).toBe(200);
    const deleteData = await deleteResponse.json();
    expect(deleteData.success).toBe(true);
  });

  test('Database transactions are atomic', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Create transaction with invalid data to test rollback
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        itemName: 'DB Test Transaction Atomic',
        itemDescription: 'Transaction for testing atomicity',
        itemPrice: -1000, // Invalid negative price
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    // Should fail due to validation
    expect(createResponse.status()).toBe(400);
    const createData = await createResponse.json();
    expect(createData.success).toBe(false);

    // Verify no partial data was saved
    const listResponse = await request.get('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const listData = await listResponse.json();
    const transactionExists = listData.transactions.some((t: any) => 
      t.itemName === 'DB Test Transaction Atomic'
    );
    expect(transactionExists).toBe(false);
  });

  test('Database constraints are enforced', async ({ request }) => {
    // Test unique email constraint
    const createResponse1 = await request.post('/api/auth/register', {
      data: {
        firstName: 'DB Test',
        lastName: 'User',
        email: 'unique@example.com',
        phone: '+525512345678',
        password: 'Test123!',
        confirmPassword: 'Test123!',
        role: 'buyer',
        acceptTerms: true
      }
    });

    expect(createResponse1.status()).toBe(201);

    // Try to create another user with same email
    const createResponse2 = await request.post('/api/auth/register', {
      data: {
        firstName: 'DB Test',
        lastName: 'User',
        email: 'unique@example.com', // Same email
        phone: '+525512345679',
        password: 'Test123!',
        confirmPassword: 'Test123!',
        role: 'buyer',
        acceptTerms: true
      }
    });

    expect(createResponse2.status()).toBe(400);
    const createData2 = await createResponse2.json();
    expect(createData2.success).toBe(false);
    expect(createData2.error).toContain('Email ya registrado');
  });

  test('Database indexes are working correctly', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Test search performance with indexed fields
    const startTime = Date.now();
    const searchResponse = await request.get('/api/transactions/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        query: 'iPhone',
        status: 'completed'
      }
    });
    const searchTime = Date.now() - startTime;

    expect(searchResponse.status()).toBe(200);
    expect(searchTime).toBeLessThan(1000); // Should be fast due to indexes

    // Test filter performance
    const filterStartTime = Date.now();
    const filterResponse = await request.get('/api/transactions/filter', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        status: 'pending_agreement',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      }
    });
    const filterTime = Date.now() - filterStartTime;

    expect(filterResponse.status()).toBe(200);
    expect(filterTime).toBeLessThan(1000); // Should be fast due to indexes
  });

  test('Database relationships are working correctly', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'buyer@test.com',
        password: 'Test123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Create transaction
    const createResponse = await request.post('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        itemName: 'DB Test Transaction Relationships',
        itemDescription: 'Transaction for testing relationships',
        itemPrice: 3000,
        currency: 'MXN',
        category: 'Electronics',
        condition: 'Nuevo',
        inspectionPeriod: 3,
        buyerEmail: 'seller@test.com'
      }
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    const transactionId = createData.transaction.id;

    // Get transaction with relationships
    const getResponse = await request.get(`/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    
    // Verify relationships are loaded
    expect(getData.transaction.buyer).toBeDefined();
    expect(getData.transaction.seller).toBeDefined();
    expect(getData.transaction.buyer.email).toBe('buyer@test.com');
    expect(getData.transaction.seller.email).toBe('seller@test.com');
  });

  test('Database migrations are working correctly', async ({ request }) => {
    // Test that all required tables exist
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.database).toBe('healthy');
    expect(data.tables).toBeDefined();
    expect(data.tables.includes('users')).toBe(true);
    expect(data.tables.includes('transactions')).toBe(true);
    expect(data.tables.includes('messages')).toBe(true);
    expect(data.tables.includes('disputes')).toBe(true);
  });

  test('Database backup and restore functionality', async ({ request }) => {
    // Test backup endpoint
    const backupResponse = await request.post('/api/admin/backup', {
      headers: {
        'Authorization': 'Bearer admin-token'
      }
    });

    expect(backupResponse.status()).toBe(200);
    const backupData = await backupResponse.json();
    expect(backupData.success).toBe(true);
    expect(backupData.backupId).toBeDefined();

    // Test restore endpoint
    const restoreResponse = await request.post('/api/admin/restore', {
      headers: {
        'Authorization': 'Bearer admin-token'
      },
      data: {
        backupId: backupData.backupId
      }
    });

    expect(restoreResponse.status()).toBe(200);
    const restoreData = await restoreResponse.json();
    expect(restoreData.success).toBe(true);
  });
});
