import { test, expect } from '@playwright/test';

test.describe('Messages Index Page Full CRUD', () => {
  test('should perform full CRUD operations on messages', async ({ page }) => {
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
    
    // 1. VERIFY INITIAL STATE
    console.log('=== 1. VERIFYING INITIAL STATE ===');
    const initialRowCount = await page.locator('table tbody tr').count();
    console.log('Initial message count:', initialRowCount);
    expect(initialRowCount).toBeGreaterThan(0);
    
    // 2. TEST SEARCH/FILTERING
    console.log('=== 2. TESTING SEARCH/FILTERING ===');
    
    // Search for a specific message
    await page.fill('#unified-search', 'Welcome to Dormitory');
    await page.waitForTimeout(500);
    
    const filteredRowCount = await page.locator('table tbody tr').count();
    console.log('Filtered message count:', filteredRowCount);
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);
    
    // Clear search
    await page.fill('#unified-search', '');
    await page.waitForTimeout(500);
    
    const clearedRowCount = await page.locator('table tbody tr').count();
    console.log('After clearing search:', clearedRowCount);
    expect(clearedRowCount).toBe(initialRowCount);
    
    // 3. TEST ADDING A NEW MESSAGE
    console.log('=== 3. TESTING ADDING A NEW MESSAGE ===');
    
    // Click Add Message button
    await page.click('[data-testid="add-message-button"]');
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="message-title-input"]');
    
    // Fill the form
    await page.fill('input[data-testid="message-title-input"]', 'Test Message from E2E');
    await page.fill('#message-content-input', 'This is a test message created by E2E test');
    
    // Select recipient type
    await page.selectOption('#recipient-type-select', 'all');
    
    // Submit the form
    await page.click('[data-testid="submit-message-button"]');
    
    // Wait for modal to close and page to refresh
    await page.waitForTimeout(1000);
    
    // Verify the new message appears
    const afterAddRowCount = await page.locator('table tbody tr').count();
    console.log('After adding message:', afterAddRowCount);
    expect(afterAddRowCount).toBe(initialRowCount + 1);
    
    // Verify the new message is in the list
    const newMessageExists = await page.locator('text=Test Message from E2E').isVisible();
    expect(newMessageExists).toBe(true);
    
    // 4. TEST EDITING A MESSAGE
    console.log('=== 4. TESTING EDITING A MESSAGE ===');
    
    // Find and click edit button for the first message
    const firstEditButton = page.locator('[data-testid="edit-message-button"]').first();
    await firstEditButton.click();
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="message-title-input"]');
    
    // Update the title
    await page.fill('input[data-testid="message-title-input"]', 'Updated Message Title');
    await page.fill('#message-content-input', 'This message has been updated by E2E test');
    
    // Submit the form
    await page.click('[data-testid="submit-message-button"]');
    
    // Wait for modal to close
    await page.waitForTimeout(1000);
    
    // Verify the message was updated
    const updatedMessageExists = await page.locator('text=Updated Message Title').isVisible();
    expect(updatedMessageExists).toBe(true);
    
    // 5. TEST DELETING A MESSAGE
    console.log('=== 5. TESTING DELETING A MESSAGE ===');
    
    // Find and click delete button for the first message
    const firstDeleteButton = page.locator('[data-testid="delete-message-button"]').first();
    await firstDeleteButton.click();
    
    // Wait for confirmation modal
    await page.waitForSelector('text=Are you sure you want to delete this message?');
    
    // Confirm deletion
    await page.click('text=Delete');
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify the message count decreased
    const afterDeleteRowCount = await page.locator('table tbody tr').count();
    console.log('After deleting message:', afterDeleteRowCount);
    expect(afterDeleteRowCount).toBe(afterAddRowCount - 1);
    
    // Verify the deleted message is no longer visible
    const deletedMessageExists = await page.locator('text=Updated Message Title').isVisible();
    expect(deletedMessageExists).toBe(false);
    
    console.log('=== ALL CRUD TESTS PASSED ===');
  });
});
