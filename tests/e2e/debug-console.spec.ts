import { test, expect } from './test';

test.describe('Debug Console Test', () => {
  test('should debug console logs and errors', async ({ page }) => {
    const consoleLogs = [];
    const consoleErrors = [];
    
    // Listen to console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console Error:', msg.text());
      } else {
        consoleLogs.push(msg.text());
        console.log('Console Log:', msg.text());
      }
    });
    
    // Listen to page errors
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
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
    
    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    
    console.log('Students page loaded');
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(3000);
    
    // Check console logs
    console.log('Total console logs:', consoleLogs.length);
    console.log('Total console errors:', consoleErrors.length);
    
    // Check for specific logs
    const fetchLogs = consoleLogs.filter(log => log.includes('fetch') || log.includes('api') || log.includes('students'));
    console.log('Fetch/API related logs:', fetchLogs);
    
    // Check for error logs
    const errorLogs = consoleErrors.filter(error => error.includes('fetch') || error.includes('api') || error.includes('students'));
    console.log('Fetch/API related errors:', errorLogs);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-console-page.png' });
  });
}); 