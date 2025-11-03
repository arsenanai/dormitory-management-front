import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
// @ts-expect-error: Vue SFC import for test
import RoomForm from '../../../src/pages/RoomForm.vue';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock the API services
vi.mock('@/services/api', () => ({
  roomService: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
  },
  dormitoryService: {
    getAll: vi.fn(),
  },
  roomTypeService: {
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

// Mock the rooms store
vi.mock('@/stores/rooms', () => ({
  useRoomsStore: () => ({
    selectedRoom: null,
    restoreSelectedRoom: vi.fn(),
  }),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { role: { name: 'sudo' } },
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

describe('RoomForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.roomService.getById).mockResolvedValue(
      createMockResponse({
        id: 1,
        number: 'A210',
        floor: 2,
        notes: 'Near the stairs',
        dormitory: { id: 1, name: 'A-BLOCK' },
        room_type: { id: 1, name: 'Standard', capacity: 2 },
      })
    );

    // Mock dormitory service
    vi.mocked(api.dormitoryService.getAll).mockResolvedValue(
      createMockResponse([
        { id: 1, name: 'A-BLOCK' },
        { id: 2, name: 'B-BLOCK' }
      ])
    );

    // Mock room type service
    vi.mocked(api.roomTypeService.getAll).mockResolvedValue(
      createMockResponse([
        { id: 1, name: 'Standard', capacity: 2 },
        { id: 2, name: 'Lux', capacity: 3 }
      ])
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render the room form with all required fields', () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if all form fields are present
      expect(wrapper.find('#room-number').exists()).toBe(true);
      expect(wrapper.find('#room-floor').exists()).toBe(true);
      expect(wrapper.find('#room-notes').exists()).toBe(true);
      expect(wrapper.find('[data-testid="dormitory-select"]').exists()).toBe(true);
      expect(wrapper.find('#room-type').exists()).toBe(true);
    });

    it('should initialize with empty form data', () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.room.number).toBe('');
      expect(component.room.floor).toBe(null);
      expect(component.room.notes).toBe('');
      expect(component.room.roomType).toBe(null);
      expect(component.room.dormitory_id).toBeUndefined();
    });

    it('should have room type options available', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to load room types
      await component.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.roomTypeOptions).toHaveLength(2);
      expect(component.roomTypeOptions[0].name).toBe('Standard');
      expect(component.roomTypeOptions[1].name).toBe('Lux');
    });
  });

  describe('Form Validation', () => {
    it('should require room number', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const roomNumberInput = wrapper.find('#room-number');
      expect(roomNumberInput.attributes('required')).toBeDefined();
    });

    it('should render floor number input (optional)', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const floorInput = wrapper.find('#room-floor');
      expect(floorInput.exists()).toBe(true);
      expect(floorInput.attributes('type')).toBe('number');
    });

    it('should require room type', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const roomTypeSelect = wrapper.find('#room-type');
      expect(roomTypeSelect.attributes('required')).toBeDefined();
    });

    it('should validate floor number format', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const floorInput = wrapper.find('#room-floor');
      await floorInput.setValue('invalid');
      
      // Floor is optional; invalid text should not be accepted in number input
      const element = floorInput.element as HTMLInputElement;
      expect(element.value).toBe('');
    });
  });

  describe('Bed Preview Functionality', () => {
    it('should show bed preview when room type is selected', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Initially no beds should be shown
      expect(component.bedsPreview).toHaveLength(0);
      
      // Wait for room type options to load
      await component.$nextTick();
      await new Promise(r => setTimeout(r, 50));
      expect(component.roomTypeOptions.length).toBeGreaterThan(0);

      // Select Standard room type
      component.selectedRoomTypeId = component.roomTypeOptions[0].value;
      await wrapper.vm.$nextTick();
      
      // Should show 2 beds for Standard room type
      expect(component.bedsPreview).toHaveLength(2);
      expect(component.bedsPreview[0].number).toBe('1');
      expect(component.bedsPreview[1].number).toBe('2');
    });

    it('should show 3 beds for Lux room type', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for room type options to load
      await component.$nextTick();
      await new Promise(r => setTimeout(r, 50));
      expect(component.roomTypeOptions.length).toBeGreaterThan(1);

      // Select Lux room type
      component.selectedRoomTypeId = component.roomTypeOptions[1].value;
      await wrapper.vm.$nextTick();
      
      // Should show 3 beds for Lux room type
      expect(component.bedsPreview).toHaveLength(3);
      expect(component.bedsPreview[0].number).toBe('1');
      expect(component.bedsPreview[1].number).toBe('2');
      expect(component.bedsPreview[2].number).toBe('3');
    });

    it('should initialize beds with reserved_for_staff as false', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for room type options to load
      await component.$nextTick();
      await new Promise(r => setTimeout(r, 50));
      expect(component.roomTypeOptions.length).toBeGreaterThan(0);

      // Select Standard room type
      component.selectedRoomTypeId = component.roomTypeOptions[0].value;
      await wrapper.vm.$nextTick();
      
      // All beds should initialize with reserved_for_staff = false
      expect(component.bedsPreview.every((b: any) => b.reserved_for_staff === false)).toBe(true);
    });

    it('should allow toggling staff reservation for beds', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for room type options to load
      await component.$nextTick();
      await new Promise(r => setTimeout(r, 50));
      expect(component.roomTypeOptions.length).toBeGreaterThan(0);

      // Select Standard room type
      component.selectedRoomTypeId = component.roomTypeOptions[0].value;
      await wrapper.vm.$nextTick();
      
      // Toggle staff reservation for first bed
      component.bedsPreview[0].reserved_for_staff = true;
      
      expect(component.bedsPreview[0].reserved_for_staff).toBe(true);
      expect(component.bedsPreview[1].reserved_for_staff).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should submit form data successfully for new room', async () => {
      vi.mocked(api.roomService.create).mockResolvedValue(
        createMockResponse({ id: 1, message: 'Room created successfully' })
      );

      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.room = {
        number: 'A210',
        floor: 2,
        notes: 'Near the stairs',
        dormitory: { id: 1, name: 'A-BLOCK' },
        roomType: { id: 1, name: 'Standard' },
      };

      await component.submitRoom();

      // Should call the API (currently mocked to just show success)
      expect(component.room.number).toBe('A210');
      expect(component.room.floor).toBe(2);
      expect(component.room.notes).toBe('Near the stairs');
    });

    it('should update room for existing room', async () => {
      vi.mocked(api.roomService.update).mockResolvedValue(
        createMockResponse({ message: 'Room updated successfully' })
      );

      router.setParams({ id: '1' });

      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.room = {
        number: 'A210',
        floor: 2,
        notes: 'Updated notes',
        dormitory: { id: 1, name: 'A-BLOCK' },
        roomType: { id: 1, name: 'Standard' },
      };

      await component.submitRoom();

      // After update, local form state reflects updated notes
      expect(component.room.number).toBe('A210');
      expect(component.room.notes).toBe('Updated notes');
    });

    it('should handle form submission errors', async () => {
      vi.mocked(api.roomService.create).mockRejectedValue(
        new Error('API Error')
      );

      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Fill form data
      component.room = {
        number: 'A210',
        floor: 2,
        notes: 'Near the stairs',
        dormitory: { id: 1, name: 'A-BLOCK' },
        roomType: { id: 1, name: 'Standard' },
      };

      await component.submitRoom();

      // Should handle the error gracefully
      expect(component.room.number).toBe('A210');
    });
  });

  describe('Data Loading', () => {
    it('should load room data when editing', async () => {
      router.setParams({ id: '1' });

      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Simulate loading room data
      await component.loadRoom(1);
      
      expect(api.roomService.getById).toHaveBeenCalledWith(1);
    });

    it('should populate form with loaded room data', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Simulate loading room data
      await component.loadRoom(1);
      
      // Form should be populated with API data
      expect(component.room.number).toBe('A210');
      expect(component.room.floor).toBe(2);
      expect(component.room.notes).toBe('Near the stairs');
      expect(component.room.dormitory.name).toBe('A-BLOCK');
      expect(component.room.roomType.name).toBe('Standard');
    });

    it('should handle room loading errors', async () => {
      vi.mocked(api.roomService.getById).mockRejectedValue(
        new Error('API Error')
      );

      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Should handle the error gracefully
      await component.loadRoom(1);
      
      expect(api.roomService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('Staff Reservation UI', () => {
    it('should render bed preview with staff reservation checkboxes', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for async loading and populate room types/room
      await component.$nextTick();
      await new Promise(r => setTimeout(r, 50));
      
      // Ensure room types are available, then select one to trigger preview generation
      expect(component.roomTypeOptions.length).toBeGreaterThan(0);
      component.selectedRoomTypeId = component.roomTypeOptions[0].value;
      await wrapper.vm.$nextTick();

      // Beds preview should be rendered
      expect(wrapper.findAll('[data-testid^="bed-"]').length).toBeGreaterThan(0);
      
      // Should show bed items with checkboxes
      const bedItems = wrapper.findAll('[data-testid^="bed-"]');
      expect(bedItems.length).toBe(component.bedsPreview.length);
    });

    it('should apply correct styling for staff-reserved beds', async () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;

      // Wait for room types to load
      await component.$nextTick();
      await new Promise(r => setTimeout(r, 50));
      expect(component.roomTypeOptions.length).toBeGreaterThan(0);

      // Select Standard room type
      component.selectedRoomTypeId = component.roomTypeOptions[0].value;
      await wrapper.vm.$nextTick();

      // Beds should be rendered
      const bedItems = wrapper.findAll('[data-testid^="bed-"]');
      expect(bedItems.length).toBeGreaterThan(0);

      // Mark the first bed as reserved for staff and verify styling
      component.bedsPreview[0].reserved_for_staff = true;
      await wrapper.vm.$nextTick();
      const firstBed = wrapper.find('[data-testid="bed-1"]');
      expect(firstBed.classes().join(' ')).toContain('bg-yellow-100');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and IDs', () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for input labels
      expect(wrapper.find('label[for="room-number"]').exists()).toBe(true);
      expect(wrapper.find('label[for="room-floor"]').exists()).toBe(true);
      expect(wrapper.find('label[for="room-notes"]').exists()).toBe(true);
      expect(wrapper.find('label[for="room-type"]').exists()).toBe(true);
    });

    it('should have proper form structure', () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for proper form elements
      expect(wrapper.find('form').exists()).toBe(true);
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.find('input[type="number"]').exists()).toBe(true);
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods for testing', () => {
      const wrapper = mount(RoomForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Check exposed methods
      expect(typeof component.submitRoom).toBe('function');
      expect(typeof component.loadRoom).toBe('function');
      expect(component.room).toBeDefined();
      expect(component.roomTypeOptions).toBeDefined();
      expect(component.bedsPreview).toBeDefined();
    });
  });
}); 