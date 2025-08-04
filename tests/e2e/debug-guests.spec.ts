import { test, expect } from './test';

test.describe('Debug Guests Test', () => {
  test('should debug what is happening with the guests page', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log('Console Log:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });
    
    // Login first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/login')),
      page.click('button[type="submit"]:has-text("Login")')
    ]);
    
    await page.waitForTimeout(2000);
    
    // Navigate to guests page
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    
    console.log('Guests page loaded');
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(3000);
    
    // Check if table exists
    const tableExists = await page.locator('[data-testid="guests-table"]').count();
    console.log('Table exists:', tableExists > 0);
    
    // Get all text content in the table
    const tableText = await page.locator('[data-testid="guests-table"]').textContent();
    console.log('Table text content:', tableText);
    
    // Check for table rows
    const tableRows = await page.locator('[data-testid="guests-table"] table tbody tr').count();
    console.log('Number of table rows:', tableRows);
    
    // Check for "No data available" message
    const noDataMessage = await page.locator('text=No data available').count();
    console.log('No data available messages:', noDataMessage);
    
    // Check for any guest data
    const guestData = await page.locator('text=Test Guest').count();
    console.log('Guest data found:', guestData);
    
    // Check for loading state
    const loadingElements = await page.locator('.loading-text').count();
    console.log('Loading elements found:', loadingElements);
    
    // Check for error state
    const errorElements = await page.locator('.error-message').count();
    console.log('Error elements found:', errorElements);
    
    if (errorElements > 0) {
      const errorText = await page.locator('.error-message').first().textContent();
      console.log('Error message:', errorText);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-guests-page.png' });
  });
}); 