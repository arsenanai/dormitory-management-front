import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import Messages from '@/pages/Messages.vue';
import { messageService, roomService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import i18n from '@/i18n';
import type { ApiResponse } from '@/services/api';

// Helper function to create a mock ApiResponse
function createMockAxiosResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    message: 'Success',
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  };
}

// Mock the API services
vi.mock('@/services/api', () => ({
  messageService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  roomService: {
    getAll: vi.fn(),
    getByDormitory: vi.fn(),
  },
}));

// Configure vue-router-mock
const router = createRouterMock({
  spy: {
    create: vi.fn,
    reset: vi.fn,
  },
});
injectRouterMock(router);

describe('Messages.vue - Admin Room Selection', () => {
  let wrapper: ReturnType<typeof mount>;
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    // Mock API responses
    vi.mocked(messageService.getAll).mockResolvedValue(createMockAxiosResponse({
      data: [
        {
          id: 1,
          title: 'Welcome Message',
          content: 'Welcome to the dormitory management system!',
          recipient_type: 'all',
          created_at: '2024-01-01T10:00:00Z',
        }
      ],
      total: 1,
      current_page: 1,
      per_page: 10
    }));

    // Mock roomService.getAll for non-admin users or admin without dormitory_id
    vi.mocked(roomService.getAll).mockResolvedValue(createMockAxiosResponse({
      data: [
        { id: 1, number: 'A101', dormitory_id: 1 },
        { id: 2, number: 'A102', dormitory_id: 1 },
        { id: 3, number: 'B201', dormitory_id: 2 },
        { id: 4, number: 'B202', dormitory_id: 2 }
      ],
      total: 4,
      current_page: 1,
      per_page: 15
    }));

    // Mock roomService.getByDormitory for admin users with dormitory_id
    vi.mocked(roomService.getByDormitory).mockResolvedValue(createMockAxiosResponse([
      { id: 1, number: 'A101', dormitory_id: 1 },
      { id: 2, number: 'A102', dormitory_id: 1 }
    ]));

    wrapper = mount(Messages, {
      global: {
        plugins: [router, i18n],
      },
    });

    authStore = useAuthStore();
    
    // Set up auth store with token to trigger data loading
    authStore.token = 'test-token';
    localStorage.setItem('token', 'test-token');
  });

  describe('Admin with assigned dormitory', () => {
    beforeEach(async () => {
      // Mock admin user with assigned dormitory
      authStore.user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: { name: 'admin' },
        adminProfile: {
          id: 1,
          user_id: 1,
          dormitory_id: 1,
          office_phone: '123-456-7890'
        }
      } as any;
      
      // Ensure token is set in localStorage before mounting
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(authStore.user));
      
      // Re-mount component after setting user data
      wrapper = mount(Messages, {
        global: {
          plugins: [router, i18n],
        },
      });
      
      // Wait for component to load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should filter room options to only show rooms from admin\'s assigned dormitory', async () => {
      // Debug: Check if rooms data is loaded
      console.log('Rooms data in component:', wrapper.vm.rooms);
      console.log('User data in component:', wrapper.vm.authStore?.user);
      console.log('Admin dormitory ID:', wrapper.vm.authStore?.user?.adminProfile?.dormitory_id);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      console.log('User in localStorage:', localStorage.getItem('user'));
      console.log('Room service calls:', vi.mocked(roomService.getAll).mock.calls.length);
      console.log('Room service getByDormitory calls:', vi.mocked(roomService.getByDormitory).mock.calls.length);
      
      // Open create message modal
      const addButton = wrapper.find('[data-testid="add-message-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Select "Specific Room" as recipient type
      const recipientTypeSelect = wrapper.find('[data-testid="recipient-type-select"] select');
      if (recipientTypeSelect.exists()) {
        await recipientTypeSelect.setValue('room');
      }
      await wrapper.vm.$nextTick();

      // Check that room select is visible
      const roomSelect = wrapper.find('[data-testid="room-select"]');
      expect(roomSelect.exists()).toBe(true);

      // Get room options from the select element
      const roomSelectElement = wrapper.find('[data-testid="room-select"] select');
      const roomOptions = roomSelectElement.findAll('option');
      const roomOptionTexts = roomOptions.map(option => option.text());

      // Should only show rooms from dormitory_id = 1 (admin's assigned dormitory)
      expect(roomOptionTexts).toContain('All Rooms');
      expect(roomOptionTexts).toContain('A101');
      expect(roomOptionTexts).toContain('A102');
      expect(roomOptionTexts).not.toContain('B201');
      expect(roomOptionTexts).not.toContain('B202');
    });

    it('should include admin\'s dormitory_id when creating message', async () => {
      vi.mocked(messageService.create).mockResolvedValue(createMockAxiosResponse({
        id: 1,
        title: 'Test Message',
        content: 'Test content'
      }));

      // Open create message modal
      const addButton = wrapper.find('[data-testid="add-message-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Fill form
      const titleInput = wrapper.find('[data-testid="message-title-input"] input');
      const contentInput = wrapper.find('[data-testid="message-content-input"] textarea');
      if (titleInput.exists()) await titleInput.setValue('Test Message');
      if (contentInput.exists()) await contentInput.setValue('Test content');
      await wrapper.vm.$nextTick();

      // Submit form
      const submitButton = wrapper.find('[data-testid="submit-message-button"]');
      if (submitButton.exists()) {
        await submitButton.trigger('click');
      }
      await wrapper.vm.$nextTick();

      // Verify that dormitory_id and basic fields are included in the request
      expect(messageService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Message',
          content: 'Test content',
          dormitory_id: 1,
        })
      );
    });

    it('should allow selecting specific room when recipient_type is room', async () => {
      // Open create message modal
      const addButton = wrapper.find('[data-testid="add-message-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Select "Specific Room" as recipient type
      const recipientTypeSelect = wrapper.find('[data-testid="recipient-type-select"] select');
      if (recipientTypeSelect.exists()) {
        await recipientTypeSelect.setValue('room');
      }
      await wrapper.vm.$nextTick();

      // Select a specific room
      const roomSelect = wrapper.find('[data-testid="room-select"] select');
      if (roomSelect.exists()) {
        await roomSelect.setValue('1'); // Select room A101
      }
      await wrapper.vm.$nextTick();

      // Fill other form fields
      const titleInput2 = wrapper.find('[data-testid="message-title-input"] input');
      const contentInput2 = wrapper.find('[data-testid="message-content-input"] textarea');
      if (titleInput2.exists()) await titleInput2.setValue('Room Specific Message');
      if (contentInput2.exists()) await contentInput2.setValue('This message is for room A101');
      await wrapper.vm.$nextTick();

      // Submit form
      const submitButton2 = wrapper.find('[data-testid="submit-message-button"]');
      if (submitButton2.exists()) {
        await submitButton2.trigger('click');
      }
      await wrapper.vm.$nextTick();

      // Verify that room_id and dormitory_id are included in the request
      expect(messageService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Room Specific Message',
          content: 'This message is for room A101',
          dormitory_id: 1,
          room_id: '1'
        })
      );
    });
  });

  describe('Admin without assigned dormitory', () => {
    beforeEach(async () => {
      // Mock admin user without assigned dormitory
      authStore.user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: { name: 'admin' },
        adminProfile: {
          id: 1,
          user_id: 1,
          dormitory_id: null,
          office_phone: '123-456-7890'
        }
      } as any;
      
      // Mock empty rooms response for admin without dormitory_id
      vi.mocked(roomService.getAll).mockResolvedValue(createMockAxiosResponse({
        data: [],
        total: 0,
        current_page: 1,
        per_page: 15
      }));
      
      // Ensure token is set in localStorage before mounting
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(authStore.user));
      
      // Re-mount component after setting user data
      wrapper = mount(Messages, {
        global: {
          plugins: [router, i18n],
        },
      });
      
      // Wait for component to load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should show only "All Rooms" option when admin has no assigned dormitory', async () => {
      // For admin without dormitory_id, should use getAll which returns all rooms
      // but the backend should filter them based on role
      expect(roomService.getAll).toHaveBeenCalled();
      
      // Open create message modal
      const addButton = wrapper.find('[data-testid="add-message-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Select "Specific Room" as recipient type
      const recipientTypeSelect = wrapper.find('[data-testid="recipient-type-select"] select');
      await recipientTypeSelect.setValue('room');
      await wrapper.vm.$nextTick();

      // Check that room select is visible
      const roomSelect = wrapper.find('[data-testid="room-select"]');
      expect(roomSelect.exists()).toBe(true);

      // Get room options from the select element
      const roomSelectElement = wrapper.find('[data-testid="room-select"] select');
      const roomOptions = roomSelectElement.findAll('option');
      const roomOptionTexts = roomOptions.map(option => option.text());

      // Should only show "All Rooms" option since admin has no dormitory assignment
      expect(roomOptionTexts).toEqual(['All Rooms']);
    });
  });

  describe('Non-admin user', () => {
    beforeEach(async () => {
      // Mock student user
      authStore.user = {
        id: 2,
        name: 'Student User',
        email: 'student@example.com',
        role: { name: 'student' }
      } as any;
      
      // Ensure token is set in localStorage before mounting
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(authStore.user));
      
      // Re-mount component after setting user data
      wrapper = mount(Messages, {
        global: {
          plugins: [router, i18n],
        },
      });
      
      // Wait for component to load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should not show add message button for non-admin users', async () => {
      const addButton = wrapper.find('[data-testid="add-message-button"]');
      expect(addButton.exists()).toBe(false);
    });
  });

  describe('Room data loading', () => {
    beforeEach(async () => {
      // Mock admin user with assigned dormitory
      authStore.user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: { name: 'admin' },
        adminProfile: {
          id: 1,
          user_id: 1,
          dormitory_id: 1,
          office_phone: '123-456-7890'
        }
      } as any;
      
      // Ensure token is set in localStorage before mounting
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(authStore.user));
      
      // Re-mount component after setting user data
      wrapper = mount(Messages, {
        global: {
          plugins: [router, i18n],
        },
      });
      
      // Wait for component to load data
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should load rooms data on component mount', async () => {
      expect(roomService.getByDormitory).toHaveBeenCalledWith(1);
    });

    it('should handle empty rooms data gracefully', async () => {
      // Mock empty rooms response for getByDormitory (since user has dormitory_id)
      vi.mocked(roomService.getByDormitory).mockResolvedValue(createMockAxiosResponse([]));

      const newWrapper = mount(Messages, {
        global: {
          plugins: [router, i18n],
        },
      });

      await newWrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not throw error and should show only "All Rooms" option
      const addButton = newWrapper.find('[data-testid="add-message-button"]');
      await addButton.trigger('click');
      await newWrapper.vm.$nextTick();

      const recipientTypeSelect = newWrapper.find('[data-testid="recipient-type-select"] select');
      await recipientTypeSelect.setValue('room');
      await newWrapper.vm.$nextTick();

      const roomSelect = newWrapper.find('[data-testid="room-select"] select');
      const roomOptions = roomSelect.findAll('option');
      const roomOptionTexts = roomOptions.map(option => option.text());

      expect(roomOptionTexts).toEqual(['All Rooms']);
    });
  });
});
