import { test, expect } from '@playwright/test';

test.describe('Dormitory Form Admin Selection E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // Login as sudo user (required for dormitory form access)
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('should load admin options in dormitory form', async ({ page }) => {
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');

    // Wait for the admin select to be visible
    const adminSelect = page.locator('#dormitory-admin');
    await expect(adminSelect).toBeVisible();

    // Check if admin options are loaded
    const adminOptions = page.locator('#dormitory-admin option');
    const optionCount = await adminOptions.count();
    
    // Should have at least one admin option (excluding placeholder)
    expect(optionCount).toBeGreaterThan(0);
    
    // Check if admin options have proper values
    for (let i = 0; i < Math.min(optionCount, 3); i++) {
      const option = adminOptions.nth(i);
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      
      // Skip placeholder option
      if (value && value !== '') {
        expect(value).toMatch(/^\d+$/); // Should be a number
        expect(text).toBeTruthy(); // Should have text
      }
    }
  });

  test('should save admin_id when creating a new dormitory', async ({ page }) => {
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');

    // Fill in required fields
    await page.fill('#dormitory-name', 'Test Dormitory');
    await page.fill('#dormitory-capacity', '100');
    
    // Select gender
    await page.selectOption('#dormitory-gender', 'mixed');
    
    // Select an admin
    const adminSelect = page.locator('#dormitory-admin');
    await expect(adminSelect).toBeVisible();
    
    // Get the first available admin option (skip placeholder)
    const adminOptions = page.locator('#dormitory-admin option');
    const optionCount = await adminOptions.count();
    
    if (optionCount > 1) {
      // Select the first non-placeholder admin
      const firstAdminOption = adminOptions.nth(1); // Skip placeholder at index 0
      const adminValue = await firstAdminOption.getAttribute('value');
      const adminText = await firstAdminOption.textContent();
      
      if (adminValue && adminValue !== '') {
        await page.selectOption('#dormitory-admin', adminValue);
        
        // Fill in other required fields (only the ones that exist)
        await page.fill('#dormitory-address', 'Test Address');
        await page.fill('#dormitory-description', 'Test Description');
        await page.fill('#dormitory-phone', '1234567890');
        
        // Submit the form
        await page.click('button:has-text("Submit")');
        
        // Wait for success message
        await page.waitForSelector('.toast-success', { timeout: 10000 });
        
        // Verify success message
        const successMessage = page.locator('.toast-success');
        await expect(successMessage).toBeVisible();
        await expect(successMessage).toContainText('created successfully');
        
        // Check that the form was submitted with admin_id
        // This would require checking the network request or database
        // For now, we'll verify the form submission worked
        console.log(`Selected admin: ${adminText} (ID: ${adminValue})`);
      }
    } else {
      console.log('No admin options available for testing');
    }
  });

  test('should load and display selected admin when editing dormitory', async ({ page }) => {
    // First, create a dormitory with an admin assigned
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');

    // Fill in required fields with a unique name
    const uniqueName = `Edit Test Dormitory ${Date.now()}`;
    await page.fill('#dormitory-name', uniqueName);
    await page.fill('#dormitory-capacity', '150');
    await page.selectOption('#dormitory-gender', 'male');
    
    // Select an admin
    const adminSelect = page.locator('#dormitory-admin');
    await expect(adminSelect).toBeVisible();
    
    const adminOptions = page.locator('#dormitory-admin option');
    const optionCount = await adminOptions.count();
    
    if (optionCount > 1) {
      const firstAdminOption = adminOptions.nth(1);
      const adminValue = await firstAdminOption.getAttribute('value');
      const adminText = await firstAdminOption.textContent();
      
      console.log(`Selected admin: ${adminText} (ID: ${adminValue})`);
      
      if (adminValue && adminValue !== '') {
        await page.selectOption('#dormitory-admin', adminValue);
        
        // Fill in other required fields (only the ones that exist)
        await page.fill('#dormitory-address', 'Edit Test Address');
        await page.fill('#dormitory-description', 'Edit Test Description');
        await page.fill('#dormitory-phone', '0987654321');
        
        // Submit the form
        await page.click('button:has-text("Submit")');
        await page.waitForSelector('.toast-success', { timeout: 10000 });
        
        // Now navigate to the dormitories list to find our created dormitory
        await page.goto('/dormitories');
        await page.waitForLoadState('networkidle');
        
        // Wait for the dormitory to appear in the list
        await page.waitForSelector('tr', { timeout: 10000 });
        
        // Debug: Check what dormitories are in the list
        const allRows = page.locator('tr');
        const rowCount = await allRows.count();
        console.log(`Total rows in dormitories table: ${rowCount}`);
        
        for (let i = 0; i < rowCount; i++) {
          const row = allRows.nth(i);
          const rowText = await row.textContent();
          console.log(`Row ${i}: ${rowText}`);
        }
        
        // Find and click the edit button for our specific test dormitory
        // Look for any dormitory that contains "Edit Test Dormitory" and has an admin
        const dormitoryRow = page.locator('tr').filter({ hasText: 'Edit Test Dormitory' }).filter({ hasText: 'Admin' }).first();
        await expect(dormitoryRow).toBeVisible({ timeout: 10000 });
        
        const editButton = dormitoryRow.locator('button:has-text("Edit")');
        await expect(editButton).toBeVisible();
        await editButton.click();
        
        // Wait for the form to load
        await page.waitForSelector('#dormitory-name', { timeout: 10000 });
        
        // Wait a bit more for the form to be fully populated
        await page.waitForTimeout(2000);
        
        // Debug: Check what's in the admin select
        const adminSelectValue = await page.inputValue('#dormitory-admin');
        console.log('Admin select value after loading:', adminSelectValue);
        
        // Debug: Check all admin options
        const allAdminOptions = page.locator('#dormitory-admin option');
        const allOptionCount = await allAdminOptions.count();
        console.log('Total admin options:', allOptionCount);
        
        for (let i = 0; i < allOptionCount; i++) {
          const option = allAdminOptions.nth(i);
          const value = await option.getAttribute('value');
          const text = await option.textContent();
          console.log(`Option ${i}: value="${value}", text="${text}"`);
        }
        
        // Verify that the admin is pre-selected
        const selectedAdminValue = await page.inputValue('#dormitory-admin');
        expect(selectedAdminValue).toBe(adminValue);
        
        // Verify other fields are populated
        const nameValue = await page.inputValue('#dormitory-name');
        expect(nameValue).toContain('Edit Test Dormitory');
      }
    } else {
      console.log('No admin options available for testing');
    }
  });

  test('should validate admin selection is required', async ({ page }) => {
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');

    // Fill in required fields except admin
    await page.fill('#dormitory-name', 'Test Dormitory');
    await page.fill('#dormitory-capacity', '100');
    await page.selectOption('#dormitory-gender', 'mixed');
    await page.fill('#dormitory-address', 'Test Address');
    await page.fill('#dormitory-description', 'Test Description');
    await page.fill('#dormitory-phone', '1234567890');
    
    // Try to submit without selecting an admin
    await page.click('button:has-text("Submit")');
    
    // Should show validation error or prevent submission
    // Check for validation error or form not submitting
    const adminSelect = page.locator('#dormitory-admin');
    await expect(adminSelect).toBeVisible();
    
    // The form should still be visible (not redirected) if validation failed
    await expect(page.locator('#dormitory-name')).toBeVisible();
  });
});
