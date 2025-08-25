import { test, expect } from './test';

test.describe('Debug Rooms Page', () => {
  test('should debug rooms page state', async ({ page }) => {
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
    
    // Debug: Check what's on the page
    console.log('Current URL:', page.url());
    
    // Check if add button exists
    const addButton = page.locator('button:has-text("Add Room")');
    const addButtonCount = await addButton.count();
    console.log('Add Room button count:', addButtonCount);
    
    if (addButtonCount > 0) {
      console.log('Add Room button is visible');
    } else {
      console.log('Add Room button NOT found');
    }
    
    // Check for any error messages
    const errorElements = page.locator('.error, .alert-danger, [role="alert"], .toast-error');
    const errorCount = await errorElements.count();
    console.log('Error elements count:', errorCount);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}:`, errorText);
      }
    }
    
    // Check for loading state
    const loadingElement = page.locator('.loading-text');
    const isLoading = await loadingElement.isVisible();
    console.log('Loading state:', isLoading);
    
    // Check for rooms table
    const roomsTable = page.locator('table');
    const tableCount = await roomsTable.count();
    console.log('Rooms table count:', tableCount);
    
    // Check for room rows
    const roomRows = page.locator('tbody tr');
    const rowCount = await roomRows.count();
    console.log('Room rows count:', rowCount);
    
    // Check page title
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check for h1
    const h1Element = page.locator('h1');
    const h1Count = await h1Element.count();
    console.log('H1 count:', h1Count);
    
    if (h1Count > 0) {
      const h1Text = await h1Element.first().textContent();
      console.log('H1 text:', h1Text);
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-rooms-page.png' });
    
    // Wait a bit to see console logs
    await page.waitForTimeout(2000);
  });
});
