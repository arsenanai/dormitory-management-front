import { test, expect } from '@playwright/test';

test.describe('Admin Payment Approval Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should approve student payment and activate access', async ({ page }) => {
    // Navigate to payments page
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find a pending payment
    const pendingRow = page.locator('tbody tr').filter({ hasText: 'Pending' }).first();
    if (await pendingRow.count() === 0) {
      test.skip('No pending payments found');
    }

    // Get student name from the row
    const studentName = await pendingRow.locator('td').nth(1).textContent();
    
    // Click approve button
    const approveBtn = pendingRow.locator('button:has-text("Approve")');
    await approveBtn.click();

    // Verify status changed to approved
    await page.waitForTimeout(2000);
    await expect(pendingRow.locator('td').filter({ hasText: 'Approved' })).toBeVisible();

    // Navigate to students page to verify status
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find the student and verify status is active
    const studentRow = page.locator('tbody tr').filter({ hasText: studentName });
    await expect(studentRow.locator('td').filter({ hasText: 'Active' })).toBeVisible();
  });

  test('should reject invalid payment', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find a pending payment
    const pendingRow = page.locator('tbody tr').filter({ hasText: 'Pending' }).first();
    if (await pendingRow.count() === 0) {
      test.skip('No pending payments found');
    }

    // Click reject button
    const rejectBtn = pendingRow.locator('button:has-text("Reject")');
    await rejectBtn.click();

    // Verify status changed to rejected
    await page.waitForTimeout(2000);
    await expect(pendingRow.locator('td').filter({ hasText: 'Rejected' })).toBeVisible();
  });

  test('should filter payments by status', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get initial count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();

    // Filter by pending status
    await page.selectOption('#status-filter', 'pending');
    await page.waitForTimeout(1000);

    // Verify filtered results
    const filteredRows = page.locator('tbody tr');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // All visible rows should have pending status
    for (let i = 0; i < filteredCount; i++) {
      const statusCell = filteredRows.nth(i).locator('td').filter({ hasText: /pending/i });
      await expect(statusCell).toBeVisible();
    }
  });
});
