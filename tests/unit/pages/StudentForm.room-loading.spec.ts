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

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      id: 1,
      name: 'Admin User',
      email: 'admin@email.com',
      role: { name: 'admin' },
      admin_profile: {
        dormitory_id: 3,
        office_phone: '+1234567890'
      }
    },
    isAuthenticated: true,
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

// Mock dormitory data
const mockDormitories = [
  {
    id: 1,
    name: 'A-Block',
    rooms: [
      { id: 1, number: 'A101', beds: [{ id: 1, number: 1, reserved_for_staff: false }] },
      { id: 2, number: 'A102', beds: [{ id: 2, number: 2, reserved_for_staff: false }] },
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
  {
    id: 3,
    name: 'A Block',
    rooms: [
      { id: 5, number: '139', beds: [{ id: 5, number: 1, is_occupied: false, reserved_for_staff: false }] },
      { id: 6, number: '140', beds: [{ id: 6, number: 1, is_occupied: false, reserved_for_staff: false }] },
    ],
  },
];

// Mock rooms data for dormitory 3
const mockRoomsForDormitory3 = [
  {
    id: 5,
    number: '139',
    floor: 1,
    notes: 'Test room',
    dormitory_id: 3,
    room_type_id: 1,
    quota: 2,
    room_type: {
      id: 1,
      name: 'standard',
      capacity: 2,
      price: 150.00
    },
    beds: [
      {
        id: 5,
        room_id: 5,
        bed_number: 1,
        is_occupied: false,
        reserved_for_staff: false
      },
      {
        id: 6,
        room_id: 5,
        bed_number: 2,
        is_occupied: false,
        reserved_for_staff: false
      }
    ]
  },
  {
    id: 6,
    number: '140',
    floor: 1,
    notes: 'Test room 2',
    dormitory_id: 3,
    room_type_id: 1,
    quota: 1,
    room_type: {
      id: 1,
      name: 'standard',
      capacity: 2,
      price: 150.00
    },
    beds: [
      {
        id: 7,
        room_id: 6,
        bed_number: 1,
        is_occupied: false,
        reserved_for_staff: false
      }
    ]
  }
];

describe('StudentForm - Room Loading Functionality', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.dormitoryService.getAll).mockResolvedValue(
      createMockResponse(mockDormitories)
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
        },
      })
    );

    // Mock global fetch for the rooms API call
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Dormitory Preset', () => {
    it('should preset dormitory for admin users', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount and initialize
      await wrapper.vm.$nextTick();
      
      // Check if dormitory is preset for admin
      expect(component.selectedDormitory).toBe(3);
    });

    it('should fetch rooms when dormitory is preset for admin', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount and initialize
      await wrapper.vm.$nextTick();
      
      // Wait a bit more for the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if rooms are fetched and populated
      expect(component.rooms).toHaveLength(2);
      expect(component.rooms[0].number).toBe('139');
      expect(component.rooms[1].number).toBe('140');
    });
  });

  describe('fetchRoomsForDormitory Function', () => {
    it('should fetch rooms from the correct API endpoint', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Call the function directly
      await component.fetchRoomsForDormitory(3);
      
      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith('/api/dormitories/3/rooms');
    });

    it('should handle successful API response and populate rooms', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Call the function directly
      await component.fetchRoomsForDormitory(3);
      
      // Check if rooms are populated
      expect(component.rooms).toHaveLength(2);
      expect(component.rooms[0].number).toBe('139');
      expect(component.rooms[1].number).toBe('140');
      
      // Check if beds are flattened correctly
      expect(component.allBeds).toHaveLength(3); // 2 beds in room 139 + 1 bed in room 140
    });

    it('should handle API error gracefully', async () => {
      // Mock failed API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Call the function directly
      await component.fetchRoomsForDormitory(3);
      
      // Check if rooms are cleared on error
      expect(component.rooms).toHaveLength(0);
      expect(component.allBeds).toHaveLength(0);
    });

    it('should set loading state correctly', async () => {
      // Mock delayed API response
      vi.mocked(global.fetch as any).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve(mockRoomsForDormitory3)
          }), 100)
        )
      );

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Start the function call
      const fetchPromise = component.fetchRoomsForDormitory(3);
      
      // Check if loading is set to true
      expect(component.loadingRooms).toBe(true);
      
      // Wait for completion
      await fetchPromise;
      
      // Check if loading is set to false
      expect(component.loadingRooms).toBe(false);
    });
  });

  describe('Room Options Computation', () => {
    it('should compute room options correctly when rooms are loaded', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Load rooms first
      await component.fetchRoomsForDormitory(3);
      
      // Check room options
      const roomOptions = component.roomOptions;
      expect(roomOptions).toHaveLength(2);
      expect(roomOptions[0].value).toBe(5);
      expect(roomOptions[0].name).toBe('139');
      expect(roomOptions[1].value).toBe(6);
      expect(roomOptions[1].name).toBe('140');
    });

    it('should return empty room options when no rooms are loaded', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Ensure no rooms are loaded
      component.rooms = [];
      
      // Check room options
      const roomOptions = component.roomOptions;
      expect(roomOptions).toHaveLength(0);
    });
  });

  describe('Bed Options Computation', () => {
    it('should compute bed options correctly for selected room', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Load rooms first
      await component.fetchRoomsForDormitory(3);
      
      // Set a room
      component.studentProfile.room_id = 5; // Room 139
      
      // Check bed options
      const bedOptions = component.bedOptions;
      expect(bedOptions).toHaveLength(2);
      expect(bedOptions[0].value).toBe(5);
      expect(bedOptions[0].name).toBe('Bed 1');
      expect(bedOptions[1].value).toBe(6);
      expect(bedOptions[1].name).toBe('Bed 2');
    });

    it('should filter out staff reserved beds', async () => {
      // Mock rooms with staff reserved beds
      const mockRoomsWithStaffBeds = [
        {
          id: 7,
          number: '141',
          dormitory_id: 3,
          room_type_id: 1,
          quota: 2,
          room_type: { id: 1, name: 'standard', capacity: 2, price: 150.00 },
          beds: [
            {
              id: 8,
              room_id: 7,
              bed_number: 1,
              is_occupied: false,
              reserved_for_staff: false
            },
            {
              id: 9,
              room_id: 7,
              bed_number: 2,
              is_occupied: false,
              reserved_for_staff: true // Staff reserved
            }
          ]
        }
      ];

      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsWithStaffBeds)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Load rooms first
      await component.fetchRoomsForDormitory(3);
      
      // Set a room
      component.studentProfile.room_id = 7; // Room 141
      
      // Check bed options - should only show non-staff reserved beds
      const bedOptions = component.bedOptions;
      expect(bedOptions).toHaveLength(1);
      expect(bedOptions[0].value).toBe(8);
      expect(bedOptions[0].name).toBe('Bed 1');
    });

    it('should return empty bed options when no room is selected', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Ensure no room is selected
      component.studentProfile.room_id = null;
      
      // Check bed options
      const bedOptions = component.bedOptions;
      expect(bedOptions).toHaveLength(0);
    });
  });

  describe('Watch Functions', () => {
    it('should fetch rooms when selectedDormitory changes', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount
      await wrapper.vm.$nextTick();
      
      // Clear rooms first
      component.rooms = [];
      component.allBeds = [];
      
      // Change dormitory
      component.selectedDormitory = 2;
      
      // Wait for watcher to trigger
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if rooms were fetched
      expect(global.fetch).toHaveBeenCalledWith('/api/dormitories/2/rooms');
    });

    it('should reset room and bed when dormitory changes', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount
      await wrapper.vm.$nextTick();
      
      // Set initial values
      component.studentProfile.room_id = 5;
      component.studentProfile.bed = 'Bed 1';
      component.studentProfile.bed_id = 5;
      
      // Change dormitory
      component.selectedDormitory = 2;
      
      // Wait for watcher to trigger
      await wrapper.vm.$nextTick();
      
      // Check if room and bed are reset
      expect(component.studentProfile.room_id).toBe(null);
      expect(component.studentProfile.bed).toBe(null);
      expect(component.studentProfile.bed_id).toBe(null);
    });

    it('should reset bed when room changes', async () => {
      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount
      await wrapper.vm.$nextTick();
      
      // Set initial values using reactive assignment
      component.studentProfile.room_id = 5;
      component.studentProfile.bed = 'Bed 1';
      component.studentProfile.bed_id = 5;
      
      // Wait for the first change to settle
      await wrapper.vm.$nextTick();
      
      // Change room using reactive assignment
      component.studentProfile.room_id = 6;
      
      // Wait for watcher to trigger
      await wrapper.vm.$nextTick();
      
      // Bed should be reset when room changes
      expect(component.studentProfile.bed).toBe(null);
      expect(component.studentProfile.bed_id).toBe(null);
    });
  });

  describe('Integration Tests', () => {
    it('should load rooms and enable room selection for admin users', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount and initialize
      await wrapper.vm.$nextTick();
      
      // Wait a bit more for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if dormitory is preset
      expect(component.selectedDormitory).toBe(3);
      
      // Check if rooms are loaded
      expect(component.rooms).toHaveLength(2);
      
      // Check if room options are available
      const roomOptions = component.roomOptions;
      expect(roomOptions).toHaveLength(2);
      
      // Check if room field should be enabled
      expect(component.loadingRooms).toBe(false);
      expect(roomOptions.length).toBeGreaterThan(0);
    });

    it('should handle the complete flow: dormitory preset → rooms load → room selection → bed selection', async () => {
      // Mock successful API response
      vi.mocked(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoomsForDormitory3)
      });

      const wrapper = mount(StudentForm, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount and initialize
      await wrapper.vm.$nextTick();
      
      // Wait a bit more for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 1: Check dormitory preset
      expect(component.selectedDormitory).toBe(3);
      
      // Step 2: Check rooms loaded
      expect(component.rooms).toHaveLength(2);
      
      // Step 3: Select a room
      component.studentProfile.room_id = 5; // Room 139
      await wrapper.vm.$nextTick();
      
      // Step 4: Check bed options for selected room
      const bedOptions = component.bedOptions;
      expect(bedOptions).toHaveLength(2);
      
      // Step 5: Select a bed
      component.studentProfile.bed_id = 5; // Bed 1
      await wrapper.vm.$nextTick();
      
      // Verify final state
      expect(component.selectedDormitory).toBe(3);
      expect(component.studentProfile.room_id).toBe(5);
      expect(component.studentProfile.bed_id).toBe(5);
    });
  });
});
