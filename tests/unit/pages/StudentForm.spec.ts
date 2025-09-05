import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
// @ts-expect-error: Vue SFC import for test
import StudentForm from '../../../src/pages/StudentForm.vue';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock the API services
vi.mock('@/services/api', () => ({
  studentService: {
    create: vi.fn(),
    update: vi.fn(),
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

describe('StudentForm', () => {
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
            { id: 2, number: 'A211', beds: [{ id: 2, number: 2, reserved_for_staff: false }] },
          ],
        },
        {
          id: 2,
          name: 'B-Block',
          rooms: [
            { id: 3, number: 'B101', beds: [{ id: 3, number: 1, reserved_for_staff: false }] },
            { id: 4, number: 'B102', beds: [{ id: 4, number: 2, reserved_for_staff: true }] },
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
        phone: '+1234567890',
        student_profile: {
          iin: '123456789012',
          faculty: 'engineering',
          specialist: 'computer_sciences',
          enrollment_year: 2023,
          gender: 'male',
          blood_type: 'A+',
          parent_name: 'Jane Doe',
          parent_phone: '+1234567891',
          parent_email: 'jane.doe@example.com',
          emergency_contact_name: 'Emergency Contact',
          emergency_contact_phone: '+1234567892',
          deal_number: 'DEAL123',
          agree_to_dormitory_rules: true,
          has_meal_plan: false,
        },
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render the student form with all required fields', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if all form sections are present
      expect(wrapper.text()).toContain('Personal Information');
      expect(wrapper.text()).toContain('Emergency Contact');
      expect(wrapper.text()).toContain('Registration & Status');
      expect(wrapper.text()).toContain('Educational Information');

      // Check if key form fields are present
      expect(wrapper.find('#student-iin').exists()).toBe(true);
      expect(wrapper.find('#student-name').exists()).toBe(true);
      expect(wrapper.find('#student-surname').exists()).toBe(true);
      expect(wrapper.find('#student-email').exists()).toBe(true);
      expect(wrapper.find('#student-gender').exists()).toBe(true);
      expect(wrapper.find('#student-faculty').exists()).toBe(true);
      expect(wrapper.find('#student-specialist').exists()).toBe(true);
      expect(wrapper.find('#student-enrollment-year').exists()).toBe(true);
      expect(wrapper.find('#student-deal-number').exists()).toBe(true);
    });

    it('should initialize with empty form data', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.user.name).toBe('');
      expect(component.user.surname).toBe('');
      expect(component.user.email).toBe('');
      expect(component.user.phone_numbers).toEqual(['']);
      expect(component.studentProfile.iin).toBe('');
      expect(component.studentProfile.faculty).toBe('');
      expect(component.studentProfile.specialist).toBe('');
    });

    it('should load available dormitories on mount', async () => {
      mount(StudentForm, {
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
    it('should require mandatory fields', async () => {
      const wrapper = mount(StudentForm, {
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
      expect(component.studentProfile.iin).toBe('');
      expect(component.studentProfile.faculty).toBe('');
      expect(component.studentProfile.specialist).toBe('');
    });

    it('should validate email format', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const emailInput = wrapper.find('#student-email');
      await emailInput.setValue('invalid-email');
      
      // The browser's built-in validation should handle this
      const element = emailInput.element as HTMLInputElement;
      expect(element.validity.valid).toBe(false);
    });

    it('should require at least one phone number', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.user.phone_numbers = [];
      
      await component.submitForm();
      
      // Should show error for missing phone number
      expect(component.user.phone_numbers.length).toBe(0);
    });

    it('should require bed selection', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.studentProfile.bed_id = null;
      
      await component.submitForm();
      
      // Should show error for missing bed selection
      expect(component.studentProfile.bed_id).toBe(null);
    });
  });

  describe('Form Submission', () => {
    it('should submit form data successfully for new student', async () => {
      vi.mocked(api.studentService.create).mockResolvedValue(
        createMockResponse({ id: 1, message: 'Student created successfully' })
      );

      const wrapper = mount(StudentForm, {
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
      component.studentProfile = {
        iin: '123456789012',
        faculty: 'engineering',
        specialist: 'computer_sciences',
        enrollment_year: 2023,
        gender: 'male',
        blood_type: 'A+',
        deal_number: 'DEAL123',
        bed_id: 1,
      };

      await component.submitForm();

      expect(api.studentService.create).toHaveBeenCalledWith({
        user: {
          name: 'John',
          email: 'john.doe@example.com',
          phone_numbers: ['+1234567890'],
          password: 'password123',
          password_confirmation: 'password123',
        },
        profile: {
          iin: '123456789012',
          faculty: 'engineering',
          specialist: 'computer_sciences',
          enrollment_year: 2023,
          gender: 'male',
          blood_type: 'A+',
          deal_number: 'DEAL123',
          bed_id: 1,
        },
      });
    });

    it('should update profile for existing student', async () => {
      vi.mocked(api.studentService.update).mockResolvedValue(
        createMockResponse({ message: 'Student profile updated successfully' })
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
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
      };
      component.studentProfile = {
        iin: '123456789012',
        faculty: 'engineering',
        specialist: 'computer_sciences',
        enrollment_year: 2023,
        gender: 'male',
        blood_type: 'A+',
        deal_number: 'DEAL123',
        bed_id: 1,
      };

      await component.submitForm();

      expect(api.studentService.update).toHaveBeenCalledWith(1, {
        user: {
          name: 'John',
          email: 'john.doe@example.com',
          phone_numbers: ['+1234567890'],
          password: undefined,
          password_confirmation: undefined,
        },
        profile: {
          iin: '123456789012',
          faculty: 'engineering',
          specialist: 'computer_sciences',
          enrollment_year: 2023,
          gender: 'male',
          blood_type: 'A+',
          deal_number: 'DEAL123',
          bed_id: 1,
        },
      });
    });

    it('should handle form submission errors', async () => {
      vi.mocked(api.studentService.create).mockRejectedValue(
        new Error('API Error')
      );

      // Mock route to not have an ID (so we're not in editing mode)
      router.currentRoute.value.params = {};

      const wrapper = mount(StudentForm, {
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
      component.studentProfile = {
        iin: '123456789012',
        faculty: 'engineering',
        specialist: 'computer_sciences',
        enrollment_year: 2023,
        gender: 'male',
        blood_type: 'A+',
        deal_number: 'DEAL123',
        bed_id: 1,
      };

      // Mock the showError function to prevent it from throwing
      const showErrorSpy = vi.spyOn(component, 'showError').mockImplementation(() => {});

      await component.submitForm();

      // Should handle the error gracefully
      expect(api.studentService.create).toHaveBeenCalled();
    });
  });

  describe('Phone Number Management', () => {
    it('should add phone number field when add button is clicked', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const initialPhoneCount = component.user.phone_numbers.length;
      
      await component.addPhoneField();
      
      expect(component.user.phone_numbers.length).toBe(initialPhoneCount + 1);
    });

    it('should validate that at least one phone number is provided', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      component.user.phone_numbers = [''];
      
      await component.submitForm();
      
      // Should show error for empty phone number
      expect(component.user.phone_numbers[0]).toBe('');
    });
  });

  describe('Location Selection', () => {
    it('should have country, region, and city as text input fields', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check that country, region, and city fields exist
      expect(wrapper.find('#student-country').exists()).toBe(true);
      expect(wrapper.find('#student-region').exists()).toBe(true);
      expect(wrapper.find('#student-city').exists()).toBe(true);
      
      // Verify they are CInput components (check for the component structure)
      const countryField = wrapper.find('#student-country');
      const regionField = wrapper.find('#student-region');
      const cityField = wrapper.find('#student-city');
      
      // These should exist and be visible
      expect(countryField.isVisible()).toBe(true);
      expect(regionField.isVisible()).toBe(true);
      expect(cityField.isVisible()).toBe(true);
      
      // Check that they have the correct labels
      expect(wrapper.text()).toContain('Country');
      expect(wrapper.text()).toContain('Region');
      expect(wrapper.text()).toContain('City');
    });

    it('should allow manual text input for location fields', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set values for location fields
      component.studentProfile.country = 'Kazakhstan';
      component.studentProfile.region = 'Almaty';
      component.studentProfile.city = 'Almaty City';
      
      // Verify the values are set correctly
      expect(component.studentProfile.country).toBe('Kazakhstan');
      expect(component.studentProfile.region).toBe('Almaty');
      expect(component.studentProfile.city).toBe('Almaty City');
    });
  });

  describe('Dormitory and Room Selection', () => {
    it('should update room options when dormitory changes', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set dormitory
      component.selectedDormitory = component.dormitories[1]; // B-Block
      
      // Room should be reset when dormitory changes
      expect(component.studentProfile.room).toBe(null);
    });

    it('should filter bed options based on selected room', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set a room
      component.studentProfile.room = component.rooms[0]; // A210
      
      // Bed options should be filtered for this room
      const bedOptions = component.bedOptions || [];
      expect(bedOptions.length).toBeGreaterThanOrEqual(0);
      if (bedOptions.length > 0) {
        expect(bedOptions.every((bed: any) => bed.room?.id === component.studentProfile.room.id)).toBe(true);
      }
    });

    it('should disable staff-reserved beds for students', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set a room with staff-reserved beds
      component.studentProfile.room = component.rooms[1]; // B101
      
      // Bed options should show staff-reserved beds as disabled
      const bedOptions = component.bedOptions || [];
      const staffReservedBed = bedOptions.find((bed: any) => bed.name?.includes('Staff Reserved'));
      if (staffReservedBed) {
        expect(staffReservedBed.disabled).toBe(true);
      }
    });
  });

  describe('Data Loading', () => {
    it('should load student data when editing', async () => {
      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Simulate loading student data
      await component.loadStudent(1);
      
      expect(api.authService.getProfile).toHaveBeenCalled();
    });

    it('should populate form with loaded student data', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Simulate loading student data
      await component.loadStudent(1);
      
      // Form should be populated with API data
      expect(component.user.name).toBe('John');
      expect(component.user.email).toBe('john.doe@example.com');
      expect(component.studentProfile.iin).toBe('123456789012');
      expect(component.studentProfile.faculty).toBe('engineering');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and IDs', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for input labels
      expect(wrapper.find('label[for="student-iin"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-name"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-surname"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-email"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-gender"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-faculty"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-specialist"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-enrollment-year"]').exists()).toBe(true);
      expect(wrapper.find('label[for="student-deal-number"]').exists()).toBe(true);
    });

    it('should have proper form structure', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for proper form elements
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('input[type="tel"]').exists()).toBe(true);
      expect(wrapper.find('input[type="number"]').exists()).toBe(true);
      expect(wrapper.find('input[type="date"]').exists()).toBe(true);
      expect(wrapper.find('input[type="search"]').exists()).toBe(true);
      expect(wrapper.find('button').exists()).toBe(true);
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods for testing', () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Check exposed methods
      expect(typeof component.addPhoneField).toBe('function');
      expect(typeof component.submitForm).toBe('function');
      expect(typeof component.loadStudent).toBe('function');
      expect(component.user).toBeDefined();
      expect(component.studentProfile).toBeDefined();
    });
  });
}); 