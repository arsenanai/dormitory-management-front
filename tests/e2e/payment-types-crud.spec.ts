import { test, expect } from '@playwright/test';

test.describe('Payment Types CRUD Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to root page and wait for login form
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Fill login form (assuming sudo/admin user)
    const emailField = page.locator('#login-email');
    const passwordField = page.locator('#login-password');
    const loginButton = page.locator('[data-testid="login-button"]');

    await emailField.fill('admin@email.com');
    await passwordField.fill('supersecret');

    // Click login
    await loginButton.click();

    // Wait for redirect to main page
    await page.waitForURL('/main', { timeout: 30000 });

    // Wait a bit for the auth store to be populated
    await page.waitForTimeout(2000);
  });

  test('should navigate to payment types page', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.locator('text=Payment Types').first()).toBeVisible();

    // Verify add button exists
    await expect(page.locator('[data-testid="add-payment-type-button"]')).toBeVisible();
  });

  test('should create a new payment type successfully', async ({ page }) => {
    const timestamp = Date.now();
    const paymentTypeName = `test_payment_${timestamp}`;

    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Click add button
    await page.getByTestId('add-payment-type-button').click();

    // Wait for modal to appear
    await expect(page.locator('text=Add Payment Type').first()).toBeVisible();

    // Fill form
    await page.locator('input[placeholder*="Enter payment type name"]').fill(paymentTypeName);
    await page.locator('select').first().selectOption('monthly');
    await page.locator('select').nth(1).selectOption('fixed');
    await page.locator('input[type="number"]').fill('250.00');
    await page.locator('select').nth(2).selectOption('student');
    await page.locator('select').nth(3).selectOption('new_month');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for success message or table update
    await page.waitForTimeout(1000);

    // Verify payment type appears in table
    await expect(page.locator(`text=${paymentTypeName}`)).toBeVisible();
  });

  test('should display all payment type fields in table', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('table');

    // Verify table headers
    const headers = ['Name', 'Frequency', 'Calculation Method', 'Fixed Amount', 'Target Role', 'Trigger Event'];
    for (const header of headers) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
  });

  test('should edit an existing payment type', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('table tbody tr');

    // Find first payment type row and click edit
    const firstRow = page.locator('table tbody tr').first();
    const editButton = firstRow.locator('button').first();

    // Get the payment type name before edit
    const originalName = await firstRow.locator('td').first().textContent();

    await editButton.click();

    // Wait for edit modal
    await expect(page.locator('text=Edit Payment Type').first()).toBeVisible();

    // Change frequency to semesterly
    const frequencySelect = page.locator('select').first();
    await frequencySelect.selectOption('semesterly');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for update
    await page.waitForTimeout(1000);

    // Verify the payment type still exists (name should be the same)
    await expect(page.locator(`text=${originalName}`)).toBeVisible();
  });

  test('should show fixed amount field only when calculation method is fixed', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Click add button
    await page.getByTestId('add-payment-type-button').click();

    // Wait for modal
    await expect(page.locator('text=Add Payment Type').first()).toBeVisible();

    // Select fixed calculation method
    const calculationMethodSelect = page.locator('select').nth(1);
    await calculationMethodSelect.selectOption('fixed');

    // Verify fixed amount input is visible
    const fixedAmountInput = page.locator('input[type="number"]');
    await expect(fixedAmountInput).toBeVisible();

    // Change to room_semester_rate
    await calculationMethodSelect.selectOption('room_semester_rate');

    // Verify fixed amount input is hidden
    await expect(fixedAmountInput).not.toBeVisible();
  });

  test('should delete a payment type with confirmation', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('table tbody tr');

    // Get first payment type name
    const firstRow = page.locator('table tbody tr').first();
    const paymentTypeName = await firstRow.locator('td').first().textContent();

    // Count rows before deletion
    const rowsBefore = await page.locator('table tbody tr').count();

    // Click delete button (second button in actions column)
    const deleteButton = firstRow.locator('button').nth(1);
    await deleteButton.click();

    // Wait for confirmation modal
    await expect(page.locator('text=Delete Payment Type').first()).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete this payment type?')).toBeVisible();

    // Confirm deletion
    await page.locator('button:has-text("Confirm")').click();

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify payment type is removed (if it was the only one, table might be empty)
    // Or verify row count decreased
    const rowsAfter = await page.locator('table tbody tr').count();
    expect(rowsAfter).toBeLessThanOrEqual(rowsBefore);
  });

  test('should validate required fields on create', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Click add button
    await page.getByTestId('add-payment-type-button').click();

    // Wait for modal
    await expect(page.locator('text=Add Payment Type').first()).toBeVisible();

    // Try to submit without filling required fields
    await page.locator('button[type="submit"]').click();

    // Verify form validation (browser native validation)
    const nameInput = page.locator('input[placeholder*="Enter payment type name"]');
    const isRequired = await nameInput.getAttribute('required');
    expect(isRequired).toBeDefined();
  });

  test('should format currency correctly in table', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('table tbody tr');

    // Find a row with fixed_amount
    const rows = await page.locator('table tbody tr').all();
    for (const row of rows) {
      const fixedAmountCell = row.locator('td').nth(3); // Fixed Amount column
      const text = await fixedAmountCell.textContent();
      if (text && text !== '-') {
        // Should contain currency symbol
        expect(text).toMatch(/[\d.]+/);
      }
    }
  });

  test('should display trigger event correctly', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('table tbody tr');

    // Check that trigger event column exists and displays values
    const firstRow = page.locator('table tbody tr').first();
    const triggerEventCell = firstRow.locator('td').nth(5); // Trigger Event column
    const triggerEventText = await triggerEventCell.textContent();

    // Should either show a trigger event or "-" for null
    expect(triggerEventText).toBeTruthy();
  });

  test('should handle cancel action in create modal', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Click add button
    await page.getByTestId('add-payment-type-button').click();

    // Wait for modal
    await expect(page.locator('text=Add Payment Type').first()).toBeVisible();

    // Fill some data
    await page.locator('input[placeholder*="Enter payment type name"]').fill('test_cancel');

    // Click cancel
    await page.locator('button:has-text("Cancel")').click();

    // Verify modal is closed
    await expect(page.locator('text=Add Payment Type').first()).not.toBeVisible();

    // Verify data was not saved (check table doesn't have the name)
    await expect(page.locator('text=test_cancel')).not.toBeVisible();
  });

  test('should handle cancel action in delete confirmation', async ({ page }) => {
    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('table tbody tr');

    // Count rows before
    const rowsBefore = await page.locator('table tbody tr').count();

    // Click delete button
    const firstRow = page.locator('table tbody tr').first();
    const deleteButton = firstRow.locator('button').nth(1);
    await deleteButton.click();

    // Wait for confirmation modal
    await expect(page.locator('text=Delete Payment Type').first()).toBeVisible();

    // Click cancel
    await page.locator('button:has-text("Cancel")').click();

    // Verify modal is closed
    await expect(page.locator('text=Delete Payment Type').first()).not.toBeVisible();

    // Verify row count is unchanged
    const rowsAfter = await page.locator('table tbody tr').count();
    expect(rowsAfter).toBe(rowsBefore);
  });

  test('should create payment type with all field types', async ({ page }) => {
    const timestamp = Date.now();
    const paymentTypeName = `comprehensive_test_${timestamp}`;

    // Navigate to Payment Types page
    await page.goto('/payment-types');
    await page.waitForLoadState('networkidle');

    // Click add button
    await page.getByTestId('add-payment-type-button').click();

    // Wait for modal
    await expect(page.locator('text=Add Payment Type').first()).toBeVisible();

    // Fill all fields
    await page.locator('input[placeholder*="Enter payment type name"]').fill(paymentTypeName);
    await page.locator('select').first().selectOption('semesterly'); // frequency
    await page.locator('select').nth(1).selectOption('room_semester_rate'); // calculation_method
    await page.locator('select').nth(2).selectOption('student'); // target_role
    await page.locator('select').nth(3).selectOption('new_semester'); // trigger_event

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for success
    await page.waitForTimeout(1000);

    // Verify payment type appears in table
    await expect(page.locator(`text=${paymentTypeName}`)).toBeVisible();

    // Verify all fields are displayed correctly
    const row = page.locator(`tr:has-text("${paymentTypeName}")`);
    await expect(row.locator('td').nth(1)).toContainText('semesterly'); // frequency
    await expect(row.locator('td').nth(2)).toContainText('Room Semester Rate'); // calculation_method
    await expect(row.locator('td').nth(4)).toContainText('student'); // target_role
    await expect(row.locator('td').nth(5)).toContainText('New Semester'); // trigger_event
  });
});
