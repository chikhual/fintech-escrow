import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Starting global teardown...');
  
  try {
    // 1. Stop backend services
    console.log('🛑 Stopping backend services...');
    execSync('cd backend && docker-compose down', { stdio: 'inherit' });
    console.log('✅ Backend services stopped');

    // 2. Clean up test data
    console.log('🗑️ Cleaning up test data...');
    const testDataPath = path.join(__dirname, '..', 'test-data.json');
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
      console.log('✅ Test data cleaned up');
    }

    // 3. Clean up test results
    console.log('🧽 Cleaning up test results...');
    const testResultsPath = path.join(__dirname, '..', 'test-results');
    if (fs.existsSync(testResultsPath)) {
      fs.rmSync(testResultsPath, { recursive: true, force: true });
      console.log('✅ Test results cleaned up');
    }

    // 4. Clean up playwright report
    console.log('📊 Cleaning up playwright report...');
    const reportPath = path.join(__dirname, '..', 'playwright-report');
    if (fs.existsSync(reportPath)) {
      fs.rmSync(reportPath, { recursive: true, force: true });
      console.log('✅ Playwright report cleaned up');
    }

    // 5. Clean up allure results
    console.log('📈 Cleaning up allure results...');
    const allurePath = path.join(__dirname, '..', 'allure-results');
    if (fs.existsSync(allurePath)) {
      fs.rmSync(allurePath, { recursive: true, force: true });
      console.log('✅ Allure results cleaned up');
    }

    console.log('✅ Global teardown completed successfully!');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

export default globalTeardown;
