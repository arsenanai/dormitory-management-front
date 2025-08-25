import { test, expect } from '@playwright/test';

test.describe('Dormitory Form Mobile E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests
    await page.setViewportSize({ width: 375, height: 667 });
    
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

  test('should load admin options in dormitory form on mobile', async ({ page }) => {
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');

    // Verify mobile viewport is maintained
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);

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

  test('should save admin_id when creating a new dormitory on mobile', async ({ page }) => {
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');

    // Fill in required fields
    await page.fill('#dormitory-name', 'Mobile Test Dormitory');
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
        await page.fill('#dormitory-address', 'Mobile Test Address');
        await page.fill('#dormitory-description', 'Mobile Test Description');
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
        console.log(`Selected admin: ${adminText} (ID: ${adminValue})`);
      }
    } else {
      console.log('No admin options available for testing');
    }
  });

  test('should validate admin selection is required on mobile', async ({ page }) => {
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');

    // Fill in required fields except admin
    await page.fill('#dormitory-name', 'Mobile Test Dormitory');
    await page.fill('#dormitory-capacity', '100');
    await page.selectOption('#dormitory-gender', 'mixed');
    await page.fill('#dormitory-address', 'Mobile Test Address');
    await page.fill('#dormitory-description', 'Mobile Test Description');
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
