import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import AdminForm from '@/pages/AdminForm.vue'
import PasswordReset from '@/components/PasswordReset.vue'
import Login from '@/pages/Login.vue'
import { authService, dormitoryService } from '@/services/api'

// Mock the API services
vi.mock('@/services/api', () => ({
  authService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    sendPasswordResetLink: vi.fn(),
    resetPassword: vi.fn(),
  },
  dormitoryService: {
    getAll: vi.fn(),
  },
  userService: {
    create: vi.fn(),
  }
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  }),
  createI18n: vi.fn(() => ({
    global: {
      t: (key: string) => key
    }
  }))
}))

// Mock useToast
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  })
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' }
  }),
  useRouter: () => ({
    push: vi.fn(),
  })
}))

describe('Profile Management Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock dormitories response
    vi.mocked(dormitoryService.getAll).mockResolvedValue({
      data: [
        { id: 1, name: 'A-BLOCK', capacity: 300, gender: 'female' },
        { id: 2, name: 'B-BLOCK', capacity: 300, gender: 'female' },
        { id: 3, name: 'C-BLOCK', capacity: 293, gender: 'male' },
      ]
    })
  })

  const globalConfig = {
    plugins: [createTestingPinia({ createSpy: vi.fn })],
    stubs: { CSidebar: true }
  } as const

  describe('Email and Dormitory Updates - Fixed Issues', () => {
    it('should allow email updates in profile form', async () => {
      // Mock profile response
      vi.mocked(authService.getProfile).mockResolvedValue({
        data: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+77001234567',
          dormitory_id: 1,
        }
      })

      vi.mocked(authService.updateProfile).mockResolvedValue({
        data: { message: 'Profile updated successfully' }
      })

      const wrapper = mount(AdminForm, { global: globalConfig })

      // Wait for component to load
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Change email
      const emailInput = wrapper.find('#admin-email')
      await emailInput.setValue('newemail@example.com')

      // Submit form
      await wrapper.vm.updateProfile()

      // Verify API was called and includes updated email
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'newemail@example.com',
        })
      )
    })

    it('should allow dormitory updates in profile form', async () => {
      vi.mocked(authService.getProfile).mockResolvedValue({
        data: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+77001234567',
          dormitory_id: 1,
        }
      })

      vi.mocked(authService.updateProfile).mockResolvedValue({
        data: { message: 'Profile updated successfully' }
      })

      const wrapper = mount(AdminForm, { global: globalConfig })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Change dormitory
      wrapper.vm.admin.dormitory = 2

      // Submit form
      await wrapper.vm.updateProfile()

      // Verify API was called with new dormitory_id
      expect(authService.updateProfile).toHaveBeenCalledWith({
        first_name: expect.any(String),
        last_name: expect.any(String),
        email: expect.any(String),
        phone_numbers: expect.any(Array),
        dormitory_id: 2,
      })
    })

    it('should load dormitories from API instead of hardcoded values', async () => {
      const wrapper = mount(AdminForm, { global: globalConfig })

      await wrapper.vm.$nextTick()

      // Verify dormitories were loaded from API
      expect(dormitoryService.getAll).toHaveBeenCalled()
      expect(wrapper.vm.dormitories).toEqual([
        { id: 1, name: 'A-BLOCK', capacity: 300, gender: 'female' },
        { id: 2, name: 'B-BLOCK', capacity: 300, gender: 'female' },
        { id: 3, name: 'C-BLOCK', capacity: 293, gender: 'male' },
      ])
    })
  })

  describe('Password Change Functionality', () => {
    it('should handle password change successfully', async () => {
      vi.mocked(authService.changePassword).mockResolvedValue({
        data: { message: 'Password updated successfully' }
      })

      const wrapper = mount(AdminForm, { global: globalConfig })

      await wrapper.vm.$nextTick()

      // Set password data
      wrapper.vm.passwordData = {
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      }

      // Call password change
      await wrapper.vm.changePassword()

      // Verify API was called
      expect(authService.changePassword).toHaveBeenCalledWith({
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      })
    })

    it('should validate password confirmation match', async () => {
      const wrapper = mount(AdminForm, { global: globalConfig })

      wrapper.vm.passwordData = {
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'differentpass',
      }

      await wrapper.vm.changePassword()

      // Verify API was not called due to validation error
      expect(authService.changePassword).not.toHaveBeenCalled()
    })

    it('should require minimum password length', async () => {
      const wrapper = mount(AdminForm, { global: globalConfig })

      wrapper.vm.passwordData = {
        current_password: 'oldpass',
        password: '123',
        password_confirmation: '123',
      }

      await wrapper.vm.changePassword()

      // Verify API was not called due to validation error
      expect(authService.changePassword).not.toHaveBeenCalled()
    })
  })

  describe('Password Reset Functionality', () => {
    it('should send password reset link successfully', async () => {
      vi.mocked(authService.sendPasswordResetLink).mockResolvedValue({
        data: { message: 'Password reset link sent' }
      } as any)

      const wrapper = mount(PasswordReset, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })]
        }
      })

      // Set email
      wrapper.vm.resetEmail = 'test@example.com'

      // Send reset link
      await wrapper.vm.sendResetLink()

      // Verify API was called with email string
      expect(authService.sendPasswordResetLink).toHaveBeenCalledWith('test@example.com')
    })

    it('should validate email format for password reset', async () => {
      const wrapper = mount(PasswordReset, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })]
        }
      })

      // Set invalid email
      wrapper.vm.resetEmail = 'invalid-email'

      // Try to send reset link
      await wrapper.vm.sendResetLink()

      // Verify API was not called due to validation
      expect(authService.sendPasswordResetLink).not.toHaveBeenCalled()
    })

    it('should be integrated into login page', () => {
      const wrapper = mount(Login, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })]
        }
      })

      // Verify PasswordReset component is present
      const passwordReset = wrapper.findComponent(PasswordReset)
      expect(passwordReset.exists()).toBe(true)
    })
  })

  describe('Form Data Loading and Mapping', () => {
    it('should properly load profile data from API', async () => {
      const profileData = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+77001234567',
        dormitory_id: 1,
      }

      vi.mocked(authService.getProfile).mockResolvedValue({
        data: profileData
      })

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })]
        }
      })

      await wrapper.vm.loadUser(1)

      expect(wrapper.vm.admin).toEqual({
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone_numbers: ['+77001234567'],
        dormitory: 1,
      })
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(authService.updateProfile).mockRejectedValue({
        response: {
          data: { message: 'Validation failed' }
        }
      })

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })]
        }
      })

      wrapper.vm.admin = {
        name: 'John',
        surname: 'Doe',
        email: 'invalid-email',
        phoneNumbers: ['+77001234567'],
        dormitory: 1,
      }

      await wrapper.vm.updateProfile()

      // Should not throw and should handle error
      expect(authService.updateProfile).toHaveBeenCalled()
    })
  })

  describe('Backend Validation Integration', () => {
    it('should handle backend validation errors for email', async () => {
      vi.mocked(authService.updateProfile).mockRejectedValue({
        response: {
          status: 422,
          data: {
            message: 'The given data was invalid.',
            errors: {
              email: ['The email field must be a valid email address.']
            }
          }
        }
      })

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })]
        }
      })

      wrapper.vm.admin = {
        name: 'John',
        surname: 'Doe',
        email: 'invalid-email',
        phoneNumbers: ['+77001234567'],
        dormitory: 1,
      }

      await wrapper.vm.updateProfile()

      expect(authService.updateProfile).toHaveBeenCalled()
    })

    it('should handle backend validation errors for password change', async () => {
      vi.mocked(authService.changePassword).mockRejectedValue({
        response: {
          status: 422,
          data: {
            message: 'The given data was invalid.',
            errors: {
              current_password: ['The current password is incorrect.']
            }
          }
        }
      })

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn })]
        }
      })

      wrapper.vm.passwordData = {
        current_password: 'wrongpass',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      }

      await wrapper.vm.changePassword()

      expect(authService.changePassword).toHaveBeenCalled()
    })
  })
})
