import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should save all settings with all features disabled', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Enable console logging for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });

    // Turn off all feature toggles
    await page.uncheck('#card-reader-enabled');
    await page.uncheck('#onec-enabled');
    await page.uncheck('#kaspi-enabled');

    // Click save button
    const saveButton = page.locator('button:has-text("Save All Settings")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Check for success message or no error
    const errorElements = page.locator('.text-red-500, .error, [role="alert"]');
    await expect(errorElements).toHaveCount(0);

    // Verify toggles remain off after save
    await expect(page.locator('#card-reader-enabled')).not.toBeChecked();
    await expect(page.locator('#onec-enabled')).not.toBeChecked();
    await expect(page.locator('#kaspi-enabled')).not.toBeChecked();
  });

  test('should handle network requests correctly', async ({ page }) => {
    // Enable network request logging
    const requests: string[] = [];
    const responses: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/configurations/')) {
        requests.push(`${request.method()} ${request.url()}`);
        console.log('REQUEST:', request.method(), request.url(), request.postData());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/configurations/')) {
        responses.push(`${response.status()} ${response.url()}`);
        console.log('RESPONSE:', response.status(), response.url());
      }
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Turn off all toggles
    await page.uncheck('#card-reader-enabled');
    await page.uncheck('#onec-enabled');
    await page.uncheck('#kaspi-enabled');

    // Save settings
    await page.click('button:has-text("Save All Settings")');
    await page.waitForTimeout(3000);

    // Log all requests and responses
    console.log('All requests:', requests);
    console.log('All responses:', responses);

    // Should have made 3 PUT requests
    expect(requests.filter(r => r.startsWith('PUT')).length).toBeGreaterThanOrEqual(3);
  });
});
