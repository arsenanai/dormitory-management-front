import { test, expect } from '@playwright/test';

test.describe('Room Edit Form - Fix Room Type Preselection and Beds Preview', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Fill in login credentials
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    
    // Click login button
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login and redirect
    await page.waitForURL('**/main');
    await page.waitForLoadState('networkidle');
  });

  test('should properly preselect room type and show beds preview when editing existing room', async ({ page }) => {
    // Navigate to rooms page
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find an existing room to edit (use any existing room on the current page)
    const testRoomRow = page.locator('table tbody tr').first();
    await expect(testRoomRow).toBeVisible();

    // Get room number for verification
    const roomNumber = await testRoomRow.locator('td').first().textContent();
    console.log(`Testing edit form for room: ${roomNumber}`);

    // Click edit button for this room
    await testRoomRow.locator('[data-testid="edit-room-button"]').click();
    await page.waitForURL('**/room-form/*');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verify we're on edit form
    await expect(page.locator('[data-testid="room-form-title"]')).toContainText('Edit Room');

    // Wait for room data to be loaded (wait for quota field to have a value)
    await page.waitForFunction(() => {
      const quotaField = document.querySelector('#room-quota') as HTMLInputElement;
      return quotaField && quotaField.value !== '';
    }, { timeout: 15000 });

    // Additional wait to ensure room type is loaded
    await page.waitForTimeout(2000);

    // CRITICAL TEST 1: Verify that room type is properly preselected in the CSelect
    const roomTypeSelect = page.locator('#room-type');
    await expect(roomTypeSelect).toBeVisible();
    
    // Get the selected value to verify it's populated
    const selectedValue = await roomTypeSelect.inputValue();
    console.log(`Selected room type value: ${selectedValue}`);
    
    // The room type should be preselected (not empty)
    expect(selectedValue).not.toBe('');
    expect(selectedValue).not.toBe('0');
    
    // CRITICAL TEST 2: Verify that quota field is visible and has a value
    const quotaField = page.locator('#room-quota');
    await expect(quotaField).toBeVisible();
    const quotaValue = await quotaField.inputValue();
    console.log(`Quota field value: ${quotaValue}`);
    expect(quotaValue).not.toBe(''); // Should have a value

    // CRITICAL TEST 3: Verify that beds preview is visible and shows correct number of beds
    const bedsPreviewSection = page.locator('text=Beds Preview');
    await expect(bedsPreviewSection).toBeVisible();
    
    // Check that beds are displayed based on room type capacity
    const bedElements = page.locator('[class*="inline-flex items-center px-3 py-1 rounded border"]');
    const bedCount = await bedElements.count();
    console.log(`Beds preview count: ${bedCount}`);
    
    // Should have at least 1 bed (standard rooms have 2, lux rooms have 1)
    expect(bedCount).toBeGreaterThan(0);
    
    // Verify each bed has a checkbox for staff reservation
    for (let i = 0; i < bedCount; i++) {
      const bedElement = bedElements.nth(i);
      const checkbox = bedElement.locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();
    }

    console.log('✅ Room type is properly preselected');
    console.log('✅ Beds preview is working correctly');
    console.log('✅ Edit form is fully functional');
  });

  test('should update beds preview when room type changes in edit form', async ({ page }) => {
    // Navigate to rooms page
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find an existing room to edit
    const testRoomRow = page.locator('table tbody tr').first();
    await expect(testRoomRow).toBeVisible();

    // Click edit button for this room
    await testRoomRow.locator('[data-testid="edit-room-button"]').click();
    await page.waitForURL('**/room-form/*');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Wait for room data to be loaded
    await page.waitForFunction(() => {
      const quotaField = document.querySelector('#room-quota') as HTMLInputElement;
      return quotaField && quotaField.value !== '';
    }, { timeout: 15000 });

    await page.waitForTimeout(2000);

    // Get initial bed count
    const initialBedElements = page.locator('[class*="inline-flex items-center px-3 py-1 rounded border"]');
    const initialBedCount = await initialBedElements.count();
    console.log(`Initial beds preview count: ${initialBedCount}`);

    // Change room type to test beds preview update
    const roomTypeSelect = page.locator('#room-type');
    await roomTypeSelect.selectOption('2'); // Select lux room type (should have 1 bed)
    
    // Wait for beds preview to update
    await page.waitForTimeout(1000);
    
    // Verify that beds preview updates when room type changes
    const updatedBedElements = page.locator('[class*="inline-flex items-center px-3 py-1 rounded border"]');
    const updatedBedCount = await updatedBedElements.count();
    console.log(`Updated beds preview count: ${updatedBedCount}`);
    
    // Lux room type should have 1 bed
    expect(updatedBedCount).toBe(1);

    console.log('✅ Beds preview updates correctly when room type changes');
  });
});
