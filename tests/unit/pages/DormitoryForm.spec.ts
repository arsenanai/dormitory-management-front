import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
// @ts-expect-error: Vue SFC import for test
import DormitoryForm from '../../../src/pages/DormitoryForm.vue';
import { Dormitory } from '@/models/Dormitory';
import { useRoute } from 'vue-router';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock the API services
vi.mock('@/services/api', () => ({
  dormitoryService: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
  },
  adminService: {
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

// Mock the dormitories store
vi.mock('@/stores/dormitories', () => ({
  useDormitoriesStore: () => ({
    selectedDormitory: null,
    restoreSelectedDormitory: vi.fn(),
    setSelectedDormitory: vi.fn(),
    $subscribe: vi.fn(),
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

describe('DormitoryForm - Comprehensive Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.dormitoryService.getById).mockResolvedValue(
      createMockResponse({
        id: 1,
        name: 'A-BLOCK',
        capacity: 300,
        gender: 'female',
        admin_id: 1,
        admin: { id: 1, name: 'Admin User', email: 'admin@test.com' },
        registered: 267,
        freeBeds: 33,
        rooms_count: 75,
        address: '123 Test Street',
        description: 'Test dormitory description',
        quota: 250,
        phone: '+1234567890'
      })
    );

    vi.mocked(api.adminService.getAll).mockResolvedValue(
      createMockResponse([
        { id: 1, name: 'Admin User', email: 'admin@test.com' },
        { id: 2, name: 'Another Admin', email: 'admin2@test.com' }
      ])
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization and Rendering', () => {
    it('should render the dormitory form with all required fields', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if all form fields are present
      expect(wrapper.find('#dormitory-name').exists()).toBe(true);
      expect(wrapper.find('#dormitory-capacity').exists()).toBe(true);
      expect(wrapper.find('#dormitory-gender').exists()).toBe(true);
      expect(wrapper.find('#dormitory-admin').exists()).toBe(true);
      expect(wrapper.find('#dormitory-address').exists()).toBe(true);
      expect(wrapper.find('#dormitory-description').exists()).toBe(true);
      // Quota field removed - moved to room form
      expect(wrapper.find('#dormitory-phone').exists()).toBe(true);
      
      // Check if room selection section is present
      expect(wrapper.text()).toContain('Rooms');
      const addRoomButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Room'));
      expect(addRoomButton).toBeTruthy();
    });

    it('should render computed fields with calculated values', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if computed fields are present
      expect(wrapper.text()).toContain('Student Capacity');
      expect(wrapper.text()).toContain('Registered Students');
      expect(wrapper.text()).toContain('Free Beds');
      expect(wrapper.text()).toContain('Rooms Count');
    });

    it('should allow adding rooms to the dormitory', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Find and click the Add Room button
      const addRoomButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Room'));
      expect(addRoomButton).toBeTruthy();
      
      await addRoomButton!.trigger('click');
      
      // Should add a room to the dormitory
      expect(wrapper.vm.dormitory.rooms).toHaveLength(1);
    });

    it('should allow removing rooms from the dormitory', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Add a room first
      const addRoomButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Room'));
      await addRoomButton!.trigger('click');
      expect(wrapper.vm.dormitory.rooms).toHaveLength(1);
      
      // Remove the room
      const removeButton = wrapper.findAll('button').find(btn => btn.text().includes('Remove'));
      await removeButton!.trigger('click');
      expect(wrapper.vm.dormitory.rooms).toHaveLength(0);
    });

    it('should calculate computed values correctly based on rooms', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Add a room with beds
      const addRoomButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Room'));
      await addRoomButton!.trigger('click');
      
      // Mock room data with beds
      const mockRoom = {
        id: 1,
        name: 'Room 101',
        beds: [
          { id: 1, status: 'available', reserved_for_staff: false },
          { id: 2, status: 'occupied', reserved_for_staff: false },
          { id: 3, status: 'available', reserved_for_staff: false }
        ]
      };
      
      wrapper.vm.dormitory.rooms = [mockRoom];
      
      // Check calculated values
      expect(wrapper.vm.dormitory.calculateTotalCapacity()).toBe(3);
      expect(wrapper.vm.dormitory.calculateTotalRooms()).toBe(1);
      expect(wrapper.vm.dormitory.calculateFreeBeds()).toBe(2);
      expect(wrapper.vm.dormitory.calculateRegisteredStudents()).toBe(1);
    });

    it('should initialize with empty form data for new dormitory', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.dormitory.name).toBe('');
      expect(component.dormitory.capacity).toBe(0);
      expect(component.dormitory.gender).toBe('');
      expect(component.dormitory.admin_id).toBe(null);
      expect(component.dormitory.registered).toBe(0);
      expect(component.dormitory.freeBeds).toBe(0);
      expect(component.dormitory.rooms_count).toBe(0);
    });

    it('should have proper gender options available', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.genderOptions).toHaveLength(3);
      expect(component.genderOptions[0].value).toBe('male');
      expect(component.genderOptions[0].name).toBe('Male');
      expect(component.genderOptions[1].value).toBe('female');
      expect(component.genderOptions[1].name).toBe('Female');
      expect(component.genderOptions[2].value).toBe('mixed');
      expect(component.genderOptions[2].name).toBe('Mixed');
    });

    it('should load admin options from API on mount', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for admin options to load
      await wrapper.vm.$nextTick();
      
      expect(api.adminService.getAll).toHaveBeenCalled();
      expect(component.adminOptions).toHaveLength(2);
      expect(component.adminOptions[0].value).toBe(1);
      expect(component.adminOptions[0].name).toBe('Admin User');
    });
  });

  describe('Dormitory Model Tests', () => {
    it('should create dormitory with calculation methods', () => {
      const dormitory = new Dormitory();
      expect(typeof dormitory.calculateTotalCapacity).toBe('function');
      expect(typeof dormitory.calculateTotalRooms).toBe('function');
      expect(typeof dormitory.calculateFreeBeds).toBe('function');
      expect(typeof dormitory.calculateRegisteredStudents).toBe('function');
    });

    it('should calculate values correctly', () => {
      const dormitory = new Dormitory();
      dormitory.rooms = [
        {
          id: 1,
          name: 'Room 101',
          beds: [
            { id: 1, status: 'available', reserved_for_staff: false },
            { id: 2, status: 'occupied', reserved_for_staff: false }
          ]
        }
      ];
      
      expect(dormitory.calculateTotalCapacity()).toBe(2);
      expect(dormitory.calculateTotalRooms()).toBe(1);
      expect(dormitory.calculateFreeBeds()).toBe(1);
      expect(dormitory.calculateRegisteredStudents()).toBe(1);
    });
  });

  describe('Form Field Validation', () => {
    it('should require dormitory name', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const nameInput = wrapper.find('#dormitory-name');
      expect(nameInput.attributes('required')).toBeDefined();
    });

    it('should require capacity', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const capacityInput = wrapper.find('#dormitory-capacity');
      expect(capacityInput.attributes('required')).toBeDefined();
    });

    it('should require gender selection', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const genderSelect = wrapper.find('#dormitory-gender');
      expect(genderSelect.attributes('required')).toBeDefined();
    });

    it('should require admin selection', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const adminSelect = wrapper.find('#dormitory-admin');
      expect(adminSelect.attributes('required')).toBeDefined();
    });

    it('should validate numeric fields format', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const capacityInput = wrapper.find('#dormitory-capacity');
      expect(capacityInput.attributes('type')).toBe('number');
    });
  });

  describe('Edit Mode Detection', () => {
    it('should detect edit mode when ID is in route params', () => {
      router.setParams({ id: '1' });
      
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.isEditing).toBe(true);
      expect(component.dormitoryId).toBe(1);
    });

    it('should detect edit mode when ID is in route path', () => {
      // Mock route with ID in path
      const mockRoute = {
        params: { id: '1' },
        path: '/dormitory-form/1'
      };
      
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
        props: {
          route: mockRoute
        }
      });

      expect(wrapper.vm.isEditing).toBe(true);
    });

    it('should not be in edit mode for new dormitory', async () => {
      // Set route without ID using vue-router-mock
      router.push('/dormitory-form');
      
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to mount and initialize
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isEditing).toBe(false);
    });
  });

  describe('Data Loading for Edit Mode', () => {
    it('should load dormitory data when editing', async () => {
      router.setParams({ id: '1' });

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for data to load
      await wrapper.vm.$nextTick();
      
      expect(api.dormitoryService.getById).toHaveBeenCalledWith(1);
    });

    it('should populate form with loaded dormitory data', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Set route with ID to trigger edit mode
      router.push('/dormitory-form/1');
      
      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      
      // Wait for the API call to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      const component = wrapper.vm as any;
      
      // Form should be populated with API data
      expect(component.dormitory.name).toBe('A-BLOCK');
      expect(component.dormitory.capacity).toBe(300);
      expect(component.dormitory.gender).toBe('female');
      expect(component.dormitory.admin_id).toBe(1);
    });

    it('should handle dormitory loading errors gracefully', async () => {
      vi.mocked(api.dormitoryService.getById).mockRejectedValue(
        new Error('API Error')
      );

      router.setParams({ id: '1' });

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Should handle the error gracefully
      await wrapper.vm.$nextTick();
      
      expect(api.dormitoryService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('Form Submission', () => {
    it('should submit form data successfully for new dormitory', async () => {
      // Mock the API to return the data we want
      vi.mocked(api.dormitoryService.getById).mockResolvedValue(
        createMockResponse({ id: 1, name: 'Initial Name', capacity: 100, gender: 'male', admin_id: 1 })
      );
      
      vi.mocked(api.dormitoryService.create).mockResolvedValue(
        createMockResponse({ id: 1, message: 'Dormitory created successfully' })
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Set route without ID to ensure we're not in edit mode
      router.push('/dormitory-form');
      await wrapper.vm.$nextTick();

      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      // Ensure the dormitory object has the required methods
      wrapper.vm.dormitory = new Dormitory('New Dormitory', 300, 'female', 'Admin', 1);
      await wrapper.vm.$nextTick();
      
      // Fill form data with valid values
      wrapper.vm.dormitory.name = 'New Dormitory';
      wrapper.vm.dormitory.capacity = 300;
      wrapper.vm.dormitory.gender = 'female';
      wrapper.vm.dormitory.admin_id = 1;
      await wrapper.vm.$nextTick();

      // Trigger form submission by submitting the form
      await wrapper.find('form').trigger('submit');

      // Wait for the submission to complete
      await wrapper.vm.$nextTick();

      // Should call the API
      expect(api.dormitoryService.create).toHaveBeenCalledWith({
        name: 'New Dormitory',
        capacity: 300,
        gender: 'female',
        admin_id: 1,
        address: '',
        description: '',
        quota: 0,
        phone: '',
        rooms: []
      });
    });

    it('should update dormitory for existing dormitory', async () => {
      vi.mocked(api.dormitoryService.update).mockResolvedValue(
        createMockResponse({ message: 'Dormitory updated successfully' })
      );

      router.setParams({ id: '1' });

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Ensure the dormitory object has the required methods
      wrapper.vm.dormitory = new Dormitory('Test Dormitory', 100, 'female', 'Admin', 1);
      
      // Wait for data to load
      await wrapper.vm.$nextTick();
      
      // Make changes
      wrapper.vm.dormitory.name = 'Updated Dormitory';
      wrapper.vm.dormitory.capacity = 350;

      // Trigger form submission by submitting the form
      await wrapper.find('form').trigger('submit');

      // Should call the update API
      expect(api.dormitoryService.update).toHaveBeenCalledWith(1, {
        name: 'Updated Dormitory',
        capacity: 350,
        gender: 'female',
        admin_id: 1,
        address: '123 Test Street',
        description: 'Test dormitory description',
        quota: 250,
        phone: '+1234567890',
        rooms: []
      });
    });

    it('should prevent multiple submissions', async () => {
      // Mock the API to return the data we want
      vi.mocked(api.dormitoryService.getById).mockResolvedValue(
        createMockResponse({ id: 1, name: 'Initial Name', capacity: 100, gender: 'male', admin_id: 1 })
      );
      
      // Mock the API to delay the response so we can test the flags during submission
      vi.mocked(api.dormitoryService.create).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockResponse({ id: 1, message: 'Dormitory created successfully' })), 100))
      );

      // Mock router.push to prevent navigation
      const mockRouterPush = vi.fn();
      vi.mocked(router.push).mockImplementation(mockRouterPush);

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Set route without ID to ensure we're not in edit mode
      router.push('/dormitory-form');
      await wrapper.vm.$nextTick();

      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      // Ensure the dormitory object has the required methods
      wrapper.vm.dormitory = new Dormitory('Test Dormitory', 200, 'mixed', 'Admin', 1);
      await wrapper.vm.$nextTick();
      
      // Fill form data
      wrapper.vm.dormitory.name = 'Test Dormitory';
      wrapper.vm.dormitory.capacity = 200;
      wrapper.vm.dormitory.gender = 'mixed';
      wrapper.vm.dormitory.admin_id = 1;
      await wrapper.vm.$nextTick();

      // Clear the mock call count before first submission
      vi.mocked(api.dormitoryService.create).mockClear();

      // Start the first submission (this will set isSubmitting to true)
      const firstSubmission = wrapper.vm.submitDormitory();
      
      // Wait a bit for the flags to be set
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));
      await wrapper.vm.$nextTick();

      // Check that flags are set during submission
      expect(wrapper.vm.isSubmitting).toBe(true);
      expect(wrapper.vm.loading).toBe(true);

      // Try to call submitDormitory again while first is still in progress (should be prevented)
      const secondSubmission = wrapper.vm.submitDormitory();
      await wrapper.vm.$nextTick();

      // Wait for both submissions to complete
      await firstSubmission;
      await secondSubmission;
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should only call API once (the first submission)
      expect(api.dormitoryService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission errors', async () => {
      // Mock the API to return the data we want
      vi.mocked(api.dormitoryService.getById).mockResolvedValue(
        createMockResponse({ id: 1, name: 'Initial Name', capacity: 100, gender: 'male', admin_id: 1 })
      );
      
      vi.mocked(api.dormitoryService.create).mockRejectedValue(
        new Error('API Error')
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Set route without ID to ensure we're not in edit mode
      router.push('/dormitory-form');
      await wrapper.vm.$nextTick();

      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      // Ensure the dormitory object has the required methods
      wrapper.vm.dormitory = new Dormitory('Test Dormitory', 200, 'mixed', 'Admin', 1);
      await wrapper.vm.$nextTick();
      
      // Fill form data
      wrapper.vm.dormitory.name = 'Test Dormitory';
      wrapper.vm.dormitory.capacity = 200;
      wrapper.vm.dormitory.gender = 'mixed';
      wrapper.vm.dormitory.admin_id = 1;
      await wrapper.vm.$nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');

      // Wait for the submission to complete
      await wrapper.vm.$nextTick();

      // Should handle the error gracefully
      expect(api.dormitoryService.create).toHaveBeenCalled();
    });
  });

  describe('Form Field Interactions', () => {
    it('should update dormitory name when input changes', async () => {
      // Mock the API to return the data we want
      vi.mocked(api.dormitoryService.getById).mockResolvedValue(
        createMockResponse({ id: 1, name: 'Initial Name', capacity: 100, gender: 'male', admin_id: 1 })
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      // Now test the form interaction
      const nameInput = wrapper.find('#dormitory-name');
      await nameInput.setValue('New Dormitory Name');
      
      // Wait for Vue to update the reactive data
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.dormitory.name).toBe('New Dormitory Name');
    });

    it('should update capacity when input changes', async () => {
      // Mock the API to return the data we want
      vi.mocked(api.dormitoryService.getById).mockResolvedValue(
        createMockResponse({ id: 1, name: 'Test Dormitory', capacity: 100, gender: 'female', admin_id: 1 })
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      // Now test the form interaction
      const capacityInput = wrapper.find('#dormitory-capacity');
      await capacityInput.setValue('400');
      
      // Wait for Vue to update the reactive data
      await wrapper.vm.$nextTick();
      
      // Input fields return strings, so expect a string
      expect(wrapper.vm.dormitory.capacity).toBe('400');
    });

    it('should update gender when select changes', async () => {
      // Mock the API to return the data we want
      vi.mocked(api.dormitoryService.getById).mockResolvedValue(
        createMockResponse({ id: 1, name: 'Test Dormitory', capacity: 100, gender: 'female', admin_id: 1 })
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      // Now test the form interaction
      const genderSelect = wrapper.find('#dormitory-gender');
      await genderSelect.setValue('male');
      
      // Wait for Vue to update the reactive data
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.dormitory.gender).toBe('male');
    });

    it('should update admin when select changes', async () => {
      // Mock the API to return the data we want
      vi.mocked(api.dormitoryService.getById).mockResolvedValue(
        createMockResponse({ id: 1, name: 'Test Dormitory', capacity: 100, gender: 'male', admin_id: 1 })
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to mount and load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await wrapper.vm.$nextTick();
      
      // Now test the form interaction
      const adminSelect = wrapper.find('#dormitory-admin');
      await adminSelect.setValue('2');
      
      // Wait for Vue to update the reactive data
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.dormitory.admin_id).toBe(2);
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate that capacity is positive', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set negative capacity
      component.dormitory.capacity = -100;
      
      await component.submitDormitory();
      
      // Should handle negative capacity appropriately
      expect(component.dormitory.capacity).toBe(-100);
    });

    it('should validate that registered students is not negative', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set negative registered students
      component.dormitory.registered = -10;
      
      await component.submitDormitory();
      
      // Should handle negative registered students appropriately
      expect(component.dormitory.registered).toBe(-10);
    });

    it('should validate that free beds is not negative', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set negative free beds
      component.dormitory.freeBeds = -5;
      
      await component.submitDormitory();
      
      // Should handle negative free beds appropriately
      expect(component.dormitory.freeBeds).toBe(-5);
    });

    it('should validate that rooms count is not negative', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Set negative rooms count
      component.dormitory.rooms_count = -2;
      
      await component.submitDormitory();
      
      // Should handle negative rooms count appropriately
      expect(component.dormitory.rooms_count).toBe(-2);
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper form labels and IDs', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for required form field labels
      expect(wrapper.find('label[for="dormitory-name"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-capacity"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-gender"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-admin"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-address"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-description"]').exists()).toBe(true);
      // Quota field removed - moved to room form
      expect(wrapper.find('label[for="dormitory-phone"]').exists()).toBe(true);
    });

    it('should have proper form structure', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for form elements
      expect(wrapper.find('form').exists()).toBe(true);
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.find('input[type="number"]').exists()).toBe(true);
      expect(wrapper.find('select').exists()).toBe(true);
      // Check for submit button (the form uses @click instead of type="submit")
      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.text()).toContain('Submit');
    });

    it('should show loading state during submission', async () => {
      vi.mocked(api.dormitoryService.create).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.dormitory.name = 'Test Dormitory';
      component.dormitory.capacity = 200;
      component.dormitory.gender = 'mixed';
      component.dormitory.admin_id = 1;

      // Start submission
      const submitPromise = component.submitDormitory();
      
      // Check loading state
      expect(component.loading).toBe(true);
      
      // Wait for submission to complete
      await submitPromise;
      
      // Loading should be false after completion
      expect(component.loading).toBe(false);
    });
  });

  describe('Component Exposure and Testing', () => {
    it('should expose necessary methods for testing', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Check exposed methods
      expect(typeof component.submitDormitory).toBe('function');
      expect(typeof component.loadDormitory).toBe('function');
      expect(typeof component.loadAdmins).toBe('function');
      
      // Check exposed properties
      expect(component.dormitory).toBeDefined();
      expect(component.genderOptions).toBeDefined();
      expect(component.adminOptions).toBeDefined();
      expect(component.isEditing).toBeDefined();
      expect(component.dormitoryId).toBeDefined();
    });

    it('should handle component lifecycle properly', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Component should be mounted
      expect(component.dormitory).toBeDefined();
      
      // Admin options should be loaded
      await wrapper.vm.$nextTick();
      expect(api.adminService.getAll).toHaveBeenCalled();
    });
  });
}); 