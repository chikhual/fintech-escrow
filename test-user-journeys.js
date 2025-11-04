/**
 * Browser Automation Testing Script
 * Tests all critical user journeys
 * Run with: node test-user-journeys.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
  baseUrl: 'http://localhost:4200',
  timeout: 30000,
  headless: false, // Set to true for CI/CD
  slowMo: 100, // Slow down operations for debugging
  screenshotDir: './test-screenshots',
  testUser: {
    email: 'vendedor@test.com',
    password: 'Vendedor1$'
  }
};

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: Date.now()
};

// Helper functions
async function takeScreenshot(page, name) {
  const dir = CONFIG.screenshotDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await page.screenshot({ 
    path: `${dir}/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

async function checkConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

async function checkNetworkErrors(page) {
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure().errorText
    });
  });
  return failedRequests;
}

// Test: Landing Page Load
async function testLandingPage(browser) {
  console.log('🧪 Testing: Landing Page Load');
  const page = await browser.newPage();
  
  try {
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'landing-page');
    
    // Check if main elements are present
    const hasHomeComponent = await page.$('app-consufin-home') !== null;
    
    if (hasHomeComponent) {
      testResults.passed.push('Landing Page Load');
      console.log('✅ Landing page loaded correctly');
    } else {
      testResults.failed.push({ test: 'Landing Page Load', error: 'Home component not found' });
      console.log('❌ Landing page failed');
    }
  } catch (error) {
    testResults.failed.push({ test: 'Landing Page Load', error: error.message });
    console.log('❌ Landing page error:', error.message);
  } finally {
    await page.close();
  }
}

// Test: Registration Flow
async function testRegistrationFlow(browser) {
  console.log('🧪 Testing: Registration Flow');
  const page = await browser.newPage();
  
  try {
    // Navigate to registration
    await page.goto(`${CONFIG.baseUrl}/consufin/registro`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'registration-page');
    
    // Check if registration form exists
    const hasForm = await page.$('form') !== null;
    
    if (hasForm) {
      testResults.passed.push('Registration Page Load');
      console.log('✅ Registration page loaded');
    } else {
      testResults.failed.push({ test: 'Registration Flow', error: 'Registration form not found' });
      console.log('❌ Registration form not found');
    }
  } catch (error) {
    testResults.failed.push({ test: 'Registration Flow', error: error.message });
    console.log('❌ Registration error:', error.message);
  } finally {
    await page.close();
  }
}

// Test: Login Flow
async function testLoginFlow(browser) {
  console.log('🧪 Testing: Login Flow');
  const page = await browser.newPage();
  
  try {
    // Monitor console and network errors
    const consoleErrors = [];
    const networkErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        error: request.failure().errorText
      });
    });
    
    // Navigate to login
    await page.goto(`${CONFIG.baseUrl}/consufin/registro`, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'login-page-initial');
    
    // Find email and password inputs
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    
    if (!emailInput || !passwordInput) {
      testResults.failed.push({ 
        test: 'Login Flow', 
        error: 'Login form inputs not found',
        screenshot: 'login-page-initial'
      });
      console.log('❌ Login form inputs not found');
      await takeScreenshot(page, 'login-form-not-found');
      await page.close();
      return;
    }
    
    // Fill login form
    await emailInput.type(CONFIG.testUser.email, { delay: 50 });
    await passwordInput.type(CONFIG.testUser.password, { delay: 50 });
    await takeScreenshot(page, 'login-filled');
    
    // Find and click submit button
    const submitButton = await page.$('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")');
    
    if (submitButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        submitButton.click()
      ]);
      
      await page.waitForTimeout(2000); // Wait for redirect
      await takeScreenshot(page, 'login-submitted');
      
      // Check if redirected to user portal
      const currentUrl = page.url();
      const isOnUserPortal = currentUrl.includes('/consufin/usuario') || 
                            currentUrl.includes('/usuario') ||
                            await page.$('app-user-portal') !== null;
      
      if (isOnUserPortal) {
        testResults.passed.push('Login Flow');
        console.log('✅ Login successful, redirected to user portal');
        
        // Check for WebSocket connection
        await page.waitForTimeout(2000);
        const wsConnected = await page.evaluate(() => {
          return window.performance.getEntriesByType('resource')
            .some(r => r.name.includes('ws://') || r.name.includes('wss://'));
        });
        
        if (wsConnected) {
          testResults.passed.push('WebSocket Connection');
          console.log('✅ WebSocket connection detected');
        } else {
          testResults.warnings.push('WebSocket connection not detected');
        }
      } else {
        testResults.failed.push({ 
          test: 'Login Flow', 
          error: `Expected redirect to user portal, but got: ${currentUrl}`,
          consoleErrors,
          networkErrors
        });
        console.log(`❌ Login failed - Current URL: ${currentUrl}`);
      }
    } else {
      testResults.failed.push({ 
        test: 'Login Flow', 
        error: 'Submit button not found' 
      });
      console.log('❌ Submit button not found');
    }
    
    // Report errors
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors:', consoleErrors);
      testResults.warnings.push(`Console errors: ${consoleErrors.join(', ')}`);
    }
    
    if (networkErrors.length > 0) {
      console.log('⚠️ Network errors:', networkErrors);
      testResults.warnings.push(`Network errors: ${networkErrors.length} failed requests`);
    }
    
  } catch (error) {
    testResults.failed.push({ test: 'Login Flow', error: error.message });
    console.log('❌ Login flow error:', error.message);
    await takeScreenshot(page, 'login-error');
  } finally {
    await page.close();
  }
}

// Test: User Portal Navigation
async function testUserPortalNavigation(browser) {
  console.log('🧪 Testing: User Portal Navigation');
  const page = await browser.newPage();
  
  try {
    // First login
    await page.goto(`${CONFIG.baseUrl}/consufin/registro`);
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.type('input[type="email"], input[name="email"]', CONFIG.testUser.email);
    await page.type('input[type="password"]', CONFIG.testUser.password);
    
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        submitButton.click()
      ]);
      await page.waitForTimeout(3000);
    }
    
    // Test navigation to different sections
    const sections = [
      { name: 'Dashboard', selector: 'button:has-text("Dashboard")' },
      { name: 'Perfil', selector: 'button:has-text("Perfil")' },
      { name: 'Transacciones', selector: 'button:has-text("Transacciones")' },
      { name: 'Notificaciones', selector: 'button:has-text("Notificaciones")' }
    ];
    
    for (const section of sections) {
      try {
        const button = await page.$(section.selector);
        if (button) {
          await button.click();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, `portal-${section.name.toLowerCase()}`);
          testResults.passed.push(`Navigation to ${section.name}`);
          console.log(`✅ Navigated to ${section.name}`);
        }
      } catch (error) {
        testResults.warnings.push(`Could not navigate to ${section.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    testResults.failed.push({ test: 'User Portal Navigation', error: error.message });
    console.log('❌ Navigation error:', error.message);
  } finally {
    await page.close();
  }
}

// Test: Transaction Pagination
async function testTransactionPagination(browser) {
  console.log('🧪 Testing: Transaction Pagination');
  const page = await browser.newPage();
  
  try {
    // Login first
    await page.goto(`${CONFIG.baseUrl}/consufin/registro`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', CONFIG.testUser.email);
    await page.type('input[type="password"]', CONFIG.testUser.password);
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        submitButton.click()
      ]);
      await page.waitForTimeout(3000);
    }
    
    // Navigate to transactions
    const transButton = await page.$('button:has-text("Transacciones")');
    if (transButton) {
      await transButton.click();
      await page.waitForTimeout(2000);
      
      // Check for pagination controls
      const pagination = await page.$('button:has-text("Siguiente"), button:has-text("Anterior")');
      if (pagination) {
        testResults.passed.push('Transaction Pagination UI');
        console.log('✅ Pagination controls found');
        await takeScreenshot(page, 'transactions-pagination');
      } else {
        testResults.warnings.push('Pagination controls not visible (may not be needed if < 20 items)');
      }
    }
    
  } catch (error) {
    testResults.failed.push({ test: 'Transaction Pagination', error: error.message });
    console.log('❌ Pagination test error:', error.message);
  } finally {
    await page.close();
  }
}

// Test: Cache Functionality
async function testCacheFunctionality(browser) {
  console.log('🧪 Testing: Cache Functionality');
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto(`${CONFIG.baseUrl}/consufin/registro`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', CONFIG.testUser.email);
    await page.type('input[type="password"]', CONFIG.testUser.password);
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        submitButton.click()
      ]);
      await page.waitForTimeout(3000);
    }
    
    // Check localStorage for cache
    const cacheKeys = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keys.push(key);
        }
      }
      return keys;
    });
    
    if (cacheKeys.length > 0) {
      testResults.passed.push('Cache Functionality');
      console.log(`✅ Cache found: ${cacheKeys.length} entries`);
    } else {
      testResults.warnings.push('No cache entries found (may be normal if no data loaded yet)');
    }
    
  } catch (error) {
    testResults.failed.push({ test: 'Cache Functionality', error: error.message });
    console.log('❌ Cache test error:', error.message);
  } finally {
    await page.close();
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting User Journey Tests\n');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Run tests in sequence
    await testLandingPage(browser);
    await testRegistrationFlow(browser);
    await testLoginFlow(browser);
    await testUserPortalNavigation(browser);
    await testTransactionPagination(browser);
    await testCacheFunctionality(browser);
    
  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await browser.close();
  }
  
  // Generate report
  generateReport();
}

// Generate test report
function generateReport() {
  const duration = ((Date.now() - testResults.startTime) / 1000).toFixed(2);
  
  const report = {
    summary: {
      total: testResults.passed.length + testResults.failed.length,
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      warnings: testResults.warnings.length,
      duration: `${duration}s`
    },
    passed: testResults.passed,
    failed: testResults.failed,
    warnings: testResults.warnings
  };
  
  console.log('\n📊 TEST REPORT');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⚠️  Warnings: ${report.summary.warnings}`);
  console.log(`⏱️  Duration: ${report.summary.duration}`);
  console.log('='.repeat(50));
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach((test, index) => {
      console.log(`${index + 1}. ${test.test}: ${test.error}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  // Save report to file
  fs.writeFileSync(
    './test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Report saved to: test-report.json');
  console.log(`📸 Screenshots saved to: ${CONFIG.screenshotDir}/`);
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };

