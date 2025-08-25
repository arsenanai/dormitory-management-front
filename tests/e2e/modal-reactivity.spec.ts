import { test, expect } from './test';

test.describe('Minimal Modal Reactivity', () => {
  test('should open and close the modal and update showForm', async ({ page }) => {
    await page.goto('http://localhost:3000/modal-test');
    // Modal should not be visible initially
    await expect(page.locator('[data-testid="test-modal"]')).not.toBeVisible();
    // showForm should be false
    const debugBefore = await page.textContent('#debug-showform');
    expect(debugBefore).toContain('false');
    // Open modal
    await page.click('[data-testid="open-modal"]');
    await expect(page.locator('[data-testid="test-modal"]')).toBeVisible();
    // showForm should be true
    const debugAfterOpen = await page.textContent('#debug-showform');
    expect(debugAfterOpen).toContain('true');
    // Close modal
    await page.click('[data-testid="close-modal"]');
    await expect(page.locator('[data-testid="test-modal"]')).not.toBeVisible();
    // showForm should be false again
    const debugAfterClose = await page.textContent('#debug-showform');
    expect(debugAfterClose).toContain('false');
  });
}); 