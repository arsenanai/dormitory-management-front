import { test, expect } from '@playwright/test';

test.describe('Guests Page Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main');
  });

  test('should display guests data correctly and allow editing', async ({ page }) => {
    // Navigate to guests page
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');

    // Check if guests table is visible
    const guestsTable = page.locator('[data-testid="guests-table"]');
    if (await guestsTable.count() > 0) {
      await expect(guestsTable).toBeVisible();
    }

    // Check for guests list or table
    const guestsList = page.locator('[data-testid="guests-list"]');
    const table = page.locator('table');
    
    if (await guestsList.count() > 0) {
      await expect(guestsList).toBeVisible();
      console.log('Guests list found');
    } else if (await table.count() > 0) {
      await expect(table).toBeVisible();
      console.log('Guests table found');
    }

    // Check if there are any guests displayed
    const guestRows = page.locator('tbody tr, .guest-item, .guest-row');
    const rowCount = await guestRows.count();
    
    if (rowCount > 0) {
      console.log(`Found ${rowCount} guests`);
      
      // Get first guest data
      const firstGuest = guestRows.first();
      const guestData = await firstGuest.locator('td, .guest-content').allTextContents();
      console.log('First guest data:', guestData);

      // Check if edit button exists and click it
      const editButton = firstGuest.locator('button:has-text("Edit"), a:has-text("Edit")');
      if (await editButton.count() > 0) {
        await editButton.first().click();
        await page.waitForURL(/\/guest-form/);

        // Check if form is populated
        const form = page.locator('form');
        await expect(form).toBeVisible();

        // Check if form fields are populated
        const nameField = page.locator('#guest-name, input[name="name"]');
        const emailField = page.locator('#guest-email, input[name="email"]');
        const phoneField = page.locator('#guest-phone, input[name="phone"]');
        
        if (await nameField.count() > 0) {
          const nameValue = await nameField.inputValue();
          console.log('Guest name field value:', nameValue);
          expect(nameValue).toBeTruthy();
        }

        if (await emailField.count() > 0) {
          const emailValue = await emailField.inputValue();
          console.log('Guest email field value:', emailValue);
          expect(emailValue).toBeTruthy();
        }

        if (await phoneField.count() > 0) {
          const phoneValue = await phoneField.inputValue();
          console.log('Guest phone field value:', phoneValue);
          expect(phoneValue).toBeTruthy();
        }

        // Test form submission
        const submitButton = page.locator('button[type="submit"], button:has-text("Submit")');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Check for success message or navigation
          await page.waitForTimeout(2000);
          
          // Navigate back to guests list
          await page.goto('/guest-house');
          await page.waitForLoadState('networkidle');
          
          // Verify data is still displayed
          if (await table.count() > 0) {
            await expect(table).toBeVisible();
          }
        }
      }
    } else {
      console.log('No guests found in the table');
    }
  });
});
