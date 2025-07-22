import { test, expect } from './test';

test.describe('Basic Navigation and Form Tests - E2E', () => {
  
  test('should successfully login and access user menu', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    // Verify user info is displayed correctly
    const userInfoSection = page.locator('.user-info');
    await expect(userInfoSection).toBeVisible();
    await expect(userInfoSection).toContainText('admin@sdu.edu.kz');
    
    // Verify user menu can be opened
    const userMenuButton = page.locator('button.user-menu');
    await expect(userMenuButton).toBeVisible();
    await userMenuButton.click();
    
    // Verify dropdown menu opens with correct options
    const dropdownMenu = page.locator('.dropdown-menu.open');
    await expect(dropdownMenu).toBeVisible();
    
    const profileLink = page.locator('[data-testid="profile-link"]');
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toContainText('Profile');
    
    const logoutButton = page.locator('.logout-button');
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toContainText('Logout');
  });

  test('should navigate to admin profile form', async ({ page }) => {
    // Login and navigate to profile
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    await page.click('button.user-menu');
    await page.click('[data-testid="profile-link"]');
    
    // Verify navigation to admin form
    await expect(page).toHaveURL(/\/admin-form\/\d+/);
    await expect(page.locator('text=Admin Management')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('#admin-name')).toBeVisible();
    await expect(page.locator('#admin-surname')).toBeVisible();
    await expect(page.locator('#admin-email')).toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
  });

  test('should navigate to student profile form', async ({ page }) => {
    // Login as student
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    await page.click('button.user-menu');
    await page.click('[data-testid="profile-link"]');
    
    // Verify navigation to student form
    await expect(page).toHaveURL(/\/student-form\/\d+/);
    await expect(page.locator('text=Student page')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.locator('#student-name')).toBeVisible();
    await expect(page.locator('#student-surname')).toBeVisible();
    await expect(page.locator('#student-email')).toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
  });

  test('should display single phone field in admin form', async ({ page }) => {
    // Login and navigate to admin profile
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    await page.click('button.user-menu');
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL(/\/admin-form\/\d+/);
    
    // Check that there's exactly one phone field
    const phoneFields = page.locator('input[type="tel"], input[id*="phone" i]');
    const phoneFieldCount = await phoneFields.count();
    expect(phoneFieldCount).toBe(1);
    
    // Verify the phone field is properly labeled
    const phoneField = page.locator('#admin-phone');
    await expect(phoneField).toBeVisible();
  });

  test('should logout and redirect to root path', async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    // Verify we're logged in
    await expect(page.locator('.user-info')).toBeVisible();
    
    // Logout
    await page.click('button.user-menu');
    await page.click('.logout-button');
    
    // Verify redirect to root path
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
    await expect(page).toHaveURL('http://localhost:5173/');
    
    // Verify we're back to login page
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    
    // Verify user info is no longer visible
    await expect(page.locator('.user-info')).not.toBeVisible();
  });

  test('should prevent access to protected routes after logout', async ({ page }) => {
    // Login and logout
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    await page.click('button.user-menu');
    await page.click('.logout-button');
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
    
    // Try to access protected route
    await page.goto('http://localhost:5173/main');
    
    // Should be redirected back to login
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.locator('#login-email')).toBeVisible();
  });

  test('should display correct user information in topbar', async ({ page }) => {
    // Test admin user display
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    const userInfoSection = page.locator('.user-info');
    await expect(userInfoSection).toBeVisible();
    await expect(userInfoSection).toContainText('admin@sdu.edu.kz');
    
    // Verify no hardcoded data is present
    await expect(page.locator('body')).not.toContainText('Ibrahim Tuncer');
  });

  test('should maintain clean state after form interactions', async ({ page }) => {
    // Login and access admin form
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'admin@sdu.edu.kz');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
    
    await page.click('button.user-menu');
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL(/\/admin-form\/\d+/);
    
    // Wait for any loading to complete and dismiss alerts
    await page.waitForTimeout(2000);
    const errorAlert = page.locator('.toast-error, button:has-text("Close")');
    if (await errorAlert.isVisible()) {
      await errorAlert.click();
    }
    
    // Interact with form fields
    await page.fill('#admin-name', 'Test Name');
    await page.fill('#admin-surname', 'Test Surname');
    await page.fill('#admin-email', 'test@example.com');
    
    // Verify fields maintain their values
    await expect(page.locator('#admin-name')).toHaveValue('Test Name');
    await expect(page.locator('#admin-surname')).toHaveValue('Test Surname');
    await expect(page.locator('#admin-email')).toHaveValue('test@example.com');
    
    // Navigate away and back to main page
    await page.goto('http://localhost:5173/main');
    await expect(page.locator('.user-info')).toBeVisible();
  });
});
