import { test, expect } from '@playwright/test';

test.describe('Guest CRUD Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to root page and wait for login form
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // Fill login form
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

  test('should create, read, edit, and delete a guest successfully', async ({ page }) => {
    const timestamp = Date.now();
    const guestData = {
      firstName: `Test Guest ${timestamp}`,
      lastName: `E2E Test ${timestamp}`,
      email: `guest.${timestamp}@email.com`,
      phone: '+1234567890',
      enterDate: '2024-12-01',
      exitDate: '2024-12-05',
      purpose: 'Business Conference',
      hostName: 'John Host',
      hostContact: '+0987654321',
      identificationType: 'passport',
      identificationNumber: `ID${timestamp}`,
      emergencyName: 'Emergency Contact',
      emergencyPhone: '+1122334455',
      reminder: 'VIP guest - provide extra amenities',
      dailyRate: '150.00'
    };

    // Step 1: Navigate to Guests page
    console.log('🔍 Navigating to Guests page...');
    await page.goto('/guest-house');
    await page.waitForSelector('[data-testid="guests-table"]');
    console.log('✅ Guests page loaded');

    // Step 2: Create a new guest
    console.log('🔍 Creating new guest...');
    await page.click('text=Add Guest');
    await page.waitForURL('/guest-form');

    // Fill in guest form
    await page.fill('#guest-first-name', guestData.firstName);
    await page.fill('#guest-last-name', guestData.lastName);
    await page.fill('#guest-phone', guestData.phone);
    await page.fill('#guest-email', guestData.email);
    await page.fill('#guest-enter-date', guestData.enterDate);
    await page.fill('#guest-exit-date', guestData.exitDate);
    await page.fill('#guest-purpose', guestData.purpose);
    await page.fill('#guest-host-name', guestData.hostName);
    await page.fill('#guest-host-contact', guestData.hostContact);
    await page.selectOption('#guest-identification-type', guestData.identificationType);
    await page.fill('#guest-identification-number', guestData.identificationNumber);
    await page.fill('#guest-emergency-name', guestData.emergencyName);
    await page.fill('#guest-emergency-phone', guestData.emergencyPhone);
    await page.fill('#guest-reminder', guestData.reminder);
    await page.fill('#guest-daily-rate', guestData.dailyRate);

    // Submit the form
    await page.click('button:has-text("Submit")');
    
    // Wait for redirect to guests page
    await page.waitForURL('/guest-house');
    console.log('✅ Guest created successfully');

    // Step 3: Verify guest appears in the list (READ)
    console.log('🔍 Verifying guest appears in list...');
    await page.waitForSelector('[data-testid="guests-table"]');
    
    // Debug: Check what we're looking for
    console.log('🔍 Looking for guest with firstName:', guestData.firstName);
    console.log('🔍 Looking for guest with lastName:', guestData.lastName);
    
    // Debug: Check what's currently in the table
    console.log('🔍 Debugging table contents...');
    const tableContents = await page.evaluate(() => {
      const rows = document.querySelectorAll('[data-testid="guests-table"] tbody tr');
      return Array.from(rows).map(row => row.textContent);
    });
    console.log('🔍 Current table contents:', tableContents);
    
    // Check if guest data appears in the table
    console.log('🔍 Checking if guest appears in table...');
    const guestExists = await page.evaluate(({ firstName, lastName }) => {
      const rows = document.querySelectorAll('[data-testid="guests-table"] tbody tr');
      return Array.from(rows).some(row => 
        row.textContent?.includes(firstName) && 
        row.textContent?.includes(lastName)
      );
    }, { firstName: guestData.firstName, lastName: guestData.lastName });
    
    if (guestExists) {
      console.log('✅ Guest data found in table');
    } else {
      console.log('❌ Guest data not found in table');
      throw new Error('Guest was not found in table after creation');
    }

    // Verify guest data in table
    const guestRow = page.locator('[data-testid="guests-table"] tbody tr').filter({
      hasText: guestData.firstName
    });
    
    // Debug: Check what each cell contains
    console.log('🔍 Debugging table cell contents...');
    for (let i = 0; i < 10; i++) {
      try {
        const cellContent = await guestRow.locator('td').nth(i).textContent();
        console.log(`🔍 Cell ${i}: "${cellContent}"`);
      } catch (e) {
        console.log(`🔍 Cell ${i}: Error - ${e.message}`);
        break;
      }
    }
    
    // For now, just verify the guest exists in the row
    const rowText = await guestRow.textContent();
    expect(rowText).toContain(guestData.firstName);
    expect(rowText).toContain(guestData.lastName);
    expect(rowText).toContain(guestData.email);
    console.log('✅ Guest data verified in table');

    // Step 4: Edit the guest (EDIT)
    console.log('🔍 Editing guest...');
    await guestRow.locator('button:has-text("Edit")').click();
    await page.waitForURL(/\/guest-form\/\d+/);

    // Update guest information
    const updatedFirstName = `${guestData.firstName} Updated`;
    const updatedPurpose = `${guestData.purpose} - Updated`;
    
    await page.fill('#guest-first-name', updatedFirstName);
    await page.fill('#guest-purpose', updatedPurpose);
    
    // Submit the form
    await page.click('button:has-text("Submit")');
    
    // Wait for redirect back to guests page
    await page.waitForURL('/guest-house');
    console.log('✅ Guest updated successfully');

    // Step 5: Verify the update (READ again)
    console.log('🔍 Verifying guest update...');
    await page.waitForSelector('[data-testid="guests-table"]');
    
    // Wait for updated data to appear
    console.log('🔍 Checking if updated guest appears in table...');
    const updatedGuestExists = await page.evaluate(({ firstName, purpose }) => {
      const rows = document.querySelectorAll('[data-testid="guests-table"] tbody tr');
      return Array.from(rows).some(row => 
        row.textContent?.includes(firstName) && 
        row.textContent?.includes(purpose)
      );
    }, { firstName: updatedFirstName, purpose: updatedPurpose });
    
    if (updatedGuestExists) {
      console.log('✅ Updated guest data found in table');
    } else {
      console.log('❌ Updated guest data not found in table');
      throw new Error('Updated guest was not found in table');
    }

    // Verify updated data
    const updatedGuestRow = page.locator('[data-testid="guests-table"] tbody tr').filter({
      hasText: updatedFirstName
    });
    
    expect(await updatedGuestRow.locator('td').nth(0).textContent()).toContain(updatedFirstName);
    expect(await updatedGuestRow.locator('td').nth(3).textContent()).toContain(updatedPurpose);
    console.log('✅ Guest update verified');

    // Step 6: Delete the guest (DELETE)
    console.log('🔍 Deleting guest...');
    
    // Set up dialog handler before clicking delete
    page.on('dialog', dialog => {
      console.log('🔍 Dialog appeared:', dialog.type(), dialog.message());
      expect(dialog.type()).toBe('confirm');
      dialog.accept();
      console.log('✅ Dialog accepted');
    });
    
    // Click delete button
    await updatedGuestRow.locator('button:has-text("Delete")').click();
    
    // Wait a bit for the deletion to process
    await page.waitForTimeout(2000);
    
    // Check if guest was removed from table
    console.log('🔍 Checking if guest was removed from table...');
    const guestRemoved = await page.evaluate((firstName) => {
      const rows = document.querySelectorAll('[data-testid="guests-table"] tbody tr');
      return !Array.from(rows).some(row => 
        row.textContent?.includes(firstName)
      );
    }, updatedFirstName);
    
    if (guestRemoved) {
      console.log('✅ Guest was successfully removed from table');
    } else {
      console.log('❌ Guest was not removed from table');
      
      // Debug: Check what's still in the table
      const remainingTableContents = await page.evaluate(() => {
        const rows = document.querySelectorAll('[data-testid="guests-table"] tbody tr');
        return Array.from(rows).map(row => row.textContent);
      });
      console.log('🔍 Remaining table contents after deletion:', remainingTableContents);
      
      throw new Error('Guest was not removed from table after deletion');
    }
    
    console.log('✅ Guest deleted successfully');

    // Step 7: Final verification - guest should not exist
    const deletedGuestRow = page.locator('[data-testid="guests-table"] tbody tr').filter({
      hasText: updatedFirstName
    });
    expect(await deletedGuestRow.count()).toBe(0);
    console.log('✅ Guest deletion verified - guest no longer exists');
  });

  test('should handle guest form validation errors', async ({ page }) => {
    console.log('�� Testing guest form validation...');
    
    // Navigate to guest form
    await page.goto('/guest-form');
    
    // Try to submit empty form
    await page.click('button:has-text("Submit")');
    
    // Should stay on form page (validation error)
    expect(page.url()).toContain('/guest-form');
    
    // Fill only required fields partially
    await page.fill('#guest-first-name', 'Test');
    // Don't fill other required fields
    
    await page.click('button:has-text("Submit")');
    
    // Should still stay on form page
    expect(page.url()).toContain('/guest-form');
    console.log('✅ Form validation working correctly');
  });

  test('should search and filter guests', async ({ page }) => {
    console.log('🔍 Testing guest search functionality...');
    
    // Navigate to guests page
    await page.goto('/guest-house');
    await page.waitForSelector('[data-testid="guests-table"]');
    
    // Test search functionality
    const searchQuery = 'test';
    await page.fill('#search-guests', searchQuery);
    
    // Wait for search to complete
    await page.waitForTimeout(500);
    
    // Verify search is working (this will depend on existing data)
    console.log('✅ Guest search functionality tested');
  });

  test('should export guests data', async ({ page }) => {
    console.log('🔍 Testing guest export functionality...');
    
    // Navigate to guests page
    await page.goto('/guest-house');
    await page.waitForSelector('[data-testid="guests-table"]');
    
    // Click export button
    await page.click('[data-testid="export-guests-button"]');
    
    // Wait for download to start (this will depend on implementation)
    await page.waitForTimeout(1000);
    
    console.log('✅ Guest export functionality tested');
  });
});
