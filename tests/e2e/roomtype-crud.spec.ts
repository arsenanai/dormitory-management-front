import { test, expect } from './test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

const uniqueRoomTypeName = () => `TestRoomType${Date.now()}`;
const roomTypeTestData = {
  name: uniqueRoomTypeName(),
  capacity: 2,
  price: 10000,
};

const selectors = {
  addButton: '[data-testid="add-roomtype-button"]',
  editButton: (name: string) => `tr:has-text("${name}") button:has-text("Edit")`,
  deleteButton: (name: string) => `tr:has-text("${name}") button:has-text("Delete")`,
  saveButton: 'button:has-text("Submit")',
  confirmDeleteButton: 'button:has-text("Confirm")',
  errorMessage: '.error, .alert-danger, [role="alert"]',
};

test.describe('RoomType CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|roomtypes)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/roomtypes');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new room type', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/roomtype-form$/);
    await page.fill('#roomtype-name', roomTypeTestData.name);
    await page.fill('#roomtype-capacity', String(roomTypeTestData.capacity));
    await page.fill('#roomtype-price', String(roomTypeTestData.price));
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/roomtypes/);
    await expect(page.locator(`tr:has-text("${roomTypeTestData.name}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing room type', async ({ page }) => {
    // Add a room type to edit
    const nameToEdit = uniqueRoomTypeName();
    await page.click(selectors.addButton);
    await page.fill('#roomtype-name', nameToEdit);
    await page.fill('#roomtype-capacity', '3');
    await page.fill('#roomtype-price', '15000');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/roomtypes/);
    await expect(page.locator(`tr:has-text("${nameToEdit}")`)).toBeVisible({ timeout: 5000 });
    // Edit
    await page.click(selectors.editButton(nameToEdit));
    await expect(page).toHaveURL(/\/roomtype-form\//);
    await page.fill('#roomtype-name', `${nameToEdit}-Edited`);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/roomtypes/);
    await expect(page.locator(`tr:has-text("${nameToEdit}-Edited")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a room type', async ({ page }) => {
    // Add a room type to delete
    const nameToDelete = uniqueRoomTypeName();
    await page.click(selectors.addButton);
    await page.fill('#roomtype-name', nameToDelete);
    await page.fill('#roomtype-capacity', '2');
    await page.fill('#roomtype-price', '12000');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/roomtypes/);
    await expect(page.locator(`tr:has-text("${nameToDelete}")`)).toBeVisible({ timeout: 5000 });
    // Delete
    await page.click(selectors.deleteButton(nameToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${nameToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/roomtype-form$/);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'name', 'capacity', 'price']);
  });

  test('should show error for duplicate name', async ({ page }) => {
    const duplicateName = uniqueRoomTypeName();
    await page.click(selectors.addButton);
    await page.fill('#roomtype-name', duplicateName);
    await page.fill('#roomtype-capacity', '2');
    await page.fill('#roomtype-price', '12000');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/roomtypes/);
    await expect(page.locator(`tr:has-text("${duplicateName}")`)).toBeVisible({ timeout: 5000 });
    // Try to add again
    await page.click(selectors.addButton);
    await page.fill('#roomtype-name', duplicateName);
    await page.fill('#roomtype-capacity', '2');
    await page.fill('#roomtype-price', '12000');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['already', 'exists']);
  });
}); 