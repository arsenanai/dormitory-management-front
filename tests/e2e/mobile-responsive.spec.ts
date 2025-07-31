import { test, expect } from './test';
import { TestUtils, SELECTORS } from './test-utils';

// Mobile viewport configurations
const mobileViewports = [
  { name: 'mobile-chrome', width: 393, height: 851 }, // Pixel 5
  { name: 'mobile-safari', width: 390, height: 844 }, // iPhone 12
  { name: 'tablet', width: 1194, height: 834 }, // iPad Pro 11 landscape
];

// Test pages and their key elements
const testPages = [
  {
    path: '/main',
    label: 'Dashboard',
    keyElements: ['h1', 'h2', '.dashboard', '[data-testid="dashboard"]', '.stats-grid', '.chart-container', '.grid']
  },
  {
    path: '/account-preferences',
    label: 'Account Preferences',
    keyElements: ['h1', 'h2', '.profile-form', '[data-testid="profile-form"]', '.password-form', '[data-testid="password-form"]']
  },
  {
    path: '/users',
    label: 'Users',
    keyElements: ['h1', 'h2', '.users-table', '[data-testid="users-table"]', '.user-filters']
  },
  {
    path: '/rooms',
    label: 'Rooms',
    keyElements: ['h1', 'h2', '.rooms-table', '[data-testid="rooms-table"]', '.room-filters']
  }
];

