import { test, expect } from '@playwright/test';

test.describe('Guest Form Debug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should debug guest form submission', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Log console messages to see any errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Fill minimal required fields
    await page.fill('#guest-first-name', 'Debug');
    await page.fill('#guest-last-name', 'Guest');
    await page.fill('#guest-phone', '+1234567890');
    await page.fill('#guest-email', `debug${Date.now()}@example.com`);
    await page.fill('#guest-enter-date', '2024-12-25');
    await page.fill('#guest-exit-date', '2024-12-30');
    await page.selectOption('#guest-room', '1');
    await page.fill('#guest-purpose', 'Debug test');

    // Check if form is valid
    const submitBtn = page.locator('button:has-text("Submit")');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();

    // Try to submit and see what happens
    console.log('About to click submit button...');
    await submitBtn.click();
    
    // Wait for redirect to guest index page
    await page.waitForURL('/guest-house');
    console.log('Current URL after submit:', page.url());
    
    // Check for any error messages on the guest index page
    const errorMessages = page.locator('.text-red-600, .error, [role="alert"]');
    const errorCount = await errorMessages.count();
    console.log('Error message count:', errorCount);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorMessages.nth(i).textContent();
        console.log(`Error ${i + 1}:`, errorText);
      }
    }
  });
});
