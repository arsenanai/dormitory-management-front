import { test, expect } from './test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

const uniqueRoomNumber = () => `TestRoom${Date.now()}`;
const roomTestData = {
  number: uniqueRoomNumber(),
  floor: 2,
  dormitory: 'A-Block',
  room_type: 'Double',
};

const selectors = {
  addButton: '[data-testid="add-room-button"]',
  editButton: (number: string) => `tr:has-text("${number}") button:has-text("Edit")`,
  deleteButton: (number: string) => `tr:has-text("${number}") button:has-text("Delete")`,
  saveButton: 'button:has-text("Submit")',
  confirmDeleteButton: 'button:has-text("Confirm")',
  errorMessage: '.error, .alert-danger, [role="alert"]',
};

test.describe('Room CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|rooms)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/rooms');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new room', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/room-form$/);
    await page.fill('#room-number', roomTestData.number);
    await page.fill('#room-floor', String(roomTestData.floor));
    await page.selectOption('#room-dormitory', roomTestData.dormitory);
    await page.selectOption('#room-room-type', roomTestData.room_type);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/rooms/);
    await expect(page.locator(`tr:has-text("${roomTestData.number}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing room', async ({ page }) => {
    // Add a room to edit
    const numberToEdit = uniqueRoomNumber();
    await page.click(selectors.addButton);
    await page.fill('#room-number', numberToEdit);
    await page.fill('#room-floor', '3');
    await page.selectOption('#room-dormitory', 'A-Block');
    await page.selectOption('#room-room-type', 'Double');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/rooms/);
    await expect(page.locator(`tr:has-text("${numberToEdit}")`)).toBeVisible({ timeout: 5000 });
    // Edit
    await page.click(selectors.editButton(numberToEdit));
    await expect(page).toHaveURL(/\/room-form\//);
    await page.fill('#room-number', `${numberToEdit}-Edited`);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/rooms/);
    await expect(page.locator(`tr:has-text("${numberToEdit}-Edited")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a room', async ({ page }) => {
    // Add a room to delete
    const numberToDelete = uniqueRoomNumber();
    await page.click(selectors.addButton);
    await page.fill('#room-number', numberToDelete);
    await page.fill('#room-floor', '2');
    await page.selectOption('#room-dormitory', 'A-Block');
    await page.selectOption('#room-room-type', 'Double');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/rooms/);
    await expect(page.locator(`tr:has-text("${numberToDelete}")`)).toBeVisible({ timeout: 5000 });
    // Delete
    await page.click(selectors.deleteButton(numberToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${numberToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/room-form$/);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'number', 'dormitory', 'room type']);
  });

  test('should show error for duplicate room number', async ({ page }) => {
    const duplicateNumber = uniqueRoomNumber();
    await page.click(selectors.addButton);
    await page.fill('#room-number', duplicateNumber);
    await page.fill('#room-floor', '2');
    await page.selectOption('#room-dormitory', 'A-Block');
    await page.selectOption('#room-room-type', 'Double');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/rooms/);
    await expect(page.locator(`tr:has-text("${duplicateNumber}")`)).toBeVisible({ timeout: 5000 });
    // Try to add again
    await page.click(selectors.addButton);
    await page.fill('#room-number', duplicateNumber);
    await page.fill('#room-floor', '2');
    await page.selectOption('#room-dormitory', 'A-Block');
    await page.selectOption('#room-room-type', 'Double');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['already', 'exists']);
  });
}); 