import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import CNavigation from '@/components/CNavigation.vue'

// Mock the auth store
const mockAuthStore = {
  user: { name: 'John Doe', email: 'john@example.com' },
  logout: vi.fn(),
  isAuthenticated: true
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('CNavigation - User Profile Dropdown', () => {
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

  it('should display profile dropdown when user menu is clicked', async () => {
    const userMenuButton = wrapper.find('[data-testid="user-menu-button"]')
    await userMenuButton.trigger('click')
    
    expect(wrapper.find('.user-menu-dropdown').exists()).toBe(true)
  })

  it('should navigate to appropriate profile form when profile is clicked - Admin', async () => {
    // Set admin user
    mockAuthStore.user = { name: 'Admin User', email: 'admin@sdu.edu.kz', role: { name: 'admin' } }
    
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

    const userMenuButton = wrapper.find('[data-testid="user-menu-button"]')
    await userMenuButton.trigger('click')
    
    const profileButton = wrapper.find('[data-testid="profile-link"]')
    await profileButton.trigger('click')
    
    expect(router.push).toHaveBeenCalledWith('/account-preferences')
  })

  it('should navigate to appropriate profile form when profile is clicked - Student', async () => {
    // Set student user
    mockAuthStore.user = { name: 'John Doe', email: 'john.doe@example.com', role: { name: 'student' } }
    
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

    const userMenuButton = wrapper.find('[data-testid="user-menu-button"]')
    await userMenuButton.trigger('click')
    
    const profileButton = wrapper.find('[data-testid="profile-link"]')
    await profileButton.trigger('click')
    
    expect(router.push).toHaveBeenCalledWith('/account-preferences')
  })

  it('should call logout function when logout is clicked', async () => {
    const userMenuButton = wrapper.find('[data-testid="user-menu-button"]')
    await userMenuButton.trigger('click')
    
    const logoutButton = wrapper.find('button:last-child')
    await logoutButton.trigger('click')
    
    expect(mockAuthStore.logout).toHaveBeenCalled()
  })
})
