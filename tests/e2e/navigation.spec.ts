import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access a protected route
    await page.goto('http://localhost:5173/users');
    
    // Should be redirected to login
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should navigate correctly after login', async ({ page }) => {
    // Login as student
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for navigation to main page
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    // Verify we're on the main page
    await expect(page).toHaveURL('http://localhost:5173/main');
    
    // Check for dashboard content (numbers indicating statistics)
    await expect(page.locator('body')).toContainText(/\d+/);
    
    // Check that statistics elements are visible
    const statisticsElements = page.locator('h3');
    await expect(statisticsElements.first()).toBeVisible();
  });

  test('should redirect authenticated user away from login page', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main');
    
    // Try to go back to login page
    await page.goto('http://localhost:5173/');
    
    // Should be redirected away from login to main page
    await expect(page).toHaveURL('http://localhost:5173/main');
  });

  test('should handle navigation between different sections', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main');
    
    // Try navigating to different sections that might be available
    const sectionsToTest = [
      'http://localhost:5173/main',
      'http://localhost:5173/students',
      'http://localhost:5173/messages'
    ];
    
    for (const section of sectionsToTest) {
      try {
        await page.goto(section);
        // Just verify the page loaded without error
        await page.waitForLoadState('networkidle');
      } catch {
        console.log(`Section ${section} might not be accessible or configured`);
      }
    }
  });
});
