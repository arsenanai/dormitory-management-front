import { test, expect } from '@playwright/test';

test.describe('Messages Edit Functionality', () => {
  test('should be able to edit a message', async ({ page }) => {
    // Listen to console messages
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.log('Page error:', error.message));
    
    // Login first
    await page.goto('/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for redirect to main page
    await page.waitForURL('/main');
    
    // Navigate to messages page
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    
    // Wait for messages to load
    await page.waitForSelector('table tbody tr');
    
    // First, create a new message (which will be in draft status)
    console.log('=== CREATING A NEW MESSAGE FOR EDITING ===');
    
    // Click Add Message button
    await page.click('[data-testid="add-message-button"]');
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="message-title-input"]');
    
    // Fill the form
    await page.fill('input[data-testid="message-title-input"]', 'Test Message for Editing');
    await page.fill('#message-content-input', 'This is a test message that will be edited');
    
    // Select recipient type
    await page.selectOption('#recipient-type-select', 'all');
    
    // Submit the form
    await page.click('[data-testid="submit-message-button"]');
    
    // Wait for modal to close and page to refresh
    await page.waitForTimeout(1000);
    
    // Verify the new message appears
    const newMessageExists = await page.locator('text=Test Message for Editing').first().isVisible();
    expect(newMessageExists).toBe(true);
    
    // Now try to edit the message
    console.log('=== TESTING EDIT FUNCTIONALITY ===');
    
    // Find and click edit button for the message we just created
    const editButton = page.locator('text=Test Message for Editing').first().locator('xpath=ancestor::tr').locator('[data-testid="edit-message-button"]');
    await editButton.click();
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="message-title-input"]');
    
    // Update the title and content
    await page.fill('input[data-testid="message-title-input"]', 'Updated Test Message Title');
    await page.fill('#message-content-input', 'This message has been successfully updated');
    
    // Submit the form
    await page.click('[data-testid="submit-message-button"]');
    
    // Wait for modal to close
    await page.waitForTimeout(1000);
    
    // Verify the message was updated
    const updatedMessageExists = await page.locator('text=Updated Test Message Title').first().isVisible();
    expect(updatedMessageExists).toBe(true);
    
    // Verify the old title is no longer visible
    const oldMessageExists = await page.locator('text=Test Message for Editing').isVisible();
    expect(oldMessageExists).toBe(false);
    
    console.log('=== EDIT FUNCTIONALITY WORKS! ===');
  });
});
