import { test, expect } from '@playwright/test';

test.describe('Simple Payments Debug', () => {
  test('should check payments page directly', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log('🔍 Console:', msg.text());
    });

    // Enable network request logging
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('📤 Request:', request.method(), request.url());
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log('📥 Response:', response.status(), response.url());
        if (response.url().includes('/api/payments')) {
          response.json().then(data => {
            console.log('📊 Payments API Response:', JSON.stringify(data, null, 2));
          }).catch(err => {
            console.log('❌ Error parsing payments response:', err);
          });
        }
      }
    });

    // Navigate directly to payments page
    await page.goto('http://localhost:3000/payments');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(3000);
    
    // Check if the page loaded
    const pageTitle = await page.textContent('h1');
    console.log('📄 Page title:', pageTitle);
    
    // Check for loading state
    const loadingElements = await page.locator('text=Loading').count();
    console.log('⏳ Loading elements:', loadingElements);
    
    // Check for error messages
    const errorElements = await page.locator('text=Failed to load').count();
    console.log('❌ Error elements:', errorElements);
    
    // Check the actual table content
    const tableRows = await page.locator('table tbody tr').count();
    console.log('📊 Table rows:', tableRows);
    
    // Check if there's a "No data available" message
    const noDataMessage = await page.locator('text=No data available').count();
    console.log('📭 No data message count:', noDataMessage);
    
    // Check the debug info if it exists
    const debugInfo = await page.locator('.mb-4.p-4.bg-gray-100.rounded').textContent().catch(() => null);
    console.log('🐛 Debug info:', debugInfo);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'simple-payments-debug.png', fullPage: true });
    
    // The test should pass regardless of the current state
    expect(pageTitle).toBe('Payments');
  });
});
