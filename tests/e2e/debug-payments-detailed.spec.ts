import { test, expect } from '@playwright/test';

test.describe('Debug Payments Page - Detailed', () => {
  test('should debug payments page data loading in detail', async ({ page }) => {
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

    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Wait for the login form to be visible
    await page.waitForSelector('#login-email', { timeout: 10000 });
    
    // Login as admin
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('http://localhost:3000/main');
    
    // Navigate to payments page
    await page.goto('http://localhost:3000/payments');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
    // Check if the page loaded
    const pageTitle = await page.textContent('h1');
    console.log('📄 Page title:', pageTitle);
    
    // Check for loading state
    const loadingElements = await page.locator('text=Loading').count();
    console.log('⏳ Loading elements:', loadingElements);
    
    // Check for error messages
    const errorElements = await page.locator('text=Failed to load').count();
    console.log('❌ Error elements:', errorElements);
    
    // Check the payments data in the component
    const paymentsData = await page.evaluate(() => {
      // Try to access the Vue component data
      const app = (window as any).__VUE_APP__;
      if (app) {
        console.log('Vue app found:', app);
      }
      
      // Check if there's any global state
      const pinia = (window as any).__PINIA__;
      if (pinia) {
        console.log('Pinia found:', pinia);
      }
      
      return {
        hasVueApp: !!app,
        hasPinia: !!pinia,
        windowKeys: Object.keys(window).filter(k => k.includes('vue') || k.includes('pinia') || k.includes('app'))
      };
    });
    
    console.log('🔍 Vue/Pinia debug:', paymentsData);
    
    // Check the actual table content
    const tableRows = await page.locator('table tbody tr').count();
    console.log('📊 Table rows:', tableRows);
    
    // Check if there's a "No data available" message
    const noDataMessage = await page.locator('text=No data available').count();
    console.log('📭 No data message count:', noDataMessage);
    
    // Check the debug info if it exists
    const debugInfo = await page.locator('.mb-4.p-4.bg-gray-100.rounded').textContent().catch(() => null);
    console.log('🐛 Debug info:', debugInfo);
    
    // Check for any JavaScript errors
    const jsErrors = await page.evaluate(() => {
      return (window as any).__JS_ERRORS__ || [];
    });
    console.log('💥 JS Errors:', jsErrors);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'debug-payments-detailed.png', fullPage: true });
    
    // The test should pass regardless of the current state
    expect(pageTitle).toBe('Payments');
  });
});
