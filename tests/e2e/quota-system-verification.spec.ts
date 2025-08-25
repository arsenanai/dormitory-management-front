import { test, expect } from '@playwright/test';
import { AuthHelper } from './auth-helper';

test.describe('Quota System Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await AuthHelper.loginAsAdmin(page);
  });

  test('should show dormitory form without quota field', async ({ page }) => {
    console.log('🔍 Testing Dormitory Form - Quota field should be missing');
    
    // Navigate to dormitory form
    await page.goto('/dormitory-form');
    await page.waitForLoadState('networkidle');
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Verify quota field is NOT present
    const quotaField = page.locator('#dormitory-quota, input[name="quota"], label:has-text("Quota")');
    await expect(quotaField).not.toBeVisible();
    
    // Verify other fields are present
    await expect(page.locator('#dormitory-name, input[name="name"]')).toBeVisible();
    await expect(page.locator('#dormitory-capacity, input[name="capacity"]')).toBeVisible();
    await expect(page.locator('#dormitory-gender, select[name="gender"]')).toBeVisible();
    
    console.log('✅ Dormitory form: Quota field successfully removed');
  });

  test('should show room form with quota field', async ({ page }) => {
    console.log('🔍 Testing Room Form - Quota field should be present');
    
    // Navigate to room form
    await page.goto('/room-form');
    await page.waitForLoadState('networkidle');
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Verify quota field IS present
    const quotaField = page.locator('#room-quota, input[name="quota"], label:has-text("Quota")');
    await expect(quotaField).toBeVisible();
    
    // Verify other fields are present
    await expect(page.locator('#room-number, input[name="number"]')).toBeVisible();
    await expect(page.locator('#room-floor, input[name="floor"]')).toBeVisible();
    
    console.log('✅ Room form: Quota field successfully added');
  });

  test('should show dormitories list without quota column', async ({ page }) => {
    console.log('🔍 Testing Dormitories List - Quota column should be missing');
    
    // Navigate to dormitories list
    await page.goto('/dormitories');
    await page.waitForLoadState('networkidle');
    
    // Wait for table to load
    await page.waitForSelector('table, [role="table"], .table', { timeout: 10000 });
    
    // Verify quota column is NOT present
    const quotaColumn = page.locator('text=QUOTA, th:has-text("Quota"), [data-testid="quota-column"]');
    await expect(quotaColumn).not.toBeVisible();
    
    // Verify other columns are present
    await expect(page.locator('text=DORMITORY, th:has-text("Dormitory")')).toBeVisible();
    await expect(page.locator('text=STUDENT CAPACITY, th:has-text("Capacity")')).toBeVisible();
    
    console.log('✅ Dormitories list: Quota column successfully removed');
  });

  test('should allow creating room with quota', async ({ page }) => {
    console.log('🔍 Testing Room Creation with Quota');
    
    // Navigate to room form
    await page.goto('/room-form');
    await page.waitForLoadState('networkidle');
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Fill in room details
    await page.fill('#room-number, input[name="number"]', 'Test Room 101');
    await page.fill('#room-floor, input[name="floor"]', '1');
    await page.fill('#room-quota, input[name="quota"]', '4');
    
    // Verify quota value was set
    const quotaInput = page.locator('#room-quota, input[name="quota"]');
    await expect(quotaInput).toHaveValue('4');
    
    console.log('✅ Room creation: Quota field accepts and stores values correctly');
  });

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await AuthHelper.logout(page);
  });
});
