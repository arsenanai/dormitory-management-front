import { test, expect } from './test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

const uniqueEmail = () => `testguest+crud+${Date.now()}@sdu.edu.kz`;
const guestTestUser = {
  email: uniqueEmail(),
  firstName: 'Test Guest',
  lastName: 'CRUD',
  phone: '+77010000000',
  enterDate: '2024-01-01',
  exitDate: '2024-01-10',
};

const selectors = {
  addButton: '[data-testid="add-guest-button"]',
  editButton: (email: string) => `tr:has-text("${email}") button:has-text("Edit")`,
  deleteButton: (email: string) => `tr:has-text("${email}") button:has-text("Delete")`,
  saveButton: 'button:has-text("Submit")',
  confirmDeleteButton: 'button:has-text("Confirm")',
  errorMessage: '.error, .alert-danger, [role="alert"]',
};

test.describe('Guest CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|guests)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/guests');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new guest', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/guest-form$/);
    await page.fill('#guest-email', guestTestUser.email);
    await page.fill('#guest-first-name', guestTestUser.firstName);
    await page.fill('#guest-last-name', guestTestUser.lastName);
    await page.fill('#guest-phone', guestTestUser.phone);
    await page.fill('#guest-enter-date', guestTestUser.enterDate);
    await page.fill('#guest-exit-date', guestTestUser.exitDate);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guests/);
    await expect(page.locator(`tr:has-text("${guestTestUser.email}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing guest', async ({ page }) => {
    // Add a guest to edit
    const emailToEdit = uniqueEmail();
    await page.click(selectors.addButton);
    await page.fill('#guest-email', emailToEdit);
    await page.fill('#guest-first-name', 'Edit Me');
    await page.fill('#guest-last-name', 'ToEdit');
    await page.fill('#guest-phone', '+77010000001');
    await page.fill('#guest-enter-date', '2024-01-02');
    await page.fill('#guest-exit-date', '2024-01-12');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guests/);
    await expect(page.locator(`tr:has-text("${emailToEdit}")`)).toBeVisible({ timeout: 5000 });
    // Edit
    await page.click(selectors.editButton(emailToEdit));
    await expect(page).toHaveURL(/\/guest-form\//);
    await page.fill('#guest-first-name', 'Edited Name');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guests/);
    await expect(page.locator(`tr:has-text("Edited Name")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a guest', async ({ page }) => {
    // Add a guest to delete
    const emailToDelete = uniqueEmail();
    await page.click(selectors.addButton);
    await page.fill('#guest-email', emailToDelete);
    await page.fill('#guest-first-name', 'Delete Me');
    await page.fill('#guest-last-name', 'ToDelete');
    await page.fill('#guest-phone', '+77010000002');
    await page.fill('#guest-enter-date', '2024-01-03');
    await page.fill('#guest-exit-date', '2024-01-13');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guests/);
    await expect(page.locator(`tr:has-text("${emailToDelete}")`)).toBeVisible({ timeout: 5000 });
    // Delete
    await page.click(selectors.deleteButton(emailToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${emailToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/guest-form$/);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'email', 'first name', 'last name', 'phone', 'enter date', 'exit date']);
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.click(selectors.addButton);
    await page.fill('#guest-email', 'not-an-email');
    await page.fill('#guest-first-name', 'Invalid Email');
    await page.fill('#guest-last-name', 'Test');
    await page.fill('#guest-phone', '+77010000003');
    await page.fill('#guest-enter-date', '2024-01-04');
    await page.fill('#guest-exit-date', '2024-01-14');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['valid email']);
  });

  test('should show error for duplicate email', async ({ page }) => {
    const duplicateEmail = uniqueEmail();
    await page.click(selectors.addButton);
    await page.fill('#guest-email', duplicateEmail);
    await page.fill('#guest-first-name', 'Duplicate');
    await page.fill('#guest-last-name', 'Test');
    await page.fill('#guest-phone', '+77010000004');
    await page.fill('#guest-enter-date', '2024-01-05');
    await page.fill('#guest-exit-date', '2024-01-15');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/guests/);
    await expect(page.locator(`tr:has-text("${duplicateEmail}")`)).toBeVisible({ timeout: 5000 });
    // Try to add again
    await page.click(selectors.addButton);
    await page.fill('#guest-email', duplicateEmail);
    await page.fill('#guest-first-name', 'Duplicate');
    await page.fill('#guest-last-name', 'Test');
    await page.fill('#guest-phone', '+77010000004');
    await page.fill('#guest-enter-date', '2024-01-05');
    await page.fill('#guest-exit-date', '2024-01-15');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['already', 'exists']);
  });
}); 