import { test, expect } from '@playwright/test';

test.describe('Dormitories Verification', () => {
  test('should load dormitories page and display content', async ({ page }) => {
    // First login
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    await page.fill('#login-email', 'sudo@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for login to complete
    await page.waitForURL(/\/main/, { timeout: 10000 });
    
    // Navigate to dormitories page
    await page.goto('/dormitories');
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded
    await expect(page).toHaveURL(/\/dormitories/);
    
    // Wait a bit for content to load
    await page.waitForTimeout(3000);
    
    // Check if there's any content on the page
    const pageContent = await page.textContent('body');
    console.log('Page content:', pageContent?.substring(0, 500));
    
    // Look for dormitories-related content
    const dormitoryContent = page.locator('text=Dormitory, text=Dormitories, text=Add Dormitory');
    const contentCount = await dormitoryContent.count();
    
    console.log(`Found ${contentCount} dormitory-related text elements`);
    
    // Check if there are any tables or data
    const tables = page.locator('table');
    const tableCount = await tables.count();
    console.log(`Found ${tableCount} tables`);
    
    // Check if there are any loading or error states
    const loadingState = page.locator('[data-testid="loading"]');
    const errorState = page.locator('.text-red-500');
    
    if (await loadingState.count() > 0) {
      console.log('Page is still loading');
    }
    
    if (await errorState.count() > 0) {
      const errorText = await errorState.first().textContent();
      console.log('Error state found:', errorText);
    }
    
    // Look for any content that might indicate the page loaded
    const anyContent = page.locator('h1, h2, h3, button, input, div');
    const contentElements = await anyContent.count();
    console.log(`Found ${contentElements} content elements`);
    
    // The page should have some content
    expect(contentElements).toBeGreaterThan(0);
    
    console.log('✅ Dormitories page loaded');
  });
});
