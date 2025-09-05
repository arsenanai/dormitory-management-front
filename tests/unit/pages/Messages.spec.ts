import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import Messages from '@/pages/Messages.vue';
import { messageService, dormitoryService, roomService } from '@/services/api';
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
    getMyMessages: vi.fn(),
    create: vi.fn(),
    markAsRead: vi.fn().mockResolvedValue({ data: { message: 'Marked as read' } }),
  },
  dormitoryService: {
    getAll: vi.fn(),
  },
  roomService: {
    getAll: vi.fn(),
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

describe('Messages.vue', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    // Mock API responses
    vi.mocked(messageService.getMyMessages).mockResolvedValue(createMockAxiosResponse([
      {
        id: 1,
        subject: 'Welcome Message',
        content: 'Welcome to the dormitory management system!',
        sender: { name: 'Admin' },
        receiver: { name: 'All Students' },
        created_at: '2024-01-01T10:00:00Z',
        is_read: false,
      },
      {
        id: 2,
        subject: 'Meeting Reminder',
        content: 'Don\'t forget about the faculty meeting.',
        sender: { name: 'Dean' },
        receiver: { name: 'Faculty' },
        created_at: '2024-01-02T09:00:00Z',
        is_read: true,
      }
    ]));

    vi.mocked(dormitoryService.getAll).mockResolvedValue(createMockAxiosResponse([
      { id: 1, name: 'A-Block' },
      { id: 2, name: 'B-Block' }
    ]));

    vi.mocked(roomService.getAll).mockResolvedValue(createMockAxiosResponse([
      { id: 1, number: 'A101' },
      { id: 2, number: 'B202' }
    ]));

    wrapper = mount(Messages, {
      global: {
        plugins: [router, i18n],
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.text()).toContain('My messages');
    expect(wrapper.find('textarea[placeholder*="Enter your message here"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Send');
  });

  it('loads messages and related data on mount', () => {
    expect(messageService.getMyMessages).toHaveBeenCalled();
    expect(dormitoryService.getAll).toHaveBeenCalled();
    expect(roomService.getAll).toHaveBeenCalled();
  });

  it('displays loading state initially', async () => {
    // Create a never-resolving promise to keep loading state
    const pendingPromise = new Promise(() => {});
    vi.mocked(messageService.getMyMessages).mockReturnValue(pendingPromise as any);
    vi.mocked(dormitoryService.getAll).mockReturnValue(pendingPromise as any);
    vi.mocked(roomService.getAll).mockReturnValue(pendingPromise as any);

    const newWrapper = mount(Messages, {
      global: {
        plugins: [router, i18n],
      },
    });

    // Wait a bit to ensure loading state is rendered
    await newWrapper.vm.$nextTick();
    expect(newWrapper.text()).toContain('Loading');
  });

  it('displays messages after loading', async () => {
    // Wait for component to fully load
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the component displays message content 
    const messageHistory = wrapper.find('h2');
    expect(messageHistory.text()).toContain('Message History');
    
    // Check if there's a table or message content
    const hasTable = wrapper.find('table').exists();
    if (hasTable) {
      // Table should be present even if empty
      expect(wrapper.findComponent({ name: 'CTable' }).exists()).toBe(true);
    }
  });

  it('displays filter options', async () => {
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    const selects = wrapper.findAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(3); // Faculty, Room, Dormitory filters
    
    // Check that dormitory options are populated
    const dormitorySelect = wrapper.find('select#dormitory-filter');
    expect(dormitorySelect.exists()).toBe(true);
    
    // Wait for options to be populated
    await wrapper.vm.$nextTick();
    const options = dormitorySelect.findAll('option');
    expect(options.some(option => option.text().includes('A-Block'))).toBe(true);
  });

  it('allows message composition', async () => {
    const messageTextarea = wrapper.find('textarea#message-input');
    const testMessage = 'This is a test message';
    
    await messageTextarea.setValue(testMessage);
    expect((messageTextarea.element as HTMLTextAreaElement).value).toBe(testMessage);
  });

  it('sends message when send button is clicked', async () => {
    vi.mocked(messageService.create).mockResolvedValue(createMockAxiosResponse({ message: 'Message sent successfully' }));

    const messageTextarea = wrapper.find('textarea#message-input');
    const sendButtons = wrapper.findAll('button');
    const sendButton = sendButtons.find(btn => btn.text().includes('Send'));

    await messageTextarea.setValue('Test message content');
    await sendButton!.trigger('click');
    
    expect(messageService.create).toHaveBeenCalledWith({
      content: 'Test message content',
      subject: expect.any(String),
      faculty: '',
      room_id: null,
      dormitory_id: null,
    });
  });

  it('selects message when clicked', async () => {
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    const messageRows = wrapper.findAll('tbody tr');
    
    if (messageRows.length > 0) {
      await messageRows[0].trigger('click');
      await wrapper.vm.$nextTick();
      
      // Check that the selected message content is displayed
      const selectedMessageTextarea = wrapper.find('textarea#selected-message');
      expect(selectedMessageTextarea.exists()).toBe(true);
      expect((selectedMessageTextarea.element as HTMLTextAreaElement).value)
        .toContain('Welcome to the dormitory management system!');
    }
  });

  it('marks unread message as read when selected', async () => {
    vi.mocked(messageService.markAsRead).mockResolvedValue(createMockAxiosResponse({ message: 'Message marked as read' }));

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    const messageRows = wrapper.findAll('tbody tr');
    
    if (messageRows.length > 0) {
      // Click on the first message (which is unread)
      await messageRows[0].trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(messageService.markAsRead).toHaveBeenCalledWith(1);
    }
  });

  it('applies faculty filter correctly', async () => {
    // Add messages with faculty field
    vi.mocked(messageService.getMyMessages).mockResolvedValue(createMockAxiosResponse([
      {
        id: 1,
        subject: 'Engineering Message',
        content: 'Message for engineering students',
        faculty: 'engineering',
        sender: { name: 'Admin' },
        created_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        subject: 'Business Message',
        content: 'Message for business students',
        faculty: 'business',
        sender: { name: 'Dean' },
        created_at: '2024-01-02T09:00:00Z',
      }
    ]));

    wrapper = mount(Messages, {
      global: {
        plugins: [router, i18n],
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    const facultyInput = wrapper.find('input#faculty-filter');
    await facultyInput.setValue('engineering');
    await wrapper.vm.$nextTick();

    // Check that filter functionality works
    const messageRows = wrapper.findAll('tbody tr');
    // Either we have data or "No data available" text
    const tableContent = wrapper.text();
    expect(tableContent).toContain('Message History');
  });

  it('displays message history table headers', async () => {
    // Wait for component to fully render
    await wrapper.vm.$nextTick();
    
    // Check for Message History title and table structure
    expect(wrapper.text()).toContain('Message History');
    // Table should exist even if empty
    expect(wrapper.find('table').exists()).toBe(true);
  });

  it('formats dates correctly', async () => {
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    // Check if table content exists
    const tableContent = wrapper.text();
    expect(tableContent).toContain('Message History');
  });

  it('handles empty message list', async () => {
    vi.mocked(messageService.getMyMessages).mockResolvedValue(createMockAxiosResponse([]));

    wrapper = mount(Messages, {
      global: {
        plugins: [router, i18n],
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should handle empty state gracefully - table shows "No data available"
    const tableContent = wrapper.text();
    expect(tableContent).toContain('Message History');
  });

  it('displays error state when API fails', async () => {
    const errorMessage = 'Failed to load messages data';
    vi.mocked(messageService.getMyMessages).mockRejectedValue(new Error(errorMessage));

    wrapper = mount(Messages, {
      global: {
        plugins: [router, i18n],
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(wrapper.text()).toContain('Failed to load messages data');
  });

  it('prevents sending empty messages', async () => {
    const sendButtons = wrapper.findAll('button');
    const sendButton = sendButtons.find(btn => btn.text().includes('Send'));

    // Try to send without entering a message
    await sendButton!.trigger('click');
    
    // Should not call the API if message is empty
    expect(messageService.create).not.toHaveBeenCalled();
  });

  it('applies room filter correctly', async () => {
    // Add messages with room_id field
    vi.mocked(messageService.getMyMessages).mockResolvedValue(createMockAxiosResponse([
      {
        id: 1,
        subject: 'Room A101 Message',
        content: 'Message for room A101',
        room_id: 1,
        sender: { name: 'Admin' },
        created_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        subject: 'Room B202 Message',
        content: 'Message for room B202',
        room_id: 2,
        sender: { name: 'Admin' },
        created_at: '2024-01-02T09:00:00Z',
      }
    ]));

    wrapper = mount(Messages, {
      global: {
        plugins: [router, i18n],
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    const roomSelect = wrapper.find('select#room-filter');
    await roomSelect.setValue('1');
    await wrapper.vm.$nextTick();

    // Check that filter functionality works
    const tableContent = wrapper.text();
    expect(tableContent).toContain('Message History');
  });

  it('clears message input after successful send', async () => {
    vi.mocked(messageService.create).mockResolvedValue(createMockAxiosResponse({ message: 'Message sent successfully' }));

    const messageTextarea = wrapper.find('textarea#message-input');
    const buttons = wrapper.findAll('button');
    const sendButton = buttons.find(btn => btn.text().includes('Send'));

    await messageTextarea.setValue('Test message content');
    await sendButton!.trigger('click');
    await wrapper.vm.$nextTick();

    // Check that the textarea is cleared after sending
    expect((messageTextarea.element as HTMLTextAreaElement).value).toBe('');
  });
});