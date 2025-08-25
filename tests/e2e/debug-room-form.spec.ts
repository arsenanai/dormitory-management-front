import { test, expect } from './test';

test.describe('Debug Room Form', () => {
  test('should debug room form dormitory loading', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login
    await page.waitForURL(/\/(main|dormitories|users|rooms)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Navigate to rooms page
    await page.goto('http://localhost:3000/rooms');
    await page.waitForLoadState('networkidle');
    
    // Click Add Room button
    const addButton = page.locator('button:has-text("Add Room")');
    await addButton.click();
    
    // Should navigate to room form
    await expect(page).toHaveURL(/\/room-form$/);
    
    // Wait for form to load
    await page.waitForLoadState('networkidle');
    
    // Check console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Wait a bit to capture console logs
    await page.waitForTimeout(3000);
    
    console.log('Console logs:', consoleLogs);
    
    // Check if dormitory field exists and has a value
    const dormitoryField = page.locator('#room-dormitory');
    await expect(dormitoryField).toBeVisible();
    
    // Check the dormitory field value
    const dormitoryValue = await dormitoryField.inputValue();
    console.log('Dormitory field value:', dormitoryValue);
    
    // Check if dormitory field is readonly
    const isReadonly = await dormitoryField.getAttribute('readonly');
    console.log('Dormitory field readonly:', isReadonly);
    
    // Check if there are any loading indicators
    const loadingDormitories = page.locator('text=Loading dormitories...');
    const isLoadingDormitories = await loadingDormitories.isVisible();
    console.log('Loading dormitories visible:', isLoadingDormitories);
    
    // Check if there are any error messages
    const errorElements = page.locator('.error, .alert-danger, [role="alert"], .toast-error');
    const errorCount = await errorElements.count();
    console.log('Error elements count:', errorCount);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}:`, errorText);
      }
    }
    
    // Check room type select
    const roomTypeSelect = page.locator('#room-type');
    await expect(roomTypeSelect).toBeVisible();
    
    // Check if room type select is disabled
    const isDisabled = await roomTypeSelect.isDisabled();
    console.log('Room type select disabled:', isDisabled);
    
    // Check room type options
    const roomTypeOptions = page.locator('#room-type option');
    const optionCount = await roomTypeOptions.count();
    console.log('Room type options count:', optionCount);
    
    if (optionCount > 0) {
      for (let i = 0; i < optionCount; i++) {
        const optionText = await roomTypeOptions.nth(i).textContent();
        console.log(`Option ${i + 1}:`, optionText);
      }
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-room-form.png' });
  });
});
