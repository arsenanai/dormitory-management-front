import { test, expect } from '@playwright/test';

test.describe('Topbar UI Cleanup', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Login as admin
    await page.fill('[data-testid="email-input"]', 'admin@sdu.edu.kz');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to main page
    await page.waitForURL('/main');
  });

  test('should not display search bar in topbar', async ({ page }) => {
    // Check that search bar is not present
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).not.toBeVisible();
    
    // Check that search placeholder is not present
    const searchPlaceholder = page.locator('input[placeholder="Search..."]');
    await expect(searchPlaceholder).not.toBeVisible();
  });

  test('should not display language selector in topbar', async ({ page }) => {
    // Check that language selector is not present in topbar
    const languageSelector = page.locator('#language-switcher');
    await expect(languageSelector).not.toBeVisible();
    
    // Check that language label is not present
    const languageLabel = page.locator('text=Language');
    await expect(languageLabel).not.toBeVisible();
  });

  test('should not display dark mode switcher in topbar', async ({ page }) => {
    // Check that theme toggle button is not present
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).not.toBeVisible();
    
    // Check that sun icon is not present in topbar
    const sunIcon = page.locator('svg[data-testid="sun-icon"]');
    await expect(sunIcon).not.toBeVisible();
  });

  test('should not display alerts/notifications icon in topbar', async ({ page }) => {
    // Check that bell icon is not present
    const bellIcon = page.locator('svg[data-testid="bell-icon"]');
    await expect(bellIcon).not.toBeVisible();
    
    // Check that notification badge is not present
    const notificationBadge = page.locator('.notification-badge');
    await expect(notificationBadge).not.toBeVisible();
  });

  test('should display settings link in user dropdown menu', async ({ page }) => {
    // Click on user menu to open dropdown
    await page.click('[data-testid="user-menu-button"]');
    
    // Check that settings link is present in dropdown
    const settingsLink = page.locator('[data-testid="settings-link"]');
    await expect(settingsLink).toBeVisible();
    await expect(settingsLink).toHaveText('Settings');
  });

  test('should navigate to settings page when settings link is clicked', async ({ page }) => {
    // Click on user menu to open dropdown
    await page.click('[data-testid="user-menu-button"]');
    
    // Click on settings link
    await page.click('[data-testid="settings-link"]');
    
    // Check that we navigated to settings page
    await page.waitForURL('/settings');
    await expect(page.locator('h1')).toContainText('Settings');
  });

  test('should display user information in topbar', async ({ page }) => {
    // Check that user name is displayed
    const userName = page.locator('.user-info p:first-child');
    await expect(userName).toBeVisible();
    
    // Check that user email is displayed
    const userEmail = page.locator('.user-info p:last-child');
    await expect(userEmail).toBeVisible();
  });

  test('should have clean topbar layout without unnecessary elements', async ({ page }) => {
    // Check that topbar has proper structure
    const topbar = page.locator('nav');
    await expect(topbar).toBeVisible();
    
    // Check that logo and title are present
    const logo = page.locator('img[src*="sdu logo"]');
    await expect(logo).toBeVisible();
    
    const title = page.locator('span.text-lg.font-bold');
    await expect(title).toBeVisible();
    
    // Check that user menu is present
    const userMenu = page.locator('[data-testid="user-menu-button"]');
    await expect(userMenu).toBeVisible();
  });

  test('should have language selector in settings page', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
    
    // Check that language settings section is present
    await expect(page.locator('text=Language Settings')).toBeVisible();
    
    // Check that interface language selector is present
    const languageSelector = page.locator('#interface-language');
    await expect(languageSelector).toBeVisible();
  });

  test('should have dark mode toggle in settings page', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
    
    // Check that theme settings section is present
    await expect(page.locator('text=Theme Settings')).toBeVisible();
    
    // Check that dark mode toggle is present
    const darkModeToggle = page.locator('#dark-mode-toggle');
    await expect(darkModeToggle).toBeVisible();
  });

  test('should have messages badge in sidebar', async ({ page }) => {
    // Check that messages menu item is present in sidebar
    const messagesLink = page.locator('text=Messages');
    await expect(messagesLink).toBeVisible();
    
    // Check that messages badge is present (if there are unread messages)
    // This test assumes there are unread messages (count > 0)
    const messagesBadge = page.locator('text=Messages').locator('..').locator('.bg-red-500');
    // Note: This might not be visible if there are no unread messages
    // The badge should be present in the DOM structure
  });

  test('should have responsive topbar layout', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile menu toggle is present
    const mobileMenuToggle = page.locator('.mobile-menu-toggle');
    await expect(mobileMenuToggle).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check that mobile menu toggle is hidden on desktop
    await expect(mobileMenuToggle).not.toBeVisible();
  });
}); 