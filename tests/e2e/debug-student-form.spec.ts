import { test, expect } from '@playwright/test';

test.describe('Debug Student Form', () => {
  test('should debug student form page', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log('🔍 Console:', msg.text());
    });

    // Login as admin
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });

    // Navigate to student form page directly
    await page.goto('/student-form');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(3000);
    
    // Check if the page loaded
    const pageTitle = await page.textContent('span.text-lg.font-bold.text-primary-700');
    console.log('📄 Page title:', pageTitle);
    
    // Check for form container
    const formContainer = page.locator('.grid.grid-cols-1.gap-8');
    const formCount = await formContainer.count();
    console.log('📝 Form container count:', formCount);
    
    if (formCount > 0) {
      const formVisible = await formContainer.isVisible();
      console.log('👁️ Form container visible:', formVisible);
      
      // Check for specific form fields
      const nameField = page.locator('#student-name');
      const nameFieldCount = await nameField.count();
      console.log('📝 Name field count:', nameFieldCount);
      
      if (nameFieldCount > 0) {
        const nameFieldVisible = await nameField.isVisible();
        console.log('👁️ Name field visible:', nameFieldVisible);
      }
    }
    
    // Check for loading state
    const loadingElements = await page.locator('text=Loading').count();
    console.log('⏳ Loading elements:', loadingElements);
    
    // Check for error messages
    const errorElements = await page.locator('text=Failed to load').count();
    console.log('❌ Error elements:', errorElements);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'debug-student-form.png', fullPage: true });
    
    // The test should pass regardless of the current state
    expect(pageTitle).toBe('Student page');
  });
});
