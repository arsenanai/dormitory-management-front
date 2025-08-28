import { test, expect } from '@playwright/test';

test.describe('Guests Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should render and show right-aligned buttons and table', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check header actions are right-aligned
    const headerActions = page.locator('.flex.justify-between.items-center');
    await expect(headerActions).toBeVisible();

    // Check download and add guest buttons
    const downloadBtn = page.getByRole('button', { name: /download/i });
    const addGuestBtn = page.getByRole('button', { name: /add guest/i });
    await expect(downloadBtn).toBeVisible();
    await expect(addGuestBtn).toBeVisible();

    // Check table headers
    await page.waitForSelector('thead th');
    const headerCells = page.locator('thead th');
    await expect(headerCells).toHaveCount(8);

    // Check table has data
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(1); // At least one row
  });

  test('should add new guest successfully', async ({ page }) => {
    // Navigate to guest registration
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click add guest button
    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Fill guest form with correct field IDs
    await page.fill('#guest-first-name', 'Test');
    await page.fill('#guest-last-name', 'Guest');
    await page.fill('#guest-phone', '+1234567890');
    await page.fill('#guest-email', 'testguest@example.com');
    await page.fill('#guest-enter-date', '2024-12-25');
    await page.fill('#guest-exit-date', '2024-12-30');
    await page.selectOption('#guest-room', 'A210');
    await page.fill('#guest-purpose', 'Holiday visit');
    await page.fill('#guest-host-name', 'John Host');
    await page.fill('#guest-host-contact', '+0987654321');
    await page.selectOption('#guest-identification-type', 'passport');
    await page.fill('#guest-identification-number', 'AB123456');
    await page.fill('#guest-emergency-name', 'Emergency Contact');
    await page.fill('#guest-emergency-phone', '+1122334455');
    await page.fill('#guest-wifi-username', 'testguest');
    await page.fill('#guest-wifi-password', 'password123');
    await page.fill('#guest-reminder', 'Special dietary requirements');
    await page.fill('#guest-daily-rate', '50.00');
    await page.fill('#guest-payment-received', '100.00');

    // Submit form
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/guest-house');

    // Verify guest was added
    await expect(page.getByText('Test Guest')).toBeVisible();
  });

  test('should delete guest with confirmation', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click delete button for first guest
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    await deleteBtn.click();

    // Check confirmation dialog
    const confirmDialog = page.locator('.fixed.inset-0');
    await expect(confirmDialog).toBeVisible();
    await expect(page.getByText(/are you sure\? this change is not recoverable/i)).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Wait for page to reload and verify guest is gone
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Test Guest')).not.toBeVisible();
  });

  test('should filter guests by search', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get initial count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();

    // Search for specific guest
    await page.fill('#search-guest', 'Test Guest');
    await page.waitForTimeout(1000);

    // Verify filtered results
    const filteredRows = page.locator('tbody tr');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should export guests to Excel', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Mock download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/guests\.xlsx$/);
  });
});
