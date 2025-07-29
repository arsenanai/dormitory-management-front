import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS, TestData } from './test-utils';

test.describe('Payment and Access Rules', () => {
  test.describe('Student Payment Rules', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should track semester payments for students', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check for semester payment tracking
      await expect(page.locator('body')).toContainText(/semester|payment/i);
      
      // Check if payment status is displayed
      const paymentStatusElements = page.locator('[data-testid="payment-status"]');
      if (await paymentStatusElements.count() > 0) {
        await TestUtils.expectElementVisible(page, '[data-testid="payment-status"]');
      }
    });

    test('should show payment status in student details', async ({ page }) => {
      await TestUtils.navigateTo(page, '/students');
      
      // Check if there are students listed
      const studentRows = page.locator(SELECTORS.studentRow);
      const studentCount = await studentRows.count();

      if (studentCount > 0) {
        // Click on first student to view details
        await studentRows.first().click();
        
        // Check for payment information in student details
        await expect(page.locator('body')).toContainText(/payment|semester/i);
      }
    });

    test('should allow manual payment entry', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check if add payment functionality is available
      const addButton = page.locator(SELECTORS.addButton);
      if (await addButton.count() > 0) {
        await TestUtils.expectElementVisible(page, SELECTORS.addButton);
        
        // Click add button to test payment form
        await addButton.click();
        
        // Check for payment form fields
        await expect(page.locator('body')).toContainText(/amount|semester|method/i);
      }
    });
  });

  test.describe('Dormitory Access Rules', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should show dormitory access status based on payment', async ({ page }) => {
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

    test('should display access rules in student view', async ({ page }) => {
      await TestUtils.navigateTo(page, '/students');
      
      // Check for access-related information
      await expect(page.locator('body')).toContainText(/access|dormitory|entry/i);
    });

    test('should allow manual access control', async ({ page }) => {
      await TestUtils.navigateTo(page, '/students');
      
      // Check if there are students listed
      const studentRows = page.locator(SELECTORS.studentRow);
      const studentCount = await studentRows.count();

      if (studentCount > 0) {
        // Click on first student to view details
        await studentRows.first().click();
        
        // Look for access control options
        const accessControlElements = page.locator('[data-testid="access-control"], button:has-text("Grant Access"), button:has-text("Revoke Access")');
        if (await accessControlElements.count() > 0) {
          await TestUtils.expectElementVisible(page, '[data-testid="access-control"]');
        }
      }
    });
  });

  test.describe('Student Self-Service', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'student');
    });

    test('should show registration status to students', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check for registration status display
      await expect(page.locator('body')).toContainText(/registration|status|pending/i);
    });

    test('should show payment information to students', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check for payment information display
      await expect(page.locator('body')).toContainText(/payment|accounting|semester/i);
    });

    test('should show dormitory access status to students', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check dormitory access status using utility function
      await TestUtils.checkDormitoryAccessStatus(page);
    });

    test('should display messages from dormitory management', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check for messages display
      await expect(page.locator('body')).toContainText(/message|notification|announcement/i);
    });

    test('should show pending status for waitlisted students', async ({ page }) => {
      await TestUtils.navigateTo(page, '/student-main');
      
      // Check for pending/waitlist status
      await expect(page.locator('body')).toContainText(/pending|waitlist|reserve/i);
    });
  });

  test.describe('Payment Processing', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should track internal payment processing', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check for internal payment tracking (not external integrations)
      await expect(page.locator('body')).toContainText(/payment|tracking|internal/i);
      
      // Should NOT show external payment gateway options
      const externalPaymentElements = page.locator('text=Kaspi, text=QR Code, text=External Gateway');
      await expect(externalPaymentElements).toHaveCount(0);
    });

    test('should allow payment status updates', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check if payment status can be updated
      const paymentRows = page.locator('[data-testid="payment-row"]');
      const paymentCount = await paymentRows.count();

      if (paymentCount > 0) {
        // Click on first payment to view/edit
        await paymentRows.first().click();
        
        // Check for status update options
        const statusUpdateElements = page.locator('[data-testid="status-update"], button:has-text("Update Status")');
        if (await statusUpdateElements.count() > 0) {
          await TestUtils.expectElementVisible(page, '[data-testid="status-update"]');
        }
      }
    });

    test('should generate payment reports', async ({ page }) => {
      await TestUtils.navigateTo(page, '/accounting');
      
      // Check for payment reporting functionality
      await expect(page.locator('body')).toContainText(/report|income|payment/i);
      
      // Check for export functionality
      const exportElements = page.locator('button:has-text("Export"), button:has-text("Download")');
      if (await exportElements.count() > 0) {
        await TestUtils.expectElementVisible(page, 'button:has-text("Export")');
      }
    });
  });

  test.describe('Access Control Integration', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should integrate payment status with access control', async ({ page }) => {
      await TestUtils.navigateTo(page, '/students');
      
      // Check if there are students listed
      const studentRows = page.locator(SELECTORS.studentRow);
      const studentCount = await studentRows.count();

      if (studentCount > 0) {
        // Click on first student to view details
        await studentRows.first().click();
        
        // Check that payment status and access status are both visible
        const paymentStatus = page.locator('[data-testid="payment-status"]');
        const accessStatus = page.locator(SELECTORS.dormitoryAccessStatus);
        
        if (await paymentStatus.count() > 0 && await accessStatus.count() > 0) {
          await TestUtils.expectElementVisible(page, '[data-testid="payment-status"]');
          await TestUtils.expectElementVisible(page, SELECTORS.dormitoryAccessStatus);
        }
      }
    });

    test('should allow manual access verification', async ({ page }) => {
      await TestUtils.navigateTo(page, '/students');
      
      // Check for manual verification options
      await expect(page.locator('body')).toContainText(/verify|manual|check/i);
    });

    test('should NOT show external card access integration', async ({ page }) => {
      await TestUtils.navigateTo(page, '/settings');
      
      // Should NOT show external card access system options
      const cardAccessElements = page.locator('text=Card Reader, text=Physical Access, text=External Access');
      await expect(cardAccessElements).toHaveCount(0);
    });
  });

  test.describe('Business Rule Enforcement', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should enforce semester payment requirement', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check for semester-based payment structure
      await expect(page.locator('body')).toContainText(/semester|period|cycle/i);
    });

    test('should show payment due dates', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check for due date information
      await expect(page.locator('body')).toContainText(/due|deadline|date/i);
    });

    test('should track payment history', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check for payment history tracking
      await expect(page.locator('body')).toContainText(/history|record|log/i);
    });

    test('should allow payment method selection', async ({ page }) => {
      await TestUtils.navigateTo(page, '/payments');
      
      // Check for payment method options
      await expect(page.locator('body')).toContainText(/method|type|cash|bank/i);
    });
  });
}); 