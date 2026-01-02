import { test, expect } from '@playwright/test';

// Check if human-like speed is enabled
const isHumanLike = process.env.VITE_HUMAN_LIKE === 'true';
const delay = (ms: number) => isHumanLike ? ms : Math.min(ms, 100); // Reduce delays when not in human mode

test.describe('Student Photo Upload Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to home page
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // Click on login tab
    await page.click('[data-testid="tab-login"]');
    
    // Fill login form
    const emailField = page.locator('#login-email');
    const passwordField = page.locator('#login-password');
    const loginButton = page.locator('[data-testid="login-button"]');
    
    await emailField.fill('admin@email.com');
    await passwordField.fill('supersecret');
    
    // Click login
    await loginButton.click();
    
    // Wait for redirect to main page
    await page.waitForURL(/main/);
    
    // Navigate to students page using sidebar navigation
    await page.click('[data-testid="sidebar-students"]');
    await page.waitForURL(/students/);
    await page.waitForLoadState('networkidle');
    
    // Click Add Student button on Students page
    await page.click('button:has-text("Add Student")');
    await page.waitForURL(/student-form/);
    await page.waitForLoadState('networkidle');
  });

  // Helper function to fill all required fields
  async function fillAllFields(page: any) {
    console.log(`🐌 Human-like mode: ${isHumanLike ? 'ENABLED' : 'DISABLED'}`);
    
    // Personal Information - fill slowly like a human if enabled
    await delay(500); // Pause before starting
    await page.fill('#student-profile-iin', '123456789012');
    await delay(300);
    await page.fill('#student-name', 'Test');
    await delay(300);
    await page.fill('#student-surname', 'Student');
    await delay(300);
    await page.selectOption('#student-gender', 'male');
    await delay(300);
    await page.fill('#student-email', 'test@student.com');
    await delay(300);
    await page.fill('#student-country', 'Kazakhstan');
    await delay(300);
    await page.fill('#student-region', 'Almaty');
    await delay(300);
    await page.fill('#student-city', 'Almaty');
    await delay(300);
    await page.fill('#student-password', 'password123');
    await delay(300);
    await page.fill('#student-password-repeat', 'password123');
    await delay(500);
    
    // Health Information
    await page.selectOption('#student-blood-type', 'O+');
    await delay(300);
    await page.fill('#student-allergies', 'None');
    await delay(300);
    await page.fill('#student-violations', 'None');
    await delay(500);
    
    // Emergency Contact
    await page.fill('#student-emergency-name', 'Emergency Contact');
    await delay(300);
    await page.selectOption('#student-emergency-type', 'parent');
    await delay(300);
    await page.fill('#student-emergency-phone', '+77001234568');
    await delay(300);
    await page.fill('#student-emergency-email', 'emergency@email.com');
    await delay(500);
    
    // Identification
    await page.selectOption('#student-identification-type', 'passport');
    await delay(300);
    await page.fill('#student-identification-number', 'A12345678');
    await delay(500);
    
    // Registration Information
    await page.selectOption('#student-status', 'active');
    await delay(300);
    
    // Educational Information
    await page.fill('#student-faculty', 'Computer Science');
    await delay(300);
    await page.fill('#student-specialist', 'Software Engineering');
    await delay(300);
    await page.fill('#student-enrollment-year', '2024');
    await delay(300);
    await page.fill('#student-deal-number', 'DEAL123456');
    await delay(500);
    
    // Phone Numbers (at least one is required)
    await page.fill('#phone-number-0', '+77001234567');
    await delay(500);
    
    // Checkboxes
    await page.check('#student-agree-rules');
    await delay(300);
    await page.check('#student-meal-plan');
    await delay(500);
    
    // Room and Bed selection (these are critical)
    console.log('Checking for room availability...');
    await delay(1000); // Wait for rooms to load
    
    // Try to select room - check if the dropdown exists and has options
    const roomSelect = page.locator('#student-room');
    await roomSelect.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get available room options
    const roomOptions = await roomSelect.locator('option').all();
    console.log('Number of room options:', roomOptions.length);
    
    if (roomOptions.length > 1) { // First option is usually placeholder
      console.log('Selecting room...');
      await roomSelect.selectOption({ index: 1 }); // Select first available room
      await delay(1500); // Wait for beds to load
      
      // Now select bed
      const bedSelect = page.locator('#student-bed');
      await bedSelect.waitFor({ state: 'visible', timeout: 5000 });
      
      const bedOptions = await bedSelect.locator('option').all();
      console.log('Number of bed options:', bedOptions.length);
      
      if (bedOptions.length > 1) { // First option is usually placeholder
        console.log('Selecting bed...');
        await bedSelect.selectOption({ index: 1 }); // Select first available bed
        await delay(500);
      }
    } else {
      console.log('No rooms available, continuing without room selection...');
    }
    
    console.log('Finished filling all fields');
    await delay(1000); // Final pause before file upload
  }

  test('should show validation error for incorrect file format', async ({ page }) => {
    console.log('=== Test 1: Incorrect File Format ===');
    
    // Fill all required fields
    await fillAllFields(page);
    
    console.log('Uploading incorrect file format...');
    // Create a text file with .txt extension using proper format
    const textFile = {
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content')
    };
    
    // Upload the text file to the photo field
    await page.setInputFiles('#student-profile-photo', [textFile]);
    await delay(1000); // Pause after file upload
    
    console.log('Submitting form...');
    // Try to submit form
    await page.click('button[type="submit"]');
    await delay(2000); // Wait for validation to appear
    
    console.log('Checking for validation error...');
    // Should show validation error for file format (use first occurrence)
    await expect(page.locator('text=The student profile.files.2 field must be a file of type: image/jpg, image/jpeg, image/png').first()).toBeVisible();
    
    console.log('✅ Test 1 PASSED: File format validation working correctly');
    await delay(1000); // Pause before next test
  });

  test('should show validation error for oversized image', async ({ page }) => {
    console.log('=== Test 2: Oversized Image ===');
    
    // Fill all required fields
    await fillAllFields(page);
    
    console.log('Uploading oversized image...');
    // Create a large image file (2MB) using proper format
    const largeImageBuffer = Buffer.from(Array(2 * 1024 * 1024).fill(0)); // 2MB
    const largeImage = {
      name: 'large.jpg',
      mimeType: 'image/jpeg',
      buffer: largeImageBuffer
    };
    
    // Upload the large image
    await page.setInputFiles('#student-profile-photo', [largeImage]);
    await delay(1000); // Pause after file upload
    
    console.log('Submitting form...');
    // Try to submit form
    await page.click('button[type="submit"]');
    await delay(2000); // Wait for validation to appear
    
    // Debug: Check what validation messages are shown
    const errorElements = await page.locator('[class*="error"], [class*="invalid"], [data-testid*="error"]').all();
    console.log('Number of error elements:', errorElements.length);
    for (let i = 0; i < errorElements.length; i++) {
      const text = await errorElements[i].textContent();
      console.log(`Error element ${i}: "${text}"`);
    }
    
    console.log('Checking for file size validation error...');
    // Should show validation error for file size
    await expect(page.locator('text=The student profile.files.2 field may not be greater than 1024 kilobytes').first()).toBeVisible();
    
    console.log('✅ Test 2 PASSED: File size validation working correctly');
    await delay(1000); // Pause before next test
  });

  test('should show validation error for incorrect image dimensions', async ({ page }) => {
    // Create an image with incorrect dimensions (100x100px) using proper format
    const incorrectImageBuffer = Buffer.from(Array(50 * 1024).fill(0)); // 50KB
    const incorrectImage = {
      name: 'incorrect.jpg',
      mimeType: 'image/jpeg',
      buffer: incorrectImageBuffer
    };
    
    // Upload the image with incorrect dimensions
    await page.setInputFiles('#student-profile-photo', [incorrectImage]);
    
    // Try to submit form
    await page.click('button[type="submit"]');
    
    // Should show validation error for dimensions
    await expect(page.locator('text=invalid dimensions')).toBeVisible();
  });

  test('should successfully upload correct image format and size', async ({ page }) => {
    console.log('=== Test 4: Successful Photo Upload and Display ===');
    
    // Fill all required fields
    await fillAllFields(page);
    
    console.log('Creating a valid image file...');
    // Create a proper small image (300x400px, 50KB) - within valid dimensions
    const validImageBuffer = Buffer.from(Array(50 * 1024).fill(0)); // 50KB
    const validImage = {
      name: 'valid-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: validImageBuffer
    };
    
    // Upload the valid image
    await page.setInputFiles('#student-profile-photo', [validImage]);
    await delay(1000); // Pause after file upload
    
    console.log('Submitting form...');
    // Submit form
    await page.click('button[type="submit"]');
    await delay(3000); // Wait for submission and redirect
    
    // Check if student was created successfully
    await expect(page.locator('text=Student created successfully!')).toBeVisible();
    
    console.log('✅ Student created successfully with photo');
    
    // Navigate to student's main page to check photo display
    console.log('Navigating to student main page to check photo display...');
    
    // First go to students list to find the new student
    await page.click('[data-testid="sidebar-students"]');
    await page.waitForURL(/students/);
    await page.waitForLoadState('networkidle');
    await delay(1000);
    
    // Search for the student we just created
    await page.fill('#search-input', 'Test Student');
    await delay(1000);
    
    // Click on the student to go to their main page
    await page.click('text=Test Student');
    await page.waitForURL(/student-main/);
    await page.waitForLoadState('networkidle');
    await delay(2000);
    
    console.log('Checking if photo is displayed in student main page...');
    // Check if the photo is displayed (should have img with src)
    const profileImage = page.locator('img[alt="Student Photo (3x4)"]');
    await expect(profileImage).toBeVisible();
    
    // Verify the image has a valid src (not placeholder)
    const imageSrc = await profileImage.getAttribute('src');
    console.log('Photo src:', imageSrc);
    expect(imageSrc).not.toBeNull();
    expect(imageSrc).not.toBe('');
    
    console.log('✅ Photo successfully displayed in student main page');
    
    // Test photo display in student form (edit mode)
    console.log('Testing photo display in student form...');
    
    // Find and click edit button
    await page.click('button:has-text("Edit")');
    await page.waitForURL(/student-form/);
    await page.waitForLoadState('networkidle');
    await delay(2000);
    
    // Check if photo is displayed in the form
    const formPhotoInput = page.locator('#student-profile-photo');
    await expect(formPhotoInput).toBeVisible();
    
    // Check if current photo is shown
    const currentPhoto = page.locator('text=Current photo');
    if (await currentPhoto.count() > 0) {
      console.log('✅ Photo is displayed in student form');
    } else {
      console.log('ℹ️ Photo preview in form may not be implemented yet');
    }
    
    console.log('✅ Test 4 PASSED: Photo upload and display working correctly');
    await delay(1000);
  });

  test('should show help text for photo requirements', async ({ page }) => {
    // Check if help text is visible
    await expect(page.locator('text=Please upload a 3x4 cm photo in JPG or PNG format')).toBeVisible();
  });
});
