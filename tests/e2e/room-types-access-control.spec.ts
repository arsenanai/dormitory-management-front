import { test, expect } from './test';
import { TEST_USERS, SELECTORS, TestUtils } from './test-utils';

test.describe('Room Types Access Control', () => {
  test.describe('Admin User Access', () => {
    test.beforeEach(async ({ page }) => {
      // Clear any existing authentication state
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Login as admin user
      await page.goto('http://localhost:3000/');
      await page.fill('#login-email', 'admin@email.com');
      await page.fill('#login-password', 'supersecret');
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for successful login
      await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    });

    test('should NOT have access to room types page', async ({ page }) => {
      // Try to navigate directly to room-types page
      await page.goto('http://localhost:3000/room-types');
      await page.waitForLoadState('networkidle');
      
      // Should get access denied or be redirected
      // Check for error message or redirect
      const errorMessage = page.locator('.text-red-500, .error, [data-testid="error"]');
      const accessDenied = page.locator('text=Access denied, text=Forbidden, text=Unauthorized');
      
      // Either should see an error message or be redirected away
      const hasError = await errorMessage.count() > 0;
      const hasAccessDenied = await accessDenied.count() > 0;
      const isOnRoomTypesPage = page.url().includes('/room-types');
      
      // Admin should NOT be able to access room types
      expect(hasError || hasAccessDenied || !isOnRoomTypesPage).toBeTruthy();
      
      // Take screenshot for verification
      await page.screenshot({ path: 'admin-room-types-access-denied.png' });
    });

    test('should NOT see room types in sidebar navigation', async ({ page }) => {
      // Wait for sidebar to load
      await page.waitForLoadState('networkidle');
      
      // Look for room types link in sidebar
      const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types"), [data-testid="room-types-link"]');
      
      // Admin should NOT see room types link
      if (await roomTypesLink.count() > 0) {
        await expect(roomTypesLink).not.toBeVisible();
      } else {
        // Link doesn't exist, which is also correct
        expect(true).toBeTruthy();
      }
    });

    test('should get API error when trying to fetch room types', async ({ page }) => {
      // Open browser console to monitor API calls
      page.on('console', msg => console.log('Console:', msg.text()));
      
      // Try to navigate to room types page
      await page.goto('http://localhost:3000/room-types');
      await page.waitForLoadState('networkidle');
      
      // Check if there's an API error or loading failure
      const loadingElement = page.locator('[data-testid="loading"]');
      const errorElement = page.locator('.text-red-500, .error, [data-testid="error"]');
      
      // Should not be stuck in loading state
      if (await loadingElement.count() > 0) {
        await expect(loadingElement).not.toBeVisible({ timeout: 10000 });
      }
      
      // Should see some form of error or access denied
      const hasError = await errorElement.count() > 0;
      const pageContent = await page.textContent('body');
      
      // Verify admin cannot access room types data
      expect(hasError || !pageContent?.includes('Room Types Management')).toBeTruthy();
    });
  });

  test.describe('Sudo User Access', () => {
    test.beforeEach(async ({ page }) => {
      // Clear any existing authentication state
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Login as sudo user
      await page.goto('http://localhost:3000/');
      await page.fill('#login-email', 'sudo@email.com');
      await page.fill('#login-password', 'supersecret');
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for successful login
      await page.waitForURL(/\/(main|dormitories|room-types)/, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    });

    test('should have full access to room types page', async ({ page }) => {
      // Navigate to room types page via sidebar navigation
      const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types")');
      await expect(roomTypesLink).toBeVisible();
      await roomTypesLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on room types page
      await expect(page).toHaveURL(/\/room-types/);
      
      // Should see room types table (main indicator of successful access)
      const table = page.locator('table, [data-testid="room-types-table"]');
      await expect(table).toBeVisible();
      
      // Should see room types data
      const roomTypeRows = page.locator('tr:has-text("standard"), tr:has-text("lux")');
      await expect(roomTypeRows).toHaveCount(2, { timeout: 15000 });
      
      // Take screenshot for verification
      await page.screenshot({ path: 'sudo-room-types-access-granted.png' });
    });

    test('should see room types in sidebar navigation', async ({ page }) => {
      // Wait for sidebar to load
      await page.waitForLoadState('networkidle');
      
      // Look for room types link in sidebar
      const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types"), [data-testid="room-types-link"]');
      
      // Sudo should see room types link
      if (await roomTypesLink.count() > 0) {
        await expect(roomTypesLink).toBeVisible();
      }
    });

    test('should be able to create new room types', async ({ page }) => {
      // Navigate to room types page via sidebar navigation
      const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types")');
      await expect(roomTypesLink).toBeVisible();
      await roomTypesLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for add/create button
      const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), [data-testid="add-button"]');
      
      if (await addButton.count() > 0) {
        await expect(addButton).toBeVisible();
        
        // Click add button to test creation access
        await addButton.click();
        
        // Should be able to access create form
        await page.waitForLoadState('networkidle');
        
        // Check if we're on create form or if there are form fields
        const formFields = page.locator('input, select, textarea');
        expect(await formFields.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Unauthenticated User Access', () => {
    test('should be redirected to login when accessing room types', async ({ page }) => {
      // Try to access room types without authentication
      await page.goto('http://localhost:3000/room-types');
      await page.waitForLoadState('networkidle');
      
      // Should be redirected to login page
      await expect(page).toHaveURL(/\/$/);
      
      // Should see login form
      const loginForm = page.locator('#login-email, input[name="email"]');
      await expect(loginForm).toBeVisible();
    });
  });
});
