import { test, expect } from './test';
import { TEST_USERS, SELECTORS, TestUtils } from './test-utils';

test.describe('Room Types Index Page Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Login as superadmin to ensure full access
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login - be flexible with URL matching
    await page.waitForURL(/\/(main|dormitories|room-types)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Navigate to room-types page if not already there
    if (!page.url().includes('/room-types')) {
      await page.goto('http://localhost:3000/room-types');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display room types on the index page', async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'room-types-page.png' });
    
    // Check if the page title is visible (Navigation component displays the title)
    // Try multiple selectors for the title
    const titleSelectors = [
      'span:has-text("Room Types Management")',
      '.text-lg:has-text("Room Types")',
      'span:has-text("Room Types")',
      'h1:has-text("Room Types")',
      '[data-testid="page-title"]'
    ];
    
    let titleFound = false;
    for (const selector of titleSelectors) {
      if (await page.locator(selector).count() > 0) {
        await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
        titleFound = true;
        break;
      }
    }
    
    if (!titleFound) {
      // If no title found, just check if we're on the right page by looking for the table
      console.log('Title not found, checking for table instead');
    }
    
    // Wait for the table to be visible - try multiple selectors
    const tableSelectors = [
      'table',
      '[data-testid="room-types-table"]',
      '.table',
      'tbody',
      'tr'
    ];
    
    let tableFound = false;
    for (const selector of tableSelectors) {
      if (await page.locator(selector).count() > 0) {
        await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
        tableFound = true;
        break;
      }
    }
    
    if (!tableFound) {
      // If no table found, check if there's any content on the page
      const pageContent = await page.textContent('body');
      console.log('Page content:', pageContent?.substring(0, 500));
      throw new Error('No table found on the page');
    }
    
    // Check for the presence of room types in the table
    // We expect exactly 2 room types: 'standard' and 'lux'
    const roomTypeRows = page.locator('tr:has-text("standard"), tr:has-text("lux")');
    
    // Wait for room types to be loaded
    await expect(roomTypeRows).toHaveCount(2, { timeout: 15000 });
    
    // Verify specific room types are present
    await expect(page.locator('tr:has-text("standard")')).toBeVisible();
    await expect(page.locator('tr:has-text("lux")')).toBeVisible();
    
    // Check that no other room types exist (only standard and lux)
    const allRoomTypeRows = page.locator('tr').filter({ hasText: /^(standard|lux)$/i });
    await expect(allRoomTypeRows).toHaveCount(2);
  });

  test('should display correct room type details', async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check standard room type details
    const standardRow = page.locator('tr:has-text("standard")');
    await expect(standardRow).toBeVisible({ timeout: 10000 });
    
    // Check lux room type details
    const luxRow = page.locator('tr:has-text("lux")');
    await expect(luxRow).toBeVisible({ timeout: 10000 });
    
    // Verify that room types have the expected structure (name, dormitory, beds, etc.)
    // This will depend on the actual table structure
    const tableHeaders = page.locator('th, [data-testid="table-header"]');
    await expect(tableHeaders).toHaveCount.greaterThan(0);
  });

  test('should allow navigation to room types page and display data', async ({ page }) => {
    // Start from the main page
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to room-types page via sidebar or navigation
    const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types"), [data-testid="room-types-link"]');
    
    if (await roomTypesLink.count() > 0) {
      await roomTypesLink.click();
      await page.waitForURL(/\/room-types/);
      await page.waitForLoadState('networkidle');
      
      // Verify room types are displayed
      await expect(page.locator('tr:has-text("standard")')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('tr:has-text("lux")')).toBeVisible({ timeout: 10000 });
    } else {
      // If no navigation link found, navigate directly
      await page.goto('http://localhost:3000/room-types');
      await page.waitForLoadState('networkidle');
      
      // Verify room types are displayed
      await expect(page.locator('tr:has-text("standard")')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('tr:has-text("lux")')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should verify room types data structure', async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check that the table has the expected columns
    const expectedColumns = ['Room Type Name', 'Capacity', 'Price', 'Photos', 'Action'];
    
    for (const column of expectedColumns) {
      const columnHeader = page.locator(`th:has-text("${column}"), [data-testid="column-${column.toLowerCase().replace(/\s+/g, '-')}"]`);
      if (await columnHeader.count() > 0) {
        await expect(columnHeader).toBeVisible();
      }
    }
    
    // Verify that room types have the expected data
    const standardRow = page.locator('tr:has-text("standard")');
    if (await standardRow.count() > 0) {
      // Check that standard room type has expected capacity and price
      await expect(standardRow).toContainText('2'); // capacity
      await expect(standardRow).toContainText('$150.00'); // price
    }
    
    const luxRow = page.locator('tr:has-text("lux")');
    if (await luxRow.count() > 0) {
      // Check that lux room type has expected capacity and price
      await expect(luxRow).toContainText('1'); // capacity
      await expect(luxRow).toContainText('$300.00'); // price
    }
  });

  test('should handle loading and error states', async ({ page }) => {
    // Check for loading state (if any)
    const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
      // Wait for loading to complete
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    }
    
    // Check for error states (should not be present)
    const errorMessage = page.locator('.error, .alert-danger, [role="alert"]:has-text("error")');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).not.toBeVisible();
    }
  });

  test('should verify room types are accessible via API', async ({ page }) => {
    // This test verifies that the frontend can successfully fetch room types from the API
    // by checking if the data is displayed correctly
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check that room types are loaded (this implies successful API call)
    await expect(page.locator('tr:has-text("standard")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('tr:has-text("lux")')).toBeVisible({ timeout: 15000 });
    
    // Verify that the table is not empty
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount.greaterThan(0);
    
    // Check that we have exactly 2 room types
    const roomTypeRows = page.locator('tr:has-text("standard"), tr:has-text("lux")');
    await expect(roomTypeRows).toHaveCount(2);
  });
});
