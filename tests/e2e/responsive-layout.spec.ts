import { test, expect } from './test';
import { TestUtils, SELECTORS } from './test-utils';

// Comprehensive viewport configurations for different devices
const viewports = [
  { name: 'mobile-chrome', width: 393, height: 851 }, // Pixel 5
  { name: 'mobile-safari', width: 390, height: 844 }, // iPhone 12
  { name: 'tablet', width: 1194, height: 834 }, // iPad Pro 11 landscape
  { name: 'desktop', width: 1440, height: 900 }, // Desktop
];

// Test pages with their key elements and expected behaviors
const pagesToTest = [
  { 
    path: '/main', 
    label: 'Dashboard',
    keyElements: ['h1', 'h2', '.dashboard', '[data-testid="dashboard"]', '.stats-grid', '.chart-container'],
    expectedResponsive: true
  },
  { 
    path: '/account-preferences', 
    label: 'Account Preferences',
    keyElements: ['h1', 'h2', '.profile-form', '[data-testid="profile-form"]', '.password-form', '[data-testid="password-form"]'],
    expectedResponsive: true
  },
  { 
    path: '/users', 
    label: 'Users',
    keyElements: ['h1', 'h2', '.users-table', '[data-testid="users-table"]', '.user-filters'],
    expectedResponsive: true
  },
  { 
    path: '/rooms', 
    label: 'Rooms',
    keyElements: ['h1', 'h2', '.rooms-table', '[data-testid="rooms-table"]', '.room-filters'],
    expectedResponsive: true
  },
  { 
    path: '/payments', 
    label: 'Payments',
    keyElements: ['h1', 'h2', '.payments-table', '[data-testid="payments-table"]', '.payment-filters'],
    expectedResponsive: true
  },
  { 
    path: '/messages', 
    label: 'Messages',
    keyElements: ['h1', 'h2', '.messages-table', '[data-testid="messages-table"]', '.message-filters'],
    expectedResponsive: true
  },
  { 
    path: '/dormitories', 
    label: 'Dormitories',
    keyElements: ['h1', 'h2', '.dormitories-table', '[data-testid="dormitories-table"]', '.dormitory-filters'],
    expectedResponsive: true
  }
];

