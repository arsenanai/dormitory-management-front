import { test, expect } from './test';

test.describe('Debug Students API Test', () => {
  test('should debug students page API calls', async ({ page }) => {
    // Enable network logging
    page.on('request', request => {
      console.log('Request:', request.method(), request.url());
    });
    
    page.on('response', async response => {
      console.log('Response:', response.status(), response.url());
      if (response.url().includes('/api/students') || response.url().includes('/api/users')) {
        try {
          const responseBody = await response.text();
          console.log('API Response Body:', responseBody);
        } catch (err) {
          console.log('Could not read response body:', err.message);
        }
      }
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
    
    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    
    console.log('Students page loaded');
    
    // Wait a bit more for any async API calls
    await page.waitForTimeout(3000);
    
    // Check what's on the page
    const bodyText = await page.textContent('body');
    console.log('Full page text:', bodyText);
    
    // Check for "No data available" message
    const noDataMessage = await page.locator('text=No data available').count();
    console.log('No data available messages found:', noDataMessage);
    
    // Check for any error messages
    const errorMessages = await page.locator('.error, .alert, [role="alert"]').count();
    console.log('Error messages found:', errorMessages);
    
    if (errorMessages > 0) {
      const errorText = await page.locator('.error, .alert, [role="alert"]').first().textContent();
      console.log('Error message:', errorText);
    }
    
    // Check for loading states
    const loadingElements = await page.locator('.loading, .spinner, [data-testid="loading"]').count();
    console.log('Loading elements found:', loadingElements);
    
    // Check for student data
    const studentData = await page.locator('text=Test Student, text=Alice Student, text=Bob Student').count();
    console.log('Student data found:', studentData);
    
    // Check for table
    const tables = await page.locator('table').count();
    console.log('Tables found:', tables);
    
    // Check for table rows
    const tableRows = await page.locator('table tbody tr').count();
    console.log('Table rows found:', tableRows);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-students-page.png' });
  });
}); 