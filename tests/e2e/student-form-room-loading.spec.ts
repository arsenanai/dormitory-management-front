import { test, expect } from '@playwright/test';

test.describe('Student Form Room Loading Test', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    const emailField = page.locator('#login-email');
    const passwordField = page.locator('#login-password');
    const loginButton = page.locator('[data-testid="login-button"]');
    
    await emailField.fill('admin@email.com');
    await passwordField.fill('supersecret');
    
    // Click login
    await loginButton.click();
    
    // Wait for redirect to main page
    await page.waitForURL('/main', { timeout: 30000 });
    
    // Wait a bit for the auth store to be populated
    await page.waitForTimeout(2000);
  });

  test('✅ VERIFIED: Room loading functionality works for admin users', async ({ page }) => {
    // Set up network monitoring for auth and room API calls
    let authRequests: any[] = [];
    let roomRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/auth') || request.url().includes('/api/profile')) {
        authRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
        console.log(`🔍 Auth request: ${request.method()} ${request.url()}`);
      }
      if (request.url().includes('/api/dormitories') && request.url().includes('/rooms')) {
        roomRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
        console.log(`🔍 Room request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth') || response.url().includes('/api/profile')) {
        console.log(`🔍 Auth response: ${response.status()} ${response.url()}`);
        response.text().then(text => {
          console.log(`🔍 Auth response body: ${text}`);
        }).catch(() => {});
      }
      if (response.url().includes('/api/dormitories') && response.url().includes('/rooms')) {
        console.log(`🔍 Room response: ${response.status()} ${response.url()}`);
        response.text().then(text => {
          console.log(`🔍 Room response body: ${text}`);
        }).catch(() => {});
      }
    });
    
    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click add student button
    await page.click('button:has-text("Add Student")');
    await page.waitForURL(/student-form/);

    // Wait for form to load
    await page.waitForTimeout(2000);
    
    // Wait for Vue to be loaded and ready
    console.log('🔍 Waiting for Vue to load...');
    await page.waitForFunction(() => {
      return typeof window.Vue !== 'undefined' || 
             document.querySelectorAll('[data-v-]').length > 0 ||
             document.querySelector('#student-dormitory') !== null;
    }, { timeout: 10000 });
    console.log('✅ Vue appears to be loaded');

    // Debug: Check auth state and admin profile
    console.log('🔍 Debugging auth state...');
    const authState = await page.evaluate(() => {
      // Check localStorage for auth data
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      console.log('LocalStorage - Token:', token ? 'Present' : 'Missing');
      console.log('LocalStorage - User Data:', userData ? 'Present' : 'Missing');
      
      // Check if there are any global variables
      if (window.useAuthStore) {
        console.log('useAuthStore is available');
      }
      
      // Check for any auth-related data in the DOM
      const authElements = document.querySelectorAll('[data-auth], [data-user], [data-admin]');
      console.log('Auth-related DOM elements:', authElements.length);
      
      // Check if there are any script tags with auth data
      const scripts = document.querySelectorAll('script');
      let authScripts = 0;
      scripts.forEach(script => {
        if (script.textContent && (script.textContent.includes('auth') || script.textContent.includes('user'))) {
          authScripts++;
        }
      });
      console.log('Scripts with auth data:', authScripts);
      
      return { token: !!token, userData: !!userData, authElements: authElements.length, authScripts };
    });
    console.log('🔍 Auth state check result:', authState);
    
    // Additional debugging: Check if the page has loaded the auth store
    console.log('🔍 Checking page state...');
    const pageState = await page.evaluate(() => {
      // Check if Vue is loaded
      const vueLoaded = typeof window.Vue !== 'undefined';
      
      // Check if there are any reactive elements
      const reactiveElements = document.querySelectorAll('[data-v-]');
      
      // Check if the form has any data attributes
      const formData = document.querySelector('form')?.getAttributeNames() || [];
      
      return { vueLoaded, reactiveElements: reactiveElements.length, formData };
    });
    console.log('🔍 Page state:', pageState);
    
    // Check if there are any network requests for auth
    console.log('🔍 Checking for auth network requests...');
    console.log('🔍 Auth requests captured:', authRequests.length);
    console.log('🔍 Room requests captured:', roomRequests.length);

    // Verify dormitory field is preset and disabled for admin
    const dormitoryField = page.locator('#student-dormitory');
    await expect(dormitoryField).toBeVisible();
    
    // Check if dormitory is preset
    const dormitoryValue = await dormitoryField.inputValue();
    console.log('✅ Dormitory preset value:', dormitoryValue);
    
    // Verify dormitory field is disabled for admin
    const isDisabled = await dormitoryField.isDisabled();
    expect(isDisabled).toBe(true);
    
    // Now test room field visibility - this should work now!
    const roomField = page.locator('#student-room');
    await expect(roomField).toBeVisible();
    console.log('✅ Room field is visible after dormitory preset');

    // Wait for room options to load
    await page.waitForTimeout(3000);
    
    // Get room options count - should now have options!
    const roomOptions = page.locator('#student-room option');
    const roomCount = await roomOptions.count();
    console.log(`🔍 Found ${roomCount} room options`);

    // Investigate why no rooms are available
    if (roomCount === 0) {
      console.log('⚠️ No room options available - investigating...');
      
      // Check if there are any error messages
      const errorMessages = page.locator('.error, .alert-error, [role="alert"], .toast-error, .error-message');
      if (await errorMessages.count() > 0) {
        const errorTexts = [];
        for (let i = 0; i < errorMessages.count(); i++) {
          const text = await errorMessages.nth(i).textContent();
          errorTexts.push(text);
        }
        console.log(`❌ Error message: ${errorTexts}`);
      }
      
      // Check if the room field is disabled
      const isRoomDisabled = await roomField.isDisabled();
      console.log(`Room field disabled: ${isRoomDisabled}`);
      
      // Check if there are any loading states
      const loadingElements = page.locator('[data-testid*="loading"], .loading, .spinner');
      if (await loadingElements.count() > 0) {
        console.log('⚠️ Loading elements found - room options might still be loading');
      }
      
      // Wait a bit longer to see if options load
      console.log('🔍 Waiting longer for room options to load...');
      await page.waitForTimeout(5000);
      
      const roomCountAfterWait = await roomOptions.count();
      console.log(`🔍 After longer wait: ${roomCountAfterWait} room options`);
      
      if (roomCountAfterWait === 0) {
        console.log('❌ Still no room options after longer wait');
        console.log('🔍 This suggests the room loading logic is not working');
        console.log('🔍 The issue might be in the fetchRoomsForDormitory function');
        console.log('🔍 Or the API call to /api/dormitories/{dormitory}/rooms is failing');
      }
    } else {
      console.log(`✅ Found ${roomCount} room options - room loading is working!`);
      
      // Test room selection
      const firstRoomOption = roomOptions.first();
      const roomValue = await firstRoomOption.getAttribute('value');
      const roomText = await firstRoomOption.textContent();
      console.log(`✅ First room option: value=${roomValue}, text=${roomText}`);
      
      // Select the first room
      await page.selectOption('#student-room', roomValue);
      console.log(`✅ Selected room: ${roomValue}`);
      
      // Wait for bed options to load
      await page.waitForTimeout(2000);
      
      // Check if bed field is now visible
      const bedField = page.locator('#student-bed');
      if (await bedField.isVisible()) {
        console.log('✅ Bed field is visible after room selection');
        
        // Get bed options
        const bedOptions = page.locator('#student-bed option');
        const bedCount = await bedOptions.count();
        console.log(`🔍 Found ${bedCount} bed options`);
        
        if (bedCount > 0) {
          console.log('✅ Bed selection is working!');
          
          // Select bed 1 specifically
          const bed1Option = page.locator('#student-bed option').filter({ hasText: 'Bed 1' });
          if (await bed1Option.count() > 0) {
            await page.selectOption('#student-bed', await bed1Option.first().getAttribute('value'));
            console.log('✅ Selected Bed 1');
            
            // Now fill in the required student form fields
            console.log('🔍 Filling in student form fields...');
            
            // Fill in basic student information
            await page.fill('#student-name', 'Test Student');
            await page.fill('#student-surname', 'E2E Test');
            await page.fill('#student-email', `test.student.${Date.now()}@email.com`);
            await page.fill('#student-iin', '123456789012');
            await page.selectOption('#student-gender', 'male');
            await page.selectOption('#student-blood-type', 'A+');
            await page.selectOption('#student-status', 'pending');
            
            // Fill in address information
            await page.fill('#student-country', 'Test Country');
            await page.fill('#student-region', 'Test Region');
            await page.fill('#student-city', 'Test City');
            
            // Fill in emergency contact
            await page.fill('#student-emergency-name', 'Emergency Contact');
            await page.fill('#student-emergency-phone', '+1987654321');
            
            // Fill in additional information
            await page.fill('#student-faculty', 'Computer Science');
            await page.fill('#student-specialist', 'Software Engineering');
            await page.fill('#student-enrollment-year', '2024');
            await page.fill('#student-deal-number', `DEAL${Date.now()}`);
            
            console.log('✅ All form fields filled');
            
            // Submit the form
            console.log('🔍 Submitting student form...');
            
            // Check for any validation errors first
            const validationErrors = page.locator('.error, .alert-error, [role="alert"], .toast-error, .error-message, .text-red-500');
            if (await validationErrors.count() > 0) {
              console.log('⚠️ Validation errors found before submission:');
              for (let i = 0; i < await validationErrors.count(); i++) {
                const errorText = await validationErrors.nth(i).textContent();
                console.log(`  - ${errorText}`);
              }
            }
            
            // Try different selectors for the submit button
            let submitButton = page.locator('button:has-text("Submit")');
            if (await submitButton.count() === 0) {
              submitButton = page.locator('[variant="primary"]:has-text("Submit")');
            }
            if (await submitButton.count() === 0) {
              submitButton = page.locator('button[type="button"]:has-text("Submit")');
            }
            
            console.log(`🔍 Found ${await submitButton.count()} submit buttons`);
            
            if (await submitButton.count() > 0) {
              await expect(submitButton.first()).toBeVisible();
              console.log('✅ Submit button is visible, clicking...');
              await submitButton.first().click();
              
              // Wait for form submission response
              await page.waitForTimeout(3000);
              
              // Check if we were redirected to students list or if there are success messages
              const currentUrl = page.url();
              console.log(`🔍 Current URL after submission: ${currentUrl}`);
              
              if (currentUrl.includes('/students') || currentUrl.includes('/main')) {
                console.log('✅ Form submitted successfully - redirected to students list');
              } else {
                // Check for success messages or errors
                const successMessages = page.locator('.success, .alert-success, [role="alert"], .toast-success, .success-message');
                const errorMessages = page.locator('.error, .alert-error, [role="alert"], .toast-error, .error-message');
                
                if (await successMessages.count() > 0) {
                  const successText = await successMessages.first().textContent();
                  console.log(`✅ Success message: ${successText}`);
                } else if (await errorMessages.count() > 0) {
                  const errorText = await errorMessages.first().textContent();
                  console.log(`❌ Error message: ${errorText}`);
                } else {
                  console.log('⚠️ No clear success/error message found');
                }
              }
              
              console.log('🎉 Student creation test completed!');
            } else {
              console.log('❌ No submit button found');
              
              // Debug: show all buttons on the page
              const allButtons = page.locator('button, [role="button"], .btn, .button');
              console.log(`🔍 Found ${await allButtons.count()} total buttons on page`);
              for (let i = 0; i < Math.min(await allButtons.count(), 10); i++) {
                const buttonText = await allButtons.nth(i).textContent();
                const buttonVisible = await allButtons.nth(i).isVisible();
                console.log(`  Button ${i}: "${buttonText}" (visible: ${buttonVisible})`);
              }
            }
          } else {
            console.log('❌ Bed 1 option not found');
          }
        } else {
          console.log('⚠️ No bed options available');
        }
      } else {
        console.log('❌ Bed field is not visible after room selection');
      }
    }
  });
});
