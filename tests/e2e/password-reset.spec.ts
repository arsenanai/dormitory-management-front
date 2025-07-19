import { test, expect } from '@playwright/test'

test.describe('Password Reset Flow', () => {
  test('user can open password reset modal and submit email', async ({ page }) => {
    await page.goto('/')
    // Debug: print page content
    const content = await page.content();
    console.log('PAGE HTML:', content);
    // Wait for the forgot-password button to appear, with a longer timeout and error if not found
    const forgotBtn = await page.waitForSelector('[data-testid="forgot-password"]', { timeout: 10000 });
    if (!forgotBtn) {
      throw new Error('Forgot password button not found on login page.');
    }
    await forgotBtn.click();
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('input[type=email]')).toBeVisible();
    await page.fill('input[type=email]', 'testuser@example.com');
    await page.click('button:has-text("Send Reset Link")');
    await expect(page.locator('text=Check your email')).toBeVisible();
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/')
    // Debug: print page content
    const content = await page.content();
    console.log('PAGE HTML:', content);
    const forgotBtn = await page.waitForSelector('[data-testid="forgot-password"]', { timeout: 10000 });
    if (!forgotBtn) {
      throw new Error('Forgot password button not found on login page.');
    }
    await forgotBtn.click();
    await page.fill('input[type=email]', 'not-an-email');
    await page.click('button:has-text("Send Reset Link")');
    await expect(page.locator('text=Invalid email')).toBeVisible();
  })
})
