// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { User } from '@/models/User'

interface LoginCredentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role?.name || null)
  const fullName = computed(() =>
    user.value ? `${user.value.first_name || user.value.name || ''} ${user.value.last_name || ''}`.trim() : ''
  )

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/login', credentials)

      token.value = response.data.token
      user.value = response.data.user

      // Store token in localStorage
      if (token.value) {
        localStorage.setItem('token', token.value)
      }

      // Redirect based on role
      const redirectPath = '/main'
      router.push(redirectPath)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: any) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/register', userData)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
  token.value = null
  user.value = null
  localStorage.removeItem('token')
  router.push('/')
  }

  const loadProfile = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await api.get('/users/profile')
      user.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData: any) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.put('/users/profile', profileData)
      user.value = response.data

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      loadProfile().catch(() => {
        // If loading profile fails, logout
        logout()
      })
    }
  }

  const checkAuth = async () => {
    if (!token.value) return

    try {
      const response = await api.get('/users/profile')
      user.value = response.data
    } catch (err) {
      logout()
    }
  }

  const resetPassword = async (email: string) => {
    try {
      loading.value = true
      error.value = null

      await api.post('/auth/reset-password', { email })
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Password reset failed'
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
    resetPassword
  }
})