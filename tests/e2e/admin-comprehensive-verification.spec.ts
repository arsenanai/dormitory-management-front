import { test, expect } from './test';

// Test data
const uniqueEmail = () => `testadmin+${Date.now()}@sdu.edu.kz`;
const adminTestUser = {
  email: uniqueEmail(),
  name: 'Test Admin Verification',
  surname: 'Test Surname',
  password: 'TestPassword123',
  phone: '+7 777 123 4567',
  office_phone: '+7 777 987 6543'
};

test.describe('Admin Comprehensive Verification E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as sudo user (needed for admin management)
    await page.goto('http://localhost:3000/');
    
    // Add console logging to debug login process
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for login to complete and redirect
    try {
      await page.waitForURL(/\/(main|dormitories|admins)/, { timeout: 15000 });
      console.log('✅ Login successful, redirected to:', page.url());
    } catch (error) {
      console.log('❌ Login timeout, current URL:', page.url());
      // Check if we're still on login page or if there's an error
      const currentURL = page.url();
      if (currentURL.includes('/login') || currentURL === 'http://localhost:3000/') {
        // Check for error messages
        const errorElement = page.locator('.error, .alert-danger, [role="alert"], .toast');
        if (await errorElement.count() > 0) {
          const errorText = await errorElement.first().textContent();
          console.log('❌ Login error:', errorText);
        }
        throw new Error('Login failed - still on login page');
      }
    }
    
    // Navigate to admins page
    await page.goto('http://localhost:3000/admins');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to admins page:', page.url());
  });

  test('should create admin, verify in database, and display in index page', async ({ page }) => {
    // Step 1: Navigate to add admin form
    await page.click('[data-testid="add-admin-button"]');
    await expect(page).toHaveURL(/\/admin-form$/);
    
    // Step 2: Fill the admin form
    await page.fill('#admin-name', adminTestUser.name);
    await page.fill('#admin-surname', adminTestUser.surname);
    await page.fill('#admin-email', adminTestUser.email);
    await page.fill('#admin-password', adminTestUser.password);
    await page.fill('#admin-confirm-password', adminTestUser.password);
    await page.fill('#admin-phone', adminTestUser.phone);
    await page.fill('#admin-office-phone', adminTestUser.office_phone);
    
    // Step 3: Submit the form
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Step 4: Wait for redirect to admins index page
    await page.waitForURL(/\/admins/, { timeout: 10000 });
    
    // Step 5: Verify the new admin appears in the table
    await expect(page.locator(`tr:has-text("${adminTestUser.email}")`)).toBeVisible({ timeout: 5000 });
    
    // Step 6: Verify all the data is displayed correctly
    const adminRow = page.locator(`tr:has-text("${adminTestUser.email}")`);
    await expect(adminRow).toContainText(adminTestUser.name);
    await expect(adminRow).toContainText(adminTestUser.surname);
    await expect(adminRow).toContainText(adminTestUser.email);
    
    // Step 7: Verify the admin can be edited
    await adminRow.locator('button:has-text("Edit")').click();
    await expect(page).toHaveURL(/\/admin-form\/\d+/);
    
    // Step 8: Verify form is populated with correct data
    await expect(page.locator('#admin-name')).toHaveValue(adminTestUser.name);
    await expect(page.locator('#admin-surname')).toHaveValue(adminTestUser.surname);
    await expect(page.locator('#admin-email')).toHaveValue(adminTestUser.email);
    await expect(page.locator('#admin-phone')).toHaveValue(adminTestUser.phone);
    await expect(page.locator('#admin-office-phone')).toHaveValue(adminTestUser.office_phone);
    
    // Step 9: Go back to admins index page
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Step 10: Verify admin is still visible in the table
    await expect(page.locator(`tr:has-text("${adminTestUser.email}")`)).toBeVisible();
    
    console.log('✅ Admin creation, database verification, and index page display test completed successfully');
  });

  test('should handle admin form validation correctly', async ({ page }) => {
    // Navigate to add admin form
    await page.click('[data-testid="add-admin-button"]');
    await expect(page).toHaveURL(/\/admin-form$/);
    
    // Try to submit empty form - should show phone number error
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Check for phone number validation error (this is the only client-side validation)
    await expect(page.locator('.toast, [role="alert"], .alert, .error').first()).toContainText('At least one phone number is required');
    
    // Fill only name and try to submit - should still show phone number error
    await page.fill('#admin-name', 'Test Name');
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Should still show phone number validation error
    await expect(page.locator('.toast, [role="alert"], .alert, .error').first()).toContainText('At least one phone number is required');
    
    console.log('✅ Admin form validation test completed successfully');
  });

  test('should delete admin and verify removal from index page', async ({ page }) => {
    // Set up dialog handler before any actions
    page.on('dialog', dialog => dialog.accept());
    
    // First create an admin to delete
    await page.click('[data-testid="add-admin-button"]');
    const timestamp = Date.now();
    const adminEmail = `deleteadmin+${timestamp}@sdu.edu.kz`;
    
    await page.fill('#admin-name', 'Admin To Delete');
    await page.fill('#admin-surname', 'Delete Surname');
    await page.fill('#admin-email', adminEmail);
    await page.fill('#admin-password', 'TestPassword123');
    await page.fill('#admin-confirm-password', 'TestPassword123');
    await page.fill('#admin-phone', '+7 777 111 1111');
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Wait for redirect and verify admin was created
    await page.waitForURL(/\/admins/, { timeout: 10000 });
    await expect(page.locator(`tr:has-text("${adminEmail}")`)).toBeVisible({ timeout: 5000 });
    
    // Now delete the admin
    const adminRow = page.locator(`tr:has-text("${adminEmail}")`);
    await adminRow.locator('button:has-text("Delete")').click();
    
    // Wait for the deletion to complete and table to refresh
    await page.waitForLoadState('networkidle');
    
    // Verify admin is removed from the table
    await expect(page.locator(`tr:has-text("${adminEmail}")`)).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Admin deletion and index page verification test completed successfully');
  });
});
