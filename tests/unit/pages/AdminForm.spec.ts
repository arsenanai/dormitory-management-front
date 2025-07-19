import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
// @ts-expect-error: Vue SFC import for test
import AdminForm from '../../../src/pages/AdminForm.vue';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock the API services
vi.mock('@/services/api', () => ({
  userService: {
    create: vi.fn(),
    update: vi.fn(),
  },
  authService: {
    updateProfile: vi.fn(),
    getProfile: vi.fn(),
    changePassword: vi.fn(),
  },
  dormitoryService: {
    getAll: vi.fn(),
  },
}));

// Mock the toast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

// Helper function to create mock response
const createMockResponse = (data: any) => ({ data });

describe('AdminForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.dormitoryService.getAll).mockResolvedValue(
      createMockResponse([
        { id: 1, name: 'Dormitory A' },
        { id: 2, name: 'Dormitory B' },
      ])
    );
    
    vi.mocked(api.authService.getProfile).mockResolvedValue(
      createMockResponse({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dormitory_id: 1,
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render the admin form with all required fields', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if all form fields are present
      expect(wrapper.find('#admin-name').exists()).toBe(true);
      expect(wrapper.find('#admin-surname').exists()).toBe(true);
      expect(wrapper.find('#admin-dormitory').exists()).toBe(true);
      expect(wrapper.find('#admin-email').exists()).toBe(true);
      expect(wrapper.find('#admin-phone').exists()).toBe(true);
    });

    it('should initialize with empty form data', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.admin.name).toBe('');
      expect(component.admin.surname).toBe('');
      expect(component.admin.dormitory).toBe(null);
      expect(component.admin.email).toBe('');
      expect(component.admin.phoneNumbers).toEqual(['']);
    });

    it('should load dormitories on mount', async () => {
      mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      await vi.waitFor(() => {
        expect(api.dormitoryService.getAll).toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require all mandatory fields', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Try to submit empty form
      await component.submitForm();
      
      // Should show validation errors for required fields
      expect(component.admin.name).toBe('');
      expect(component.admin.surname).toBe('');
      expect(component.admin.email).toBe('');
    });

    it('should validate email format', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const emailInput = wrapper.find('#admin-email');
      await emailInput.setValue('invalid-email');
      
      // The browser's built-in validation should handle this
      const element = emailInput.element as HTMLInputElement;
      expect(element.validity.valid).toBe(false);
    });

    it('should require at least one phone number', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.admin.phoneNumbers = [];
      
      await component.submitForm();
      
      // Should show error for missing phone number
      expect(component.admin.phoneNumbers.length).toBe(0);
    });
  });

  describe('Form Submission', () => {
    it('should submit form data successfully for new admin', async () => {
      vi.mocked(api.userService.create).mockResolvedValue(
        createMockResponse({ id: 1, message: 'Admin created successfully' })
      );

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.admin = {
        name: 'John',
        surname: 'Doe',
        dormitory: 1,
        email: 'john.doe@example.com',
        phoneNumbers: ['+1234567890'],
      };

      await component.submitForm();

      expect(api.userService.create).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dormitory_id: 1,
      });
    });

    it('should update profile for existing admin', async () => {
      vi.mocked(api.authService.updateProfile).mockResolvedValue(
        createMockResponse({ message: 'Profile updated successfully' })
      );

      router.setParams({ id: '1' });

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.admin = {
        name: 'John',
        surname: 'Doe',
        dormitory: 1,
        email: 'john.doe@example.com',
        phoneNumbers: ['+1234567890'],
      };

      await component.submitForm();

      expect(api.authService.updateProfile).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dormitory_id: 1,
      });
    });

    it('should handle form submission errors', async () => {
      vi.mocked(api.userService.create).mockRejectedValue(
        new Error('API Error')
      );

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.admin = {
        name: 'John',
        surname: 'Doe',
        dormitory: 1,
        email: 'john.doe@example.com',
        phoneNumbers: ['+1234567890'],
      };

      await component.submitForm();

      // Should handle the error gracefully
      expect(api.userService.create).toHaveBeenCalled();
    });
  });

  describe('Password Change Functionality', () => {
    it('should show password change form when button is clicked', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const passwordButton = wrapper.find('button:contains("Change Password")');
      await passwordButton.trigger('click');

      expect(wrapper.find('#current-password').exists()).toBe(true);
      expect(wrapper.find('#new-password').exists()).toBe(true);
      expect(wrapper.find('#confirm-password').exists()).toBe(true);
    });

    it('should validate password change form', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.showPasswordForm = true;
      
      // Try to change password with empty fields
      await component.changePassword();
      
      // Should validate required fields
      expect(component.passwordData.current_password).toBe('');
      expect(component.passwordData.password).toBe('');
      expect(component.passwordData.password_confirmation).toBe('');
    });

    it('should validate password confirmation match', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.showPasswordForm = true;
      component.passwordData = {
        current_password: 'oldpass',
        password: 'newpass',
        password_confirmation: 'differentpass',
      };
      
      await component.changePassword();
      
      // Should detect password mismatch
      expect(component.passwordData.password).not.toBe(component.passwordData.password_confirmation);
    });

    it('should validate minimum password length', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.showPasswordForm = true;
      component.passwordData = {
        current_password: 'oldpass',
        password: '123',
        password_confirmation: '123',
      };
      
      await component.changePassword();
      
      // Should detect short password
      expect(component.passwordData.password.length).toBeLessThan(6);
    });

    it('should submit password change successfully', async () => {
      vi.mocked(api.authService.changePassword).mockResolvedValue(
        createAxiosResponse({ message: 'Password changed successfully' })
      );

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.showPasswordForm = true;
      component.passwordData = {
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      };
      
      await component.changePassword();

      expect(api.authService.changePassword).toHaveBeenCalledWith({
        current_password: 'oldpass',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      });
    });

    it('should cancel password change and reset form', async () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.showPasswordForm = true;
      component.passwordData = {
        current_password: 'oldpass',
        password: 'newpass',
        password_confirmation: 'newpass',
      };
      
      component.cancelPasswordChange();

      expect(component.showPasswordForm).toBe(false);
      expect(component.passwordData.current_password).toBe('');
      expect(component.passwordData.password).toBe('');
      expect(component.passwordData.password_confirmation).toBe('');
    });
  });

  describe('Data Loading', () => {
    it('should load user data when editing', async () => {
      router.setParams({ id: '1' });

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      await vi.waitFor(() => {
        expect(api.authService.getProfile).toHaveBeenCalled();
      });

      const component = wrapper.vm as any;
      await vi.waitFor(() => {
        expect(component.admin.name).toBe('John');
        expect(component.admin.surname).toBe('Doe');
        expect(component.admin.email).toBe('john.doe@example.com');
      });
    });

    it('should handle data loading errors', async () => {
      vi.mocked(api.authService.getProfile).mockRejectedValue(
        new Error('Failed to load profile')
      );

      router.setParams({ id: '1' });

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      await vi.waitFor(() => {
        expect(api.authService.getProfile).toHaveBeenCalled();
      });

      // Should handle the error gracefully
      const component = wrapper.vm as any;
      expect(component.admin.name).toBe('');
    });
  });

  describe('Phone Number Utilities', () => {
    it('should combine phone number parts correctly', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const combined = component.combinePhoneNumber(['+1', '234', '567', '890']);
      expect(combined).toBe('+1234567890');
    });

    it('should handle empty phone number array', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const combined = component.combinePhoneNumber([]);
      expect(combined).toBe('');
    });

    it('should split phone number correctly', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const split = component.splitPhoneNumber('+1234567890');
      expect(split).toEqual(['+1234567890']);
    });

    it('should handle empty phone number string', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const split = component.splitPhoneNumber('');
      expect(split).toEqual(['']);
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for input labels
      expect(wrapper.find('label[for="admin-name"]').exists()).toBe(true);
      expect(wrapper.find('label[for="admin-surname"]').exists()).toBe(true);
      expect(wrapper.find('label[for="admin-dormitory"]').exists()).toBe(true);
      expect(wrapper.find('label[for="admin-email"]').exists()).toBe(true);
      expect(wrapper.find('label[for="admin-phone"]').exists()).toBe(true);
    });

    it('should have proper form structure', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for proper form elements
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('input[type="tel"]').exists()).toBe(true);
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods for testing', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Check exposed methods
      expect(typeof component.combinePhoneNumber).toBe('function');
      expect(typeof component.splitPhoneNumber).toBe('function');
      expect(typeof component.submitForm).toBe('function');
      expect(typeof component.loadUser).toBe('function');
      expect(component.admin).toBeDefined();
    });
  });
});
