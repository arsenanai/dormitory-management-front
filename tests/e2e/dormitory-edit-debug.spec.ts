import { test, expect } from '@playwright/test';
import { TEST_USERS, TestUtils } from './test-utils';

test.describe('Dormitory Edit Debug Test', () => {
  test('should debug dormitory form data loading and test data persistence', async ({ page }) => {
    // Capture all console messages and errors
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      console.log(`[CONSOLE ${msg.type().toUpperCase()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.log(`[PAGE ERROR]: ${error.message}`);
    });
    
    // Login as sudo user
    await TestUtils.login(page, 'superadmin');
    
    // Navigate to dormitories list
    await page.goto('http://localhost:3000/dormitories');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Navigated to dormitories page');
    
    // Check if we can see dormitories
    const dormitoriesTable = page.locator('table, [data-testid="dormitories-table"], .dormitories-list');
    await expect(dormitoriesTable).toBeVisible();
    
    // Find edit button for first dormitory
    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toBeVisible();
    
    console.log('✅ Found edit button');
    
    // Click edit button
    await editButton.click();
    
    // Wait for edit form to load
    await page.waitForURL(/\/dormitory-form\/\d+/);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Navigated to edit form');
    
    // Wait for form fields to be populated
    await page.waitForSelector('#dormitory-name', { timeout: 10000 });
    
    // Check form field values BEFORE making changes
    const nameField = page.locator('#dormitory-name');
    const capacityField = page.locator('#dormitory-capacity');
    const genderField = page.locator('#dormitory-gender');
    const adminField = page.locator('#dormitory-admin');
    // Note: registered, freeBeds, and rooms are now display-only fields (not input elements)
    
    // Wait a bit more for data to load
    await page.waitForTimeout(2000);
    
    const originalValues = {
      name: await nameField.inputValue(),
      capacity: await capacityField.inputValue(),
      gender: await genderField.inputValue(),
      admin: await adminField.inputValue(),
      // Note: registered, freeBeds, and rooms are display-only fields
    };
    
    console.log('Original form field values:', originalValues);
    
    // Check if fields have values
    expect(originalValues.name).toBeTruthy();
    expect(originalValues.capacity).toBeTruthy();
    expect(originalValues.gender).toBeTruthy();
    
    // For now, let's just check if the admin field exists and has options
    const adminOptions = adminField.locator('option');
    const optionCount = await adminOptions.count();
    console.log('Admin options count:', optionCount);
    
    // Check if admin field has any selected value
    if (originalValues.admin) {
      console.log('✅ Admin field has value:', originalValues.admin);
    } else {
      console.log('⚠️ Admin field is empty');
      
      // Check if there are admin options available
      if (optionCount > 1) {
        console.log('✅ Admin options are available');
        // Select the first admin option
        await adminField.selectOption({ index: 1 });
        const newAdminValue = await adminField.inputValue();
        console.log('Selected admin value:', newAdminValue);
        originalValues.admin = newAdminValue;
      } else {
        console.log('❌ No admin options available');
      }
    }
    
    // Now fill the form with DIFFERENT values to test data persistence
    // Only test STORED fields (not computed fields)
    const newValues = {
      name: `${originalValues.name} - Modified ${Date.now()}`,
      capacity: String(parseInt(originalValues.capacity) + 50),
      gender: originalValues.gender === 'male' ? 'female' : 'male',
      admin: originalValues.admin,
      // Note: registered, freeBeds, and rooms are computed fields - they should be read-only
    };
    
    console.log('New values to set (STORED fields only):', newValues);
    
    // Fill the form with new values for STORED fields only
    await nameField.clear();
    await nameField.fill(newValues.name);
    
    await capacityField.clear();
    await capacityField.fill(newValues.capacity);
    
    await genderField.selectOption(newValues.gender);
    
    // Select a different admin if available
    if (optionCount > 2) {
      await adminField.selectOption({ index: 2 });
      newValues.admin = await adminField.inputValue();
    }
    
    // Verify that computed fields are display-only (not editable inputs)
    console.log('Verifying that computed fields are display-only...');
    
    // Debug: Check what's actually on the page
    console.log('Debug: Checking what computed fields are actually rendered...');
    
    // Take a screenshot to see what's actually rendered
    await page.screenshot({ path: 'debug-form-rendering.png', fullPage: true });
    
    // Check if the old input fields still exist
    const oldRegisteredInput = page.locator('#dormitory-registered');
    const oldFreeBedsInput = page.locator('#dormitory-freeBeds');
    const oldRoomsInput = page.locator('#dormitory-rooms');
    
    const oldInputsExist = await oldRegisteredInput.count() > 0 || await oldFreeBedsInput.count() > 0 || await oldRoomsInput.count() > 0;
    
    if (oldInputsExist) {
      console.log('❌ Old input fields still exist - form template not updated');
      console.log('Registered input count:', await oldRegisteredInput.count());
      console.log('FreeBeds input count:', await oldFreeBedsInput.count());
      console.log('Rooms input count:', await oldRoomsInput.count());
    } else {
      console.log('✅ Old input fields no longer exist');
    }
    
    // Check if the new display-only elements exist
    const registeredLabel = page.locator('text=Registered Students');
    const freeBedsLabel = page.locator('text=Free Beds');
    const roomsLabel = page.locator('text=Rooms Count');
    
    const labelsExist = await registeredLabel.count() > 0 && await freeBedsLabel.count() > 0 && await roomsLabel.count() > 0;
    
    if (labelsExist) {
      console.log('✅ New display-only labels found');
    } else {
      console.log('❌ New display-only labels not found');
    }
    
    // Log the page HTML for debugging
    const pageContent = await page.content();
    console.log('Page HTML contains "Registered Students":', pageContent.includes('Registered Students'));
    console.log('Page HTML contains "Free Beds":', pageContent.includes('Free Beds'));
    console.log('Page HTML contains "Rooms Count":', pageContent.includes('Rooms Count'));
    console.log('Page HTML contains "dormitory-registered":', pageContent.includes('dormitory-registered'));
    console.log('Page HTML contains "dormitory-freeBeds":', pageContent.includes('dormitory-freeBeds'));
    console.log('Page HTML contains "dormitory-rooms":', pageContent.includes('dormitory-rooms'));
    
    console.log('✅ Form filled with new values');
    
    // Verify the new values are set for STORED fields only
    const currentValues = {
      name: await nameField.inputValue(),
      capacity: await capacityField.inputValue(),
      gender: await genderField.inputValue(),
      admin: await adminField.inputValue(),
      // Computed fields are read-only, so we don't verify their values
    };
    
    console.log('Current form values after filling (STORED fields only):', currentValues);
    
    // Verify changes were applied to STORED fields only
    expect(currentValues.name).toBe(newValues.name);
    expect(currentValues.capacity).toBe(newValues.capacity);
    expect(currentValues.gender).toBe(newValues.gender);
    // Note: registered, freeBeds, and rooms are computed fields - they should remain unchanged
    
    // Now submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit")');
    await expect(submitButton).toBeVisible();
    
    console.log('✅ Submitting form...');
    await submitButton.click();
    
    // Wait for submission to complete
    await page.waitForLoadState('networkidle');
    
    // Wait a moment for the submission to process
    await page.waitForTimeout(3000);
    
    console.log('✅ Form submitted, checking for success...');
    
    // Check for success message or redirect
    try {
      const successMessage = page.locator('.toast-success, .alert-success, [role="alert"]:has-text("success"), .success-message');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
      console.log('✅ Success message displayed');
    } catch {
      console.log('⚠️ No success message found, checking for redirect');
      try {
        await page.waitForURL(/\/dormitories/, { timeout: 5000 });
        console.log('✅ Redirected back to dormitories list');
      } catch {
        console.log('⚠️ No clear success indication found');
      }
    }
    
    // Now navigate back to the edit form to verify data persistence
    console.log('✅ Navigating back to edit form to verify data persistence...');
    
    // Go back to dormitories list
    await page.goto('http://localhost:3000/dormitories');
    await page.waitForLoadState('networkidle');
    
    // Click edit button again
    const editButton2 = page.locator('button:has-text("Edit")').first();
    await editButton2.click();
    
    // Wait for edit form to load
    await page.waitForURL(/\/dormitory-form\/\d+/);
    await page.waitForLoadState('networkidle');
    
    // Wait for form to be populated
    await page.waitForSelector('#dormitory-name', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Check the values after refresh for STORED fields only
    const refreshedValues = {
      name: await nameField.inputValue(),
      capacity: await capacityField.inputValue(),
      gender: await genderField.inputValue(),
      admin: await adminField.inputValue(),
      // Computed fields are read-only and calculated by backend
    };
    
    console.log('Refreshed form values (STORED fields only):', refreshedValues);
    
    // Check if changes persisted for STORED fields only
    if (refreshedValues.name === newValues.name) {
      console.log('✅ Name change persisted after refresh');
    } else {
      console.log('❌ Name change did NOT persist after refresh');
      console.log('Expected:', newValues.name, 'Got:', refreshedValues.name);
    }
    
    if (refreshedValues.capacity === newValues.capacity) {
      console.log('✅ Capacity change persisted after refresh');
    } else {
      console.log('❌ Capacity change did NOT persist after refresh');
      console.log('Expected:', newValues.capacity, 'Got:', refreshedValues.capacity);
    }
    
    if (refreshedValues.gender === newValues.gender) {
      console.log('✅ Gender change persisted after refresh');
    } else {
      console.log('❌ Gender change did NOT persist after refresh');
      console.log('Expected:', newValues.gender, 'Got:', refreshedValues.gender);
    }
    
    // Note: registered, freeBeds, and rooms are computed fields
    // They are calculated by the backend based on actual rooms and beds data
    // They should NOT be editable and will always show the current calculated values
    console.log('ℹ️ Computed fields (registered, freeBeds, rooms) are read-only and calculated by backend');
    
    // Log all console messages and errors
    console.log('\n=== ALL CONSOLE MESSAGES ===');
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg}`);
    });
    
    console.log('\n=== ALL CONSOLE ERRORS ===');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('No console errors found');
    }
    
    console.log('✅ Debug test completed');
  });
});
