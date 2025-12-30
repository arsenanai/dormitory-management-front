import { test, expect } from '@playwright/test';

// Helper function for human-like pauses with longer duration for visibility
const humanLikePause = async (page: any) => {
  // Always pause for visual testing, but make it longer
  await page.waitForTimeout(1000); // 1 second pause for better visibility
};

// Helper function for human-like typing simulation
const humanLikeType = async (page: any, selector: string, text: string) => {
  // Try multiple possible selectors for login forms
  const possibleSelectors = [
    selector,
    '#login-email',
    '#email',
    'input[name="email"]',
    'input[type="email"]'
  ];
  
  let foundSelector = selector;
  for (const possibleSelector of possibleSelectors) {
    if (await page.locator(possibleSelector).count() > 0) {
      foundSelector = possibleSelector;
      break;
    }
  }
  
  await page.focus(foundSelector);
  await page.waitForTimeout(500); // Pause before typing
  
  // Type each character with small delays to simulate human typing
  for (let i = 0; i < text.length; i++) {
    await page.keyboard.type(text[i]);
    await page.waitForTimeout(50); // Small delay between characters
  }
  
  await page.waitForTimeout(300); // Pause after typing
};

// Helper function for human-like select interaction (simplified to avoid scroll issues)
const humanLikeSelect = async (page: any, selector: string, value: string) => {
  await page.focus(selector);
  await page.waitForTimeout(300); // Shorter pause before clicking
  
  // Click to open dropdown
  await page.click(selector);
  await page.waitForTimeout(200); // Wait for dropdown to open
  
  // Select the option without additional clicks that might cause scroll
  await page.selectOption(selector, value);
  await page.waitForTimeout(300); // Pause after selection
};

