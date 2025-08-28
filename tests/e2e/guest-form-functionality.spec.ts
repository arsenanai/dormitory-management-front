import { test, expect } from '@playwright/test';

test.describe('Guest Form Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should display all form fields correctly', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click add guest button
    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Verify all form fields are visible
    const requiredFields = [
      '#guest-first-name',
      '#guest-last-name', 
      '#guest-phone',
      '#guest-email',
      '#guest-enter-date',
      '#guest-exit-date',
      '#guest-room',
      '#guest-purpose'
    ];

    for (const fieldId of requiredFields) {
      await expect(page.locator(fieldId)).toBeVisible();
    }

    // Verify optional fields are visible
    const optionalFields = [
      '#guest-host-name',
      '#guest-host-contact',
      '#guest-identification-type',
      '#guest-identification-number',
      '#guest-emergency-name',
      '#guest-emergency-phone',
      '#guest-wifi-username',
      '#guest-wifi-password',
      '#guest-reminder',
      '#guest-daily-rate',
      '#guest-payment-received'
    ];

    for (const fieldId of optionalFields) {
      await expect(page.locator(fieldId)).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Try to submit without filling required fields
    await page.click('button:has-text("Submit")');

    // Should stay on the form page (validation prevents submission)
    await expect(page).toHaveURL(/guest-form/);
  });

  test('should populate form fields with test data', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Fill all fields with test data
    const testData = {
      '#guest-first-name': 'John',
      '#guest-last-name': 'Doe',
      '#guest-phone': '+1234567890',
      '#guest-email': 'johndoe@example.com',
      '#guest-enter-date': '2024-12-25',
      '#guest-exit-date': '2024-12-30',
      '#guest-purpose': 'Business trip',
      '#guest-host-name': 'Business Host',
      '#guest-host-contact': '+0987654321',
      '#guest-identification-number': 'ID123456',
      '#guest-emergency-name': 'Emergency Contact',
      '#guest-emergency-phone': '+1122334455',
      '#guest-wifi-username': 'johndoe',
      '#guest-wifi-password': 'securepass',
      '#guest-reminder': 'VIP guest - special attention required',
      '#guest-daily-rate': '75.50',
      '#guest-payment-received': '150.00'
    };

    // Fill text inputs
    for (const [fieldId, value] of Object.entries(testData)) {
      if (fieldId !== '#guest-room' && fieldId !== '#guest-identification-type') {
        await page.fill(fieldId, value);
      }
    }

    // Select dropdown options
    await page.selectOption('#guest-room', 'A210');
    await page.selectOption('#guest-identification-type', 'passport');

    // Verify all fields have the correct values
    for (const [fieldId, expectedValue] of Object.entries(testData)) {
      if (fieldId !== '#guest-room' && fieldId !== '#guest-identification-type') {
        await expect(page.locator(fieldId)).toHaveValue(expectedValue);
      }
    }

    // Verify dropdown selections
    await expect(page.locator('#guest-room')).toHaveValue('A210');
    await expect(page.locator('#guest-identification-type')).toHaveValue('passport');
  });

  test('should handle form submission successfully', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Fill required fields
    await page.fill('#guest-first-name', 'Jane');
    await page.fill('#guest-last-name', 'Smith');
    await page.fill('#guest-phone', '+1111111111');
    await page.fill('#guest-email', 'janesmith@example.com');
    await page.fill('#guest-enter-date', '2024-12-26');
    await page.fill('#guest-exit-date', '2024-12-31');
    await page.selectOption('#guest-room', 'A211');
    await page.fill('#guest-purpose', 'Family visit');

    // Submit form
    await page.click('button:has-text("Submit")');
    
    // Should redirect to guest list page
    await page.waitForURL('/guest-house');
    
    // Verify success message or guest appears in list
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('should handle edit mode correctly', async ({ page }) => {
    // First create a guest
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click edit button for first guest
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForURL(/guest-form/);

    // Verify form is in edit mode (should have existing data)
    await expect(page.locator('#guest-first-name')).toBeVisible();
    
    // Modify some fields
    await page.fill('#guest-first-name', 'Updated Name');
    await page.fill('#guest-purpose', 'Updated purpose');

    // Submit changes
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/guest-house');

    // Verify changes were saved
    await expect(page.getByText('Updated Name')).toBeVisible();
  });
});
