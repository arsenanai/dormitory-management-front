import { test, expect } from '@playwright/test';

test.describe('Mobile Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests in this describe block
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should load login page on mobile', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify we're on login page
    await expect(page.locator('[data-testid="tab-login"]')).toBeVisible();
    
    // Check if login form elements are visible
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    
    // Verify mobile viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);
  });

  test('should login successfully on mobile', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Login as sudo user
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login and redirect
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
    
    // Verify we're logged in by checking for dashboard content
    await expect(page.locator('body')).toContainText('Dashboard');
    await expect(page.locator('body')).toContainText('System Administrator');
  });

  test('should access dormitory form on mobile', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Login as sudo user
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login and redirect
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
    
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile viewport is maintained
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);
    
    // Verify form elements are visible on mobile
    await expect(page.locator('#dormitory-name')).toBeVisible();
    await expect(page.locator('#dormitory-capacity')).toBeVisible();
    await expect(page.locator('#dormitory-gender')).toBeVisible();
    await expect(page.locator('#dormitory-admin')).toBeVisible();
  });
});
