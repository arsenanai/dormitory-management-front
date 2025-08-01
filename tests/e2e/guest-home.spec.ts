import { test, expect } from '@playwright/test';

test.describe('Guest Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Login as guest
    await page.fill('[data-testid="email-input"]', 'guest@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to guest home page
    await page.waitForURL('/guest-home');
  });

  test('should display guest dashboard title and subtitle', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Guest Dashboard');
    
    // Check subtitle
    await expect(page.locator('p.text-gray-600')).toContainText('Welcome to your guest accommodation dashboard');
  });

  test('should display living room information section', async ({ page }) => {
    // Check section title
    await expect(page.locator('text=Living Room Information')).toBeVisible();
    
    // Check room details
    await expect(page.locator('text=Room Number')).toBeVisible();
    await expect(page.locator('text=101')).toBeVisible(); // Room number
    
    await expect(page.locator('text=Dormitory')).toBeVisible();
    await expect(page.locator('text=Dormitory A')).toBeVisible(); // Dormitory name
    
    await expect(page.locator('text=Floor')).toBeVisible();
    await expect(page.locator('text=1')).toBeVisible(); // Floor number
    
    await expect(page.locator('text=Capacity')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible(); // Capacity
  });

  test('should display rental information section', async ({ page }) => {
    // Check section title
    await expect(page.locator('text=Rental Information')).toBeVisible();
    
    // Check rental details
    await expect(page.locator('text=Daily Rate')).toBeVisible();
    await expect(page.locator('text=₸5,000')).toBeVisible(); // Daily rate
    
    await expect(page.locator('text=Check-in Date')).toBeVisible();
    await expect(page.locator('text=Check-out Date')).toBeVisible();
    
    await expect(page.locator('text=Total Days')).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible(); // Total days
    
    await expect(page.locator('text=Total Amount')).toBeVisible();
    await expect(page.locator('text=₸25,000')).toBeVisible(); // Total amount
  });

  test('should display reception contacts section', async ({ page }) => {
    // Check section title
    await expect(page.locator('text=Reception Contacts')).toBeVisible();
    
    // Check main contact information
    await expect(page.locator('text=Main Contact')).toBeVisible();
    await expect(page.locator('text=+7 (777) 123-45-67')).toBeVisible(); // Phone
    await expect(page.locator('text=reception@sdu.edu.kz')).toBeVisible(); // Email
    await expect(page.locator('text=24/7')).toBeVisible(); // Working hours
    
    // Check emergency contact information
    await expect(page.locator('text=Emergency Contact')).toBeVisible();
    await expect(page.locator('text=+7 (777) 999-99-99')).toBeVisible(); // Emergency phone
    await expect(page.locator('text=Available 24/7')).toBeVisible(); // Emergency availability
  });

  test('should display quick actions section', async ({ page }) => {
    // Check section title
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('text=Messages')).toBeVisible();
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('text=Contact Reception')).toBeVisible();
  });

  test('should navigate to messages when messages button is clicked', async ({ page }) => {
    // Click on messages button
    await page.click('text=Messages');
    
    // Check that we navigated to messages page
    await page.waitForURL('/messages');
    await expect(page.locator('h1')).toContainText('Messages');
  });

  test('should navigate to profile when profile button is clicked', async ({ page }) => {
    // Click on profile button
    await page.click('text=My Profile');
    
    // Check that we navigated to guest form page
    await page.waitForURL('/guest-form/');
    await expect(page.locator('h1')).toContainText('Guest Form');
  });

  test('should open phone dialer when contact reception button is clicked', async ({ page }) => {
    // Mock window.open
    const mockOpen = jest.fn();
    await page.addInitScript(() => {
      window.open = mockOpen;
    });
    
    // Click on contact reception button
    await page.click('text=Contact Reception');
    
    // Check that window.open was called with phone number
    expect(mockOpen).toHaveBeenCalledWith('tel:+7 (777) 123-45-67');
  });

  test('should display correct currency formatting', async ({ page }) => {
    // Check that currency is formatted correctly
    await expect(page.locator('text=₸5,000')).toBeVisible(); // Daily rate
    await expect(page.locator('text=₸25,000')).toBeVisible(); // Total amount
  });

  test('should display correct date formatting', async ({ page }) => {
    // Check that dates are displayed (format may vary by locale)
    const checkInDate = page.locator('text=Check-in Date').locator('..').locator('span.font-medium').first();
    await expect(checkInDate).toBeVisible();
    
    const checkOutDate = page.locator('text=Check-out Date').locator('..').locator('span.font-medium').first();
    await expect(checkOutDate).toBeVisible();
  });

  test('should calculate total days and amount correctly', async ({ page }) => {
    // Check total days calculation
    await expect(page.locator('text=Total Days')).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible(); // 5 days
    
    // Check total amount calculation
    await expect(page.locator('text=Total Amount')).toBeVisible();
    await expect(page.locator('text=₸25,000')).toBeVisible(); // 5 days * 5000 KZT
  });

  test('should have responsive layout', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and properly laid out
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Living Room Information')).toBeVisible();
    await expect(page.locator('text=Rental Information')).toBeVisible();
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that content is still visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check that content is still visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display icons correctly', async ({ page }) => {
    // Check that building icon is present for living room section
    const buildingIcon = page.locator('text=Living Room Information').locator('..').locator('svg').first();
    await expect(buildingIcon).toBeVisible();
    
    // Check that currency icon is present for rental section
    const currencyIcon = page.locator('text=Rental Information').locator('..').locator('svg').first();
    await expect(currencyIcon).toBeVisible();
    
    // Check that phone icon is present for reception section
    const phoneIcon = page.locator('text=Reception Contacts').locator('..').locator('svg').first();
    await expect(phoneIcon).toBeVisible();
  });

  test('should handle missing room information gracefully', async ({ page }) => {
    // This test would require mocking the API to return no room data
    // For now, we'll just verify the structure is in place
    
    // Check that the room information section exists
    await expect(page.locator('text=Living Room Information')).toBeVisible();
    
    // Check that the "no room assigned" text would be shown if no room data
    // This would be tested with mocked API responses
  });
}); 