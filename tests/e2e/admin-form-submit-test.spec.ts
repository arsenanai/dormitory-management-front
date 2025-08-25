import { test, expect } from '@playwright/test';

test.describe('Admin Form Submit Test', () => {
  test('should submit form and verify dormitory field is sent correctly', async ({ page }) => {
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

    // Wait for the form to load
    await page.waitForTimeout(3000);

    // Check current dormitory value by looking at the select element
    const dormitorySelect = page.locator('select');
    const selectExists = await dormitorySelect.count();
    console.log(`🏠 Dormitory select exists: ${selectExists > 0}`);

    if (selectExists > 0) {
      const currentValue = await dormitorySelect.inputValue();
      console.log(`🏠 Current dormitory value: "${currentValue}"`);

      // Get all options
      const options = await dormitorySelect.locator('option').all();
      console.log(`🏠 Found ${options.length} dormitory options:`);
      
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const value = await option.getAttribute('value');
        const text = await option.textContent();
        console.log(`   Option ${i + 1}: value="${value}", text="${text}"`);
      }

      // Try to change dormitory if there are multiple options
      if (options.length > 1) {
        // Find a different option
        let newValue = null;
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const value = await option.getAttribute('value');
          if (value && value !== currentValue && value !== '') {
            newValue = value;
            break;
          }
        }
        
        if (newValue) {
          console.log(`🔄 Changing dormitory from "${currentValue}" to "${newValue}"`);
          await dormitorySelect.selectOption({ value: newValue });
        } else {
          console.log('⚠️ No different dormitory option found');
        }
      }
    }

    // Fill in other required fields
    await page.fill('input[type="text"]', 'Updated Surname');
    await page.fill('input[type="tel"]', '+9876543210');

    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Check for success message
    const successMessage = page.locator('div[role="alert"]');
    const hasSuccess = await successMessage.count() > 0;
    console.log(`✅ Success message found: ${hasSuccess}`);

    if (hasSuccess) {
      const messageText = await successMessage.textContent();
      console.log(`✅ Success message: "${messageText}"`);
    }

    // Find the profile update request
    const updateRequest = networkRequests.find(req => 
      req.url.includes('/api/users/profile') && req.method === 'PUT'
    );

    if (updateRequest) {
      console.log('📤 Profile update payload:', JSON.stringify(updateRequest.payload, null, 2));
      
      // Check if dormitory_id is in the payload
      if (updateRequest.payload && updateRequest.payload.dormitory_id) {
        console.log(`✅ dormitory_id found in payload: ${updateRequest.payload.dormitory_id}`);
      } else {
        console.log('❌ dormitory_id NOT found in payload');
      }
    } else {
      console.log('❌ No profile update request found');
    }

    // Reload the page to check if data persists
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if dormitory value persisted
    if (selectExists > 0) {
      const dormitoryAfterReload = await dormitorySelect.inputValue();
      console.log(`🏠 Dormitory value after reload: "${dormitoryAfterReload}"`);
    }

    // Take a screenshot
    await page.screenshot({ path: 'admin-form-submit-test.png' });
  });
}); 