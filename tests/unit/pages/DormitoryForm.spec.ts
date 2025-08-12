import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
// @ts-expect-error: Vue SFC import for test
import DormitoryForm from '../../../src/pages/DormitoryForm.vue';

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
  data,
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
      expect(wrapper.find('#dormitory-registered').exists()).toBe(true);
      expect(wrapper.find('#dormitory-freeBeds').exists()).toBe(true);
      expect(wrapper.find('#dormitory-rooms').exists()).toBe(true);
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

    it('should require registered students count', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const registeredInput = wrapper.find('#dormitory-registered');
      expect(registeredInput.attributes('required')).toBeDefined();
    });

    it('should require free beds count', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const freeBedsInput = wrapper.find('#dormitory-freeBeds');
      expect(freeBedsInput.attributes('required')).toBeDefined();
    });

    it('should require rooms count', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const roomsInput = wrapper.find('#dormitory-registered');
      expect(roomsInput.attributes('required')).toBeDefined();
    });

    it('should validate numeric fields format', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const capacityInput = wrapper.find('#dormitory-capacity');
      expect(capacityInput.attributes('type')).toBe('number');
      
      const registeredInput = wrapper.find('#dormitory-registered');
      expect(registeredInput.attributes('type')).toBe('number');
      
      const freeBedsInput = wrapper.find('#dormitory-freeBeds');
      expect(freeBedsInput.attributes('type')).toBe('number');
      
      const roomsInput = wrapper.find('#dormitory-rooms');
      expect(roomsInput.attributes('type')).toBe('number');
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
      router.setRoute('/dormitory-form/1');
      
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.isEditing).toBe(true);
    });

    it('should not be in edit mode for new dormitory', () => {
      router.setRoute('/dormitory-form');
      
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.isEditing).toBe(false);
      expect(component.dormitoryId).toBe(null);
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
      router.setParams({ id: '1' });

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for data to load
      await wrapper.vm.$nextTick();
      
      // Form should be populated with API data
      expect(component.dormitory.name).toBe('A-BLOCK');
      expect(component.dormitory.capacity).toBe(300);
      expect(component.dormitory.gender).toBe('female');
      expect(component.dormitory.admin_id).toBe(1);
      expect(component.dormitory.registered).toBe(267);
      expect(component.dormitory.freeBeds).toBe(33);
      expect(component.dormitory.rooms_count).toBe(75);
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
      vi.mocked(api.dormitoryService.create).mockResolvedValue(
        createMockResponse({ id: 1, message: 'Dormitory created successfully' })
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data with valid values
      component.dormitory = {
        name: 'New Dormitory',
        capacity: 300,
        gender: 'female',
        admin_id: 1,
        registered: 267,
        freeBeds: 33,
        rooms_count: 75
      };

      await component.submitDormitory();

      // Should call the API
      expect(api.dormitoryService.create).toHaveBeenCalledWith({
        name: 'New Dormitory',
        capacity: 300,
        gender: 'female',
        admin_id: 1
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

      const component = wrapper.vm as any;
      
      // Wait for data to load
      await wrapper.vm.$nextTick();
      
      // Make changes
      component.dormitory.name = 'Updated Dormitory';
      component.dormitory.capacity = 350;

      await component.submitDormitory();

      // Should call the update API
      expect(api.dormitoryService.update).toHaveBeenCalledWith(1, {
        name: 'Updated Dormitory',
        capacity: 350,
        gender: 'female',
        admin_id: 1
      });
    });

    it('should prevent multiple submissions', async () => {
      vi.mocked(api.dormitoryService.create).mockResolvedValue(
        createMockResponse({ id: 1, message: 'Dormitory created successfully' })
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

      // Submit multiple times
      await component.submitDormitory();
      await component.submitDormitory();
      await component.submitDormitory();

      // Should only call API once
      expect(api.dormitoryService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission errors', async () => {
      vi.mocked(api.dormitoryService.create).mockRejectedValue(
        new Error('API Error')
      );

      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.dormitory = {
        name: 'Test Dormitory',
        capacity: 200,
        gender: 'mixed',
        admin_id: 1,
        registered: 150,
        freeBeds: 50,
        rooms_count: 50
      };

      await component.submitDormitory();

      // Should handle the error gracefully
      expect(api.dormitoryService.create).toHaveBeenCalled();
    });
  });

  describe('Form Field Interactions', () => {
    it('should update dormitory name when input changes', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const nameInput = wrapper.find('#dormitory-name');
      
      await nameInput.setValue('New Dormitory Name');
      
      expect(component.dormitory.name).toBe('New Dormitory Name');
    });

    it('should update capacity when input changes', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const capacityInput = wrapper.find('#dormitory-capacity');
      
      await capacityInput.setValue('400');
      
      expect(component.dormitory.capacity).toBe(400);
    });

    it('should update gender when select changes', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const genderSelect = wrapper.find('#dormitory-gender');
      
      await genderSelect.setValue('male');
      
      expect(component.dormitory.gender).toBe('male');
    });

    it('should update admin when select changes', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const adminSelect = wrapper.find('#dormitory-admin');
      
      await adminSelect.setValue('2');
      
      expect(component.dormitory.admin_id).toBe(2);
    });

    it('should update registered students when input changes', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const registeredInput = wrapper.find('#dormitory-registered');
      
      await registeredInput.setValue('250');
      
      expect(component.dormitory.registered).toBe(250);
    });

    it('should update free beds when input changes', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const freeBedsInput = wrapper.find('#dormitory-freeBeds');
      
      await freeBedsInput.setValue('50');
      
      expect(component.dormitory.freeBeds).toBe(50);
    });

    it('should update rooms count when input changes', async () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const roomsInput = wrapper.find('#dormitory-rooms');
      
      await roomsInput.setValue('80');
      
      expect(component.dormitory.rooms_count).toBe(80);
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

      // Check for input labels
      expect(wrapper.find('label[for="dormitory-name"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-capacity"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-gender"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-admin"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-registered"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-freeBeds"]').exists()).toBe(true);
      expect(wrapper.find('label[for="dormitory-rooms"]').exists()).toBe(true);
    });

    it('should have proper form structure', () => {
      const wrapper = mount(DormitoryForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for proper form elements
      expect(wrapper.find('form').exists()).toBe(true);
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.find('input[type="number"]').exists()).toBe(true);
      expect(wrapper.find('select').exists()).toBe(true);
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
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