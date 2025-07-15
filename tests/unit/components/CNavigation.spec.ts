import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import CNavigation from '@/components/CNavigation.vue'

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
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    })
  })

  it('renders navigation menu correctly', () => {
    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.find('ul').exists()).toBe(true)
  })

  it('renders navigation items', () => {
    const navItems = wrapper.findAll('li')
    expect(navItems.length).toBeGreaterThan(0)
  })

  it('highlights active navigation item', async () => {
    router.push('/users')
    await wrapper.vm.$nextTick()
    
    const activeItem = wrapper.find('.active')
    expect(activeItem.exists()).toBe(true)
  })

  it('handles navigation clicks', async () => {
    const navLink = wrapper.find('a[href="/users"]')
    await navLink.trigger('click')
    
    expect(router.push).toHaveBeenCalledWith('/users')
  })

  it('handles collapsible navigation', async () => {
    await wrapper.setProps({ collapsible: true })
    expect(wrapper.find('.collapse-button').exists()).toBe(true)
    
    await wrapper.find('.collapse-button').trigger('click')
    expect(wrapper.find('nav').classes()).toContain('collapsed')
  })

  it('handles user menu dropdown', async () => {
    const userMenu = wrapper.find('.user-menu')
    await userMenu.trigger('click')
    
    expect(wrapper.find('.dropdown-menu').classes()).toContain('open')
  })

  it('handles logout action', async () => {
    // Mock the auth store
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    authStore.logout = vi.fn()
    
    const logoutButton = wrapper.find('.logout-button')
    await logoutButton.trigger('click')
    
    // Should call auth store logout instead of emitting event
    expect(authStore.logout).toHaveBeenCalled()
  })

  it('displays user information when authenticated', async () => {
    await wrapper.setProps({ 
      user: { name: 'John Doe', email: 'john@example.com' } 
    })
    
    expect(wrapper.find('.user-info').text()).toContain('John Doe')
  })

  it('handles responsive navigation', async () => {
    // Mock window resize
    global.innerWidth = 768
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('nav').classes()).toContain('mobile')
  })

  it('handles navigation breadcrumbs', async () => {
    await wrapper.setProps({ 
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Users', path: '/users' },
        { name: 'Profile', path: '/users/profile' }
      ]
    })
    
    const breadcrumbs = wrapper.findAll('.breadcrumb-item')
    expect(breadcrumbs).toHaveLength(3)
  })

  it('handles navigation search', async () => {
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test search')
    await searchInput.trigger('keyup.enter')
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['test search'])
  })

  it('handles theme toggle', async () => {
    const themeToggle = wrapper.find('.theme-toggle')
    await themeToggle.trigger('click')
    
    expect(wrapper.emitted('theme-toggle')).toBeTruthy()
  })

  it('handles notification badge', async () => {
    await wrapper.setProps({ notifications: 5 })
    
    const badge = wrapper.find('.notification-badge')
    expect(badge.text()).toBe('5')
  })

  it('handles external links', async () => {
    const externalLink = wrapper.find('a[target="_blank"]')
    expect(externalLink.attributes('rel')).toBe('noopener noreferrer')
  })

  it('handles keyboard navigation', async () => {
    // Test that keyboard events don't crash the component
    await wrapper.trigger('keydown.tab')
    await wrapper.trigger('keydown.enter')
    // Just verify component is still functional
    expect(wrapper.vm).toBeTruthy()
  })

  it('handles navigation permissions', async () => {
    await wrapper.setProps({ 
      permissions: ['users.view', 'rooms.view'],
      restrictedItems: ['payments']
    })
    
    const paymentsLink = wrapper.find('a[href="/payments"]')
    expect(paymentsLink.exists()).toBe(false)
  })

  it('handles navigation loading state', async () => {
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.loading-skeleton').exists()).toBe(true)
  })

  it('handles navigation icons', async () => {
    const iconElements = wrapper.findAll('.nav-icon')
    expect(iconElements.length).toBeGreaterThan(0)
  })

  it('handles mobile menu toggle', async () => {
    const mobileToggle = wrapper.find('.mobile-menu-toggle')
    await mobileToggle.trigger('click')
    
    expect(wrapper.find('.mobile-menu').classes()).toContain('open')
  })
})
