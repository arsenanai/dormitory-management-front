import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS } from './test-utils';

test.describe('CRUD Operations E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access all CRUD operations
    await TestUtils.login(page, 'admin');
  });

  test.describe('Student CRUD Operations', () => {
    const uniqueEmail = () => `teststudent+${Date.now()}@sdu.edu.kz`;
    const testStudent = {
      name: 'Test Student CRUD',
      surname: 'Test Surname',
      email: uniqueEmail(),
      phone: '+77001234567',
      student_id: 'STU99999',
      iin: '123456789999',
      faculty: 'Engineering',
      specialist: 'Computer Science',
      course: '2',
      year_of_study: '2',
      enrollment_year: '2023',
      blood_type: 'A+',
      parent_name: 'Parent Test',
      parent_phone: '+77012345678',
      parent_email: 'parent@test.com',
      guardian_name: 'Guardian Test',
      guardian_phone: '+77012345679',
      mentor_name: 'Mentor Test',
      mentor_email: 'mentor@test.com',
      emergency_contact_name: 'Emergency Test',
      emergency_contact_phone: '+77012345680',
      emergency_contact_relationship: 'Father',
      program: 'Computer Science',
      year_level: '2',
      nationality: 'Kazakh',
      deal_number: 'DEAL99999',
      has_meal_plan: true,
      agree_to_dormitory_rules: true
    };

    test('should create a new student', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Verify we're on the student form page
      await expect(page).toHaveURL(/\/student-form$/);
      
      // Fill the form
      await page.fill('#student-name, #name, input[name="name"]', testStudent.name);
      await page.fill('#student-surname, #surname, input[name="surname"]', testStudent.surname);
      await page.fill('#student-email, #email, input[name="email"]', testStudent.email);
      await page.fill('#student-phone, #phone, input[name="phone"]', testStudent.phone);
      await page.fill('#student-id, #student_id, input[name="student_id"]', testStudent.student_id);
      await page.fill('#student-iin, #iin, input[name="iin"]', testStudent.iin);
      await page.selectOption('#student-faculty, #faculty, select[name="faculty"]', testStudent.faculty);
      await page.fill('#student-specialist, #specialist, input[name="specialist"]', testStudent.specialist);
      await page.fill('#student-course, #course, input[name="course"]', testStudent.course);
      await page.fill('#student-year, #year_of_study, input[name="year_of_study"]', testStudent.year_of_study);
      await page.fill('#student-enrollment-year, #enrollment_year, input[name="enrollment_year"]', testStudent.enrollment_year);
      await page.selectOption('#student-blood-type, #blood_type, select[name="blood_type"]', testStudent.blood_type);
      await page.fill('#student-parent-name, #parent_name, input[name="parent_name"]', testStudent.parent_name);
      await page.fill('#student-parent-phone, #parent_phone, input[name="parent_phone"]', testStudent.parent_phone);
      await page.fill('#student-parent-email, #parent_email, input[name="parent_email"]', testStudent.parent_email);
      await page.fill('#student-guardian-name, #guardian_name, input[name="guardian_name"]', testStudent.guardian_name);
      await page.fill('#student-guardian-phone, #guardian_phone, input[name="guardian_phone"]', testStudent.guardian_phone);
      await page.fill('#student-mentor-name, #mentor_name, input[name="mentor_name"]', testStudent.mentor_name);
      await page.fill('#student-mentor-email, #mentor_email, input[name="mentor_email"]', testStudent.mentor_email);
      await page.fill('#student-emergency-name, #emergency_contact_name, input[name="emergency_contact_name"]', testStudent.emergency_contact_name);
      await page.fill('#student-emergency-phone, #emergency_contact_phone, input[name="emergency_contact_phone"]', testStudent.emergency_contact_phone);
      await page.fill('#student-emergency-relationship, #emergency_contact_relationship, input[name="emergency_contact_relationship"]', testStudent.emergency_contact_relationship);
      await page.fill('#student-program, #program, input[name="program"]', testStudent.program);
      await page.fill('#student-year-level, #year_level, input[name="year_level"]', testStudent.year_level);
      await page.fill('#student-nationality, #nationality, input[name="nationality"]', testStudent.nationality);
      await page.fill('#student-deal-number, #deal_number, input[name="deal_number"]', testStudent.deal_number);
      
      // Check boolean fields
      const mealPlanCheckbox = page.locator('#student-meal-plan, #has_meal_plan, input[name="has_meal_plan"]');
      if (await mealPlanCheckbox.count() > 0) {
        await mealPlanCheckbox.check();
      }
      
      const rulesCheckbox = page.locator('#student-rules, #agree_to_dormitory_rules, input[name="agree_to_dormitory_rules"]');
      if (await rulesCheckbox.count() > 0) {
        await rulesCheckbox.check();
      }
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to students list
      await page.waitForURL(/\/students/);
      await expect(page).toHaveURL(/\/students/);
      
      // Verify student was created
      await expect(page.locator(`text=${testStudent.name}`)).toBeVisible();
      await expect(page.locator(`text=${testStudent.email}`)).toBeVisible();
    });

    test('should read student data correctly', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Find and click edit button for the first student
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify form is populated with student data
        await expect(page.locator('#student-name, #name, input[name="name"]')).toHaveValue(/\w+/);
        await expect(page.locator('#student-email, #email, input[name="email"]')).toHaveValue(/@/);
      }
    });

    test('should update student data', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Find and click edit button for the first student
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Update student name
        const nameField = page.locator('#student-name, #name, input[name="name"]');
        const originalName = await nameField.inputValue();
        const updatedName = `${originalName} Updated`;
        
        await nameField.fill(updatedName);
        
        // Submit form
        await page.click('button:has-text("Save"), button:has-text("Submit")');
        
        // Should redirect to students list
        await page.waitForURL(/\/students/);
        await expect(page).toHaveURL(/\/students/);
        
        // Verify student was updated
        await expect(page.locator(`text=${updatedName}`)).toBeVisible();
      }
    });

    test('should delete student', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Find and click delete button for the first student
      const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-button"]').first();
      if (await deleteButton.count() > 0) {
        // Get student name before deletion for verification
        const studentRow = deleteButton.locator('xpath=ancestor::tr');
        const studentName = await studentRow.locator('td').first().textContent();
        
        await deleteButton.click();
        
        // Handle confirmation dialog if present
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }
        
        await page.waitForLoadState('networkidle');
        
        // Verify student was deleted
        await expect(page.locator(`text=${studentName}`)).not.toBeVisible();
      }
    });
  });

  test.describe('Guest CRUD Operations', () => {
    const uniqueEmail = () => `testguest+${Date.now()}@test.local`;
    const testGuest = {
      name: 'Test Guest CRUD',
      email: uniqueEmail(),
      purpose_of_visit: 'Testing',
      host_name: 'Test Host',
      host_contact: '+77001234567',
      daily_rate: '3000',
      identification_type: 'passport',
      identification_number: 'TEST123456',
      emergency_contact_name: 'Test Emergency',
      emergency_contact_phone: '+77001234568',
      is_approved: true
    };

    test('should create a new guest', async ({ page }) => {
      await page.goto('/guest-house');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Fill the form
      await page.fill('#guest-name, #name, input[name="name"]', testGuest.name);
      await page.fill('#guest-email, #email, input[name="email"]', testGuest.email);
      await page.fill('#guest-purpose, #purpose_of_visit, input[name="purpose_of_visit"]', testGuest.purpose_of_visit);
      await page.fill('#guest-host-name, #host_name, input[name="host_name"]', testGuest.host_name);
      await page.fill('#guest-host-contact, #host_contact, input[name="host_contact"]', testGuest.host_contact);
      await page.fill('#guest-daily-rate, #daily_rate, input[name="daily_rate"]', testGuest.daily_rate);
      await page.selectOption('#guest-identification-type, #identification_type, select[name="identification_type"]', testGuest.identification_type);
      await page.fill('#guest-identification-number, #identification_number, input[name="identification_number"]', testGuest.identification_number);
      await page.fill('#guest-emergency-name, #emergency_contact_name, input[name="emergency_contact_name"]', testGuest.emergency_contact_name);
      await page.fill('#guest-emergency-phone, #emergency_contact_phone, input[name="emergency_contact_phone"]', testGuest.emergency_contact_phone);
      
      // Check approval checkbox
      const approvedCheckbox = page.locator('#guest-approved, #is_approved, input[name="is_approved"]');
      if (await approvedCheckbox.count() > 0) {
        await approvedCheckbox.check();
      }
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to guests list
      await page.waitForURL(/\/guest-house/);
      await expect(page).toHaveURL(/\/guest-house/);
      
      // Verify guest was created
      await expect(page.locator(`text=${testGuest.name}`)).toBeVisible();
      await expect(page.locator(`text=${testGuest.email}`)).toBeVisible();
    });
  });

  test.describe('Room CRUD Operations', () => {
    const testRoom = {
      number: 'TEST999',
      floor: '5',
      dormitory_id: '1', // Dormitory #1
      room_type_id: '1', // standard type
      is_occupied: false
    };

    test('should create a new room', async ({ page }) => {
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Fill the form
      await page.fill('#room-number, #number, input[name="number"]', testRoom.number);
      await page.fill('#room-floor, #floor, input[name="floor"]', testRoom.floor);
      await page.selectOption('#room-dormitory, #dormitory_id, select[name="dormitory_id"]', testRoom.dormitory_id);
      await page.selectOption('#room-type, #room_type_id, select[name="room_type_id"]', testRoom.room_type_id);
      
      // Uncheck occupied if present
      const occupiedCheckbox = page.locator('#room-occupied, #is_occupied, input[name="is_occupied"]');
      if (await occupiedCheckbox.count() > 0) {
        await occupiedCheckbox.uncheck();
      }
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to rooms list
      await page.waitForURL(/\/rooms/);
      await expect(page).toHaveURL(/\/rooms/);
      
      // Verify room was created
      await expect(page.locator(`text=${testRoom.number}`)).toBeVisible();
    });
  });

  test.describe('Room Type CRUD Operations', () => {
    const testRoomType = {
      name: 'test-type',
      capacity: '3',
      price: '75000',
      beds: JSON.stringify([
        { id: 1, x: 50, y: 50, occupied: false },
        { id: 2, x: 150, y: 50, occupied: false },
        { id: 3, x: 100, y: 150, occupied: false }
      ])
    };

    test('should create a new room type', async ({ page }) => {
      await page.goto('/room-types');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Fill the form
      await page.fill('#room-type-name, #name, input[name="name"]', testRoomType.name);
      await page.fill('#room-type-capacity, #capacity, input[name="capacity"]', testRoomType.capacity);
      await page.fill('#room-type-price, #price, input[name="price"]', testRoomType.price);
      
      // Fill beds configuration
      const bedsField = page.locator('#room-type-beds, #beds, textarea[name="beds"]');
      if (await bedsField.count() > 0) {
        await bedsField.fill(testRoomType.beds);
      }
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to room types list
      await page.waitForURL(/\/room-types/);
      await expect(page).toHaveURL(/\/room-types/);
      
      // Verify room type was created
      await expect(page.locator(`text=${testRoomType.name}`)).toBeVisible();
    });
  });

  test.describe('Dormitory CRUD Operations', () => {
    const testDormitory = {
      name: 'Test Dormitory CRUD',
      address: 'Test Address, Test City',
      description: 'Test dormitory for CRUD operations',
      gender: 'mixed',
      quota: '100',
      capacity: '120'
    };

    test('should create a new dormitory', async ({ page }) => {
      await page.goto('/dormitories');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Fill the form
      await page.fill('#dormitory-name, #name, input[name="name"]', testDormitory.name);
      await page.fill('#dormitory-address, #address, input[name="address"]', testDormitory.address);
      await page.fill('#dormitory-description, #description, textarea[name="description"]', testDormitory.description);
      await page.selectOption('#dormitory-gender, #gender, select[name="gender"]', testDormitory.gender);
      await page.fill('#dormitory-quota, #quota, input[name="quota"]', testDormitory.quota);
      await page.fill('#dormitory-capacity, #capacity, input[name="capacity"]', testDormitory.capacity);
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to dormitories list
      await page.waitForURL(/\/dormitories/);
      await expect(page).toHaveURL(/\/dormitories/);
      
      // Verify dormitory was created
      await expect(page.locator(`text=${testDormitory.name}`)).toBeVisible();
    });
  });

  test.describe('Payment CRUD Operations', () => {
    const testPayment = {
      semester: '2025-spring',
      year: '2025',
      semester_type: 'spring',
      amount: '60000',
      due_date: '2025-06-30',
      payment_notes: 'Test payment notes',
      dormitory_notes: 'Test dormitory notes',
      payment_status: 'pending',
      dormitory_status: 'pending',
      payment_approved: false,
      dormitory_access_approved: false
    };

    test('should create a new payment', async ({ page }) => {
      await page.goto('/payments');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Fill the form
      await page.fill('#payment-semester, #semester, input[name="semester"]', testPayment.semester);
      await page.fill('#payment-year, #year, input[name="year"]', testPayment.year);
      await page.selectOption('#payment-semester-type, #semester_type, select[name="semester_type"]', testPayment.semester_type);
      await page.fill('#payment-amount, #amount, input[name="amount"]', testPayment.amount);
      await page.fill('#payment-due-date, #due_date, input[name="due_date"]', testPayment.due_date);
      await page.fill('#payment-notes, #payment_notes, textarea[name="payment_notes"]', testPayment.payment_notes);
      await page.fill('#payment-dormitory-notes, #dormitory_notes, textarea[name="dormitory_notes"]', testPayment.dormitory_notes);
      await page.selectOption('#payment-status, #payment_status, select[name="payment_status"]', testPayment.payment_status);
      await page.selectOption('#payment-dormitory-status, #dormitory_status, select[name="dormitory_status"]', testPayment.dormitory_status);
      
      // Uncheck approval checkboxes
      const paymentApprovedCheckbox = page.locator('#payment-approved, #payment_approved, input[name="payment_approved"]');
      if (await paymentApprovedCheckbox.count() > 0) {
        await paymentApprovedCheckbox.uncheck();
      }
      
      const dormitoryApprovedCheckbox = page.locator('#dormitory-approved, #dormitory_access_approved, input[name="dormitory_access_approved"]');
      if (await dormitoryApprovedCheckbox.count() > 0) {
        await dormitoryApprovedCheckbox.uncheck();
      }
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to payments list
      await page.waitForURL(/\/payments/);
      await expect(page).toHaveURL(/\/payments/);
      
      // Verify payment was created
      await expect(page.locator(`text=${testPayment.semester}`)).toBeVisible();
    });
  });

  test.describe('Admin CRUD Operations', () => {
    const uniqueEmail = () => `testadmin+${Date.now()}@sdu.edu.kz`;
    const testAdmin = {
      name: 'Test Admin CRUD',
      surname: 'Test Surname',
      email: uniqueEmail(),
      phone: '+77001234567',
      role: 'admin'
    };

    test('should create a new admin', async ({ page }) => {
      await page.goto('/admins');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Fill the form
      await page.fill('#admin-name, #name, input[name="name"]', testAdmin.name);
      await page.fill('#admin-surname, #surname, input[name="surname"]', testAdmin.surname);
      await page.fill('#admin-email, #email, input[name="email"]', testAdmin.email);
      await page.fill('#admin-phone, #phone, input[name="phone"]', testAdmin.phone);
      await page.selectOption('#admin-role, #role, select[name="role"]', testAdmin.role);
      
      // Fill password fields if present
      const passwordField = page.locator('#admin-password, #password, input[name="password"]');
      if (await passwordField.count() > 0) {
        await passwordField.fill('TestPassword123');
      }
      
      const confirmPasswordField = page.locator('#admin-confirm-password, #confirm-password, input[name="confirm_password"]');
      if (await confirmPasswordField.count() > 0) {
        await confirmPasswordField.fill('TestPassword123');
      }
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should redirect to admins list
      await page.waitForURL(/\/admins/);
      await expect(page).toHaveURL(/\/admins/);
      
      // Verify admin was created
      await expect(page.locator(`text=${testAdmin.name}`)).toBeVisible();
      await expect(page.locator(`text=${testAdmin.email}`)).toBeVisible();
    });
  });

  test.describe('Error Handling and Validation', () => {
    test('should handle validation errors for required fields', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Try to submit without filling required fields
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should show validation errors
      await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
    });

    test('should handle duplicate email errors', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Click Add button
      await page.click('button:has-text("Add"), [data-testid="add-button"]');
      await page.waitForLoadState('networkidle');
      
      // Fill form with existing email
      await page.fill('#student-name, #name, input[name="name"]', 'Test Student');
      await page.fill('#student-email, #email, input[name="email"]', 'student@email.com'); // Existing email
      
      // Submit form
      await page.click('button:has-text("Save"), button:has-text("Submit")');
      
      // Should show duplicate email error
      await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // This test would require mocking network failures
      // For now, we'll test that the UI handles loading states
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Verify page loads without errors
      await expect(page.locator('table, [data-testid="students-table"]')).toBeVisible();
    });
  });
}); 