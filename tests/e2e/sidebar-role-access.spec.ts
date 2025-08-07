import { test, expect } from '@playwright/test';

test.describe('Sidebar Role-Based Access Control', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
  });

  test('Sudo user should see Admins menu in sidebar', async ({ page }) => {
    // Login as sudo user
    await page.fill('#login-email', process.env.SUPERADMIN_EMAIL || 'sudo@email.com');
    await page.fill('#login-password', process.env.SUPERADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Check that Admins menu is visible in sidebar
    await expect(page.locator('nav a[href="/admins"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admins"]')).toContainText('Admins');

    // Check that Students menu is NOT visible for sudo users
    await expect(page.locator('nav a[href="/students"]')).not.toBeVisible();

    // Check that Dormitories menu is visible for sudo users
    await expect(page.locator('nav a[href="/dormitories"]')).toBeVisible();
    await expect(page.locator('nav a[href="/dormitories"]')).toContainText('Dormitories');
  });

  test('Admin user should see Students menu but not Admins menu in sidebar', async ({ page }) => {
    // Login as admin user (assuming there's an admin user in the system)
    await page.fill('#login-email', process.env.ADMIN_EMAIL || 'admin@email.com');
    await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Check that Students menu is visible in sidebar
    await expect(page.locator('nav a[href="/students"]')).toBeVisible();
    await expect(page.locator('nav a[href="/students"]')).toContainText('Students');

    // Check that Admins menu is NOT visible for admin users
    await expect(page.locator('nav a[href="/admins"]')).not.toBeVisible();

    // Check that Dormitories menu is NOT visible for admin users
    await expect(page.locator('nav a[href="/dormitories"]')).not.toBeVisible();

    // Check that other admin-accessible menus are visible
    await expect(page.locator('nav a[href="/rooms"]')).toBeVisible();
    await expect(page.locator('nav a[href="/payments"]')).toBeVisible();
    await expect(page.locator('nav a[href="/guest-house"]')).toBeVisible();
  });

  test('Sudo user should not see Guest House menu in sidebar', async ({ page }) => {
    // Login as sudo user
    await page.fill('#login-email', process.env.SUPERADMIN_EMAIL || 'sudo@email.com');
    await page.fill('#login-password', process.env.SUPERADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Check that Guest House menu is NOT visible for sudo users
    await expect(page.locator('nav a[href="/guest-house"]')).not.toBeVisible();
  });

  test('Student user should not see Admins or Students menus in sidebar', async ({ page }) => {
    // Login as student user
    await page.fill('#login-email', process.env.STUDENT_EMAIL || 'student@email.com');
    await page.fill('#login-password', process.env.STUDENT_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to student main page
    await page.waitForURL('/student-main');

    // Check that Admins menu is NOT visible for student users
    await expect(page.locator('nav a[href="/admins"]')).not.toBeVisible();

    // Check that Students menu is NOT visible for student users
    await expect(page.locator('nav a[href="/students"]')).not.toBeVisible();

    // Check that Messages menu is visible for student users
    await expect(page.locator('nav a[href="/messages"]')).toBeVisible();
    await expect(page.locator('nav a[href="/messages"]')).toContainText('Messages');
  });

  test('Guest user should not see Admins or Students menus in sidebar', async ({ page }) => {
    // Login as guest user
    await page.fill('#login-email', 'guest@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to guest home page
    await page.waitForURL('/guest-home');

    // Check that Admins menu is NOT visible for guest users
    await expect(page.locator('nav a[href="/admins"]')).not.toBeVisible();

    // Check that Students menu is NOT visible for guest users
    await expect(page.locator('nav a[href="/students"]')).not.toBeVisible();

    // Check that Messages menu is visible for guest users
    await expect(page.locator('nav a[href="/messages"]')).toBeVisible();
    await expect(page.locator('nav a[href="/messages"]')).toContainText('Messages');
  });

  test('Sudo user can navigate to Admins page but not Students page', async ({ page }) => {
    // Login as sudo user
    await page.fill('#login-email', process.env.SUPERADMIN_EMAIL || 'sudo@email.com');
    await page.fill('#login-password', process.env.SUPERADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Click on Admins menu
    await page.click('nav a[href="/admins"]');

    // Verify navigation to Admins page
    await page.waitForURL('/admins');
    await expect(page).toHaveURL('/admins');

    // Try to navigate to Students page directly (should be blocked)
    await page.goto('/students');
    // Should be redirected back to dashboard or show access denied
    await expect(page).not.toHaveURL('/students');
  });

  test('Admin user can navigate to Students page but not Admins page', async ({ page }) => {
    // Login as admin user
    await page.fill('#login-email', process.env.ADMIN_EMAIL || 'admin@email.com');
    await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Click on Students menu
    await page.click('nav a[href="/students"]');

    // Verify navigation to Students page
    await page.waitForURL('/students');
    await expect(page).toHaveURL('/students');

    // Try to navigate to Admins page directly (should be blocked)
    await page.goto('/admins');
    // Should be redirected back to dashboard or show access denied
    await expect(page).not.toHaveURL('/admins');
  });

  test('Sudo user can access Admin Form submenu', async ({ page }) => {
    // Login as sudo user
    await page.fill('#login-email', process.env.SUPERADMIN_EMAIL || 'sudo@email.com');
    await page.fill('#login-password', process.env.SUPERADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Navigate to Admins page to trigger submenu
    await page.click('nav a[href="/admins"]');
    await page.waitForURL('/admins');

    // Check that Admin Form submenu is visible
    await expect(page.locator('nav a[href="/admin-form"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin-form"]')).toContainText('Admin Form');
  });

  test('Admin user can access Student Form submenu', async ({ page }) => {
    // Login as admin user
    await page.fill('#login-email', process.env.ADMIN_EMAIL || 'admin@email.com');
    await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Navigate to Students page to trigger submenu
    await page.click('nav a[href="/students"]');
    await page.waitForURL('/students');

    // Check that Student Form submenu is visible
    await expect(page.locator('nav a[href="/student-form"]')).toBeVisible();
    await expect(page.locator('nav a[href="/student-form"]')).toContainText('Student Form');
  });
}); 