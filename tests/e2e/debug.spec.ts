import { test, expect } from './test';

test.describe('Debug Login', () => {
  test('should debug login flow with network and console logs', async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    
    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('api') || request.url().includes('login')) {
        console.log('REQUEST:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api') || response.url().includes('login')) {
        console.log('RESPONSE:', response.status(), response.url());
      }
    });
    
    await page.goto('http://localhost:3000/');
    
    // Make sure we're on the login tab first
    const loginTab = page.locator('button[role="tab"]:has-text("Login")');
    await loginTab.click();
    await page.waitForTimeout(500);
    
    // Fill in the form
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    
    console.log('Before submit - URL:', page.url());
    
    // Click the login submit button specifically
    const loginSubmitButton = page.locator('button[type="submit"]:has-text("Login")');
    await loginSubmitButton.click();
    
    console.log('After submit click - waiting for response...');
    
    // Wait for any navigation or response
    await page.waitForTimeout(5000);
    
    console.log('Final URL:', page.url());
    
    // Check for any visible error messages
    const errorSelectors = [
      '.error',
      '.text-red-500',
      '[class*="error"]',
      '[class*="red"]',
      '.alert',
      '[role="alert"]'
    ];
    
    for (const selector of errorSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        const texts = await page.locator(selector).allTextContents();
        console.log(`Error elements (${selector}):`, texts);
      }
    }
  });
});
