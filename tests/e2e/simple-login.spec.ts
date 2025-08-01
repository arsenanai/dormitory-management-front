import { test, expect } from './test';

test.describe('Simple Login Test', () => {
  test('should be able to access the login page and see form elements', async ({ page }) => {
    await page.goto('/');
    
    // Check that basic elements are visible
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    
    // Try to login with correct credentials
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    
    // Click the submit button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to main page
    await page.waitForURL('**/main', { timeout: 10000 });
    
    // Check current URL
    console.log('Current URL:', page.url());
    
    // Verify we're on the main page
    await expect(page).toHaveURL(/\/main$/);
  });
});
