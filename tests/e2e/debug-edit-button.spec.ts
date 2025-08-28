import { test, expect } from '@playwright/test';

test.describe('Debug Edit Button', () => {
  test('should debug edit button click', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log('🔍 Console:', msg.text());
    });

    // Login as admin
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/main', { timeout: 30000 });

    // Navigate to students page
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(3000);
    
    // Check if the page loaded
    const pageTitle = await page.textContent('h1');
    console.log('📄 Page title:', pageTitle);
    
    // Check for student rows
    const studentRows = page.locator('tbody tr, [role="row"]');
    const rowCount = await studentRows.count();
    console.log('📊 Student rows count:', rowCount);
    
    if (rowCount > 0) {
      const firstRow = studentRows.first();
      console.log('📋 First row text:', await firstRow.textContent());
      
      // Look for edit buttons with different selectors
      const editButton1 = firstRow.locator('button:has-text("Edit")');
      const editButton2 = firstRow.locator('a:has-text("Edit")');
      const editButton3 = firstRow.locator('[data-testid*="edit"]');
      const editButton4 = firstRow.locator('button');
      
      console.log('🔘 Edit button (text):', await editButton1.count());
      console.log('🔘 Edit button (link):', await editButton2.count());
      console.log('🔘 Edit button (testid):', await editButton3.count());
      console.log('🔘 All buttons:', await editButton4.count());
      
      // Try to find any button in the row
      const allButtons = firstRow.locator('button, a');
      const buttonCount = await allButtons.count();
      console.log('🔘 All clickable elements:', buttonCount);
      
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`🔘 Button ${i}: "${buttonText}"`);
      }
      
      // Take a screenshot
      await page.screenshot({ path: 'debug-edit-button.png', fullPage: true });
    } else {
      console.log('❌ No student rows found');
      // Take a screenshot to see what's on the page
      await page.screenshot({ path: 'debug-no-rows.png', fullPage: true });
    }
    
    // The test should pass regardless of the current state
    expect(pageTitle).toBe('Students');
  });
});
