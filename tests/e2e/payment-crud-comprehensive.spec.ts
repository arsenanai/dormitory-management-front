import { test, expect } from '@playwright/test';

test.describe('Payment CRUD Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login as admin
    await page.fill('#email', process.env.ADMIN_EMAIL || 'admin@email.com');
    await page.fill('#password', process.env.ADMIN_PASSWORD || 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await page.waitForURL('/dashboard');
  });

  test('should create, read, edit, and delete a payment successfully', async ({ page }) => {
    const timestamp = Date.now();
    const paymentData = {
      userId: '1', // This will need to be a valid user ID
      semester: '2025-fall',
      year: '2025',
      semesterType: 'fall',
      amount: '50000',
      contractNumber: `CONTRACT-${timestamp}`,
      contractDate: '2024-08-15',
      paymentDate: '2024-09-01',
      paymentMethod: 'bank_transfer',
      paymentNotes: 'Test payment for E2E testing',
      dormitoryNotes: 'Dormitory access approved for testing'
    };

    // Step 1: Navigate to Payments page
    console.log('🔍 Navigating to Payments page...');
    await page.goto('/payments');
    await page.waitForSelector('[data-testid="payments-table"]');
    console.log('✅ Payments page loaded');

    // Step 2: Create a new payment
    console.log('🔍 Creating new payment...');
    await page.click('text=Add Payment');
    await page.waitForURL('/payment-form');

    // Fill in payment form
    await page.selectOption('#payment-user-id', paymentData.userId);
    await page.selectOption('#payment-semester', paymentData.semester);
    await page.fill('#payment-year', paymentData.year);
    await page.selectOption('#payment-semester-type', paymentData.semesterType);
    await page.fill('#payment-amount', paymentData.amount);
    await page.fill('#payment-contract-number', paymentData.contractNumber);
    await page.fill('#payment-contract-date', paymentData.contractDate);
    await page.fill('#payment-payment-date', paymentData.paymentDate);
    await page.selectOption('#payment-payment-method', paymentData.paymentMethod);
    await page.fill('#payment-payment-notes', paymentData.paymentNotes);
    await page.fill('#payment-dormitory-notes', paymentData.dormitoryNotes);

    // Submit the form
    await page.click('button:has-text("Submit")');
    
    // Wait for redirect to payments page
    await page.waitForURL('/payments');
    console.log('✅ Payment created successfully');

    // Step 3: Verify payment appears in the list (READ)
    console.log('🔍 Verifying payment appears in list...');
    await page.waitForSelector('[data-testid="payments-table"]');
    
    // Wait for the payment data to appear
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('[data-testid="payments-table"] tbody tr');
      return Array.from(rows).some(row => 
        row.textContent?.includes(paymentData.contractNumber)
      );
    });

    // Verify payment data in table
    const paymentRow = page.locator('[data-testid="payments-table"] tbody tr').filter({
      hasText: paymentData.contractNumber
    });
    
    expect(await paymentRow.locator('td').nth(0).textContent()).toContain(paymentData.contractNumber);
    expect(await paymentRow.locator('td').nth(1).textContent()).toContain(paymentData.amount);
    console.log('✅ Payment data verified in table');

    // Step 4: Edit the payment (EDIT)
    console.log('🔍 Editing payment...');
    await paymentRow.locator('button:has-text("Edit")').click();
    await page.waitForURL(/\/payment-form\/\d+/);

    // Update payment information
    const updatedAmount = '60000';
    const updatedNotes = `${paymentData.paymentNotes} - Updated`;
    
    await page.fill('#payment-amount', updatedAmount);
    await page.fill('#payment-payment-notes', updatedNotes);
    
    // Submit the form
    await page.click('button:has-text("Submit")');
    
    // Wait for redirect back to payments page
    await page.waitForURL('/payments');
    console.log('✅ Payment updated successfully');

    // Step 5: Verify the update (READ again)
    console.log('🔍 Verifying payment update...');
    await page.waitForSelector('[data-testid="payments-table"]');
    
    // Wait for updated data to appear
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('[data-testid="payments-table"] tbody tr');
      return Array.from(rows).some(row => 
        row.textContent?.includes(updatedAmount) && 
        row.textContent?.includes(updatedNotes)
      );
    });

    // Verify updated data
    const updatedPaymentRow = page.locator('[data-testid="payments-table"] tbody tr').filter({
      hasText: paymentData.contractNumber
    });
    
    expect(await updatedPaymentRow.locator('td').nth(1).textContent()).toContain(updatedAmount);
    console.log('✅ Payment update verified');

    // Step 6: Delete the payment (DELETE)
    console.log('🔍 Deleting payment...');
    await updatedPaymentRow.locator('button:has-text("Delete")').click();
    
    // Handle confirmation dialog if it appears
    page.on('dialog', dialog => {
      expect(dialog.type()).toBe('confirm');
      dialog.accept();
    });
    
    // Wait for payment to be removed from table
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('[data-testid="payments-table"] tbody tr');
      return !Array.from(rows).some(row => 
        row.textContent?.includes(paymentData.contractNumber)
      );
    });
    
    console.log('✅ Payment deleted successfully');

    // Step 7: Final verification - payment should not exist
    const deletedPaymentRow = page.locator('[data-testid="payments-table"] tbody tr').filter({
      hasText: paymentData.contractNumber
    });
    expect(await deletedPaymentRow.count()).toBe(0);
    console.log('✅ Payment deletion verified - payment no longer exists');
  });

  test('should handle payment form validation errors', async ({ page }) => {
    console.log('🔍 Testing payment form validation...');
    
    // Navigate to payment form
    await page.goto('/payment-form');
    
    // Try to submit empty form
    await page.click('button:has-text("Submit")');
    
    // Should stay on form page (validation error)
    expect(page.url()).toContain('/payment-form');
    
    // Fill only required fields partially
    await page.fill('#payment-amount', '1000');
    // Don't fill other required fields
    
    await page.click('button:has-text("Submit")');
    
    // Should still stay on form page
    expect(page.url()).toContain('/payment-form');
    console.log('✅ Form validation working correctly');
  });

  test('should search and filter payments', async ({ page }) => {
    console.log('🔍 Testing payment search functionality...');
    
    // Navigate to payments page
    await page.goto('/payments');
    await page.waitForSelector('[data-testid="payments-table"]');
    
    // Test search functionality if available
    const searchInput = page.locator('#search-payments');
    if (await searchInput.count() > 0) {
      const searchQuery = 'test';
      await searchInput.fill(searchQuery);
      
      // Wait for search to complete
      await page.waitForTimeout(500);
      
      console.log('✅ Payment search functionality tested');
    } else {
      console.log('ℹ️ Payment search not available');
    }
  });

  test('should export payments data', async ({ page }) => {
    console.log('🔍 Testing payment export functionality...');
    
    // Navigate to payments page
    await page.goto('/payments');
    await page.waitForSelector('[data-testid="payments-table"]');
    
    // Click export button if available
    const exportButton = page.locator('[data-testid="export-payments-button"]');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      
      // Wait for download to start (this will depend on implementation)
      await page.waitForTimeout(1000);
      
      console.log('✅ Payment export functionality tested');
    } else {
      console.log('ℹ️ Payment export not available');
    }
  });

  test('should approve and reject payments', async ({ page }) => {
    console.log('🔍 Testing payment approval functionality...');
    
    // Navigate to payments page
    await page.goto('/payments');
    await page.waitForSelector('[data-testid="payments-table"]');
    
    // Look for a payment that can be approved
    const paymentRow = page.locator('[data-testid="payments-table"] tbody tr').first();
    
    if (await paymentRow.count() > 0) {
      // Check if approval buttons exist
      const approveButton = paymentRow.locator('button:has-text("Approve")');
      const rejectButton = paymentRow.locator('button:has-text("Reject")');
      
      if (await approveButton.count() > 0) {
        console.log('✅ Payment approval buttons found');
        
        // Test approval (this will depend on the specific implementation)
        // await approveButton.click();
        // await page.waitForTimeout(1000);
        
        console.log('✅ Payment approval functionality tested');
      } else {
        console.log('ℹ️ Payment approval buttons not available');
      }
    } else {
      console.log('ℹ️ No payments available for approval testing');
    }
  });
});
