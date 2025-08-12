import { test, expect } from '@playwright/test';

test.describe('Docker Admin Dormitory Selection Test', () => {
  test('should verify dormitory options are selectable in admin edit form', async ({ page }) => {
    console.log('🚀 Starting Docker admin dormitory selection test...');
    
    // Capture console messages for debugging
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const logMessage = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(logMessage);
      console.log(logMessage);
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      const errorMessage = `Page Error: ${error.message}`;
      pageErrors.push(errorMessage);
      console.log(errorMessage);
    });

    // Navigate to the Docker frontend
    await page.goto('http://localhost:3000/');
    console.log('📍 Navigated to Docker frontend at localhost:3000');
    
    // Wait for the login page to load
    await page.waitForSelector('#login-email', { timeout: 10000 });
    console.log('✅ Login form loaded');
    
    // Login as sudo user (superadmin)
    const adminEmail = process.env.ADMIN_EMAIL || 'sudo@email.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';
    
    console.log(`🔐 Using credentials: ${adminEmail} / ${adminPassword}`);
    
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    console.log('📝 Filled login credentials');
    
    await page.click('button[type="submit"]');
    console.log('🔘 Clicked login button');

    // Wait for navigation to dashboard
    await page.waitForURL('**/main', { timeout: 15000 });
    console.log('✅ Successfully logged in, on dashboard');

    // Wait a bit for the dashboard to fully load
    await page.waitForTimeout(2000);

    // Navigate to admins page
    console.log('📍 Navigating to admins page...');
    await page.goto('http://localhost:3000/admins');
    
    // Wait for the page to load and check what's there
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded, checking content...');
    
    // Debug: Check what's on the page
    const pageContent = await page.content();
    console.log(`📄 Page content length: ${pageContent.length}`);
    
    // Check for common elements
    const hasTable = pageContent.includes('<table');
    const hasAdmins = pageContent.includes('Admin Management');
    const hasAddButton = pageContent.includes('Add Admin');
    
    console.log(`🔍 Page analysis: table=${hasTable}, admin-management=${hasAdmins}, add-button=${hasAddButton}`);
    
    // Wait for the admins table to load with a more flexible approach
    let tableFound = false;
    try {
      await page.waitForSelector('table', { timeout: 5000 });
      tableFound = true;
      console.log('✅ Admins table found');
    } catch (error) {
      console.log('⚠️ Table not found immediately, checking for alternative content...');
      
      // Check if there are any admin-related elements
      const adminElements = page.locator('*:has-text("Admin"), *:has-text("admin")');
      const adminElementCount = await adminElements.count();
      console.log(`Found ${adminElementCount} admin-related elements`);
      
      if (adminElementCount > 0) {
        // Take a screenshot to see what's there
        await page.screenshot({ path: 'admins-page-debug.png' });
        console.log('📸 Screenshot saved as admins-page-debug.png');
      }
    }
    
    if (!tableFound) {
      // Try to find the table with a different approach
      const tableSelectors = ['table', '[data-testid="admins-table"]', '.admins-table', '#admins-table'];
      for (const selector of tableSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          console.log(`✅ Found table with selector: ${selector}`);
          tableFound = true;
          break;
        }
      }
    }
    
    if (!tableFound) {
      console.log('❌ No table found, checking page structure...');
      
      // List all elements on the page for debugging
      const allElements = await page.locator('*').all();
      console.log(`📋 Total elements on page: ${allElements.length}`);
      
      // Check for specific text content
      const pageText = await page.textContent('body');
      console.log(`📝 Page text preview: ${pageText?.substring(0, 200)}...`);
      
      throw new Error('Admins table not found - page may not be loading correctly');
    }

    // Find the first admin user and click edit
    console.log('🔍 Looking for edit buttons...');
    const editButtons = page.locator('button:has-text("Edit"), button:has-text("✏️"), [data-testid="edit-button"]');
    const editButtonCount = await editButtons.count();
    
    if (editButtonCount === 0) {
      console.log('❌ No edit buttons found, checking for alternative selectors...');
      // Try alternative selectors
      const altEditButtons = page.locator('button, a').filter({ hasText: /edit|Edit|✏️/ });
      const altCount = await altEditButtons.count();
      console.log(`Found ${altCount} alternative edit elements`);
      
      if (altCount > 0) {
        console.log('✅ Using alternative edit button');
        await altEditButtons.first().click();
      } else {
        // Take a screenshot to see what's there
        await page.screenshot({ path: 'no-edit-buttons.png' });
        console.log('📸 Screenshot saved as no-edit-buttons.png');
        throw new Error('No edit buttons found on admins page');
      }
    } else {
      console.log(`✅ Found ${editButtonCount} edit buttons`);
      await editButtons.first().click();
    }

    // Wait for navigation to admin form
    await page.waitForURL('**/admin-form/**', { timeout: 10000 });
    console.log('✅ Navigated to admin edit form');

    // Wait for the form to load
    await page.waitForSelector('#admin-name', { timeout: 10000 });
    console.log('✅ Admin form loaded');

    // Check if dormitory field exists and is visible
    const dormitoryField = page.locator('#admin-dormitory');
    const dormitoryExists = await dormitoryField.count();
    
    if (dormitoryExists === 0) {
      console.log('❌ Dormitory field not found with ID #admin-dormitory');
      
      // Check for alternative dormitory field selectors
      const altDormitoryFields = page.locator('select[name*="dormitory"], select[id*="dormitory"], [data-testid*="dormitory"]');
      const altCount = await altDormitoryFields.count();
      console.log(`Found ${altCount} alternative dormitory fields`);
      
      if (altCount > 0) {
        console.log('✅ Alternative dormitory field found');
        // Use the first alternative field
        const altField = altDormitoryFields.first();
        await testDormitorySelection(page, altField);
      } else {
        // Take a screenshot to see what's there
        await page.screenshot({ path: 'no-dormitory-field.png' });
        console.log('📸 Screenshot saved as no-dormitory-field.png');
        throw new Error('Dormitory field not found in admin form');
      }
    } else {
      console.log('✅ Dormitory field found');
      await testDormitorySelection(page, dormitoryField);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'docker-admin-dormitory-test.png' });
    console.log('📸 Screenshot saved as docker-admin-dormitory-test.png');
    
    // Log console messages and errors
    console.log('\n📊 TEST SUMMARY:');
    console.log('- Console messages captured:', consoleMessages.length);
    console.log('- Page errors captured:', pageErrors.length);
    
    if (consoleMessages.length > 0) {
      console.log('\n🔍 CONSOLE MESSAGES:');
      consoleMessages.forEach(msg => console.log(msg));
    }
    
    if (pageErrors.length > 0) {
      console.log('\n❌ PAGE ERRORS:');
      pageErrors.forEach(error => console.log(error));
    }
  });

  async function testDormitorySelection(page: any, dormitoryField: any) {
    console.log('🔍 Testing dormitory field selection...');
    
    // Wait for dormitory options to load
    await page.waitForTimeout(2000);
    
    // Check if dormitory field is enabled
    const isDisabled = await dormitoryField.isDisabled();
    console.log(`🏠 Dormitory field disabled: ${isDisabled}`);
    
    if (isDisabled) {
      console.log('❌ Dormitory field is disabled - this is the issue!');
      throw new Error('Dormitory field is disabled and not selectable');
    }
    
    // Check current value
    const currentValue = await dormitoryField.inputValue();
    console.log(`🏠 Current dormitory value: "${currentValue}"`);
    
    // Check all available options
    const options = await dormitoryField.locator('option').all();
    console.log(`🏠 Found ${options.length} dormitory options:`);
    
    if (options.length === 0) {
      console.log('❌ No dormitory options available - this is the issue!');
      throw new Error('Dormitory dropdown has no options');
    }
    
    // Log each option
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      console.log(`   Option ${i + 1}: value="${value}", text="${text}"`);
    }
    
    // Test selecting a different option (if there are multiple)
    if (options.length > 1) {
      console.log('🔄 Testing option selection...');
      
      // Get the second option value
      const secondOption = options[1];
      const secondOptionValue = await secondOption.getAttribute('value');
      const secondOptionText = await secondOption.textContent();
      
      console.log(`🔄 Selecting option: "${secondOptionText}" (value: "${secondOptionValue}")`);
      
      // Select the second option
      await dormitoryField.selectOption({ value: secondOptionValue });
      
      // Wait a bit for the selection to take effect
      await page.waitForTimeout(1000);
      
      // Verify the selection worked
      const newValue = await dormitoryField.inputValue();
      console.log(`🏠 New dormitory value after selection: "${newValue}"`);
      
      if (newValue === secondOptionValue) {
        console.log('✅ Dormitory selection working correctly!');
      } else {
        console.log('❌ Dormitory selection failed - value not updated');
        throw new Error('Dormitory selection not working');
      }
    } else {
      console.log('ℹ️ Only one dormitory option available, skipping selection test');
    }
    
    console.log('✅ Dormitory field is working correctly and selectable');
  }
});
