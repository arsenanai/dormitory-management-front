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
    getById: vi.fn(),
  },
  authService: {
    getProfile: vi.fn(),
  },
  roomService: {
    getAll: vi.fn(),
  },
  dormitoryService: {
    getAll: vi.fn(),
    getById: vi.fn(),
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
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} },
});

// Mock student data for testing
const mockStudentData = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone_numbers: ['+1234567890', '+1234567891'],
  phone: '+1234567890',
  room_id: 1,
  room: {
    id: 1,
    number: 'A210',
    dormitory_id: 1,
    dormitory: {
      id: 1,
      name: 'A Block'
    }
  },
  student_profile: {
    iin: '123456789012',
    faculty: 'Engineering',
    specialist: 'Computer Science',
    enrollment_year: 2023,
    gender: 'male',
    blood_type: 'A+',
    country: 'Kazakhstan',
    region: 'Almaty',
    city: 'Almaty City',
    parent_name: 'Jane Doe',
    parent_phone: '+1234567892',
    parent_email: 'jane.doe@example.com',

    emergency_contact_name: 'Emergency Contact',
    emergency_contact_phone: '+1234567895',
    deal_number: 'DEAL123',
    agree_to_dormitory_rules: true,
    has_meal_plan: false,
    allergies: 'None',
    status: 'active',
    registration_date: '2023-09-01',
    violations: 'None',
    mentor_name: 'Dr. Smith',
    mentor_email: 'dr.smith@example.com'
  }
};

