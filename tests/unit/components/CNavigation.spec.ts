import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import CNavigation from '@/components/CNavigation.vue'

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { name: 'John Doe', email: 'john@example.com' },
    logout: vi.fn(),
    isAuthenticated: true
  })
}))

describe('CNavigation.vue', () => {
  let wrapper: any
  let router: any

  beforeEach(() => {
    router = createRouterMock({
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
        { path: '/rooms', name: 'rooms', component: { template: '<div>Rooms</div>' } },
        { path: '/payments', name: 'payments', component: { template: '<div>Payments</div>' } }
      ]
    })
    injectRouterMock(router)
    
    wrapper = mount(CNavigation, {
      props: {
        title: 'Test Navigation',
        navItems: [
          { name: 'Users', path: '/users', icon: 'UserIcon' },
          { name: 'Rooms', path: '/rooms', icon: 'HomeIcon' },
          { name: 'Payments', path: '/payments', icon: 'CreditCardIcon' }
        ]
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          // Stub the icons
          Bars3Icon: { template: '<span>Bars3Icon</span>' },
          ChevronDownIcon: { template: '<span>ChevronDownIcon</span>' },
          ChevronRightIcon: { template: '<span>ChevronRightIcon</span>' },
          ArrowTopRightOnSquareIcon: { template: '<span>ArrowTopRightOnSquareIcon</span>' },
          UserIcon: { template: '<span>UserIcon</span>' },
          HomeIcon: { template: '<span>HomeIcon</span>' },
          CreditCardIcon: { template: '<span>CreditCardIcon</span>' }
        }
      }
    })
  })

  it('renders navigation menu correctly', () => {
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('renders navigation items', () => {
    const navItems = wrapper.findAll('a[href]')
    expect(navItems.length).toBeGreaterThan(0)
  })

  it('highlights active navigation item', async () => {
    router.push('/users')
    await wrapper.vm.$nextTick()
    
    // Look for active navigation item with the correct class structure
    const activeItem = wrapper.find('.bg-primary-100')
    expect(activeItem.exists()).toBe(true)
  })

  it('handles navigation clicks', async () => {
    const navLink = wrapper.find('a[href="/users"]')
    await navLink.trigger('click')
    
    expect(router.push).toHaveBeenCalledWith('/users')
  })

  it('handles collapsible navigation', async () => {
    await wrapper.setProps({ collapsible: true })
    expect(wrapper.find('button').exists()).toBe(true)
    
    const collapseButton = wrapper.find('button')
    await collapseButton.trigger('click')
  })

  it('handles user menu dropdown', async () => {
    const userMenuButton = wrapper.find('[data-testid="user-menu-button"]')
    await userMenuButton.trigger('click')
    
    expect(wrapper.find('.user-menu-dropdown').exists()).toBe(true)
  })

  it('handles logout action', async () => {
    const userMenuButton = wrapper.find('[data-testid="user-menu-button"]')
    await userMenuButton.trigger('click')
    
    const logoutButton = wrapper.find('button:last-child')
    await logoutButton.trigger('click')
  })

  it('displays user information when authenticated', async () => {
    const userInfo = wrapper.find('button[data-testid="user-menu-button"]')
    expect(userInfo.exists()).toBe(true)
    expect(userInfo.text()).toContain('John Doe')
  })

  it('handles responsive navigation', async () => {
    // Mock window resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()
  })

  it('handles navigation breadcrumbs', async () => {
    await wrapper.setProps({ 
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Users', path: '/users' },
        { name: 'Profile', path: '/users/profile' }
      ]
    })
    
    const breadcrumbs = wrapper.findAll('li')
    expect(breadcrumbs.length).toBeGreaterThan(0)
  })

  it('handles navigation loading state', async () => {
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('handles navigation icons', async () => {
    const iconElements = wrapper.findAll('span')
    expect(iconElements.length).toBeGreaterThan(0)
  })

  it('handles mobile menu toggle', async () => {
    // Set mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()
    
    const mobileMenuButton = wrapper.find('button')
    if (mobileMenuButton.exists()) {
      await mobileMenuButton.trigger('click')
    }
  })
})
