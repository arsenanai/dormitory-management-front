import { test, expect } from '@playwright/test'

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and sessionStorage to ensure unauthenticated state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Reload to apply cleared state
    await page.reload();
  });
  test('user can open password reset modal and submit email', async ({ page }) => {
    await page.goto('/');
    // Wait for a unique login page element (login button)
    try {
      await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    } catch (e) {
      const content = await page.content();
      console.log('PAGE HTML AFTER WAIT (ERROR):', content);
      throw e;
    }
    const content = await page.content();
    console.log('PAGE HTML AFTER WAIT:', content);
    // Wait for the forgot-password button to appear
    const forgotBtn = await page.waitForSelector('[data-testid="forgot-password"]', { timeout: 10000 });
    if (!forgotBtn) {
      throw new Error('Forgot password button not found on login page.');
    }
    await forgotBtn.click();
    await expect(page.locator('role=dialog')).toBeVisible();
    await page.waitForTimeout(1000); // Wait for modal animation/render
    // Try both selectors for robustness
    const input = page.locator('input[data-testid="reset-email"], input#reset-email');
    await expect(input).toBeVisible();
    await input.fill('testuser@example.com');
    await page.click('button:has-text("Send Reset Link")');
    await expect(page.locator('text=Check your email')).toBeVisible();
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/');
    try {
      await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    } catch (e) {
      const content = await page.content();
      console.log('PAGE HTML AFTER WAIT (ERROR):', content);
      throw e;
    }
    const content = await page.content();
    console.log('PAGE HTML AFTER WAIT:', content);
    const forgotBtn = await page.waitForSelector('[data-testid="forgot-password"]', { timeout: 10000 });
    if (!forgotBtn) {
      throw new Error('Forgot password button not found on login page.');
    }
    await forgotBtn.click();
    await page.fill('input[data-testid="reset-email"]', 'not-an-email');
    await page.click('button:has-text("Send Reset Link")');
    await expect(page.locator('text=Invalid email')).toBeVisible();
  })
})
