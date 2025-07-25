import { test, expect } from './test';

// Use environment variables for admin credentials
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

const uniqueStudentEmail = () => `teststudent+crud+${Date.now()}@sdu.edu.kz`;
const studentTestUser = {
  email: uniqueStudentEmail(),
  name: 'Test Student CRUD',
  surname: 'Test Surname',
  password: 'TestPassword123',
};

const selectors = {
  addButton: '[data-testid="add-student-button"]',
  editButton: (email) => `tr:has-text("${email}") button:has-text("Edit")`,
  deleteButton: (email) => `tr:has-text("${email}") button:has-text("Delete")`,
  saveButton: 'button:has-text("Submit")',
  errorMessage: '.error, .alert-danger, [role="alert"]',
};

test.describe('Student CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|students)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/students');
    await page.waitForLoadState('networkidle');
  });

  test('should create, edit, and delete a student, and handle validation/errors', async ({ page }) => {
    // Create student
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/student-form$/);
    await page.fill('#student-email', studentTestUser.email);
    await page.fill('#student-name', studentTestUser.name);
    await page.fill('#student-surname', studentTestUser.surname);
    await page.fill('#student-password', studentTestUser.password);
    await page.fill('#student-confirm-password', studentTestUser.password);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/students/);
    await expect(page.locator(`tr:has-text("${studentTestUser.email}")`)).toBeVisible({ timeout: 5000 });

    // Edit student
    await page.click(selectors.editButton(studentTestUser.email));
    await expect(page).toHaveURL(/\/student-form/);
    await page.fill('#student-name', 'Updated Name');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/students/);
    await expect(page.locator(`tr:has-text("Updated Name")`)).toBeVisible({ timeout: 5000 });

    // Validation: try to submit empty form
    await page.click(selectors.editButton(studentTestUser.email));
    await page.fill('#student-name', '');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toBeVisible();

    // Delete student
    await page.click(selectors.deleteButton(studentTestUser.email));
    // Confirm deletion if modal appears
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    await expect(page.locator(`tr:has-text("${studentTestUser.email}")`)).not.toBeVisible({ timeout: 5000 });
  });
});

test('should not allow assigning student to staff-reserved beds', async ({ page }) => {
  // This test assumes the UI supports bed selection and that some beds are reserved for staff.
  // 1. Go to add student form
  await page.click(selectors.addButton);
  await expect(page).toHaveURL(/\/student-form$/);

  // 2. Fill in required fields (minimal for form to proceed)
  await page.fill('#student-email', uniqueStudentEmail());
  await page.fill('#student-name', 'Staff Bed Test');
  await page.fill('#student-surname', 'Test');
  await page.fill('#student-iin', `${Math.floor(100000000000 + Math.random() * 900000000000)}`);
  await page.fill('#student-faculty', 'Engineering');
  await page.fill('#student-specialist', 'Software');
  await page.fill('#student-enrollment-year', '2023');
  await page.selectOption('#student-gender', 'male');
  await page.fill('#student-password', studentTestUser.password);
  await page.fill('#student-confirm-password', studentTestUser.password);

  // 3. Select a room known to have at least one staff-reserved bed
  // (This step may need to be adjusted based on test data. For now, select the first room.)
  await page.selectOption('#student-room', { index: 0 });

  // 4. Check that the bed selection dropdown does not include staff-reserved beds
  // (Assume bed select has id #student-bed and staff-reserved beds have a data attribute or are disabled)
  const bedOptions = await page.$$eval('#student-bed option', opts => opts.map(o => ({ value: o.value, disabled: o.disabled, text: o.textContent })));
  // All options for staff-reserved beds should be disabled or not present
  for (const opt of bedOptions) {
    if (opt.text && opt.text.toLowerCase().includes('staff')) {
      expect(opt.disabled).toBe(true);
    }
  }
}); 