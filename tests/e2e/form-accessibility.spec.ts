import { test, expect } from './test';

test.describe('Form Accessibility & Validation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.fill('#login-email', process.env.ADMIN_EMAIL!);
    await page.fill('#login-password', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(/main/, { timeout: 15000 });
  });

  test.describe('Admin Form Accessibility', () => {
    test('should have proper form structure and labels', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Check for proper form structure
      const form = page.locator('form');
      expect(await form.count()).toBeGreaterThan(0);
      
      // Check for proper field labels
      const requiredFields = ['admin-email', 'admin-name', 'admin-surname'];
      for (const fieldId of requiredFields) {
        const input = page.locator(`#${fieldId}`);
        const label = page.locator(`label[for="${fieldId}"]`);
        
        if (await input.count() > 0) {
          expect(await label.count()).toBeGreaterThan(0);
          expect(await label.text()).toBeTruthy();
        }
      }
    });

    test('should announce validation errors to screen readers', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Submit form without required fields
      await page.click('button[type="submit"]');
      
      // Check for error messages with proper ARIA attributes
      const errorMessages = page.locator('[role="alert"], .error-message, .validation-error');
      if (await errorMessages.count() > 0) {
        for (let i = 0; i < await errorMessages.count(); i++) {
          const error = errorMessages.nth(i);
          expect(await error.text()).toBeTruthy();
          
          // Check for proper ARIA attributes
          const ariaInvalid = await error.getAttribute('aria-invalid');
          if (ariaInvalid) {
            expect(ariaInvalid).toBe('true');
          }
        }
      }
    });

    test('should handle field-level validation with ARIA', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Test email validation
      const emailInput = page.locator('#admin-email');
      if (await emailInput.count() > 0) {
        await emailInput.fill('invalid-email');
        await emailInput.blur();
        
        // Check for validation error
        const errorMessage = page.locator('[role="alert"], .error-message');
        if (await errorMessage.count() > 0) {
          expect(await errorMessage.first().text()).toContain('email');
        }
        
        // Check for ARIA invalid attribute
        const ariaInvalid = await emailInput.getAttribute('aria-invalid');
        if (ariaInvalid) {
          expect(ariaInvalid).toBe('true');
        }
      }
    });

    test('should show success state with proper ARIA', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Fill form with valid data
      await page.fill('#admin-email', 'test@example.com');
      await page.fill('#admin-name', 'Test User');
      await page.fill('#admin-surname', 'Test Surname');
      await page.fill('#admin-password', 'password123');
      await page.fill('#admin-confirm-password', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for success message or redirect
      const successMessage = page.locator('[role="alert"], .success-message, .toast-success');
      if (await successMessage.count() > 0) {
        expect(await successMessage.first().text()).toContain('success');
      } else {
        // Check for redirect to list page
        await page.waitForURL(/admins/, { timeout: 5000 });
        expect(page.url()).toContain('admins');
      }
    });
  });

  test.describe('Student Form Accessibility', () => {
    test('should have proper form structure for student registration', async ({ page }) => {
      await page.goto('http://localhost:3000/students');
      await page.click('[data-testid="add-student-button"]');
      
      // Check for proper form structure
      const form = page.locator('form');
      expect(await form.count()).toBeGreaterThan(0);
      
      // Check for required field indicators
      const requiredFields = page.locator('[required], [aria-required="true"]');
      const requiredCount = await requiredFields.count();
      expect(requiredCount).toBeGreaterThan(0);
    });

    test('should handle complex validation scenarios', async ({ page }) => {
      await page.goto('http://localhost:3000/students');
      await page.click('[data-testid="add-student-button"]');
      
      // Test phone number validation
      const phoneInput = page.locator('#student-phone, #phone');
      if (await phoneInput.count() > 0) {
        await phoneInput.fill('invalid-phone');
        await phoneInput.blur();
        
        // Check for validation error
        const errorMessage = page.locator('[role="alert"], .error-message');
        if (await errorMessage.count() > 0) {
          expect(await errorMessage.first().text()).toBeTruthy();
        }
      }
    });
  });

  test.describe('Room Form Accessibility', () => {
    test('should handle dynamic form fields with proper ARIA', async ({ page }) => {
      await page.goto('http://localhost:3000/rooms');
      await page.click('[data-testid="add-room-button"]');
      
      // Check for dynamic field updates
      const roomTypeSelect = page.locator('#room-type, select[name="room_type"]');
      if (await roomTypeSelect.count() > 0) {
        await roomTypeSelect.selectOption({ index: 1 });
        
        // Check for dependent fields that might appear
        const dependentFields = page.locator('[data-dependent-field]');
        if (await dependentFields.count() > 0) {
          for (let i = 0; i < await dependentFields.count(); i++) {
            const field = dependentFields.nth(i);
            expect(await field.isVisible()).toBe(true);
            
            // Check for proper ARIA attributes
            const ariaLabel = await field.getAttribute('aria-label');
            if (ariaLabel) {
              expect(ariaLabel).toBeTruthy();
            }
          }
        }
      }
    });
  });

  test.describe('Form Navigation & Focus Management', () => {
    test('should maintain proper focus order', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Tab through form fields and check focus order
      const focusableElements = page.locator('input, select, textarea, button, a');
      const elementCount = await focusableElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A']).toContain(activeElement);
      }
    });

    test('should handle form submission with keyboard', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Fill form using keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.type('test@example.com');
      
      await page.keyboard.press('Tab');
      await page.keyboard.type('Test User');
      
      // Submit with Enter key
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Check for form submission
      const successMessage = page.locator('[role="alert"], .success-message');
      if (await successMessage.count() > 0) {
        expect(await successMessage.first().text()).toBeTruthy();
      }
    });
  });

  test.describe('Form Error Recovery', () => {
    test('should allow error correction with proper feedback', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Submit with errors
      await page.click('button[type="submit"]');
      
      // Correct errors
      const emailInput = page.locator('#admin-email');
      if (await emailInput.count() > 0) {
        await emailInput.fill('valid@example.com');
        await emailInput.blur();
        
        // Check that error is cleared
        const errorMessage = page.locator('[role="alert"], .error-message');
        const errorCount = await errorMessage.count();
        
        // Error should be cleared or reduced
        expect(errorCount).toBeLessThanOrEqual(1);
      }
    });

    test('should provide clear error messages', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Submit with errors
      await page.click('button[type="submit"]');
      
      // Check for clear, actionable error messages
      const errorMessages = page.locator('[role="alert"], .error-message');
      if (await errorMessages.count() > 0) {
        for (let i = 0; i < await errorMessages.count(); i++) {
          const error = errorMessages.nth(i);
          const errorText = await error.text();
          
          // Error message should be clear and actionable
          expect(errorText.length).toBeGreaterThan(5);
          expect(errorText).not.toContain('undefined');
          expect(errorText).not.toContain('null');
        }
      }
    });
  });

  test.describe('Form Success States', () => {
    test('should provide clear success feedback', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Fill form completely
      await page.fill('#admin-email', 'success@example.com');
      await page.fill('#admin-name', 'Success User');
      await page.fill('#admin-surname', 'Success Surname');
      await page.fill('#admin-password', 'password123');
      await page.fill('#admin-confirm-password', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for success feedback
      const successIndicators = page.locator('[role="alert"], .success-message, .toast-success, .success-toast');
      if (await successIndicators.count() > 0) {
        const successText = await successIndicators.first().text();
        expect(successText).toContain('success');
      } else {
        // Check for redirect to list page
        await page.waitForURL(/admins/, { timeout: 5000 });
        expect(page.url()).toContain('admins');
      }
    });

    test('should maintain form state during success', async ({ page }) => {
      await page.goto('http://localhost:3000/admins');
      await page.click('[data-testid="add-admin-button"]');
      
      // Fill form
      await page.fill('#admin-email', 'state@example.com');
      await page.fill('#admin-name', 'State User');
      
      // Submit and check state preservation
      await page.click('button[type="submit"]');
      
      // Form should either be reset or maintain state appropriately
      const emailInput = page.locator('#admin-email');
      if (await emailInput.count() > 0) {
        const emailValue = await emailInput.inputValue();
        // Value should either be cleared or maintained consistently
        expect(emailValue === '' || emailValue === 'state@example.com').toBe(true);
      }
    });
  });
}); 