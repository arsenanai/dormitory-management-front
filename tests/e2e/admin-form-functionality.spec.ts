import { test, expect } from '@playwright/test';

test.describe('Admin Form Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should display all form fields correctly', async ({ page }) => {
    await page.goto('/admins');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click add admin button
    await page.click('button:has-text("Add Admin")');
    await page.waitForURL(/admin-form/);

    // Verify all form fields are visible
    const requiredFields = [
      '#admin-name',
      '#admin-email',
      '#admin-password',
      '#admin-password-confirmation'
    ];

    for (const fieldId of requiredFields) {
      await expect(page.locator(fieldId)).toBeVisible();
    }

    // Verify optional fields are visible
    const optionalFields = [
      '#admin-phone',
      '#admin-dormitory'
    ];

    for (const fieldId of optionalFields) {
      await expect(page.locator(fieldId)).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admins');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Admin")');
    await page.waitForURL(/admin-form/);

    // Try to submit without filling required fields
    await page.click('button:has-text("Submit")');

    // Should stay on the form page (validation prevents submission)
    await expect(page).toHaveURL(/admin-form/);
  });

  test('should populate form fields with test data', async ({ page }) => {
    await page.goto('/admins');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Admin")');
    await page.waitForURL(/admin-form/);

    // Fill all fields with test data
    const testData = {
      '#admin-name': 'Test Admin',
      '#admin-email': 'testadmin@example.com',
      '#admin-password': 'testpassword123',
      '#admin-password-confirmation': 'testpassword123',
      '#admin-phone': '+1234567890'
    };

    // Fill all fields
    for (const [fieldId, value] of Object.entries(testData)) {
      await page.fill(fieldId, value);
    }

    // Verify all fields have the correct values
    for (const [fieldId, expectedValue] of Object.entries(testData)) {
      await expect(page.locator(fieldId)).toHaveValue(expectedValue);
    }
  });

  test('should handle form submission successfully', async ({ page }) => {
    await page.goto('/admins');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Admin")');
    await page.waitForURL(/admin-form/);

    // Fill required fields
    await page.fill('#admin-name', 'New Admin');
    await page.fill('#admin-email', 'newadmin@example.com');
    await page.fill('#admin-password', 'newpassword123');
    await page.fill('#admin-password-confirmation', 'newpassword123');

    // Submit form
    await page.click('button:has-text("Submit")');
    
    // Should redirect to admin list page
    await page.waitForURL('/admins');
    
    // Verify success message or admin appears in list
    await expect(page.getByText('New Admin')).toBeVisible();
  });

  test('should handle edit mode correctly', async ({ page }) => {
    await page.goto('/admins');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click edit button for first admin
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForURL(/admin-form/);

    // Verify form is in edit mode (should have existing data)
    await expect(page.locator('#admin-name')).toBeVisible();
    
    // Modify some fields
    await page.fill('#admin-name', 'Updated Admin Name');

    // Submit changes
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/admins');

    // Verify changes were saved
    await expect(page.getByText('Updated Admin Name')).toBeVisible();
  });
});
