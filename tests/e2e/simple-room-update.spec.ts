import { test, expect } from '@playwright/test';

test.describe('Simple Room Update', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Starting test setup...');
    // Login as admin
    await page.goto('/');
    console.log('Navigated to login page');
    await page.waitForLoadState('networkidle');
    await page.fill('#login-email', 'admin@email.com');
    await page.fill('#login-password', 'supersecret');
    await page.click('button[type="submit"]:has-text("Login")');
    console.log('Clicked login button');
    await page.waitForURL('**/main');
    console.log('Login successful, on main page');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle bed reservations randomly and verify persistence', async ({ page }) => {
    console.log('Starting bed reservation test...');
    
    // Navigate to room 70 edit form
    await page.goto('/room-form/70');
    console.log('Navigated to room form 70');
    await page.waitForLoadState('networkidle');
    
    // Wait for form to load and beds to appear
    console.log('Waiting for form elements...');
    await page.waitForSelector('#room-notes', { timeout: 30000 });
    console.log('Room notes field found');
    
    // Wait for beds to load - check if they exist
    try {
      await page.waitForSelector('[data-testid^="bed-"]', { timeout: 30000 });
      console.log('Bed elements found');
    } catch (error) {
      console.log('Beds not found, checking page content...');
      const pageContent = await page.content();
      console.log('Page contains beds:', pageContent.includes('bed-'));
      throw error;
    }
    
    // Get all bed checkboxes and record their initial states
    const bedCheckboxes = page.locator('[data-testid^="bed-"] input[type="checkbox"]');
    const bedCount = await bedCheckboxes.count();
    console.log(`Found ${bedCount} beds`);
    
    if (bedCount === 0) {
      throw new Error('No beds found on the page');
    }
    
    // Record initial states
    const initialStates = [];
    for (let i = 0; i < bedCount; i++) {
      const isChecked = await bedCheckboxes.nth(i).isChecked();
      initialStates.push(isChecked);
      console.log(`Bed ${i + 1} initial state: ${isChecked ? 'checked' : 'unchecked'}`);
    }
    
    // Randomly toggle some beds (uncheck checked ones, check unchecked ones)
    const bedsToToggle = [];
    for (let i = 0; i < bedCount; i++) {
      const currentState = await bedCheckboxes.nth(i).isChecked();
      // Toggle every other bed for testing
      if (i % 2 === 0) {
        if (currentState) {
          // Uncheck this bed
          console.log(`Unchecking bed ${i + 1}`);
          await bedCheckboxes.nth(i).uncheck();
          bedsToToggle.push({ bedNumber: i + 1, action: 'unchecked', wasChecked: true });
        } else {
          // Check this bed
          console.log(`Checking bed ${i + 1}`);
          await bedCheckboxes.nth(i).check();
          bedsToToggle.push({ bedNumber: i + 1, action: 'checked', wasChecked: false });
        }
      }
    }
    
    console.log('Beds toggled:', bedsToToggle);
    
    // Change the notes field as well
    const notesField = page.locator('#room-notes');
    await notesField.fill('Test notes updated by E2E test');
    console.log('Updated notes field');
    
    // Submit the form
    console.log('Submitting form...');
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Wait for success message or redirect
    try {
      await page.waitForSelector('.text-green-600', { timeout: 10000 });
      console.log('Success message found');
    } catch (error) {
      console.log('No success message, but checking if redirected...');
    }
    
    // Wait for redirect to rooms page
    await page.waitForURL('**/rooms', { timeout: 30000 });
    console.log('Redirected to rooms page');
    
    // Navigate back to room 70 to verify changes persisted
    await page.goto('/room-form/70');
    console.log('Navigated back to room form 70');
    await page.waitForLoadState('networkidle');
    
    // Wait for form to load and beds to appear
    await page.waitForSelector('#room-notes', { timeout: 30000 });
    await page.waitForSelector('[data-testid^="bed-"]', { timeout: 30000 });
    console.log('Form reloaded successfully');
    
    // Verify notes field still has the updated value
    const notesFieldAfterRefresh = page.locator('#room-notes');
    await expect(notesFieldAfterRefresh).toHaveValue('Test notes updated by E2E test');
    console.log('Notes field persisted correctly');
    
    // Verify bed reservation changes persisted
    const bedCheckboxesAfterRefresh = page.locator('[data-testid^="bed-"] input[type="checkbox"]');
    for (const toggleInfo of bedsToToggle) {
      const bedIndex = toggleInfo.bedNumber - 1;
      const currentState = await bedCheckboxesAfterRefresh.nth(bedIndex).isChecked();
      const expectedState = toggleInfo.action === 'checked';
      
      console.log(`Bed ${toggleInfo.bedNumber} after refresh: ${currentState ? 'checked' : 'unchecked'} (expected: ${expectedState ? 'checked' : 'unchecked'})`);
      
      if (toggleInfo.action === 'checked') {
        await expect(bedCheckboxesAfterRefresh.nth(bedIndex)).toBeChecked();
      } else {
        await expect(bedCheckboxesAfterRefresh.nth(bedIndex)).not.toBeChecked();
      }
    }
    
    console.log('All bed reservation changes persisted successfully!');
  });
});