test.describe('Mobile Responsive Design E2E Tests', () => {
  for (const viewport of mobileViewports) {
    test.describe(`${viewport.name} viewport`, () => {
      test.beforeEach(async ({ page }) => {
        // Set viewport size
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Login as admin
        await TestUtils.login(page, 'admin');
        
        // Wait for page to load completely
        await page.waitForLoadState('networkidle');
      });

      test('should display responsive dashboard correctly', async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Check main dashboard elements are visible
        const dashboardElements = [
          'h1', 'h2', '.dashboard', '[data-testid="dashboard"]',
          '.stats-grid', '.chart-container', '.recent-activity', '.grid'
        ];

        for (const selector of dashboardElements) {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            await expect(element.first()).toBeVisible();
          }
        }

        // Check responsive layout - elements should not overflow significantly
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = viewport.width;
        
        // Allow more tolerance for mobile layouts - some components may have fixed widths
        const maxAllowedWidth = viewportWidth + (viewport.name.includes('mobile') ? 150 : 50);
        expect(bodyWidth).toBeLessThanOrEqual(maxAllowedWidth);

        // Check for horizontal scrolling (should be minimal)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (hasHorizontalScroll) {
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
          const overflow = scrollWidth - clientWidth;
          // Allow more overflow for mobile
          const maxOverflow = viewport.name.includes('mobile') ? 100 : 50;
          expect(overflow).toBeLessThan(maxOverflow);
        }
      });

      test('should display responsive account preferences correctly', async ({ page }) => {
        await page.goto('/account-preferences');
        await page.waitForLoadState('networkidle');

        // Check form elements are properly spaced
        const formElements = [
          'input[type="text"]', 'input[type="email"]', 'input[type="password"]',
          'select', 'textarea', 'button[type="submit"]'
        ];

        for (const selector of formElements) {
          const elements = page.locator(selector);
          const count = await elements.count();
          
          if (count > 0) {
            // Check first element for proper spacing
            const firstElement = elements.first();
            await expect(firstElement).toBeVisible();
            
            // Check element has reasonable padding/margin
            const styles = await firstElement.evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                padding: computed.padding,
                margin: computed.margin,
                width: computed.width,
                height: computed.height
              };
            });
            
            // Verify element has some padding and reasonable dimensions
            expect(styles.padding).not.toBe('0px');
            expect(parseInt(styles.width)).toBeGreaterThan(100);
            expect(parseInt(styles.height)).toBeGreaterThan(20);
          }
        }

        // Check form sections have proper spacing
        const sections = page.locator('section, .form-section, [data-testid="form-section"]');
        const sectionCount = await sections.count();
        
        if (sectionCount > 1) {
          // Check spacing between sections
          for (let i = 0; i < Math.min(sectionCount, 3); i++) {
            const section = sections.nth(i);
            const styles = await section.evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                marginBottom: computed.marginBottom,
                padding: computed.padding
              };
            });
            
            // Verify sections have some spacing
            expect(styles.padding).not.toBe('0px');
          }
        }
      });

      test('should display responsive sidebar correctly', async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Check sidebar exists and is properly positioned
        // The sidebar is inside CNavigation component, so we need to look for it there
        const sidebarSelectors = [
          'aside', '.navigation-menu nav', 'nav[aria-label*="sidebar"]', 
          '[data-testid="sidebar"]', '.sidebar', '.nav-item'
        ];

        let sidebar = null;
        for (const selector of sidebarSelectors) {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            sidebar = element.first();
            break;
          }
        }

        if (sidebar) {
          await expect(sidebar).toBeVisible();

          // Check sidebar positioning and dimensions
          const sidebarBox = await sidebar.boundingBox();
          expect(sidebarBox).toBeTruthy();
          
          if (sidebarBox) {
            // On mobile, sidebar should be properly sized
            expect(sidebarBox.width).toBeGreaterThan(200);
            expect(sidebarBox.height).toBeGreaterThan(300);
            
            // Check sidebar links have proper spacing
            const sidebarLinks = sidebar.locator('a, .nav-item, [role="link"]');
            const linkCount = await sidebarLinks.count();
            
            if (linkCount > 0) {
              for (let i = 0; i < Math.min(linkCount, 5); i++) {
                const link = sidebarLinks.nth(i);
                await expect(link).toBeVisible();
                
                // Check link has proper padding
                const styles = await link.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    padding: computed.padding,
                    margin: computed.margin,
                    height: computed.height
                  };
                });
                
                expect(styles.padding).not.toBe('0px');
                expect(parseInt(styles.height)).toBeGreaterThan(30);
              }
            }
          }
        }

        // Check sidebar toggle functionality on mobile
        const sidebarToggle = page.locator('[data-testid="sidebar-toggle"], .sidebar-toggle, button:has-text("Menu"), .mobile-menu-toggle');
        if (await sidebarToggle.count() > 0) {
          await expect(sidebarToggle.first()).toBeVisible();
          
          // Test toggle functionality
          await sidebarToggle.first().click();
          await page.waitForTimeout(500);
          
          // Check sidebar state changed
          const navigationMenu = page.locator('.navigation-menu');
          await expect(navigationMenu.first()).toBeVisible();
        }
      });

      test('should display responsive top navigation bar correctly', async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Check top navigation elements
        const topNavSelectors = [
          '.top-nav', '[data-testid="top-nav"]', '.header', '[data-testid="header"]',
          '.navbar', '[data-testid="navbar"]', 'nav', 'header', '.navigation-menu'
        ];

        let topNav = null;
        for (const selector of topNavSelectors) {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            topNav = element.first();
            break;
          }
        }

        if (topNav) {
          await expect(topNav).toBeVisible();
          
          // Check top nav positioning
          const topNavBox = await topNav.boundingBox();
          expect(topNavBox).toBeTruthy();
          
          if (topNavBox) {
            // Top nav should span full width
            expect(topNavBox.width).toBeCloseTo(viewport.width, -1);
            
            // Check top nav elements have proper spacing
            const navElements = topNav.locator('a, button, .nav-item, [data-testid="nav-item"]');
            const elementCount = await navElements.count();
            
            if (elementCount > 0) {
              for (let i = 0; i < Math.min(elementCount, 3); i++) {
                const element = navElements.nth(i);
                await expect(element).toBeVisible();
                
                // Check element spacing
                const styles = await element.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    padding: computed.padding,
                    margin: computed.margin,
                    height: computed.height
                  };
                });
                
                expect(styles.padding).not.toBe('0px');
                expect(parseInt(styles.height)).toBeGreaterThan(20);
              }
            }
          }
        }

        // Check user menu/avatar if present
        const userMenuSelectors = [
          '.user-menu', '[data-testid="user-menu"]', '.avatar', '[data-testid="avatar"]',
          '.profile-menu', '[data-testid="profile-menu"]'
        ];

        for (const selector of userMenuSelectors) {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            await expect(element.first()).toBeVisible();
            
            // Check user menu is properly positioned
            const menuBox = await element.first().boundingBox();
            if (menuBox) {
              // Should be in top-right area
              expect(menuBox.x + menuBox.width).toBeGreaterThan(viewport.width * 0.7);
            }
            break;
          }
        }
      });

      test('should have proper spacing in tables and forms', async ({ page }) => {
        await page.goto('/users');
        await page.waitForLoadState('networkidle');

        // Check table spacing
        const tableSelectors = [
          'table', '.table', '[data-testid="table"]', '.users-table', '[data-testid="users-table"]'
        ];

        for (const selector of tableSelectors) {
          const table = page.locator(selector);
          if (await table.count() > 0) {
            await expect(table.first()).toBeVisible();
            
            // Check table cells have proper padding
            const cells = table.first().locator('td, th');
            const cellCount = await cells.count();
            
            if (cellCount > 0) {
              for (let i = 0; i < Math.min(cellCount, 5); i++) {
                const cell = cells.nth(i);
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
            break;
          }
        }

        // Check form spacing
        await page.goto('/account-preferences');
        await page.waitForLoadState('networkidle');

        const formSelectors = [
          'form', '.form', '[data-testid="form"]', '.profile-form', '[data-testid="profile-form"]'
        ];

        for (const selector of formSelectors) {
          const form = page.locator(selector);
          if (await form.count() > 0) {
            await expect(form.first()).toBeVisible();
            
            // Check form fields have proper spacing
            const fields = form.first().locator('input, select, textarea, label');
            const fieldCount = await fields.count();
            
            if (fieldCount > 0) {
              for (let i = 0; i < Math.min(fieldCount, 5); i++) {
                const field = fields.nth(i);
                const styles = await field.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    margin: computed.margin,
                    padding: computed.padding
                  };
                });
                
                // Verify fields have some spacing
                expect(styles.margin).not.toBe('0px');
              }
            }
            break;
          }
        }
      });

      test('should handle mobile navigation properly', async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Test navigation between pages on mobile
        const navigationTests = [
          { from: '/main', to: '/users', label: 'Users' },
          { from: '/users', to: '/rooms', label: 'Rooms' },
          { from: '/rooms', to: '/payments', label: 'Payments' },
          { from: '/payments', to: '/messages', label: 'Messages' }
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
            const pageContent = page.locator('h1, h2, .main-content, [data-testid="page-content"], .grid, .table');
            await expect(pageContent.first()).toBeVisible();
          }
        }
      });

      test('should maintain proper spacing during interactions', async ({ page }) => {
        await page.goto('/account-preferences');
        await page.waitForLoadState('networkidle');

        // Test form interactions maintain spacing
        const inputFields = page.locator('input[type="text"], input[type="email"], input[type="password"]');
        const fieldCount = await inputFields.count();
        
        if (fieldCount > 0) {
          const firstField = inputFields.first();
          
          // Get initial spacing
          const initialStyles = await firstField.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              padding: computed.padding,
              margin: computed.margin,
              border: computed.border
            };
          });
          
          // Focus the field
          await firstField.focus();
          await page.waitForTimeout(500);
          
          // Check spacing is maintained during focus
          const focusStyles = await firstField.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              padding: computed.padding,
              margin: computed.margin
            };
          });
          
          expect(focusStyles.padding).toBe(initialStyles.padding);
          expect(focusStyles.margin).toBe(initialStyles.margin);
          
          // Type in the field
          await firstField.fill('test input');
          await page.waitForTimeout(500);
          
          // Check spacing is maintained after input
          const inputStyles = await firstField.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              padding: computed.padding,
              margin: computed.margin
            };
          });
          
          expect(inputStyles.padding).toBe(initialStyles.padding);
          expect(inputStyles.margin).toBe(initialStyles.margin);
        }
      });
    });
  }
}); 