import { test, expect } from './test';

test.describe('Debug Login Test', () => {
  test('should debug login process', async ({ page }) => {
    // Enable network logging
    page.on('request', request => {
      console.log('Request:', request.method(), request.url());
    });
    
    page.on('response', response => {
      console.log('Response:', response.status(), response.url());
      if (response.status() >= 400) {
        console.log('Error response body:', response.text());
      }
    });
    
    // Go to login page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('Initial URL:', page.url());
    console.log('Initial title:', await page.title());
    
    // Fill login form
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    
    // Click login and wait for response
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/login')),
      page.click('button[type="submit"]:has-text("Login")')
    ]);
    
    // Wait a bit more
    await page.waitForTimeout(2000);
    
    console.log('After login URL:', page.url());
    console.log('After login title:', await page.title());
    
    // Check if there are any error messages
    const errorElements = await page.locator('.error, .alert, [role="alert"], .toast').count();
    console.log('Error elements found:', errorElements);
    
    if (errorElements > 0) {
      const errorText = await page.locator('.error, .alert, [role="alert"], .toast').first().textContent();
      console.log('Error message:', errorText);
    }
    
    // Check localStorage for auth token
    const token = await page.evaluate(() => {
      return localStorage.getItem('auth_token') || localStorage.getItem('token');
    });
    console.log('Auth token in localStorage:', token ? 'Present' : 'Not found');
    
    // Check if login was successful (URL should be /main, not /)
    if (page.url() === 'http://localhost:5173/main') {
      console.log('Login successful - redirected to dashboard');
      
      // Navigate to students page
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      console.log('After navigation to /students URL:', page.url());
      console.log('After navigation to /students title:', await page.title());
      
      // Check if we can access the students page
      if (page.url() === 'http://localhost:5173/students') {
        console.log('Successfully accessed students page');
        
        // Check what's on the students page
        const bodyText = await page.textContent('body');
        console.log('Students page body text (first 500 chars):', bodyText?.substring(0, 500));
        
        // Check for common elements
        const tables = await page.locator('table').count();
        console.log('Number of tables found:', tables);
        
        const buttons = await page.locator('button').count();
        console.log('Number of buttons found:', buttons);
        
        const addButtons = await page.locator('button:has-text("Add")').count();
        console.log('Number of Add buttons found:', addButtons);
        
        const editButtons = await page.locator('button:has-text("Edit")').count();
        console.log('Number of Edit buttons found:', editButtons);
        
        // Check for student data
        const studentData = await page.locator('text=Test Student, text=Alice Student, text=Bob Student').count();
        console.log('Student data found:', studentData);
        
      } else {
        console.log('Failed to access students page - redirected to:', page.url());
      }
    } else {
      console.log('Login failed - still on login page');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-login-result.png' });
  });
}); 