import { test, expect } from '@playwright/test';

test.describe('Admin Form Dormitory Selection Test', () => {
  test('should verify dormitory field is selectable in admin form', async ({ page }) => {
    console.log('🚀 Starting admin form dormitory selection test...');
    
    // Navigate directly to the Docker frontend
    await page.goto('http://localhost:3000/');
    console.log('📍 Navigated to frontend');
    
    // Wait for login form and login as sudo user
    await page.waitForSelector('#login-email', { timeout: 10000 });
    
    const adminEmail = process.env.ADMIN_EMAIL || 'sudo@email.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'supersecret';
    
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/main', { timeout: 15000 });
    console.log('✅ Logged in successfully');
    
    // Wait for dashboard to load
    await page.waitForTimeout(2000);
    
    // Navigate directly to admin form for editing (using a known admin ID)
    // We'll try ID 1 first (System Administrator)
    await page.goto('http://localhost:3000/admin-form/1');
    console.log('📍 Navigated directly to admin form for ID 1');
    
    // Wait for the form to load
    await page.waitForSelector('#admin-name', { timeout: 15000 });
    console.log('✅ Admin form loaded');
    
    // Wait a bit more for all data to load
    await page.waitForTimeout(3000);
    
    // Check if dormitory field exists
    const dormitoryField = page.locator('#admin-dormitory');
    const dormitoryExists = await dormitoryField.count();
    
    if (dormitoryExists === 0) {
      console.log('❌ Dormitory field not found with ID #admin-dormitory');
      
      // Take screenshot to see what's there
      await page.screenshot({ path: 'admin-form-no-dormitory.png' });
      console.log('📸 Screenshot saved as admin-form-no-dormitory.png');
      
      // Check for alternative dormitory field selectors
      const altSelectors = [
        'select[name*="dormitory"]',
        'select[id*="dormitory"]',
        '[data-testid*="dormitory"]',
        'select:has-text("Dormitory")',
        'label:has-text("Dormitory") + select'
      ];
      
      let altField = null;
      for (const selector of altSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          console.log(`✅ Found dormitory field with selector: ${selector}`);
          altField = element;
          break;
        }
      }
      
      if (!altField) {
        // List all form elements to see what's available
        const formElements = await page.locator('form *').all();
        console.log(`📝 Found ${formElements.length} form elements`);
        
        for (let i = 0; i < Math.min(formElements.length, 10); i++) {
          const element = formElements[i];
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          const name = await element.getAttribute('name');
          const id = await element.getAttribute('id');
          const text = await element.textContent();
          console.log(`   Element ${i + 1}: ${tagName} name="${name}" id="${id}" text="${text?.substring(0, 30)}"`);
        }
        
        throw new Error('Dormitory field not found in admin form');
      }
      
      // Test the alternative field
      await testDormitorySelection(page, altField);
    } else {
      console.log('✅ Dormitory field found');
      await testDormitorySelection(page, dormitoryField);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'admin-form-dormitory-test-complete.png' });
    console.log('📸 Test completed, screenshot saved');
  });
  
  test('should verify dormitory options are loaded from API', async ({ page }) => {
    console.log('🚀 Starting dormitory API loading test...');
    
    // Navigate to frontend
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('#login-email', { timeout: 10000 });
    
    // Login
    const adminEmail = process.env.ADMIN_EMAIL || 'sudo@email.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';
    
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/main', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Go to admin form
    await page.goto('http://localhost:3000/admin-form/1');
    await page.waitForSelector('#admin-name', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Check if dormitory field has options
    const dormitoryField = page.locator('#admin-dormitory');
    if (await dormitoryField.count() > 0) {
      const options = await dormitoryField.locator('option').all();
      console.log(`🏠 Dormitory field has ${options.length} options`);
      
      if (options.length > 0) {
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const value = await option.getAttribute('value');
          const text = await option.textContent();
          console.log(`   Option ${i + 1}: value="${value}", text="${text}"`);
        }
        
        // Test if we can select an option
        if (options.length > 1) {
          const secondOption = options[1];
          const secondOptionValue = await secondOption.getAttribute('value');
          
          await dormitoryField.selectOption({ value: secondOptionValue });
          await page.waitForTimeout(1000);
          
          const newValue = await dormitoryField.inputValue();
          if (newValue === secondOptionValue) {
            console.log('✅ Dormitory selection working correctly');
          } else {
            console.log('❌ Dormitory selection failed');
            throw new Error('Dormitory selection not working');
          }
        }
      } else {
        console.log('❌ No dormitory options available');
        throw new Error('Dormitory dropdown has no options');
      }
    } else {
      console.log('❌ Dormitory field not found');
      throw new Error('Dormitory field not found');
    }
  });
});

async function testDormitorySelection(page: any, dormitoryField: any) {
  console.log('🔍 Testing dormitory field selection...');
  
  // Check if field is enabled
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
    
    const secondOption = options[1];
    const secondOptionValue = await secondOption.getAttribute('value');
    const secondOptionText = await secondOption.textContent();
    
    console.log(`🔄 Selecting option: "${secondOptionText}" (value: "${secondOptionValue}")`);
    
    await dormitoryField.selectOption({ value: secondOptionValue });
    await page.waitForTimeout(1000);
    
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
