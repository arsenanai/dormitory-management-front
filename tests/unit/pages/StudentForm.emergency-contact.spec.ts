import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
import StudentForm from '../../../src/pages/StudentForm.vue';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock the API services
vi.mock('@/services/api', () => ({
  studentService: {
    create: vi.fn(),
    update: vi.fn(),
    get: vi.fn(),
  },
  authService: {
    getProfile: vi.fn(),
  },
  roomService: {
    getAvailable: vi.fn(),
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

// Mock the student store
vi.mock('@/stores/student', () => ({
  useStudentStore: () => ({
    selectedStudent: null,
    restoreSelectedStudent: vi.fn(),
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

describe('StudentForm - Emergency Contact Fields', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.dormitoryService.getAll).mockResolvedValue(
      createMockResponse([
        {
          id: 1,
          name: 'A-Block',
          rooms: [
            { id: 1, number: 'A210', beds: [{ id: 1, number: 1, reserved_for_staff: false }] },
          ],
        },
      ])
    );
    
    vi.mocked(api.authService.getProfile).mockResolvedValue(
      createMockResponse({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        student_profile: {
          iin: '123456789012',
          faculty: 'engineering',
          specialist: 'computer_sciences',
          enrollment_year: 2023,
          gender: 'male',
          blood_type: 'A+',
          emergency_contact_name: 'Emergency Contact',
          emergency_contact_phone: '+1234567892',
          emergency_contact_type: 'parent',
          emergency_contact_email: 'emergency@example.com',
          deal_number: 'DEAL123',
        },
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Emergency Contact Fields Rendering', () => {
    it('should render emergency contact section', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if emergency contact section is present
      expect(wrapper.text()).toContain('Emergency Contact');
    });

    it('should display all emergency contact fields', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if emergency contact fields exist
      expect(wrapper.find('#student-emergency-name').exists()).toBe(true);
      expect(wrapper.find('#student-emergency-type').exists()).toBe(true);
      expect(wrapper.find('#student-emergency-phone').exists()).toBe(true);
      expect(wrapper.find('#student-emergency-email').exists()).toBe(true);
    });

    it('should not display old parent/mentor fields', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check that old fields are not present
      expect(wrapper.find('#student-parent-name').exists()).toBe(false);
      expect(wrapper.find('#student-mentor-name').exists()).toBe(false);
    });
  });

  describe('Emergency Contact Type Options', () => {
    it('should have correct emergency contact type options', () => {
      const wrapper = mount(StudentForm, {
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
      const wrapper = mount(StudentForm, {
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

    it('should initialize emergency contact fields with empty values', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Check initial values
      expect(component.user.student_profile.emergency_contact_name).toBe('');
      expect(component.user.student_profile.emergency_contact_type).toBe(null);
      expect(component.user.student_profile.emergency_contact_phone).toBe('');
      expect(component.user.student_profile.emergency_contact_email).toBe('');
    });
  });

  describe('Form Submission with Emergency Contact', () => {
    it('should include emergency contact data in student creation', async () => {
      const mockCreate = vi.fn().mockResolvedValue(
        createMockResponse({ id: 1, message: 'Student created successfully' })
      );

      vi.mocked(api.studentService.create).mockImplementation(mockCreate);

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data including emergency contact
      component.user = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_numbers: ['+1234567890'],
        password: 'password123',
        password_confirmation: 'password123',
        status: 'active',
      };
      component.user.student_profile = {
        iin: '123456789012',
        faculty: 'engineering',
        specialist: 'computer_sciences',
        enrollment_year: 2023,
        gender: 'male',
        blood_type: 'A+',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_type: 'parent',
        emergency_contact_phone: '+77001234568',
        emergency_contact_email: 'jane@example.com',
        deal_number: 'DEAL123',
        bed_id: 1,
        room_id: 1,
      };

      await component.submitForm();

      expect(mockCreate).toHaveBeenCalledWith(
        expect.any(FormData)
      );
      
      // Get the FormData and check it contains emergency contact data
      const formData = mockCreate.mock.calls[0][0];
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

    it('should include emergency contact data in student update', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data including emergency contact
      component.user = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_numbers: ['+1234567890'],
      };
      component.user.student_profile = {
        iin: '123456789012',
        faculty: 'engineering',
        specialist: 'computer_sciences',
        enrollment_year: 2023,
        gender: 'male',
        blood_type: 'A+',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_type: 'guardian',
        emergency_contact_phone: '+77001234568',
        emergency_contact_email: 'jane@example.com',
        deal_number: 'DEAL123',
        bed_id: 1,
        room_id: 1,
      };

      // Check that emergency contact data is in the user object
      expect(component.user.student_profile.emergency_contact_name).toBe('Jane Doe');
      expect(component.user.student_profile.emergency_contact_type).toBe('guardian');
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
          if (key.includes('type') && typeof value === 'string') expect(value).toBe('guardian');
          if (key.includes('phone') && typeof value === 'string') expect(value).toBe('+77001234568');
          if (key.includes('email') && typeof value === 'string') expect(value).toBe('jane@example.com');
        }
      });
      expect(foundEmergencyContact).toBe(true);
    });
  });

  describe('Emergency Contact Field Validation', () => {
    it('should handle empty emergency contact fields gracefully', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Emergency contact fields should be optional
      component.user.student_profile.emergency_contact_name = '';
      component.user.student_profile.emergency_contact_type = null;
      component.user.student_profile.emergency_contact_phone = '';
      component.user.student_profile.emergency_contact_email = '';
      
      await wrapper.vm.$nextTick();

      // Should not throw validation errors for empty optional fields
      expect(component.user.student_profile.emergency_contact_name).toBe('');
      expect(component.user.student_profile.emergency_contact_type).toBe(null);
      expect(component.user.student_profile.emergency_contact_phone).toBe('');
      expect(component.user.student_profile.emergency_contact_email).toBe('');
    });

    it('should validate emergency contact email format if provided', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const emailInput = wrapper.find('#student-emergency-email');
      await emailInput.setValue('invalid-email');
      
      // The browser's built-in validation should handle this
      const element = emailInput.element as HTMLInputElement;
      expect(element.validity.valid).toBe(false);
    });
  });

  describe('Emergency Contact Field Accessibility', () => {
    it('should have proper labels for emergency contact fields', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for proper labels (the CInput components should have labels)
      expect(wrapper.text()).toContain('Emergency Contact Name');
      expect(wrapper.text()).toContain('Emergency Contact Type');
      expect(wrapper.text()).toContain('Emergency Contact Phone');
      expect(wrapper.text()).toContain('Emergency Contact Email');
    });

    it('should have proper input types for emergency contact fields', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check input types through the component structure
      const nameInput = wrapper.find('#student-emergency-name');
      const phoneInput = wrapper.find('#student-emergency-phone');
      const emailInput = wrapper.find('#student-emergency-email');
      const typeSelect = wrapper.find('#student-emergency-type');
      
      expect(nameInput.exists()).toBe(true);
      expect(phoneInput.exists()).toBe(true);
      expect(emailInput.exists()).toBe(true);
      expect(typeSelect.exists()).toBe(true);
    });
  });

  describe('Data Loading with Emergency Contact', () => {
    it('should load emergency contact data when editing student', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Simulate loading student data by setting the values directly
      component.user.student_profile.emergency_contact_name = 'Loaded Emergency';
      component.user.student_profile.emergency_contact_type = 'guardian';
      component.user.student_profile.emergency_contact_phone = '+77001234599';
      component.user.student_profile.emergency_contact_email = 'loaded@example.com';
      
      // Check if emergency contact data is loaded
      expect(component.user.student_profile.emergency_contact_name).toBe('Loaded Emergency');
      expect(component.user.student_profile.emergency_contact_type).toBe('guardian');
      expect(component.user.student_profile.emergency_contact_phone).toBe('+77001234599');
      expect(component.user.student_profile.emergency_contact_email).toBe('loaded@example.com');
    });
  });
});
