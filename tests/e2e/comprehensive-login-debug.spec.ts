import { test, expect } from '@playwright/test';

test.describe('Comprehensive Login Debug', () => {
  test('should debug login process completely', async ({ page }) => {
    console.log('🔍 Starting comprehensive login debug...');
    
    // Enable comprehensive logging
    page.on('request', request => {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      console.log(`📤 Headers:`, request.headers());
      if (request.postData()) {
        console.log(`📤 Post data: ${request.postData()}`);
      }
    });
    
    page.on('response', response => {
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
      console.log(`📥 Headers:`, response.headers());
      
      // Log response body for API calls
      if (response.url().includes('/api/')) {
        response.text().then(text => {
          console.log(`📥 Response body: ${text.substring(0, 500)}`);
        }).catch(err => {
          console.log(`📥 Error reading response: ${err.message}`);
        });
      }
    });
    
    // Log console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      } else if (msg.type() === 'warn') {
        console.log(`⚠️ CONSOLE WARN: ${msg.text()}`);
      }
    });
    
    // Log page errors
    page.on('pageerror', error => {
      console.log(`💥 PAGE ERROR: ${error.message}`);
      console.log(`💥 Stack: ${error.stack}`);
    });
    
    // Log unhandled rejections
    page.on('unhandledrejection', rejection => {
      console.log(`🚫 UNHANDLED REJECTION: ${rejection.reason}`);
    });
    
    // Navigate to login page
    console.log('📱 Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for login form
    await page.waitForSelector('[data-testid="tab-login"]', { timeout: 10000 });
    console.log('✅ Login form loaded');
    
    // Check initial page state
    console.log('🔍 Initial page state:');
    console.log(`  URL: ${page.url()}`);
    console.log(`  Title: ${await page.title()}`);
    
    // Check if there are any existing error messages
    const initialErrors = page.locator('.error, .alert, [class*="error"], [class*="alert"]');
    const initialErrorCount = await initialErrors.count();
    console.log(`  Initial error count: ${initialErrorCount}`);
    
    // Fill login form
    console.log('🔐 Filling login form...');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    
    // Check form values
    const emailValue = await page.inputValue('#login-email');
    const passwordValue = await page.inputValue('#login-password');
    console.log(`  Email input value: ${emailValue}`);
    console.log(`  Password input value: ${passwordValue ? '[HIDDEN]' : '[EMPTY]'}`);
    
    // Click login button and wait for response
    console.log('🖱️ Clicking login button...');
    
    // Wait for the login request to complete
    const loginPromise = page.waitForResponse(response => 
      response.url().includes('/api/login') && response.request().method() === 'POST'
    );
    
    await page.click('button[type="submit"]');
    
    try {
      const loginResponse = await loginPromise;
      console.log('📥 Login response received:');
      console.log(`  Status: ${loginResponse.status()}`);
      console.log(`  Headers:`, loginResponse.headers());
      
      const responseBody = await loginResponse.text();
      console.log(`  Body: ${responseBody.substring(0, 1000)}`);
      
    } catch (error) {
      console.log('❌ No login response received within timeout');
      console.log('❌ Error:', error.message);
    }
    
    // Wait a bit more to see what happens
    console.log('⏳ Waiting for any redirects or state changes...');
    await page.waitForTimeout(5000);
    
    // Check final page state
    console.log('🔍 Final page state:');
    console.log(`  URL: ${page.url()}`);
    console.log(`  Title: ${await page.title()}`);
    
    // Check for error messages
    const finalErrors = page.locator('.error, .alert, [class*="error"], [class*="alert"]');
    const finalErrorCount = await finalErrors.count();
    console.log(`  Final error count: ${finalErrorCount}`);
    
    if (finalErrorCount > 0) {
      for (let i = 0; i < finalErrorCount; i++) {
        const errorText = await finalErrors.nth(i).textContent();
        console.log(`  Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Check if we're still on login page
    const isStillOnLogin = await page.locator('[data-testid="tab-login"]').isVisible();
    console.log(`  Still on login page: ${isStillOnLogin}`);
    
    // Check localStorage for any tokens
    const token = await page.evaluate(() => {
      return localStorage.getItem('token') || 'No token found';
    });
    console.log(`  Token in localStorage: ${token}`);
    
    // Check if any authentication state was set
    const authState = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        user: sessionStorage.getItem('user') || 'No user in sessionStorage',
        hasAuthStore: typeof window !== 'undefined' && window.__PINIA__ !== undefined
      };
    });
    console.log(`  Authentication state:`, authState);
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'login-debug-result.png', fullPage: true });
    console.log('📸 Screenshot saved as login-debug-result.png');
    
    console.log('🔍 Comprehensive debug complete. Check the output above for all details.');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(10000);
  });
});
