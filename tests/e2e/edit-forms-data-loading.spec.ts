import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS } from './test-utils';

test.describe('Edit Forms Data Loading E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access all forms
    await TestUtils.login(page, 'admin');
  });

  test.describe('Student Form Data Loading', () => {
    test('should load student data correctly in edit form', async ({ page }) => {
      // First navigate to students page to get a student ID
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Find the first student row and get its edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the student form page
        await expect(page).toHaveURL(/\/student-form\//);
        
        // Check that form fields are populated with student data from seeders
        // From DevelopmentSeeder: Test Student data
        await expect(page.locator('#student-name, #name, input[name="name"]')).toHaveValue('Test');
        await expect(page.locator('#student-surname, #surname, input[name="surname"]')).toHaveValue('Student');
        await expect(page.locator('#student-email, #email, input[name="email"]')).toHaveValue('student@email.com');
        
        // Check phone number field
        const phoneField = page.locator('#student-phone, #phone, input[name="phone"]');
        if (await phoneField.count() > 0) {
          await expect(phoneField).toHaveValue('+77001234567');
        }
        
        // Check student-specific fields from StudentProfile
        await expect(page.locator('#student-id, #student_id, input[name="student_id"]')).toHaveValue('STU00001');
        await expect(page.locator('#student-iin, #iin, input[name="iin"]')).toHaveValue('123456789001');
        await expect(page.locator('#student-faculty, #faculty, select[name="faculty"]')).toHaveValue('Engineering');
        await expect(page.locator('#student-specialist, #specialist, input[name="specialist"]')).toHaveValue('Software Engineering');
        await expect(page.locator('#student-course, #course, input[name="course"]')).toHaveValue('1');
        await expect(page.locator('#student-year, #year_of_study, input[name="year_of_study"]')).toHaveValue('1');
        await expect(page.locator('#student-enrollment-year, #enrollment_year, input[name="enrollment_year"]')).toHaveValue('2024');
        await expect(page.locator('#student-blood-type, #blood_type, select[name="blood_type"]')).toHaveValue('O+');
        await expect(page.locator('#student-parent-name, #parent_name, input[name="parent_name"]')).toHaveValue('Parent Test Student');
        await expect(page.locator('#student-parent-phone, #parent_phone, input[name="parent_phone"]')).toHaveValue('+77012345678');
        await expect(page.locator('#student-parent-email, #parent_email, input[name="parent_email"]')).toHaveValue('parent_student@email.com');
        await expect(page.locator('#student-guardian-name, #guardian_name, input[name="guardian_name"]')).toHaveValue('Guardian Test Student');
        await expect(page.locator('#student-guardian-phone, #guardian_phone, input[name="guardian_phone"]')).toHaveValue('+77012345679');
        await expect(page.locator('#student-mentor-name, #mentor_name, input[name="mentor_name"]')).toHaveValue('Mentor Test Student');
        await expect(page.locator('#student-mentor-email, #mentor_email, input[name="mentor_email"]')).toHaveValue('mentor_student@email.com');
        await expect(page.locator('#student-emergency-name, #emergency_contact_name, input[name="emergency_contact_name"]')).toHaveValue('Emergency Test Student');
        await expect(page.locator('#student-emergency-phone, #emergency_contact_phone, input[name="emergency_contact_phone"]')).toHaveValue('+77012345680');
        await expect(page.locator('#student-emergency-relationship, #emergency_contact_relationship, input[name="emergency_contact_relationship"]')).toHaveValue('Father');
        await expect(page.locator('#student-program, #program, input[name="program"]')).toHaveValue('Computer Science');
        await expect(page.locator('#student-year-level, #year_level, input[name="year_level"]')).toHaveValue('1');
        await expect(page.locator('#student-nationality, #nationality, input[name="nationality"]')).toHaveValue('Kazakh');
        await expect(page.locator('#student-deal-number, #deal_number, input[name="deal_number"]')).toHaveValue('DEAL00001');
        
        // Check boolean fields
        const mealPlanCheckbox = page.locator('#student-meal-plan, #has_meal_plan, input[name="has_meal_plan"]');
        if (await mealPlanCheckbox.count() > 0) {
          await expect(mealPlanCheckbox).toBeChecked();
        }
        
        const rulesCheckbox = page.locator('#student-rules, #agree_to_dormitory_rules, input[name="agree_to_dormitory_rules"]');
        if (await rulesCheckbox.count() > 0) {
          await expect(rulesCheckbox).toBeChecked();
        }
      }
    });
  });

  test.describe('Guest Form Data Loading', () => {
    test('should load guest data correctly in edit form', async ({ page }) => {
      // First navigate to guests page to get a guest ID
      await page.goto('/guest-house');
      await page.waitForLoadState('networkidle');
      
      // Find the first guest row and get its edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the guest form page
        await expect(page).toHaveURL(/\/guest-form\//);
        
        // Check that form fields are populated with guest data from seeders
        // From DevelopmentSeeder: Test Guest data
        await expect(page.locator('#guest-name, #name, input[name="name"]')).toHaveValue('Test Guest');
        await expect(page.locator('#guest-email, #email, input[name="email"]')).toHaveValue('guest@test.local');
        
        // Check guest-specific fields from GuestProfile
        await expect(page.locator('#guest-purpose, #purpose_of_visit, input[name="purpose_of_visit"]')).toHaveValue('Academic Visit');
        await expect(page.locator('#guest-host-name, #host_name, input[name="host_name"]')).toHaveValue('Dr. Smith');
        await expect(page.locator('#guest-host-contact, #host_contact, input[name="host_contact"]')).toHaveValue('+77001234567');
        await expect(page.locator('#guest-daily-rate, #daily_rate, input[name="daily_rate"]')).toHaveValue('5000');
        await expect(page.locator('#guest-identification-type, #identification_type, select[name="identification_type"]')).toHaveValue('passport');
        await expect(page.locator('#guest-identification-number, #identification_number, input[name="identification_number"]')).toHaveValue('AB1234567');
        await expect(page.locator('#guest-emergency-name, #emergency_contact_name, input[name="emergency_contact_name"]')).toHaveValue('Emergency Contact');
        await expect(page.locator('#guest-emergency-phone, #emergency_contact_phone, input[name="emergency_contact_phone"]')).toHaveValue('+77001234568');
        
        // Check boolean fields
        const approvedCheckbox = page.locator('#guest-approved, #is_approved, input[name="is_approved"]');
        if (await approvedCheckbox.count() > 0) {
          await expect(approvedCheckbox).toBeChecked();
        }
      }
    });
  });

  test.describe('Room Form Data Loading', () => {
    test('should load room data correctly in edit form', async ({ page }) => {
      // First navigate to rooms page to get a room number
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      
      // Find the first room row and get its edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the room form page
        await expect(page).toHaveURL(/\/room-form\//);
        
        // Check that form fields are populated with room data from seeders
        // From DevelopmentSeeder: room data
        await expect(page.locator('#room-number, #number, input[name="number"]')).toHaveValue('101');
        await expect(page.locator('#room-floor, #floor, input[name="floor"]')).toHaveValue('1');
        await expect(page.locator('#room-dormitory, #dormitory_id, select[name="dormitory_id"]')).toHaveValue('1'); // Dormitory #1
        await expect(page.locator('#room-type, #room_type_id, select[name="room_type_id"]')).toHaveValue('1'); // standard type
        
        // Check boolean fields
        const occupiedCheckbox = page.locator('#room-occupied, #is_occupied, input[name="is_occupied"]');
        if (await occupiedCheckbox.count() > 0) {
          // Should be checked if room has students assigned
          await expect(occupiedCheckbox).toBeChecked();
        }
      }
    });
  });

  test.describe('Room Type Form Data Loading', () => {
    test('should load room type data correctly in edit form', async ({ page }) => {
      // First navigate to room types page to get a room type ID
      await page.goto('/room-types');
      await page.waitForLoadState('networkidle');
      
      // Find the first room type row and get its edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the room type form page
        await expect(page).toHaveURL(/\/room-type-form\//);
        
        // Check that form fields are populated with room type data from seeders
        // From DevelopmentSeeder: standard room type
        await expect(page.locator('#room-type-name, #name, input[name="name"]')).toHaveValue('standard');
        await expect(page.locator('#room-type-capacity, #capacity, input[name="capacity"]')).toHaveValue('2');
        await expect(page.locator('#room-type-price, #price, input[name="price"]')).toHaveValue('50000');
        
        // Check beds configuration (JSON field)
        const bedsField = page.locator('#room-type-beds, #beds, textarea[name="beds"]');
        if (await bedsField.count() > 0) {
          const bedsValue = await bedsField.inputValue();
          expect(bedsValue).toContain('"id": 1');
          expect(bedsValue).toContain('"id": 2');
        }
      }
    });
  });

  test.describe('Dormitory Form Data Loading', () => {
    test('should load dormitory data correctly in edit form', async ({ page }) => {
      // First navigate to dormitories page to get a dormitory ID
      await page.goto('/dormitories');
      await page.waitForLoadState('networkidle');
      
      // Find the first dormitory row and get its edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the dormitory form page
        await expect(page).toHaveURL(/\/dormitory-form\//);
        
        // Check that form fields are populated with dormitory data from seeders
        // From DevelopmentSeeder: Dormitory #1
        await expect(page.locator('#dormitory-name, #name, input[name="name"]')).toHaveValue('Dormitory #1');
        await expect(page.locator('#dormitory-address, #address, input[name="address"]')).toHaveValue('Almaty, Al-Farabi Avenue, 71');
        await expect(page.locator('#dormitory-description, #description, textarea[name="description"]')).toHaveValue('Main student dormitory');
        await expect(page.locator('#dormitory-gender, #gender, select[name="gender"]')).toHaveValue('mixed');
        await expect(page.locator('#dormitory-quota, #quota, input[name="quota"]')).toHaveValue('200');
        await expect(page.locator('#dormitory-capacity, #capacity, input[name="capacity"]')).toHaveValue('200');
      }
    });
  });

  test.describe('Payment Form Data Loading', () => {
    test('should load payment data correctly in edit form', async ({ page }) => {
      // First navigate to payments page to get a payment ID
      await page.goto('/payments');
      await page.waitForLoadState('networkidle');
      
      // Find the first payment row and get its edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the payment form page
        await expect(page).toHaveURL(/\/payment-form\//);
        
        // Check that form fields are populated with payment data from seeders
        // From DevelopmentSeeder: semester payment data
        await expect(page.locator('#payment-semester, #semester, input[name="semester"]')).toHaveValue('2025-fall');
        await expect(page.locator('#payment-year, #year, input[name="year"]')).toHaveValue('2025');
        await expect(page.locator('#payment-semester-type, #semester_type, select[name="semester_type"]')).toHaveValue('fall');
        await expect(page.locator('#payment-amount, #amount, input[name="amount"]')).toHaveValue('50000');
        await expect(page.locator('#payment-due-date, #due_date, input[name="due_date"]')).toHaveValue(/\d{4}-\d{2}-\d{2}/);
        await expect(page.locator('#payment-notes, #payment_notes, textarea[name="payment_notes"]')).toHaveValue('Paid in full');
        await expect(page.locator('#payment-dormitory-notes, #dormitory_notes, textarea[name="dormitory_notes"]')).toHaveValue('Access granted');
        await expect(page.locator('#payment-status, #payment_status, select[name="payment_status"]')).toHaveValue('approved');
        await expect(page.locator('#payment-dormitory-status, #dormitory_status, select[name="dormitory_status"]')).toHaveValue('approved');
        
        // Check boolean fields
        const paymentApprovedCheckbox = page.locator('#payment-approved, #payment_approved, input[name="payment_approved"]');
        if (await paymentApprovedCheckbox.count() > 0) {
          await expect(paymentApprovedCheckbox).toBeChecked();
        }
        
        const dormitoryApprovedCheckbox = page.locator('#dormitory-approved, #dormitory_access_approved, input[name="dormitory_access_approved"]');
        if (await dormitoryApprovedCheckbox.count() > 0) {
          await expect(dormitoryApprovedCheckbox).toBeChecked();
        }
      }
    });
  });

  test.describe('Admin Form Data Loading', () => {
    test('should load admin data correctly in edit form', async ({ page }) => {
      // First navigate to admins page to get an admin ID
      await page.goto('/admins');
      await page.waitForLoadState('networkidle');
      
      // Find the first admin row and get its edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the admin form page
        await expect(page).toHaveURL(/\/admin-form\//);
        
        // Check that form fields are populated with admin data from seeders
        // From DevelopmentSeeder: admin data
        await expect(page.locator('#admin-name, #name, input[name="name"]')).toHaveValue('Ibrahim');
        await expect(page.locator('#admin-surname, #surname, input[name="surname"]')).toHaveValue('Tuncer');
        await expect(page.locator('#admin-email, #email, input[name="email"]')).toHaveValue('ibrahim@example.com');
        
        // Check phone number field
        const phoneField = page.locator('#admin-phone, #phone, input[name="phone"]');
        if (await phoneField.count() > 0) {
          await expect(phoneField).toHaveValue('+77001234567');
        }
        
        // Check role field
        await expect(page.locator('#admin-role, #role, select[name="role"]')).toHaveValue('admin');
      }
    });
  });

  test.describe('Form Validation and Error Handling', () => {
    test('should show validation errors for invalid data', async ({ page }) => {
      await page.goto('/student-form/1');
      await page.waitForLoadState('networkidle');
      
      // Clear required fields to trigger validation
      await page.locator('#student-name, #name, input[name="name"]').clear();
      await page.locator('#student-email, #email, input[name="email"]').clear();
      
      // Try to save
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should show validation errors
      await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      await page.goto('/student-form/999999'); // Non-existent ID
      await page.waitForLoadState('networkidle');
      
      // Should show error message for non-existent record
      await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
    });
  });

  test.describe('Form Navigation and State Management', () => {
    test('should preserve form data when navigating away and back', async ({ page }) => {
      await page.goto('/student-form/1');
      await page.waitForLoadState('networkidle');
      
      // Modify a field
      await page.locator('#student-name, #name, input[name="name"]').fill('Modified Name');
      
      // Navigate away
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Navigate back
      await page.goto('/student-form/1');
      await page.waitForLoadState('networkidle');
      
      // Should show original data (not the modified data)
      await expect(page.locator('#student-name, #name, input[name="name"]')).toHaveValue('Test');
    });

    test('should handle form submission and redirect correctly', async ({ page }) => {
      await page.goto('/student-form/1');
      await page.waitForLoadState('networkidle');
      
      // Modify a field
      await page.locator('#student-name, #name, input[name="name"]').fill('Updated Name');
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to students list page
      await page.waitForURL(/\/students/);
      await expect(page).toHaveURL(/\/students/);
    });
  });
}); 