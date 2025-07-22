import { test, expect } from './test';

test.describe('Logout Flow', () => {
  test('should logout and redirect to login page', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    // Open user menu and click logout
    await page.click('[data-testid="user-menu-button"]');
    await page.click('button.logout-button');
    // Should be redirected to login
    await expect(page).toHaveURL('http://localhost:5173/');
    // Should not see dashboard content
    await expect(page.locator('body')).not.toContainText(/dashboard|statistics|main/i);
  });
});
