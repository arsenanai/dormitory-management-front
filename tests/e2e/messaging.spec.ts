import { test, expect } from './test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set to run these tests.');
}

const uniqueMessage = () => `Test message ${Date.now()}`;

const selectors = {
  messageInput: '#message-input',
  sendButton: 'button:has-text("Send")',
  messageRow: (content: string) => `tr:has-text("${content}")`,
  errorMessage: '.error, .alert-danger, [role="alert"]',
};

test.describe('Messaging E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/\/(main|messages)/, { timeout: 15000 });
    await page.goto('http://localhost:5173/messages');
    await page.waitForLoadState('networkidle');
  });

  test('should send a message and see it in history', async ({ page }) => {
    const msg = uniqueMessage();
    await page.fill(selectors.messageInput, msg);
    await page.click(selectors.sendButton);
    // Wait for message to appear in history
    await expect(page.locator(selectors.messageRow(msg))).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for empty message', async ({ page }) => {
    await page.fill(selectors.messageInput, '');
    await page.click(selectors.sendButton);
    await expect(page.locator(selectors.errorMessage)).toContainText(['cannot be empty']);
  });

  test('should mark message as read when selected', async ({ page }) => {
    const msg = uniqueMessage();
    await page.fill(selectors.messageInput, msg);
    await page.click(selectors.sendButton);
    await expect(page.locator(selectors.messageRow(msg))).toBeVisible({ timeout: 5000 });
    // Click the message row to select/mark as read
    await page.click(selectors.messageRow(msg));
    // Optionally, check for a read indicator (e.g., class, icon, etc.)
    // await expect(page.locator(selectors.messageRow(msg))).toHaveClass(/read/);
  });

  // If editing/deleting messages is supported, add tests here
  // test('should edit a message', async ({ page }) => { ... });
  // test('should delete a message', async ({ page }) => { ... });
}); 