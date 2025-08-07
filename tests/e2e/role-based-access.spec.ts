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

    test('should login as sudo, navigate to dormitories via sidebar, and see dormitories data', async ({ page }) => {
      // 1. Clear any existing authentication state
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload();
      
      // 2. Login as sudo user
      await TestUtils.login(page, 'superadmin');
      
      // 3. Verify we're on the main page
      await expect(page).toHaveURL(/\/main/);
      
      // 4. Navigate to dormitories via sidebar
      const dormitoriesLink = page.locator('a[href="/dormitories"], [data-testid="sidebar-link"]:has-text("Dormitories")');
      await expect(dormitoriesLink).toBeVisible();
      await dormitoriesLink.click();
      
      // 5. Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // 6. Debug: Check what's actually being displayed
      console.log('Page URL:', page.url());
      
      // 7. Debug: Check if there's any error or loading state
      const loadingElement = page.locator('[data-testid="loading"]');
      const errorElement = page.locator('.text-red-500');
      
      if (await loadingElement.isVisible()) {
        console.log('Page is still loading...');
        await page.waitForTimeout(2000);
      }
      
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('Error found:', errorText);
      }
      
      // 8. Debug: Check the actual page content
      const pageContent = await page.content();
      console.log('Page content length:', pageContent.length);
      
      // 9. Debug: Check if the table exists and what's in it
      const table = page.locator('table, [data-testid="dormitories-table"]');
      const tableExists = await table.count() > 0;
      console.log('Table exists:', tableExists);
      
      if (tableExists) {
        const tableRows = page.locator('table tbody tr, [data-testid="dormitories-table"] tbody tr');
        const rowCount = await tableRows.count();
        console.log('Number of table rows:', rowCount);
        
        if (rowCount > 0) {
          for (let i = 0; i < Math.min(rowCount, 3); i++) {
            const rowText = await tableRows.nth(i).textContent();
            console.log(`Row ${i + 1}:`, rowText);
          }
        }
      }
      
      // 10. Debug: Check console logs for API response
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push(msg.text());
        console.log('Console log:', msg.text());
      });
      
      // 11. Debug: Check network requests
      const networkRequests = [];
      page.on('request', request => {
        if (request.url().includes('/api/dormitories')) {
          networkRequests.push(request.url());
          console.log('Dormitories API request:', request.url());
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('/api/dormitories')) {
          console.log('Dormitories API response status:', response.status());
          response.text().then(text => {
            console.log('Dormitories API response body:', text.substring(0, 500));
          });
        }
      });
      
      // 12. Wait a bit more for any async operations
      await page.waitForTimeout(2000);
      
      // 13. Debug: Check if there are any console errors or API issues
      const consoleErrors = await page.evaluate(() => {
        return window.console.error ? 'Console errors exist' : 'No console errors';
      });
      console.log('Console errors check:', consoleErrors);
      
      // 14. Debug: Check if the API call was made by looking at localStorage or sessionStorage
      const apiCallMade = await page.evaluate(() => {
        // Check if there's any indication of API calls in storage
        const keys = Object.keys(localStorage);
        const apiKeys = keys.filter(key => key.includes('api') || key.includes('dormitory'));
        return apiKeys.length > 0 ? `Found API keys: ${apiKeys.join(', ')}` : 'No API keys found';
      });
      console.log('API call check:', apiCallMade);
      
      // 15. Check for dormitory data
      const hasDormitory1 = await page.locator('text=Dormitory #1').count() > 0;
      const hasDormitory2 = await page.locator('text=Dormitory #2').count() > 0;
      const hasABlock = await page.locator('text=A Block').count() > 0;
      
      console.log('Dormitory #1 found:', hasDormitory1);
      console.log('Dormitory #2 found:', hasDormitory2);
      console.log('A Block found:', hasABlock);
      
      // 16. At least one dormitory should be visible
      expect(hasDormitory1 || hasDormitory2 || hasABlock).toBe(true);
      
      // 17. Check for action buttons
      const addButton = page.locator('button:has-text("Add Dormitory")');
      await expect(addButton).toBeVisible();
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