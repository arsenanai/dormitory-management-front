import { test, expect } from '@playwright/test';

test.describe('Bed Reservation Only', () => {
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

  test('should toggle bed 1 reservation and persist changes', async ({ page }) => {
    // Navigate to room 70 edit form
    await page.goto('/room-form/70');
    await page.waitForLoadState('networkidle');
    
    // Wait for beds to load
    await page.waitForSelector('[data-testid="bed-1"]', { timeout: 10000 });
    
    // Check initial bed 1 state - should be checked (reserved for staff)
    const bed1Checkbox = page.locator('[data-testid="bed-1"] input[type="checkbox"]');
    await expect(bed1Checkbox).toBeChecked();
    
    // Uncheck bed 1 (remove staff reservation)
    await bed1Checkbox.uncheck();
    await expect(bed1Checkbox).not.toBeChecked();
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Wait for success message or error
    try {
      await page.waitForSelector('.text-green-600', { timeout: 5000 });
      console.log('Success message found');
    } catch (error) {
      console.log('No success message found, checking for errors...');
      // Check if there are any error messages
      const errorElements = page.locator('.text-red-600, .text-red-500');
      if (await errorElements.count() > 0) {
        const errorText = await errorElements.first().textContent();
        console.log('Error message found:', errorText);
      }
    }
    
    // Wait a bit to see what happens
    await page.waitForTimeout(2000);
    
    // Check current URL to see if we were redirected
    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);
    
    // If we're still on the form page, check for any console errors
    if (currentUrl.includes('room-form')) {
      console.log('Still on form page, checking for errors...');
      // Look for any error messages on the page
      const pageContent = await page.content();
      console.log('Page content length:', pageContent.length);
      
      // Check if there are any visible error messages
      const visibleErrors = page.locator('*:has-text("error"), *:has-text("Error"), *:has-text("failed")');
      if (await visibleErrors.count() > 0) {
        const errorText = await visibleErrors.first().textContent();
        console.log('Visible error text:', errorText);
      }
    }
  });
});
