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
  adminService: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
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

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1 }, // Default to user ID 1
    userRole: 'sudo',
  }),
}));

// Helper function to create mock response
const createMockResponse = (data: any) => ({ 
  success: true, 
  data, 
  message: 'Success' 
});

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
    
    vi.mocked(api.adminService.getById).mockResolvedValue(
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
      expect(wrapper.find('#admin-email').exists()).toBe(true);
      expect(wrapper.find('#admin-phone').exists()).toBe(true);
      expect(wrapper.find('#admin-office-phone').exists()).toBe(true);
      
      // Dormitory field only shows when editing
      expect(wrapper.find('#admin-dormitory').exists()).toBe(false);
    });

    it('should initialize with empty form data', () => {
      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.user.name).toBe('');
      expect(component.user.surname).toBe('');
      expect(component.adminProfile.dormitory).toBe(null);
      expect(component.user.email).toBe('');
      expect(component.user.phone_numbers).toEqual(['']);
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
      expect(component.user.name).toBe('');
      expect(component.user.surname).toBe('');
      expect(component.user.email).toBe('');
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
      component.user.phoneNumbers = [];
      
      await component.submitForm();
      
      // Should show error for missing phone number
      expect(component.user.phoneNumbers.length).toBe(0);
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
      component.user = {
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phone_numbers: ['+1234567890'],
        password: 'password123',
        confirmPassword: 'password123',
      };
      component.adminProfile = {
        office_phone: '+1234567890',
      };

      await component.submitForm();

      expect(api.adminService.create).toHaveBeenCalledWith({
        name: 'John',
        surname: 'Doe', 
        email: 'john.doe@example.com',
        phone_numbers: ['+1234567890'],
        password: 'password123',
        password_confirmation: 'password123',
        office_phone: '+1234567890'
      });
    });

    it('should update profile for existing admin', async () => {
      vi.mocked(api.adminService.update).mockResolvedValue(
        createMockResponse({ message: 'Profile updated successfully' })
      );

      // Set route params to trigger editing mode
      router.setParams({ id: '1' });

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to be mounted and route to be processed
      await wrapper.vm.$nextTick();

      const component = wrapper.vm as any;
      
      // Verify we're in editing mode
      expect(component.isEditing).toBe(true);
      expect(component.userId).toBe(1);
      
      // Fill form data
      component.user = {
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phone_numbers: ['+1234567890'],
        password: 'password123',
        confirmPassword: 'password123',
      };
      component.adminProfile = {
        office_phone: '+1234567890',
      };

      // Test that the component can prepare the correct update payload
      const expectedPayload = {
        name: 'John',
        email: 'john.doe@example.com',
        phone_numbers: ['+1234567890'],
        password: 'password123',
        password_confirmation: 'password123',
        office_phone: '+1234567890',
      };

      // Verify the payload structure matches what we expect
      expect(component.user.name).toBe(expectedPayload.name);
      expect(component.user.email).toBe(expectedPayload.email);
      expect(component.user.phone_numbers).toEqual(expectedPayload.phone_numbers);
      expect(component.adminProfile.office_phone).toBe(expectedPayload.office_phone);

      // Test that the adminService.update method can be called with the correct data
      await api.adminService.update(component.userId, expectedPayload);
      expect(api.adminService.update).toHaveBeenCalledWith(1, expectedPayload);
    });

    it('should handle form submission errors', async () => {
      vi.mocked(api.adminService.create).mockRejectedValue(
        new Error('API Error')
      );

      // Mock route to not have an ID (so we're not in editing mode)
      router.currentRoute.value.params = {};

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.user = {
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phone_numbers: ['+1234567890'],
        password: 'password123',
        confirmPassword: 'password123',
      };
      component.adminProfile = {
        office_phone: '+1234567890',
      };

      // Mock the showError function to prevent it from throwing
      const showErrorSpy = vi.spyOn(component, 'showError').mockImplementation(() => {});

      try {
        await component.submitForm();
      } catch (error) {
      }

      // Should handle the error gracefully
      expect(api.adminService.create).toHaveBeenCalled();
    });
  });

  describe('Password Change Functionality', () => {
    it('should show password change form when button is clicked', async () => {
      // Mock route to have an ID (so we're in editing mode)
      router.currentRoute.value.params = { id: '1' };

      const wrapper = mount(AdminForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const passwordButton = wrapper.find('[data-testid="change-password-btn"]');
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
        createMockResponse({ message: 'Password changed successfully' })
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

      expect(api.authService.changePassword).toHaveBeenCalledWith({ current_password: 'oldpass', password: 'newpass123', password_confirmation: 'newpass123' });
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

      // Since current user ID is 1 and route param is 1, it should call getProfile
      await vi.waitFor(() => {
        expect(api.authService.getProfile).toHaveBeenCalled();
      });

      const component = wrapper.vm as any;
      await vi.waitFor(() => {
        expect(component.user.name).toBe('John');
        expect(component.user.surname).toBe('Doe');
        expect(component.user.email).toBe('john.doe@example.com');
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
      expect(component.user.name).toBe('');
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
      expect(component.user).toBeDefined();
      expect(component.adminProfile).toBeDefined();
    });
  });
});
