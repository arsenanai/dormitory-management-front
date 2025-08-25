import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export class AuthHelper {
  static async loginAsAdmin(page: Page) {
    // Navigate to login page (root route)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Fill in login credentials
    await page.fill('#login-email', process.env.ADMIN_EMAIL || 'admin@email.com');
    await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'supersecret');
    
    // Click login button
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    
    // Wait for redirect to main page
    await page.waitForURL('**/main', { timeout: 10000 });
    
    // Verify we're logged in by checking for dashboard elements
    const isLoggedIn = await page.locator('text=Dashboard, text=Statistics, text=Logout, [data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      throw new Error('Login failed - could not verify successful authentication');
    }
    
    console.log('✅ Successfully logged in as admin');
  }
  
  static async logout(page: Page) {
    // Look for logout button/link
    const logoutButton = page.locator('text=Logout, a[href*="logout"], button:has-text("Logout")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Successfully logged out');
    }
  }
}
