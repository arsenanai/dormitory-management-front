import { test, expect } from '@playwright/test';

test.describe('Debug Login Issue', () => {
  test('should debug login API call', async ({ page }) => {
    console.log('🔍 Starting login debug test...');
    
    // Enable network logging
    page.on('request', request => {
      console.log(`📤 Request: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`📥 Response: ${response.status()} ${response.url()}`);
      if (response.status() >= 400) {
        response.text().then(text => {
          console.log(`❌ Error response body: ${text.substring(0, 200)}`);
        });
      }
    });
    
    // Navigate to login page
    console.log('📱 Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for login form
    await page.waitForSelector('[data-testid="tab-login"]', { timeout: 10000 });
    console.log('✅ Login form loaded');
    
    // Fill login form
    console.log('🔐 Filling login form...');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    
    // Click login button
    console.log('🖱️ Clicking login button...');
    await page.click('button[type="submit"]');
    
    // Wait and check what happens
    console.log('⏳ Waiting for login response...');
    await page.waitForTimeout(5000);
    
    // Check current state
    console.log('🔍 Current URL:', page.url());
    console.log('🔍 Page title:', await page.title());
    
    // Check for error messages
    const errorElements = page.locator('.error, .alert, [class*="error"], [class*="alert"]');
    const errorCount = await errorElements.count();
    console.log(`🔍 Error elements found: ${errorCount}`);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`🔍 Error ${i + 1}:`, errorText);
      }
    }
    
    // Check if we're still on login page
    const isStillOnLogin = await page.locator('[data-testid="tab-login"]').isVisible();
    console.log(`🔍 Still on login page: ${isStillOnLogin}`);
    
    // Keep browser open for manual inspection
    console.log('🔍 Test complete. Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);
  });
}); 