import { test, expect } from './test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

const uniqueBedNumber = () => `TestBed${Date.now()}`;
const bedTestData = {
  number: uniqueBedNumber(),
  room: 'A210',
  is_occupied: false,
};

const selectors = {
  addButton: '[data-testid="add-bed-button"]',
  editButton: (number: string) => `tr:has-text("${number}") button:has-text("Edit")`,
  deleteButton: (number: string) => `tr:has-text("${number}") button:has-text("Delete")`,
  saveButton: 'button:has-text("Submit")',
  confirmDeleteButton: 'button:has-text("Confirm")',
  errorMessage: '.error, .alert-danger, [role="alert"]',
};

test.describe('Bed CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|beds)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/beds');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new bed', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/bed-form$/);
    await page.fill('#bed-number', bedTestData.number);
    await page.selectOption('#bed-room', bedTestData.room);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/beds/);
    await expect(page.locator(`tr:has-text("${bedTestData.number}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing bed', async ({ page }) => {
    // Add a bed to edit
    const numberToEdit = uniqueBedNumber();
    await page.click(selectors.addButton);
    await page.fill('#bed-number', numberToEdit);
    await page.selectOption('#bed-room', 'A210');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/beds/);
    await expect(page.locator(`tr:has-text("${numberToEdit}")`)).toBeVisible({ timeout: 5000 });
    // Edit
    await page.click(selectors.editButton(numberToEdit));
    await expect(page).toHaveURL(/\/bed-form\//);
    await page.fill('#bed-number', `${numberToEdit}-Edited`);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/beds/);
    await expect(page.locator(`tr:has-text("${numberToEdit}-Edited")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a bed', async ({ page }) => {
    // Add a bed to delete
    const numberToDelete = uniqueBedNumber();
    await page.click(selectors.addButton);
    await page.fill('#bed-number', numberToDelete);
    await page.selectOption('#bed-room', 'A210');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/beds/);
    await expect(page.locator(`tr:has-text("${numberToDelete}")`)).toBeVisible({ timeout: 5000 });
    // Delete
    await page.click(selectors.deleteButton(numberToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${numberToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/bed-form$/);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'number', 'room']);
  });

  test('should show error for duplicate bed number', async ({ page }) => {
    const duplicateNumber = uniqueBedNumber();
    await page.click(selectors.addButton);
    await page.fill('#bed-number', duplicateNumber);
    await page.selectOption('#bed-room', 'A210');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/beds/);
    await expect(page.locator(`tr:has-text("${duplicateNumber}")`)).toBeVisible({ timeout: 5000 });
    // Try to add again
    await page.click(selectors.addButton);
    await page.fill('#bed-number', duplicateNumber);
    await page.selectOption('#bed-room', 'A210');
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['already', 'exists']);
  });

  test('should allow admin to reserve a bed for staff', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/bed-form$/);
    await page.fill('#bed-number', uniqueBedNumber());
    await page.selectOption('#bed-room', 'A210');
    // Mark as reserved for staff
    await page.check('#bed-reserved-for-staff');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/beds/);
    // Check that the reserved-for-staff indicator is visible in the list (e.g., icon, text)
    await expect(page.locator('tr:has-text("Reserved for Staff")')).toBeVisible({ timeout: 5000 });
  });

  test('should only allow staff to be assigned to staff-reserved beds', async ({ page }) => {
    // Assume a staff-reserved bed exists (create if needed)
    const staffBedNumber = uniqueBedNumber();
    await page.click(selectors.addButton);
    await page.fill('#bed-number', staffBedNumber);
    await page.selectOption('#bed-room', 'A210');
    await page.check('#bed-reserved-for-staff');
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/beds/);
    // Try to assign a student to this bed (simulate via UI or API if possible)
    // (This may require navigating to the student assignment form and checking that the bed is disabled/hidden)
    await page.goto('http://localhost:5173/student-form');
    await page.selectOption('#student-room', 'A210');
    // Bed select should not allow staff-reserved bed for students
    const bedOptions = await page.$$eval('#student-bed option', opts => opts.map(o => ({ value: o.value, disabled: o.disabled, text: o.textContent })));
    for (const opt of bedOptions) {
      if (opt.text && opt.text.includes(staffBedNumber)) {
        expect(opt.disabled).toBe(true);
      }
    }
    // Try to assign a staff user to the bed (if UI supports staff assignment)
    // (This may require navigating to a staff assignment form and checking that the bed is enabled)
    // ...
  });
}); 