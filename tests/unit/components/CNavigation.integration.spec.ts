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

describe('CNavigation - Integration Tests', () => {
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

  it('should integrate user display and profile navigation for admin users', async () => {
    // Set admin user
    mockAuthStore.user = { name: 'Admin User', email: 'admin@sdu.edu.kz', role: { name: 'admin' } }
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

    // Then: Should display user's name correctly
    const userInfo = wrapper.find('[data-testid="user-menu-button"]')
    expect(userInfo.exists()).toBe(true)
    expect(userInfo.text()).toContain('Admin User')
    expect(userInfo.text()).toContain('admin@sdu.edu.kz')
  })

  it('should integrate user display and profile navigation for student users', async () => {
    // Set student user
    mockAuthStore.user = { name: 'John Doe', email: 'john.doe@example.com', role: { name: 'student' } }
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

    // Then: Should display user's name correctly
    const userInfo = wrapper.find('[data-testid="user-menu-button"]')
    expect(userInfo.exists()).toBe(true)
    expect(userInfo.text()).toContain('John Doe')
    expect(userInfo.text()).toContain('john.doe@example.com')
  })

  it('should handle complete logout flow', async () => {
    const userMenuButton = wrapper.find('[data-testid="user-menu-button"]')
    await userMenuButton.trigger('click')
    
    const logoutButton = wrapper.find('button:last-child')
    await logoutButton.trigger('click')
    
    expect(mockAuthStore.logout).toHaveBeenCalled()
  })

  it('should handle users with only name field (backward compatibility)', () => {
    // Set user with only name field
    mockAuthStore.user = { name: 'Simple User' }
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
    expect(userInfo.text()).toContain('Simple User')
  })

  it('should fall back to hardcoded values when not authenticated', () => {
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

    const userInfo = wrapper.find('[data-testid="user-menu-button"]')
    expect(userInfo.text()).toContain('IBRAHIM TUNCER')
    expect(userInfo.text()).toContain('Super Admin')
  })
})
