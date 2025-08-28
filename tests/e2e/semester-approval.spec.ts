import { test, expect } from '@playwright/test';

test.describe('Semester Approval Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should show students as pending until semester payment', async ({ page }) => {
    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that students have pending status for new semester
    const pendingStudents = page.locator('tbody tr').filter({ hasText: 'Pending' });
    const pendingCount = await pendingStudents.count();
    expect(pendingCount).toBeGreaterThan(0);

    // Verify pending students cannot access dormitory (status shows as pending)
    for (let i = 0; i < Math.min(pendingCount, 3); i++) {
      const statusCell = pendingStudents.nth(i).locator('td').filter({ hasText: 'Pending' });
      await expect(statusCell).toBeVisible();
    }
  });

  test('should approve semester payment and activate student', async ({ page }) => {
    // Navigate to payments page
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find a semester payment (filter by semester type if available)
    const semesterPayment = page.locator('tbody tr').filter({ hasText: 'Semester' }).first();
    if (await semesterPayment.count() === 0) {
      test.skip('No semester payments found');
    }

    // Get student name from payment
    const studentName = await semesterPayment.locator('td').nth(1).textContent();

    // Approve semester payment
    const approveBtn = semesterPayment.locator('button:has-text("Approve")');
    await approveBtn.click();

    // Verify payment status changed to approved
    await page.waitForTimeout(2000);
    await expect(semesterPayment.locator('td').filter({ hasText: 'Approved' })).toBeVisible();

    // Navigate to students to verify status changed to active
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find student and verify status is now active
    const studentRow = page.locator('tbody tr').filter({ hasText: studentName });
    await expect(studentRow.locator('td').filter({ hasText: 'Active' })).toBeVisible();
  });

  test('should reject invalid semester payment', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find a semester payment
    const semesterPayment = page.locator('tbody tr').filter({ hasText: 'Semester' }).first();
    if (await semesterPayment.count() === 0) {
      test.skip('No semester payments found');
    }

    // Reject payment
    const rejectBtn = semesterPayment.locator('button:has-text("Reject")');
    await rejectBtn.click();

    // Verify status changed to rejected
    await page.waitForTimeout(2000);
    await expect(semesterPayment.locator('td').filter({ hasText: 'Rejected' })).toBeVisible();
  });

  test('should filter students by semester status', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get initial count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();

    // Filter by pending status
    await page.selectOption('#status-filter', 'pending');
    await page.waitForTimeout(1000);

    // Verify filtered results show only pending students
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
