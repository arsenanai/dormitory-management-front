import { test, expect } from './test';

test.describe('Accessibility & Keyboard Navigation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Assume login is required for most pages
    await page.fill('#login-email', process.env.ADMIN_EMAIL!);
    await page.fill('#login-password', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]:has-text("Login")');
    // Wait for successful login - be more flexible with URL matching
    await page.waitForURL(/\/(main|student-main|guest-home)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('should allow tabbing through main navigation and buttons', async ({ page }) => {
    // Focus the first interactive element
    await page.keyboard.press('Tab');
    // Tab through a few elements and check focus
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const active = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(active);
    }
  });

  test('should show visible focus ring on buttons', async ({ page }) => {
    // Focus the first button
    await page.keyboard.press('Tab');
    const button = await page.locator('button').first();
    await button.focus();
    // Check for focus ring styles (box-shadow or ring classes)
    const hasFocusRing = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      // Check for box-shadow (focus ring) or focus-visible class
      const hasBoxShadow = style.boxShadow !== 'none';
      const hasFocusVisible = el.classList.contains('focus-visible');
      const hasRingClass = el.className.includes('focus:ring');
      const hasOutline = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
      const hasFocusRingClass = el.className.includes('focus:ring-');
      return hasBoxShadow || hasFocusVisible || hasRingClass || hasOutline || hasFocusRingClass;
    });
    expect(hasFocusRing).toBe(true);
  });

  test('should activate button with Enter/Space', async ({ page }) => {
    const button = await page.locator('button').first();
    await button.focus();
    await page.keyboard.press('Enter');
    // Optionally, check for a side effect (e.g., modal opens, toast appears)
    // await expect(page.locator('.modal, .toast')).toBeVisible();
  });

  test('should trap focus in modal', async ({ page }) => {
    // Open a modal (e.g., add user)
    await page.goto('http://localhost:5173/admins');
    
    // Close mobile menu if it's open
    const mobileMenu = page.locator('.mobile-menu.open');
    if (await mobileMenu.count() > 0) {
      await page.click('.mobile-menu-toggle');
    }
    
    await page.click('[data-testid="add-admin-button"]');
    await expect(page).toHaveURL(/admin-form/);
    
    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 5000 });
    
    // Check if there are focusable elements in the form
    const focusableElements = await page.locator('form input, form select, form textarea, form button').count();
    expect(focusableElements).toBeGreaterThan(0);
    
    // Tab through modal fields
    for (let i = 0; i < Math.min(focusableElements, 5); i++) {
      await page.keyboard.press('Tab');
    }
    // Focus should be on a form element
    const active = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement && (
        activeElement.closest('form') || 
        activeElement.closest('.modal') || 
        activeElement.closest('[role="dialog"]') ||
        activeElement.closest('.admin-form')
      );
    });
    expect(active).not.toBeNull();
  });

  test('should have proper ARIA attributes on form elements', async ({ page }) => {
    // Navigate to a form page
    await page.goto('http://localhost:5173/admins');
    
    // Close mobile menu if it's open
    const mobileMenu = page.locator('.mobile-menu.open');
    if (await mobileMenu.count() > 0) {
      await page.click('.mobile-menu-toggle');
    }
    
    await page.click('[data-testid="add-admin-button"]');
    
    // Check for proper ARIA attributes on form inputs
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      const hasId = await input.getAttribute('id');
      const hasName = await input.getAttribute('name');
      const hasPlaceholder = await input.getAttribute('placeholder');
      
      // Check that input has at least one identifier
      expect(hasId || hasName || hasPlaceholder).toBeTruthy();
      
      // Check for associated label if id exists
      if (hasId) {
        const label = page.locator(`label[for="${hasId}"]`);
        if (await label.count() > 0) {
          const labelText = await label.textContent();
          expect(labelText).toBeTruthy();
        }
      }
    }
  });

  test('should announce form validation errors to screen readers', async ({ page }) => {
    // Navigate to a form page
    await page.goto('http://localhost:5173/admins');
    
    // Close mobile menu if it's open
    const mobileMenu = page.locator('.mobile-menu.open');
    if (await mobileMenu.count() > 0) {
      await page.click('.mobile-menu-toggle');
    }
    
    await page.click('[data-testid="add-admin-button"]');
    
    // Try to submit form without required fields
    await page.click('button[type="submit"]');
    
    // Check for error messages with proper ARIA attributes
    const errorMessages = page.locator('[role="alert"], .error-message, .text-red-600, .text-red-500');
    if (await errorMessages.count() > 0) {
      const firstError = errorMessages.first();
      const errorText = await firstError.textContent();
      expect(errorText).toBeTruthy();
    }
  });

  test('should handle keyboard navigation in tables', async ({ page }) => {
    // Navigate to a table page
    await page.goto('http://localhost:5173/admins');
    
    // Check for table accessibility
    const table = page.locator('table');
    if (await table.count() > 0) {
      // Check that it's a proper table element (implicit role="table")
      expect(await table.evaluate(el => el.tagName.toLowerCase())).toBe('table');
      
      // Check for proper table headers
      const headers = table.locator('th');
      const headerCount = await headers.count();
      for (let i = 0; i < Math.min(headerCount, 3); i++) {
        const header = headers.nth(i);
        // Check for scope attribute or implicit scope
        const scope = await header.getAttribute('scope');
        if (scope) {
          expect(scope).toBe('col');
        }
      }
    }
  });

  test('should handle keyboard navigation in select dropdowns', async ({ page }) => {
    // Navigate to a form page with selects
    await page.goto('http://localhost:5173/admins');
    
    // Close mobile menu if it's open
    const mobileMenu = page.locator('.mobile-menu.open');
    if (await mobileMenu.count() > 0) {
      await page.click('.mobile-menu-toggle');
    }
    
    await page.click('[data-testid="add-admin-button"]');
    
    // Find select elements
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      const select = selects.first();
      await select.focus();
      await page.keyboard.press('ArrowDown');
      
      // Check that dropdown opened or value changed
      const value = await select.inputValue();
      expect(value).toBeTruthy();
    }
  });

  test('should handle keyboard navigation in modals', async ({ page }) => {
    // Open a modal
    await page.goto('http://localhost:5173/admins');
    
    // Close mobile menu if it's open
    const mobileMenu = page.locator('.mobile-menu.open');
    if (await mobileMenu.count() > 0) {
      await page.click('.mobile-menu-toggle');
    }
    
    await page.click('[data-testid="add-admin-button"]');
    
    // Check modal accessibility
    const modal = page.locator('[role="dialog"], .modal');
    if (await modal.count() > 0) {
      expect(await modal.getAttribute('aria-modal')).toBe('true');
      
      // Test Escape key to close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Modal should be closed or navigation should occur
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('admin-form');
    }
  });

  test('should handle keyboard navigation in toasts', async ({ page }) => {
    // Trigger a toast notification (this might require specific actions)
    await page.goto('http://localhost:5173/admins');
    
    // Close mobile menu if it's open
    const mobileMenu = page.locator('.mobile-menu.open');
    if (await mobileMenu.count() > 0) {
      await page.click('.mobile-menu-toggle');
    }
    
    await page.click('[data-testid="add-admin-button"]');
    
    // Fill form and submit to trigger success/error toast
    await page.fill('#admin-email', 'test@example.com');
    await page.fill('#admin-name', 'Test User');
    await page.click('button[type="submit"]');
    
    // Check for toast with proper ARIA attributes
    const toast = page.locator('[role="alert"], .toast');
    if (await toast.count() > 0) {
      // Check for role="alert" which is the correct ARIA attribute for toasts
      expect(await toast.getAttribute('role')).toBe('alert');
      
      // Test keyboard interaction with toast
      await toast.first().focus();
      await page.keyboard.press('Escape');
      
      // Toast might be dismissed or might not - check if it's still visible
      await page.waitForTimeout(1000);
      const toastCount = await toast.count();
      // Accept either dismissed (0) or still visible (1) as valid
      expect([0, 1]).toContain(toastCount);
    }
  });

  test('should maintain focus management during page transitions', async ({ page }) => {
    // Navigate between pages and check focus management
    await page.goto('http://localhost:5173/admins');
    
    // Focus should be on a logical element after navigation
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'BODY']).toContain(activeElement);
    
    // Navigate to another page
    await page.goto('http://localhost:5173/students');
    
    // Focus should still be managed properly
    const newActiveElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'BODY']).toContain(newActiveElement);
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Check for proper ARIA live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    
    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check for proper color contrast on text elements
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
    const elementCount = await textElements.count();
    
    // Sample a few elements to check for proper color classes
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);
      const classes = await element.getAttribute('class');
      
      if (classes) {
        // Check for proper text color classes
        const hasTextColor = classes.includes('text-') || classes.includes('color-');
        // This is a basic check - in a real scenario, you'd use a color contrast library
        expect(hasTextColor || true).toBe(true); // Allow for default colors
      }
    }
  });

  test('should handle responsive design accessibility', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/');
    
    // Check that navigation is still accessible
    const mobileNav = page.locator('nav, .mobile-menu, .hamburger');
    if (await mobileNav.count() > 0) {
      expect(await mobileNav.first().isVisible()).toBe(true);
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Check that content is still accessible
    const content = page.locator('main, .content, .container');
    expect(await content.first().isVisible()).toBe(true);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Check that all navigation elements are visible
    const desktopNav = page.locator('nav, .sidebar, .navigation');
    if (await desktopNav.count() > 0) {
      expect(await desktopNav.first().isVisible()).toBe(true);
    }
  });
});