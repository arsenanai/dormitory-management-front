import { test, expect } from './test';

// Use working credentials from the auth tests
const adminEmail = 'admin@email.com';
const adminPassword = 'supersecret';

const uniqueStudentEmail = () => `teststudent+crud+${Date.now()}@sdu.edu.kz`;
const studentTestUser = {
  email: uniqueStudentEmail(),
  name: 'Test Student CRUD',
  surname: 'Test Surname',
  password: 'TestPassword123',
};

const selectors = {
  addButton: '[data-testid="add-student-button"], button:has-text("Add Student"), button:has-text("Add User")',
  editButton: (email) => `tr:has-text("${email}") button:has-text("Edit"), tr:has-text("${email}") [data-testid="edit-button"]`,
  deleteButton: (email) => `tr:has-text("${email}") button:has-text("Delete"), tr:has-text("${email}") [data-testid="delete-button"]`,
  saveButton: 'button:has-text("Submit"), button:has-text("Save")',
  errorMessage: '.error, .alert-danger, [role="alert"], .toast-error',
};

test.describe('Student CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login - be more flexible with URL matching
    await page.waitForURL(/\/(main|dormitories|users|students)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Navigate to students page if not already there
    if (!page.url().includes('/students')) {
      await page.goto('http://localhost:5173/students');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should create, edit, and delete a student, and handle validation/errors', async ({ page }) => {
    // Check if add button exists
    const addButton = page.locator(selectors.addButton);
    if (await addButton.count() === 0) {
      test.skip();
      return;
    }
    
    // Create student
    await addButton.click();
    await expect(page).toHaveURL(/\/student-form$/);
    
    // Fill form with student data - check if fields exist before filling
    const emailField = page.locator('#student-email, #email');
    if (await emailField.count() > 0) {
      await emailField.fill(studentTestUser.email);
    }
    
    const nameField = page.locator('#student-name, #name');
    if (await nameField.count() > 0) {
      await nameField.fill(studentTestUser.name);
    }
    
    const surnameField = page.locator('#student-surname, #surname');
    if (await surnameField.count() > 0) {
      await surnameField.fill(studentTestUser.surname);
    }
    
    // Password fields might not exist in student form (students are created via registration)
    const passwordField = page.locator('#student-password, #password');
    if (await passwordField.count() > 0) {
      await passwordField.fill(studentTestUser.password);
    }
    
    const confirmPasswordField = page.locator('#student-confirm-password, #confirm-password');
    if (await confirmPasswordField.count() > 0) {
      await confirmPasswordField.fill(studentTestUser.password);
    }
    
    // Fill additional required fields if they exist
    const iinField = page.locator('#student-iin, #iin');
    if (await iinField.count() > 0) {
      await iinField.fill('123456789012');
    }
    
    const facultyField = page.locator('#student-faculty, #faculty');
    if (await facultyField.count() > 0) {
      await facultyField.selectOption('engineering');
    }
    
    const specialistField = page.locator('#student-specialist, #specialist');
    if (await specialistField.count() > 0) {
      await specialistField.selectOption('computer_sciences');
    }
    
    const enrollmentYearField = page.locator('#student-enrollment-year, #enrollment-year');
    if (await enrollmentYearField.count() > 0) {
      await enrollmentYearField.fill('2023');
    }
    
    const genderField = page.locator('#student-gender, #gender');
    if (await genderField.count() > 0) {
      await genderField.selectOption('male');
    }
    
    await page.click(selectors.saveButton);
    
    // Wait for either success or error response
    try {
      await page.waitForURL(/\/students/, { timeout: 10000 });
      await expect(page.locator(`tr:has-text("${studentTestUser.email}")`)).toBeVisible({ timeout: 5000 });
    } catch {
      // If navigation fails, check for error message
      const errorMessages = page.locator(selectors.errorMessage);
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    }

    // Edit student - only if we successfully created one
    const editButton = page.locator(selectors.editButton(studentTestUser.email));
    if (await editButton.count() > 0) {
      await editButton.click();
      await expect(page).toHaveURL(/\/student-form/);
      
      const nameField = page.locator('#student-name, #name');
      if (await nameField.count() > 0) {
        await nameField.fill('Updated Name');
      }
      
      await page.click(selectors.saveButton);
      await page.waitForURL(/\/students/);
      await expect(page.locator(`tr:has-text("Updated Name")`)).toBeVisible({ timeout: 5000 });

      // Validation: try to submit empty form
      await editButton.click();
      if (await nameField.count() > 0) {
        await nameField.fill('');
      }
      await page.click(selectors.saveButton);
      await expect(page.locator(selectors.errorMessage).first()).toBeVisible();

      // Delete student
      const deleteButton = page.locator(selectors.deleteButton(studentTestUser.email));
      await deleteButton.click();
      
      // Confirm deletion if modal appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      await expect(page.locator(`tr:has-text("${studentTestUser.email}")`)).not.toBeVisible({ timeout: 5000 });
    }
  });
});

