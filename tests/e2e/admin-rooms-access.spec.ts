import { test, expect } from './test';

test.describe('Admin Rooms Access', () => {
  test('admin should see rooms after dormitory assignment', async ({ page }) => {
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
    
    // Check if rooms are displayed
    const roomsTable = page.locator('table');
    await expect(roomsTable).toBeVisible();
    
    // Check for room rows (should have at least one room)
    const roomRows = page.locator('tbody tr');
    const rowCount = await roomRows.count();
    console.log('Room rows count:', rowCount);
    
    // Should have at least one room (not just header)
    expect(rowCount).toBeGreaterThan(0);
    
    // Check if Add Room button is visible
    const addButton = page.locator('button:has-text("Add Room")');
    await expect(addButton).toBeVisible();
  });

  test('admin should be able to add a new room', async ({ page }) => {
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
    
    // Wait a bit more for the form data to populate
    await page.waitForTimeout(2000);
    
    // Check if form fields are populated
    const dormitoryField = page.locator('#room-dormitory');
    await expect(dormitoryField).toBeVisible();
    
    // Dormitory field should have a value (not empty)
    const dormitoryValue = await dormitoryField.inputValue();
    console.log('Dormitory field value:', dormitoryValue);
    expect(dormitoryValue).not.toBe('');
    
    // Room type select should be enabled
    const roomTypeSelect = page.locator('#room-type');
    await expect(roomTypeSelect).toBeVisible();
    await expect(roomTypeSelect).not.toBeDisabled();
    
    // Check if room type options are available
    const roomTypeOptions = page.locator('#room-type option');
    const optionCount = await roomTypeOptions.count();
    console.log('Room type options count:', optionCount);
    expect(optionCount).toBeGreaterThan(1); // Should have more than just placeholder
  });
});
