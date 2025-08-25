import { test, expect } from '@playwright/test';

test.describe('Admin Form Check for Admin ID 32', () => {
  test('should check form structure and dormitory options', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000/');

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

    // Wait a bit for the form to load
    await page.waitForTimeout(3000);

    // Check if dormitory select exists
    const dormitorySelect = page.locator('select[name="dormitory"]');
    const selectExists = await dormitorySelect.count();
    console.log(`🏠 Dormitory select exists: ${selectExists > 0}`);

    if (selectExists > 0) {
      // Check current value
      const currentValue = await dormitorySelect.inputValue();
      console.log(`🏠 Current dormitory value: "${currentValue}"`);

      // Check all options
      const options = await dormitorySelect.locator('option').all();
      console.log(`🏠 Found ${options.length} dormitory options:`);
      
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const value = await option.getAttribute('value');
        const text = await option.textContent();
        console.log(`   Option ${i + 1}: value="${value}", text="${text}"`);
      }
    } else {
      console.log('❌ Dormitory select not found');
      
      // Check what form elements exist
      const formElements = await page.locator('form *').all();
      console.log(`📝 Found ${formElements.length} form elements`);
      
      for (let i = 0; i < Math.min(formElements.length, 20); i++) {
        const element = formElements[i];
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const name = await element.getAttribute('name');
        const id = await element.getAttribute('id');
        console.log(`   Element ${i + 1}: ${tagName} name="${name}" id="${id}"`);
      }
    }

    // Take a screenshot
    await page.screenshot({ path: 'admin-form-check-32.png' });
  });
}); 