import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import StudentMain from '@/pages/StudentMain.vue'
import { messageService } from '@/services/api'

// Mock the API services
vi.mock('@/services/api', () => ({
  messageService: {
    getMyMessages: vi.fn()
  },
  dormitoryAccessService: {
    check: vi.fn().mockResolvedValue({
      data: { can_access: true, reason: '' }
    })
  },
  dashboardService: {
    getStudentStats: vi.fn().mockResolvedValue({
      data: {
        my_messages: 0,
        unread_messages_count: 0,
        my_payments: 0,
        upcoming_payments: 0,
        payment_history: 0,
        room_info: null,
        messages: []
      }
    })
  }
}))

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { role: { name: 'student' } },
    isAuthenticated: true
  })
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'Student\'s page': 'Student\'s page',
      'Recent Admin Messages': 'Recent Admin Messages',
      'Loading recent messages...': 'Loading recent messages...',
      'No recent messages from administrators': 'No recent messages from administrators',
      'Message': 'Message',
      'Sent': 'Sent'
    }
  }
})

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/student',
      name: 'StudentMain',
      component: StudentMain
    }
  ]
})

describe('StudentMain.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and display recent admin messages', async () => {
    // Mock the API response
    const mockMessages = [
      {
        id: 1,
        title: 'Test Message 1',
        content: 'This is a test message',
        sent_at: '2024-01-01T10:00:00Z',
        sender: { name: 'Admin' }
      },
      {
        id: 2,
        title: 'Test Message 2',
        content: 'This is another test message',
        sent_at: '2024-01-02T10:00:00Z',
        sender: { name: 'Admin' }
      },
      {
        id: 3,
        title: 'Test Message 3',
        content: 'This is the third test message',
        sent_at: '2024-01-03T10:00:00Z',
        sender: { name: 'Admin' }
      }
    ]

    messageService.getMyMessages.mockResolvedValue({
      data: {
        data: mockMessages,
        current_page: 1,
        last_page: 1,
        per_page: 3,
        total: 3
      }
    })

    const wrapper = mount(StudentMain, {
      global: {
        plugins: [i18n, router],
        stubs: {
          'CNavigation': true,
          'CTable': true,
          'CTextarea': true
        }
      }
    })

    // Wait for the component to mount and API calls to complete
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify that the API was called with correct parameters
    expect(messageService.getMyMessages).toHaveBeenCalledWith({ per_page: 3 })

    // Verify that the messages are loaded in the component state
    expect(wrapper.vm.recentAdminMessages).toHaveLength(3)
    expect(wrapper.vm.recentAdminMessages[0].title).toBe('Test Message 1')
    expect(wrapper.vm.recentAdminMessages[1].title).toBe('Test Message 2')
    expect(wrapper.vm.recentAdminMessages[2].title).toBe('Test Message 3')

    // Verify that the section title is displayed
    expect(wrapper.text()).toContain('Recent Admin Messages')
  })

  it('should handle empty messages response', async () => {
    // Mock empty response
    messageService.getMyMessages.mockResolvedValue({
      data: {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 3,
        total: 0
      }
    })

    const wrapper = mount(StudentMain, {
      global: {
        plugins: [i18n, router],
        stubs: {
          'CNavigation': true,
          'CTable': true,
          'CTextarea': true
        }
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify empty state message is displayed
    expect(wrapper.text()).toContain('No recent messages from administrators')
  })

  it('should handle API error gracefully', async () => {
    // Mock API error
    messageService.getMyMessages.mockRejectedValue(new Error('API Error'))

    const wrapper = mount(StudentMain, {
      global: {
        plugins: [i18n, router],
        stubs: {
          'CNavigation': true,
          'CTable': true,
          'CTextarea': true
        }
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify error state is handled
    expect(wrapper.text()).toContain('Failed to load recent messages')
  })
})
