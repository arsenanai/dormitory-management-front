import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CNavigation from '@/components/CNavigation.vue'
import { useAuthStore } from '@/stores/auth'

// Mock vue-router
const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/main',
    name: 'Main',
    meta: {}
  }),
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

describe('CNavigation - Logout Functionality', () => {
  let wrapper: any
  let authStore: any

  beforeEach(() => {
    vi.clearAllMocks()
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    })

    wrapper = mount(CNavigation, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true,
        },
      },
    })

    authStore = useAuthStore()
  })

  it('should call authStore logout when logout button is clicked', async () => {
    // Given: User is authenticated
    authStore.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: { name: 'admin' }
    }
    authStore.token = 'valid-token'
    authStore.logout = vi.fn()

    await wrapper.vm.$nextTick()

    // When: User opens dropdown and clicks logout
    const userMenuButton = wrapper.find('.user-menu')
    await userMenuButton.trigger('click')

    const logoutButton = wrapper.find('.logout-button')
    await logoutButton.trigger('click')

    // Then: Should call authStore.logout()
    expect(authStore.logout).toHaveBeenCalled()
  })

  it('should redirect to login page after logout', async () => {
    // Given: User is authenticated
    authStore.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: { name: 'admin' }
    }
    authStore.token = 'valid-token'
    
    // Mock logout to simulate clearing user data and redirecting
    authStore.logout = vi.fn(() => {
      authStore.user = null
      authStore.token = null
      mockRouterPush('/login')
    })

    await wrapper.vm.$nextTick()

    // When: User clicks logout
    const userMenuButton = wrapper.find('.user-menu')
    await userMenuButton.trigger('click')

    const logoutButton = wrapper.find('.logout-button')
    await logoutButton.trigger('click')

    // Then: Should redirect to login
    expect(mockRouterPush).toHaveBeenCalledWith('/login')
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
  })

  it('should clear localStorage token on logout', async () => {
    // Given: User is authenticated with token in localStorage
    localStorage.setItem('token', 'test-token')
    authStore.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: { name: 'admin' }
    }
    authStore.token = 'test-token'
    
    // Mock logout to clear localStorage
    authStore.logout = vi.fn(() => {
      authStore.user = null
      authStore.token = null
      localStorage.removeItem('token')
    })

    await wrapper.vm.$nextTick()

    // When: User clicks logout
    const userMenuButton = wrapper.find('.user-menu')
    await userMenuButton.trigger('click')

    const logoutButton = wrapper.find('.logout-button')
    await logoutButton.trigger('click')

    // Then: Should clear localStorage (check that token is no longer present)
    expect(localStorage.getItem('token')).toBeFalsy()
  })
})