test.describe('Identification Fields', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page (which is the home page)
    await page.goto('/');
  });

  test('should display identification fields in student registration emergency contact step', async ({ page }) => {
    // Click on registration tab button with pause
    await page.click('[data-testid="tab-registration"]');
    await page.waitForTimeout(1000); // Pause to see the tab click
    
    // Fill gender step
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500); // Pause after gender step

    // Fill account step with human-like typing
    await humanLikeType(page, '#registration-iin', '123456789012');
    await humanLikeType(page, '#registration-email', 'test@example.com');
    await humanLikeType(page, '#registration-password', 'password123');
    await humanLikeType(page, '#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500); // Pause after account step

    // Fill personal details with human-like typing
    await humanLikeType(page, '#registration-first-name', 'John');
    await humanLikeType(page, '#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500); // Pause after personal details

    // Fill phone numbers with human-like typing
    await humanLikeType(page, '#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000); // Pause before emergency contact step

    // Check identification fields are present in emergency contact step
    const identificationTypeField = page.locator('#registration-identification-type');
    await expect(identificationTypeField).toBeVisible();
    await identificationTypeField.scrollIntoViewIfNeeded();
    await identificationTypeField.evaluate((el: any) => el.style.border = '3px solid blue'); // Highlight field
    await humanLikePause(page);
    
    const identificationNumberField = page.locator('#registration-identification-number');
    await expect(identificationNumberField).toBeVisible();
    await identificationNumberField.scrollIntoViewIfNeeded();
    await identificationNumberField.evaluate((el: any) => el.style.border = '3px solid blue'); // Highlight field
    await humanLikePause(page);

    // Verify identification type options are available
    const identificationTypeOptions = await page.locator('#registration-identification-type option').allTextContents();
    expect(identificationTypeOptions).toContain('Passport');
    expect(identificationTypeOptions).toContain('National ID');
    expect(identificationTypeOptions).toContain("Driver's License");
    expect(identificationTypeOptions).toContain('Other');
    await humanLikePause(page);
  });

  test('should fill identification fields correctly in registration', async ({ page }) => {
    // Click on registration tab button with pause
    await page.click('[data-testid="tab-registration"]');
    await page.waitForTimeout(1000); // Pause to see the tab click
    
    // Navigate to emergency contact step quickly (skip human-like typing for this test)
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await page.fill('#registration-iin', '123456789012');
    await page.fill('#registration-email', 'test@example.com');
    await page.fill('#registration-password', 'password123');
    await page.fill('#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await page.fill('#registration-first-name', 'John');
    await page.fill('#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await page.fill('#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);

    // Fill identification fields with human-like interaction
    await humanLikeSelect(page, '#registration-identification-type', 'passport');
    await humanLikePause(page);
    await humanLikeType(page, '#registration-identification-number', 'A123456789');
    await humanLikePause(page);

    // Verify identification field values
    await expect(page.locator('#registration-identification-type')).toHaveValue('passport');
    await humanLikePause(page);
    await expect(page.locator('#registration-identification-number')).toHaveValue('A123456789');
    await humanLikePause(page);
  });

  test('should display identification fields in student form', async ({ page }) => {
    // Login as admin using the login form on home page
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Click on registration tab to access login form
    await page.click('[data-testid="tab-login"]');
    await page.waitForTimeout(500);
    
    // Fill login credentials
    await humanLikeType(page, '#email', 'admin@example.com');
    await humanLikeType(page, '#password', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Use sidebar navigation to go to students page
    await expect(page.locator('nav a[href="/students"]')).toBeVisible();
    await page.click('nav a[href="/students"]');
    await page.waitForTimeout(1000);

    // Click add student button
    await page.click('button:has-text("Add Student")');
    await page.waitForTimeout(1000);

    // Check identification fields are present in student form
    const identificationTypeField = page.locator('#student-identification-type');
    await expect(identificationTypeField).toBeVisible();
    await identificationTypeField.scrollIntoViewIfNeeded();
    await identificationTypeField.evaluate((el: any) => el.style.border = '3px solid green'); // Highlight field
    await humanLikePause(page);
    
    const identificationNumberField = page.locator('#student-identification-number');
    await expect(identificationNumberField).toBeVisible();
    await identificationNumberField.scrollIntoViewIfNeeded();
    await identificationNumberField.evaluate((el: any) => el.style.border = '3px solid green'); // Highlight field
    await humanLikePause(page);

    // Verify identification type options are available
    const identificationTypeOptions = await page.locator('#student-identification-type option').allTextContents();
    expect(identificationTypeOptions).toContain('Passport');
    expect(identificationTypeOptions).toContain('National ID');
    expect(identificationTypeOptions).toContain("Driver's License");
    expect(identificationTypeOptions).toContain('Other');
    await humanLikePause(page);
  });

  test('should fill identification fields correctly in student form', async ({ page }) => {
    // Login as admin using the login form on home page
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Click on registration tab to access login form
    await page.click('[data-testid="tab-login"]');
    await page.waitForTimeout(500);
    
    // Fill login credentials
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Wait for navigation to dashboard
    await page.waitForURL('/main');

    // Use sidebar navigation to go to students page
    await expect(page.locator('nav a[href="/students"]')).toBeVisible();
    await page.click('nav a[href="/students"]');
    await page.waitForTimeout(1000);

    // Click add student button
    await page.click('button:has-text("Add Student")');
    await page.waitForTimeout(1000);

    // Fill identification fields
    await humanLikeSelect(page, '#student-identification-type', 'national_id');
    await humanLikePause(page);
    await humanLikeType(page, '#student-identification-number', '123456789012');
    await humanLikePause(page);

    // Verify identification field values
    await expect(page.locator('#student-identification-type')).toHaveValue('national_id');
    await humanLikePause(page);
    await expect(page.locator('#student-identification-number')).toHaveValue('123456789012');
    await humanLikePause(page);
  });

  test('should validate identification fields as required in registration', async ({ page }) => {
    // Click on registration tab button
    await page.click('[data-testid="tab-registration"]');
    await page.waitForTimeout(1000);
    
    // Fill all steps up to emergency contact
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await page.fill('#registration-iin', '123456789012');
    await page.fill('#registration-email', 'test@example.com');
    await page.fill('#registration-password', 'password123');
    await page.fill('#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await page.fill('#registration-first-name', 'John');
    await page.fill('#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await page.fill('#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);

    // Try to proceed without filling identification fields
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Check if validation prevents proceeding (step should remain on emergency contact)
    const currentStepText = await page.locator('.stepper-item.active').textContent();
    expect(currentStepText).toContain('Emergency Contact'); // Should still be on emergency contact step
    await humanLikePause(page);

    // Now fill identification fields and verify validation passes
    await humanLikeSelect(page, '#registration-identification-type', 'passport');
    await humanLikeType(page, '#registration-identification-number', 'A123456789');
    await humanLikePause(page);

    // Now try to proceed again - should work
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Should have moved to next step (Health Information)
    const nextStepText = await page.locator('.stepper-item.active').textContent();
    expect(nextStepText).toContain('Health Information'); // Should be on health information step
    await humanLikePause(page);
  });
});
