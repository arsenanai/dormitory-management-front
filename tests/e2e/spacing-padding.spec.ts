import { test, expect } from './test';
import { TestUtils, SELECTORS } from './test-utils';

// Mobile viewport configurations
const mobileViewports = [
  { name: 'mobile-chrome', width: 393, height: 851 }, // Pixel 5
  { name: 'mobile-safari', width: 390, height: 844 }, // iPhone 12
  { name: 'tablet', width: 1194, height: 834 }, // iPad Pro 11 landscape
];

// CSS properties to check for spacing
const spacingProperties = [
  'padding', 'margin', 'gap', 'row-gap', 'column-gap',
  'border-spacing', 'letter-spacing', 'word-spacing'
];

// Minimum spacing values for different element types
const minSpacingValues = {
  'input': { padding: 8, height: 20 },
  'button': { padding: 8, height: 20 },
  'select': { padding: 8, height: 20 },
  'textarea': { padding: 8, height: 20 },
  'table-cell': { padding: 8 },
  'nav-item': { padding: 8, height: 20 },
  'sidebar-item': { padding: 8, height: 30 },
  'form-section': { margin: 16, padding: 8 },
  'card': { padding: 16, margin: 8 },
  'modal': { padding: 16 }
};

test.describe('Spacing and Padding E2E Tests', () => {
  for (const viewport of mobileViewports) {
    test.describe(`${viewport.name} viewport`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await TestUtils.login(page, 'admin');
        await page.waitForLoadState('networkidle');
      });

      test('should have proper spacing in navigation elements', async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Check sidebar spacing
        const sidebar = page.locator(SELECTORS.sidebar);
        if (await sidebar.count() > 0) {
          await expect(sidebar.first()).toBeVisible();
          
          // Check sidebar container spacing
          const sidebarStyles = await sidebar.first().evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              padding: computed.padding,
              margin: computed.margin,
              gap: computed.gap
            };
          });
          
          expect(sidebarStyles.padding).not.toBe('0px');
          
          // Check sidebar navigation items
          const sidebarItems = sidebar.first().locator('a, button, .nav-item, [data-testid="nav-item"]');
          const itemCount = await sidebarItems.count();
          
          if (itemCount > 0) {
            for (let i = 0; i < Math.min(itemCount, 5); i++) {
              const item = sidebarItems.nth(i);
              const styles = await item.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  padding: computed.padding,
                  margin: computed.margin,
                  height: computed.height,
                  gap: computed.gap
                };
              });
              
              // Verify minimum spacing
              const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
              const minPadding = Math.min(...paddingValues);
              expect(minPadding).toBeGreaterThanOrEqual(minSpacingValues['sidebar-item'].padding);
              expect(parseInt(styles.height)).toBeGreaterThanOrEqual(minSpacingValues['sidebar-item'].height);
            }
          }
        }

        // Check top navigation spacing
        const topNavSelectors = [
          '.top-nav', '[data-testid="top-nav"]', '.header', '[data-testid="header"]',
          '.navbar', '[data-testid="navbar"]', 'nav', 'header'
        ];

        for (const selector of topNavSelectors) {
          const topNav = page.locator(selector);
          if (await topNav.count() > 0) {
            await expect(topNav.first()).toBeVisible();
            
            // Check top nav container spacing
            const navStyles = await topNav.first().evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                padding: computed.padding,
                margin: computed.margin,
                gap: computed.gap
              };
            });
            
            expect(navStyles.padding).not.toBe('0px');
            
            // Check top nav items
            const navItems = topNav.first().locator('a, button, .nav-item, [data-testid="nav-item"]');
            const navItemCount = await navItems.count();
            
            if (navItemCount > 0) {
              for (let i = 0; i < Math.min(navItemCount, 3); i++) {
                const item = navItems.nth(i);
                const styles = await item.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    padding: computed.padding,
                    margin: computed.margin,
                    height: computed.height
                  };
                });
                
                const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
                const minPadding = Math.min(...paddingValues);
                expect(minPadding).toBeGreaterThanOrEqual(minSpacingValues['nav-item'].padding);
                expect(parseInt(styles.height)).toBeGreaterThanOrEqual(minSpacingValues['nav-item'].height);
              }
            }
            break;
          }
        }
      });

      test('should have proper spacing in form elements', async ({ page }) => {
        await page.goto('/account-preferences');
        await page.waitForLoadState('networkidle');

        // Check form container spacing
        const formSelectors = [
          'form', '.form', '[data-testid="form"]', '.profile-form', '[data-testid="profile-form"]'
        ];

        for (const selector of formSelectors) {
          const form = page.locator(selector);
          if (await form.count() > 0) {
            await expect(form.first()).toBeVisible();
            
            // Check form container spacing
            const formStyles = await form.first().evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                padding: computed.padding,
                margin: computed.margin,
                gap: computed.gap
              };
            });
            
            expect(formStyles.padding).not.toBe('0px');
            
            // Check form sections
            const sections = form.first().locator('section, .form-section, [data-testid="form-section"]');
            const sectionCount = await sections.count();
            
            if (sectionCount > 0) {
              for (let i = 0; i < Math.min(sectionCount, 3); i++) {
                const section = sections.nth(i);
                const styles = await section.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    padding: computed.padding,
                    margin: computed.margin,
                    marginBottom: computed.marginBottom
                  };
                });
                
                const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
                const minPadding = Math.min(...paddingValues);
                expect(minPadding).toBeGreaterThanOrEqual(minSpacingValues['form-section'].padding);
                
                if (i < sectionCount - 1) {
                  // Check spacing between sections
                  const marginValues = styles.marginBottom.split(' ').map(v => parseInt(v));
                  const minMargin = Math.min(...marginValues);
                  expect(minMargin).toBeGreaterThanOrEqual(minSpacingValues['form-section'].margin);
                }
              }
            }
            
            // Check form fields
            const fieldTypes = [
              { selector: 'input[type="text"]', type: 'input' },
              { selector: 'input[type="email"]', type: 'input' },
              { selector: 'input[type="password"]', type: 'input' },
              { selector: 'select', type: 'select' },
              { selector: 'textarea', type: 'textarea' },
              { selector: 'button[type="submit"]', type: 'button' }
            ];

            for (const fieldType of fieldTypes) {
              const fields = form.first().locator(fieldType.selector);
              const fieldCount = await fields.count();
              
              if (fieldCount > 0) {
                for (let i = 0; i < Math.min(fieldCount, 3); i++) {
                  const field = fields.nth(i);
                  const styles = await field.evaluate((el) => {
                    const computed = window.getComputedStyle(el);
                    return {
                      padding: computed.padding,
                      margin: computed.margin,
                      height: computed.height,
                      width: computed.width
                    };
                  });
                  
                  const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
                  const minPadding = Math.min(...paddingValues);
                  expect(minPadding).toBeGreaterThanOrEqual(minSpacingValues[fieldType.type].padding);
                  expect(parseInt(styles.height)).toBeGreaterThanOrEqual(minSpacingValues[fieldType.type].height);
                }
              }
            }
            break;
          }
        }
      });

      test('should have proper spacing in tables', async ({ page }) => {
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
            
            // Check table container spacing
            const tableStyles = await table.first().evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                padding: computed.padding,
                margin: computed.margin,
                borderSpacing: computed.borderSpacing
              };
            });
            
            expect(tableStyles.padding).not.toBe('0px');
            
            // Check table cells
            const cells = table.first().locator('td, th');
            const cellCount = await cells.count();
            
            if (cellCount > 0) {
              for (let i = 0; i < Math.min(cellCount, 10); i++) {
                const cell = cells.nth(i);
                const styles = await cell.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    padding: computed.padding,
                    margin: computed.margin,
                    borderSpacing: computed.borderSpacing
                  };
                });
                
                const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
                const minPadding = Math.min(...paddingValues);
                expect(minPadding).toBeGreaterThanOrEqual(minSpacingValues['table-cell'].padding);
              }
            }
            break;
          }
        }
      });

      test('should have proper spacing in cards and containers', async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Check card spacing
        const cardSelectors = [
          '.card', '[data-testid="card"]', '.dashboard-card', '[data-testid="dashboard-card"]',
          '.stats-card', '[data-testid="stats-card"]', '.info-card', '[data-testid="info-card"]'
        ];

        for (const selector of cardSelectors) {
          const cards = page.locator(selector);
          const cardCount = await cards.count();
          
          if (cardCount > 0) {
            for (let i = 0; i < Math.min(cardCount, 5); i++) {
              const card = cards.nth(i);
              await expect(card).toBeVisible();
              
              const styles = await card.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  padding: computed.padding,
                  margin: computed.margin,
                  borderRadius: computed.borderRadius
                };
              });
              
              const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
              const minPadding = Math.min(...paddingValues);
              expect(minPadding).toBeGreaterThanOrEqual(minSpacingValues['card'].padding);
              
              const marginValues = styles.margin.split(' ').map(v => parseInt(v));
              const minMargin = Math.min(...marginValues);
              expect(minMargin).toBeGreaterThanOrEqual(minSpacingValues['card'].margin);
            }
          }
        }

        // Check container spacing
        const containerSelectors = [
          '.container', '[data-testid="container"]', '.main-content', '[data-testid="main-content"]',
          '.page-content', '[data-testid="page-content"]', '.content-wrapper'
        ];

        for (const selector of containerSelectors) {
          const containers = page.locator(selector);
          const containerCount = await containers.count();
          
          if (containerCount > 0) {
            for (let i = 0; i < Math.min(containerCount, 3); i++) {
              const container = containers.nth(i);
              await expect(container).toBeVisible();
              
              const styles = await container.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  padding: computed.padding,
                  margin: computed.margin,
                  maxWidth: computed.maxWidth
                };
              });
              
              expect(styles.padding).not.toBe('0px');
              
              // Check container doesn't overflow viewport
              const containerBox = await container.boundingBox();
              if (containerBox) {
                expect(containerBox.width).toBeLessThanOrEqual(viewport.width);
              }
            }
          }
        }
      });

      test('should have proper spacing in modals and overlays', async ({ page }) => {
        await page.goto('/users');
        await page.waitForLoadState('networkidle');

        // Try to open a modal (add user button)
        const addButton = page.locator(SELECTORS.addButton);
        if (await addButton.count() > 0) {
          await addButton.first().click();
          await page.waitForTimeout(1000);
          
          // Check modal spacing
          const modalSelectors = [
            '.modal', '[data-testid="modal"]', '.dialog', '[data-testid="dialog"]',
            '.overlay', '[data-testid="overlay"]', '.popup', '[data-testid="popup"]'
          ];

          for (const selector of modalSelectors) {
            const modal = page.locator(selector);
            if (await modal.count() > 0) {
              await expect(modal.first()).toBeVisible();
              
              const styles = await modal.first().evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  padding: computed.padding,
                  margin: computed.margin,
                  borderRadius: computed.borderRadius,
                  maxWidth: computed.maxWidth
                };
              });
              
              const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
              const minPadding = Math.min(...paddingValues);
              expect(minPadding).toBeGreaterThanOrEqual(minSpacingValues['modal'].padding);
              
              // Check modal content doesn't overflow viewport
              const modalBox = await modal.first().boundingBox();
              if (modalBox) {
                expect(modalBox.width).toBeLessThanOrEqual(viewport.width - 20); // Allow for margins
                expect(modalBox.height).toBeLessThanOrEqual(viewport.height - 20);
              }
              
              // Close modal
              const closeButton = modal.first().locator('button:has-text("Close"), button:has-text("Cancel"), [data-testid="modal-close"]');
              if (await closeButton.count() > 0) {
                await closeButton.first().click();
                await page.waitForTimeout(500);
              }
              break;
            }
          }
        }
      });

      test('should maintain consistent spacing across different pages', async ({ page }) => {
        const pagesToTest = [
          { path: '/main', name: 'Dashboard' },
          { path: '/users', name: 'Users' },
          { path: '/rooms', name: 'Rooms' },
          { path: '/payments', name: 'Payments' },
          { path: '/messages', name: 'Messages' }
        ];

        const spacingData = [];

        for (const pageInfo of pagesToTest) {
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');

          // Check common elements spacing
          const commonElements = [
            { selector: 'h1', type: 'heading' },
            { selector: 'h2', type: 'heading' },
            { selector: 'input', type: 'input' },
            { selector: 'button', type: 'button' },
            { selector: 'table', type: 'table' }
          ];

          for (const elementInfo of commonElements) {
            const elements = page.locator(elementInfo.selector);
            const elementCount = await elements.count();
            
            if (elementCount > 0) {
              const element = elements.first();
              const styles = await element.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  padding: computed.padding,
                  margin: computed.margin,
                  height: computed.height
                };
              });
              
              spacingData.push({
                page: pageInfo.name,
                element: elementInfo.type,
                padding: styles.padding,
                margin: styles.margin,
                height: styles.height
              });
            }
          }
        }

        // Verify consistent spacing across pages
        const elementTypes = [...new Set(spacingData.map(item => item.element))];
        
        for (const elementType of elementTypes) {
          const elementData = spacingData.filter(item => item.element === elementType);
          if (elementData.length > 1) {
            // Check that spacing is consistent (within reasonable tolerance)
            const paddings = elementData.map(item => item.padding);
            const margins = elementData.map(item => item.margin);
            
            // All elements of the same type should have similar spacing
            const paddingValues = paddings.map(p => p.split(' ').map(v => parseInt(v)));
            const marginValues = margins.map(m => m.split(' ').map(v => parseInt(v)));
            
            // Check consistency (all values should be similar)
            const paddingConsistent = paddingValues.every((vals, i) => 
              i === 0 || Math.abs(vals[0] - paddingValues[0][0]) <= 2
            );
            const marginConsistent = marginValues.every((vals, i) => 
              i === 0 || Math.abs(vals[0] - marginValues[0][0]) <= 2
            );
            
            expect(paddingConsistent).toBe(true);
            expect(marginConsistent).toBe(true);
          }
        }
      });

      test('should have proper touch target sizes for mobile', async ({ page }) => {
        await page.goto('/main');
        await page.waitForLoadState('networkidle');

        // Check touch targets (buttons, links, interactive elements)
        const touchTargetSelectors = [
          'button', 'a', 'input[type="button"]', 'input[type="submit"]',
          '[role="button"]', '[tabindex]', '.clickable', '[data-testid*="button"]'
        ];

        for (const selector of touchTargetSelectors) {
          const elements = page.locator(selector);
          const elementCount = await elements.count();
          
          if (elementCount > 0) {
            for (let i = 0; i < Math.min(elementCount, 10); i++) {
              const element = elements.nth(i);
              await expect(element).toBeVisible();
              
              const box = await element.boundingBox();
              if (box) {
                // Mobile touch targets should be at least 44x44 pixels
                expect(box.width).toBeGreaterThanOrEqual(44);
                expect(box.height).toBeGreaterThanOrEqual(44);
                
                // Check element has proper padding for touch
                const styles = await element.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    padding: computed.padding,
                    minHeight: computed.minHeight,
                    minWidth: computed.minWidth
                  };
                });
                
                const paddingValues = styles.padding.split(' ').map(v => parseInt(v));
                const minPadding = Math.min(...paddingValues);
                expect(minPadding).toBeGreaterThanOrEqual(8);
              }
            }
          }
        }
      });
    });
  }
}); 