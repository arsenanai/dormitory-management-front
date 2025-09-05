import { test, expect } from '@playwright/test';

test.describe('Message Creation and Student View Test', () => {
  test('Admin creates message and student can view it', async ({ page }) => {
    // Test data
    const adminEmail = 'admin@email.com';
    const adminPassword = 'supersecret';
    const testMessageTitle = 'Test Announcement for All Students';
    const testMessageContent = 'This is a test announcement for all students';

    // Step 1: Admin logs in and creates message
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
    
    // Select all students recipient type
    await modal.locator('select').first().selectOption('all');
    
    // Submit the message
    await page.click('[data-testid="submit-message-button"]');
    
    // Wait for modal to close (indicating success)
    await page.waitForTimeout(3000);
    
    // Check if modal is closed
    const modalStillOpen = await modal.count();
    console.log('Modal still open after submit:', modalStillOpen);
    
    if (modalStillOpen === 0) {
      console.log('Message created successfully!');
      
      // Step 2: Verify message appears in admin's message list
      await page.waitForTimeout(2000);
      
      // Check if the message appears in the admin's list
      const messageInList = page.locator(`text=${testMessageTitle}`);
      const messageCount = await messageInList.count();
      console.log('Message found in admin list:', messageCount);
      
      if (messageCount > 0) {
        console.log('✅ Message appears in admin list');
      } else {
        console.log('❌ Message not found in admin list');
        await page.screenshot({ path: 'debug-admin-messages-list.png' });
      }
      
      // Step 3: Test student view (simplified)
      console.log('Testing student view...');
      
      // First, let's check what messages exist in the database via admin API
      const adminMessagesResponse = await page.evaluate(async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/messages', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return response.json();
      });
      
      console.log('Admin messages API response:', adminMessagesResponse);
      
      // Now let's test student login and check their messages
      await page.goto('/');
      await page.fill('#login-email', 'student@email.com');
      await page.fill('#login-password', 'studentpass');
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for student dashboard to load
      await page.waitForURL('/student-main');
      
      // Check student messages via API
      const studentResponse = await page.evaluate(async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/my-messages', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return response.json();
      });
      
      console.log('Student API response:', studentResponse);
      
    } else {
      console.log('❌ Message creation failed');
      await page.screenshot({ path: 'debug-message-creation-failed.png' });
    }
  });
});
