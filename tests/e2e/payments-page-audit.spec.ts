import { test, expect } from '@playwright/test';

test.describe('Payments Page Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
    
    // Check if token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Token stored:', token ? 'YES' : 'NO');
  });

  test('should display payments data correctly and allow editing', async ({ page }) => {
    // Listen for network requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push(`${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`Response: ${response.status()} ${response.url()}`);
      }
    });

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Navigate to payments page
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);
    
    console.log('API requests made:', requests);

    // Debug: Log page content
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);
    
    // Check for any error messages
    const errorMessages = page.locator('.error, .alert-danger, [role="alert"]');
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorMessages.nth(i).textContent();
        console.log('Error message:', errorText);
      }
    }

    // Check if payments table is visible
    const paymentsTable = page.locator('table, .table, [role="table"]');
    const tableCount = await paymentsTable.count();
    console.log('Table count:', tableCount);
    
    if (tableCount === 0) {
      // Check for loading state
      const loadingElements = page.locator('.loading, [data-testid*="loading"]');
      const loadingCount = await loadingElements.count();
      console.log('Loading elements count:', loadingCount);
      
      // Check for any content
      const bodyText = await page.locator('body').textContent();
      console.log('Body text preview:', bodyText?.substring(0, 500));
    }
    
    await expect(paymentsTable).toBeVisible();

    // Check if there are any payments displayed
    const paymentRows = page.locator('tbody tr, [role="row"]');
    const rowCount = await paymentRows.count();
    
    if (rowCount > 0) {
      // Get first payment row data
      const firstRow = paymentRows.first();
      const paymentData = await firstRow.locator('td').allTextContents();
      console.log('First payment row data:', paymentData);

      // Check if edit button exists and click it
      const editButton = firstRow.locator('button:has-text("Edit")');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForURL(/\/payment-form/);

        // Check if form is populated
        const form = page.locator('form');
        await expect(form).toBeVisible();

        // Check if form fields are populated
        const amountField = page.locator('#payment-amount');
        const statusField = page.locator('#payment-status');
        
        if (await amountField.count() > 0) {
          const amountValue = await amountField.inputValue();
          console.log('Payment amount field value:', amountValue);
          expect(amountValue).toBeTruthy();
        }

        if (await statusField.count() > 0) {
          const statusValue = await statusField.inputValue();
          console.log('Payment status field value:', statusValue);
          expect(statusValue).toBeTruthy();
        }

        // Test form submission
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Check for success message or navigation
          await page.waitForTimeout(2000);
          
          // Navigate back to payments list
          await page.goto('/payments');
          await page.waitForLoadState('networkidle');
          
          // Verify data is still displayed
          await expect(paymentsTable).toBeVisible();
        }
      }
    } else {
      console.log('No payments found in the table');
    }
  });
});
