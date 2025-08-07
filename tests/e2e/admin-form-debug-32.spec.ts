import { test, expect } from '@playwright/test';

test.describe('Admin Form Debug for Admin ID 32', () => {
  test('should debug admin form data loading for admin ID 32', async ({ page }) => {
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
    await page.goto('http://localhost:5173/');

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

    // Log raw API response for admin ID 32
    const apiResponse = networkRequests.find(req => req.url.includes('/api/users/profile') && req.method === 'GET' && req.status === 200);
    if (apiResponse) {
      console.log('📥 Raw API response for admin ID 32:', JSON.stringify(apiResponse.response, null, 2));
    }

    // Check if there's an admin service call for ID 32
    const adminServiceResponse = networkRequests.find(req => req.url.includes('/api/admins/32') && req.method === 'GET' && req.status === 200);
    if (adminServiceResponse) {
      console.log('📥 Admin service response for ID 32:', JSON.stringify(adminServiceResponse.response, null, 2));
    }

    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'admin-form-debug-32.png' });

    // Log all network requests for debugging
    console.log('🔍 All network requests:');
    networkRequests.forEach((req, index) => {
      if (req.url.includes('/api/')) {
        console.log(`${index + 1}. ${req.method} ${req.url} - Status: ${req.status}`);
        if (req.response) {
          console.log(`   Response: ${JSON.stringify(req.response, null, 2)}`);
        }
      }
    });

    // Wait a bit to ensure all data is loaded
    await page.waitForTimeout(2000);

    // Check form field values
    const surnameValue = await page.inputValue('input[name="surname"]');
    const dormitoryValue = await page.inputValue('select[name="dormitory"]');
    const phoneValue = await page.inputValue('input[name="phone_numbers[0]"]');

    console.log('📝 Form field values:');
    console.log(`   Surname: "${surnameValue}"`);
    console.log(`   Dormitory: "${dormitoryValue}"`);
    console.log(`   Phone: "${phoneValue}"`);

    // Check if dormitory select has options
    const dormitoryOptions = await page.locator('select[name="dormitory"] option').all();
    console.log(`🏠 Dormitory select has ${dormitoryOptions.length} options`);
    for (let i = 0; i < dormitoryOptions.length; i++) {
      const option = dormitoryOptions[i];
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      console.log(`   Option ${i + 1}: value="${value}", text="${text}"`);
    }
  });
}); 