import { test, expect } from './test';

test.describe('Debug Page Test', () => {
  test('should debug what is on the students page', async ({ page }) => {
    // Go to the login page first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Try to login
    const emailField = page.locator('#login-email');
    const passwordField = page.locator('#login-password');
    const loginButton = page.locator('button[type="submit"]:has-text("Login")');
    
    if (await emailField.count() > 0) {
      console.log('Found login form');
      await emailField.fill('admin@email.com');
      await passwordField.fill('supersecret');
      await loginButton.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      console.log('After login URL:', page.url());
    } else {
      console.log('No login form found');
    }
    
    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    
    console.log('Students page URL:', page.url());
    console.log('Students page title:', await page.title());
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-students-page.png' });
    
    // Check what elements are on the page
    const bodyText = await page.textContent('body');
    console.log('Body text (first 500 chars):', bodyText?.substring(0, 500));
    
    // Check for common elements
    const tables = await page.locator('table').count();
    console.log('Number of tables found:', tables);
    
    const buttons = await page.locator('button').count();
    console.log('Number of buttons found:', buttons);
    
    const addButtons = await page.locator('button:has-text("Add")').count();
    console.log('Number of Add buttons found:', addButtons);
    
    const editButtons = await page.locator('button:has-text("Edit")').count();
    console.log('Number of Edit buttons found:', editButtons);
    
    // Check for any error messages
    const errorMessages = await page.locator('.error, .alert, [role="alert"]').count();
    console.log('Number of error messages found:', errorMessages);
    
    if (errorMessages > 0) {
      const errorText = await page.locator('.error, .alert, [role="alert"]').first().textContent();
      console.log('Error message:', errorText);
    }
    
    // Check for loading states
    const loadingElements = await page.locator('.loading, .spinner, [data-testid="loading"]').count();
    console.log('Number of loading elements found:', loadingElements);
    
    // List all text content on the page
    const allText = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('All page text (first 1000 chars):', allText.substring(0, 1000));
  });
}); 