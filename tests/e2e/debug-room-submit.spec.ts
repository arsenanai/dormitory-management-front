import { test, expect } from './test';

test.describe('Debug Room Submit', () => {
  test('should debug room form submission', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories|users|rooms)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Navigate to rooms page
    await page.goto('http://localhost:3000/rooms');
    await page.waitForLoadState('networkidle');
    
    // Click Add Room button
    const addButton = page.locator('button:has-text("Add Room")');
    await addButton.click();
    
    // Should navigate to room form
    await expect(page).toHaveURL(/\/room-form$/);
    
    // Wait for form to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Fill the form
    const uniqueNumber = `TestRoom${Date.now()}`;
    await page.fill('#room-number', uniqueNumber);
    await page.fill('#room-floor', '5');
    await page.fill('#room-notes', 'Test room for E2E');
    
    // Select room type
    await page.selectOption('#room-type', 'standard');
    
    // Check console logs before submission
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    // Check console logs
    console.log('Console logs after submission:', consoleLogs);
    
    // Check if there are any error messages on the page
    const errorElements = page.locator('.error, .alert-danger, [role="alert"], .toast-error');
    const errorCount = await errorElements.count();
    console.log('Error elements count:', errorCount);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}:`, errorText);
      }
    }
    
    // Check if there are any success messages
    const successElements = page.locator('.success, .alert-success, .toast-success');
    const successCount = await successElements.count();
    console.log('Success elements count:', successCount);
    
    if (successCount > 0) {
      for (let i = 0; i < successCount; i++) {
        const successText = await successElements.nth(i).textContent();
        console.log(`Success ${i + 1}:`, successText);
      }
    }
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after submission:', currentUrl);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-room-submit.png' });
  });
});
