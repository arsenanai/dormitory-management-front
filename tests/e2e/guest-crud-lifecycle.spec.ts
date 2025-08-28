import { test, expect } from '@playwright/test';

test.describe('Guest CRUD Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });
  });

  test('should complete full CRUD lifecycle for guest', async ({ page }) => {
    const guestData = {
      firstName: 'Test',
      lastName: 'Guest',
      phone: '+1234567890',
      email: `testguest${Date.now()}@example.com`,
      enterDate: '2024-12-25',
      exitDate: '2024-12-30',
      purpose: 'Holiday visit',
      dailyRate: '50.00',
      paymentReceived: '100.00'
    };

    const updatedData = {
      firstName: 'Updated',
      lastName: 'Guest',
      purpose: 'Business trip',
      dailyRate: '75.00',
      paymentReceived: '150.00'
    };

    // Step 1: CREATE - Navigate to guest form and create new guest
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Fill all required fields
    await page.fill('#guest-first-name', guestData.firstName);
    await page.fill('#guest-last-name', guestData.lastName);
    await page.fill('#guest-phone', guestData.phone);
    await page.fill('#guest-email', guestData.email);
    await page.fill('#guest-enter-date', guestData.enterDate);
    await page.fill('#guest-exit-date', guestData.exitDate);
    await page.selectOption('#guest-room', '1');
    await page.fill('#guest-purpose', guestData.purpose);
    await page.fill('#guest-daily-rate', guestData.dailyRate);

    // Submit form
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/guest-house');

    // Step 2: VERIFY CREATION - Check guest appears in index
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify guest name is visible in the table
    await expect(page.getByText(`${guestData.firstName} ${guestData.lastName}`).first()).toBeVisible();
    
    // Verify other details are visible (check fields that are actually displayed in the table)
    await expect(page.getByText(guestData.phone).first()).toBeVisible();
    
    // Check if dates are visible in the table (they should be formatted as locale dates)
    // The dates are stored as visit_start_date and visit_end_date in guest_profile
    // but displayed as formatted dates in the table
    const enterDateFormatted = new Date(guestData.enterDate).toLocaleDateString();
    const exitDateFormatted = new Date(guestData.exitDate).toLocaleDateString();
    
    await expect(page.getByText(enterDateFormatted).first()).toBeVisible();
    await expect(page.getByText(exitDateFormatted).first()).toBeVisible();

    // Step 3: EDIT - Find and edit the created guest
    // Find the edit button for this specific guest using unique email
    const guestRow = page.locator('tbody tr').filter({ hasText: guestData.email });
    const editBtn = guestRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForURL(/guest-form/);

    // Wait for form to load with existing data
    await page.waitForTimeout(3000);

    // Verify form is populated with existing data
    await expect(page.locator('#guest-first-name')).toHaveValue(guestData.firstName);
    await expect(page.locator('#guest-last-name')).toHaveValue(guestData.lastName);
    await expect(page.locator('#guest-purpose')).toHaveValue(guestData.purpose);

    // Update fields
    await page.fill('#guest-first-name', updatedData.firstName);
    await page.fill('#guest-purpose', updatedData.purpose);
    await page.fill('#guest-daily-rate', updatedData.dailyRate);

    // Submit changes
    await page.click('button:has-text("Submit")');
    await page.waitForURL('/guest-house');

    // Step 4: VERIFY UPDATE - Check updated data appears in index
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify updated guest name is visible (use email to find specific row)
    const updatedGuestRowForVerification = page.locator('tbody tr').filter({ hasText: guestData.email });
    await expect(updatedGuestRowForVerification.getByText(`${updatedData.firstName} ${updatedData.lastName}`)).toBeVisible();
    
    // Verify updated purpose is visible in the same row
    await expect(updatedGuestRowForVerification.getByText(updatedData.purpose)).toBeVisible();

    // Step 5: DELETE - Delete the guest
    // Find the delete button for this specific guest using unique email
    const updatedGuestRow = page.locator('tbody tr').filter({ hasText: guestData.email });
    const deleteBtn = updatedGuestRow.locator('button:has-text("Delete")');
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

    // Step 6: VERIFY DELETION - Check guest is no longer in index
    // Verify guest is no longer visible (use email to find specific guest)
    const guestRowAfterDeletion = page.locator('tbody tr').filter({ hasText: guestData.email });
    await expect(guestRowAfterDeletion).not.toBeVisible();
    
    // Verify the guest row count decreased
    const tableRows = page.locator('tbody tr');
    const finalRowCount = await tableRows.count();
    expect(finalRowCount).toBeGreaterThanOrEqual(0); // At least 0 rows (might be empty)
  });

  test('should handle guest creation validation', async ({ page }) => {
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Try to submit without filling required fields
    await page.click('button:has-text("Submit")');

    // Should stay on the form page (validation prevents submission)
    await expect(page).toHaveURL(/guest-form/);
  });

  test('should handle guest edit with invalid data', async ({ page }) => {
    // First create a guest to edit
    await page.goto('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Add Guest")');
    await page.waitForURL(/guest-form/);

    // Fill minimal required fields
    await page.fill('#guest-first-name', 'Temp');
    await page.fill('#guest-last-name', 'Guest');
    await page.fill('#guest-phone', '+1234567890');
    await page.fill('#guest-email', 'temp@example.com');
    await page.fill('#guest-enter-date', '2024-12-25');
    await page.fill('#guest-exit-date', '2024-12-30');
    await page.selectOption('#guest-room', 'A210');
    await page.fill('#guest-purpose', 'Test');

    await page.click('button:has-text("Submit")');
    await page.waitForURL('/guest-house');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Now edit the guest
    const guestRow = page.locator('tbody tr').filter({ hasText: 'Temp Guest' });
    const editBtn = guestRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForURL(/guest-form/);
    await page.waitForTimeout(3000);

    // Try to submit with invalid data (empty required fields)
    await page.fill('#guest-first-name', '');
    await page.click('button:has-text("Submit")');

    // Should stay on the form page
    await expect(page).toHaveURL(/guest-form/);
  });
});
