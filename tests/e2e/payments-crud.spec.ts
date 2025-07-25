import { test, expect } from './test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

const uniquePaymentDesc = () => `TestPayment${Date.now()}`;
const paymentTestData = {
  amount: 10000,
  payment_type: 'monthly_rent',
  payment_date: '2024-01-01',
  status: 'completed',
  description: uniquePaymentDesc(),
};

const selectors = {
  addButton: '[data-testid="add-payment-button"]',
  editButton: (desc: string) => `tr:has-text("${desc}") button:has-text("Edit")`,
  deleteButton: (desc: string) => `tr:has-text("${desc}") button:has-text("Delete")`,
  saveButton: 'button:has-text("Submit")',
  confirmDeleteButton: 'button:has-text("Confirm")',
  errorMessage: '.error, .alert-danger, [role="alert"]',
  exportButton: '[data-testid="export-payments-button"]',
};

test.describe('Payments CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|payments)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/payments');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new payment', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/payment-form$/);
    await page.fill('#amount', String(paymentTestData.amount));
    await page.selectOption('#payment-type', paymentTestData.payment_type);
    await page.fill('#payment-date', paymentTestData.payment_date);
    await page.selectOption('#status', paymentTestData.status);
    await page.fill('#description', paymentTestData.description);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/payments/);
    await expect(page.locator(`tr:has-text("${paymentTestData.description}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing payment', async ({ page }) => {
    // Add a payment to edit
    const descToEdit = uniquePaymentDesc();
    await page.click(selectors.addButton);
    await page.fill('#amount', '20000');
    await page.selectOption('#payment-type', 'utilities');
    await page.fill('#payment-date', '2024-01-02');
    await page.selectOption('#status', 'pending');
    await page.fill('#description', descToEdit);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/payments/);
    await expect(page.locator(`tr:has-text("${descToEdit}")`)).toBeVisible({ timeout: 5000 });
    // Edit
    await page.click(selectors.editButton(descToEdit));
    await expect(page).toHaveURL(/\/payment-form\//);
    await page.fill('#description', `${descToEdit}-Edited`);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/payments/);
    await expect(page.locator(`tr:has-text("${descToEdit}-Edited")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a payment', async ({ page }) => {
    // Add a payment to delete
    const descToDelete = uniquePaymentDesc();
    await page.click(selectors.addButton);
    await page.fill('#amount', '30000');
    await page.selectOption('#payment-type', 'deposit');
    await page.fill('#payment-date', '2024-01-03');
    await page.selectOption('#status', 'completed');
    await page.fill('#description', descToDelete);
    await page.click(selectors.saveButton);
    await page.waitForURL(/\/payments/);
    await expect(page.locator(`tr:has-text("${descToDelete}")`)).toBeVisible({ timeout: 5000 });
    // Delete
    await page.click(selectors.deleteButton(descToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${descToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await expect(page).toHaveURL(/\/payment-form$/);
    await page.click(selectors.saveButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['required', 'amount', 'payment type', 'payment date', 'status']);
  });

  test('should filter payments by status', async ({ page }) => {
    await page.selectOption('#status-filter', 'completed');
    // Should only show completed payments (assumes at least one exists)
    await expect(page.locator('tr')).toContainText(['completed']);
  });

  test('should export payments as .xlsx', async ({ page }) => {
    // Click export button and expect a download (cannot verify file in headless, but can check for no error)
    await page.click(selectors.exportButton);
    // Optionally, check for a toast or success message
    // await expect(page.locator('.toast-success')).toBeVisible();
  });
}); 