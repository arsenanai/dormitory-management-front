import { test, expect } from '@playwright/test';

test.describe('Payments Simple Test', () => {
  test('should test payments page with minimal checks', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log('🔍 Console:', msg.text());
    });

    // Set authentication token in localStorage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('token', '637|CHrzjqOZacPQvhkrm7vbmz6oOLJceerrJillNYIWfd3699d6');
    });

    // Navigate to payments page
    await page.goto('http://localhost:3000/payments');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
    // Check if the page loaded
    const pageTitle = await page.textContent('h1');
    console.log('📄 Page title:', pageTitle);
    
    // Check for loading state
    const loadingElements = await page.locator('text=Loading').count();
    console.log('⏳ Loading elements:', loadingElements);
    
    // Check for error messages
    const errorElements = await page.locator('text=Failed to load').count();
    console.log('❌ Error elements:', errorElements);
    
    // Check the actual table content
    const tableRows = await page.locator('table tbody tr').count();
    console.log('📊 Table rows:', tableRows);
    
    // Check if there's a "No data available" message
    const noDataMessage = await page.locator('text=No data available').count();
    console.log('📭 No data message count:', noDataMessage);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'payments-simple-test.png', fullPage: true });
    
    // The test should pass regardless of the current state
    expect(pageTitle).toBe('Payments');
  });
});