describe('StudentForm Prepopulation Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.dormitoryService.getAll).mockResolvedValue(
      createMockResponse([
        {
          id: 1,
          name: 'A Block',
          rooms: [
            { id: 1, number: 'A210', beds: [{ id: 1, number: 1, reserved_for_staff: false }] },
            { id: 2, number: 'A211', beds: [{ id: 2, number: 2, reserved_for_staff: false }] },
          ],
        },
        {
          id: 2,
          name: 'B Block',
          rooms: [
            { id: 3, number: 'B101', beds: [{ id: 3, number: 1, reserved_for_staff: false }] },
            { id: 4, number: 'B102', beds: [{ id: 4, number: 2, reserved_for_staff: true }] },
          ],
        },
      ])
    );
    
    vi.mocked(api.dormitoryService.getById).mockResolvedValue(
      createMockResponse({
        id: 1,
        name: 'A Block',
        rooms: [
          { id: 1, number: 'A210', beds: [{ id: 1, number: 1, reserved_for_staff: false }] },
          { id: 2, number: 'A211', beds: [{ id: 2, number: 2, reserved_for_staff: false }] },
        ],
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Field Prepopulation', () => {
    it('should prepopulate all personal information fields correctly', async () => {
      // Mock student data loading
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );

      // Set route params to indicate editing mode
      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Simulate loading student data
      await component.loadStudent(1);

      // Check personal information fields
      expect(component.user.name).toBe('John');
      expect(component.user.surname).toBe('Doe');
      expect(component.user.email).toBe('john.doe@example.com');
      expect(component.user.phone_numbers).toEqual(['+1234567890', '+1234567891']);
      expect(component.studentProfile.iin).toBe('123456789012');
      expect(component.studentProfile.gender).toBe('male');
      expect(component.studentProfile.country).toBe('Kazakhstan');
      expect(component.studentProfile.region).toBe('Almaty');
      expect(component.studentProfile.city).toBe('Almaty City');
    });

    it('should prepopulate all family information fields correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check family information fields
      expect(component.studentProfile.parent_name).toBe('Jane Doe');
      expect(component.studentProfile.parent_phone).toBe('+1234567892');
      expect(component.studentProfile.parent_email).toBe('jane.doe@example.com');
      expect(component.studentProfile.mentor_name).toBe('Dr. Smith');
      expect(component.studentProfile.mentor_email).toBe('dr.smith@example.com');
    });

    it('should prepopulate all health information fields correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check health information fields
      expect(component.studentProfile.blood_type).toBe('A+');
      expect(component.studentProfile.allergies).toBe('None');
    });

    it('should prepopulate all emergency contact fields correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check emergency contact fields
      expect(component.studentProfile.emergency_contact_name).toBe('Emergency Contact');
      expect(component.studentProfile.emergency_contact_phone).toBe('+1234567895');
    });

    it('should prepopulate all educational information fields correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check educational information fields
      expect(component.studentProfile.faculty).toBe('Engineering');
      expect(component.studentProfile.specialist).toBe('Computer Science');
      expect(component.studentProfile.enrollment_year).toBe(2023);
      expect(component.studentProfile.deal_number).toBe('DEAL123');
    });

    it('should prepopulate dormitory and room selection correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check dormitory and room selection
      expect(component.selectedDormitory).toBe(1);
      expect(component.studentProfile.room_id).toBe(1);
    });

    it('should prepopulate all registration and status fields correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check registration and status fields
      expect(component.studentProfile.status).toBe('active');
      expect(component.studentProfile.registration_date).toBe('2023-09-01');
      expect(component.studentProfile.agree_to_dormitory_rules).toBe(true);
      expect(component.studentProfile.has_meal_plan).toBe(false);
      expect(component.studentProfile.violations).toBe('None');
      // Read-only validations
      const regInput = wrapper.find('#student-registration-date');
      expect(regInput.attributes('disabled')).toBeDefined();
      // CCheckbox may not reflect native disabled attr; verify component is in edit mode to enforce read-only
      const vm: any = (wrapper.vm as any);
      expect(vm.isEditing).toBe(true);

    });

    it('should prepopulate bed when backend provides bed_id', async () => {
      const withBed = {
        ...mockStudentData,
        student_profile: {
          ...mockStudentData.student_profile,
          bed_id: 1,
        }
      } as any;
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(withBed)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: { plugins: [router, i18n] },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Ensure dormitory/rooms loaded and bed options hydrated
      expect(component.selectedDormitory).toBe(1);
      expect(component.studentProfile.room_id).toBe(1);
      // bed_id should be set either directly or via matched bed option
      expect(component.studentProfile.bed_id).toBe(1);
    });

    it('should handle missing or null values gracefully', async () => {
      const incompleteStudentData = {
        ...mockStudentData,
        student_profile: {
          ...mockStudentData.student_profile,

          allergies: '',
          emergency_contact_name: null,
        }
      };

      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(incompleteStudentData)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check that null/undefined values are handled gracefully

      expect(component.studentProfile.allergies).toBe('');
      expect(component.studentProfile.emergency_contact_name).toBe('');
    });

    it('should handle phone numbers array correctly', async () => {
      const studentWithSinglePhone = {
        ...mockStudentData,
        phone_numbers: ['+1234567890'],
        phone: '+1234567890'
      };

      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(studentWithSinglePhone)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check phone numbers handling
      expect(component.user.phone_numbers).toEqual(['+1234567890']);
    });

    it('should handle phone numbers fallback correctly', async () => {
      const studentWithOnlyPhoneField = {
        ...mockStudentData,
        phone_numbers: null,
        phone: '+1234567890'
      };

      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(studentWithOnlyPhoneField)
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Check phone numbers fallback
      expect(component.user.phone_numbers).toEqual(['+1234567890']);
    });
  });

  describe('Form Data Saving', () => {
    it('should save all form fields correctly when updating', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );
      vi.mocked(api.studentService.update).mockResolvedValue(
        createMockResponse({ message: 'Student updated successfully' })
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Modify some fields
      component.user.name = 'John Updated';
      component.user.email = 'john.updated@example.com';
      component.studentProfile.faculty = 'Medicine';
      component.studentProfile.specialist = 'General Medicine';
      component.studentProfile.country = 'USA';
      component.studentProfile.region = 'California';
      component.studentProfile.city = 'Los Angeles';

      component.studentProfile.blood_type = 'B+';
      component.studentProfile.emergency_contact_name = 'Emergency Updated';
      
      // Set bed_id to pass validation
      component.studentProfile.bed_id = 1;

      // Submit the form
      await component.submitForm();

      // Verify the update was called with correct data
      expect(api.studentService.update).toHaveBeenCalledWith(1, {
        user: {
          name: 'John Updated',
          email: 'john.updated@example.com',
          phone_numbers: ['+1234567890', '+1234567891'],
          password: undefined,
          password_confirmation: undefined,
        },
        profile: {
          iin: '123456789012',
          faculty: 'Medicine',
          specialist: 'General Medicine',
          enrollment_year: 2023,
          gender: 'male',
          blood_type: 'B+',
          country: 'USA',
          region: 'California',
          city: 'Los Angeles',
          parent_name: 'Jane Doe',
          parent_phone: '+1234567892',
          parent_email: 'jane.doe@example.com',

          emergency_contact_name: 'Emergency Updated',
          emergency_contact_phone: '+1234567895',
          deal_number: 'DEAL123',
          agree_to_dormitory_rules: true,
          has_meal_plan: false,
          allergies: 'None',
          status: 'active',
          registration_date: '2023-09-01',
          violations: 'None',
          mentor_name: 'Dr. Smith',
          mentor_email: 'dr.smith@example.com',
          room: {
            id: 1,
            number: 'A210',
            dormitory_id: 1,
            dormitory: {
              id: 1,
              name: 'A Block'
            }
          },
          bed: null,
          bed_id: 1,
          room_id: 1,
        },
      });
    });

    it('should handle empty phone numbers array correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );
      vi.mocked(api.studentService.update).mockResolvedValue(
        createMockResponse({ message: 'Student updated successfully' })
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Set empty phone numbers
      component.user.phone_numbers = [''];

      // Submit should fail validation
      await component.submitForm();

      // Should not call update due to validation error
      expect(api.studentService.update).not.toHaveBeenCalled();
    });

    it('should handle bed selection correctly', async () => {
      vi.mocked(api.studentService.getById).mockResolvedValue(
        createMockResponse(mockStudentData)
      );
      vi.mocked(api.studentService.update).mockResolvedValue(
        createMockResponse({ message: 'Student updated successfully' })
      );

      router.setParams({ id: '1' });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      await component.loadStudent(1);

      // Set bed selection
      component.studentProfile.bed = { id: 1, number: 1, reserved_for_staff: false };

      // Submit the form
      await component.submitForm();

      // Verify bed_id is included in the payload
      const updateCall = vi.mocked(api.studentService.update).mock.calls[0];
      expect(updateCall[1].profile.bed_id).toBe(1);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields before submission', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Try to submit with empty required fields
      await component.submitForm();

      // Should not call create/update due to validation errors
      expect(api.studentService.create).not.toHaveBeenCalled();
      expect(api.studentService.update).not.toHaveBeenCalled();
    });

    it('should require at least one non-empty phone number', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set empty phone numbers
      component.user.phone_numbers = [''];
      component.studentProfile.bed_id = 1; // Set bed to pass other validation

      await component.submitForm();

      // Should not submit due to empty phone number
      expect(api.studentService.create).not.toHaveBeenCalled();
    });

    it('should require bed selection', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set valid phone numbers but no bed
      component.user.phone_numbers = ['+1234567890'];
      component.studentProfile.bed_id = null;

      await component.submitForm();

      // Should not submit due to missing bed selection
      expect(api.studentService.create).not.toHaveBeenCalled();
    });
  });
});
