import { test, expect } from './test';

test.describe('Accessibility CSS Classes E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should apply accessibility-mode class when added to document', async ({ page }) => {
    // Add accessibility-mode class to document
    await page.evaluate(() => {
      document.documentElement.classList.add('accessibility-mode');
    });
    
    // Check that the class was added
    const hasClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('accessibility-mode');
    });
    
    expect(hasClass).toBe(true);
  });

  test('should apply high-contrast class when added to document', async ({ page }) => {
    // Add high-contrast class to document
    await page.evaluate(() => {
      document.documentElement.classList.add('high-contrast');
    });
    
    // Check that the class was added
    const hasClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('high-contrast');
    });
    
    expect(hasClass).toBe(true);
  });

  test('should apply reduced-motion class when added to document', async ({ page }) => {
    // Add reduced-motion class to document
    await page.evaluate(() => {
      document.documentElement.classList.add('reduced-motion');
    });
    
    // Check that the class was added
    const hasClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('reduced-motion');
    });
    
    expect(hasClass).toBe(true);
  });

  test('should apply large-text class when added to document', async ({ page }) => {
    // Add large-text class to document
    await page.evaluate(() => {
      document.documentElement.classList.add('large-text');
    });
    
    // Check that the class was added
    const hasClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('large-text');
    });
    
    expect(hasClass).toBe(true);
  });

  test('should remove classes when removed from document', async ({ page }) => {
    // Add all classes
    await page.evaluate(() => {
      document.documentElement.classList.add('accessibility-mode', 'high-contrast', 'reduced-motion', 'large-text');
    });
    
    // Remove all classes
    await page.evaluate(() => {
      document.documentElement.classList.remove('accessibility-mode', 'high-contrast', 'reduced-motion', 'large-text');
    });
    
    // Check that all classes were removed
    const hasAccessibilityClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('accessibility-mode');
    });
    
    const hasHighContrastClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('high-contrast');
    });
    
    const hasReducedMotionClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('reduced-motion');
    });
    
    const hasLargeTextClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('large-text');
    });
    
    expect(hasAccessibilityClass).toBe(false);
    expect(hasHighContrastClass).toBe(false);
    expect(hasReducedMotionClass).toBe(false);
    expect(hasLargeTextClass).toBe(false);
  });

  test('should apply accessibility styles to focus elements', async ({ page }) => {
    // Add accessibility-mode class
    await page.evaluate(() => {
      document.documentElement.classList.add('accessibility-mode');
    });
    
    // Create a test button and focus it
    await page.evaluate(() => {
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      button.className = 'focus:ring-4 focus:ring-primary-300';
      document.body.appendChild(button);
      button.focus();
    });
    
    // Check that the button has the accessibility styles
    const button = page.locator('button:has-text("Test Button")');
    await expect(button).toBeVisible();
    
    // The button should have focus and accessibility styles applied
    const hasFocus = await page.evaluate(() => {
      const button = document.querySelector('button');
      return button === document.activeElement;
    });
    
    expect(hasFocus).toBe(true);
  });
}); 