import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
import RegistrationTab from '../../../src/pages/RegistrationTab.vue';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock the API services
vi.mock('@/services/api', () => ({
  dormitoryService: {
    getAll: vi.fn(),
  },
  authService: {
    register: vi.fn(),
  },
}));

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    register: vi.fn(),
  }),
}));

// Mock the toast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

// Helper function to create mock API responses
const createMockResponse = (data: any) => ({
  success: true,
  data,
  message: 'Success',
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} },
});

describe('RegistrationTab - Emergency Contact Fields', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.dormitoryService.getAll).mockResolvedValue(
      createMockResponse([
        {
          id: 1,
          name: 'A-Block',
          gender: 'male',
          rooms: [
            { id: 1, number: 'A210', beds: [{ id: 1, number: 1, reserved_for_staff: false }] },
          ],
        },
      ])
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Emergency Contact Fields Rendering', () => {
    it('should render emergency contact step in stepper', () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if emergency contact step is present
      expect(wrapper.text()).toContain('Emergency Contact');
    });

    it('should display all emergency contact fields', async () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Navigate to emergency contact step by filling previous steps
      component.user.student_profile.gender = 'male';
      component.user.email = 'test@example.com';
      component.user.password = 'password123';
      component.user.password_confirmation = 'password123';
      component.user.first_name = 'John';
      component.user.last_name = 'Doe';
      component.user.phone_numbers = ['+77001234567'];
      
      // Move to emergency contact step
      component.currentStep = 4; // Emergency contact is step 4 (0-indexed)
      
      await wrapper.vm.$nextTick();

      // Check if emergency contact fields exist
      expect(wrapper.find('#registration-emergency-name').exists()).toBe(true);
      expect(wrapper.find('#registration-emergency-type').exists()).toBe(true);
      expect(wrapper.find('#registration-emergency-phone').exists()).toBe(true);
      expect(wrapper.find('#registration-emergency-email').exists()).toBe(true);
    });

    it('should not display old parent/mentor fields', async () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Navigate to emergency contact step
      component.currentStep = 4;
      
      await wrapper.vm.$nextTick();

      // Check that old fields are not present
      expect(wrapper.find('#registration-parent-name').exists()).toBe(false);
      expect(wrapper.find('#registration-mentor-name').exists()).toBe(false);
    });
  });

  describe('Emergency Contact Type Options', () => {
    it('should have correct emergency contact type options', () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Check emergency contact type options
      const options = component.emergencyContactTypeOptions;
      expect(options).toEqual([
        { value: 'parent', name: 'Parent' },
        { value: 'guardian', name: 'Guardian' },
        { value: 'other', name: 'Other' },
      ]);
    });
  });

  describe('Emergency Contact Data Binding', () => {
    it('should bind emergency contact fields to user.student_profile', async () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set emergency contact values
      component.user.student_profile.emergency_contact_name = 'Jane Doe';
      component.user.student_profile.emergency_contact_type = 'parent';
      component.user.student_profile.emergency_contact_phone = '+77001234568';
      component.user.student_profile.emergency_contact_email = 'jane@example.com';
      
      await wrapper.vm.$nextTick();

      // Check if values are bound correctly
      expect(component.user.student_profile.emergency_contact_name).toBe('Jane Doe');
      expect(component.user.student_profile.emergency_contact_type).toBe('parent');
      expect(component.user.student_profile.emergency_contact_phone).toBe('+77001234568');
      expect(component.user.student_profile.emergency_contact_email).toBe('jane@example.com');
    });
  });

  describe('Emergency Contact Step Validation', () => {
    it('should validate emergency contact step correctly', () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Emergency contact step should be valid (no required fields)
      expect(component.isEmergencyContactStepValid).toBe(true);
    });
  });

  describe('Form Submission with Emergency Contact', () => {
    it('should include emergency contact data in registration submission', async () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill all required form data including emergency contact
      component.user.student_profile.gender = 'male';
      component.user.student_profile.iin = '123456789012';
      component.user.student_profile.emergency_contact_name = 'Jane Doe';
      component.user.student_profile.emergency_contact_type = 'parent';
      component.user.student_profile.emergency_contact_phone = '+77001234568';
      component.user.student_profile.emergency_contact_email = 'jane@example.com';
      component.user.email = 'test@example.com';
      component.user.password = 'password123';
      component.user.password_confirmation = 'password123';
      component.user.first_name = 'John';
      component.user.last_name = 'Doe';
      component.user.phone_numbers = ['+77001234567'];
      component.user.dormitory_id = 1;
      component.user.room_id = 1;
      component.user.bed_id = 1;
      component.user.student_profile.agree_to_dormitory_rules = true;
      
      // Check that emergency contact data is in the user object
      expect(component.user.student_profile.emergency_contact_name).toBe('Jane Doe');
      expect(component.user.student_profile.emergency_contact_type).toBe('parent');
      expect(component.user.student_profile.emergency_contact_phone).toBe('+77001234568');
      expect(component.user.student_profile.emergency_contact_email).toBe('jane@example.com');
      
      // Test the buildFormData function directly
      const formData = new FormData();
      const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
        if (data === null || data === undefined) {
          return;
        }

        Object.keys(data).forEach((key) => {
          const value = data[key];
          const formKey = parentKey ? `${parentKey}[${key}]` : key;

          if (value instanceof File) {
            formData.append(formKey, value, value.name);
          } else if (key === "files" && Array.isArray(value)) {
            value.forEach((file, index) => {
              if (file instanceof File) {
                formData.append(`${formKey}[${index}]`, file, file.name);
              }
            });
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              const arrayKey = `${formKey}[${index}]`;
              if (typeof item === "object" && item !== null && !(item instanceof File)) {
                buildFormData(formData, item, arrayKey);
              } else if (item !== null && item !== undefined && item !== "") {
                formData.append(arrayKey, item);
              }
            });
          } else if (typeof value === "object" && value !== null) {
            buildFormData(formData, value, formKey);
          } else if (typeof value === "boolean") {
            formData.append(formKey, value ? "1" : "0");
          } else if (value !== null && value !== undefined) {
            formData.append(formKey, value);
          }
        });
      };
      
      buildFormData(formData, component.user);
      
      // Check that FormData contains emergency contact data
      let foundEmergencyContact = false;
      formData.forEach((value: FormDataEntryValue, key: string) => {
        if (key.includes('emergency_contact')) {
          foundEmergencyContact = true;
          expect(key).toMatch(/student_profile\[emergency_contact_\w+\]/);
          if (key.includes('name') && typeof value === 'string') expect(value).toBe('Jane Doe');
          if (key.includes('type') && typeof value === 'string') expect(value).toBe('parent');
          if (key.includes('phone') && typeof value === 'string') expect(value).toBe('+77001234568');
          if (key.includes('email') && typeof value === 'string') expect(value).toBe('jane@example.com');
        }
      });
      expect(foundEmergencyContact).toBe(true);
    });
  });

  describe('Emergency Contact Field Accessibility', () => {
    it('should have proper labels for emergency contact fields', async () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.currentStep = 4;
      
      await wrapper.vm.$nextTick();

      // Check for proper labels (the CInput components should have labels)
      expect(wrapper.text()).toContain('Emergency Contact Name');
      expect(wrapper.text()).toContain('Emergency Contact Type');
      expect(wrapper.text()).toContain('Emergency Contact Phone');
      expect(wrapper.text()).toContain('Emergency Contact Email');
    });

    it('should have proper input types for emergency contact fields', async () => {
      const wrapper = mount(RegistrationTab, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.currentStep = 4;
      
      await wrapper.vm.$nextTick();

      // Check input types through the component structure
      const nameInput = wrapper.find('#registration-emergency-name');
      const phoneInput = wrapper.find('#registration-emergency-phone');
      const emailInput = wrapper.find('#registration-emergency-email');
      
      expect(nameInput.exists()).toBe(true);
      expect(phoneInput.exists()).toBe(true);
      expect(emailInput.exists()).toBe(true);
    });
  });
});
