import { test, expect } from '@playwright/test';

test.describe('Guest Registration and Access Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should register new guest and verify payment', async ({ page }) => {
    // Navigate to guest registration
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click add guest button
    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Fill guest registration form
    const guestName = 'John Doe';
    await page.fill('#guest-name', guestName);
    await page.fill('#guest-phone', '+1234567890');
    await page.fill('#guest-email', 'johndoe@example.com');
    await page.fill('#guest-check-in', '2024-12-25');
    await page.fill('#guest-check-out', '2024-12-30');
    await page.fill('#guest-purpose', 'Business trip');
    await page.selectOption('#guest-room', '1'); // Select first available room

    // Submit registration
    await page.click('button:has-text("Save")');
    await page.waitForURL('/guest-house');

    // Verify guest was registered
    await expect(page.getByText(guestName)).toBeVisible();

    // Navigate to payments to verify payment record
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find the guest payment
    const guestPayment = page.locator('tbody tr').filter({ hasText: guestName });
    await expect(guestPayment).toBeVisible();
  });

  test('should approve guest payment and activate access', async ({ page }) => {
    // Navigate to payments
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find a guest payment (filter by guest type if available)
    const guestPayment = page.locator('tbody tr').filter({ hasText: 'Guest' }).first();
    if (await guestPayment.count() === 0) {
      test.skip('No guest payments found');
    }

    // Get guest name
    const guestName = await guestPayment.locator('td').nth(1).textContent();

    // Approve payment
    const approveBtn = guestPayment.locator('button:has-text("Approve")');
    await approveBtn.click();

    // Verify status changed
    await page.waitForTimeout(2000);
    await expect(guestPayment.locator('td').filter({ hasText: 'Approved' })).toBeVisible();

    // Navigate to guests to verify access activated
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find guest and verify status
    const guestRow = page.locator('tbody tr').filter({ hasText: guestName });
    await expect(guestRow.locator('td').filter({ hasText: 'Active' })).toBeVisible();
  });

  test('should reject invalid guest payment', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find a guest payment
    const guestPayment = page.locator('tbody tr').filter({ hasText: 'Guest' }).first();
    if (await guestPayment.count() === 0) {
      test.skip('No guest payments found');
    }

    // Reject payment
    const rejectBtn = guestPayment.locator('button:has-text("Reject")');
    await rejectBtn.click();

    // Verify status changed to rejected
    await page.waitForTimeout(2000);
    await expect(guestPayment.locator('td').filter({ hasText: 'Rejected' })).toBeVisible();
  });
});
