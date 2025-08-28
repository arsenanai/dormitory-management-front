import { test, expect } from '@playwright/test';

test.describe('Index Pages Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should display students index page correctly', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that the page loaded (look for any content)
    await expect(page.locator('body')).toContainText('Student');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check that table has headers
    const tableHeaders = page.locator('thead th');
    await expect(tableHeaders).toHaveCount(11); // Based on actual structure

    // Check that table has data (at least one row)
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Check action buttons
    await expect(page.getByRole('button', { name: /add student/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
  });

  test('should display admins index page correctly', async ({ page }) => {
    await page.goto('/admins');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that the page loaded
    await expect(page.locator('body')).toContainText('Admin');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: /add admin/i })).toBeVisible();
  });

  test('should display guests index page correctly', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that the page loaded
    await expect(page.locator('body')).toContainText('Guest');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: /add guest/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
  });

  test('should display payments index page correctly', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that the page loaded
    await expect(page.locator('body')).toContainText('Payment');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: /add payment/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
  });

  test('should display rooms index page correctly', async ({ page }) => {
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that the page loaded
    await expect(page.locator('body')).toContainText('Room');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: /add room/i })).toBeVisible();
  });

  test('should display dormitories index page correctly', async ({ page }) => {
    await page.goto('/dormitories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that the page loaded
    await expect(page.locator('body')).toContainText('Dormitory');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: /add dormitory/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
  });

  test('should display messages index page correctly', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that the page loaded
    await expect(page.locator('body')).toContainText('Message');

    // Check action buttons
    await expect(page.getByRole('button', { name: /add message/i })).toBeVisible();
  });

  test('should handle search and filtering on index pages', async ({ page }) => {
    // Test search functionality on students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if search field exists
    const searchField = page.locator('#search-input');
    if (await searchField.count() > 0) {
      await searchField.fill('test');
      await page.waitForTimeout(1000);
      
      // Verify search results
      const filteredRows = page.locator('tbody tr');
      await expect(filteredRows).toBeVisible();
    }

    // Test filtering on payments page
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if status filter exists
    const statusFilter = page.locator('#status-filter');
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const filteredRows = page.locator('tbody tr');
      await expect(filteredRows).toBeVisible();
    }
  });
});
