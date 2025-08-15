import { test, expect } from './test';
import { TEST_USERS, SELECTORS, TestUtils } from './test-utils';

test.describe('Room Type Form', () => {
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
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories|room-types)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('should create new standard room type', async ({ page }) => {
    // Navigate to room types page
    await page.goto('http://localhost:3000/room-types');
    await page.waitForLoadState('networkidle');
    
    // Click Add Room Type button
    await page.click('button:has-text("Add Room Type")');
    await page.waitForURL(/\/room-type-basic/);
    await page.waitForLoadState('networkidle');
    
    // Verify form is displayed
    await expect(page.locator('h1:has-text("Add Room Type"), .navigation:has-text("Add Room Type")')).toBeVisible();
    
    // Select standard room type
    await page.selectOption('select[name="room-type-name"]', 'standard');
    
    // Verify capacity and price are auto-set
    await expect(page.locator('input[name="room-type-capacity"]')).toHaveValue('2');
    await expect(page.locator('input[name="room-type-price"]')).toHaveValue('150');
    
    // Add description
    await page.fill('textarea[name="room-type-description"]', 'Standard room with basic amenities');
    
    // Submit form
    await page.click('button:has-text("Create")');
    
    // Should redirect back to room types list
    await page.waitForURL(/\/room-types/);
    await page.waitForLoadState('networkidle');
    
    // Verify new room type is displayed
    await expect(page.locator('tr:has-text("standard")')).toBeVisible();
  });

  test('should create new lux room type', async ({ page }) => {
    // Navigate to room types page
    await page.goto('http://localhost:3000/room-types');
    await page.waitForLoadState('networkidle');
    
    // Click Add Room Type button
    await page.click('button:has-text("Add Room Type")');
    await page.waitForURL(/\/room-type-basic/);
    await page.waitForLoadState('networkidle');
    
    // Select lux room type
    await page.selectOption('select[name="room-type-name"]', 'lux');
    
    // Verify capacity and price are auto-set
    await expect(page.locator('input[name="room-type-capacity"]')).toHaveValue('1');
    await expect(page.locator('input[name="room-type-price"]')).toHaveValue('300');
    
    // Add description
    await page.fill('textarea[name="room-type-description"]', 'Luxury room with premium amenities');
    
    // Submit form
    await page.click('button:has-text("Create")');
    
    // Should redirect back to room types list
    await page.waitForURL(/\/room-types/);
    await page.waitForLoadState('networkidle');
    
    // Verify new room type is displayed
    await expect(page.locator('tr:has-text("lux")')).toBeVisible();
  });

  test('should edit existing room type', async ({ page }) => {
    // Navigate to room types page
    await page.goto('http://localhost:3000/room-types');
    await page.waitForLoadState('networkidle');
    
    // Click Edit button for standard room type
    await page.click('tr:has-text("standard") button:has-text("Edit")');
    await page.waitForURL(/\/room-type-basic\/\d+/);
    await page.waitForLoadState('networkidle');
    
    // Verify form is in edit mode
    await expect(page.locator('h1:has-text("Edit Room Type"), .navigation:has-text("Edit Room Type")')).toBeVisible();
    
    // Verify form is pre-filled with existing data
    await expect(page.locator('select[name="room-type-name"]')).toHaveValue('standard');
    await expect(page.locator('input[name="room-type-capacity"]')).toHaveValue('2');
    await expect(page.locator('input[name="room-type-price"]')).toHaveValue('150');
    
    // Update the price
    await page.fill('input[name="room-type-price"]', '175');
    
    // Submit form
    await page.click('button:has-text("Update")');
    
    // Should redirect back to room types list
    await page.waitForURL(/\/room-types/);
    await page.waitForLoadState('networkidle');
    
    // Verify updated room type is displayed
    await expect(page.locator('tr:has-text("standard")')).toContainText('$175.00');
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to room types page
    await page.goto('http://localhost:3000/room-types');
    await page.waitForLoadState('networkidle');
    
    // Click Add Room Type button
    await page.click('button:has-text("Add Room Type")');
    await page.waitForURL(/\/room-type-basic/);
    await page.waitForLoadState('networkidle');
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Create")');
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Capacity must be at least 1')).toBeVisible();
    await expect(page.locator('text=Price must be non-negative')).toBeVisible();
  });

  test('should cancel form and return to list', async ({ page }) => {
    // Navigate to room types page
    await page.goto('http://localhost:3000/room-types');
    await page.waitForLoadState('networkidle');
    
    // Click Add Room Type button
    await page.click('button:has-text("Add Room Type")');
    await page.waitForURL(/\/room-type-basic/);
    await page.waitForLoadState('networkidle');
    
    // Click Cancel button
    await page.click('button:has-text("Cancel")');
    
    // Should redirect back to room types list
    await page.waitForURL(/\/room-types/);
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on the list page
    await expect(page.locator('button:has-text("Add Room Type")')).toBeVisible();
  });

  test('should handle form constraints correctly', async ({ page }) => {
    // Navigate to room types page
    await page.goto('http://localhost:3000/room-types');
    await page.waitForLoadState('networkidle');
    
    // Click Add Room Type button
    await page.click('button:has-text("Add Room Type")');
    await page.waitForURL(/\/room-type-basic/);
    await page.waitForLoadState('networkidle');
    
    // Check capacity input constraints
    const capacityInput = page.locator('input[name="room-type-capacity"]');
    await expect(capacityInput).toHaveAttribute('min', '1');
    await expect(capacityInput).toHaveAttribute('max', '4');
    
    // Check price input constraints
    const priceInput = page.locator('input[name="room-type-price"]');
    await expect(priceInput).toHaveAttribute('min', '0');
    await expect(priceInput).toHaveAttribute('step', '0.01');
  });
});
