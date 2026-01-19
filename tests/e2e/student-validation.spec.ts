import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsStudent } from './auth-helper';

test.describe('Student Registration Real-time Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the public registration page
    await page.goto('/login');
    await page.click('text=Student Registration');
  });

  test('should display IIN validation error for incorrect length', async ({ page }) => {
    // Fill in gender to enable the next step
    await page.locator('#registration-gender').selectOption('male');
    await page.click('text=Next');

    // Test IIN input
    const iinInput = page.locator('#registration-iin');

    // Enter less than 12 digits
    await iinInput.fill('12345');
    await iinInput.blur();
    await expect(page.locator('#registration-iin-validation')).toBeVisible();
    await expect(page.locator('#registration-iin-validation')).toHaveText(/12 digits/);

    // Enter more than 12 digits
    await iinInput.fill('1234567890123');
    await iinInput.blur();
    await expect(page.locator('#registration-iin-validation')).toBeVisible();
    await expect(page.locator('#registration-iin-validation')).toHaveText(/12 digits/);

    // Enter exactly 12 digits (valid)
    await iinInput.fill('123456789012');
    await iinInput.blur();
    await expect(page.locator('#registration-iin-validation')).not.toBeVisible();
  });

  test('should display email validation error for invalid format and availability', async ({ page }) => {
    // Fill in gender to enable the next step
    await page.locator('#registration-gender').selectOption('male');
    await page.click('text=Next');

    // Fill in a valid IIN to proceed
    await page.locator('#registration-iin').fill('123456789012');
    await page.locator('#registration-iin').blur();
    await expect(page.locator('#registration-iin-validation')).not.toBeVisible();

    const emailInput = page.locator('#registration-email');

    // Test invalid email format
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.locator('#registration-email-validation')).toBeVisible();
    await expect(page.locator('#registration-email-validation')).toHaveText(/Invalid email format/);

    // Test valid email format (but unavailable - mock API later)
    await emailInput.fill('test@example.com');
    await emailInput.blur();
    // At this point, CInput's internal validation should pass, and the API call is debounced.
    // We need to wait for the API call and its effect.

    // Mock API response for email availability
    await page.route('**/api/email/check-availability*', async route => {
      const email = route.request().url().split('email=')[1].split('&')[0];
      if (email === 'taken@example.com') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ is_available: false }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ is_available: true }),
        });
      }
    });

    // Enter a taken email
    await emailInput.fill('taken@example.com');
    await emailInput.blur();
    await page.waitForTimeout(600); // Wait for debounce and API call
    await expect(page.locator('#registration-email-validation')).toBeVisible();
    await expect(page.locator('#registration-email-validation')).toHaveText(/This email is already registered/);

    // Enter an available email
    await emailInput.fill('available@example.com');
    await emailInput.blur();
    await page.waitForTimeout(600); // Wait for debounce and API call
    await expect(page.locator('#registration-email-validation')).not.toBeVisible();
  });
});
