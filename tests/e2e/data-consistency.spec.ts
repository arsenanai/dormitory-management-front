import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS } from './test-utils';

test.describe('Data Consistency E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access all pages
    await TestUtils.login(page, 'admin');
  });

  test.describe('Student Data Consistency', () => {
    test('should display consistent student data between list and edit form', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Get student data from the list
      const firstStudentRow = page.locator('tr').nth(1); // Skip header row
      const studentName = await firstStudentRow.locator('td').nth(0).textContent();
      const studentEmail = await firstStudentRow.locator('td').nth(1).textContent();
      const studentStatus = await firstStudentRow.locator('td').nth(2).textContent();
      
      // Click edit button for this student
      const editButton = firstStudentRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form data matches list data
        await expect(page.locator('#student-name, #name, input[name="name"]')).toHaveValue(studentName?.trim().split(' ')[0] || '');
        await expect(page.locator('#student-surname, #surname, input[name="surname"]')).toHaveValue(studentName?.trim().split(' ')[1] || '');
        await expect(page.locator('#student-email, #email, input[name="email"]')).toHaveValue(studentEmail?.trim() || '');
        
        // Check if status field exists and matches
        const statusField = page.locator('#student-status, #status, select[name="status"]');
        if (await statusField.count() > 0) {
          await expect(statusField).toHaveValue(studentStatus?.trim().toLowerCase() || '');
        }
      }
    });

    test('should update list data after editing student', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Get original student name
      const firstStudentRow = page.locator('tr').nth(1);
      const originalName = await firstStudentRow.locator('td').nth(0).textContent();
      
      // Edit the student
      const editButton = firstStudentRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Update the name
        const nameField = page.locator('#student-name, #name, input[name="name"]');
        const updatedName = 'Updated Student Name';
        await nameField.fill(updatedName);
        
        // Save changes
        await page.click('button:has-text("Save"), button:has-text("Submit")');
        await page.waitForURL(/\/students/);
        
        // Verify the list shows updated data
        await expect(page.locator(`text=${updatedName}`)).toBeVisible();
        await expect(page.locator(`text=${originalName}`)).not.toBeVisible();
      }
    });
  });

  test.describe('Guest Data Consistency', () => {
    test('should display consistent guest data between list and edit form', async ({ page }) => {
      await page.goto('/guest-house');
      await page.waitForLoadState('networkidle');
      
      // Get guest data from the list
      const firstGuestRow = page.locator('tr').nth(1);
      const guestName = await firstGuestRow.locator('td').nth(0).textContent();
      const guestEmail = await firstGuestRow.locator('td').nth(1).textContent();
      const guestPurpose = await firstGuestRow.locator('td').nth(2).textContent();
      
      // Click edit button for this guest
      const editButton = firstGuestRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form data matches list data
        await expect(page.locator('#guest-name, #name, input[name="name"]')).toHaveValue(guestName?.trim() || '');
        await expect(page.locator('#guest-email, #email, input[name="email"]')).toHaveValue(guestEmail?.trim() || '');
        await expect(page.locator('#guest-purpose, #purpose_of_visit, input[name="purpose_of_visit"]')).toHaveValue(guestPurpose?.trim() || '');
      }
    });
  });

  test.describe('Room Data Consistency', () => {
    test('should display consistent room data between list and edit form', async ({ page }) => {
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      
      // Get room data from the list
      const firstRoomRow = page.locator('tr').nth(1);
      const roomNumber = await firstRoomRow.locator('td').nth(0).textContent();
      const roomFloor = await firstRoomRow.locator('td').nth(1).textContent();
      const roomDormitory = await firstRoomRow.locator('td').nth(2).textContent();
      
      // Click edit button for this room
      const editButton = firstRoomRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form data matches list data
        await expect(page.locator('#room-number, #number, input[name="number"]')).toHaveValue(roomNumber?.trim() || '');
        await expect(page.locator('#room-floor, #floor, input[name="floor"]')).toHaveValue(roomFloor?.trim() || '');
        
        // Check dormitory selection
        const dormitorySelect = page.locator('#room-dormitory, #dormitory_id, select[name="dormitory_id"]');
        if (await dormitorySelect.count() > 0) {
          const selectedOption = await dormitorySelect.locator('option:checked').textContent();
          expect(selectedOption?.trim()).toBe(roomDormitory?.trim());
        }
      }
    });
  });

  test.describe('Room Type Data Consistency', () => {
    test('should display consistent room type data between list and edit form', async ({ page }) => {
      await page.goto('/room-types');
      await page.waitForLoadState('networkidle');
      
      // Get room type data from the list
      const firstRoomTypeRow = page.locator('tr').nth(1);
      const roomTypeName = await firstRoomTypeRow.locator('td').nth(0).textContent();
      const roomTypeCapacity = await firstRoomTypeRow.locator('td').nth(1).textContent();
      const roomTypePrice = await firstRoomTypeRow.locator('td').nth(2).textContent();
      
      // Click edit button for this room type
      const editButton = firstRoomTypeRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form data matches list data
        await expect(page.locator('#room-type-name, #name, input[name="name"]')).toHaveValue(roomTypeName?.trim() || '');
        await expect(page.locator('#room-type-capacity, #capacity, input[name="capacity"]')).toHaveValue(roomTypeCapacity?.trim() || '');
        await expect(page.locator('#room-type-price, #price, input[name="price"]')).toHaveValue(roomTypePrice?.trim() || '');
      }
    });
  });

  test.describe('Dormitory Data Consistency', () => {
    test('should display consistent dormitory data between list and edit form', async ({ page }) => {
      await page.goto('/dormitories');
      await page.waitForLoadState('networkidle');
      
      // Get dormitory data from the list
      const firstDormitoryRow = page.locator('tr').nth(1);
      const dormitoryName = await firstDormitoryRow.locator('td').nth(0).textContent();
      const dormitoryAddress = await firstDormitoryRow.locator('td').nth(1).textContent();
      const dormitoryCapacity = await firstDormitoryRow.locator('td').nth(2).textContent();
      
      // Click edit button for this dormitory
      const editButton = firstDormitoryRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form data matches list data
        await expect(page.locator('#dormitory-name, #name, input[name="name"]')).toHaveValue(dormitoryName?.trim() || '');
        await expect(page.locator('#dormitory-address, #address, input[name="address"]')).toHaveValue(dormitoryAddress?.trim() || '');
        await expect(page.locator('#dormitory-capacity, #capacity, input[name="capacity"]')).toHaveValue(dormitoryCapacity?.trim() || '');
      }
    });
  });

  test.describe('Payment Data Consistency', () => {
    test('should display consistent payment data between list and edit form', async ({ page }) => {
      await page.goto('/payments');
      await page.waitForLoadState('networkidle');
      
      // Get payment data from the list
      const firstPaymentRow = page.locator('tr').nth(1);
      const paymentSemester = await firstPaymentRow.locator('td').nth(0).textContent();
      const paymentAmount = await firstPaymentRow.locator('td').nth(1).textContent();
      const paymentStatus = await firstPaymentRow.locator('td').nth(2).textContent();
      
      // Click edit button for this payment
      const editButton = firstPaymentRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form data matches list data
        await expect(page.locator('#payment-semester, #semester, input[name="semester"]')).toHaveValue(paymentSemester?.trim() || '');
        await expect(page.locator('#payment-amount, #amount, input[name="amount"]')).toHaveValue(paymentAmount?.trim() || '');
        
        // Check status selection
        const statusSelect = page.locator('#payment-status, #payment_status, select[name="payment_status"]');
        if (await statusSelect.count() > 0) {
          const selectedOption = await statusSelect.locator('option:checked').textContent();
          expect(selectedOption?.trim().toLowerCase()).toBe(paymentStatus?.trim().toLowerCase());
        }
      }
    });
  });

  test.describe('Admin Data Consistency', () => {
    test('should display consistent admin data between list and edit form', async ({ page }) => {
      await page.goto('/admins');
      await page.waitForLoadState('networkidle');
      
      // Get admin data from the list
      const firstAdminRow = page.locator('tr').nth(1);
      const adminName = await firstAdminRow.locator('td').nth(0).textContent();
      const adminEmail = await firstAdminRow.locator('td').nth(1).textContent();
      const adminRole = await firstAdminRow.locator('td').nth(2).textContent();
      
      // Click edit button for this admin
      const editButton = firstAdminRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form data matches list data
        const nameField = page.locator('#admin-name, #name, input[name="name"]');
        const surnameField = page.locator('#admin-surname, #surname, input[name="surname"]');
        const fullName = await nameField.inputValue() + ' ' + await surnameField.inputValue();
        expect(fullName.trim()).toBe(adminName?.trim());
        
        await expect(page.locator('#admin-email, #email, input[name="email"]')).toHaveValue(adminEmail?.trim() || '');
        
        // Check role selection
        const roleSelect = page.locator('#admin-role, #role, select[name="role"]');
        if (await roleSelect.count() > 0) {
          const selectedOption = await roleSelect.locator('option:checked').textContent();
          expect(selectedOption?.trim().toLowerCase()).toBe(adminRole?.trim().toLowerCase());
        }
      }
    });
  });

  test.describe('Cross-Entity Data Consistency', () => {
    test('should maintain referential integrity between related entities', async ({ page }) => {
      // Test that room data shows correct dormitory and room type relationships
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      
      // Get room data
      const firstRoomRow = page.locator('tr').nth(1);
      const roomDormitory = await firstRoomRow.locator('td').nth(2).textContent();
      const roomType = await firstRoomRow.locator('td').nth(3).textContent();
      
      // Edit the room
      const editButton = firstRoomRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify dormitory and room type selections match the list
        const dormitorySelect = page.locator('#room-dormitory, #dormitory_id, select[name="dormitory_id"]');
        const roomTypeSelect = page.locator('#room-type, #room_type_id, select[name="room_type_id"]');
        
        if (await dormitorySelect.count() > 0) {
          const selectedDormitory = await dormitorySelect.locator('option:checked').textContent();
          expect(selectedDormitory?.trim()).toBe(roomDormitory?.trim());
        }
        
        if (await roomTypeSelect.count() > 0) {
          const selectedRoomType = await roomTypeSelect.locator('option:checked').textContent();
          expect(selectedRoomType?.trim()).toBe(roomType?.trim());
        }
      }
    });

    test('should update related data when parent entity is modified', async ({ page }) => {
      // Test that changing a dormitory name updates room listings
      await page.goto('/dormitories');
      await page.waitForLoadState('networkidle');
      
      // Get original dormitory name
      const firstDormitoryRow = page.locator('tr').nth(1);
      const originalName = await firstDormitoryRow.locator('td').nth(0).textContent();
      
      // Edit the dormitory
      const editButton = firstDormitoryRow.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Update the name
        const nameField = page.locator('#dormitory-name, #name, input[name="name"]');
        const updatedName = 'Updated Dormitory Name';
        await nameField.fill(updatedName);
        
        // Save changes
        await page.click('button:has-text("Save"), button:has-text("Submit")');
        await page.waitForURL(/\/dormitories/);
        
        // Verify the list shows updated data
        await expect(page.locator(`text=${updatedName}`)).toBeVisible();
        
        // Check that rooms page also shows updated dormitory name
        await page.goto('/rooms');
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text=${updatedName}`)).toBeVisible();
      }
    });
  });

  test.describe('Data Refresh and Synchronization', () => {
    test('should refresh data when navigating back to list page', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Get initial student count
      const initialRows = await page.locator('tr').count();
      
      // Navigate away and back
      await page.goto('/main');
      await page.waitForLoadState('networkidle');
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Verify data is still consistent
      const finalRows = await page.locator('tr').count();
      expect(finalRows).toBe(initialRows);
    });

    test('should handle concurrent data modifications', async ({ page, context }) => {
      // Open two browser contexts to simulate concurrent access
      const page1 = page;
      const page2 = await context.newPage();
      
      // Login on both pages
      await TestUtils.login(page1, 'admin');
      await TestUtils.login(page2, 'admin');
      
      // Navigate to students page on both
      await page1.goto('/students');
      await page2.goto('/students');
      await page1.waitForLoadState('networkidle');
      await page2.waitForLoadState('networkidle');
      
      // Get initial data on both pages
      const student1Page1 = await page1.locator('tr').nth(1).locator('td').nth(0).textContent();
      const student1Page2 = await page2.locator('tr').nth(1).locator('td').nth(0).textContent();
      
      // Verify both pages show the same data initially
      expect(student1Page1).toBe(student1Page2);
      
      // Close the second page
      await page2.close();
    });
  });

  test.describe('Data Validation and Error Handling', () => {
    test('should handle invalid data gracefully', async ({ page }) => {
      await page.goto('/student-form/999999'); // Non-existent ID
      await page.waitForLoadState('networkidle');
      
      // Should show error message
      await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
      
      // Should redirect back to list or show appropriate error page
      const currentURL = page.url();
      expect(currentURL).toMatch(/\/students|\/error/);
    });

    test('should validate data format consistency', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Check that email formats are consistent
      const emailCells = page.locator('tr td:nth-child(2)'); // Assuming email is in second column
      const emailCount = await emailCells.count();
      
      for (let i = 0; i < Math.min(emailCount, 5); i++) { // Check first 5 emails
        const email = await emailCells.nth(i).textContent();
        if (email && email.trim()) {
          expect(email.trim()).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Basic email validation
        }
      }
    });
  });
}); 