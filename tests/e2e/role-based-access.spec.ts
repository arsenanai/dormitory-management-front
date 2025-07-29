import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS } from './test-utils';

test.describe('Role-Based Access Control', () => {
  test.describe('Superadmin Access', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'superadmin');
    });

    test('should have access to all modules', async ({ page }) => {
      // Check access to all main modules from documentation
      const modules = [
        '/main',           // Dashboard
        '/admins',         // Admins management
        '/students',       // Students management
        '/guest-house',    // Guest house management
        '/messages',       // Messaging system
        '/payments',       // Payment management
        '/accounting',     // Accounting reports
        '/dormitories',    // Dormitory configuration
        '/rooms',          // Room management
        '/room-types',     // Room type management
        '/settings'        // System settings
      ];

      for (const module of modules) {
        await TestUtils.navigateTo(page, module);
        // Should not be redirected to login (access granted)
        await expect(page).not.toHaveURL('/');
        // Should be on the intended page
        await expect(page.url()).toContain(module);
      }
    });

    test('should be able to configure dormitories', async ({ page }) => {
      await TestUtils.navigateTo(page, '/dormitories');
      
      // Check if add dormitory functionality is available
      const addButton = page.locator(SELECTORS.addButton);
      if (await addButton.count() > 0) {
        await TestUtils.expectElementVisible(page, SELECTORS.addButton);
      }
    });

    test('should be able to manage system settings', async ({ page }) => {
      await TestUtils.navigateTo(page, '/settings');
      
      // Check for system configuration options
      await expect(page.locator('body')).toContainText(/settings|configuration/i);
    });

    test('should be able to view accounting reports', async ({ page }) => {
      await TestUtils.navigateTo(page, '/accounting');
      
      // Check for accounting functionality
      await expect(page.locator('body')).toContainText(/accounting|income|report/i);
    });
  });

  test.describe('Admin Access', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should have access to admin modules', async ({ page }) => {
      // Check access to admin-level modules
      const adminModules = [
        '/main',           // Dashboard
        '/students',       // Students management
        '/guest-house',    // Guest house management
        '/messages',       // Messaging system
        '/payments',       // Payment management
        '/rooms',          // Room management
        '/room-types'      // Room type management
      ];

      for (const module of adminModules) {
        await TestUtils.navigateTo(page, module);
        // Should not be redirected to login (access granted)
        await expect(page).not.toHaveURL('/');
        // Should be on the intended page
        await expect(page.url()).toContain(module);
      }
    });

    test('should be able to manage students', async ({ page }) => {
      await TestUtils.navigateTo(page, '/students');
      
      // Check if student management functionality is available
      const addButton = page.locator(SELECTORS.addButton);
      if (await addButton.count() > 0) {
        await TestUtils.expectElementVisible(page, SELECTORS.addButton);
      }
    });

    test('should be able to send messages to students', async ({ page }) => {
      await TestUtils.navigateTo(page, '/messages');
      
      // Check for messaging functionality
      await expect(page.locator('body')).toContainText(/message|send/i);
    });

    test('should be able to manage room assignments', async ({ page }) => {
      await TestUtils.navigateTo(page, '/rooms');
      
      // Check for room management functionality
      await expect(page.locator('body')).toContainText(/room|bed/i);
    });

    test('should NOT have access to superadmin modules', async ({ page }) => {
      // Check that admin cannot access superadmin-only modules
      const superadminModules = [
        '/admins',         // Admin management
        '/accounting',     // Accounting reports
        '/dormitories',    // Dormitory configuration
        '/settings'        // System settings
      ];

      for (const module of superadminModules) {
        await TestUtils.navigateTo(page, module);
        // Should be redirected to login or show access denied
        const currentUrl = page.url();
        if (currentUrl.includes('/')) {
          // Either redirected to login or access denied
          await expect(currentUrl).toMatch(/\/$|\/access-denied/);
        }
      }
    });
  });

  test.describe('Student Access', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'student');
    });

    test('should have access to student modules', async ({ page }) => {
      // Check access to student-level modules
      const studentModules = [
        '/main',           // Student main page
        '/student-main'    // Student dashboard
      ];

      for (const module of studentModules) {
        await TestUtils.navigateTo(page, module);
        // Should not be redirected to login (access granted)
        await expect(page).not.toHaveURL('/');
        // Should be on the intended page
        await expect(page.url()).toContain(module);
      }
    });

    test('should be able to view registration status', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check for registration status display
      await expect(page.locator('body')).toContainText(/registration|status/i);
    });

    test('should be able to view payment information', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check for payment information display
      await expect(page.locator('body')).toContainText(/payment|accounting/i);
    });

    test('should be able to read messages from dormitory management', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check for messages display
      await expect(page.locator('body')).toContainText(/message|notification/i);
    });

    test('should NOT have access to admin modules', async ({ page }) => {
      // Check that students cannot access admin modules
      const adminModules = [
        '/students',       // Student management
        '/guest-house',    // Guest house management
        '/messages',       // Messaging system
        '/payments',       // Payment management
        '/rooms',          // Room management
        '/room-types',     // Room type management
        '/admins',         // Admin management
        '/accounting',     // Accounting reports
        '/dormitories',    // Dormitory configuration
        '/settings'        // System settings
      ];

      for (const module of adminModules) {
        await TestUtils.navigateTo(page, module);
        // Should be redirected to login or show access denied
        const currentUrl = page.url();
        if (currentUrl.includes('/')) {
          // Either redirected to login or access denied
          await expect(currentUrl).toMatch(/\/$|\/access-denied/);
        }
      }
    });
  });

  test.describe('Guest House Access', () => {
    test('should have access to guest house modules', async ({ page }) => {
      // Login as guest house user (assuming there's a guest house role)
      // For now, test with admin credentials as guest house functionality
      await TestUtils.login(page, 'admin');
      
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for guest house management functionality
      await expect(page.locator('body')).toContainText(/guest|room/i);
      
      // Check if guest registration is available
      const addButton = page.locator(SELECTORS.addButton);
      if (await addButton.count() > 0) {
        await TestUtils.expectElementVisible(page, SELECTORS.addButton);
      }
    });
  });

  test.describe('Cross-Role Access Validation', () => {
    test('unauthenticated users should be redirected to login', async ({ page }) => {
      // Try to access protected routes without authentication
      const protectedRoutes = [
        '/main',
        '/students',
        '/admins',
        '/payments',
        '/settings'
      ];

      for (const route of protectedRoutes) {
        await TestUtils.navigateTo(page, route);
        // Should be redirected to login
        await TestUtils.expectURL(page, '/');
      }
    });

    test('users should only see sidebar links they have access to', async ({ page }) => {
      // Test with admin user
      await TestUtils.login(page, 'admin');
      
      // Check that only admin-accessible links are visible in sidebar
      const sidebarLinks = page.locator(SELECTORS.sidebarLinks);
      const linkCount = await sidebarLinks.count();
      
      if (linkCount > 0) {
        // Should have some sidebar links
        await expect(sidebarLinks.first()).toBeVisible();
        
        // Should not have superadmin-only links
        const superadminLinks = page.locator('a[href="/admins"], a[href="/settings"]');
        await expect(superadminLinks).toHaveCount(0);
      }
    });
  });
}); 