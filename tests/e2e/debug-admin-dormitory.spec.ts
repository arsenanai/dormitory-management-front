import { test, expect } from './test';

test.describe('Debug Admin Dormitory', () => {
  test('should check admin dormitory assignment', async ({ page }) => {
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
    
    // Check console for any errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Wait a bit to capture console logs
    await page.waitForTimeout(2000);
    
    console.log('Console logs:', consoleLogs);
    
    // Check the page content
    const pageContent = await page.content();
    console.log('Page contains "A Block":', pageContent.includes('A Block'));
    console.log('Page contains "Test":', pageContent.includes('Test'));
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-admin-dormitory.png' });
    
    // Check if there are any rooms displayed
    const roomRows = page.locator('tbody tr');
    const rowCount = await roomRows.count();
    console.log('Room rows count:', rowCount);
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const rowText = await roomRows.nth(i).textContent();
        console.log(`Row ${i + 1}:`, rowText);
      }
    }
  });
});
