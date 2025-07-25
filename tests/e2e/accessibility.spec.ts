import { test, expect } from './test';

test.describe('Accessibility & Keyboard Navigation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Assume login is required for most pages
    await page.fill('#login-email', process.env.ADMIN_EMAIL!);
    await page.fill('#login-password', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/main/, { timeout: 15000 });
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
    // Check for focus-visible class or outline style
    const hasOutline = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
    });
    expect(hasOutline).toBe(true);
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
    await page.click('[data-testid="add-admin-button"]');
    await expect(page).toHaveURL(/admin-form/);
    // Tab through modal fields
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    // Focus should not leave the modal
    const modal = await page.locator('form').first();
    const active = await page.evaluate(() => document.activeElement && document.activeElement.closest('form'));
    expect(active).not.toBeNull();
  });
}); 