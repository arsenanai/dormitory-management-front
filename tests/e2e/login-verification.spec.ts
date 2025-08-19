import { test, expect } from '@playwright/test';

test.describe('Login Verification', () => {
  test('should display login form and allow input', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if login form elements are visible
    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-password');
    const loginButton = page.locator('button[type="submit"]:has-text("Login")');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Try to fill in the form
    await emailInput.fill('sudo@email.com');
    await passwordInput.fill('supersecret');
    
    // Verify the values were filled
    await expect(emailInput).toHaveValue('sudo@email.com');
    await expect(passwordInput).toHaveValue('supersecret');
    
    console.log('✅ Login form is working correctly');
  });

  test('should attempt login and handle response', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Fill in credentials
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    
    // Click login button
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait a bit for the request to complete
    await page.waitForTimeout(3000);
    
    // Check if we got redirected or if there's an error message
    const currentURL = page.url();
    console.log(`Current URL after login attempt: ${currentURL}`);
    
    // Look for any error messages or success indicators
    const errorMessage = page.locator('.error, .alert, .toast, [role="alert"]');
    const successIndicator = page.locator('h1, h2, .dashboard, .main-content');
    
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.first().textContent();
      console.log(`Error message found: ${errorText}`);
    }
    
    if (await successIndicator.count() > 0) {
      const successText = await successIndicator.first().textContent();
      console.log(`Success indicator found: ${successIndicator}`);
    }
    
    console.log('✅ Login attempt completed');
  });

  test('should check form submission and console logs', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      console.log('Console:', msg.text());
    });
    
    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.log('Page Error:', error.message);
    });
    
    // Fill in credentials and submit
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    
    console.log('About to click login button...');
    await page.click('button[type="submit"]:has-text("Login")');
    console.log('Login button clicked');
    
    // Wait a bit and check for any activity
    await page.waitForTimeout(5000);
    
    console.log('Console messages:', consoleMessages);
    console.log('Page errors:', pageErrors);
    
    // Check if the form was actually submitted
    const form = page.locator('form');
    if (await form.count() > 0) {
      const formAction = await form.first().getAttribute('action');
      const formMethod = await form.first().getAttribute('method');
      console.log(`Form action: ${formAction}, method: ${formMethod}`);
    }
    
    console.log('✅ Form submission test completed');
  });
});
