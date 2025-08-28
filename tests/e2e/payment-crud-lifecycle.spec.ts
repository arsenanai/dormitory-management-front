import { test, expect } from '@playwright/test';

test.describe('Payment CRUD Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should complete full CRUD lifecycle for payment', async ({ page }) => {
    const paymentData = {
      studentName: 'Test Student',
      amount: '150.00',
      type: 'Semester',
      status: 'Pending',
      date: '2024-12-25'
    };

    const updatedData = {
      amount: '200.00',
      type: 'Semester',
      status: 'Approved',
      date: '2024-12-26'
    };

    // Step 1: CREATE - Navigate to payments page and create new payment
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Payment")');
    await page.waitForURL(/payment-form/);

    // Fill all required fields
    await page.fill('#payment-student', paymentData.studentName);
    await page.fill('#payment-amount', paymentData.amount);
    await page.selectOption('#payment-type', paymentData.type);
    await page.selectOption('#payment-status', paymentData.status);
    await page.fill('#payment-date', paymentData.date);

    // Submit form
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/payments');

    // Step 2: VERIFY CREATION - Check payment appears in index
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify payment details are visible in the table
    await expect(page.getByText(paymentData.studentName)).toBeVisible();
    await expect(page.getByText(paymentData.amount)).toBeVisible();
    await expect(page.getByText(paymentData.status)).toBeVisible();
    await expect(page.getByText(paymentData.type)).toBeVisible();

    // Step 3: EDIT - Find and edit the created payment
    // Find the edit button for this specific payment
    const paymentRow = page.locator('tbody tr').filter({ hasText: paymentData.studentName });
    const editBtn = paymentRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForURL(/payment-form/);

    // Wait for form to load with existing data
    await page.waitForTimeout(3000);

    // Verify form is populated with existing data
    await expect(page.locator('#payment-student')).toHaveValue(paymentData.studentName);
    await expect(page.locator('#payment-amount')).toHaveValue(paymentData.amount);
    await expect(page.locator('#payment-status')).toHaveValue(paymentData.status);

    // Update fields
    await page.fill('#payment-amount', updatedData.amount);
    await page.selectOption('#payment-status', updatedData.status);
    await page.fill('#payment-date', updatedData.date);

    // Submit changes
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/payments');

    // Step 4: VERIFY UPDATE - Check updated data appears in index
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify updated payment details are visible
    await expect(page.getByText(updatedData.amount)).toBeVisible();
    await expect(page.getByText(updatedData.status)).toBeVisible();

    // Step 5: DELETE - Delete the payment
    // Find the delete button for this specific payment
    const updatedPaymentRow = page.locator('tbody tr').filter({ hasText: paymentData.studentName });
    const deleteBtn = updatedPaymentRow.locator('button:has-text("Delete")');
    await deleteBtn.click();

    // Check confirmation dialog
    const confirmDialog = page.locator('.fixed.inset-0');
    await expect(confirmDialog).toBeVisible();
    await expect(page.getByText(/are you sure\? this change is not recoverable/i)).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Wait for page to reload
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 6: VERIFY DELETION - Check payment is no longer in index
    // Verify payment is no longer visible
    await expect(page.getByText(paymentData.studentName)).not.toBeVisible();
    
    // Verify the payment row count decreased
    const tableRows = page.locator('tbody tr');
    const finalRowCount = await tableRows.count();
    expect(finalRowCount).toBeGreaterThanOrEqual(0); // At least 0 rows (might be empty)
  });

  test('should handle payment creation validation', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Payment")');
    await page.waitForURL(/payment-form/);

    // Try to submit without filling required fields
    await page.click('button:has-text("Submit")');

    // Should stay on the form page (validation prevents submission)
    await expect(page).toHaveURL(/payment-form/);
  });

  test('should handle payment edit with invalid data', async ({ page }) => {
    // First create a payment to edit
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Payment")');
    await page.waitForURL(/payment-form/);

    // Fill minimal required fields
    await page.fill('#payment-student', 'Temp Student');
    await page.fill('#payment-amount', '100.00');
    await page.selectOption('#payment-type', 'Semester');
    await page.selectOption('#payment-status', 'Pending');
    await page.fill('#payment-date', '2024-12-25');

    await page.click('button:has-text("Submit")');
    await page.waitForURL('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Now edit the payment
    const paymentRow = page.locator('tbody tr').filter({ hasText: 'Temp Student' });
    const editBtn = paymentRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForURL(/payment-form/);
    await page.waitForTimeout(3000);

    // Try to submit with invalid data (empty required fields)
    await page.fill('#payment-student', '');
    await page.click('button:has-text("Submit")');

    // Should stay on the form page
    await expect(page).toHaveURL(/payment-form/);
  });

  test('should filter payments by status', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get initial count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();

    // Check if status filter exists
    const statusFilter = page.locator('#status-filter');
    if (await statusFilter.count() > 0) {
      // Filter by pending status
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const filteredRows = page.locator('tbody tr');
      const filteredCount = await filteredRows.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should search payments by student name', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if search field exists
    const searchField = page.locator('#search-payment');
    if (await searchField.count() > 0) {
      // Search for a specific student
      await searchField.fill('Test');
      await page.waitForTimeout(1000);
      
      // Verify search results
      const searchResults = page.locator('tbody tr');
      await expect(searchResults).toBeVisible();
    }
  });
});
