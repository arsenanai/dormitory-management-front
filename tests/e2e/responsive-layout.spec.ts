import { test, expect } from './test';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const pagesToTest = [
  { path: '/main', label: 'Dashboard' },
  { path: '/users', label: 'Users' },
  { path: '/rooms', label: 'Rooms' },
  { path: '/payments', label: 'Payments' },
  { path: '/messages', label: 'Messages' },
  { path: '/dormitories', label: 'Dormitories' },
];

test.describe('Responsive Layouts E2E', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('http://localhost:5173/');
        await page.fill('#login-email', process.env.ADMIN_EMAIL!);
        await page.fill('#login-password', process.env.ADMIN_PASSWORD!);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL(/main/, { timeout: 15000 });
      });

      for (const pageInfo of pagesToTest) {
        test(`should render ${pageInfo.label} correctly`, async ({ page }) => {
          await page.goto(`http://localhost:5173${pageInfo.path}`);
          // Check for main heading or key element
          await expect(page.locator('h1, h2, .main-content, .dashboard')).toBeVisible({ timeout: 10000 });
          // Optionally, take a screenshot for visual regression
          // await page.screenshot({ path: `screenshots/${pageInfo.label}-${viewport.name}.png` });
        });
      }
    });
  }
}); 