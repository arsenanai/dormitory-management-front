import { test, expect } from '@playwright/test';

test.describe('Student Login Test', () => {
  test('Student can login successfully', async ({ page }) => {
    // Test data
    const studentEmail = 'student@email.com';
    const studentPassword = 'studentpass';

    // Student logs in
    await page.goto('/');
    await page.fill('#login-email', studentEmail);
    await page.fill('#login-password', studentPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for student dashboard to load
    await page.waitForURL('/student-main');
    
    console.log('Student login successful');
    
    // Take screenshot
    await page.screenshot({ path: 'debug-student-login.png' });
    
    // Check if we're on the student main page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check if student-specific elements are visible
    const studentElements = page.locator('text=Student');
    const studentCount = await studentElements.count();
    console.log('Student elements found:', studentCount);
  });
});
