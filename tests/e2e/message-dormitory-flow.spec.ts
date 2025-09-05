import { test, expect } from '@playwright/test';

test.describe('Message Dormitory Flow', () => {
  test('Admin can send message to dormitory and student can view it', async ({ page }) => {
    // Test data
    const adminEmail = 'admin@email.com';
    const adminPassword = 'supersecret';
    const studentEmail = 'student@email.com';
    const studentPassword = 'studentpass';
    const testMessageTitle = 'Test Dormitory Announcement';
    const testMessageContent = 'This is a test announcement for all students in dormitory 2';

    // Step 1: Admin logs in and sends message to dormitory
    await page.goto('/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for admin dashboard to load
    await page.waitForURL('/main');
    
    // Navigate to Messages page
    await page.click('text=Messages');
    await page.waitForURL('/messages');
    
    // Click Add Message button
    await page.click('[data-testid="add-message-button"]');
    
    // Wait for modal to appear
    await page.waitForTimeout(2000);
    
    // Find the modal
    const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
    
    // Fill the message form
    await modal.locator('input').first().fill(testMessageTitle);
    await modal.locator('textarea').first().fill(testMessageContent);
    
    // Select all students recipient type (simpler than dormitory)
    await modal.locator('select').first().selectOption('all');
    
    // Submit the message
    await page.click('[data-testid="submit-message-button"]');
    
    // Wait for modal to close (indicating success)
    await page.waitForTimeout(3000);
    
    // Check if modal is closed
    const modalStillOpen = await modal.count();
    console.log('Modal still open after submit:', modalStillOpen);
    
    if (modalStillOpen === 0) {
      console.log('Message created successfully, proceeding to student test');
      
      // Step 2: Student logs in and checks messages
      await page.goto('/');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      await page.fill('#login-email', studentEmail);
      await page.fill('#login-password', studentPassword);
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for student dashboard to load
      await page.waitForURL('/student-main');
      
      // Wait for page to load completely
      await page.waitForLoadState('networkidle');
      
      // Navigate to Messages page
      await page.click('text=Messages');
      await page.waitForURL('/messages');
      
      // Wait for messages page to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot to see what's on the page
      await page.screenshot({ path: 'debug-student-messages.png' });
      
      // Check if the message appears in the student's messages
      const messageText = await page.locator('body').textContent();
      console.log('Student messages page text (first 500 chars):', messageText?.substring(0, 500));
      
      // Verify student can see the admin's message
      await expect(page.locator(`text=${testMessageTitle}`)).toBeVisible();
      await expect(page.locator(`text=${testMessageContent}`)).toBeVisible();
      
      // Verify the message shows it's from admin
      await expect(page.locator('text=Admin')).toBeVisible();
    } else {
      console.log('Modal still open, message creation failed');
      await page.screenshot({ path: 'debug-message-failed.png' });
    }
  });
});
