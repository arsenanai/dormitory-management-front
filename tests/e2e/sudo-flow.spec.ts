import { test, expect } from '@playwright/test';

// Sudo flow: creates dormitory, room type, room, assigns admin
// Assumes admin@email.com has sudo privileges

test.describe('Sudo Flow: Setup Dormitory/Rooms/Admins', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('create dormitory, room type, room and assign admin', async ({ page }) => {
    // Create Dormitory
    await page.goto('/dormitories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click Add Dormitory button using text content
    await page.click('button:has-text("Add Dormitory")');
    await page.waitForURL(/\/dormitory-form/);
    
    // Fill dormitory form
    await page.fill('#dormitory-name', 'A Block');
    await page.fill('#dormitory-capacity', '300');
    await page.click('button:has-text("Save")');
    
    // Wait for redirect and verify
    await page.waitForURL(/\/dormitories/);
    await expect(page.getByText('A Block')).toBeVisible();

    // Create Room Type
    await page.goto('/room-types');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Add Room Type")');
    await page.waitForURL(/room-type-basic/);
    
    await page.fill('#room-type-name', 'Standard');
    await page.fill('#room-type-capacity', '2');
    await page.fill('#room-type-price', '100');
    await page.click('button:has-text("Save")');
    
    // Wait for redirect and verify
    await page.waitForURL(/\/room-types/);
    await expect(page.getByText('Standard')).toBeVisible();

    // Create Room
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Add Room")');
    await page.waitForURL(/room-form/);
    
    await page.fill('#room-number', 'A101');
    await page.fill('#room-floor', '1');
    await page.click('button:has-text("Save")');
    
    // Wait for redirect and verify
    await page.waitForURL(/\/rooms/);
    await expect(page.getByText('A101')).toBeVisible();

    // Assign Admin (navigate to Admins and set dormitory for an admin)
    await page.goto('/admins');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click first edit button
    const firstEdit = page.locator('button:has-text("Edit")').first();
    await firstEdit.click();
    await page.waitForURL(/admin-form/);

    // Select dormitory (if present)
    const dormSelect = page.locator('#admin-dormitory');
    if (await dormSelect.count()) {
      await dormSelect.click();
      // pick first option if exists
      const option = page.locator('div[role="option"]').first();
      if (await option.count()) await option.click();
    }

    await page.click('button:has-text("Submit")');
    await expect(page).toHaveURL(/\/admins/);
  });
});
