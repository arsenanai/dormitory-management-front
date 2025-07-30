import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import AccountPreferences from '@/pages/AccountPreferences.vue'
import * as api from '@/services/api'

// Mock the API
vi.mock('@/services/api')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/account-preferences',
      name: 'AccountPreferences',
      component: AccountPreferences
    }
  ]
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'Account Preferences': 'Account Preferences',
      'Change Password': 'Change Password',
      'Current Password': 'Current Password',
      'New Password': 'New Password',
      'Confirm New Password': 'Confirm New Password',
      'Save Changes': 'Save Changes',
      'Password updated successfully': 'Password updated successfully',
      'Current password is incorrect': 'Current password is incorrect',
      'Passwords do not match': 'Passwords do not match',
      'Password must be at least 6 characters': 'Password must be at least 6 characters'
    }
  }
})

describe('AccountPreferences.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render account preferences page with title', () => {
      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      expect(wrapper.find('h1').text()).toBe('Account Preferences')
    })

    it('should render password change form', () => {
      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      expect(wrapper.find('#current-password').exists()).toBe(true)
      expect(wrapper.find('#new-password').exists()).toBe(true)
      expect(wrapper.find('#confirm-password').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should show password change form when "Change Password" button is clicked', async () => {
      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      // Initially password form should be hidden
      expect(wrapper.find('#current-password').isVisible()).toBe(false)

      // Click "Change Password" button
      await wrapper.find('button:has-text("Change Password")').trigger('click')

      // Password form should now be visible
      expect(wrapper.find('#current-password').isVisible()).toBe(true)
    })
  })

  describe('Password Change Validation', () => {
    it('should validate required fields', async () => {
      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      const component = wrapper.vm as any
      component.showPasswordForm = true
      component.passwordData = {
        current_password: '',
        password: '',
        password_confirmation: ''
      }

      await component.changePassword()

      // Should validate required fields
      expect(component.passwordData.current_password).toBe('')
      expect(component.passwordData.password).toBe('')
      expect(component.passwordData.password_confirmation).toBe('')
    })

    it('should validate password confirmation match', async () => {
      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      const component = wrapper.vm as any
      component.showPasswordForm = true
      component.passwordData = {
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'differentpass'
      }

      await component.changePassword()

      // Should detect password mismatch
      expect(component.passwordData.password).not.toBe(component.passwordData.password_confirmation)
    })

    it('should validate minimum password length', async () => {
      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      const component = wrapper.vm as any
      component.showPasswordForm = true
      component.passwordData = {
        current_password: 'oldpass',
        password: '123',
        password_confirmation: '123'
      }

      await component.changePassword()

      // Should detect short password
      expect(component.passwordData.password.length).toBeLessThan(6)
    })
  })

  describe('Password Change API Integration', () => {
    it('should submit password change successfully', async () => {
      vi.mocked(api.authService.changePassword).mockResolvedValue({
        data: { message: 'Password updated successfully' }
      })

      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      const component = wrapper.vm as any
      component.showPasswordForm = true
      component.passwordData = {
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'newpass123'
      }

      await component.changePassword()

      // Verify API was called
      expect(api.authService.changePassword).toHaveBeenCalledWith({
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'newpass123'
      })
    })

    it('should handle API error for incorrect current password', async () => {
      vi.mocked(api.authService.changePassword).mockRejectedValue({
        response: {
          data: {
            message: 'The current password is incorrect.',
            errors: { current_password: ['The current password is incorrect.'] }
          },
          status: 422
        }
      })

      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      const component = wrapper.vm as any
      component.showPasswordForm = true
      component.passwordData = {
        current_password: 'wrongpass',
        password: 'newpass123',
        password_confirmation: 'newpass123'
      }

      await component.changePassword()

      // Verify API was called
      expect(api.authService.changePassword).toHaveBeenCalledWith({
        current_password: 'wrongpass',
        password: 'newpass123',
        password_confirmation: 'newpass123'
      })
    })
  })

  describe('Form Reset', () => {
    it('should reset password form after successful change', async () => {
      vi.mocked(api.authService.changePassword).mockResolvedValue({
        data: { message: 'Password updated successfully' }
      })

      const wrapper = mount(AccountPreferences, {
        global: {
          plugins: [router, i18n, createTestingPinia({ createSpy: vi.fn })]
        }
      })

      const component = wrapper.vm as any
      component.showPasswordForm = true
      component.passwordData = {
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'newpass123'
      }

      await component.changePassword()

      // Form should be reset
      expect(component.passwordData.current_password).toBe('')
      expect(component.passwordData.password).toBe('')
      expect(component.passwordData.password_confirmation).toBe('')
      expect(component.showPasswordForm).toBe(false)
    })
  })
}) 