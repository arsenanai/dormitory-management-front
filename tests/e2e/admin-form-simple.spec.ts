import { test, expect } from '@playwright/test';

test.describe('Admin Form Simple Test', () => {
  test('should load and fill admin form without unnecessary fields', async ({ page }) => {
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
    
    // 2. Test admin form
    await page.goto('/admin-form');
    await page.waitForSelector('#admin-name', { timeout: 10000 });
    console.log('✅ Admin form loaded');
    
    // Verify that the unnecessary fields are NOT present
    await expect(page.locator('#admin-position')).not.toBeVisible();
    await expect(page.locator('#admin-department')).not.toBeVisible();
    await expect(page.locator('#admin-office-location')).not.toBeVisible();
    console.log('✅ Unnecessary fields (position, department, office location) are not visible');
    
    // Verify that the necessary fields ARE present
    await expect(page.locator('#admin-name')).toBeVisible();
    await expect(page.locator('#admin-surname')).toBeVisible();
    await expect(page.locator('#admin-email')).toBeVisible();
    await expect(page.locator('#admin-phone')).toBeVisible();
    await expect(page.locator('#admin-office-phone')).toBeVisible();
    console.log('✅ All necessary fields are visible');
    
    // Test filling the form
    await page.fill('#admin-name', 'Test Admin');
    await page.fill('#admin-surname', 'User');
    await page.fill('#admin-email', 'testadmin@test.com');
    await page.fill('#admin-phone', '+7-777-777-7777');
    await page.fill('#admin-office-phone', '+7-777-777-7778');
    
    console.log('✅ Admin form filled successfully');
    
    // Verify the form data
    expect(await page.inputValue('#admin-name')).toBe('Test Admin');
    expect(await page.inputValue('#admin-surname')).toBe('User');
    expect(await page.inputValue('#admin-email')).toBe('testadmin@test.com');
    expect(await page.inputValue('#admin-phone')).toBe('+7-777-777-7777');
    expect(await page.inputValue('#admin-office-phone')).toBe('+7-777-777-7778');
    
    console.log('🎉 Admin form functionality verified successfully!');
  });
});
