import { test, expect } from '@playwright/test';

test.describe('Bed Reservation Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('**/main');
    await page.waitForLoadState('networkidle');
  });

  test('should persist bed reservation changes after form submission and refresh', async ({ page }) => {
    // Navigate to room 70 edit form
    await page.goto('/room-form/70');
    await page.waitForLoadState('networkidle');
    
    // Wait for beds to load
    await page.waitForSelector('[data-testid="bed-1"]', { timeout: 10000 });
    
    // Check initial state - bed 1 should be checked (reserved for staff)
    const bed1Checkbox = page.locator('[data-testid="bed-1"] input[type="checkbox"]');
    await expect(bed1Checkbox).toBeChecked();
    
    // Uncheck bed 1 (remove staff reservation)
    await bed1Checkbox.uncheck();
    await expect(bed1Checkbox).not.toBeChecked();
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Wait for success message and redirect
    await page.waitForSelector('.text-green-600', { timeout: 10000 });
    await page.waitForURL('**/rooms');
    
    // Navigate back to room 70 edit form
    await page.goto('/room-form/70');
    await page.waitForLoadState('networkidle');
    
    // Wait for beds to load again
    await page.waitForSelector('[data-testid="bed-1"]', { timeout: 10000 });
    
    // Verify bed 1 is still unchecked (reservation change persisted)
    const bed1CheckboxAfterRefresh = page.locator('[data-testid="bed-1"] input[type="checkbox"]');
    await expect(bed1CheckboxAfterRefresh).not.toBeChecked();
    
    // Now check bed 1 again (add staff reservation)
    await bed1CheckboxAfterRefresh.check();
    await expect(bed1CheckboxAfterRefresh).toBeChecked();
    
    // Submit the form again
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Wait for success message and redirect
    await page.waitForSelector('.text-green-600', { timeout: 10000 });
    await page.waitForURL('**/rooms');
    
    // Navigate back to room 70 edit form one more time
    await page.goto('/room-form/70');
    await page.waitForLoadState('networkidle');
    
    // Wait for beds to load
    await page.waitForSelector('[data-testid="bed-1"]', { timeout: 10000 });
    
    // Verify bed 1 is still checked (reservation change persisted)
    const bed1CheckboxFinal = page.locator('[data-testid="bed-1"] input[type="checkbox"]');
    await expect(bed1CheckboxFinal).toBeChecked();
  });
});
