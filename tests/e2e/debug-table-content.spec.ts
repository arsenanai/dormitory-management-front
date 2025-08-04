import { test, expect } from './test';

test.describe('Debug Table Content Test', () => {
  test('should debug what is actually in the students table', async ({ page }) => {
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
    
    // Wait for the table to load
    await page.waitForTimeout(3000);
    
    // Check if table exists
    const tableExists = await page.locator('[data-testid="students-table"]').count();
    console.log('Table exists:', tableExists > 0);
    
    // Get all text content in the table
    const tableText = await page.locator('[data-testid="students-table"]').textContent();
    console.log('Table text content:', tableText);
    
    // Check for table rows
    const tableRows = await page.locator('[data-testid="students-table"] table tbody tr').count();
    console.log('Number of table rows:', tableRows);
    
    // Check for "No data available" message
    const noDataMessage = await page.locator('text=No data available').count();
    console.log('No data available messages:', noDataMessage);
    
    // Check for any student names
    const studentNames = await page.locator('text=Test Student, text=Alice Student, text=Bob Student').count();
    console.log('Student names found:', studentNames);
    
    // Get all table cells
    const tableCells = await page.locator('[data-testid="students-table"] table tbody td').allTextContents();
    console.log('Table cells content:', tableCells);
    
    // Check for any text in the table
    const allTextInTable = await page.locator('[data-testid="students-table"] *').allTextContents();
    console.log('All text in table area:', allTextInTable);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-table-content.png' });
  });
}); 