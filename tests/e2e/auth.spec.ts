import { test, expect } from './test';
import { TestUtils, TEST_USERS, SELECTORS } from './test-utils';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start on the login page
    await page.goto('/');
  });

  test('should display login form by default', async ({ page }) => {
    // Check that we're on the login page with correct elements
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    
    // Check that registration form is hidden initially
    await expect(page.locator('#registration-email')).not.toBeVisible();
  });

  test('should show registration form when clicking register tab', async ({ page }) => {
    // Click the registration tab (it might be "Registration" not "Register")
    await page.click('button[role="tab"]:has-text("Registration")');
    
    // Check that registration form is now visible
    await expect(page.locator('#registration-email')).toBeVisible();
    await expect(page.locator('#registration-password')).toBeVisible();
    await expect(page.locator('#registration-name')).toBeVisible();
    
    // Check that login form is hidden
    await expect(page.locator('#login-email')).not.toBeVisible();
  });

  test('should successfully login with admin credentials', async ({ page }) => {
    // Fill in login credentials using test utilities
    await TestUtils.login(page, 'admin');
    
    // Verify we're on the main page
    await TestUtils.expectURL(page, /\/main/);
    
    // Check for dashboard content (statistics, etc.)
    await expect(page.locator('body')).toContainText(/\d+/); // Should contain numbers (statistics)
  });

  test('should successfully login with student credentials', async ({ page }) => {
    // Fill in login credentials manually (same as debug test that worked)
    await page.goto('/');
    await page.fill('#login-email', 'student@email.com');
    await page.fill('#login-password', 'studentpass');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for successful login - redirect to main page
    await page.waitForURL(/\/main/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the main page
    await TestUtils.expectURL(page, /\/main/);
    
    // Check for student-specific content
    await expect(page.locator('body')).toContainText(/student|dashboard/i);
  });

  test('should successfully login with superadmin credentials', async ({ page }) => {
    // Fill in login credentials using test utilities
    await TestUtils.login(page, 'superadmin');
    
    // Verify we're on the main page
    await TestUtils.expectURL(page, /\/main/);
    
    // Check for superadmin-specific content
    await expect(page.locator('body')).toContainText(/dashboard|admin/i);
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('#login-email', 'invalid@example.com');
    await page.fill('#login-password', 'wrongpassword');
    
    // Click login button (use submit type to be more specific)
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for error message to appear (check for toast or alert)
    await expect(page.locator('.toast, [role="alert"], .alert')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access a protected route directly
    await page.goto('http://localhost:5173/users');
    
    // Should be redirected to login
    await expect(page).toHaveURL('http://localhost:5173/');
  });
  
  test('should successfully register a student', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Registration")');
    await page.fill('#registration-iin', '123456789012');
    await page.fill('#registration-name', 'Test Student');
    await page.selectOption('#registration-faculty', 'engineering');
    await page.selectOption('#registration-specialist', 'computer_sciences');
    await page.fill('#registration-enrollment-year', '2023');
    await page.selectOption('#registration-gender', 'male');
    await page.fill('#registration-email', 'student@example.com');
    await page.fill('#registration-password', 'password');
    await page.fill('#registration-confirm-password', 'password');
    await page.selectOption('#registration-dormitory', 'a_block');
    await page.selectOption('#registration-room', 'a210');
    await page.setInputFiles('#registration-file-0', 'public/favicon.ico');
    await page.setInputFiles('#registration-file-1', 'public/favicon.ico');
    await page.setInputFiles('#registration-file-2', 'public/favicon.ico');
    await page.setInputFiles('#registration-file-3', 'public/favicon.ico');
    await page.click('#registration-agree-rules');
    await page.click('button[type="submit"]:has-text("Register")');
    // Expect success toast or redirect (adjust selector as needed)
    await expect(page.locator('body')).toContainText(/success|registered|pending/i);
  });

  test('should successfully register a guest', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Guests")');
    await page.selectOption('#guest-room-type', 'single');
    await page.fill('#guest-name', 'Guest User');
    await page.setInputFiles('#guest-file-0', 'public/favicon.ico');
    await page.click('button[type="submit"]:has-text("Book Room")');
    await expect(page.locator('body')).toContainText(/success|booked|pending/i);
  });

  test('should prevent registration when student limit is reached and reserve list is enabled', async ({ page }) => {
    // Simulate dormitory at capacity and reserve list enabled (assume backend is mocked or seeded for this test)
    await page.click('button[role="tab"]:has-text("Registration")');
    await page.fill('#registration-iin', '999999999999');
    await page.fill('#registration-name', 'Reserve Student');
    await page.selectOption('#registration-faculty', 'engineering');
    await page.selectOption('#registration-specialist', 'computer_sciences');
    await page.fill('#registration-enrollment-year', '2023');
    await page.selectOption('#registration-gender', 'male');
    await page.fill('#registration-email', `reserve+${Date.now()}@test.local`);
    await page.fill('#registration-password', 'password');
    await page.fill('#registration-confirm-password', 'password');
    await page.selectOption('#registration-dormitory', 'a_block');
    await page.selectOption('#registration-room', 'a210');
    await page.setInputFiles('#registration-file-0', 'public/favicon.ico');
    await page.setInputFiles('#registration-file-1', 'public/favicon.ico');
    await page.setInputFiles('#registration-file-2', 'public/favicon.ico');
    await page.setInputFiles('#registration-file-3', 'public/favicon.ico');
    await page.click('#registration-agree-rules');
    await page.click('button[type="submit"]:has-text("Register")');
    // Expect a message about registration being closed or being added to the reserve list
    await expect(page.locator('body')).toContainText(/registration closed|reserve list|full|not available/i);
  });

  test('should only show available rooms and beds in registration UI', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Registration")');
    // Wait for room and bed dropdowns to load
    await page.waitForSelector('#registration-room');
    await page.waitForSelector('#registration-bed');

    // Get all room options
    const roomOptions = await page.$$eval('#registration-room option', opts => opts.map(o => ({ value: o.value, text: o.textContent, disabled: o.disabled })));
    // All unavailable/occupied rooms should be disabled
    expect(roomOptions.some(opt => opt.disabled)).toBe(true);

    // Select the first available room
    const availableRoom = roomOptions.find(opt => !opt.disabled && opt.value);
    expect(availableRoom).toBeDefined();
    await page.selectOption('#registration-room', availableRoom.value);

    // Get all bed options for the selected room
    const bedOptions = await page.$$eval('#registration-bed option', opts => opts.map(o => ({ value: o.value, text: o.textContent, disabled: o.disabled })));
    // All unavailable/occupied beds should be disabled
    expect(bedOptions.some(opt => opt.disabled)).toBe(true);

    // At least one available bed should be enabled
    expect(bedOptions.some(opt => !opt.disabled && opt.value)).toBe(true);
  });

  test('should display guest payments in guest house registration page', async ({ page }) => {
    // Go to guest registration page
    await page.goto('http://localhost:5173/guest-form');
    // Wait for the payments table or loading indicator
    await page.waitForSelector('text=Guest Payments');
    // Wait for payments to load (simulate API delay)
    await page.waitForTimeout(1000);
    // Check that the payments table is visible and contains at least one row
    const paymentsTable = page.locator('table');
    await expect(paymentsTable).toBeVisible();
    // Check for at least one payment row (excluding header)
    const paymentRows = paymentsTable.locator('tbody tr');
    await expect(paymentRows).toHaveCountGreaterThan(0);
    // Optionally, check for expected columns
    await expect(paymentsTable).toContainText(/Guest Name|Room|Dormitory|Amount|Status|Check-in|Check-out/i);
  });
});
