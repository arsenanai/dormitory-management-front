import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';

// Load .env.testing if it exists, otherwise use default values
if (existsSync('.env.testing')) {
  dotenvConfig({ path: '.env.testing' });
} else {
  // Set default test environment variables
  process.env.VITE_API_BASE_URL = '/api';
  process.env.APP_NAME = 'SDU Dormitory Test';
  process.env.ADMIN_EMAIL = 'admin@email.com';
  process.env.ADMIN_PASSWORD = 'supersecret';
  process.env.STUDENT_EMAIL = 'student@email.com';
  process.env.STUDENT_PASSWORD = 'supersecret';
  process.env.SUPERADMIN_EMAIL = 'sudo@email.com';
  process.env.SUPERADMIN_PASSWORD = 'supersecret';
  process.env.VITE_TEST_MODE = 'true';
  process.env.VITE_MOCK_EXTERNAL_SERVICES = 'false';
  process.env.VITE_DEFAULT_LOCALE = 'en';
  process.env.VITE_FALLBACK_LOCALE = 'en';
}
import { defineConfig, devices } from '@playwright/test';

// Check if --headed flag is passed
const isHeaded = process.argv.includes('--headed');
const isDebug = process.argv.includes('--debug') || process.env.PWDEBUG;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel for debugging
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Exit on first failure */
  maxFailures: process.env.CI ? 0 : 1,
  /* Run with single worker for debugging */
  workers: isDebug ? 1 : (process.env.CI ? 1 : 4),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: isDebug ? 'on' : 'on-first-retry',
    
    /* Increase default timeouts */
    actionTimeout: 30000,
    navigationTimeout: 60000,
    
    /* Run headlessly by default, but allow override with --headed */
    headless: !isHeaded && !isDebug,
    
    /* Add video recording for debugging */
    video: isDebug ? 'on-first-retry' : 'off',
    
    /* Add screenshots on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: { 
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-gpu',
            '--disable-software-rasterizer'
          ],
          headless: !isHeaded && !isDebug
        }
      },
    },
  ],
});
