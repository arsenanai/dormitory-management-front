import { test, expect } from '@playwright/test';

test.describe('Message Dormitory Flow Debug', () => {
  test('Debug message form structure', async ({ page }) => {
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
    
    // Navigate to Messages page
    await page.click('text=Messages');
    await page.waitForURL('/messages');
    
    // Click Add Message button
    await page.click('[data-testid="add-message-button"]');
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    
    // Take a screenshot of the modal
    await page.screenshot({ path: 'debug-message-modal.png' });
    
    // Check what elements are available in the modal
    const modalElements = page.locator('[data-testid="message-title-input"], [data-testid="message-content-input"], [data-testid="recipient-type-select"], [data-testid="dormitory-select"]');
    const elementCount = await modalElements.count();
    console.log('Modal elements found:', elementCount);
    
    // Check for input elements
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();
    console.log('Input elements found:', inputCount);
    
    // List all input elements
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const tagName = await input.evaluate(el => el.tagName);
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`Input ${i}: ${tagName}, id: ${id}, placeholder: ${placeholder}`);
    }
    
    // Check for select elements
    const selects = page.locator('select');
    const selectCount = await selects.count();
    console.log('Select elements found:', selectCount);
    
    // List all select elements
    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      const id = await select.getAttribute('id');
      const options = await select.locator('option').allTextContents();
      console.log(`Select ${i}: id: ${id}, options: ${options}`);
    }
  });
});
