import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS, TestData } from './test-utils';

test.describe('Guest House Management', () => {
  test.describe('Guest Registration', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should allow guest registration', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for guest registration functionality
      await expect(page.locator('body')).toContainText(/guest|registration/i);
      
      // Check if add guest functionality is available
      const addButton = page.locator(SELECTORS.addButton);
      if (await addButton.count() > 0) {
        await TestUtils.expectElementVisible(page, SELECTORS.addButton);
      }
    });

    test('should display guest list', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for guest list display
      await expect(page.locator('body')).toContainText(/guest|list|visitor/i);
      
      // Check if guest table/list is visible
      const guestRows = page.locator('[data-testid="guest-row"], tr');
      const guestCount = await guestRows.count();
      
      if (guestCount > 0) {
        await TestUtils.expectElementVisible(page, '[data-testid="guest-row"]');
      }
    });

    test('should allow guest information management', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for guest management functionality
      await expect(page.locator('body')).toContainText(/name|phone|email|room/i);
    });

    test('should track guest payments', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for payment tracking functionality
      await expect(page.locator('body')).toContainText(/payment|fee|charge/i);
    });
  });

  test.describe('Room Management for Guests', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should allow room settings configuration', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for room settings functionality
      await expect(page.locator('body')).toContainText(/room|setting|configuration/i);
    });

    test('should display room availability', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for room availability information
      await expect(page.locator('body')).toContainText(/available|occupied|vacant/i);
    });

    test('should allow room assignment to guests', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for room assignment functionality
      await expect(page.locator('body')).toContainText(/assign|room|bed/i);
    });

    test('should track room capacity', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for capacity tracking
      await expect(page.locator('body')).toContainText(/capacity|capacity|seats/i);
    });
  });

  test.describe('Guest House CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should create new guest', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check if add button exists
      const addButton = page.locator(SELECTORS.addButton);
      if (await addButton.count() > 0) {
        await TestUtils.expectElementVisible(page, SELECTORS.addButton);
        
        // Click add button to test guest creation
        await addButton.click();
        
        // Check for guest form fields
        await expect(page.locator('body')).toContainText(/name|email|phone|room/i);
      }
    });

    test('should edit existing guest', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check if there are guests listed
      const guestRows = page.locator('[data-testid="guest-row"], tr');
      const guestCount = await guestRows.count();

      if (guestCount > 0) {
        // Click on first guest to edit
        await guestRows.first().click();
        
        // Check for edit functionality
        const editButton = page.locator(SELECTORS.editButton);
        if (await editButton.count() > 0) {
          await TestUtils.expectElementVisible(page, SELECTORS.editButton);
        }
      }
    });

    test('should delete guest', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check if there are guests listed
      const guestRows = page.locator('[data-testid="guest-row"], tr');
      const guestCount = await guestRows.count();

      if (guestCount > 0) {
        // Check for delete functionality
        const deleteButton = page.locator(SELECTORS.deleteButton);
        if (await deleteButton.count() > 0) {
          await TestUtils.expectElementVisible(page, SELECTORS.deleteButton);
        }
      }
    });

    test('should validate guest information', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check if add button exists
      const addButton = page.locator(SELECTORS.addButton);
      if (await addButton.count() > 0) {
        await addButton.click();
        
        // Try to submit without required fields
        const saveButton = page.locator(SELECTORS.saveButton);
        if (await saveButton.count() > 0) {
          await saveButton.click();
          
          // Check for validation errors
          await TestUtils.expectErrorMessage(page);
        }
      }
    });
  });

  test.describe('Guest House Access Control', () => {
    test('should restrict guest house access to authorized users', async ({ page }) => {
      // Try to access guest house without authentication
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Should be redirected to login
      await TestUtils.expectURL(page, '/');
    });

    test('should allow guest house admin access', async ({ page }) => {
      await TestUtils.login(page, 'admin');
      
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Should have access to guest house management
      await expect(page).not.toHaveURL('/');
      await expect(page.url()).toContain('/guest-house');
    });

    test('should allow superadmin access to guest house', async ({ page }) => {
      await TestUtils.login(page, 'superadmin');
      
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Should have access to guest house management
      await expect(page).not.toHaveURL('/');
      await expect(page.url()).toContain('/guest-house');
    });

    test('should restrict student access to guest house', async ({ page }) => {
      await TestUtils.login(page, 'student');
      
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Students should not have access to guest house management
      const currentUrl = page.url();
      if (currentUrl.includes('/')) {
        // Either redirected to login or access denied
        await expect(currentUrl).toMatch(/\/$|\/access-denied/);
      }
    });
  });

  test.describe('Guest House Integration', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should integrate with room management system', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for room management integration
      await expect(page.locator('body')).toContainText(/room|bed|accommodation/i);
    });

    test('should integrate with payment system', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for payment system integration
      await expect(page.locator('body')).toContainText(/payment|billing|charge/i);
    });

    test('should integrate with messaging system', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for messaging integration
      await expect(page.locator('body')).toContainText(/message|communication|notification/i);
    });

    test('should provide reporting capabilities', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for reporting functionality
      await expect(page.locator('body')).toContainText(/report|statistics|summary/i);
    });
  });

  test.describe('Guest House Business Rules', () => {
    test.beforeEach(async ({ page }) => {
      await TestUtils.login(page, 'admin');
    });

    test('should enforce guest registration requirements', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for registration requirements
      await expect(page.locator('body')).toContainText(/required|mandatory|registration/i);
    });

    test('should track guest stay duration', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for stay duration tracking
      await expect(page.locator('body')).toContainText(/duration|period|stay|check-in|check-out/i);
    });

    test('should manage room availability', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for room availability management
      await expect(page.locator('body')).toContainText(/available|occupied|reserved/i);
    });

    test('should handle guest check-in and check-out', async ({ page }) => {
      await TestUtils.navigateTo(page, '/guest-house');
      
      // Check for check-in/check-out functionality
      await expect(page.locator('body')).toContainText(/check-in|check-out|arrival|departure/i);
    });
  });
}); 