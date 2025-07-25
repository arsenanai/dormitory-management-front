import { test, expect } from './test';

// Use environment variables for admin credentials
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

// Test data
const uniqueEmail = () => `testadmin+crud+${Date.now()}@sdu.edu.kz`;
const adminTestUser = {
  email: uniqueEmail(),
  name: 'Test Admin CRUD',
  surname: 'Test Surname',
  password: 'TestPassword123',
};

// Utility selectors (update as needed for your UI)
const selectors = {
  addButton: '[data-testid="add-admin-button"]',
  editButton: (email: string) => `tr:has-text("${email}") button:has-text("Edit")`,
  deleteButton: (email: string) => `tr:has-text("${email}") button:has-text("Delete")`,
  saveButton: 'button:has-text("Submit")', // Updated to match the actual form
  confirmDeleteButton: 'button:has-text("Confirm")',
  errorMessage: '.error, .alert-danger, [role="alert"]',
};

test.describe('User CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin using env vars
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|admins)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/admins');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to admin form when adding a new user', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/admin-form$/);
    // Check for form fields
    await expect(page.locator('#admin-email')).toBeVisible();
    await expect(page.locator('#admin-password')).toBeVisible();
    await expect(page.locator('#admin-confirm-password')).toBeVisible();
    // Fill the form
    await page.fill('#admin-email', adminTestUser.email);
    await page.fill('#admin-name', adminTestUser.name);
    await page.fill('#admin-surname', adminTestUser.surname);
    await page.fill('#admin-password', adminTestUser.password);
    await page.fill('#admin-confirm-password', adminTestUser.password);
    // Save
    await page.click(selectors.saveButton);
    // Wait for navigation back to users list and for the new user to appear
    await page.waitForURL(/\/admins/);
    await expect(page.locator(`tr:has-text("${adminTestUser.email}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to admin form when editing an existing user', async ({ page }) => {
    // Ensure at least one user exists by adding a test user
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/admin-form$/);
    await page.fill('#admin-email', adminTestUser.email);
    await page.fill('#admin-name', adminTestUser.name);
    await page.fill('#admin-surname', adminTestUser.surname);
    await page.fill('#admin-password', adminTestUser.password);
    await page.fill('#admin-confirm-password', adminTestUser.password);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/admins/);
    await expect(page.locator(`tr:has-text("${adminTestUser.email}")`)).toBeVisible({ timeout: 5000 });

    // Now proceed to edit the user (do not fill password fields)
    // Wait for the new admin row to appear before clicking Edit
    const adminRow = page.locator(`tr:has-text("${adminTestUser.email}")`);
    await expect(adminRow).toBeVisible({ timeout: 10000 });
    const editBtn = page.locator(selectors.editButton(adminTestUser.email));
    await editBtn.click();
    await expect(page).toHaveURL(/\/admin-form\//);
    await expect(page.locator('#admin-email')).toBeVisible();
    // Password fields should NOT be visible
    await expect(page.locator('#admin-password')).not.toBeVisible();
    await expect(page.locator('#admin-confirm-password')).not.toBeVisible();
    // Change Password button should be visible
    await expect(page.locator('button:has-text("Change Password")')).toBeVisible();
    // Optionally, test the Change Password flow here
  });

  // The rest of the CRUD tests (delete, validation, etc.) would need to be updated to match the new flow

  test('should delete an admin user', async ({ page }) => {
    // Add a test admin to delete
    const emailToDelete = uniqueEmail();
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/admin-form$/);
    await page.fill('#admin-email', emailToDelete);
    await page.fill('#admin-name', 'Delete Me');
    await page.fill('#admin-surname', 'ToDelete');
    await page.fill('#admin-password', adminTestUser.password);
    await page.fill('#admin-confirm-password', adminTestUser.password);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/admins/);
    await expect(page.locator(`tr:has-text("${emailToDelete}")`)).toBeVisible({ timeout: 5000 });

    // Delete the admin
    await page.click(selectors.deleteButton(emailToDelete));
    await page.click(selectors.confirmDeleteButton);
    // Wait for the row to disappear
    await expect(page.locator(`tr:has-text("${emailToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/admin-form$/);
    // Try to submit empty form
    await page.click(selectors.saveButton);
    // Check for error messages
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'email', 'password', 'name', 'surname']);
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.click(selectors.addButton);
    await page.fill('#admin-email', 'not-an-email');
    await page.fill('#admin-name', 'Invalid Email');
    await page.fill('#admin-surname', 'Test');
    await page.fill('#admin-password', adminTestUser.password);
    await page.fill('#admin-confirm-password', adminTestUser.password);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['valid email']);
  });

  test('should show error for password mismatch', async ({ page }) => {
    await page.click(selectors.addButton);
    await page.fill('#admin-email', uniqueEmail());
    await page.fill('#admin-name', 'Password Mismatch');
    await page.fill('#admin-surname', 'Test');
    await page.fill('#admin-password', 'Password1');
    await page.fill('#admin-confirm-password', 'Password2');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['password', 'match']);
  });

  test('should show error for duplicate email', async ({ page }) => {
    // Add a test admin
    const duplicateEmail = uniqueEmail();
    await page.click(selectors.addButton);
    await page.fill('#admin-email', duplicateEmail);
    await page.fill('#admin-name', 'Duplicate');
    await page.fill('#admin-surname', 'Test');
    await page.fill('#admin-password', adminTestUser.password);
    await page.fill('#admin-confirm-password', adminTestUser.password);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/admins/);
    await expect(page.locator(`tr:has-text("${duplicateEmail}")`)).toBeVisible({ timeout: 5000 });
    // Try to add again
    await page.click(selectors.addButton);
    await page.fill('#admin-email', duplicateEmail);
    await page.fill('#admin-name', 'Duplicate');
    await page.fill('#admin-surname', 'Test');
    await page.fill('#admin-password', adminTestUser.password);
    await page.fill('#admin-confirm-password', adminTestUser.password);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['already', 'exists']);
  });

  test('should handle backend/server error gracefully', async ({ page }) => {
    // Simulate by submitting a form with a backend-triggering error (e.g., too short password)
    await page.click(selectors.addButton);
    await page.fill('#admin-email', uniqueEmail());
    await page.fill('#admin-name', 'Server Error');
    await page.fill('#admin-surname', 'Test');
    await page.fill('#admin-password', '123'); // Too short
    await page.fill('#admin-confirm-password', '123');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['at least', 'characters']);
  });

  test('should allow admin to reserve a bed for staff and only staff can be assigned', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/main|rooms/, { timeout: 15000 });

    // Navigate to Rooms page
    await page.goto('http://localhost:5173/rooms');
    await page.waitForLoadState('networkidle');

    // Click to add a new room (or edit an existing one)
    await page.click('button:has-text("Add Room")');
    await expect(page).toHaveURL(/room-form/);

    // Fill in room details (use unique name)
    const roomName = `E2E-StaffRoom-${Date.now()}`;
    await page.fill('#room-number', roomName);
    // Select dormitory and room type if required
    // Reserve the first bed for staff
    await page.check('input[type="checkbox"][aria-label*="Reserved for Staff"], input[type="checkbox"]:below(:text("Bed 1"))');
    // Save room
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForURL(/\/rooms/);
    await expect(page.locator(`tr:has-text("${roomName}")`)).toBeVisible({ timeout: 5000 });

    // Try to assign a student to the staff-reserved bed
    await page.goto('http://localhost:5173/students');
    await page.click('button:has-text("Add Student")');
    await page.fill('#student-name', 'E2E Student');
    await page.fill('#student-email', `e2e-student+${Date.now()}@test.local`);
    // Select the room and the staff-reserved bed
    await page.selectOption('#student-room', roomName);
    // The staff-reserved bed should be disabled for students
    const staffBedOption = page.locator('#student-bed option:disabled');
    await expect(staffBedOption).toContainText('Staff Reserved');

    // Now try to assign a staff user to the same bed
    await page.goto('http://localhost:5173/users');
    await page.click('button:has-text("Add User")');
    await page.fill('#user-name', 'E2E Staff');
    await page.fill('#user-email', `e2e-staff+${Date.now()}@test.local`);
    // Select role as staff
    await page.selectOption('#user-role', 'staff');
    // Select the room and the staff-reserved bed
    await page.selectOption('#user-room', roomName);
    // The staff-reserved bed should be enabled for staff
    const staffBedOptionEnabled = page.locator('#user-bed option:not(:disabled)');
    await expect(staffBedOptionEnabled).toContainText('Staff Reserved');
  });
}); 