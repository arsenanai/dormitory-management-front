import { test, expect } from '@playwright/test';

test.describe('Debug Edit Form', () => {
  test('should debug edit form navigation', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log('🔍 Console:', msg.text());
    });

    // Set authentication token in localStorage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('token', '637|CHrzjqOZacPQvhkrm7vbmz6oOLJceerrJillNYIWfd3699d6');
    });

    // Navigate to students page
    await page.goto('http://localhost:3000/students');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
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
      
      // Look for edit buttons
      const editButtons = firstRow.locator('button:has-text("Edit"), a:has-text("Edit"), [data-testid*="edit"]');
      const editButtonCount = await editButtons.count();
      console.log('🔘 Edit buttons count:', editButtonCount);
      
      if (editButtonCount > 0) {
        console.log('✅ Found edit button, clicking...');
        await editButtons.first().click();
        
        // Wait for navigation
        await page.waitForTimeout(2000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log('🌐 Current URL:', currentUrl);
        
        // Check if form exists
        const form = page.locator('form');
        const formCount = await form.count();
        console.log('📝 Form count:', formCount);
        
        if (formCount > 0) {
          console.log('✅ Form found');
          const formVisible = await form.isVisible();
          console.log('👁️ Form visible:', formVisible);
        } else {
          console.log('❌ No form found');
        }
        
        // Take a screenshot
        await page.screenshot({ path: 'debug-edit-form.png', fullPage: true });
      } else {
        console.log('❌ No edit button found');
        // Take a screenshot to see what's on the page
        await page.screenshot({ path: 'debug-no-edit-button.png', fullPage: true });
      }
    } else {
      console.log('❌ No student rows found');
      // Take a screenshot to see what's on the page
      await page.screenshot({ path: 'debug-no-rows.png', fullPage: true });
    }
    
    // The test should pass regardless of the current state
    expect(pageTitle).toBe('Students');
  });
});
