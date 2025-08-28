import { test, expect } from '@playwright/test';

test.describe('Comprehensive Data Structure Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should display students with camelCase data structure', async ({ page }) => {
    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');

    // Check if students table is visible
    const studentsTable = page.locator('table, .table, [role="table"]');
    await expect(studentsTable).toBeVisible();

    // Get first student row
    const studentRows = page.locator('tbody tr, [role="row"]');
    const rowCount = await studentRows.count();
    
    if (rowCount > 0) {
      const firstRow = studentRows.first();
      const cells = firstRow.locator('td');
      const cellCount = await cells.count();
      
      // Check that we have the expected number of columns
      expect(cellCount).toBeGreaterThan(5);
      
      // Get cell content
      const cellContents = await cells.allTextContents();
      console.log('Student row data:', cellContents);
      
      // Check that enrollment year and faculty are populated (not empty or "No data available")
      const enrollmentYearCell = cellContents[4]; // Assuming enrollment year is in 5th column
      const facultyCell = cellContents[5]; // Assuming faculty is in 6th column
      
      expect(enrollmentYearCell).toBeTruthy();
      expect(enrollmentYearCell).not.toBe('No data available');
      expect(enrollmentYearCell).not.toBe('');
      
      expect(facultyCell).toBeTruthy();
      expect(facultyCell).not.toBe('No data available');
      expect(facultyCell).not.toBe('');
    }
  });

  test('should display payments with camelCase data structure', async ({ page }) => {
    // Navigate to payments page
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');

    // Check if payments table is visible
    const paymentsTable = page.locator('table, .table, [role="table"]');
    await expect(paymentsTable).toBeVisible();

    // Get first payment row
    const paymentRows = page.locator('tbody tr, [role="row"]');
    const rowCount = await paymentRows.count();
    
    if (rowCount > 0) {
      const firstRow = paymentRows.first();
      const cells = firstRow.locator('td');
      const cellCount = await cells.count();
      
      // Check that we have the expected number of columns
      expect(cellCount).toBeGreaterThan(5);
      
      // Get cell content
      const cellContents = await cells.allTextContents();
      console.log('Payment row data:', cellContents);
      
      // Check that payment data is populated (not "No data available")
      const userCell = cellContents[0]; // User column
      const amountCell = cellContents[1]; // Amount column
      const typeCell = cellContents[2]; // Type column
      const statusCell = cellContents[4]; // Status column
      
      expect(userCell).toBeTruthy();
      expect(userCell).not.toBe('No data available');
      expect(userCell).not.toBe('');
      
      expect(amountCell).toBeTruthy();
      expect(amountCell).not.toBe('No data available');
      expect(amountCell).not.toBe('');
      
      expect(typeCell).toBeTruthy();
      expect(typeCell).not.toBe('No data available');
      expect(typeCell).not.toBe('');
      
      expect(statusCell).toBeTruthy();
      expect(statusCell).not.toBe('No data available');
      expect(statusCell).not.toBe('');
    }
  });

  test('should display guests with camelCase data structure', async ({ page }) => {
    // Navigate to guests page
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');

    // Check if guests table is visible
    const guestsTable = page.locator('table, .table, [role="table"]');
    if (await guestsTable.count() > 0) {
      await expect(guestsTable).toBeVisible();

      // Get first guest row
      const guestRows = page.locator('tbody tr, [role="row"]');
      const rowCount = await guestRows.count();
      
      if (rowCount > 0) {
        const firstRow = guestRows.first();
        const cells = firstRow.locator('td');
        const cellCount = await cells.count();
        
        // Check that we have the expected number of columns
        expect(cellCount).toBeGreaterThan(3);
        
        // Get cell content
        const cellContents = await cells.allTextContents();
        console.log('Guest row data:', cellContents);
        
        // Check that guest data is populated (not "No data available")
        const nameCell = cellContents[0]; // Name column
        const emailCell = cellContents[1]; // Email column
        
        expect(nameCell).toBeTruthy();
        expect(nameCell).not.toBe('No data available');
        expect(nameCell).not.toBe('');
        
        expect(emailCell).toBeTruthy();
        expect(emailCell).not.toBe('No data available');
        expect(emailCell).not.toBe('');
      }
    }
  });

  test('should test edit form field population with camelCase data', async ({ page }) => {
    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');

    // Get first student row and click edit
    const studentRows = page.locator('tbody tr, [role="row"]');
    const rowCount = await studentRows.count();
    
    if (rowCount > 0) {
      const firstRow = studentRows.first();
      const editButton = firstRow.locator('button:has-text("Edit"), a:has-text("Edit")');
      
      if (await editButton.count() > 0) {
        await editButton.first().click();
        await page.waitForURL(/\/student-form/);

        // Check if form is populated with camelCase data
        const formContainer = page.locator('.grid.grid-cols-1.gap-8');
        await expect(formContainer).toBeVisible();

        // Wait for form to be populated (wait for success message or form data)
        await page.waitForTimeout(3000);
        
        // Check key form fields are populated
        const nameField = page.locator('#student-name');
        const emailField = page.locator('#student-email');
        const facultyField = page.locator('#student-faculty');
        const enrollmentYearField = page.locator('#student-enrollment-year');
        
        if (await nameField.count() > 0) {
          const nameValue = await nameField.inputValue();
          console.log('📝 Name field value:', nameValue);
          expect(nameValue).toBeTruthy();
          expect(nameValue).not.toBe('');
        }

        if (await emailField.count() > 0) {
          const emailValue = await emailField.inputValue();
          expect(emailValue).toBeTruthy();
          expect(emailValue).not.toBe('');
        }

        if (await facultyField.count() > 0) {
          const facultyValue = await facultyField.inputValue();
          expect(facultyValue).toBeTruthy();
          expect(facultyValue).not.toBe('');
        }

        if (await enrollmentYearField.count() > 0) {
          const enrollmentYearValue = await enrollmentYearField.inputValue();
          expect(enrollmentYearValue).toBeTruthy();
          expect(enrollmentYearValue).not.toBe('');
        }
      }
    }
  });
});
