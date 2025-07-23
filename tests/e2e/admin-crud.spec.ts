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
}); 