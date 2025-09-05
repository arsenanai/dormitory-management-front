import { test, expect } from '@playwright/test';

test.describe('Message Dormitory Flow Debug', () => {
  test('Debug modal content specifically', async ({ page }) => {
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
    await page.waitForTimeout(2000);
    
    // Find the modal and examine its content
    const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
    
    // Check what's inside the modal
    const modalInputs = modal.locator('input, textarea');
    const modalInputCount = await modalInputs.count();
    console.log('Inputs inside modal:', modalInputCount);
    
    // List all inputs inside the modal
    for (let i = 0; i < modalInputCount; i++) {
      const input = modalInputs.nth(i);
      const tagName = await input.evaluate(el => el.tagName);
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.getAttribute('value');
      console.log(`Modal input ${i}: ${tagName}, id: ${id}, placeholder: ${placeholder}, value: ${value}`);
    }
    
    // Check for select elements inside modal
    const modalSelects = modal.locator('select');
    const modalSelectCount = await modalSelects.count();
    console.log('Selects inside modal:', modalSelectCount);
    
    // List all selects inside the modal
    for (let i = 0; i < modalSelectCount; i++) {
      const select = modalSelects.nth(i);
      const id = await select.getAttribute('id');
      const options = await select.locator('option').allTextContents();
      console.log(`Modal select ${i}: id: ${id}, options: ${options}`);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-modal-content.png' });
  });
});
