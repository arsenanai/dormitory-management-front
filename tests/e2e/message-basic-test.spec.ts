import { test, expect } from '@playwright/test';

test.describe('Message Basic Test', () => {
  test('Admin can create a basic message', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Test data
    const adminEmail = 'admin@email.com';
    const adminPassword = 'supersecret';
    const testMessageTitle = 'Basic Test Message';
    const testMessageContent = 'This is a basic test message';

    // Step 1: Admin logs in
    await page.goto('/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for admin dashboard to load
    await page.waitForURL('/main');
    
    // Navigate to Messages page
    await page.click('text=Messages');
    await page.waitForURL('/messages');
    
    // Click Add Message button
    await page.click('[data-testid="add-message-button"]');
    
    // Wait for modal to appear
    await page.waitForTimeout(2000);
    
    // Find the modal
    const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
    
    // Fill the message form
    await modal.locator('input').first().fill(testMessageTitle);
    await modal.locator('textarea').first().fill(testMessageContent);
    
    // Select individual recipient type (simpler than dormitory)
    await modal.locator('select').first().selectOption('individual');
    
    // Submit the message
    await page.click('[data-testid="submit-message-button"]');
    
    // Wait and check for any messages
    await page.waitForTimeout(3000);
    
    // Report any errors
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-basic-message.png' });
    
    // Check if modal is still open (indicating an error)
    const modalStillOpen = await modal.count();
    console.log('Modal still open after submit:', modalStillOpen);
    
    // Check for any error or success messages
    const allMessages = page.locator('.error, .alert-error, .success, .alert-success, [role="alert"]');
    const messageCount = await allMessages.count();
    console.log('All messages found:', messageCount);
    
    if (messageCount > 0) {
      const messageTexts = await allMessages.allTextContents();
      console.log('Message texts:', messageTexts);
    }
  });
});
