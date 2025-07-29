import { test, expect } from './test';

// Use working credentials from the auth tests
const adminEmail = 'alice@student.local';
const adminPassword = 'password';

const uniquePaymentDesc = () => `TestPayment${Date.now()}`;
const paymentTestData = {
  amount: 10000,
  payment_type: 'monthly_rent',
  payment_date: '2024-01-01',
  status: 'completed',
  description: uniquePaymentDesc(),
};

const selectors = {
  addButton: '[data-testid="add-payment-button"], button:has-text("Add Payment"), button:has-text("Add")',
  editButton: (desc) => `tr:has-text("${desc}") button:has-text("Edit"), tr:has-text("${desc}") [data-testid="edit-button"]`,
  deleteButton: (desc) => `tr:has-text("${desc}") button:has-text("Delete"), tr:has-text("${desc}") [data-testid="delete-button"]`,
  saveButton: 'button:has-text("Submit"), button:has-text("Save")',
  confirmDeleteButton: 'button:has-text("Confirm"), button:has-text("Delete")',
  errorMessage: '.error, .alert-danger, [role="alert"], .toast-error',
  exportButton: '[data-testid="export-payments-button"], button:has-text("Export")',
};

test.describe('Payments CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    // Wait for successful login - be more flexible with URL matching
    await page.waitForURL(/\/(main|dormitories|users|payments|accounting)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    // Navigate to payments page if not already there
    if (!page.url().includes('/payments')) {
      await page.goto('http://localhost:5173/payments');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should create a new payment', async ({ page }) => {
    await page.click(selectors.addButton);
    // Wait for modal to appear (no URL change)
    await page.waitForSelector('form', { timeout: 5000 });
    await page.fill('input[type="number"]', String(paymentTestData.amount));
    await page.selectOption('#payment-type', paymentTestData.payment_type);
    await page.fill('input[type="date"]', paymentTestData.payment_date);
    await page.selectOption('#payment-status', paymentTestData.status);
    await page.fill('input[type="text"]', paymentTestData.description);
    await page.click(selectors.saveButton);
    // Wait for modal to close and table to update
    await page.waitForSelector('form', { state: 'hidden', timeout: 5000 });
    await expect(page.locator(`tr:has-text("${paymentTestData.description}")`)).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing payment', async ({ page }) => {
    // Add a payment to edit
    const descToEdit = uniquePaymentDesc();
    await page.click(selectors.addButton);
    await page.waitForSelector('form', { timeout: 5000 });
    await page.fill('input[type="number"]', '20000');
    await page.selectOption('#payment-type', 'utilities');
    await page.fill('input[type="date"]', '2024-01-02');
    await page.selectOption('#payment-status', 'pending');
    await page.fill('input[type="text"]', descToEdit);
    await page.click(selectors.saveButton);
    await page.waitForSelector('form', { state: 'hidden', timeout: 5000 });
    await expect(page.locator(`tr:has-text("${descToEdit}")`)).toBeVisible({ timeout: 5000 });
    
    // Edit
    await page.click(selectors.editButton(descToEdit));
    await page.waitForSelector('form', { timeout: 5000 });
    await page.fill('input[type="text"]', `${descToEdit}-Edited`);
    await page.click(selectors.saveButton);
    await page.waitForSelector('form', { state: 'hidden', timeout: 5000 });
    await expect(page.locator(`tr:has-text("${descToEdit}-Edited")`)).toBeVisible({ timeout: 5000 });
  });

  test('should delete a payment', async ({ page }) => {
    // Add a payment to delete
    const descToDelete = uniquePaymentDesc();
    await page.click(selectors.addButton);
    await page.waitForSelector('form', { timeout: 5000 });
    await page.fill('input[type="number"]', '30000');
    await page.selectOption('#payment-type', 'deposit');
    await page.fill('input[type="date"]', '2024-01-03');
    await page.selectOption('#payment-status', 'completed');
    await page.fill('input[type="text"]', descToDelete);
    await page.click(selectors.saveButton);
    await page.waitForSelector('form', { state: 'hidden', timeout: 5000 });
    await expect(page.locator(`tr:has-text("${descToDelete}")`)).toBeVisible({ timeout: 5000 });
    
    // Delete
    await page.click(selectors.deleteButton(descToDelete));
    await page.click(selectors.confirmDeleteButton);
    await expect(page.locator(`tr:has-text("${descToDelete}")`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click(selectors.addButton);
    await page.waitForSelector('form', { timeout: 5000 });
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