import { test, expect } from '@playwright/test';

test.describe('Admin Form Debug Comprehensive', () => {
  test('should debug admin form data loading and submission for admin ID 16', async ({ page }) => {
    // Capture all console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const logMessage = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(logMessage);
      console.log(logMessage); // Also log to terminal
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      const errorMessage = `Page Error: ${error.message}`;
      pageErrors.push(errorMessage);
      console.log(errorMessage);
    });

    // Capture network requests
    const networkRequests: string[] = [];
    page.on('request', request => {
      const requestInfo = `🌐 REQUEST: ${request.method()} ${request.url()}`;
      networkRequests.push(requestInfo);
      console.log(requestInfo);
    });

    page.on('response', response => {
      const responseInfo = `📡 RESPONSE: ${response.status()} ${response.url()}`;
      networkRequests.push(responseInfo);
      console.log(responseInfo);
    });

    console.log('🚀 Starting admin form debug test...');

    // Login as sudo user
    await page.goto('http://localhost:3000/');
    console.log('📍 Navigated to login page');
    
    await page.waitForSelector('#login-email', { timeout: 10000 });
    console.log('✅ Login form loaded');
    
    await page.fill('#login-email', process.env.ADMIN_EMAIL || 'sudo@sdu.edu.kz');
    await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'password');
    console.log('📝 Filled login credentials');
    
    await page.click('button[type="submit"]');
    console.log('🔘 Clicked login button');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');
    console.log('✅ Successfully logged in, on dashboard');

    // Navigate to admin form for ID 16
    await page.goto('http://localhost:3000/admin-form/16');
    console.log('📍 Navigated to admin form for ID 16');

    // Wait for the form to load
    await page.waitForSelector('#admin-name', { timeout: 10000 });
    console.log('✅ Admin form loaded');

    // Wait a bit for data to load
    await page.waitForTimeout(2000);

    // Check initial form field values
    const nameField = await page.locator('#admin-name');
    const surnameField = await page.locator('#admin-surname');
    const emailField = await page.locator('#admin-email');
    const phoneField = await page.locator('#admin-phone');
    const dormitoryField = await page.locator('#admin-dormitory');

    console.log('\n📋 INITIAL FORM FIELD VALUES:');
    console.log('- Name value:', await nameField.inputValue());
    console.log('- Surname value:', await surnameField.inputValue());
    console.log('- Email value:', await emailField.inputValue());
    console.log('- Phone value:', await phoneField.inputValue());
    console.log('- Dormitory value:', await dormitoryField.inputValue());

    // Wait a bit more to see if data loads asynchronously
    await page.waitForTimeout(3000);

    console.log('\n📋 FORM FIELD VALUES AFTER WAITING:');
    console.log('- Name value:', await nameField.inputValue());
    console.log('- Surname value:', await surnameField.inputValue());
    console.log('- Email value:', await emailField.inputValue());
    console.log('- Phone value:', await phoneField.inputValue());
    console.log('- Dormitory value:', await dormitoryField.inputValue());

    // Now let's test editing the form
    console.log('\n✏️ TESTING FORM EDITING:');
    
    // Fill in some test data
    await surnameField.fill('Test Surname');
    await phoneField.fill('+1234567890');
    await dormitoryField.selectOption({ index: 1 }); // Select first option
    
    console.log('\n📋 FORM FIELD VALUES AFTER EDITING:');
    console.log('- Name value:', await nameField.inputValue());
    console.log('- Surname value:', await surnameField.inputValue());
    console.log('- Email value:', await emailField.inputValue());
    console.log('- Phone value:', await phoneField.inputValue());
    console.log('- Dormitory value:', await dormitoryField.inputValue());

    // Submit the form
    console.log('\n📤 SUBMITTING FORM...');
    await page.click('button[type="submit"]');
    
    // Wait for submission to complete
    await page.waitForTimeout(2000);

    // Check if success message appears
    const successMessage = await page.locator('.text-green-600, .text-green-500').first();
    if (await successMessage.count() > 0) {
      console.log('✅ Success message found:', await successMessage.textContent());
    } else {
      console.log('❌ No success message found');
    }

    // Wait a bit more to capture any additional console logs
    await page.waitForTimeout(2000);

    console.log('\n📊 TEST SUMMARY:');
    console.log('- Console messages captured:', consoleMessages.length);
    console.log('- Page errors captured:', pageErrors.length);
    console.log('- Network requests captured:', networkRequests.length);

    console.log('\n🔍 CONSOLE MESSAGES:');
    consoleMessages.forEach(msg => console.log(msg));

    console.log('\n❌ PAGE ERRORS:');
    pageErrors.forEach(error => console.log(error));

    console.log('\n🌐 NETWORK REQUESTS:');
    networkRequests.forEach(req => console.log(req));

    // Take a screenshot for debugging
    await page.screenshot({ path: 'admin-form-debug-16.png' });
    console.log('📸 Screenshot saved as admin-form-debug-16.png');

    // Basic assertions
    expect(await nameField.count()).toBeGreaterThan(0);
    expect(await surnameField.count()).toBeGreaterThan(0);
    expect(await emailField.count()).toBeGreaterThan(0);
    expect(await phoneField.count()).toBeGreaterThan(0);
    expect(await dormitoryField.count()).toBeGreaterThan(0);
  });
}); 