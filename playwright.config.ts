import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';

// Load .env.testing if it exists, otherwise use default values
if (existsSync('.env.testing')) {
  dotenvConfig({ path: '.env.testing' });
} else {
  // Set default test environment variables
  process.env.VITE_API_BASE_URL = 'http://localhost:8000/api';
  process.env.VITE_APP_NAME = 'SDU Dormitory Test';
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_PASSWORD = 'password';
  process.env.STUDENT_EMAIL = 'student@example.com';
  process.env.STUDENT_PASSWORD = 'password';
  process.env.SUPERADMIN_EMAIL = 'superadmin@example.com';
  process.env.SUPERADMIN_PASSWORD = 'password';
  process.env.VITE_TEST_MODE = 'true';
  process.env.VITE_MOCK_EXTERNAL_SERVICES = 'true';
  process.env.VITE_DEFAULT_LOCALE = 'en';
  process.env.VITE_FALLBACK_LOCALE = 'en';
}
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Increase default timeouts */
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro 11 landscape'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
