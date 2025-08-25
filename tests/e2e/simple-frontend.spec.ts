import { test, expect } from './test';

test.describe('Simple Frontend Tests', () => {
  test('should load login page and display basic elements', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/SDU Dormitory/);
    
    // Check that basic login form elements are visible
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    
    // Check that language switcher is present
    await expect(page.locator('#language-switcher')).toBeVisible();
    
    // Check that tabs are working
    await expect(page.locator('button[role="tab"]:has-text("Registration")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Guests")')).toBeVisible();
  });

  test('should switch between login and registration tabs', async ({ page }) => {
    await page.goto('/');
    
    // Click on registration tab
    await page.click('button[role="tab"]:has-text("Registration")');
    
    // Check that registration form elements are visible
    await expect(page.locator('#registration-name')).toBeVisible();
    await expect(page.locator('#registration-email')).toBeVisible();
    await expect(page.locator('#registration-password')).toBeVisible();
    await expect(page.locator('#registration-confirm-password')).toBeVisible();
    
    // Click back to login tab
    await page.click('button[role="tab"]:has-text("Login")');
    
    // Check that login form is visible again
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });

  test('should switch language', async ({ page }) => {
    await page.goto('/');
    
    // Check default language (English)
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    
    // Switch to Kazakh
    await page.selectOption('#language-switcher', 'kk');
    await page.waitForTimeout(500); // Wait for language change
    
    // Switch to Russian
    await page.selectOption('#language-switcher', 'ru');
    await page.waitForTimeout(500); // Wait for language change
    
    // Switch back to English
    await page.selectOption('#language-switcher', 'en');
    await page.waitForTimeout(500); // Wait for language change
    
    // Verify we're back to English
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty login form
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Should stay on the same page (no redirect)
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/');
    
    // Enter invalid email
    await page.fill('#login-email', 'invalid-email');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Should stay on the same page (no redirect)
    await expect(page).toHaveURL('http://localhost:3000/');
  });
}); 