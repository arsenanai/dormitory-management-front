import { test, expect } from '@playwright/test';

test.describe('Admin Message Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should send message to dormitory', async ({ page }) => {
    // Navigate to messages page
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click add message button
    await page.click('button:has-text("Add Message")');
    await page.waitForURL(/message-form/);

    // Fill message form
    await page.fill('#message-title', 'Important Announcement');
    await page.fill('#message-content', 'This is a test message for all students');
    await page.selectOption('#message-dormitory', '1'); // Select first dormitory
    await page.selectOption('#message-type', 'announcement');

    // Submit message
    await page.click('button:has-text("Send")');
    await page.waitForURL('/messages');

    // Verify message was sent
    await expect(page.getByText('Important Announcement')).toBeVisible();
  });

  test('should filter messages by type', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get initial count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();

    // Filter by announcement type
    await page.selectOption('#type-filter', 'announcement');
    await page.waitForTimeout(1000);

    // Verify filtered results
    const filteredRows = page.locator('tbody tr');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should delete message with confirmation', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click delete button for first message
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    await deleteBtn.click();

    // Check confirmation dialog
    const confirmDialog = page.locator('.fixed.inset-0');
    await expect(confirmDialog).toBeVisible();
    await expect(page.getByText(/are you sure\? this change is not recoverable/i)).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Wait for page to reload
    await page.waitForLoadState('networkidle');
  });
});
