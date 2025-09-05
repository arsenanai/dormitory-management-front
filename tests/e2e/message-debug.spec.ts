import { test, expect } from '@playwright/test';

test.describe('Message Dormitory Flow Debug', () => {
  test('Debug Messages page directly', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Test data
    const adminEmail = 'admin@email.com';
    const adminPassword = 'supersecret';

    // Step 1: Admin logs in
    await page.goto('/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for admin dashboard to load
    await page.waitForURL('/main');
    
    // Try to navigate directly to Messages page
    console.log('Navigating directly to Messages page...');
    await page.goto('/messages');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(2000);
    
    // Check if we're on the Messages page
    console.log('Current URL:', await page.url());
    console.log('Page title:', await page.title());
    
    // Check for any error messages
    const errorMessages = page.locator('.error, .alert-error, [role="alert"]');
    const errorCount = await errorMessages.count();
    console.log('Error messages found:', errorCount);
    
    if (errorCount > 0) {
      const errorTexts = await errorMessages.allTextContents();
      console.log('Error texts:', errorTexts);
    }
    
    // Check if Add Message button is visible
    const addButton = page.locator('[data-testid="add-message-button"]');
    const addButtonCount = await addButton.count();
    console.log('Add Message button found:', addButtonCount);
    
    // Check for any loading states
    const loadingElements = page.locator('[data-testid="loading"], .loading, .spinner');
    const loadingCount = await loadingElements.count();
    console.log('Loading elements found:', loadingCount);
    
    // Check for any Vue components
    const vueElements = page.locator('[data-testid="messages-page"]');
    const vueCount = await vueElements.count();
    console.log('Messages page Vue element found:', vueCount);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-messages-direct.png' });
    
    // Get page content
    const allText = await page.locator('body').textContent();
    console.log('Page text (first 500 chars):', allText?.substring(0, 500));
    
    // Report any errors
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.log('Page errors:', pageErrors);
    }
  });
});
