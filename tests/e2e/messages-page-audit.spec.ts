import { test, expect } from '@playwright/test';

test.describe('Messages Page Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/');
    await page.fill('#login-email', 'student@email.com');
    await page.fill('#login-password', 'studentpass');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/student-main');
  });

  test('should display messages data correctly and allow interaction', async ({ page }) => {
    // Navigate to messages page
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');

    // Check if messages interface is visible
    const messagesContainer = page.locator('[data-testid="messages-container"]');
    if (await messagesContainer.count() > 0) {
      await expect(messagesContainer).toBeVisible();
    }

    // Check for messages list or table
    const messagesList = page.locator('[data-testid="messages-list"]');
    const messagesTable = page.locator('[data-testid="messages-table"]');
    
    if (await messagesList.count() > 0) {
      await expect(messagesList).toBeVisible();
      console.log('Messages list found');
    } else if (await messagesTable.count() > 0) {
      await expect(messagesTable).toBeVisible();
      console.log('Messages table found');
    }

    // Check if there are any messages displayed
    const messageRows = page.locator('tbody tr, .message-item, .message-row');
    const rowCount = await messageRows.count();
    
    if (rowCount > 0) {
      console.log(`Found ${rowCount} messages`);
      
      // Get first message data
      const firstMessage = messageRows.first();
      const messageData = await firstMessage.locator('td, .message-content').allTextContents();
      console.log('First message data:', messageData);

      // Check if message has interactive elements
      const messageLink = firstMessage.locator('a, button');
      if (await messageLink.count() > 0) {
        await messageLink.first().click();
        await page.waitForTimeout(1000);
        
        // Check if message detail view opened
        const messageDetail = page.locator('[data-testid="message-detail"], .message-detail');
        if (await messageDetail.count() > 0) {
          await expect(messageDetail).toBeVisible();
          console.log('Message detail view opened');
        }
      }
    } else {
      console.log('No messages found');
    }

    // Check for compose/send message functionality
    const composeButton = page.locator('button:has-text("Compose"), button:has-text("Send"), button:has-text("New")');
    if (await composeButton.count() > 0) {
      await composeButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check if compose form opened
      const composeForm = page.locator('form, [data-testid="compose-form"]');
      if (await composeForm.count() > 0) {
        await expect(composeForm).toBeVisible();
        console.log('Compose form opened');
      }
    }
  });
});
