import { test, expect } from '@playwright/test';

test.describe('Navigation Topbar User Menu - TDD E2E Tests', () => {
  
  test.describe('User Menu Display and Actions', () => {
    test('should display correct superadmin name and email in topbar user menu', async ({ page }) => {
      // Login as superadmin 
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'admin@sdu.edu.kz');
      await page.fill('#login-password', 'supersecret');
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for navigation to main page
      await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
      
      // Check that the user info is displayed correctly (not hardcoded "Ibrahim Tuncer")
      const userInfoSection = page.locator('.user-info');
      await expect(userInfoSection).toBeVisible();
      
      // Verify correct user name is shown (from .env: ADMIN_NAME=Admin)
      await expect(userInfoSection).toContainText('Admin');
      
      // Verify correct email is shown
      await expect(userInfoSection).toContainText('admin@sdu.edu.kz');
      
      // Verify the hardcoded name "Ibrahim Tuncer" is NOT present
      await expect(page.locator('body')).not.toContainText('Ibrahim Tuncer');
    });

    test('should display correct student name and email in topbar user menu', async ({ page }) => {
      // Login as student
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'alice@student.local');
      await page.fill('#login-password', 'password');
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for navigation to main page
      await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
      
      // Check that the user info is displayed correctly
      const userInfoSection = page.locator('.user-info');
      await expect(userInfoSection).toBeVisible();
      
      // Verify student email is shown
      await expect(userInfoSection).toContainText('alice@student.local');
      
      // Verify the hardcoded name "Ibrahim Tuncer" is NOT present
      await expect(page.locator('body')).not.toContainText('Ibrahim Tuncer');
    });

    test('should open user dropdown menu when clicked', async ({ page }) => {
      // Login as superadmin
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'admin@sdu.edu.kz');
      await page.fill('#login-password', 'password');
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL(/\/(main|dormitories)/, { timeout: 10000 });
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Look for user menu button - it has class "user-menu"
      const userMenuButton = page.locator('.user-menu');
      await expect(userMenuButton).toBeVisible({ timeout: 10000 });
      await userMenuButton.click();
      
      // Wait for dropdown to appear - it has classes "dropdown-menu open"
      const dropdownMenu = page.locator('.dropdown-menu.open');
      await expect(dropdownMenu).toBeVisible({ timeout: 5000 });
      
      // Check for Profile option with data-testid
      const profileOption = page.locator('[data-testid="profile-link"]');
      await expect(profileOption).toBeVisible({ timeout: 5000 });
      await expect(profileOption).toContainText('Profile');
      
      // Check for Logout option with class logout-button
      const logoutOption = page.locator('.logout-button');
      await expect(logoutOption).toBeVisible({ timeout: 5000 });
      await expect(logoutOption).toContainText('Logout');
    });
  });

  test.describe('Profile Navigation from User Menu', () => {
    test('should navigate to admin profile form when admin clicks Profile', async ({ page }) => {
      // Login as superadmin
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'admin@sdu.edu.kz');
      await page.fill('#login-password', 'password');
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL(/\/(main|dormitories)/, { timeout: 10000 });
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Open user menu
      const userMenuButton = page.locator('.user-menu');
      await expect(userMenuButton).toBeVisible({ timeout: 10000 });
      await userMenuButton.click();
      
      // Click Profile link
      const profileLink = page.locator('[data-testid="profile-link"]');
      await expect(profileLink).toBeVisible({ timeout: 5000 });
      await profileLink.click();
      
      // Wait for navigation - be more flexible with URL pattern
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/(admin-form|profile)/);
      
      // Check for admin form elements
      const adminForm = page.locator('#admin-name, #admin-email, text="Admin Management"').first();
      await expect(adminForm).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to student profile form when student clicks Profile', async ({ page }) => {
      // Login as student
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'alice@student.local');
      await page.fill('#login-password', 'password');
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
      
      // Open user menu
      await page.click('button.user-menu');
      
      // Click Profile link
      const profileLink = page.locator('[data-testid="profile-link"]');
      await profileLink.click();
      
      // Verify navigation to student form with correct URL pattern
      await expect(page).toHaveURL(/\/student-form\/\d+/);
      
      // Verify we're on student profile form page
      await expect(page.locator('text=Student page')).toBeVisible();
      
      // Verify form fields are populated with student data
      const emailField = page.locator('#student-email');
      await expect(emailField).toBeVisible();
      await expect(emailField).toHaveValue('alice@student.local');
    });
  });

  test.describe('Logout Functionality', () => {
    test('should logout user and redirect to root path when logout clicked', async ({ page }) => {
      // Login as superadmin
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'admin@sdu.edu.kz');
      await page.fill('#login-password', 'password');
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL(/\/(main|dormitories)/, { timeout: 10000 });
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Open user menu
      const userMenuButton = page.locator('.user-menu');
      await expect(userMenuButton).toBeVisible({ timeout: 10000 });
      await userMenuButton.click();
      
      // Click Logout button
      const logoutButton = page.locator('.logout-button');
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
      await logoutButton.click();
      
      // Wait for redirect to login page
      await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
      
      // Verify we're back to login page
      await expect(page.locator('#login-email')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('#login-password')).toBeVisible({ timeout: 5000 });
    });

    test('should clear user session and prevent access to protected routes after logout', async ({ page }) => {
      // Login as student
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'alice@student.local');
      await page.fill('#login-password', 'password');
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
      
      // Logout
      await page.click('button.user-menu');
      await page.click('.logout-button');
      await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
      
      // Try to access protected route
      await page.goto('http://localhost:5173/main');
      
      // Should be redirected back to login
      await expect(page).toHaveURL('http://localhost:5173/');
      await expect(page.locator('#login-email')).toBeVisible();
    });

    test('should show login form after logout without authentication errors', async ({ page }) => {
      // Login and logout
      await page.goto('http://localhost:5173/');
      await page.fill('#login-email', 'admin@sdu.edu.kz');
      await page.fill('#login-password', 'supersecret');
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
      
      // Logout
      await page.click('button.user-menu');
      await page.click('.logout-button');
      await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
      
      // Verify clean login state (no error messages)
      await expect(page.locator('.error-message')).not.toBeVisible();
      await expect(page.locator('#login-email')).toHaveValue('');
      await expect(page.locator('#login-password')).toHaveValue('');
      
      // Verify login form is functional after logout
      await page.fill('#login-email', 'alice@student.local');
      await page.fill('#login-password', 'password');
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
      await expect(page).toHaveURL('http://localhost:5173/main');
    });
  });
});
