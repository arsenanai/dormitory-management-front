import { test, expect } from '@playwright/test';

test.describe('Basic Login Test', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if login form elements are present
    const emailField = page.locator('#login-email');
    const passwordField = page.locator('#login-password');
    const submitButton = page.locator('[data-testid="login-button"]');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    console.log('Login page loaded successfully');
  });

  test('should login as admin', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation to main page
    await page.waitForURL('/main', { timeout: 10000 });
    
    console.log('Admin login successful');
  });
});
