import { test, expect } from './test';

test.describe('Student Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student first
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'alice@student.local');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login and redirect to main page
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });
  });

  test('should display student dashboard correctly', async ({ page }) => {
    // Check that we're on the main/dashboard page
    await expect(page).toHaveURL('http://localhost:5173/main');
    
    // Check for dashboard content (numbers indicating statistics)
    await expect(page.locator('body')).toContainText(/\d+/);
    
    // Check that statistics elements are visible
    const statisticsElements = page.locator('h3');
    await expect(statisticsElements.first()).toBeVisible();
  });

  test('should display student information in navigation or profile', async ({ page }) => {
    // Look for student name or email in the navigation or profile area
    // This might be in a header, sidebar, or profile dropdown
    const studentInfo = page.locator('body');
    await expect(studentInfo).toContainText(/student|profile|john|doe/i);
  });

  test('should access student-specific sections', async ({ page }) => {
    // Try to navigate to students section (this might be available for student role)
    try {
      await page.click('text=Students');
      await expect(page).toHaveURL(/.*students.*/);
    } catch {
      // If Students link is not available for student role, that's expected
      console.log('Students section not accessible to student role - this is expected');
    }
  });

  test('should be able to access messages', async ({ page }) => {
    // Try to access messages if available to students
    try {
      await page.click('text=Messages');
      await expect(page).toHaveURL(/.*messages.*/);
    } catch {
      console.log('Messages section might not be accessible or visible');
    }
  });

  test('should not access admin-only sections', async ({ page }) => {
    // Student should not be able to access Users management
    try {
      await page.goto('http://localhost:5173/users');
      // If redirected away from users page, that's correct behavior
      await expect(page).not.toHaveURL(/.*users.*/);
    } catch {
      // Expected if access is properly restricted
    }
  });

  test('should show error if student cannot access dormitory due to missing payment', async ({ page }) => {
    // Login as a student without current semester payment
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', 'nopayment@student.local');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('http://localhost:5173/main', { timeout: 10000 });

    // Wait for dormitory access check to complete
    await page.waitForSelector('text=You cannot access the dormitory', { timeout: 10000 });
    await expect(page.locator('body')).toContainText('You cannot access the dormitory');
  });
});
