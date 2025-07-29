import { test, expect } from './test';

// Use working credentials from the auth tests
const adminEmail = 'alice@student.local';
const adminPassword = 'password';

const uniqueRoomTypeName = () => `TestRoomType${Date.now()}`;
const roomTypeTestData = {
  name: uniqueRoomTypeName(),
  description: 'Test room type description',
};

const selectors = {
  addButton: '[data-testid="add-roomtype-button"], button:has-text("Add Room Type"), button:has-text("Add")',
  editButton: (name) => `tr:has-text("${name}") button:has-text("Edit"), tr:has-text("${name}") [data-testid="edit-button"]`,
  deleteButton: (name) => `tr:has-text("${name}") button:has-text("Delete"), tr:has-text("${name}") [data-testid="delete-button"]`,
  saveButton: 'button:has-text("Submit"), button:has-text("Save")',
  confirmDeleteButton: 'button:has-text("Confirm"), button:has-text("Delete")',
  errorMessage: '.error, .alert-danger, [role="alert"], .toast-error',
};

test.describe('RoomType CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    // Wait for successful login - be more flexible with URL matching
    await page.waitForURL(/\/(main|dormitories|users|room-types)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    // Navigate to room-types page if not already there
    if (!page.url().includes('/room-types')) {
      await page.goto('http://localhost:5173/room-types');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should create a new room type', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/room-type-form$/);
    await page.fill('#room-type-name', roomTypeTestData.name);
    await page.fill('#room-type-description', roomTypeTestData.description);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/room-types/);
    await expect(page.locator(`tr:has-text("${roomTypeTestData.name}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing room type', async ({ page }) => {
    // Add a room type to edit
    const nameToEdit = uniqueRoomTypeName();
    await page.click(selectors.addButton);
    await page.fill('#room-type-name', nameToEdit);
    await page.fill('#room-type-description', 'Test description for editing');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/room-types/);
    await expect(page.locator(`tr:has-text("${nameToEdit}")`)).toBeVisible({ timeout: 5000 });
    // Edit
    await page.click(selectors.editButton(nameToEdit));
    await expect(page).toHaveURL(/\/room-type-form\//);
    await page.fill('#roomtype-name', `${nameToEdit}-Edited`);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/room-types/);
    await expect(page.locator(`tr:has-text("${nameToEdit}-Edited")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a room type', async ({ page }) => {
    // Add a room type to delete
    const nameToDelete = uniqueRoomTypeName();
    await page.click(selectors.addButton);
    await page.fill('#room-type-name', nameToDelete);
    await page.fill('#room-type-description', 'Test description for deletion');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/room-types/);
    await expect(page.locator(`tr:has-text("${nameToDelete}")`)).toBeVisible({ timeout: 5000 });
    // Delete
    await page.click(selectors.deleteButton(nameToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${nameToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/room-type-form$/);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'name', 'description']);
  });

  test('should show error for duplicate name', async ({ page }) => {
    const duplicateName = uniqueRoomTypeName();
    await page.click(selectors.addButton);
    await page.fill('#room-type-name', duplicateName);
    await page.fill('#room-type-description', 'Test description for duplicate');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/room-types/);
    await expect(page.locator(`tr:has-text("${duplicateName}")`)).toBeVisible({ timeout: 5000 });
    // Try to add again
    await page.click(selectors.addButton);
    await page.fill('#room-type-name', duplicateName);
    await page.fill('#room-type-description', 'Test description for duplicate error');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['already', 'exists']);
  });
}); 