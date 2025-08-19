import { test, expect } from '@playwright/test';

test.describe('Project Review Notes Verification', () => {
  test('should load the main page and display basic elements', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/SDU Dormitory/);
    
    // Check that the app container exists
    await expect(page.locator('#app')).toBeVisible();
    
    // Wait a bit for Vue to render
    await page.waitForTimeout(2000);
    
    // Check if login form elements are present (basic functionality)
    const loginForm = page.locator('form, [data-testid="login-form"]');
    if (await loginForm.count() > 0) {
      console.log('Login form found - basic authentication UI is working');
    } else {
      console.log('No login form found - checking for other UI elements');
    }
    
    // Check if there are any Vue components rendered
    const vueElements = page.locator('[data-v-], .vue-component, .v-application');
    if (await vueElements.count() > 0) {
      console.log('Vue.js components are rendering');
    } else {
      console.log('No Vue.js components detected yet');
    }
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'verification-test-screenshot.png' });
    
    console.log('Basic page verification completed');
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check that the app container exists and is visible
    await expect(page.locator('#app')).toBeVisible();
    
    // Check that scripts are loaded (at least some)
    const scripts = page.locator('script[type="module"]');
    const scriptCount = await scripts.count();
    expect(scriptCount).toBeGreaterThanOrEqual(3); // Should have at least 3 module scripts
    
    console.log(`Page structure verification completed - found ${scriptCount} module scripts`);
  });
});
