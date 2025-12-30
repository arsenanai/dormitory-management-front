import { test, expect } from '@playwright/test';

// Helper function for human-like pauses with longer duration for visibility
const humanLikePause = async (page: any) => {
  // Always pause for visual testing, but make it longer
  await page.waitForTimeout(1000); // 1 second pause for better visibility
};

// Helper function for human-like typing simulation
const humanLikeType = async (page: any, selector: string, text: string) => {
  await page.focus(selector);
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

test.describe('Emergency Contact Fields', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page (which is the home page)
    await page.goto('/');
  });

  test('should display emergency contact fields in student registration', async ({ page }) => {
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

    // Check emergency contact step exists
    const emergencyContactStep = page.locator('[data-testid="emergency-contact-step"]');
    await expect(emergencyContactStep).toBeVisible();

    // Verify all emergency contact fields are present with optional pause and highlight
    await humanLikePause(page);
    const nameField = page.locator('#registration-emergency-name');
    await expect(nameField).toBeVisible();
    await nameField.scrollIntoViewIfNeeded(); // Ensure field is in view
    await nameField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);
    
    const typeField = page.locator('#registration-emergency-type');
    await expect(typeField).toBeVisible();
    await typeField.scrollIntoViewIfNeeded();
    await typeField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);
    
    const phoneField = page.locator('#registration-emergency-phone');
    await expect(phoneField).toBeVisible();
    await phoneField.scrollIntoViewIfNeeded();
    await phoneField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);
    
    const emailField = page.locator('#registration-emergency-email');
    await expect(emailField).toBeVisible();
    await emailField.scrollIntoViewIfNeeded();
    await emailField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);

    // Verify old fields are not present with optional pause
    await humanLikePause(page);
    await expect(page.locator('#registration-parent-name')).not.toBeVisible();
    await humanLikePause(page);
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

    // Check emergency contact type dropdown has correct options with optional pause
    await humanLikePause(page);
    const typeSelect = page.locator('#registration-emergency-type');
    await expect(typeSelect).toBeVisible();
    await humanLikePause(page);

    const options = await typeSelect.locator('option').allTextContents();
    await humanLikePause(page);
    expect(options).toContain('Parent');
    await humanLikePause(page);
    expect(options).toContain('Guardian');
    await humanLikePause(page);
    expect(options).toContain('Other');
  });

  test('should fill emergency contact fields correctly', async ({ page }) => {
    // Click on registration tab button
    await page.click('[data-testid="tab-registration"]');
    
    // Navigate to emergency contact step with human-like typing
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');
    await humanLikeType(page, '#registration-iin', '123456789012');
    await humanLikeType(page, '#registration-email', 'test@example.com');
    await humanLikeType(page, '#registration-password', 'password123');
    await humanLikeType(page, '#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');
    await humanLikeType(page, '#registration-first-name', 'John');
    await humanLikeType(page, '#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');
    await humanLikeType(page, '#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');

    // Check emergency contact step exists and scroll to it
    const emergencyContactStep = page.locator('[data-testid="emergency-contact-step"]');
    await expect(emergencyContactStep).toBeVisible();
    await emergencyContactStep.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Pause to see the emergency contact step

    // Fill emergency contact fields with human-like typing and pause
    await humanLikePause(page);
    await humanLikeType(page, '#registration-emergency-name', 'Jane Doe');
    await humanLikePause(page);
    await humanLikeSelect(page, '#registration-emergency-type', 'parent');
    await humanLikePause(page);
    await humanLikeType(page, '#registration-emergency-phone', '+77001234568');
    await humanLikePause(page);
    await humanLikeType(page, '#registration-emergency-email', 'jane@example.com');

    // Verify values are set with pause
    await humanLikePause(page);
    await expect(page.locator('#registration-emergency-name')).toHaveValue('Jane Doe');
    await humanLikePause(page);
    await expect(page.locator('#registration-emergency-type')).toHaveValue('parent');
    await humanLikePause(page);
    await expect(page.locator('#registration-emergency-phone')).toHaveValue('+77001234568');
    await humanLikePause(page);
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

    // Verify all emergency contact fields are present with optional pause and highlight
    await humanLikePause(page);
    const nameField = page.locator('#student-emergency-name');
    await expect(nameField).toBeVisible();
    await nameField.scrollIntoViewIfNeeded(); // Ensure field is in view
    await nameField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);
    
    const typeField = page.locator('#student-emergency-type');
    await expect(typeField).toBeVisible();
    await typeField.scrollIntoViewIfNeeded();
    await typeField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);
    
    const phoneField = page.locator('#student-emergency-phone');
    await expect(phoneField).toBeVisible();
    await phoneField.scrollIntoViewIfNeeded();
    await phoneField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);
    
    const emailField = page.locator('#student-emergency-email');
    await expect(emailField).toBeVisible();
    await emailField.scrollIntoViewIfNeeded();
    await emailField.evaluate((el: any) => el.style.border = '3px solid red'); // Highlight field
    await humanLikePause(page);

    // Verify old fields are not present with optional pause
    await humanLikePause(page);
    await expect(page.locator('#student-parent-name')).not.toBeVisible();
    await humanLikePause(page);
    await expect(page.locator('#student-mentor-name')).not.toBeVisible();
  });

  test('should allow editing emergency contact fields', async ({ page }) => {
    await page.waitForSelector('#student-emergency-name');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);
    console.log('Initial scroll position:', initialScroll);

    // Scroll to emergency contact section first
    await page.locator('#student-emergency-name').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    const afterScrollToSection = await page.evaluate(() => window.scrollY);
    console.log('Scroll after scrolling to section:', afterScrollToSection);

    // Fill emergency contact fields with human-like typing and pause
    await humanLikePause(page);
    
    // Monitor scroll during name field typing
    const scrollBeforeName = await page.evaluate(() => window.scrollY);
    console.log('Scroll before name field:', scrollBeforeName);
    
    // Focus the field first
    await page.focus('#student-emergency-name');
    await page.waitForTimeout(500);
    
    const scrollAfterFocus = await page.evaluate(() => window.scrollY);
    console.log('Scroll after focusing name field:', scrollAfterFocus);
    
    // Now type slowly
    await humanLikeType(page, '#student-emergency-name', 'Emergency Contact');
    
    const scrollAfterName = await page.evaluate(() => window.scrollY);
    console.log('Scroll after name field typing:', scrollAfterName);
    
    await humanLikePause(page);
    
    // Test select field
    const scrollBeforeSelect = await page.evaluate(() => window.scrollY);
    console.log('Scroll before select field:', scrollBeforeSelect);
    
    await humanLikeSelect(page, '#student-emergency-type', 'guardian');
    
    const scrollAfterSelect = await page.evaluate(() => window.scrollY);
    console.log('Scroll after select field:', scrollAfterSelect);
    
    await humanLikePause(page);
    
    // Continue with other fields
    await humanLikeType(page, '#student-emergency-phone', '+77001234569');
    await humanLikePause(page);
    await humanLikeType(page, '#student-emergency-email', 'emergency@test.com');

    // Verify values are set with pause
    await humanLikePause(page);
    await expect(page.locator('#student-emergency-name')).toHaveValue('Emergency Contact');
    await humanLikePause(page);
    await expect(page.locator('#student-emergency-type')).toHaveValue('guardian');
    await humanLikePause(page);
    await expect(page.locator('#student-emergency-phone')).toHaveValue('+77001234569');
    await humanLikePause(page);
    await expect(page.locator('#student-emergency-email')).toHaveValue('emergency@test.com');
  });

  test('should display and fill identification fields in student registration', async ({ page }) => {
    // Click on registration tab button with pause
    await page.waitForSelector('[data-testid="tab-registration"]', { timeout: 10000 });
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

  test('should validate identification fields as required in registration', async ({ page }) => {
    // Click on registration tab button
    await page.waitForSelector('[data-testid="tab-registration"]', { timeout: 10000 });
    await page.click('[data-testid="tab-registration"]');
    await page.waitForTimeout(1000);
    
    // Fill all steps up to emergency contact
    await page.selectOption('#registration-gender', 'male');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await humanLikeType(page, '#registration-iin', '123456789012');
    await humanLikeType(page, '#registration-email', 'test@example.com');
    await humanLikeType(page, '#registration-password', 'password123');
    await humanLikeType(page, '#registration-confirm-password', 'password123');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await humanLikeType(page, '#registration-first-name', 'John');
    await humanLikeType(page, '#registration-last-name', 'Doe');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    await humanLikeType(page, '#phone-number-0', '+77001234567');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);

    // Try to proceed without filling identification fields
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Check if validation prevents proceeding (step should remain on emergency contact)
    const currentStep = await page.locator('.stepper-item.active').textContent();
    expect(currentStep).toContain('Emergency Contact'); // Should still be on emergency contact step
  });

  test('should display and fill identification fields in student form', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await humanLikeType(page, '#email', 'admin@example.com');
    await humanLikeType(page, '#password', 'password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to students page
    await page.goto('/students');
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
});
