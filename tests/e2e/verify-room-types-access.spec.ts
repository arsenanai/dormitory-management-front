import { test, expect } from './test';

test.describe('Room Types Access Control Verification', () => {
  test('admin user should NOT see room types in sidebar', async ({ page }) => {
    // Clear any existing authentication state
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Login as admin user
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Wait for sidebar to load
    await page.waitForTimeout(2000);
    
    // Check if Room Types link is visible for admin user
    const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types")');
    
    // Admin should NOT see room types link
    if (await roomTypesLink.count() > 0) {
      await expect(roomTypesLink).not.toBeVisible();
    }
    
    // Take screenshot
    await page.screenshot({ path: 'admin-sidebar-no-room-types.png' });
  });

  test('sudo user should see room types in sidebar', async ({ page }) => {
    // Clear any existing authentication state
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Login as sudo user
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Wait for sidebar to load
    await page.waitForTimeout(2000);
    
    // Check if Room Types link is visible for sudo user
    const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types")');
    
    // Sudo should see room types link
    await expect(roomTypesLink).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'sudo-sidebar-with-room-types.png' });
  });

  test('admin user should be blocked from accessing room types page', async ({ page }) => {
    // Clear any existing authentication state
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Login as admin user
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Try to access room types page directly
    await page.goto('http://localhost:3000/room-types');
    await page.waitForLoadState('networkidle');
    
    // Should be redirected away (either to login or main page)
    const currentUrl = page.url();
    console.log('Admin user final URL after trying to access room types:', currentUrl);
    
    // Should NOT be on room types page
    expect(currentUrl).not.toContain('/room-types');
    
    // Take screenshot
    await page.screenshot({ path: 'admin-blocked-from-room-types.png' });
  });

  test('sudo user should be able to access room types page', async ({ page }) => {
    // Clear any existing authentication state
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Login as sudo user
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Try to access room types page via sidebar navigation
    const roomTypesLink = page.locator('a[href*="room-types"], a:has-text("Room Types")');
    await expect(roomTypesLink).toBeVisible();
    await roomTypesLink.click();
    await page.waitForLoadState('networkidle');
    
    // Should be on room types page
    await expect(page).toHaveURL(/\/room-types/);
    
    // Should see room types content
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Room Types');
    
    // Take screenshot
    await page.screenshot({ path: 'sudo-accessing-room-types.png' });
  });
});
