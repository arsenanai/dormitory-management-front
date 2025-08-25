import { test, expect } from './test';

// Use working credentials from the auth tests
const adminEmail = 'alice@student.local';
const adminPassword = 'password';

const uniqueEmail = () => `testguest+crud+${Date.now()}@sdu.edu.kz`;
const guestTestUser = {
  firstName: 'Test Guest',
  lastName: 'CRUD',
  phone: '+77010000000',
  enterDate: '2024-01-01',
  exitDate: '2024-01-10',
};

const selectors = {
  addButton: '[data-testid="add-guest-button"], button:has-text("Add Guest"), button:has-text("Add")',
  editButton: (email) => `tr:has-text("${email}") button:has-text("Edit"), tr:has-text("${email}") [data-testid="edit-button"]`,
  deleteButton: (email) => `tr:has-text("${email}") button:has-text("Delete"), tr:has-text("${email}") [data-testid="delete-button"]`,
  saveButton: 'button:has-text("Submit"), button:has-text("Save")',
  confirmDeleteButton: 'button:has-text("Confirm"), button:has-text("Delete")',
  errorMessage: '.error, .alert-danger, [role="alert"], .toast-error',
};

test.describe('Guest CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    // Wait for successful login - be more flexible with URL matching
    await page.waitForURL(/\/(main|dormitories|users|guest-house)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    // Navigate to guest-house page if not already there
    if (!page.url().includes('/guest-house')) {
      await page.goto('http://localhost:3000/guest-house');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should create a new guest', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/guest-form$/);
    await page.fill('#guest-first-name', guestTestUser.firstName);
    await page.fill('#guest-last-name', guestTestUser.lastName);
    await page.fill('#guest-phone', guestTestUser.phone);
    await page.fill('#guest-enter-date', guestTestUser.enterDate);
    await page.fill('#guest-exit-date', guestTestUser.exitDate);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guest-house/);
    await expect(page.locator(`tr:has-text("${guestTestUser.firstName}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing guest', async ({ page }) => {
    // Add a guest to edit
    const nameToEdit = 'Edit Me';
    await page.click(selectors.addButton);
    await page.fill('#guest-first-name', nameToEdit);
    await page.fill('#guest-last-name', 'ToEdit');
    await page.fill('#guest-phone', '+77010000001');
    await page.fill('#guest-enter-date', '2024-01-02');
    await page.fill('#guest-exit-date', '2024-01-12');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guest-house/);
    await expect(page.locator(`tr:has-text("${nameToEdit}")`)).toBeVisible({ timeout: 5000 });
    // Edit
    await page.click(selectors.editButton(nameToEdit));
    await expect(page).toHaveURL(/\/guest-form\//);
    await page.fill('#guest-first-name', 'Edited Name');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guest-house/);
    await expect(page.locator(`tr:has-text("Edited Name")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a guest', async ({ page }) => {
    // Add a guest to delete
    const nameToDelete = 'Delete Me';
    await page.click(selectors.addButton);
    await page.fill('#guest-first-name', nameToDelete);
    await page.fill('#guest-last-name', 'ToDelete');
    await page.fill('#guest-phone', '+77010000002');
    await page.fill('#guest-enter-date', '2024-01-03');
    await page.fill('#guest-exit-date', '2024-01-13');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guest-house/);
    await expect(page.locator(`tr:has-text("${nameToDelete}")`)).toBeVisible({ timeout: 5000 });
    // Delete
    await page.click(selectors.deleteButton(nameToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${nameToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/guest-form$/);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'first name', 'last name', 'phone', 'enter date', 'exit date']);
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.click(selectors.addButton);
    await page.fill('#guest-first-name', 'Invalid Email');
    await page.fill('#guest-last-name', 'Test');
    await page.fill('#guest-phone', '+77010000003');
    await page.fill('#guest-enter-date', '2024-01-04');
    await page.fill('#guest-exit-date', '2024-01-14');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['valid', 'phone']);
  });

  test('should show error for duplicate email', async ({ page }) => {
    const duplicateName = 'Duplicate';
    await page.click(selectors.addButton);
    await page.fill('#guest-first-name', duplicateName);
    await page.fill('#guest-last-name', 'Test');
    await page.fill('#guest-phone', '+77010000004');
    await page.fill('#guest-enter-date', '2024-01-05');
    await page.fill('#guest-exit-date', '2024-01-15');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guest-house/);
    await expect(page.locator(`tr:has-text("${duplicateName}")`)).toBeVisible({ timeout: 5000 });
    // Try to add again
    await page.click(selectors.addButton);
    await page.fill('#guest-first-name', duplicateName);
    await page.fill('#guest-last-name', 'Test');
    await page.fill('#guest-phone', '+77010000004');
    await page.fill('#guest-enter-date', '2024-01-05');
    await page.fill('#guest-exit-date', '2024-01-15');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['already', 'exists']);
  });
}); 