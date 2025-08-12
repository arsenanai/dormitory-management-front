import { test, expect } from '@playwright/test';
import { TEST_USERS } from './test-utils';

test.describe('Dormitory Edit Form Refresh Test', () => {
  test('should load dormitory data correctly after page refresh', async ({ page }) => {
    // Login as sudo user first
    await page.goto('http://localhost:3000/');
    
    // Fill login form
    await page.fill('#login-email', TEST_USERS.superadmin.email);
    await page.fill('#login-password', TEST_USERS.superadmin.password);
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for login to complete and redirect
    await page.waitForURL('**/main');
    
    // Navigate to dormitories list
    await page.goto('http://localhost:3000/dormitories');
    await page.waitForLoadState('networkidle');
    
    // Find a dormitory to edit (look for one with an Edit button)
    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toBeVisible();
    
    // Click edit button to navigate to edit form
    await editButton.click();
    
    // Wait for edit form to load
    await page.waitForURL('**/dormitory-form/**');
    await page.waitForLoadState('networkidle');
    
    // Capture the dormitory data before refresh
    const nameBeforeRefresh = await page.locator('#dormitory-name').inputValue();
    const capacityBeforeRefresh = await page.locator('#dormitory-capacity').inputValue();
    const genderBeforeRefresh = await page.locator('#dormitory-gender').inputValue();
    
    console.log('Dormitory data before refresh:', {
      name: nameBeforeRefresh,
      capacity: capacityBeforeRefresh,
      gender: genderBeforeRefresh
    });
    
    // Verify form has data
    expect(nameBeforeRefresh).toBeTruthy();
    expect(capacityBeforeRefresh).toBeTruthy();
    expect(genderBeforeRefresh).toBeTruthy();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for form to be visible again
    await page.waitForSelector('#dormitory-name');
    
    // Capture the dormitory data after refresh
    const nameAfterRefresh = await page.locator('#dormitory-name').inputValue();
    const capacityAfterRefresh = await page.locator('#dormitory-capacity').inputValue();
    const genderAfterRefresh = await page.locator('#dormitory-gender').inputValue();
    
    console.log('Dormitory data after refresh:', {
      name: nameAfterRefresh,
      capacity: capacityAfterRefresh,
      gender: genderAfterRefresh
    });
    
    // Verify data is the same after refresh
    expect(nameAfterRefresh).toBe(nameBeforeRefresh);
    expect(capacityAfterRefresh).toBe(capacityBeforeRefresh);
    expect(genderAfterRefresh).toBe(genderBeforeRefresh);
    
    // Verify form is still in edit mode (not create mode)
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Dormitory Form');
    
    console.log('✅ Refresh test passed: Dormitory data persisted correctly after page refresh');
  });
});
