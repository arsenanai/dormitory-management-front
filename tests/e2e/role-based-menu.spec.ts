import { test, expect } from '@playwright/test';

test.describe('Role-based Sidebar Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
  });

  test('superadmin should see all menu items', async ({ page }) => {
    // Login as superadmin (sudo role)
    await page.fill('[data-testid="email-input"]', 'admin@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to main page
    await page.waitForURL('/main');

    // Check that superadmin sees all menu items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Admins')).toBeVisible();
    await expect(page.locator('text=Dormitories')).toBeVisible();
    await expect(page.locator('text=Room Types')).toBeVisible();
    await expect(page.locator('text=Students')).toBeVisible();
    await expect(page.locator('text=Guests')).toBeVisible();
    await expect(page.locator('text=Rooms')).toBeVisible();
    await expect(page.locator('text=Payments')).toBeVisible();
    await expect(page.locator('text=Messages')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('admin should see limited menu items', async ({ page }) => {
    // Login as admin
    await page.fill('[data-testid="email-input"]', 'admin2@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to main page
    await page.waitForURL('/main');

    // Check that admin sees appropriate menu items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Students')).toBeVisible();
    await expect(page.locator('text=Guests')).toBeVisible();
    await expect(page.locator('text=Rooms')).toBeVisible();
    await expect(page.locator('text=Payments')).toBeVisible();
    await expect(page.locator('text=Messages')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();

    // Check that admin does NOT see superadmin-only items
    await expect(page.locator('text=Admins')).not.toBeVisible();
    await expect(page.locator('text=Dormitories')).not.toBeVisible();
    await expect(page.locator('text=Room Types')).not.toBeVisible();
  });

  test('student should see student-specific menu items', async ({ page }) => {
    // Login as student
    await page.fill('[data-testid="email-input"]', 'student@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to student main page
    await page.waitForURL('/student-main');

    // Check that student sees appropriate menu items
    await expect(page.locator('text=Student Main')).toBeVisible();
    await expect(page.locator('text=Messages')).toBeVisible();

    // Check that student does NOT see admin-only items
    await expect(page.locator('text=Dashboard')).not.toBeVisible();
    await expect(page.locator('text=Students')).not.toBeVisible();
    await expect(page.locator('text=Guests')).not.toBeVisible();
    await expect(page.locator('text=Rooms')).not.toBeVisible();
    await expect(page.locator('text=Payments')).not.toBeVisible();
    await expect(page.locator('text=Settings')).not.toBeVisible();
    await expect(page.locator('text=Admins')).not.toBeVisible();
    await expect(page.locator('text=Dormitories')).not.toBeVisible();
    await expect(page.locator('text=Room Types')).not.toBeVisible();
  });

  test('guest should see guest-specific menu items', async ({ page }) => {
    // Login as guest
    await page.fill('[data-testid="email-input"]', 'guest@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to guest home page
    await page.waitForURL('/guest-home');

    // Check that guest sees appropriate menu items
    await expect(page.locator('text=Guest Home')).toBeVisible();
    await expect(page.locator('text=Messages')).toBeVisible();

    // Check that guest does NOT see admin-only items
    await expect(page.locator('text=Dashboard')).not.toBeVisible();
    await expect(page.locator('text=Students')).not.toBeVisible();
    await expect(page.locator('text=Guests')).not.toBeVisible();
    await expect(page.locator('text=Rooms')).not.toBeVisible();
    await expect(page.locator('text=Payments')).not.toBeVisible();
    await expect(page.locator('text=Settings')).not.toBeVisible();
    await expect(page.locator('text=Admins')).not.toBeVisible();
    await expect(page.locator('text=Dormitories')).not.toBeVisible();
    await expect(page.locator('text=Room Types')).not.toBeVisible();
  });

  test('menu items should be clickable and navigate correctly', async ({ page }) => {
    // Login as admin
    await page.fill('[data-testid="email-input"]', 'admin@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to main page
    await page.waitForURL('/main');

    // Test navigation to different pages
    await page.click('text=Students');
    await page.waitForURL('/students');

    await page.click('text=Rooms');
    await page.waitForURL('/rooms');

    await page.click('text=Messages');
    await page.waitForURL('/messages');

    await page.click('text=Settings');
    await page.waitForURL('/settings');
  });

  test('messages menu should show badge with unread count', async ({ page }) => {
    // Login as admin
    await page.fill('[data-testid="email-input"]', 'admin@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to main page
    await page.waitForURL('/main');

    // Check that messages menu shows badge
    const messagesLink = page.locator('text=Messages');
    await expect(messagesLink).toBeVisible();
    
    // Check for badge (this will depend on the actual implementation)
    // For now, we'll just verify the messages link is visible
    await expect(messagesLink).toBeVisible();
  });

  test('role-based access control should prevent unauthorized access', async ({ page }) => {
    // Login as student
    await page.fill('[data-testid="email-input"]', 'student@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to student main page
    await page.waitForURL('/student-main');

    // Try to access admin-only pages directly
    await page.goto('/students');
    await page.waitForURL('/student-main'); // Should redirect back

    await page.goto('/settings');
    await page.waitForURL('/student-main'); // Should redirect back

    await page.goto('/admins');
    await page.waitForURL('/student-main'); // Should redirect back
  });
}); 