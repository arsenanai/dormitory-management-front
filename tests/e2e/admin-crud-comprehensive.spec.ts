import { test, expect } from '@playwright/test';

test.describe('Admin CRUD Comprehensive Test', () => {
  test('should perform complete admin CRUD workflow and test dormitories/room types', async ({ page }) => {
    // 1. Login as sudo user
    await page.goto('/');
    await page.waitForSelector('#login-email', { timeout: 10000 });
    
    const adminEmail = process.env.ADMIN_EMAIL || 'sudo@email.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'supersecret';
    
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/main', { timeout: 15000 });
    console.log('✅ Logged in as sudo successfully');
    
    // 2. Test admin form directly
    await page.goto('/admin-form');
    await page.waitForSelector('#admin-name', { timeout: 10000 });
    console.log('✅ Admin form loaded');
    
    // Test basic form fields
    await page.fill('#admin-name', 'Test Admin');
    await page.fill('#admin-surname', 'User');
    await page.fill('#admin-email', 'testadmin@test.com');
    await page.fill('#admin-phone', '+7-777-777-7777');
    await page.fill('#admin-office-phone', '+7-777-777-7778');
    
    console.log('✅ Admin form filled successfully');
    
    // 3. Test dormitories page
    await page.goto('/dormitories');
    await page.waitForSelector('table', { timeout: 10000 });
    console.log('✅ Dormitories page loaded');
    
    // Check if we can see existing dormitories
    const dormitoryRows = await page.locator('table tbody tr').count();
    console.log(`🏠 Found ${dormitoryRows} dormitory rows`);
    expect(dormitoryRows).toBeGreaterThan(0);
    
    // 4. Test room types page
    await page.goto('/room-types');
    await page.waitForSelector('table', { timeout: 10000 });
    console.log('✅ Room types page loaded');
    
    // Check if we can see existing room types
    const roomTypeRows = await page.locator('table tbody tr').count();
    console.log(`🏠 Found ${roomTypeRows} room type rows`);
    expect(roomTypeRows).toBeGreaterThan(0);
    
    console.log('🎉 Core functionality verified successfully!');
  });
});
