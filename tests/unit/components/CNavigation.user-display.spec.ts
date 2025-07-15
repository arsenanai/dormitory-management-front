import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CNavigation from '@/components/CNavigation.vue'
import { useAuthStore } from '@/stores/auth'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/main',
    name: 'Main',
    meta: {}
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('CNavigation - User Display', () => {
  let wrapper: any
  let authStore: any

  beforeEach(() => {
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

  it('should display authenticated user name instead of hardcoded Ibrahim Tuncer', async () => {
    // Given: User is authenticated with real user data
    authStore.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: { name: 'admin' }
    }
    authStore.token = 'valid-token'

    await wrapper.vm.$nextTick()

    // Then: Should display authenticated user's name
    const userInfo = wrapper.find('.user-info')
    expect(userInfo.exists()).toBe(true)
    expect(userInfo.find('p').text()).toBe('John Doe')
    expect(userInfo.findAll('p')[1].text()).toBe('john@example.com')

    // And: Should not display hardcoded name
    const hardcodedName = wrapper.text()
    expect(hardcodedName).not.toContain('IBRAHIM TUNCER')
    expect(hardcodedName).not.toContain('Super Admin')
  })

  it('should fall back to hardcoded name when user is not authenticated', async () => {
    // Given: User is not authenticated
    authStore.user = null
    authStore.token = null

    await wrapper.vm.$nextTick()

    // Then: Should display fallback hardcoded name
    const fallbackInfo = wrapper.find('.user-menu').text()
    expect(fallbackInfo).toContain('IBRAHIM TUNCER')
    expect(fallbackInfo).toContain('Super Admin')
  })

  it('should handle user with different name formats', async () => {
    // Given: User with first_name and last_name
    authStore.user = {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      role: { name: 'student' }
    }
    authStore.token = 'valid-token'

    await wrapper.vm.$nextTick()

    // Then: Should display full name properly
    const userInfo = wrapper.find('.user-info')
    expect(userInfo.find('p').text()).toBe('Jane Smith')
  })
})
