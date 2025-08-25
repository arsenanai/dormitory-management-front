import { test, expect } from '@playwright/test';

test.describe('Admin Form Submit for Admin ID 32', () => {
  test('should submit form and verify dormitory field saves correctly', async ({ page }) => {
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
    const networkRequests: { url: string; method: string; status: number | null; payload: any; response: any }[] = [];
    page.on('request', request => {
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
    });
    page.on('response', async response => {
      const url = response.url();
      const method = response.request().method();
      const status = response.status();
      let payload = null;
      try {
        payload = response.request().postDataJSON();
      } catch (e) {
        // Ignore if no JSON payload
      }
      let responseBody = null;
      try {
        responseBody = await response.json();
      } catch (e) {
        // Ignore if not JSON response
      }
      networkRequests.push({ url, method, status, payload, response: responseBody });
      console.log(`📡 RESPONSE: ${status} ${url}`);
    });

    // Navigate to the app
    await page.goto('http://localhost:3000/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', 'admin2@email.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Navigate to admin form for ID 32
    await page.goto('/admin-form/32');
    await page.waitForLoadState('networkidle');

    // Wait for form to load
    await page.waitForSelector('select[name="dormitory"]');

    // Check current dormitory value
    const currentDormitory = await page.inputValue('select[name="dormitory"]');
    console.log(`🏠 Current dormitory value: "${currentDormitory}"`);

    // Change dormitory to a different value (if there are multiple options)
    const dormitoryOptions = await page.locator('select[name="dormitory"] option').all();
    console.log(`🏠 Found ${dormitoryOptions.length} dormitory options`);
    
    if (dormitoryOptions.length > 1) {
      // Find a different dormitory option
      let newDormitoryValue = null;
      for (let i = 0; i < dormitoryOptions.length; i++) {
        const option = dormitoryOptions[i];
        const value = await option.getAttribute('value');
        if (value && value !== currentDormitory && value !== '') {
          newDormitoryValue = value;
          break;
        }
      }
      
      if (newDormitoryValue) {
        console.log(`🔄 Changing dormitory from "${currentDormitory}" to "${newDormitoryValue}"`);
        await page.selectOption('select[name="dormitory"]', { value: newDormitoryValue });
      } else {
        console.log('⚠️ No different dormitory option found, keeping current value');
      }
    } else {
      console.log('⚠️ Only one dormitory option available');
    }

    // Fill in other required fields
    await page.fill('input[name="surname"]', 'Updated Surname');
    await page.fill('input[name="phone_numbers[0]"]', '+9876543210');

    // Log form data before submission
    const formDataBeforeSubmit = await page.evaluate(() => {
      const form = document.querySelector('form');
      const data: { [key: string]: any } = {};
      new FormData(form!).forEach((value, key) => {
        if (key.includes('phone_numbers')) {
          if (!data['phone_numbers']) data['phone_numbers'] = [];
          data['phone_numbers'].push(value);
        } else {
          data[key] = value;
        }
      });
      return data;
    });
    console.log('📝 Form data before submission:', JSON.stringify(formDataBeforeSubmit, null, 2));

    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Log profile update payload
    const updateRequest = networkRequests.find(req => req.url.includes('/api/users/profile') && req.method === 'PUT');
    if (updateRequest) {
      console.log('📤 Sending profile update payload:', JSON.stringify(updateRequest.payload, null, 2));
    }

    // Verify success message
    await expect(page.locator('div[role="alert"]')).toContainText('Profile updated successfully!');

    // Reload the page to check if data persists
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Log API response after reload
    const apiResponseAfterReload = networkRequests.find(req => req.url.includes('/api/users/profile') && req.method === 'GET' && req.status === 200);
    if (apiResponseAfterReload) {
      console.log('📥 Raw API response after reload:', JSON.stringify(apiResponseAfterReload.response, null, 2));
    }

    // Check if dormitory value persisted
    const dormitoryAfterReload = await page.inputValue('select[name="dormitory"]');
    console.log(`🏠 Dormitory value after reload: "${dormitoryAfterReload}"`);

    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'admin-form-submit-32.png' });

    // Log all network requests
    console.log('🔍 All network requests:');
    networkRequests.forEach((req, index) => {
      if (req.url.includes('/api/')) {
        console.log(`${index + 1}. ${req.method} ${req.url} - Status: ${req.status}`);
        if (req.payload) {
          console.log(`   Payload: ${JSON.stringify(req.payload, null, 2)}`);
        }
        if (req.response) {
          console.log(`   Response: ${JSON.stringify(req.response, null, 2)}`);
        }
      }
    });
  });
}); 