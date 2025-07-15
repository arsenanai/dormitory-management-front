import { test, expect } from '@playwright/test';

test.describe('Simple Login Test', () => {
  test('should be able to access the login page and see form elements', async ({ page }) => {
    await page.goto('/');
    
    // Check that basic elements are visible
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    
    // Try to login with correct credentials
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    
    // Click the submit button
    await page.click('button[type="submit"]');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(2000);
    
    // Check current URL
    console.log('Current URL:', page.url());
  });
});
