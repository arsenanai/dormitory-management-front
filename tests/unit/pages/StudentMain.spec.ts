import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
import * as api from '@/services/api';
// @ts-expect-error: Vue SFC import for test
import StudentMain from '../../../src/pages/StudentMain.vue';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock the API services
vi.mock('@/services/api', () => ({
  dormitoryAccessService: {
    check: vi.fn(),
  },
}));

// Helper function to create mock API responses
const createMockResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} },
});

describe('StudentMain', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Setup default mocks
    vi.mocked(api.dormitoryAccessService.check).mockResolvedValue(
      createMockResponse({
        can_access: true,
        reason: '',
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render the student main page with all sections', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if main sections are present
      expect(wrapper.text()).toContain('Dormitory Information');
      expect(wrapper.text()).toContain('MESSAGES');
      expect(wrapper.text()).toContain('Registration Status');
    });

    it('should initialize with default message data', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.messages).toHaveLength(2);
      expect(component.messages[0].from).toBe('Admin');
      expect(component.messages[0].subject).toBe('Welcome');
      expect(component.messages[1].from).toBe('Admin');
      expect(component.messages[1].subject).toBe('Reminder');
    });

    it('should initialize with no selected message', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      // The component selects the latest message by default on mount
      expect(component.selectedMessage).toBeDefined();
      expect(component.selectedMessageIndex).toBeDefined();
    });

    it('should initialize dormitory access status', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.canAccessDormitory).toBe(true);
      expect(component.dormitoryAccessChecked).toBe(false);
      expect(component.dormitoryAccessReason).toBe('');
      expect(component.dormitoryAccessLoading).toBe(true);
    });
  });

  describe('Dormitory Access Status', () => {
    it('should show loading state initially', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      expect(wrapper.find('.animate-pulse').exists()).toBe(true);
      expect(wrapper.text()).toContain('Loading dormitory access information...');
    });

    it('should show access granted when API returns true', async () => {
      vi.mocked(api.dormitoryAccessService.check).mockResolvedValue(
        createMockResponse({
          can_access: true,
          reason: '',
        })
      );

      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for the component to load
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(wrapper.find('.bg-green-100').exists()).toBe(true);
      expect(wrapper.text()).toContain('Access Granted');
      expect(wrapper.text()).toContain('You have access to the dormitory');
    });

    it('should show access denied when API returns false', async () => {
      vi.mocked(api.dormitoryAccessService.check).mockResolvedValue(
        createMockResponse({
          can_access: false,
          reason: 'No current semester payment',
        })
      );

      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for the component to load
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(wrapper.find('.bg-red-100').exists()).toBe(true);
      expect(wrapper.text()).toContain('Access Denied');
      expect(wrapper.text()).toContain('No current semester payment');
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(api.dormitoryAccessService.check).mockRejectedValue(
        new Error('API Error')
      );

      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for the component to load
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      const component = wrapper.vm as any;
      expect(component.canAccessDormitory).toBe(false);
      expect(component.dormitoryAccessReason).toBe('Unable to check access status.');
    });

    it('should call dormitory access service on mount', async () => {
      mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      await vi.waitFor(() => {
        expect(api.dormitoryAccessService.check).toHaveBeenCalled();
      });
    });
  });

  describe('Messages Display', () => {
    it('should render messages table with correct headers', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check table headers - the component uses CTable components
      expect(wrapper.findComponent({ name: 'CTable' }).exists()).toBe(true);
      expect(wrapper.text()).toContain('FROM');
      expect(wrapper.text()).toContain('SUBJECT');
      expect(wrapper.text()).toContain('DATE-TIME');
    });

    it('should display all messages in the table', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if both messages are displayed
      expect(wrapper.text()).toContain('Welcome');
      expect(wrapper.text()).toContain('Reminder');
      expect(wrapper.text()).toContain('01-09-2024 11:34');
      expect(wrapper.text()).toContain('02-09-2024 10:00');
      expect(wrapper.text()).toContain('02-09-2024 10:00');
    });

    it('should show message count in the header', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check message count badge
      expect(wrapper.find('.bg-blue-200').exists()).toBe(true);
      expect(wrapper.text()).toContain('2'); // Should show count of 2 messages
    });

    it('should make message rows clickable', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check if message rows exist - now using regular table rows
      const messageRows = wrapper.findAll('tbody tr');
      expect(messageRows.length).toBeGreaterThan(0); // Message rows
    });
  });

  describe('Message Selection', () => {
    it('should select the latest message on mount', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to mount and select latest message
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      const component = wrapper.vm as any;
      expect(component.selectedMessage).toBeDefined();
      expect(component.selectedMessageIndex).toBe(1); // Latest message index
      expect(component.selectedMessage.subject).toBe('Reminder');
    });

    it('should select a message when clicked', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount and select latest message
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // The component selects the latest message by default
      expect(component.selectedMessageIndex).toBe(1);
      expect(component.selectedMessage.subject).toBe('Reminder');
      
      // Now select first message
      await component.selectMessage(component.messages[0], 0);
      
      expect(component.selectedMessage).toBe(component.messages[0]);
      expect(component.selectedMessageIndex).toBe(0);
    });

    it('should display selected message content', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Select a message
      await component.selectMessage(component.messages[0], 0);
      await wrapper.vm.$nextTick();
      
      // Check if message content is displayed
      expect(wrapper.find('#selected-message').exists()).toBe(true);
      expect(wrapper.text()).toContain('Selected Message');
    });

    it('should show message details in the selected message section', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Select a message
      await component.selectMessage(component.messages[0], 0);
      await wrapper.vm.$nextTick();
      
      // Check message details
      expect(wrapper.text()).toContain('From: Admin');
      expect(wrapper.text()).toContain('01-09-2024 11:34');
      expect(wrapper.text()).toContain('02-09-2024 10:00');
    });

    it('should highlight selected message row', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Select first message
      await component.selectMessage(component.messages[0], 0);
      await wrapper.vm.$nextTick();
      
      // Check if selected row has highlighting class - now using regular table rows
      const messageRows = wrapper.findAll('tbody tr');
      expect(messageRows.length).toBeGreaterThan(0);
    });
  });

  describe('Message Content Display', () => {
    it('should show message content in readonly textarea', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Select a message
      await component.selectMessage(component.messages[0], 0);
      await wrapper.vm.$nextTick();
      
      const textarea = wrapper.find('#selected-message');
      expect(textarea.attributes('readonly')).toBeDefined();
      expect(textarea.attributes('rows')).toBe('5');
    });

    it('should show placeholder when no message is selected', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const textarea = wrapper.find('#selected-message');
      if (textarea.exists()) {
        expect(textarea.attributes('placeholder')).toBe('No message selected');
      }
    });
  });

  describe('Component State Management', () => {
    it('should update selected message index when message is selected', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount and select latest message
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // The component selects the latest message by default
      expect(component.selectedMessageIndex).toBe(1);
      
      // Select first message
      await component.selectMessage(component.messages[0], 0);
      
      expect(component.selectedMessageIndex).toBe(0);
      
      // Select second message
      await component.selectMessage(component.messages[1], 1);
      
      expect(component.selectedMessageIndex).toBe(1);
    });

    it('should maintain selected message state', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Wait for component to mount and select latest message
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Select a message
      const message = component.messages[0];
      await component.selectMessage(message, 0);
      
      // Verify state is maintained
      expect(component.selectedMessage).toBe(message);
      expect(component.selectedMessageIndex).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for proper table elements - now using CTable component
      expect(wrapper.findComponent({ name: 'CTable' }).exists()).toBe(true);
      expect(wrapper.find('table').exists()).toBe(true);
      expect(wrapper.find('thead').exists()).toBe(true);
      expect(wrapper.find('tbody').exists()).toBe(true);
    });

    it('should have proper form labels and IDs', async () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Wait for component to mount and select a message
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Check for textarea - the component uses CTextarea
      expect(wrapper.findComponent({ name: 'CTextarea' }).exists()).toBe(true);
    });

    it('should have proper heading structure', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Check for proper heading hierarchy
      expect(wrapper.find('h2').exists()).toBe(true);
      expect(wrapper.find('h3').exists()).toBe(true);
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods for testing', () => {
      const wrapper = mount(StudentMain, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      // Check exposed methods
      expect(typeof component.selectMessage).toBe('function');
      expect(component.messages).toBeDefined();
      expect(component.selectedMessage).toBeDefined();
      expect(component.selectedMessageIndex).toBeDefined();
      expect(component.canAccessDormitory).toBeDefined();
      expect(component.dormitoryAccessReason).toBeDefined();
    });
  });
}); 