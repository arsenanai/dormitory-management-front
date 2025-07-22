import { test, expect } from './test';

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
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    // Wait for the forgot-password button to appear
    const forgotBtn = await page.waitForSelector('[data-testid="forgot-password"]', { timeout: 10000 });
    if (!forgotBtn) {
      throw new Error('Forgot password button not found on login page.');
    }
    await forgotBtn.click();
    await expect(page.locator('#playwright-reset-modal')).toBeVisible();
    await page.waitForTimeout(500); // Wait for modal animation/render
    // Try both selectors for robustness
    const input = page.locator('input[data-testid="reset-email"], input#reset-email');
    await expect(input).toBeVisible();
    await input.fill('testuser@example.com');
    await page.click('button:has-text("Send Reset Link")');
    // Wait for the success message (robust to translation)
    const successMsg = page.locator('text=/Check your email/i');
    try {
      await expect(successMsg).toBeVisible({ timeout: 5000 });
    } catch (e) {
      // Print modal content for debugging
      const modalHtml = await page.locator('#playwright-reset-modal').innerHTML();
      console.log('MODAL HTML AFTER SUBMIT:', modalHtml);
      throw e;
    }
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    const forgotBtn = await page.waitForSelector('[data-testid="forgot-password"]', { timeout: 10000 });
    if (!forgotBtn) {
      throw new Error('Forgot password button not found on login page.');
    }
    await forgotBtn.click();
    const input = page.locator('input[data-testid="reset-email"], input#reset-email');
    await expect(input).toBeVisible();
    await input.fill('not-an-email');
    await page.click('button:has-text("Send Reset Link")');
    await page.pause(); // Pause for manual DOM inspection
    // Wait for the error message using the data-testid selector
    const errorMsg = page.locator('[data-testid="reset-email-error"]');
    try {
      await expect(errorMsg).toBeVisible({ timeout: 3000 });
      await expect(errorMsg).toContainText(/invalid email/i);
    } catch (e) {
      const modalHtml = await page.locator('#playwright-reset-modal').innerHTML();
      console.log('MODAL HTML AFTER SUBMIT (INVALID EMAIL):', modalHtml);
      throw e;
    }
  })
})
