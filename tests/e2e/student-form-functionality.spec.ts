import { test, expect } from '@playwright/test';

test.describe('Student Form Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should display all form fields correctly', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click add student button
    await page.click('button:has-text("Add Student")');
    await page.waitForURL(/student-form/);

    // Verify all form fields are visible
    const requiredFields = [
      '#student-name',
      '#student-email',
      '#student-password',
      '#student-password-confirmation'
    ];

    for (const fieldId of requiredFields) {
      await expect(page.locator(fieldId)).toBeVisible();
    }

    // Verify optional fields are visible
    const optionalFields = [
      '#student-phone',
      '#student-dormitory',
      '#student-room',
      '#student-bed',
      '#student-faculty',
      '#student-enrollment-year',
      '#student-country',
      '#student-region',
      '#student-city',
      '#student-father-name',
      '#student-mother-name',
      '#student-father-phone',
      '#student-mother-phone',
      '#student-parent-email',
      '#student-mentor-name',
      '#student-mentor-email',
      '#student-allergies',
      '#student-violations',
      '#student-status'
    ];

    for (const fieldId of optionalFields) {
      await expect(page.locator(fieldId)).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Student")');
    await page.waitForURL(/student-form/);

    // Try to submit without filling required fields
    await page.click('button:has-text("Submit")');

    // Should stay on the form page (validation prevents submission)
    await expect(page).toHaveURL(/student-form/);
  });

  test('should populate form fields with test data', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Student")');
    await page.waitForURL(/student-form/);

    // Fill all fields with test data
    const testData = {
      '#student-name': 'Test Student',
      '#student-email': 'teststudent@example.com',
      '#student-password': 'testpassword123',
      '#student-password-confirmation': 'testpassword123',
      '#student-phone': '+1234567890',
      '#student-faculty': 'Computer Science',
      '#student-enrollment-year': '2024',
      '#student-country': 'Kazakhstan',
      '#student-region': 'Almaty',
      '#student-city': 'Almaty',
      '#student-father-name': 'Father Name',
      '#student-mother-name': 'Mother Name',
      '#student-father-phone': '+0987654321',
      '#student-mother-phone': '+1122334455',
      '#student-parent-email': 'parents@example.com',
      '#student-mentor-name': 'Mentor Name',
      '#student-mentor-email': 'mentor@example.com',
      '#student-allergies': 'None',
      '#student-violations': 'None',
      '#student-status': 'Active'
    };

    // Fill text inputs
    for (const [fieldId, value] of Object.entries(testData)) {
      if (fieldId !== '#student-dormitory' && fieldId !== '#student-room' && fieldId !== '#student-bed') {
        await page.fill(fieldId, value);
      }
    }

    // Select dropdown options (if available)
    try {
      await page.selectOption('#student-dormitory', '1');
    } catch (e) {
      // Dormitory might be read-only
    }

    try {
      await page.selectOption('#student-room', '1');
    } catch (e) {
      // Room might not be available yet
    }

    try {
      await page.selectOption('#student-bed', '1');
    } catch (e) {
      // Bed might not be available yet
    }

    // Verify all fields have the correct values
    for (const [fieldId, expectedValue] of Object.entries(testData)) {
      if (fieldId !== '#student-dormitory' && fieldId !== '#student-room' && fieldId !== '#student-bed') {
        await expect(page.locator(fieldId)).toHaveValue(expectedValue);
      }
    }
  });

  test('should handle form submission successfully', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Student")');
    await page.waitForURL(/student-form/);

    // Fill required fields
    await page.fill('#student-name', 'New Student');
    await page.fill('#student-email', 'newstudent@example.com');
    await page.fill('#student-password', 'newpassword123');
    await page.fill('#student-password-confirmation', 'newpassword123');

    // Submit form
    await page.click('button:has-text("Submit")');
    
    // Should redirect to student list page
    await page.waitForURL('/students');
    
    // Verify success message or student appears in list
    await expect(page.getByText('New Student')).toBeVisible();
  });

  test('should handle edit mode correctly', async ({ page }) => {
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click edit button for first student
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForURL(/student-form/);

    // Wait for form to load
    await page.waitForTimeout(3000);

    // Verify form is in edit mode (should have existing data)
    await expect(page.locator('#student-name')).toBeVisible();
    
    // Modify some fields
    await page.fill('#student-name', 'Updated Student Name');
    await page.fill('#student-faculty', 'Updated Faculty');

    // Submit changes
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/students');

    // Verify changes were saved
    await expect(page.getByText('Updated Student Name')).toBeVisible();
  });
});
