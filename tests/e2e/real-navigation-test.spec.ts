import { test, expect } from '@playwright/test';

test.describe('Real Navigation Test - Through Sidebar Menu', () => {
  test('should navigate through sidebar and verify quota system changes', async ({ page }) => {
    console.log('🔍 Starting real navigation test through sidebar menu...');
    
    // Step 1: Go to login page
    console.log('📱 Step 1: Navigating to login page...');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify we're on login page
    await expect(page.locator('[data-testid="tab-login"]')).toBeVisible();
    console.log('✅ Login page loaded');
    
    // Step 2: Login as admin
    console.log('🔐 Step 2: Logging in as admin...');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]');
    
    // Wait a bit to see what happens
    console.log('⏳ Waiting to see login response...');
    await page.waitForTimeout(3000);
    
    // Check current URL and page content
    console.log('🔍 Current URL:', page.url());
    console.log('🔍 Page title:', await page.title());
    
    // Check for error messages
    const errorElements = page.locator('.error, .alert, [class*="error"], [class*="alert"]');
    const errorCount = await errorElements.count();
    console.log(`🔍 Error elements found: ${errorCount}`);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`🔍 Error ${i + 1}:`, errorText);
      }
    }
    
    // Try to wait for redirect, but don't fail if it doesn't happen
    try {
      await page.waitForURL('**/main', { timeout: 10000 });
      console.log('✅ Successfully logged in and redirected to dashboard');
    } catch (error) {
      console.log('⚠️ Login redirect failed, but continuing to check current state...');
      console.log('🔍 Current URL after login attempt:', page.url());
    }
    
    // Step 3: Verify we're on dashboard
    console.log('🏠 Step 3: Verifying dashboard...');
    await expect(page.locator('text=Dashboard, text=Statistics')).toBeVisible();
    console.log('✅ Dashboard loaded');
    
    // Step 4: Navigate to Dormitories through sidebar
    console.log('🏢 Step 4: Navigating to Dormitories...');
    await page.click('text=Dormitories');
    await page.waitForURL('**/dormitories', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Dormitories page loaded');
    
    // Step 5: Verify dormitories list doesn't have quota column
    console.log('📊 Step 5: Verifying dormitories list has no quota column...');
    const quotaColumn = page.locator('text=QUOTA, th:has-text("Quota")');
    await expect(quotaColumn).not.toBeVisible();
    console.log('✅ Quota column successfully removed from dormitories list');
    
    // Step 6: Click "Add Dormitory" button
    console.log('➕ Step 6: Opening Add Dormitory form...');
    await page.click('text=Add Dormitory, button:has-text("Add"), a:has-text("Add")');
    await page.waitForURL('**/dormitory-form', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Dormitory form opened');
    
    // Step 7: Verify dormitory form doesn't have quota field
    console.log('📝 Step 7: Verifying dormitory form has no quota field...');
    const quotaField = page.locator('#dormitory-quota, input[name="quota"], label:has-text("Quota")');
    await expect(quotaField).not.toBeVisible();
    console.log('✅ Quota field successfully removed from dormitory form');
    
    // Step 8: Verify other fields are present
    console.log('🔍 Step 8: Verifying other fields are present...');
    await expect(page.locator('#dormitory-name, input[name="name"]')).toBeVisible();
    await expect(page.locator('#dormitory-capacity, input[name="capacity"]')).toBeVisible();
    console.log('✅ Name and capacity fields are present');
    
    // Step 9: Navigate to Rooms through sidebar
    console.log('🚪 Step 9: Navigating to Rooms...');
    await page.click('text=Rooms');
    await page.waitForURL('**/rooms', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Rooms page loaded');
    
    // Step 10: Click "Add Room" button
    console.log('➕ Step 10: Opening Add Room form...');
    await page.click('text=Add Room, button:has-text("Add"), a:has-text("Add")');
    await page.waitForURL('**/room-form', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Room form opened');
    
    // Step 11: Verify room form HAS quota field
    console.log('📝 Step 11: Verifying room form has quota field...');
    const roomQuotaField = page.locator('#room-quota, input[name="quota"], label:has-text("Quota")');
    await expect(roomQuotaField).toBeVisible();
    console.log('✅ Quota field successfully added to room form');
    
    // Step 12: Verify other room fields are present
    console.log('🔍 Step 12: Verifying other room fields are present...');
    await expect(page.locator('#room-number, input[name="number"]')).toBeVisible();
    await expect(page.locator('#room-floor, input[name="floor"]')).toBeVisible();
    console.log('✅ Room number and floor fields are present');
    
    // Step 13: Test quota field functionality
    console.log('🧪 Step 13: Testing quota field functionality...');
    await page.fill('#room-quota, input[name="quota"]', '4');
    const quotaInput = page.locator('#room-quota, input[name="quota"]');
    await expect(quotaInput).toHaveValue('4');
    console.log('✅ Quota field accepts and stores values correctly');
    
    console.log('🎉 All tests completed successfully! Quota system changes verified through real navigation.');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(5000);
  });
});
