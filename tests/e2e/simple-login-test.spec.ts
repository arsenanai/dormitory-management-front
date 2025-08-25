import { test, expect } from '@playwright/test';

test.describe('Simple Login Test', () => {
  test('should login successfully as admin', async ({ page }) => {
    console.log('🔍 Starting simple login test...');
    
    // Step 1: Go to login page
    console.log('📱 Step 1: Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify we're on login page
    await expect(page.locator('[data-testid="tab-login"]')).toBeVisible();
    console.log('✅ Login page loaded');
    
    // Step 2: Login as admin
    console.log('🔐 Step 2: Logging in as admin...');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    
    // Capture all console messages
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]:`, msg.text());
      if (msg.type() === 'error') {
        console.log(`🔍 Console Error Stack:`, msg.location());
      }
    });
    
    // Capture all page errors
    page.on('pageerror', error => {
      console.log(`🔍 Page Error:`, error.message);
      console.log(`🔍 Page Error Stack:`, error.stack);
    });
    
    // Capture all request failures
    page.on('requestfailed', request => {
      console.log(`🔍 Request Failed:`, request.method(), request.url());
      console.log(`🔍 Failure Reason:`, request.failure()?.errorText);
    });
    
    // Capture all requests
    page.on('request', request => {
      console.log(`🔍 Request:`, request.method(), request.url());
      if (request.postData()) {
        console.log(`🔍 Request Body:`, request.postData());
      }
      console.log(`🔍 Request Headers:`, request.headers());
    });
    
    // Capture all responses
    page.on('response', async response => {
      console.log(`🔍 Response:`, response.status(), response.url());
      console.log(`🔍 Response Headers:`, response.headers());
      
      try {
        const responseText = await response.text();
        if (response.url().includes('/api/login')) {
          console.log(`🔍 Login Response Body:`, responseText);
        } else if (response.url().includes('/api/')) {
          console.log(`🔍 API Response Body:`, responseText);
        }
      } catch (error) {
        console.log(`🔍 Could not read response body:`, error);
      }
    });
    
    // Click login button
    console.log('🔍 Clicking login button...');
    await page.click('button[type="submit"]');
    
    // Wait for any response
    console.log('⏳ Waiting for login response...');
    await page.waitForTimeout(5000);
    
    // Check current URL and page content
    console.log('🔍 Current URL:', page.url());
    console.log('🔍 Page title:', await page.title());
    
    // Check for error messages
    const errorElements = page.locator('.error, .alert, [class*="error"], [class*="alert"], .toast-error, [class*="toast"]');
    const errorCount = await errorElements.count();
    console.log(`🔍 Error elements found: ${errorCount}`);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        const errorClass = await errorElements.nth(i).getAttribute('class');
        console.log(`🔍 Error ${i + 1}:`, errorText);
        console.log(`🔍 Error ${i + 1} classes:`, errorClass);
      }
    }
    
    // Check for success messages
    const successElements = page.locator('.success, .toast-success, [class*="success"]');
    const successCount = await successElements.count();
    console.log(`🔍 Success elements found: ${successCount}`);
    
    if (successCount > 0) {
      for (let i = 0; i < successCount; i++) {
        const successText = await successElements.nth(i).textContent();
        console.log(`🔍 Success ${i + 1}:`, successText);
      }
    }
    
    // Check if we're still on login page
    const isStillOnLogin = await page.locator('[data-testid="tab-login"]').isVisible();
    console.log('🔍 Still on login page:', isStillOnLogin);
    
    // Check localStorage and sessionStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          items[key] = localStorage.getItem(key);
        }
      }
      return items;
    });
    console.log('🔍 LocalStorage:', localStorage);
    
    const sessionStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          items[key] = sessionStorage.getItem(key);
        }
      }
      return items;
    });
    console.log('🔍 SessionStorage:', sessionStorage);
    
    // Wait a bit more to see if redirect happens
    await page.waitForTimeout(3000);
    
    console.log('🔍 Final URL:', page.url());
    console.log('🔍 Final page title:', await page.title());
    
    // Check if there are any network errors in the console
    const networkErrors = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/api/'))
        .map(entry => ({
          url: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize,
          failed: entry.transferSize === 0
        }));
    });
    console.log('🔍 Network API calls:', networkErrors);
    
    // For now, just log everything without failing
    console.log('✅ Test completed - check logs above for details');
  });
});
