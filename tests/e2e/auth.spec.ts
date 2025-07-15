import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start on the login page
    await page.goto('http://localhost:5173/');
  });

  test('should display login form by default', async ({ page }) => {
    // Check that we're on the login page with correct elements
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    
    // Check that registration form is hidden initially
    await expect(page.locator('#registration-email')).not.toBeVisible();
  });

  test('should show registration form when clicking register tab', async ({ page }) => {
    // Click the registration tab (it might be "Registration" not "Register")
    await page.click('button[role="tab"]:has-text("Registration")');
    
    // Check that registration form is now visible
    await expect(page.locator('#registration-email')).toBeVisible();
    await expect(page.locator('#registration-password')).toBeVisible();
    await expect(page.locator('#registration-name')).toBeVisible();
    
    // Check that login form is hidden
    await expect(page.locator('#login-email')).not.toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in login credentials
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    
    // Click login button (use submit type to be more specific)
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for redirect to main page
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    // Check that we're on the main page
    await expect(page).toHaveURL('http://localhost:5173/main');
    
    // Check for some content that indicates we're on a dashboard (numbers, cards, etc.)
    await expect(page.locator('body')).toContainText(/\d+/); // Should contain numbers (statistics)
    
    // Or check for specific dashboard elements like statistics cards
    const statisticsElements = page.locator('h3');
    await expect(statisticsElements.first()).toBeVisible();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('#login-email', 'invalid@example.com');
    await page.fill('#login-password', 'wrongpassword');
    
    // Click login button (use submit type to be more specific)
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for error message to appear (check for toast or alert)
    await expect(page.locator('.toast, [role="alert"], .alert')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access a protected route directly
    await page.goto('http://localhost:5173/users');
    
    // Should be redirected to login
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});
