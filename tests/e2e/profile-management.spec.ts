import { test, expect } from '@playwright/test'

test.describe('Profile Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/')
    
    // Login as admin with seeded credentials
    await page.fill('input[type="email"]', 'admin@sdu.edu.kz')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Wait for successful login - flexible URL matching
    await page.waitForURL(/\/(main|dormitories)/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test.describe('Email and Dormitory Updates', () => {
    test('should allow updating email in profile form', async ({ page }) => {
      // Navigate to admin profile via user menu with correct selectors
      const userMenuButton = page.locator('.user-menu')
      await expect(userMenuButton).toBeVisible({ timeout: 10000 })
      await userMenuButton.click()
      
      const profileLink = page.locator('[data-testid="profile-link"]')
      await expect(profileLink).toBeVisible({ timeout: 5000 })
      await profileLink.click()
      
      // Wait for form to load
      await page.waitForSelector('#admin-email', { timeout: 15000 })
      
      // Change email
      await page.fill('#admin-email', 'newemail@example.com')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Wait for success message with extended timeout
      await page.waitForSelector('.toast-success, .success-message, text="successfully"', { timeout: 15000 })
      
      // Verify success message appears
      const successIndicator = page.locator('.toast-success, .success-message, text="successfully"').first()
      await expect(successIndicator).toBeVisible()
    })

    test('should allow updating dormitory in profile form', async ({ page }) => {
      // Navigate to admin profile via user menu
      const userMenuButton = page.locator('.user-menu')
      await expect(userMenuButton).toBeVisible({ timeout: 10000 })
      await userMenuButton.click()
      
      const profileLink = page.locator('[data-testid="profile-link"]')
      await expect(profileLink).toBeVisible({ timeout: 5000 })
      await profileLink.click()
      
      // Wait for form to load
      await page.waitForSelector('#admin-dormitory', { timeout: 15000 })
      
      // Wait for dormitory options to load
      await page.waitForFunction(() => {
        const select = document.querySelector('#admin-dormitory') as HTMLSelectElement
        return select && select.options.length > 1
      }, { timeout: 10000 })
      
      // Change dormitory - select the first available option that's not empty
      const dormitorySelect = page.locator('#admin-dormitory')
      const options = await dormitorySelect.locator('option').all()
      if (options.length > 1) {
        const secondOption = await options[1].getAttribute('value')
        if (secondOption) {
          await dormitorySelect.selectOption(secondOption)
        }
      }
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Wait for success message with extended timeout
      await page.waitForSelector('.toast-success, .success-message, text="successfully"', { timeout: 15000 })
      
      // Verify success message appears
      const successIndicator = page.locator('.toast-success, .success-message, text="successfully"').first()
      await expect(successIndicator).toBeVisible()
    })

    test('should load dormitories from API in dropdown', async ({ page }) => {
      // Navigate to admin profile via user menu
      const userMenuButton = page.locator('.user-menu')
      await expect(userMenuButton).toBeVisible({ timeout: 10000 })
      await userMenuButton.click()
      
      const profileLink = page.locator('[data-testid="profile-link"]')
      await expect(profileLink).toBeVisible({ timeout: 5000 })
      await profileLink.click()
      
      // Wait for dormitory dropdown to load with options
      await page.waitForSelector('#admin-dormitory', { timeout: 15000 })
      
      // Wait for options to be populated
      await page.waitForFunction(() => {
        const select = document.querySelector('#admin-dormitory') as HTMLSelectElement
        return select && select.options.length > 1
      }, { timeout: 10000 })
      
      // Check that dormitory options are loaded
      const dormitoryOptions = page.locator('#admin-dormitory option')
      const optionCount = await dormitoryOptions.count()
      
      // Should have more than just the default option
      expect(optionCount).toBeGreaterThan(1)
    })
  })

  test.describe('Password Change Functionality', () => {
    test('should display password change section', async ({ page }) => {
      // Navigate to admin profile via user menu
      await page.click('button:has-text("Admin")')
      await page.click('text=Profile')
      
      // Check if password change section exists
      await expect(page.locator('#current-password')).toBeVisible()
      await expect(page.locator('#new-password')).toBeVisible()
      await expect(page.locator('#confirm-password')).toBeVisible()
      await expect(page.locator('button:has-text("Change Password")')).toBeVisible()
    })

    test('should validate password confirmation match', async ({ page }) => {
      // Navigate to admin profile via user menu
      await page.click('button:has-text("Admin")')
      await page.click('text=Profile')
      
      // Fill password change form with mismatched passwords
      await page.fill('#current-password', 'currentpass')
      await page.fill('#new-password', 'newpass123')
      await page.fill('#confirm-password', 'differentpass')
      
      // Try to submit password change
      await page.click('button:has-text("Change Password")')
      
      // Should show validation error
      await page.waitForSelector('.toast-error', { timeout: 5000 })
      const errorToast = await page.locator('.toast-error')
      await expect(errorToast).toBeVisible()
    })

    test('should require minimum password length', async ({ page }) => {
      // Navigate to admin profile via user menu
      await page.click('button:has-text("Admin")')
      await page.click('text=Profile')
      
      // Fill password change form with short password
      await page.fill('#current-password', 'currentpass')
      await page.fill('#new-password', '123')
      await page.fill('#confirm-password', '123')
      
      // Try to submit password change
      await page.click('button:has-text("Change Password")')
      
      // Should show validation error
      await page.waitForSelector('.toast-error', { timeout: 5000 })
      const errorToast = await page.locator('.toast-error')
      await expect(errorToast).toBeVisible()
    })

    test('should successfully change password with valid data', async ({ page }) => {
      // Navigate to admin profile via user menu
      await page.click('button:has-text("Admin")')
      await page.click('text=Profile')
      
      // Fill password change form with valid data
      await page.fill('#current-password', 'password')
      await page.fill('#new-password', 'newpassword123')
      await page.fill('#confirm-password', 'newpassword123')
      
      // Submit password change
      await page.click('button:has-text("Change Password")')
      
      // Should show success message
      await page.waitForSelector('.toast-success', { timeout: 10000 })
      const successToast = await page.locator('.toast-success')
      await expect(successToast).toBeVisible()
    })
  })

  test.describe('Password Reset from Login Page', () => {
    test('should display password reset option on login page', async ({ page }) => {
      // Logout first
      await page.goto('/login')
      
      // Check if password reset section exists
      await expect(page.locator('text=Forgot your password?')).toBeVisible()
      await expect(page.locator('#reset-email')).toBeVisible()
      await expect(page.locator('button:has-text("Send Reset Link")')).toBeVisible()
    })

    test('should send password reset link', async ({ page }) => {
      // Go to login page
      await page.goto('/login')
      
      // Fill reset email
      await page.fill('#reset-email', 'admin@admin.admin')
      
      // Click send reset link
      await page.click('button:has-text("Send Reset Link")')
      
      // Should show success message
      await page.waitForSelector('.toast-success', { timeout: 10000 })
      const successToast = await page.locator('.toast-success')
      await expect(successToast).toBeVisible()
    })

    test('should validate email format for password reset', async ({ page }) => {
      // Go to login page
      await page.goto('/login')
      
      // Fill invalid email
      await page.fill('#reset-email', 'invalid-email')
      
      // Try to send reset link
      await page.click('button:has-text("Send Reset Link")')
      
      // Should show validation error
      await page.waitForSelector('.toast-error', { timeout: 5000 })
      const errorToast = await page.locator('.toast-error')
      await expect(errorToast).toBeVisible()
    })
  })

  test.describe('Form Data Persistence', () => {
    test('should persist email changes after form submission', async ({ page }) => {
      const newEmail = `test${Date.now()}@example.com`
      
      // Navigate to admin profile
      await page.goto('/admin-form')
      
      // Wait for form to load
      await page.waitForSelector('#admin-email')
      
      // Change email
      await page.fill('#admin-email', newEmail)
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Wait for success message
      await page.waitForSelector('.toast-success', { timeout: 10000 })
      
      // Refresh page to verify persistence
      await page.reload()
      await page.waitForSelector('#admin-email')
      
      // Check if email is still there
      const emailValue = await page.inputValue('#admin-email')
      expect(emailValue).toBe(newEmail)
    })

    test('should persist dormitory changes after form submission', async ({ page }) => {
      // Navigate to admin profile
      await page.goto('/admin-form')
      
      // Wait for form to load
      await page.waitForSelector('#admin-dormitory')
      
      // Change dormitory
      await page.selectOption('#admin-dormitory', '2')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Wait for success message
      await page.waitForSelector('.toast-success', { timeout: 10000 })
      
      // Refresh page to verify persistence
      await page.reload()
      await page.waitForSelector('#admin-dormitory')
      
      // Check if dormitory is still selected
      const selectedValue = await page.inputValue('#admin-dormitory')
      expect(selectedValue).toBe('2')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Navigate to admin profile
      await page.goto('/admin-form')
      
      // Simulate network failure by blocking requests
      await page.route('/api/profile', route => route.abort('failed'))
      
      // Try to submit form
      await page.click('button[type="submit"]')
      
      // Should show error message
      await page.waitForSelector('.toast-error', { timeout: 10000 })
      const errorToast = await page.locator('.toast-error')
      await expect(errorToast).toBeVisible()
    })

    test('should handle validation errors from backend', async ({ page }) => {
      // Navigate to admin profile
      await page.goto('/admin-form')
      
      // Set invalid email
      await page.fill('#admin-email', 'invalid-email-format')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Should show validation error
      await page.waitForSelector('.toast-error', { timeout: 10000 })
      const errorToast = await page.locator('.toast-error')
      await expect(errorToast).toBeVisible()
    })
  })
})
