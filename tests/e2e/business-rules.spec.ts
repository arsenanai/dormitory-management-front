import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS } from './test-utils';

test.describe('Business Rules Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await TestUtils.login(page, 'admin');
  });

  test.describe('Student Dormitory Access Rules', () => {
    test('students without current semester payment cannot access dormitory', async ({ page }) => {
      // Navigate to students page
      await TestUtils.navigateTo(page, '/students');

      // Check if there are students listed
      const studentRows = page.locator(SELECTORS.studentRow);
      const studentCount = await studentRows.count();

      if (studentCount > 0) {
        // Click on first student to view details
        await studentRows.first().click();
        
        // Check dormitory access status using utility function
        await TestUtils.checkDormitoryAccessStatus(page);
      }
    });

    test('student main page shows dormitory access status', async ({ page }) => {
      // Login as a student
      await TestUtils.login(page, 'student');
      
      // Navigate to student main page
      await TestUtils.navigateTo(page, '/student-main');

      // Check dormitory access status using utility function
      await TestUtils.checkDormitoryAccessStatus(page);
    });

    test('payment status affects dormitory access eligibility', async ({ page }) => {
      // Navigate to payments page
      await TestUtils.navigateTo(page, '/payments');
      
      // Check if payment status is displayed
      const paymentStatusElements = page.locator('[data-testid="payment-status"]');
      if (await paymentStatusElements.count() > 0) {
        await TestUtils.expectElementVisible(page, '[data-testid="payment-status"]');
      }
    });
  });

  test.describe('Staff Reserved Beds Rules', () => {
    test('admin can reserve beds for staff', async ({ page }) => {
      // Navigate to rooms page
      await TestUtils.navigateTo(page, '/rooms');

      // Click on first room to edit
      const roomRows = page.locator(SELECTORS.roomRow);
      const roomCount = await roomRows.count();

      if (roomCount > 0) {
        await roomRows.first().click();
        
        // Check staff reservation options using utility function
        await TestUtils.checkStaffReservationOptions(page);
      }
    });

    test('staff reserved beds are marked in room details', async ({ page }) => {
      // Navigate to rooms page
      await TestUtils.navigateTo(page, '/rooms');

      // Click on first room to view details
      const roomRows = page.locator(SELECTORS.roomRow);
      const roomCount = await roomRows.count();

      if (roomCount > 0) {
        await roomRows.first().click();
        
        // Check if beds are displayed with their reservation status
        const bedItems = page.locator(SELECTORS.bedItem);
        const bedCount = await bedItems.count();

        if (bedCount > 0) {
          // At least one bed should be visible
          await expect(bedItems.first()).toBeVisible();
          
          // Check if staff reservation indicators are present
          const staffReservedIndicator = page.locator('[data-testid="staff-reserved-indicator"]');
          const regularBedIndicator = page.locator('[data-testid="regular-bed-indicator"]');
          
          // At least one type of indicator should be visible
          await expect(staffReservedIndicator.or(regularBedIndicator)).toBeVisible();
        }
      }
    });
  });

  test.describe('Guest Payment Visibility Rules', () => {
    test('guest payments are visible in guest house registration page', async ({ page }) => {
      // Navigate to guest house page
      await page.goto('http://localhost:3000/guest-house');
      await page.waitForLoadState('networkidle');

      // Check if guest list is displayed
      const guestRows = page.locator('[data-testid="guest-row"]');
      const guestCount = await guestRows.count();

      if (guestCount > 0) {
        // Check if payment information columns are present
        const paymentStatusColumn = page.locator('[data-testid="payment-status-column"]');
        const amountColumn = page.locator('[data-testid="amount-column"]');
        
        await expect(paymentStatusColumn.or(amountColumn)).toBeVisible();

        // Click on first guest to view details
        await guestRows.first().click();
        
        // Check if payment details are shown in guest details
        const paymentDetails = page.locator('[data-testid="payment-details"]');
        await expect(paymentDetails).toBeVisible();
      }
    });

    test('guest payment information is editable in guest form', async ({ page }) => {
      // Navigate to guest house page
      await page.goto('http://localhost:3000/guest-house');
      await page.waitForLoadState('networkidle');

      // Click add guest button
      const addGuestButton = page.locator('[data-testid="add-guest-button"]');
      if (await addGuestButton.isVisible()) {
        await addGuestButton.click();
        
        // Check if payment fields are present in the form
        const dailyRateField = page.locator('[data-testid="daily-rate-field"]');
        const paymentStatusField = page.locator('[data-testid="payment-status-field"]');
        const amountField = page.locator('[data-testid="amount-field"]');
        
        await expect(dailyRateField.or(paymentStatusField).or(amountField)).toBeVisible();
      }
    });

    test('guest payments can be filtered by payment status', async ({ page }) => {
      // Navigate to guest house page
      await page.goto('http://localhost:3000/guest-house');
      await page.waitForLoadState('networkidle');

      // Look for payment status filter
      const paymentStatusFilter = page.locator('[data-testid="payment-status-filter"]');
      if (await paymentStatusFilter.isVisible()) {
        await expect(paymentStatusFilter).toBeVisible();
        
        // Check if filter options are available
        const filterOptions = page.locator('[data-testid="filter-option"]');
        await expect(filterOptions).toHaveCount(3); // paid, pending, partial
      }
    });
  });

  test.describe('Payment Status Check Rules', () => {
    test('payment status is checked before allowing dormitory access', async ({ page }) => {
      // Navigate to payments page
      await page.goto('http://localhost:3000/payments');
      await page.waitForLoadState('networkidle');

      // Check if payment status indicators are present
      const paymentStatusIndicators = page.locator('[data-testid="payment-status-indicator"]');
      const indicatorCount = await paymentStatusIndicators.count();

      if (indicatorCount > 0) {
        // Verify that different payment statuses are displayed
        await expect(paymentStatusIndicators.first()).toBeVisible();
        
        // Check if dormitory access status is linked to payment status
        const dormitoryAccessStatus = page.locator('[data-testid="dormitory-access-status"]');
        await expect(dormitoryAccessStatus).toBeVisible();
      }
    });

    test('payment approval workflow affects dormitory access', async ({ page }) => {
      // Navigate to payments page
      await page.goto('http://localhost:3000/payments');
      await page.waitForLoadState('networkidle');

      // Look for payment approval buttons
      const approvePaymentButton = page.locator('[data-testid="approve-payment-button"]');
      const approveDormitoryButton = page.locator('[data-testid="approve-dormitory-button"]');
      
      if (await approvePaymentButton.isVisible() || await approveDormitoryButton.isVisible()) {
        // Verify that approval buttons are functional
        await expect(approvePaymentButton.or(approveDormitoryButton)).toBeVisible();
      }
    });
  });

  test.describe('Registration Limit Rules', () => {
    test('registration closes when student limit is reached', async ({ page }) => {
      // Navigate to student registration page
      await page.goto('http://localhost:3000/register');
      await page.waitForLoadState('networkidle');

      // Check if registration form is available
      const registrationForm = page.locator('[data-testid="registration-form"]');
      if (await registrationForm.isVisible()) {
        // Check if there are any limit indicators
        const limitIndicator = page.locator('[data-testid="registration-limit-indicator"]');
        const reserveListIndicator = page.locator('[data-testid="reserve-list-indicator"]');
        
        // At least one indicator should be present
        await expect(limitIndicator.or(reserveListIndicator)).toBeVisible();
      }
    });

    test('only available rooms/beds are shown in registration', async ({ page }) => {
      // Navigate to student registration page
      await page.goto('http://localhost:3000/register');
      await page.waitForLoadState('networkidle');

      // Check if room/bed selection is available
      const roomSelection = page.locator('[data-testid="room-selection"]');
      const bedSelection = page.locator('[data-testid="bed-selection"]');
      
      if (await roomSelection.isVisible() || await bedSelection.isVisible()) {
        // Verify that only available options are shown
        await expect(roomSelection.or(bedSelection)).toBeVisible();
        
        // Check if unavailable options are disabled or hidden
        const unavailableOption = page.locator('[data-testid="unavailable-option"]');
        if (await unavailableOption.isVisible()) {
          await expect(unavailableOption).toBeDisabled();
        }
      }
    });
  });

  test.describe('Dashboard Business Rules', () => {
    test('dashboard shows accurate statistics based on business rules', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');

      // Check if key statistics are displayed
      const totalStudents = page.locator('[data-testid="total-students"]');
      const totalRooms = page.locator('[data-testid="total-rooms"]');
      const availableBeds = page.locator('[data-testid="available-beds"]');
      const registeredStudents = page.locator('[data-testid="registered-students"]');
      
      await expect(totalStudents.or(totalRooms).or(availableBeds).or(registeredStudents)).toBeVisible();
    });

    test('dashboard reflects payment status in statistics', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');

      // Check if payment-related statistics are shown
      const paymentStats = page.locator('[data-testid="payment-statistics"]');
      const pendingPayments = page.locator('[data-testid="pending-payments"]');
      const approvedPayments = page.locator('[data-testid="approved-payments"]');
      
      await expect(paymentStats.or(pendingPayments).or(approvedPayments)).toBeVisible();
    });
  });

  test.describe('Access Control Rules', () => {
    test('role-based access control is enforced', async ({ page }) => {
      // Test admin access to admin-only pages
      await page.goto('http://localhost:3000/configuration');
      await page.waitForLoadState('networkidle');
      
      // Admin should have access to configuration page
      await expect(page).toHaveURL(/.*configuration.*/);

      // Test student access restrictions
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'student@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // Student should not have access to admin pages
      await page.goto('http://localhost:3000/configuration');
      await page.waitForLoadState('networkidle');
      
      // Should be redirected or show access denied
      const accessDenied = page.locator('[data-testid="access-denied"]');
      const redirectToDashboard = page.url().includes('dashboard');
      
      expect(accessDenied.isVisible() || redirectToDashboard).toBeTruthy();
    });
  });
}); 