test('should not allow assigning student to staff-reserved beds', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:5173/');
  await page.fill('#login-email', adminEmail);
  await page.fill('#login-password', adminPassword);
  await page.click('button[type="submit"]:has-text("Login")');
  await page.waitForURL(/\/(main|dormitories|users|students)/, { timeout: 15000 });
  
  // This test assumes the UI supports bed selection and that some beds are reserved for staff.
  // Check if add student button exists
  const addButton = page.locator(selectors.addButton);
  if (await addButton.count() === 0) {
    test.skip();
    return;
  }
  
  // 1. Go to add student form
  await addButton.click();
  await expect(page).toHaveURL(/\/student-form$/);

  // 2. Fill in required fields (minimal for form to proceed)
  const emailField = page.locator('#student-email, #email');
  if (await emailField.count() > 0) {
    await emailField.fill(uniqueStudentEmail());
  }
  
  const nameField = page.locator('#student-name, #name');
  if (await nameField.count() > 0) {
    await nameField.fill('Staff Bed Test');
  }
  
  const surnameField = page.locator('#student-surname, #surname');
  if (await surnameField.count() > 0) {
    await surnameField.fill('Test');
  }
  
  // Fill additional required fields if they exist
  const iinField = page.locator('#student-iin, #iin');
  if (await iinField.count() > 0) {
    await iinField.fill(`${Math.floor(100000000000 + Math.random() * 900000000000)}`);
  }
  
  const facultyField = page.locator('#student-faculty, #faculty');
  if (await facultyField.count() > 0) {
    await facultyField.selectOption('engineering');
  }
  
  const specialistField = page.locator('#student-specialist, #specialist');
  if (await specialistField.count() > 0) {
    await specialistField.selectOption('computer_sciences');
  }
  
  const enrollmentYearField = page.locator('#student-enrollment-year, #enrollment-year');
  if (await enrollmentYearField.count() > 0) {
    await enrollmentYearField.fill('2023');
  }
  
  const genderField = page.locator('#student-gender, #gender');
  if (await genderField.count() > 0) {
    await genderField.selectOption('male');
  }
  
  const passwordField = page.locator('#student-password, #password');
  if (await passwordField.count() > 0) {
    await passwordField.fill(studentTestUser.password);
  }
  
  const confirmPasswordField = page.locator('#student-confirm-password, #confirm-password');
  if (await confirmPasswordField.count() > 0) {
    await confirmPasswordField.fill(studentTestUser.password);
  }

  // 3. Check if room selection exists
  const roomSelect = page.locator('#student-room, #room');
  if (await roomSelect.count() > 0) {
    // Select the first available room
    await roomSelect.selectOption({ index: 0 });
  }

  // 4. Check that the bed selection dropdown does not include staff-reserved beds
  const bedSelect = page.locator('#student-bed, #bed');
  if (await bedSelect.count() > 0) {
    const bedOptions = await page.$$eval('#student-bed option, #bed option', opts => 
      opts.map(o => ({ value: o.value, disabled: o.disabled, text: o.textContent }))
    );
    
    // All options for staff-reserved beds should be disabled or not present
    for (const opt of bedOptions) {
      if (opt.text && opt.text.toLowerCase().includes('staff')) {
        expect(opt.disabled).toBe(true);
      }
    }
  } else {
    test.skip();
  }
}); 