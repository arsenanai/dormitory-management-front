import { test, expect } from '@playwright/test';

test.describe('Emergency Contact Fields', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page (which is the home page)
    await page.goto('/');
  });

  test('should display emergency contact fields in student registration', async ({ page }) => {
    // Click on registration tab button
    await page.click('[data-testid="tab-registration"]');
    
    // Fill gender step
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');

    // Fill account step
    await page.fill('#registration-iin', '123456789012');
    await page.fill('#registration-email', 'test@example.com');
    await page.fill('#registration-password', 'password123');
    await page.fill('#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');

    // Fill personal details
    await page.fill('#registration-first-name', 'John');
    await page.fill('#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');

    // Fill phone numbers
    await page.fill('#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');

    // Check emergency contact step exists
    const emergencyContactStep = page.locator('[data-testid="emergency-contact-step"]');
    await expect(emergencyContactStep).toBeVisible();

    // Verify all emergency contact fields are present
    await expect(page.locator('#registration-emergency-name')).toBeVisible();
    await expect(page.locator('#registration-emergency-type')).toBeVisible();
    await expect(page.locator('#registration-emergency-phone')).toBeVisible();
    await expect(page.locator('#registration-emergency-email')).toBeVisible();

    // Verify old fields are not present
    await expect(page.locator('#registration-parent-name')).not.toBeVisible();
    await expect(page.locator('#registration-mentor-name')).not.toBeVisible();
  });

  test('should allow selecting emergency contact type', async ({ page }) => {
    // Click on registration tab button
    await page.click('[data-testid="tab-registration"]');
    
    // Navigate to emergency contact step
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');
    await page.fill('#registration-iin', '123456789012');
    await page.fill('#registration-email', 'test@example.com');
    await page.fill('#registration-password', 'password123');
    await page.fill('#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');
    await page.fill('#registration-first-name', 'John');
    await page.fill('#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');
    await page.fill('#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');

    // Check emergency contact type dropdown has correct options
    const typeSelect = page.locator('#registration-emergency-type');
    await expect(typeSelect).toBeVisible();

    const options = await typeSelect.locator('option').allTextContents();
    expect(options).toContain('Parent');
    expect(options).toContain('Guardian');
    expect(options).toContain('Other');
  });

  test('should fill emergency contact fields correctly', async ({ page }) => {
    // Click on registration tab button
    await page.click('[data-testid="tab-registration"]');
    
    // Navigate to emergency contact step
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');
    await page.fill('#registration-iin', '123456789012');
    await page.fill('#registration-email', 'test@example.com');
    await page.fill('#registration-password', 'password123');
    await page.fill('#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');
    await page.fill('#registration-first-name', 'John');
    await page.fill('#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');
    await page.fill('#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');

    // Fill emergency contact fields
    await page.fill('#registration-emergency-name', 'Jane Doe');
    await page.selectOption('#registration-emergency-type', 'parent');
    await page.fill('#registration-emergency-phone', '+77001234568');
    await page.fill('#registration-emergency-email', 'jane@example.com');

    // Verify values are set
    await expect(page.locator('#registration-emergency-name')).toHaveValue('Jane Doe');
    await expect(page.locator('#registration-emergency-type')).toHaveValue('parent');
    await expect(page.locator('#registration-emergency-phone')).toHaveValue('+77001234568');
    await expect(page.locator('#registration-emergency-email')).toHaveValue('jane@example.com');
  });
});

test.describe('Student Form Emergency Contact', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page first
    await page.goto('/');
    
    // Switch to login tab and login as admin
    await page.click('button:has-text("Login")');
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || 'admin@email.com');
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'supersecret');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/main');

    // Navigate to Students section via sidebar
    await page.click('a:has-text("Students")');
    await page.waitForURL('**/students');

    // Click on "Add Student" button to navigate to student form
    await page.click('button:has-text("Add Student")');
  });

  test('should display emergency contact fields in student form', async ({ page }) => {
    // Wait for form to load
    await page.waitForSelector('#student-emergency-name');

    // Verify all emergency contact fields are present
    await expect(page.locator('#student-emergency-name')).toBeVisible();
    await expect(page.locator('#student-emergency-type')).toBeVisible();
    await expect(page.locator('#student-emergency-phone')).toBeVisible();
    await expect(page.locator('#student-emergency-email')).toBeVisible();

    // Verify old fields are not present
    await expect(page.locator('#student-parent-name')).not.toBeVisible();
    await expect(page.locator('#student-mentor-name')).not.toBeVisible();
  });

  test('should allow editing emergency contact fields', async ({ page }) => {
    await page.waitForSelector('#student-emergency-name');

    // Fill emergency contact fields
    await page.fill('#student-emergency-name', 'Emergency Contact');
    await page.selectOption('#student-emergency-type', 'guardian');
    await page.fill('#student-emergency-phone', '+77001234569');
    await page.fill('#student-emergency-email', 'emergency@example.com');

    // Verify values are set
    await expect(page.locator('#student-emergency-name')).toHaveValue('Emergency Contact');
    await expect(page.locator('#student-emergency-type')).toHaveValue('guardian');
    await expect(page.locator('#student-emergency-phone')).toHaveValue('+77001234569');
    await expect(page.locator('#student-emergency-email')).toHaveValue('emergency@example.com');
  });
});

