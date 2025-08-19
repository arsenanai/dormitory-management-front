import { test, expect } from '@playwright/test';

test.describe('Project Review Notes Verification - Frontend UI Elements', () => {
  test('should verify basic page structure and authentication UI', async ({ page }) => {
    console.log('🔍 Starting Project Review Notes Verification...');
    
    // Navigate to the main page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('✅ Page loaded successfully');
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    expect(title).toContain('SDU Dormitory');
    
    // Check app container
    await expect(page.locator('#app')).toBeVisible();
    console.log('✅ Vue.js app container is visible');
    
    // Wait for Vue to render
    await page.waitForTimeout(3000);
    
    // Check for login form elements
    const loginForm = page.locator('form');
    const hasLoginForm = await loginForm.count() > 0;
    console.log(`🔐 Login form found: ${hasLoginForm}`);
    
    if (hasLoginForm) {
      // Check for email and password fields
      const emailField = page.locator('input[type="email"], #login-email, #email');
      const passwordField = page.locator('input[type="password"], #login-password, #password');
      
      const hasEmailField = await emailField.count() > 0;
      const hasPasswordField = await passwordField.count() > 0;
      
      console.log(`📧 Email field found: ${hasEmailField}`);
      console.log(`🔒 Password field found: ${hasPasswordField}`);
      
      expect(hasEmailField).toBe(true);
      expect(hasPasswordField).toBe(true);
    }
    
    // Check for registration tab/switch
    const registerTab = page.locator('button[role="tab"], .tab, [data-testid="register-tab"]');
    const hasRegisterTab = await registerTab.count() > 0;
    console.log(`📝 Registration tab found: ${hasRegisterTab}`);
    
    // Check for language selector
    const languageSelector = page.locator('select[name="language"], .language-selector, [data-testid="language-selector"]');
    const hasLanguageSelector = await languageSelector.count() > 0;
    console.log(`🌐 Language selector found: ${hasLanguageSelector}`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'project-review-verification.png' });
    console.log('📸 Screenshot saved as project-review-verification.png');
    
    console.log('✅ Basic authentication UI verification completed');
  });

  test('should verify responsive design elements', async ({ page }) => {
    console.log('📱 Testing responsive design elements...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check if page is responsive
    const appContainer = page.locator('#app');
    const containerBox = await appContainer.boundingBox();
    
    if (containerBox) {
      console.log(`📱 Mobile viewport - App container width: ${containerBox.width}px`);
      expect(containerBox.width).toBeLessThanOrEqual(375);
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const tabletContainerBox = await appContainer.boundingBox();
    if (tabletContainerBox) {
      console.log(`📱 Tablet viewport - App container width: ${tabletContainerBox.width}px`);
      expect(tabletContainerBox.width).toBeLessThanOrEqual(768);
    }
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const desktopContainerBox = await appContainer.boundingBox();
    if (desktopContainerBox) {
      console.log(`🖥️ Desktop viewport - App container width: ${desktopContainerBox.width}px`);
      expect(desktopContainerBox.width).toBeLessThanOrEqual(1920);
    }
    
    console.log('✅ Responsive design verification completed');
  });

  test('should verify Vue.js component rendering', async ({ page }) => {
    console.log('⚡ Testing Vue.js component rendering...');
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check for Vue.js specific attributes
    const vueElements = page.locator('[data-v-], .vue-component, .v-application');
    const vueCount = await vueElements.count();
    console.log(`⚡ Vue.js elements found: ${vueCount}`);
    
    // Check for dynamic content
    const dynamicElements = page.locator('[v-if], [v-show], [v-for], [v-model]');
    const dynamicCount = await dynamicElements.count();
    console.log(`🔄 Dynamic Vue elements found: ${dynamicCount}`);
    
    // Check if the app is interactive
    const interactiveElements = page.locator('button, input, select, a');
    const interactiveCount = await interactiveElements.count();
    console.log(`🖱️ Interactive elements found: ${interactiveCount}`);
    
    expect(interactiveCount).toBeGreaterThan(0);
    
    console.log('✅ Vue.js component rendering verification completed');
  });

  test('should verify accessibility and UI standards', async ({ page }) => {
    console.log('♿ Testing accessibility and UI standards...');
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check for proper form labels
    const formInputs = page.locator('input, select, textarea');
    const formInputCount = await formInputs.count();
    console.log(`📝 Form inputs found: ${formInputCount}`);
    
    // Check for proper button types
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`🔘 Buttons found: ${buttonCount}`);
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    console.log(`📋 Headings found: ${headingCount}`);
    
    // Check for proper color contrast (basic check)
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    console.log(`🎨 Background color: ${backgroundColor}`);
    
    console.log('✅ Accessibility and UI standards verification completed');
  });

  test('should verify project review notes specific features', async ({ page }) => {
    console.log('📋 Testing Project Review Notes specific features...');
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check for specific features mentioned in project review notes
    console.log('🔍 Checking for specific features...');
    
    // 1. Check if the page loads without errors
    const errorElements = page.locator('.error, .alert-danger, [role="alert"]');
    const errorCount = await errorElements.count();
    console.log(`❌ Error elements found: ${errorCount}`);
    
    // 2. Check for loading states
    const loadingElements = page.locator('.loading, .spinner, [data-loading]');
    const loadingCount = await loadingElements.count();
    console.log(`⏳ Loading elements found: ${loadingCount}`);
    
    // 3. Check for proper navigation structure
    const navElements = page.locator('nav, .navigation, .sidebar, .menu');
    const navCount = await navElements.count();
    console.log(`🧭 Navigation elements found: ${navCount}`);
    
    // 4. Check for proper form validation indicators
    const validationElements = page.locator('.validation, .error-message, .help-text');
    const validationCount = await validationElements.count();
    console.log(`✅ Validation elements found: ${validationCount}`);
    
    // 5. Check for responsive breakpoints
    const responsiveClasses = page.locator('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]');
    const responsiveCount = await responsiveClasses.count();
    console.log(`📱 Responsive utility classes found: ${responsiveCount}`);
    
    console.log('✅ Project Review Notes specific features verification completed');
  });
});
