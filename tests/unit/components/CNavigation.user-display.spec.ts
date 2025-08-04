import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import CNavigation from '@/components/CNavigation.vue'

// Mock the auth store
const mockAuthStore = {
  user: null,
  logout: vi.fn(),
  isAuthenticated: false
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('CNavigation - User Display', () => {
  let wrapper: any
  let router: any

  beforeEach(() => {
    router = createRouterMock()
    injectRouterMock(router)
    
    wrapper = mount(CNavigation, {
      props: {
        title: 'Test Navigation'
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          Bars3Icon: { template: '<span>Bars3Icon</span>' },
          ChevronDownIcon: { template: '<span>ChevronDownIcon</span>' },
          ChevronRightIcon: { template: '<span>ChevronRightIcon</span>' },
          ArrowTopRightOnSquareIcon: { template: '<span>ArrowTopRightOnSquareIcon</span>' }
        }
      }
    })
  })

  it('should display authenticated user name instead of hardcoded Ibrahim Tuncer', () => {
    // Set authenticated user
    mockAuthStore.user = { name: 'John Doe', email: 'john@example.com' }
    mockAuthStore.isAuthenticated = true
    
    // Re-mount with updated store
    wrapper = mount(CNavigation, {
      props: {
        title: 'Test Navigation'
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          Bars3Icon: { template: '<span>Bars3Icon</span>' },
          ChevronDownIcon: { template: '<span>ChevronDownIcon</span>' },
          ChevronRightIcon: { template: '<span>ChevronRightIcon</span>' },
          ArrowTopRightOnSquareIcon: { template: '<span>ArrowTopRightOnSquareIcon</span>' }
        }
      }
    })

    // Then: Should display authenticated user's name
    const userInfo = wrapper.find('[data-testid="user-menu-button"]')
    expect(userInfo.exists()).toBe(true)
    expect(userInfo.text()).toContain('John Doe')
    expect(userInfo.text()).toContain('john@example.com')
  })

  it('should fall back to hardcoded name when user is not authenticated', () => {
    // Set unauthenticated state
    mockAuthStore.user = null
    mockAuthStore.isAuthenticated = false
    
    // Re-mount with updated store
    wrapper = mount(CNavigation, {
      props: {
        title: 'Test Navigation'
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          Bars3Icon: { template: '<span>Bars3Icon</span>' },
          ChevronDownIcon: { template: '<span>ChevronDownIcon</span>' },
          ChevronRightIcon: { template: '<span>ChevronRightIcon</span>' },
          ArrowTopRightOnSquareIcon: { template: '<span>ArrowTopRightOnSquareIcon</span>' }
        }
      }
    })

    // Should display fallback name
    const userInfo = wrapper.find('[data-testid="user-menu-button"]')
    expect(userInfo.text()).toContain('IBRAHIM TUNCER')
    expect(userInfo.text()).toContain('Super Admin')
  })

  it('should handle user with different name formats', () => {
    // Set user with different name format
    mockAuthStore.user = { name: 'Jane Smith', email: 'jane.smith@example.com' }
    mockAuthStore.isAuthenticated = true
    
    // Re-mount with updated store
    wrapper = mount(CNavigation, {
      props: {
        title: 'Test Navigation'
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          Bars3Icon: { template: '<span>Bars3Icon</span>' },
          ChevronDownIcon: { template: '<span>ChevronDownIcon</span>' },
          ChevronRightIcon: { template: '<span>ChevronRightIcon</span>' },
          ArrowTopRightOnSquareIcon: { template: '<span>ArrowTopRightOnSquareIcon</span>' }
        }
      }
    })

    const userInfo = wrapper.find('[data-testid="user-menu-button"]')
    expect(userInfo.text()).toContain('Jane Smith')
    expect(userInfo.text()).toContain('jane.smith@example.com')
  })
})
