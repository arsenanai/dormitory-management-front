import { test, expect } from './test';

test.describe('Debug API Calls', () => {
  test('should debug API responses for rooms', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories|users|rooms)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Navigate to rooms page
    await page.goto('http://localhost:3000/rooms');
    await page.waitForLoadState('networkidle');
    
    // Wait for console logs to appear
    await page.waitForTimeout(3000);
    
    // Check console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Wait a bit more to capture all logs
    await page.waitForTimeout(2000);
    
    console.log('All console logs:', consoleLogs);
    
    // Look for specific logs about fetched data
    const roomsLog = consoleLogs.find(log => log.includes('Fetched rooms:'));
    const dormitoriesLog = consoleLogs.find(log => log.includes('Fetched dormitories:'));
    const roomTypesLog = consoleLogs.find(log => log.includes('Fetched room types:'));
    
    console.log('Rooms log:', roomsLog);
    console.log('Dormitories log:', dormitoriesLog);
    console.log('Room types log:', roomTypesLog);
    
    // Check if there are any error messages on the page
    const errorElements = page.locator('.error, .alert-danger, [role="alert"], .toast-error');
    const errorCount = await errorElements.count();
    console.log('Error elements count:', errorCount);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}:`, errorText);
      }
    }
    
    // Check the page content for debugging
    const pageContent = await page.content();
    console.log('Page contains "Loading...":', pageContent.includes('Loading...'));
    console.log('Page contains "No data available":', pageContent.includes('No data available'));
    console.log('Page contains "Fetched rooms":', pageContent.includes('Fetched rooms'));
    
    // Check if the CTable component is rendered
    const ctableElement = page.locator('[data-testid="ctable"], .ctable, table');
    const ctableCount = await ctableElement.count();
    console.log('CTable elements count:', ctableCount);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-api-calls.png' });
  });
});
