import { test, expect } from '@playwright/test';

test.describe('Visual Form Verification', () => {
  test('should show dormitory form without quota field', async ({ page }) => {
    // Navigate to dormitory form
    await page.goto('http://localhost:3000/dormitory-form');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify quota field is NOT present
    await expect(page.locator('#dormitory-quota')).not.toBeVisible();
    
    // Verify other fields are present
    await expect(page.locator('#dormitory-name')).toBeVisible();
    await expect(page.locator('#dormitory-capacity')).toBeVisible();
    await expect(page.locator('#dormitory-gender')).toBeVisible();
    
    console.log('✅ Dormitory form: Quota field removed successfully');
    
    // Keep browser open for visual inspection
    await page.waitForTimeout(5000);
  });

  test('should show room form with quota field', async ({ page }) => {
    // Navigate to room form
    await page.goto('http://localhost:3000/room-form');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify quota field IS present
    await expect(page.locator('#room-quota')).toBeVisible();
    
    // Verify other fields are present
    await expect(page.locator('#room-number')).toBeVisible();
    await expect(page.locator('#room-floor')).toBeVisible();
    
    console.log('✅ Room form: Quota field added successfully');
    
    // Keep browser open for visual inspection
    await page.waitForTimeout(5000);
  });

  test('should show dormitories list without quota column', async ({ page }) => {
    // Navigate to dormitories list
    await page.goto('http://localhost:3000/dormitories');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify quota column is NOT present
    await expect(page.locator('text=QUOTA')).not.toBeVisible();
    
    // Verify other columns are present
    await expect(page.locator('text=DORMITORY')).toBeVisible();
    await expect(page.locator('text=STUDENT CAPACITY')).toBeVisible();
    
    console.log('✅ Dormitories list: Quota column removed successfully');
    
    // Keep browser open for visual inspection
    await page.waitForTimeout(5000);
  });
});
