import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';

test.describe('Performance Tests', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('@performance @smoke Page load times are within acceptable limits', async ({ page }) => {
    // Test home page load time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homePageLoadTime = Date.now() - startTime;
    
    expect(homePageLoadTime).toBeLessThan(3000); // 3 seconds max

    // Test login page load time
    const loginStartTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const loginPageLoadTime = Date.now() - loginStartTime;
    
    expect(loginPageLoadTime).toBeLessThan(2000); // 2 seconds max

    // Test dashboard load time
    await authPage.login('buyer@test.com', 'Test123!');
    const dashboardStartTime = Date.now();
    await dashboardPage.goto();
    await page.waitForLoadState('networkidle');
    const dashboardLoadTime = Date.now() - dashboardStartTime;
    
    expect(dashboardLoadTime).toBeLessThan(3000); // 3 seconds max
  });

  test('@performance @smoke API response times are within acceptable limits', async ({ page }) => {
    // Test API response times
    const apiTests = [
      { url: '/api/auth/login', method: 'POST', maxTime: 1000 },
      { url: '/api/transactions', method: 'GET', maxTime: 500 },
      { url: '/api/users/profile', method: 'GET', maxTime: 500 },
      { url: '/api/notifications', method: 'GET', maxTime: 500 }
    ];

    for (const apiTest of apiTests) {
      const startTime = Date.now();
      
      if (apiTest.method === 'POST') {
        await page.request.post(apiTest.url, {
          data: { email: 'buyer@test.com', password: 'Test123!' }
        });
      } else {
        await page.request.get(apiTest.url);
      }
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(apiTest.maxTime);
    }
  });

  test('@performance @smoke Database queries are optimized', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Test transaction list load time
    const startTime = Date.now();
    await dashboardPage.gotoTransactions();
    await page.waitForLoadState('networkidle');
    const transactionListTime = Date.now() - startTime;
    
    expect(transactionListTime).toBeLessThan(2000); // 2 seconds max

    // Test search performance
    const searchStartTime = Date.now();
    await page.locator('input[data-testid="transaction-search"]').fill('iPhone');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    const searchTime = Date.now() - searchStartTime;
    
    expect(searchTime).toBeLessThan(1000); // 1 second max
  });

  test('@performance @smoke Image loading is optimized', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to transaction with images
    await dashboardPage.gotoTransactions();
    await page.locator('tr:has-text("iPhone 15 Pro Max")').first().click();
    await page.locator('button[data-testid="view-details"]').click();

    // Test image loading time
    const startTime = Date.now();
    await page.waitForSelector('img[data-testid="product-image"]');
    const imageLoadTime = Date.now() - startTime;
    
    expect(imageLoadTime).toBeLessThan(2000); // 2 seconds max

    // Verify images are properly sized
    const images = await page.locator('img[data-testid="product-image"]').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      expect(src).toContain('w_'); // Should have width parameter for optimization
    }
  });

  test('@performance @smoke Memory usage is within acceptable limits', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate through multiple pages to test memory usage
    const pages = [
      () => dashboardPage.goto(),
      () => dashboardPage.gotoTransactions(),
      () => dashboardPage.gotoTransactionHistory(),
      () => dashboardPage.gotoProfile()
    ];

    for (const navigateToPage of pages) {
      await navigateToPage();
      await page.waitForLoadState('networkidle');
      
      // Check memory usage (this is a simplified check)
      const metrics = await page.evaluate(() => {
        return {
          memory: (performance as any).memory?.usedJSHeapSize || 0,
          timestamp: Date.now()
        };
      });
      
      // Memory usage should be reasonable (less than 100MB)
      expect(metrics.memory).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('@performance @smoke Concurrent user simulation', async ({ browser }) => {
    // Create multiple browser contexts to simulate concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(contexts.map(context => context.newPage()));

    // Login all users simultaneously
    const loginPromises = pages.map(async (page, index) => {
      const authPage = new AuthPage(page);
      await authPage.goto();
      await authPage.login(`buyer${index}@test.com`, 'Test123!');
    });

    const startTime = Date.now();
    await Promise.all(loginPromises);
    const loginTime = Date.now() - startTime;

    // All users should be able to login within 5 seconds
    expect(loginTime).toBeLessThan(5000);

    // Navigate to dashboard simultaneously
    const dashboardPromises = pages.map(page => {
      const dashboardPage = new DashboardPage(page);
      return dashboardPage.goto();
    });

    const dashboardStartTime = Date.now();
    await Promise.all(dashboardPromises);
    const dashboardTime = Date.now() - dashboardStartTime;

    // All dashboards should load within 3 seconds
    expect(dashboardTime).toBeLessThan(3000);

    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });

  test('@performance @smoke Large dataset handling', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('admin@test.com', 'Test123!');

    // Test loading large transaction list
    const startTime = Date.now();
    await page.goto('/admin/transactions');
    await page.waitForLoadState('networkidle');
    const largeDatasetTime = Date.now() - startTime;
    
    expect(largeDatasetTime).toBeLessThan(5000); // 5 seconds max for large dataset

    // Test pagination performance
    const paginationStartTime = Date.now();
    await page.locator('button[data-testid="next-page"]').click();
    await page.waitForLoadState('networkidle');
    const paginationTime = Date.now() - paginationStartTime;
    
    expect(paginationTime).toBeLessThan(1000); // 1 second max for pagination
  });

  test('@performance @smoke Real-time updates performance', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Navigate to dashboard
    await dashboardPage.goto();

    // Test WebSocket connection performance
    const wsStartTime = Date.now();
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:8000/ws');
        ws.onopen = () => {
          ws.close();
          resolve(Date.now());
        };
      });
    });
    const wsTime = Date.now() - wsStartTime;
    
    expect(wsTime).toBeLessThan(1000); // 1 second max for WebSocket connection

    // Test notification delivery performance
    const notificationStartTime = Date.now();
    await page.evaluate(() => {
      // Simulate receiving a notification
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { message: 'Test notification' }
      }));
    });
    const notificationTime = Date.now() - notificationStartTime;
    
    expect(notificationTime).toBeLessThan(100); // 100ms max for notification processing
  });

  test('@performance @smoke Mobile performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test mobile page load times
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const mobileLoadTime = Date.now() - startTime;
    
    expect(mobileLoadTime).toBeLessThan(3000); // 3 seconds max for mobile

    // Test mobile login performance
    await page.goto('/login');
    const loginStartTime = Date.now();
    await authPage.fillLoginForm({ email: 'buyer@test.com', password: 'Test123!' });
    await authPage.submitLogin();
    await page.waitForLoadState('networkidle');
    const mobileLoginTime = Date.now() - loginStartTime;
    
    expect(mobileLoginTime).toBeLessThan(2000); // 2 seconds max for mobile login

    // Test mobile dashboard performance
    const dashboardStartTime = Date.now();
    await dashboardPage.goto();
    await page.waitForLoadState('networkidle');
    const mobileDashboardTime = Date.now() - dashboardStartTime;
    
    expect(mobileDashboardTime).toBeLessThan(3000); // 3 seconds max for mobile dashboard
  });

  test('@performance @smoke Network optimization', async ({ page }) => {
    // Test resource compression
    const response = await page.request.get('/');
    const contentEncoding = response.headers()['content-encoding'];
    expect(contentEncoding).toBe('gzip'); // Should be gzipped

    // Test caching headers
    const staticResponse = await page.request.get('/static/css/main.css');
    const cacheControl = staticResponse.headers()['cache-control'];
    expect(cacheControl).toContain('max-age'); // Should have caching headers

    // Test CDN usage for static assets
    const imgResponse = await page.request.get('/static/images/logo.png');
    const server = imgResponse.headers()['server'];
    expect(server).toBeDefined(); // Should be served from CDN
  });

  test('@performance @smoke Database connection pooling', async ({ page }) => {
    // Login first
    await authPage.goto();
    await authPage.login('buyer@test.com', 'Test123!');

    // Make multiple rapid requests to test connection pooling
    const requests = Array(10).fill(null).map(() => 
      page.request.get('/api/transactions')
    );

    const startTime = Date.now();
    await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    // All requests should complete within 2 seconds
    expect(totalTime).toBeLessThan(2000);
    
    // Average response time should be reasonable
    const avgResponseTime = totalTime / requests.length;
    expect(avgResponseTime).toBeLessThan(200); // 200ms average
  });

  test('@performance @smoke Error handling performance', async ({ page }) => {
    // Test error page load time
    const startTime = Date.now();
    await page.goto('/nonexistent-page');
    await page.waitForLoadState('networkidle');
    const errorPageTime = Date.now() - startTime;
    
    expect(errorPageTime).toBeLessThan(1000); // 1 second max for error pages

    // Test API error response time
    const apiStartTime = Date.now();
    try {
      await page.request.get('/api/nonexistent-endpoint');
    } catch (error) {
      // Expected to fail
    }
    const apiErrorTime = Date.now() - apiStartTime;
    
    expect(apiErrorTime).toBeLessThan(500); // 500ms max for API errors
  });
});
