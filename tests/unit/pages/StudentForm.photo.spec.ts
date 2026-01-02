import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import StudentForm from '@/pages/StudentForm.vue';

// Mock the i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock the stores and services
vi.mock('@/stores/student', () => ({
  useStudentStore: () => ({
    restoreSelectedStudent: vi.fn(),
    setSelectedStudent: vi.fn(),
    clearSelectedStudent: vi.fn(),
  }),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { role: { name: 'admin' } },
  }),
}));

vi.mock('@/services/api', () => ({
  studentService: {
    create: vi.fn(),
    update: vi.fn(),
    getAll: vi.fn(),
  },
  roomService: {
    getAvailable: vi.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          number: '101',
          dormitory: { gender: 'male' },
          beds: [
            { id: 1, bed_number: 'A', is_occupied: false, reserved_for_staff: false },
          ],
        },
      ],
    }),
  },
  personalDataService: {
    update: vi.fn(),
  },
}));

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

describe('StudentForm Photo Upload', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(StudentForm, {
      props: {
        embedded: false,
      },
    });
  });

  it('should display profile picture upload field', () => {
    const photoInput = wrapper.find('#student-profile-photo');
    expect(photoInput.exists()).toBe(true);
  });

  it('should have correct label for profile picture', () => {
    const photoInput = wrapper.find('#student-profile-photo');
    expect(photoInput.attributes('label')).toBe('Student Photo (3x4)');
  });

  it('should only accept image files for profile picture', () => {
    const photoInput = wrapper.find('#student-profile-photo');
    const allowedExtensions = photoInput.attributes('allowed-extensions');
    expect(allowedExtensions).toBe('jpg,jpeg,png');
  });

  it('should have proper accept attribute for images', () => {
    const photoInput = wrapper.find('#student-profile-photo');
    expect(photoInput.attributes('accept')).toBe('image/*');
  });

  it('should display help text for photo requirements', () => {
    const helpText = wrapper.find('p.text-sm.text-gray-500');
    expect(helpText.exists()).toBe(true);
    expect(helpText.text()).toContain('3x4 cm photo');
  });

  it('should initialize files array with 4 slots including profile picture', () => {
    const vm = wrapper.vm;
    expect(vm.user.student_profile.files).toHaveLength(4);
    expect(vm.user.student_profile.files[3]).toBe(null); // Profile picture slot
  });

  it('should handle profile picture file change', async () => {
    const vm = wrapper.vm;
    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    
    // Simulate file change
    vm.handleFileChange(3, mockFile);
    
    expect(vm.user.student_profile.files[3]).toBe(mockFile);
  });
});
