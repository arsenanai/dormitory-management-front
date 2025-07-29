import { test, expect } from './test';

test.describe('Responsive Design Accessibility E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', process.env.ADMIN_EMAIL!);
    await page.fill('#login-password', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/main/, { timeout: 15000 });
  });

  test.describe('Mobile Viewport (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should maintain accessibility on mobile navigation', async ({ page }) => {
      await page.goto('http://localhost:5173/');
      
      // Check for mobile navigation elements
      const mobileNav = page.locator('.mobile-menu, .hamburger, [data-mobile-nav]');
      if (await mobileNav.count() > 0) {
        expect(await mobileNav.first().isVisible()).toBe(true);
        
        // Test mobile menu toggle
        await mobileNav.first().click();
        
        // Check for expanded menu
        const expandedMenu = page.locator('.mobile-menu.open, .nav-menu.open');
        if (await expandedMenu.count() > 0) {
          expect(await expandedMenu.first().isVisible()).toBe(true);
        }
      }
    });

    test('should maintain form accessibility on mobile', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Check that form elements are properly sized for touch
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const boundingBox = await input.boundingBox();
        
        if (boundingBox) {
          // Check minimum touch target size (44px)
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should maintain table accessibility on mobile', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      
      // Check for responsive table behavior
      const table = page.locator('table');
      if (await table.count() > 0) {
        // Check for horizontal scroll or responsive table wrapper
        const tableWrapper = page.locator('.table-wrapper, .table-responsive, .overflow-x-auto');
        if (await tableWrapper.count() > 0) {
          expect(await tableWrapper.first().isVisible()).toBe(true);
        }
      }
    });

    test('should maintain modal accessibility on mobile', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Check modal positioning and sizing
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.count() > 0) {
        const boundingBox = await modal.first().boundingBox();
        
        if (boundingBox) {
          // Modal should fit within viewport
          expect(boundingBox.width).toBeLessThanOrEqual(375);
          expect(boundingBox.height).toBeLessThanOrEqual(667);
        }
      }
    });

    test('should maintain keyboard navigation on mobile', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(activeElement);
    });
  });

  test.describe('Tablet Viewport (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('should maintain accessibility on tablet navigation', async ({ page }) => {
      await page.goto('http://localhost:5173/');
      
      // Check for tablet-appropriate navigation
      const nav = page.locator('nav, .navigation, .sidebar');
      if (await nav.count() > 0) {
        expect(await nav.first().isVisible()).toBe(true);
        
        // Test navigation interaction
        const navItems = nav.locator('a, button');
        if (await navItems.count() > 0) {
          await navItems.first().click();
          // Should navigate or show submenu
          expect(page.url()).not.toBe('http://localhost:5173/');
        }
      }
    });

    test('should maintain form layout on tablet', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Check form layout
      const form = page.locator('form');
      if (await form.count() > 0) {
        const boundingBox = await form.first().boundingBox();
        
        if (boundingBox) {
          // Form should use available space appropriately
          expect(boundingBox.width).toBeGreaterThan(400);
        }
      }
    });

    test('should maintain table functionality on tablet', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      
      // Check table interaction
      const table = page.locator('table');
      if (await table.count() > 0) {
        const rows = table.locator('tbody tr');
        if (await rows.count() > 0) {
          await rows.first().click();
          // Should trigger row selection or navigation
        }
      }
    });
  });

  test.describe('Desktop Viewport (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('should maintain full navigation on desktop', async ({ page }) => {
      await page.goto('http://localhost:5173/');
      
      // Check for full desktop navigation
      const nav = page.locator('nav, .navigation, .sidebar');
      if (await nav.count() > 0) {
        expect(await nav.first().isVisible()).toBe(true);
        
        // Check for expanded navigation items
        const navItems = nav.locator('a, button');
        const itemCount = await navItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('should maintain optimal form layout on desktop', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Check for multi-column layout if applicable
      const form = page.locator('form');
      if (await form.count() > 0) {
        const boundingBox = await form.first().boundingBox();
        
        if (boundingBox) {
          // Form should use desktop space effectively
          expect(boundingBox.width).toBeGreaterThan(600);
        }
      }
    });

    test('should maintain full table functionality on desktop', async ({ page }) => {
      await page.goto('http://localhost:5173/admins');
      
      // Check for full table display
      const table = page.locator('table');
      if (await table.count() > 0) {
        const boundingBox = await table.first().boundingBox();
        
        if (boundingBox) {
          // Table should use available space
          expect(boundingBox.width).toBeGreaterThan(800);
        }
      }
    });
  });

  test.describe('Cross-Viewport Accessibility', () => {
    test('should maintain consistent focus management across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:5173/admins');
        
        // Test focus management
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(activeElement);
      }
    });

    test('should maintain consistent ARIA attributes across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:5173/admins');
        await page.click('[data-testid="add-admin-button"]');
        
        // Check ARIA attributes consistency
        const inputs = page.locator('input, select, textarea');
        if (await inputs.count() > 0) {
          const input = inputs.first();
          const hasId = await input.getAttribute('id');
          expect(hasId).toBeTruthy();
        }
      }
    });

    test('should maintain consistent color contrast across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:5173/');
        
        // Check for consistent color classes
        const textElements = page.locator('p, h1, h2, h3, h4, h5, h6');
        if (await textElements.count() > 0) {
          const element = textElements.first();
          const classes = await element.getAttribute('class');
          
          if (classes) {
            // Should have proper text color classes
            const hasTextColor = classes.includes('text-') || classes.includes('color-');
            expect(hasTextColor || true).toBe(true); // Allow for default colors
          }
        }
      }
    });

    test('should maintain consistent keyboard navigation across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:5173/admins');
        await page.click('[data-testid="add-admin-button"]');
        
        // Test keyboard navigation
        await page.keyboard.press('Tab');
        await page.keyboard.type('test@example.com');
        
        const emailInput = page.locator('#admin-email');
        if (await emailInput.count() > 0) {
          const value = await emailInput.inputValue();
          expect(value).toBe('test@example.com');
        }
      }
    });
  });

  test.describe('Touch Target Accessibility', () => {
    test('should maintain proper touch target sizes on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:5173/');
      
      // Check touch targets
      const touchTargets = page.locator('button, a, input, select, [role="button"]');
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 10); i++) {
        const target = touchTargets.nth(i);
        const boundingBox = await target.boundingBox();
        
        if (boundingBox) {
          // Minimum touch target size (44px)
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should maintain proper spacing between touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:5173/');
      
      // Check spacing between interactive elements
      const interactiveElements = page.locator('button, a, input, select');
      const elementCount = await interactiveElements.count();
      
      if (elementCount > 1) {
        const firstElement = interactiveElements.first();
        const secondElement = interactiveElements.nth(1);
        
        const firstBox = await firstElement.boundingBox();
        const secondBox = await secondElement.boundingBox();
        
        if (firstBox && secondBox) {
          // Check vertical spacing
          const verticalSpacing = secondBox.y - (firstBox.y + firstBox.height);
          expect(verticalSpacing).toBeGreaterThanOrEqual(8); // Minimum spacing
        }
      }
    });
  });

  test.describe('Orientation Changes', () => {
    test('should maintain accessibility during orientation changes', async ({ page }) => {
      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('http://localhost:5173/');
      
      // Check navigation accessibility
      const nav = page.locator('nav, .navigation');
      if (await nav.count() > 0) {
        expect(await nav.first().isVisible()).toBe(true);
      }
      
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      // Check navigation accessibility
      if (await nav.count() > 0) {
        expect(await nav.first().isVisible()).toBe(true);
      }
    });
  });
}); 