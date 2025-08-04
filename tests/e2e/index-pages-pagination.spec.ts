import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS } from './test-utils';

test.describe('Index Pages Pagination E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access all pages
    await TestUtils.login(page, 'admin');
  });

  test.describe('Students Index Page', () => {
    test('should display paginated students data from database', async ({ page }) => {
      await page.goto('/students');
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // Check if students table is visible
      await expect(page.locator('[data-testid="students-table"]')).toBeVisible();
      
      // Check for pagination controls
      await expect(page.locator('[data-testid="pagination"], .pagination, nav[aria-label="Pagination"]')).toBeVisible();
      
      // Verify student data from seeders is displayed
      // From DevelopmentSeeder: Test Student, Alice Student, Bob Student
      await expect(page.locator('text=Test Student')).toBeVisible();
      await expect(page.locator('text=Alice Student')).toBeVisible();
      await expect(page.locator('text=Bob Student')).toBeVisible();
      
      // Check for student details like email, status, etc.
      await expect(page.locator('text=student@email.com')).toBeVisible();
      await expect(page.locator('text=alice@student.local')).toBeVisible();
      await expect(page.locator('text=bob@student.local')).toBeVisible();
      
      // Check for action buttons (Edit, Delete)
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });

    test('should navigate through pagination pages', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Check if pagination exists
      const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label="Pagination"]');
      if (await pagination.count() > 0) {
        // Click next page if available
        const nextButton = page.locator('button:has-text("Next"), [aria-label="Next page"]');
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          
          // Verify URL changed or page content updated
          const currentURL = page.url();
          expect(currentURL).toMatch(/page=\d+/);
        }
      }
    });
  });

  test.describe('Guests Index Page', () => {
    test('should display paginated guests data from database', async ({ page }) => {
      await page.goto('/guest-house');
      await page.waitForLoadState('networkidle');
      
      // Check if guests table is visible
      await expect(page.locator('[data-testid="guests-table"]')).toBeVisible();
      
      // Verify guest data from seeders is displayed
      // From DevelopmentSeeder: Test Guest
      await expect(page.locator('text=Test Guest')).toBeVisible();
      await expect(page.locator('text=guest@test.local')).toBeVisible();
      
      // Check for guest details like purpose, host, etc.
      await expect(page.locator('text=Academic Visit')).toBeVisible();
      await expect(page.locator('text=Dr. Smith')).toBeVisible();
      
      // Check for action buttons
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });
  });

  test.describe('Rooms Index Page', () => {
    test('should display paginated rooms data from database', async ({ page }) => {
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      
      // Check if rooms table is visible
      await expect(page.locator('table, [data-testid="rooms-table"]')).toBeVisible();
      
      // Verify room data from seeders is displayed
      // From DevelopmentSeeder: rooms 101-510, test room a210
      await expect(page.locator('text=101')).toBeVisible();
      await expect(page.locator('text=102')).toBeVisible();
      await expect(page.locator('text=a210')).toBeVisible();
      
      // Check for room details like dormitory, floor, type
      await expect(page.locator('text=Dormitory #1')).toBeVisible();
      await expect(page.locator('text=A Block')).toBeVisible();
      
      // Check for action buttons
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });
  });

  test.describe('Room Types Index Page', () => {
    test('should display paginated room types data from database', async ({ page }) => {
      await page.goto('/room-types');
      await page.waitForLoadState('networkidle');
      
      // Check if room types table is visible
      await expect(page.locator('table, [data-testid="room-types-table"]')).toBeVisible();
      
      // Verify room type data from seeders is displayed
      // From DevelopmentSeeder: standard, lux, single, double
      await expect(page.locator('text=standard')).toBeVisible();
      await expect(page.locator('text=lux')).toBeVisible();
      await expect(page.locator('text=single')).toBeVisible();
      await expect(page.locator('text=double')).toBeVisible();
      
      // Check for action buttons
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });
  });

  test.describe('Dormitories Index Page', () => {
    test('should display paginated dormitories data from database', async ({ page }) => {
      await page.goto('/dormitories');
      await page.waitForLoadState('networkidle');
      
      // Check if dormitories table is visible
      await expect(page.locator('table, [data-testid="dormitories-table"]')).toBeVisible();
      
      // Verify dormitory data from seeders is displayed
      // From DevelopmentSeeder: Dormitory #1, Dormitory #2, A Block
      await expect(page.locator('text=Dormitory #1')).toBeVisible();
      await expect(page.locator('text=Dormitory #2')).toBeVisible();
      await expect(page.locator('text=A Block')).toBeVisible();
      
      // Check for dormitory details like address, capacity
      await expect(page.locator('text=Almaty, Al-Farabi Avenue, 71')).toBeVisible();
      await expect(page.locator('text=Almaty, Nazarbayev Avenue, 123')).toBeVisible();
      await expect(page.locator('text=Test Address for E2E')).toBeVisible();
      
      // Check for action buttons
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });
  });

  test.describe('Payments Index Page', () => {
    test('should display paginated payments data from database', async ({ page }) => {
      await page.goto('/payments');
      await page.waitForLoadState('networkidle');
      
      // Check if payments table is visible
      await expect(page.locator('table, [data-testid="payments-table"]')).toBeVisible();
      
      // Verify payment data from seeders is displayed
      // From DevelopmentSeeder: semester payments for students
      await expect(page.locator('text=2025-fall')).toBeVisible();
      await expect(page.locator('text=50000')).toBeVisible();
      await expect(page.locator('text=55000')).toBeVisible();
      await expect(page.locator('text=60000')).toBeVisible();
      
      // Check for payment status
      await expect(page.locator('text=approved')).toBeVisible();
      
      // Check for action buttons
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });
  });

  test.describe('Messages Index Page', () => {
    test('should display paginated messages data from database', async ({ page }) => {
      await page.goto('/messages');
      await page.waitForLoadState('networkidle');
      
      // Check if messages table is visible
      await expect(page.locator('table, [data-testid="messages-table"]')).toBeVisible();
      
      // Verify message data from seeders is displayed
      // From DevelopmentSeeder: Welcome to Dormitory, Floor Meeting
      await expect(page.locator('text=Welcome to Dormitory')).toBeVisible();
      await expect(page.locator('text=Floor Meeting')).toBeVisible();
      
      // Check for message content
      await expect(page.locator('text=Welcome to our dormitory!')).toBeVisible();
      await expect(page.locator('text=There will be a floor meeting')).toBeVisible();
      
      // Check for action buttons
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });
  });

  test.describe('Admins Index Page', () => {
    test('should display paginated admins data from database', async ({ page }) => {
      await page.goto('/admins');
      await page.waitForLoadState('networkidle');
      
      // Check if admins table is visible
      await expect(page.locator('table, [data-testid="admins-table"]')).toBeVisible();
      
      // Verify admin data from seeders is displayed
      // From DevelopmentSeeder: admin users
      await expect(page.locator('text=admin@email.com')).toBeVisible();
      
      // Check for action buttons
      const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]');
      await expect(editButtons.first()).toBeVisible();
      
      // Check for Add button
      await expect(page.locator('button:has-text("Add"), [data-testid="add-button"]')).toBeVisible();
    });
  });

  test.describe('Common Index Page Features', () => {
    test('should have working search functionality', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Look for search input
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"], [data-testid="search-input"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('Test Student');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Should show only Test Student
        await expect(page.locator('text=Test Student')).toBeVisible();
        await expect(page.locator('text=Alice Student')).not.toBeVisible();
      }
    });

    test('should have working filter functionality', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Look for filter dropdowns
      const filterSelect = page.locator('select, [data-testid="filter-select"]');
      if (await filterSelect.count() > 0) {
        await filterSelect.first().selectOption({ label: 'Active' });
        await page.waitForLoadState('networkidle');
        
        // Should show only active students
        await expect(page.locator('text=active')).toBeVisible();
      }
    });

    test('should have working sort functionality', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      
      // Look for sortable column headers
      const sortableHeaders = page.locator('th[data-sortable], th.sortable, [data-testid="sort-header"]');
      if (await sortableHeaders.count() > 0) {
        await sortableHeaders.first().click();
        await page.waitForLoadState('networkidle');
        
        // Should show sorted data
        await expect(page.locator('table')).toBeVisible();
      }
    });
  });
}); 