test.describe('Responsive Layouts E2E', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await TestUtils.login(page, 'admin');
        await page.waitForLoadState('networkidle');
      });

      for (const pageInfo of pagesToTest) {
        test(`should render ${pageInfo.label} correctly on ${viewport.name}`, async ({ page }) => {
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');
          
          // Check for main heading or key element
          let foundKeyElement = false;
          for (const selector of pageInfo.keyElements) {
            const element = page.locator(selector);
            if (await element.count() > 0) {
              await expect(element.first()).toBeVisible();
              foundKeyElement = true;
              break;
            }
          }
          
          // If no specific key elements found, check for general page content
          if (!foundKeyElement) {
            const generalElements = page.locator('h1, h2, .main-content, .dashboard, .page-content, [data-testid="page-content"]');
            await expect(generalElements.first()).toBeVisible();
          }

          // Check responsive behavior
          if (pageInfo.expectedResponsive) {
            // Check for horizontal overflow
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = viewport.width;
            expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small tolerance

            // Check for minimal horizontal scrolling
            const hasHorizontalScroll = await page.evaluate(() => {
              return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            
            if (hasHorizontalScroll) {
              const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
              const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
              const overflow = scrollWidth - clientWidth;
              expect(overflow).toBeLessThan(100); // Allow reasonable overflow for mobile
            }
          }
        });

        test(`should have proper touch targets on ${pageInfo.label} for ${viewport.name}`, async ({ page }) => {
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');

          // Check interactive elements have proper touch target sizes
          const interactiveSelectors = [
            'button', 'a', 'input[type="button"]', 'input[type="submit"]',
            '[role="button"]', '[tabindex]', '.clickable', '[data-testid*="button"]'
          ];

          for (const selector of interactiveSelectors) {
            const elements = page.locator(selector);
            const elementCount = await elements.count();
            
            if (elementCount > 0) {
              for (let i = 0; i < Math.min(elementCount, 5); i++) {
                const element = elements.nth(i);
                if (await element.isVisible()) {
                  const box = await element.boundingBox();
                  if (box) {
                    // Mobile touch targets should be at least 44x44 pixels
                    expect(box.width).toBeGreaterThanOrEqual(44);
                    expect(box.height).toBeGreaterThanOrEqual(44);
                  }
                }
              }
            }
          }
        });

        test(`should maintain proper spacing on ${pageInfo.label} for ${viewport.name}`, async ({ page }) => {
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');

          // Check common elements have proper spacing
          const spacingSelectors = [
            'input', 'button', 'select', 'textarea', 'table', 'form'
          ];

          for (const selector of spacingSelectors) {
            const elements = page.locator(selector);
            const elementCount = await elements.count();
            
            if (elementCount > 0) {
              for (let i = 0; i < Math.min(elementCount, 3); i++) {
                const element = elements.nth(i);
                if (await element.isVisible()) {
                  const styles = await element.evaluate((el) => {
                    const computed = window.getComputedStyle(el);
                    return {
                      padding: computed.padding,
                      margin: computed.margin
                    };
                  });
                  
                  // Verify elements have some spacing
                  expect(styles.padding).not.toBe('0px');
                }
              }
            }
          }
        });
      }

      test(`should handle navigation properly on ${viewport.name}`, async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Test sidebar navigation
        const sidebar = page.locator(SELECTORS.sidebar);
        if (await sidebar.count() > 0) {
          await expect(sidebar.first()).toBeVisible();
          
          // Test sidebar toggle if available (mobile)
          if (viewport.name.includes('mobile') || viewport.name.includes('tablet')) {
            const sidebarToggle = page.locator('[data-testid="sidebar-toggle"], .sidebar-toggle, button:has-text("Menu")');
            if (await sidebarToggle.count() > 0) {
              await expect(sidebarToggle.first()).toBeVisible();
              
              // Test toggle functionality
              await sidebarToggle.first().click();
              await page.waitForTimeout(500);
              
              // Check sidebar state changed
              await expect(sidebar.first()).toBeVisible();
            }
          }
        }

        // Test navigation between pages
        const navigationTests = [
          { from: '/main', to: '/users', label: 'Users' },
          { from: '/users', to: '/rooms', label: 'Rooms' },
          { from: '/rooms', to: '/payments', label: 'Payments' }
        ];

        for (const navTest of navigationTests) {
          await page.goto(navTest.from);
          await page.waitForLoadState('networkidle');

          // Try to navigate using sidebar or navigation menu
          const navLink = page.locator(`a:has-text("${navTest.label}"), [data-testid="nav-${navTest.label.toLowerCase()}"]`);
          
          if (await navLink.count() > 0) {
            await navLink.first().click();
            await page.waitForLoadState('networkidle');
            
            // Verify navigation worked
            await expect(page).toHaveURL(new RegExp(navTest.to.replace('/', '')));
            
            // Check page loaded properly
            const pageContent = page.locator('h1, h2, .main-content, [data-testid="page-content"]');
            await expect(pageContent.first()).toBeVisible();
          }
        }
      });

      test(`should handle forms properly on ${viewport.name}`, async ({ page }) => {
        await page.goto('/account-preferences');
        await page.waitForLoadState('networkidle');

        // Check form elements are properly sized for mobile
        const formElements = [
          'input[type="text"]', 'input[type="email"]', 'input[type="password"]',
          'select', 'textarea', 'button[type="submit"]'
        ];

        for (const selector of formElements) {
          const elements = page.locator(selector);
          const elementCount = await elements.count();
          
          if (elementCount > 0) {
            for (let i = 0; i < Math.min(elementCount, 3); i++) {
              const element = elements.nth(i);
              if (await element.isVisible()) {
                const box = await element.boundingBox();
                if (box) {
                  // Form elements should be reasonably sized
                  expect(box.width).toBeGreaterThan(100);
                  expect(box.height).toBeGreaterThan(20);
                  
                  // Check element doesn't overflow viewport
                  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
                }
              }
            }
          }
        }
      });

      test(`should handle tables properly on ${viewport.name}`, async ({ page }) => {
        await page.goto('/users');
        await page.waitForLoadState('networkidle');

        // Check table responsiveness
        const tableSelectors = [
          'table', '.table', '[data-testid="table"]', '.users-table', '[data-testid="users-table"]'
        ];

        for (const selector of tableSelectors) {
          const table = page.locator(selector);
          if (await table.count() > 0) {
            await expect(table.first()).toBeVisible();
            
            const tableBox = await table.first().boundingBox();
            if (tableBox) {
              // Table should not overflow viewport
              expect(tableBox.width).toBeLessThanOrEqual(viewport.width);
              
              // Check table cells have proper spacing
              const cells = table.first().locator('td, th');
              const cellCount = await cells.count();
              
              if (cellCount > 0) {
                for (let i = 0; i < Math.min(cellCount, 5); i++) {
                  const cell = cells.nth(i);
                  if (await cell.isVisible()) {
                    const styles = await cell.evaluate((el) => {
                      const computed = window.getComputedStyle(el);
                      return {
                        padding: computed.padding,
                        borderSpacing: computed.borderSpacing
                      };
                    });
                    
                    // Verify cells have some padding
                    expect(styles.padding).not.toBe('0px');
                  }
                }
              }
            }
            break;
          }
        }
      });
    });
  }
}); 