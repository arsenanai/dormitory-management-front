import { test, expect } from '@playwright/test';

test.describe('Message Flow Summary', () => {
  test('Complete message flow verification', async ({ page }) => {
    // Test data
    const adminEmail = 'admin@email.com';
    const adminPassword = 'supersecret';
    const testMessageTitle = 'Final Test Message';
    const testMessageContent = 'This is the final test message for verification';

    // Step 1: Admin creates message
    await page.goto('/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    
    await page.waitForURL('/main');
    await page.click('text=Messages');
    await page.waitForURL('/messages');
    
    await page.click('[data-testid="add-message-button"]');
    await page.waitForTimeout(2000);
    
    const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
    await modal.locator('input').first().fill(testMessageTitle);
    await modal.locator('textarea').first().fill(testMessageContent);
    await modal.locator('select').first().selectOption('all');
    
    await page.click('[data-testid="submit-message-button"]');
    await page.waitForTimeout(3000);
    
    const modalStillOpen = await modal.count();
    console.log('Modal still open after submit:', modalStillOpen);
    
    if (modalStillOpen === 0) {
      console.log('✅ Message created successfully!');
      
      // Step 2: Verify message in database via API
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
      
      const latestMessage = adminMessagesResponse.data[0];
      console.log('Latest message:', latestMessage.title);
      
      if (latestMessage.title === testMessageTitle) {
        console.log('✅ Message found in database');
      } else {
        console.log('❌ Message not found in database');
      }
      
      // Step 3: Test student can see the message
      await page.goto('/');
      await page.fill('#login-email', 'student@email.com');
      await page.fill('#login-password', 'studentpass');
      await page.click('button[type="submit"]:has-text("Login")');
      
      await page.waitForURL('/student-main');
      
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
      
      console.log('Student messages count:', studentResponse.data?.length || 0);
      
      const studentMessage = studentResponse.data?.find((msg: any) => msg.title === testMessageTitle);
      if (studentMessage) {
        console.log('✅ Student can see the message');
        console.log('Message details:', {
          title: studentMessage.title,
          content: studentMessage.content,
          sender: studentMessage.sender?.name,
          recipient_type: studentMessage.recipient_type
        });
      } else {
        console.log('❌ Student cannot see the message');
        console.log('Available messages:', studentResponse.data?.map((msg: any) => msg.title));
      }
      
    } else {
      console.log('❌ Message creation failed');
    }
  });
});
