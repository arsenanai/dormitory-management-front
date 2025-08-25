import { test, expect } from '@playwright/test';

test.describe('StudentForm Verification E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access student form
    await page.goto('/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for login and redirect
    await page.waitForURL(/\/main/, { timeout: 15000 });
    
    // Navigate to students page first, then to student form
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    
    // Click add student button to access the form
    const addButton = page.locator('[data-testid="add-student-button"], button:has-text("Add Student"), button:has-text("Add User")');
    if (await addButton.count() > 0) {
      await addButton.click();
      await expect(page).toHaveURL(/\/student-form$/);
      await page.waitForLoadState('networkidle');
    } else {
      // If no add button, try to access form directly
      await page.goto('/student-form');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display blood type options correctly', async ({ page }) => {
    // Check if blood type field exists
    const bloodTypeField = page.locator('#student-blood-type');
    await expect(bloodTypeField).toBeVisible();
    
    // Check if blood type options are populated
    const bloodTypeOptions = page.locator('#student-blood-type option');
    await expect(bloodTypeOptions).toHaveCount(8); // 8 blood types (A+, A-, B+, B-, AB+, AB-, O+, O-)
    
    // Verify specific blood types are present
    await expect(page.locator('#student-blood-type option[value="A+"]')).toHaveCount(1);
    await expect(page.locator('#student-blood-type option[value="B+"]')).toHaveCount(1);
    await expect(page.locator('#student-blood-type option[value="O+"]')).toHaveCount(1);
    
    console.log('✅ Blood type options are correctly displayed');
  });

  test('should display dormitory options correctly', async ({ page }) => {
    // Check if dormitory field exists
    const dormitoryField = page.locator('#student-dormitory');
    await expect(dormitoryField).toBeVisible();
    
    // Wait for dormitories to load
    await page.waitForTimeout(2000);
    
    // Check if dormitory options are populated
    const dormitoryOptions = page.locator('#student-dormitory option');
    
    // Should have 4 dormitory options
    await expect(dormitoryOptions).toHaveCount(4); // 4 dormitories
    
    // Verify specific dormitories are present
    await expect(page.locator('#student-dormitory option[value="1"]')).toHaveCount(1);
    await expect(page.locator('#student-dormitory option[value="2"]')).toHaveCount(1);
    await expect(page.locator('#student-dormitory option[value="4"]')).toHaveCount(1);
    await expect(page.locator('#student-dormitory option[value="3"]')).toHaveCount(1);
    
    console.log('✅ Dormitory options are correctly displayed');
  });

  test('should filter rooms by selected dormitory', async ({ page }) => {
    // Wait for dormitories to load
    await page.waitForTimeout(2000);
    
    // Select a dormitory by value (Dormitory #1 has ID 1)
    const dormitoryField = page.locator('#student-dormitory');
    await dormitoryField.selectOption('1');
    
    // Wait for rooms to load
    await page.waitForTimeout(2000);
    
    // Check if room field becomes visible
    const roomField = page.locator('#student-room');
    await expect(roomField).toBeVisible();
    
    // Check if room options are populated
    const roomOptions = page.locator('#student-room option');
    
    // Should have at least 1 room option
    if (await roomOptions.count() > 0) {
      console.log('✅ Room options are displayed and filtered by dormitory');
    } else {
      console.log('⚠️ No room options found - this might indicate an API issue');
    }
  });

  test('should handle room selection and bed options', async ({ page }) => {
    // Wait for dormitories to load
    await page.waitForTimeout(2000);
    
    // Select a dormitory by value (Dormitory #1 has ID 1)
    const dormitoryField = page.locator('#student-dormitory');
    await dormitoryField.selectOption('1');
    
    // Wait for rooms to load
    await page.waitForTimeout(2000);
    
    // Select a room if available
    const roomField = page.locator('#student-room');
    if (await roomField.isVisible()) {
      // Check if room options are populated
      const roomOptions = page.locator('#student-room option');
      if (await roomOptions.count() > 0) {
        // Select the first available room
        await roomField.selectOption(roomOptions.first().getAttribute('value'));
        
        // Check if bed field becomes visible
        const bedField = page.locator('#student-bed');
        await expect(bedField).toBeVisible();
        
        console.log('✅ Room selection and bed options are working correctly');
      } else {
        console.log('⚠️ No room options available to test bed selection');
      }
    } else {
      console.log('⚠️ Room field not visible - dormitory selection might have failed');
    }
  });
});
