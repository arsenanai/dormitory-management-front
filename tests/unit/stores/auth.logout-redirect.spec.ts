import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'

// Mock vue-router
const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

describe('Auth Store - Logout Redirect Fix', () => {
  let authStore: any

  beforeEach(() => {
    vi.clearAllMocks()
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    })
    
    authStore = useAuthStore()
  })

  it('should redirect to root path (/) instead of /login on logout', () => {
    // Given: User is authenticated
    authStore.user = { id: 1, name: 'Test User' }
    authStore.token = 'test-token'
    localStorage.setItem('token', 'test-token')

    // When: User logs out
    authStore.logout()

    // Then: Should redirect to root path
    expect(mockRouterPush).toHaveBeenCalledWith('/')
    
    // And: Should clear user data
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(localStorage.getItem('token')).toBeFalsy()
  })
})
