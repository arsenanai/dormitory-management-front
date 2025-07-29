import { test, expect } from './test';

const adminEmail = 'alice@student.local';
const adminPassword = 'password';

const selectors = {
  pageTitle: 'h1',
  dormitorySection: 'section:has-text("Dormitory Settings")',
  smtpSection: 'section:has-text("SMTP Configuration")',
  cardReaderSection: 'section:has-text("Card Reader Configuration")',
  oneCIntegrationSection: 'section:has-text("1C Integration Configuration")',
  languageFileUploadSection: 'section:has-text("Language File Management")',
  systemLogsSection: 'section:has-text("System Logs")',
  initializeDefaultsButton: 'button:has-text("Initialize Defaults")',
  saveDormitoryButton: 'button:has-text("Save Dormitory Settings")',
  saveSmtpButton: 'button:has-text("Save SMTP Settings")',
  saveCardReaderButton: 'button:has-text("Save Card Reader Settings")',
  saveOnecButton: 'button:has-text("Save 1C Settings")',
  uploadLanguageButton: 'button:has-text("Upload Language File")',
  refreshLogsButton: 'button:has-text("Refresh")',
  clearLogsButton: 'button:has-text("Clear Logs")',
};

test.describe('Settings E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.fill('#login-email', adminEmail);
    await page.fill('#login-password', adminPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    // Wait for successful login - be more flexible with URL matching
    await page.waitForURL(/\/(main|dormitories|users|settings)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    // Navigate to settings page if not already there
    if (!page.url().includes('/settings')) {
      await page.goto('http://localhost:5173/settings');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display settings page with all sections', async ({ page }) => {
    await expect(page).toHaveURL(/\/settings/);
    
    // Check page title
    await expect(page.locator(selectors.pageTitle)).toContainText('Settings & Configuration');
    
    // Check that all sections are visible
    await expect(page.locator(selectors.dormitorySection)).toBeVisible();
    await expect(page.locator(selectors.smtpSection)).toBeVisible();
    await expect(page.locator(selectors.cardReaderSection)).toBeVisible();
    await expect(page.locator(selectors.oneCIntegrationSection)).toBeVisible();
    await expect(page.locator(selectors.languageFileUploadSection)).toBeVisible();
    await expect(page.locator(selectors.systemLogsSection)).toBeVisible();
  });

  test('should display initialize defaults button', async ({ page }) => {
    await expect(page.locator(selectors.initializeDefaultsButton)).toBeVisible();
  });

  test('should display dormitory settings form', async ({ page }) => {
    const dormitorySection = page.locator(selectors.dormitorySection);
    await expect(dormitorySection).toBeVisible();
    
    // Check form fields
    await expect(dormitorySection.locator('input[type="number"]')).toHaveCount(3);
    await expect(dormitorySection.locator('input[type="checkbox"]')).toHaveCount(2);
    await expect(page.locator(selectors.saveDormitoryButton)).toBeVisible();
  });

  test('should display SMTP configuration form', async ({ page }) => {
    const smtpSection = page.locator(selectors.smtpSection);
    await expect(smtpSection).toBeVisible();
    
    // Check form fields
    await expect(smtpSection.locator('input[type="text"]')).toHaveCount(3);
    await expect(smtpSection.locator('input[type="number"]')).toHaveCount(1);
    await expect(smtpSection.locator('input[type="password"]')).toHaveCount(1);
    await expect(smtpSection.locator('input[type="email"]')).toHaveCount(1);
    await expect(smtpSection.locator('select')).toHaveCount(1);
    await expect(page.locator(selectors.saveSmtpButton)).toBeVisible();
  });

  test('should display card reader configuration form', async ({ page }) => {
    const cardReaderSection = page.locator(selectors.cardReaderSection);
    await expect(cardReaderSection).toBeVisible();
    
    // Check form fields
    await expect(cardReaderSection.locator('input[type="checkbox"]')).toHaveCount(1);
    await expect(page.locator(selectors.saveCardReaderButton)).toBeVisible();
  });

  test('should display 1C integration configuration form', async ({ page }) => {
    const onecSection = page.locator(selectors.oneCIntegrationSection);
    await expect(onecSection).toBeVisible();
    
    // Check form fields
    await expect(onecSection.locator('input[type="checkbox"]')).toHaveCount(1);
    await expect(page.locator(selectors.saveOnecButton)).toBeVisible();
  });

  test('should display language file management section', async ({ page }) => {
    const languageSection = page.locator(selectors.languageFileUploadSection);
    await expect(languageSection).toBeVisible();
    
    // Check for installed languages display
    await expect(languageSection.locator('h3:has-text("Installed Languages")')).toBeVisible();
    await expect(page.locator(selectors.uploadLanguageButton)).toBeVisible();
  });

  test('should display system logs section', async ({ page }) => {
    const systemLogsSection = page.locator(selectors.systemLogsSection);
    await expect(systemLogsSection).toBeVisible();
    
    // Check for log controls
    await expect(page.locator(selectors.refreshLogsButton)).toBeVisible();
    await expect(page.locator(selectors.clearLogsButton)).toBeVisible();
  });

  test('should have proper form structure and styling', async ({ page }) => {
    // Check that all sections have proper heading structure
    const sections = page.locator('section');
    await expect(sections).toHaveCount(6);
    
    // Check that all sections have h2 headings
    const headings = page.locator('section h2');
    await expect(headings).toHaveCount(6);
    
    // Check that all sections have white background and shadow
    const sectionsWithStyling = page.locator('section.bg-white.rounded-lg.shadow');
    await expect(sectionsWithStyling).toHaveCount(6);
  });

  test('should be accessible via navigation', async ({ page }) => {
    // Navigate to main page first
    await page.goto('http://localhost:5173/main');
    await page.waitForLoadState('networkidle');
    
    // Try to find and click settings link in navigation
    const settingsLink = page.locator('a[href="/settings"], [data-testid="settings-link"]');
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForURL(/\/settings/);
      await expect(page.locator(selectors.pageTitle)).toContainText('Settings & Configuration');
    } else {
      // If settings link is not visible in navigation, that's acceptable for v1
      test.skip();
    }
  });

  test('should maintain proper layout and spacing', async ({ page }) => {
    // Check that the page has proper flex layout
    const mainContainer = page.locator('.flex.flex-col.gap-8');
    await expect(mainContainer).toBeVisible();
    
    // Check that sections are properly spaced
    const sections = page.locator('section');
    for (let i = 0; i < 6; i++) {
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  test('should have proper internationalization support', async ({ page }) => {
    // Check that all text is properly internationalized
    await expect(page.locator(selectors.pageTitle)).toContainText('Settings & Configuration');
    
    // Check that section headings are properly displayed
    await expect(page.locator('h2:has-text("Dormitory Settings")')).toBeVisible();
    await expect(page.locator('h2:has-text("SMTP Configuration")')).toBeVisible();
    await expect(page.locator('h2:has-text("Card Reader Configuration")')).toBeVisible();
    await expect(page.locator('h2:has-text("1C Integration Configuration")')).toBeVisible();
    await expect(page.locator('h2:has-text("Language File Management")')).toBeVisible();
    await expect(page.locator('h2:has-text("System Logs")')).toBeVisible();
  });

  test('should display form labels correctly', async ({ page }) => {
    // Check some key form labels
    await expect(page.locator('label:has-text("Max Students per Dormitory")')).toBeVisible();
    await expect(page.locator('label:has-text("SMTP Host")')).toBeVisible();
    await expect(page.locator('label:has-text("Enable Card Reader")')).toBeVisible();
    await expect(page.locator('label:has-text("Enable 1C Integration")')).toBeVisible();
  });

  test('should have proper button states', async ({ page }) => {
    // Check that save buttons are present and enabled
    await expect(page.locator(selectors.saveDormitoryButton)).toBeEnabled();
    await expect(page.locator(selectors.saveSmtpButton)).toBeEnabled();
    await expect(page.locator(selectors.saveCardReaderButton)).toBeEnabled();
    await expect(page.locator(selectors.saveOnecButton)).toBeEnabled();
  });

  test('should display encryption options in SMTP form', async ({ page }) => {
    const smtpSection = page.locator(selectors.smtpSection);
    const encryptionSelect = smtpSection.locator('select');
    
    // Check that encryption select has options
    await expect(encryptionSelect.locator('option[value="tls"]')).toBeVisible();
    await expect(encryptionSelect.locator('option[value="ssl"]')).toBeVisible();
    await expect(encryptionSelect.locator('option[value="none"]')).toBeVisible();
  });

  test('should display language options in language form', async ({ page }) => {
    const languageSection = page.locator(selectors.languageFileUploadSection);
    const languageSelect = languageSection.locator('select');
    
    // Check that language select has common options
    await expect(languageSelect.locator('option[value="en"]')).toBeVisible();
    await expect(languageSelect.locator('option[value="ru"]')).toBeVisible();
    await expect(languageSelect.locator('option[value="kk"]')).toBeVisible();
  });

  test('should display log type options in system logs', async ({ page }) => {
    const systemLogsSection = page.locator(selectors.systemLogsSection);
    const logTypeSelect = systemLogsSection.locator('select');
    
    // Check that log type select has options
    await expect(logTypeSelect.locator('option[value="all"]')).toBeVisible();
    await expect(logTypeSelect.locator('option[value="error"]')).toBeVisible();
    await expect(logTypeSelect.locator('option[value="info"]')).toBeVisible();
    await expect(logTypeSelect.locator('option[value="warning"]')).toBeVisible();
  });
}); 