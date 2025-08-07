import { test, expect } from '@playwright/test';

test.describe('Admin Form Page Debug', () => {
  test('should debug page content for admin form', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', 'admin2@email.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Navigate to admin form for ID 32
    await page.goto('/admin-form/32');
    await page.waitForLoadState('networkidle');

    // Wait a bit for the page to load
    await page.waitForTimeout(3000);

    // Check the current URL
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check if there's any content on the page
    const bodyText = await page.textContent('body');
    console.log(`📝 Body text (first 500 chars): ${bodyText?.substring(0, 500)}`);

    // Check for specific elements
    const formExists = await page.locator('form').count();
    console.log(`📝 Form exists: ${formExists > 0}`);

    const adminFormExists = await page.locator('[data-testid="admin-form"]').count();
    console.log(`📝 Admin form with data-testid exists: ${adminFormExists > 0}`);

    const h1Elements = await page.locator('h1').all();
    console.log(`📝 H1 elements found: ${h1Elements.length}`);
    for (let i = 0; i < h1Elements.length; i++) {
      const text = await h1Elements[i].textContent();
      console.log(`   H1 ${i + 1}: "${text}"`);
    }

    const h2Elements = await page.locator('h2').all();
    console.log(`📝 H2 elements found: ${h2Elements.length}`);
    for (let i = 0; i < h2Elements.length; i++) {
      const text = await h2Elements[i].textContent();
      console.log(`   H2 ${i + 1}: "${text}"`);
    }

    // Check for any input elements
    const inputElements = await page.locator('input').all();
    console.log(`📝 Input elements found: ${inputElements.length}`);
    for (let i = 0; i < Math.min(inputElements.length, 10); i++) {
      const name = await inputElements[i].getAttribute('name');
      const type = await inputElements[i].getAttribute('type');
      console.log(`   Input ${i + 1}: name="${name}" type="${type}"`);
    }

    // Check for any select elements
    const selectElements = await page.locator('select').all();
    console.log(`📝 Select elements found: ${selectElements.length}`);
    for (let i = 0; i < selectElements.length; i++) {
      const name = await selectElements[i].getAttribute('name');
      console.log(`   Select ${i + 1}: name="${name}"`);
    }

    // Check for any error messages or loading states
    const errorElements = await page.locator('[role="alert"], .error, .alert').all();
    console.log(`📝 Error/alert elements found: ${errorElements.length}`);
    for (let i = 0; i < errorElements.length; i++) {
      const text = await errorElements[i].textContent();
      console.log(`   Error ${i + 1}: "${text}"`);
    }

    // Check for loading indicators
    const loadingElements = await page.locator('.loading, [aria-busy="true"], .spinner').all();
    console.log(`📝 Loading elements found: ${loadingElements.length}`);

    // Take a screenshot
    await page.screenshot({ path: 'admin-form-debug-page.png', fullPage: true });
  });
}); 