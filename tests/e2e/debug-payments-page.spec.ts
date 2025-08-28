import { test, expect } from '@playwright/test';

test.describe('Debug Payments Page', () => {
  test('should debug payments page data structure', async ({ page }) => {
    // Capture console logs and errors
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      } else if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to login page
    await page.goto('/');
    
    // Login as admin
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to main page
    await page.waitForURL('/main');
    
    // Navigate to Payments page
    await page.click('a[href="/payments"]');
    await page.waitForURL('/payments');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Log page content
    const pageContent = await page.content();
    console.log('📄 Page content length:', pageContent.length);
    console.log('📄 Current URL:', page.url());
    
    // Check if we're on the payments page
    const isOnPaymentsPage = page.url().includes('/payments');
    console.log('📄 On payments page:', isOnPaymentsPage);
    
    // Check for specific content
    const hasPaymentsTitle = await page.locator('text=Payments').count();
    console.log('📄 Has Payments title:', hasPaymentsTitle);
    
    const hasDebugInfo = await page.locator('text=Loading:').count();
    console.log('📄 Has debug info:', hasDebugInfo);
    
    // Get debug info content
    const debugInfo = await page.locator('.mb-4.p-4.bg-gray-100.rounded').textContent();
    console.log('📄 Debug info content:', debugInfo);
    
    // Check if table exists
    const table = page.locator('table, .table, [role="table"]');
    const tableExists = await table.count();
    console.log('📊 Table count:', tableExists);
    
    // Check for CTable specific elements
    const ctableDiv = await page.locator('.overflow-x-auto.relative.border.border-gray-300').count();
    console.log('📊 CTable div count:', ctableDiv);
    
    const ctableTable = await page.locator('.overflow-x-auto.relative.border.border-gray-300 table').count();
    console.log('📊 CTable table count:', ctableTable);
    
    if (tableExists > 0) {
      // Get table rows
      const rows = page.locator('tbody tr, [role="row"]');
      const rowCount = await rows.count();
      console.log('📊 Row count:', rowCount);
      
      if (rowCount > 0) {
        // Get first row cells
        const firstRow = rows.first();
        const cells = firstRow.locator('td, th');
        const cellCount = await cells.count();
        console.log('📊 Cell count in first row:', cellCount);
        
        // Get cell contents
        const cellContents = await cells.allTextContents();
        console.log('📊 Cell contents:', cellContents);
        
        // Check for specific data
        const hasPaymentData = cellContents.some(content => 
          content.includes('Payment') || content.includes('Amount') || content.includes('Status')
        );
        console.log('📊 Has payment data:', hasPaymentData);
      }
    }
    
    // Check for error messages
    const errorMessages = await page.locator('.error, .alert-error, [role="alert"]').allTextContents();
    console.log('❌ Error messages:', errorMessages);
    
    // Check for loading indicators
    const loadingElements = await page.locator('.loading, [data-loading="true"]').count();
    console.log('⏳ Loading elements:', loadingElements);
    
    // Log console messages
    console.log('🔍 Console logs:', consoleLogs);
    console.log('❌ Console errors:', consoleErrors);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-payments-page.png' });
    
    // Basic assertion - just check that we're on the payments page
    expect(page.url()).toContain('/payments');
  });
});
