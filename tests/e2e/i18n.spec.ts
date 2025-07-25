import { test, expect } from './test';

const languageOptions = [
  { value: 'en', label: 'English', expectedText: 'Dashboard' },
  { value: 'kk', label: 'Қазақша', expectedText: 'Басты бет' }, // Replace with actual translation
  { value: 'ru', label: 'Русский', expectedText: 'Главная' },   // Replace with actual translation
];

test.describe('i18n Language Switcher E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', process.env.ADMIN_EMAIL!);
    await page.fill('#login-password', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/main/, { timeout: 15000 });
  });

  for (const lang of languageOptions) {
    test(`should update UI text when switching to ${lang.label}`, async ({ page }) => {
      await page.selectOption('#language-switcher', lang.value);
      // Wait for UI to update
      await page.waitForTimeout(500);
      // Check for expected translated text on the dashboard/main page
      await expect(page.locator('h1, h2')).toContainText([lang.expectedText]);
    });
  }

  test('should fallback to default locale if translation is missing', async ({ page }) => {
    // Simulate by switching to a non-existent locale
    await page.selectOption('#language-switcher', 'fr');
    await page.waitForTimeout(500);
    // Should fallback to English (or configured fallback)
    await expect(page.locator('h1, h2')).toContainText(['Dashboard']);
  });
}); 