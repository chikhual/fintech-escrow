import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // 1. Start backend services
  console.log('📦 Starting backend services...');
  try {
    execSync('cd backend && docker-compose up -d', { stdio: 'inherit' });
    console.log('✅ Backend services started');
  } catch (error) {
    console.error('❌ Failed to start backend services:', error);
    throw error;
  }

  // 2. Wait for services to be ready
  console.log('⏳ Waiting for services to be ready...');
  await waitForServices();

  // 3. Run database migrations
  console.log('🗄️ Running database migrations...');
  try {
    execSync('cd backend && python -m alembic upgrade head', { stdio: 'inherit' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Failed to run database migrations:', error);
    throw error;
  }

  // 4. Seed test data
  console.log('🌱 Seeding test data...');
  await seedTestData();

  // 5. Create test users
  console.log('👥 Creating test users...');
  await createTestUsers();

  // 6. Verify frontend is accessible
  console.log('🌐 Verifying frontend accessibility...');
  await verifyFrontend();

  console.log('✅ Global setup completed successfully!');
}

async function waitForServices() {
  const maxRetries = 30;
  const retryDelay = 2000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check if backend API is responding
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        console.log('✅ Backend API is ready');
        break;
      }
    } catch (error) {
      console.log(`⏳ Waiting for backend API... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    if (i === maxRetries - 1) {
      throw new Error('Backend API did not become ready within timeout');
    }
  }
}

async function seedTestData() {
  const testData = {
    users: [
      {
        username: 'admin_test',
        email: 'admin@test.com',
        password: 'Test123!',
        role: 'admin',
        is_verified: true,
        is_kyc_verified: true
      },
      {
        username: 'advisor_test',
        email: 'advisor@test.com',
        password: 'Test123!',
        role: 'advisor',
        is_verified: true,
        is_kyc_verified: true
      },
      {
        username: 'seller_test',
        email: 'seller@test.com',
        password: 'Test123!',
        role: 'seller',
        is_verified: true,
        is_kyc_verified: true
      },
      {
        username: 'buyer_test',
        email: 'buyer@test.com',
        password: 'Test123!',
        role: 'buyer',
        is_verified: true,
        is_kyc_verified: true
      },
      {
        username: 'broker_test',
        email: 'broker@test.com',
        password: 'Test123!',
        role: 'broker',
        is_verified: true,
        is_kyc_verified: true
      }
    ],
    test_transactions: [
      {
        buyer_id: 4,
        seller_id: 3,
        item_name: 'iPhone 15 Pro',
        item_description: 'Nuevo iPhone 15 Pro 256GB',
        item_price: 25000,
        currency: 'MXN',
        amount: 25000,
        status: 'pending_agreement'
      },
      {
        buyer_id: 4,
        seller_id: 3,
        item_name: 'MacBook Pro M3',
        item_description: 'MacBook Pro 14" con chip M3',
        item_price: 45000,
        currency: 'MXN',
        amount: 45000,
        status: 'payment_received'
      }
    ]
  };

  // Save test data to file for use in tests
  const testDataPath = path.join(__dirname, '..', 'test-data.json');
  fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
  console.log('✅ Test data saved to test-data.json');
}

async function createTestUsers() {
  const testDataPath = path.join(__dirname, '..', 'test-data.json');
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

  for (const user of testData.users) {
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        console.log(`✅ Created test user: ${user.username}`);
      } else {
        console.log(`⚠️ User ${user.username} might already exist`);
      }
    } catch (error) {
      console.error(`❌ Failed to create user ${user.username}:`, error);
    }
  }
}

async function verifyFrontend() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
    
    // Check if the page loads without errors
    const title = await page.title();
    if (title.includes('FinTech ESCROW')) {
      console.log('✅ Frontend is accessible');
    } else {
      throw new Error('Frontend title does not match expected value');
    }
  } catch (error) {
    console.error('❌ Frontend verification failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
