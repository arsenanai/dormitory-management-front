
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api, { authService } from '@/services/api'
import { User } from '@/models/User'

/**
 * Interface for login credentials
 */
interface LoginCredentials {
  /** User's email address */
  email: string
  /** User's password */
  password: string
}

/**
 * Interface for password reset confirmation
 */
interface PasswordResetData {
  /** Reset token from email */
  token: string
  /** New password */
  password: string
  /** Password confirmation */
  password_confirmation: string
  /** User's email address */
  email: string
}

/**
 * Authentication store for managing user authentication state
 * 
 * This store handles:
 * - User login/logout
 * - User registration
 * - Password reset functionality
 * - Profile management
 * - Authentication state persistence
 * - Role-based access control
 */
export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  /** Current authenticated user or null if not authenticated */
  const user = ref<User | null>(null)
  /** Authentication token or null if not authenticated */
  const token = ref<string | null>(null)
  /** Loading state for async operations */
  const loading = ref(false)
  /** Error message for failed operations */
  const error = ref<string | null>(null)

  // Getters
  /** Whether the user is currently authenticated */
  const isAuthenticated = computed(() => !!token.value)
  
  /** Current user's role name or null if not authenticated */
  const userRole = computed(() => user.value?.role?.name || null)
  
  /** User's full name (first_name + last_name) */
  const fullName = computed(() =>
    user.value ? `${user.value.first_name || user.value.name || ''} ${user.value.last_name || ''}`.trim() : ''
  )

  // Actions

  /**
   * Authenticate user with email and password
   * 
   * @param credentials - Login credentials containing email and password
   * @throws {Error} When login fails due to invalid credentials or network issues
   * @returns {Promise<void>} Resolves when login is successful
   * 
   * @example
   * ```typescript
   * await authStore.login({
   *   email: 'admin@sdu.edu.kz',
   *   password: 'password'
   * })
   * ```
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true
      error.value = null



      const response = await authService.login(credentials)

      token.value = response.data.token
      user.value = response.data.user

      // Store token in localStorage for persistence
      if (token.value) {
        localStorage.setItem('token', token.value)
      }

      // Redirect based on role
      let redirectPath = '/main'
      
      if (user.value?.role?.name) {
        switch (user.value.role.name) {
          case 'student':
            redirectPath = '/student-main'
            break
          case 'guest':
            redirectPath = '/guest-home'
            break
          case 'sudo':
          case 'admin':
          default:
            redirectPath = '/main'
            break
        }
      }
      
      router.push(redirectPath)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a new user account
   * 
   * @param userData - User registration data including name, email, password, and role
   * @throws {Error} When registration fails due to validation errors or network issues
   * @returns {Promise<any>} Registration response data
   * 
   * @example
   * ```typescript
   * await authStore.register({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   password: 'password',
   *   password_confirmation: 'password',
   *   role: 'student'
   * })
   * ```
   */
  const register = async (userData: any) => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.register(userData)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout current user and clear authentication state
   * 
   * This method:
   * - Clears the authentication token
   * - Removes user data from store
   * - Removes token from localStorage
   * - Redirects to login page
   * 
   * @example
   * ```typescript
   * authStore.logout()
   * ```
   */
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/')
  }

  /**
   * Load current user's profile from API
   * 
   * @throws {Error} When profile loading fails due to network issues or invalid token
   * @returns {Promise<void>} Resolves when profile is loaded successfully
   * 
   * @example
   * ```typescript
   * await authStore.loadProfile()
   * ```
   */
  const loadProfile = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.getProfile()
      user.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update current user's profile information
   * 
   * @param profileData - Profile data to update
   * @throws {Error} When profile update fails due to validation errors or network issues
   * @returns {Promise<any>} Update response data
   * 
   * @example
   * ```typescript
   * await authStore.updateProfile({
   *   first_name: 'John',
   *   last_name: 'Doe',
   *   email: 'john@example.com'
   * })
   * ```
   */
  const updateProfile = async (profileData: any) => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.updateProfile(profileData)
      user.value = response.data

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialize authentication state on app startup
   * 
   * This method:
   * - Checks for existing token in localStorage
   * - Validates token with server
   * - Loads user profile if token is valid
   * - Clears invalid tokens
   * 
   * @example
   * ```typescript
   * // Call in app initialization
   * authStore.initializeAuth()
   * ```
   */
  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('token')
    
    if (savedToken) {
      token.value = savedToken
      // Set token in API headers
      if (api.defaults && api.defaults.headers) {
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      }
      
      // Try to load user profile to validate token
      try {
        await loadProfile()
      } catch (err) {
        // If loading profile fails, clear the invalid token
        console.warn('Invalid token found, clearing authentication state')
        logout()
      }
    }
  }

  /**
   * Check if current authentication is valid
   * 
   * @throws {Error} When authentication check fails
   * @returns {Promise<boolean>} True if authentication is valid, false otherwise
   * 
   * @example
   * ```typescript
   * const isValid = await authStore.checkAuth()
   * if (!isValid) {
   *   // Redirect to login
   * }
   * ```
   */
  const checkAuth = async () => {
    try {
      if (!token.value) return false
      
      await loadProfile()
      return true
    } catch (err) {
      // Clear invalid token
      logout()
      return false
    }
  }

  /**
   * Send password reset link to user's email
   * 
   * @param email - User's email address
   * @throws {Error} When password reset request fails
   * @returns {Promise<any>} Reset request response data
   * 
   * @example
   * ```typescript
   * await authStore.resetPassword('user@example.com')
   * ```
   */
  const resetPassword = async (email: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.resetPassword({ email })
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to send reset link'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Confirm password reset with token and new password
   * 
   * @param resetData - Password reset confirmation data
   * @throws {Error} When password reset confirmation fails
   * @returns {Promise<any>} Reset confirmation response data
   * 
   * @example
   * ```typescript
   * await authStore.resetPasswordConfirm({
   *   token: 'reset-token',
   *   password: 'new-password',
   *   password_confirmation: 'new-password',
   *   email: 'user@example.com'
   * })
   * ```
   */
  const resetPasswordConfirm = async (resetData: PasswordResetData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.resetPassword(resetData)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to reset password'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Change user's password
   * 
   * @param passwordData - Password change data
   * @throws {Error} When password change fails
   * @returns {Promise<any>} Password change response data
   * 
   * @example
   * ```typescript
   * await authStore.changePassword({
   *   current_password: 'old-password',
   *   password: 'new-password',
   *   password_confirmation: 'new-password'
   * })
   * ```
   */
  const changePassword = async (passwordData: any) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.put('/users/change-password', passwordData)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to change password'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    fullName,
    
    // Actions
    login,
    register,
    logout,
    loadProfile,
    updateProfile,
    initializeAuth,
    checkAuth,
    resetPassword,
    resetPasswordConfirm,
    changePassword
  }
})