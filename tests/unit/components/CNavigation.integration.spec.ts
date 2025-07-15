import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import CNavigation from '@/components/CNavigation.vue'
import { useAuthStore } from '@/stores/auth'

describe('CNavigation - Integration Tests', () => {
  let wrapper: any
  let authStore: any
  let router: any
  let mockRouterPush: any

  beforeEach(async () => {
    mockRouterPush = vi.fn()
    
    // Create a real router instance for more realistic testing
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/admin-form/:id', component: { template: '<div>Admin Form</div>' } },
        { path: '/student-form/:id', component: { template: '<div>Student Form</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
      ]
    })

    // Mock router.push
    router.push = mockRouterPush

    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    })

    wrapper = mount(CNavigation, {
      global: {
        plugins: [pinia, router],
        stubs: {
          'router-link': true,
        },
      },
    })

    authStore = useAuthStore()
  })

  it('should integrate user display and profile navigation for admin users', async () => {
    // Given: Admin user is authenticated
    authStore.user = {
      id: 1,
      name: 'Admin User', 
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@sdu.edu.kz',
      role: { name: 'admin' }
    }
    authStore.token = 'valid-token'

    await wrapper.vm.$nextTick()

    // Then: Should display user's name correctly
    const userInfo = wrapper.find('.user-info')
    expect(userInfo.exists()).toBe(true)
    expect(userInfo.find('p').text()).toBe('Admin User')
    expect(userInfo.findAll('p')[1].text()).toBe('admin@sdu.edu.kz')

    // When: User opens dropdown and clicks profile
    const userMenuButton = wrapper.find('.user-menu')
    await userMenuButton.trigger('click')

    const profileLink = wrapper.find('[data-testid="profile-link"]')
    await profileLink.trigger('click')

    // Then: Should navigate to admin form
    expect(mockRouterPush).toHaveBeenCalledWith('/admin-form/1')
  })

  it('should integrate user display and profile navigation for student users', async () => {
    // Given: Student user is authenticated
    authStore.user = {
      id: 2,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@sdu.edu.kz',
      role: { name: 'student' }
    }
    authStore.token = 'valid-token'

    await wrapper.vm.$nextTick()

    // Then: Should display user's name correctly
    const userInfo = wrapper.find('.user-info')
    expect(userInfo.exists()).toBe(true)
    expect(userInfo.find('p').text()).toBe('John Doe')
    expect(userInfo.findAll('p')[1].text()).toBe('john.doe@sdu.edu.kz')

    // When: User opens dropdown and clicks profile
    const userMenuButton = wrapper.find('.user-menu')
    await userMenuButton.trigger('click')

    const profileLink = wrapper.find('[data-testid="profile-link"]')
    await profileLink.trigger('click')

    // Then: Should navigate to student form
    expect(mockRouterPush).toHaveBeenCalledWith('/student-form/2')
  })

  it('should handle complete logout flow', async () => {
    // Given: User is authenticated
    authStore.user = {
      id: 1,
      name: 'Test User',
      email: 'test@sdu.edu.kz',
      role: { name: 'admin' }
    }
    authStore.token = 'valid-token'
    authStore.logout = vi.fn()

    await wrapper.vm.$nextTick()

    // When: User completes logout flow
    const userMenuButton = wrapper.find('.user-menu')
    await userMenuButton.trigger('click')

    // Verify dropdown is open
    expect(wrapper.find('.dropdown-menu').isVisible()).toBe(true)

    const logoutButton = wrapper.find('.logout-button')
    await logoutButton.trigger('click')

    // Then: Should call logout
    expect(authStore.logout).toHaveBeenCalled()
    
    // Note: Dropdown closing is handled by the component but may have timing issues in tests
  })

  it('should handle users with only name field (backward compatibility)', async () => {
    // Given: User with only name field (legacy format)
    authStore.user = {
      id: 3,
      name: 'Legacy User',
      email: 'legacy@sdu.edu.kz',
      role: { name: 'admin' }
    }
    authStore.token = 'valid-token'

    await wrapper.vm.$nextTick()

    // Then: Should display name correctly
    const userInfo = wrapper.find('.user-info')
    expect(userInfo.find('p').text()).toBe('Legacy User')
  })

  it('should fall back to hardcoded values when not authenticated', async () => {
    // Given: User is not authenticated
    authStore.user = null
    authStore.token = null

    await wrapper.vm.$nextTick()

    // Then: Should show fallback
    const userMenu = wrapper.find('.user-menu')
    expect(userMenu.text()).toContain('IBRAHIM TUNCER')
    expect(userMenu.text()).toContain('Super Admin')
  })
})
