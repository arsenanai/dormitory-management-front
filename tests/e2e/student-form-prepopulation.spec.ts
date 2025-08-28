import { test, expect } from '@playwright/test';

test.describe('StudentForm prepopulation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('/');
    await page.fill('#login-email', process.env.ADMIN_EMAIL || 'admin@email.com');
    await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(main|students)/, { timeout: 15000 });
  });

  test('should prepopulate fields for existing student', async ({ page }) => {
    // Navigate to students index and pick a random student edit button
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    const editButtons = page.locator('button:has-text("Edit")');
    const buttonCount = await editButtons.count();
    if (buttonCount === 0) test.fail(true, 'No student edit buttons found on /students page');
    const pick = buttonCount > 1 ? Math.floor(Math.random() * buttonCount) : 0;
    await editButtons.nth(pick).click();
    await page.waitForURL(/\/student-form\/(\d+)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Basic identity fields
    await expect(page.locator('#student-name')).toBeVisible();
    await expect(page.locator('#student-email')).toBeVisible();
    await page.waitForFunction(() => {
      const name = (document.getElementById('student-name') as HTMLInputElement)?.value || '';
      const email = (document.getElementById('student-email') as HTMLInputElement)?.value || '';
      return name.length > 0 && email.length > 0;
    }, null, { timeout: 10000 });

    // Location fields
    await expect(page.locator('#student-country')).toBeVisible();
    await expect(page.locator('#student-region')).toBeVisible();
    await expect(page.locator('#student-city')).toBeVisible();

    // Family fields
    await expect(page.locator('#student-parent-name')).toBeVisible();
    await expect(page.locator('#student-parent-phone')).toBeVisible();
    await expect(page.locator('#student-parent-email')).toBeVisible();

    // Mentor, health
    await expect(page.locator('#student-mentor-name')).toBeVisible();
    await expect(page.locator('#student-mentor-email')).toBeVisible();
    await expect(page.locator('#student-allergies')).toBeVisible();
    await expect(page.locator('#student-violations')).toBeVisible();

    // Registration and status
    await expect(page.locator('#student-registration-date')).toBeVisible();
    // registration date should be disabled in edit mode
    await expect(page.locator('#student-registration-date')).toBeDisabled();
    await expect(page.locator('#student-status')).toBeVisible();

    // Agree to rules checkbox should be visible (may not be natively disabled)
    await expect(page.locator('#student-agree-rules')).toBeVisible();

    // Dormitory / room / bed selects visible
    await expect(page.locator('#student-dormitory')).toBeVisible();
    await expect(page.locator('#student-room')).toBeVisible();
    await expect(page.locator('#student-bed')).toBeVisible();

    // Verify form prepopulation is working by checking field values
    const originalName = await page.inputValue('#student-name');
    const originalEmail = await page.inputValue('#student-email');
    
    // These fields should have values (not empty)
    expect(originalName.length).toBeGreaterThan(0);
    expect(originalEmail.length).toBeGreaterThan(0);

    // Now test editing: fill form with new data
    const newName = `Updated ${originalName} ${Date.now()}`;
    const newEmail = `updated${Date.now()}@test.com`;
    
    await page.fill('#student-name', newName);
    await page.fill('#student-email', newEmail);
    
    // Ensure a bed is selected (required for submission)
    const bedSelect = page.locator('#student-bed');
    if (await bedSelect.count() > 0) {
      const bedOptions = await bedSelect.locator('option').all();
      if (bedOptions.length > 1) { // More than just the placeholder
        await bedSelect.selectOption({ index: 1 }); // Select first non-placeholder option
      }
    }
    
    // Submit the form
    await page.click('button:has-text("Submit")');
    
    // Wait for submission to complete and check for any errors
    await page.waitForTimeout(3000);
    
    // Check if there are any console errors
    const logs = await page.evaluate(() => {
      return window.console._logs || [];
    });
    console.log('Console logs after submission:', logs);
    
    // Navigate back to students index and force refresh
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    
    // Force a hard refresh to ensure we get the latest data
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Debug: Log all table cells to see what's actually there
    const allCells = await page.locator('td').allTextContents();
    console.log('All table cells after refresh:', allCells);
    
    // Verify the changes are reflected on the index page
    const updatedNameCell = page.locator(`td:has-text("${newName}")`);
    await expect(updatedNameCell).toBeVisible({ timeout: 15000 });
  });
});


