// // src/stores/auth.js
// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import { useRouter } from 'vue-router'
// import { useI18n } from 'vue-i18n'
// import api from '@/services/api'

// export const useAuthStore = defineStore('auth', () => {
//   const router = useRouter()
//   const { t } = useI18n()

//   // State
//   const user = ref(null)
//   const token = ref(localStorage.getItem('token') || null)
//   const isLoading = ref(false)
//   const error = ref(null)

//   // Getters
//   const isAuthenticated = computed(() => !!token.value)
//   const userRole = computed(() => user.value?.role || null)
//   const fullName = computed(() =>
//     user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
//   )

//   // Actions
//   const login = async (credentials) => {
//     try {
//       isLoading.value = true
//       error.value = null

//       const response = await api.post('/auth/login', credentials)

//       token.value = response.data.token
//       user.value = response.data.user

//       // Store token in localStorage
//       localStorage.setItem('token', token.value)

//       // Redirect based on role
//       const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
//       router.push(redirectPath)
//     } catch (err) {
//       error.value = err.response?.data?.message || t('auth.login_error')
//       throw err
//     } finally {
//       isLoading.value = false
//     }
//   }

//   const register = async (userData) => {
//     try {
//       isLoading.value = true
//       error.value = null

//       const response = await api.post('/auth/register', userData)

//       token.value = response.data.token
//       user.value = response.data.user

//       localStorage.setItem('token', token.value)
//       router.push('/dashboard')
//     } catch (err) {
//       error.value = err.response?.data?.message || t('auth.register_error')
//       throw err
//     } finally {
//       isLoading.value = false
//     }
//   }

//   const logout = () => {
//     token.value = null
//     user.value = null
//     localStorage.removeItem('token')
//     router.push('/login')
//   }

//   const checkAuth = async () => {
//     if (!token.value) return

//     try {
//       const response = await api.get('/auth/me')
//       user.value = response.data
//     } catch (err) {
//       logout()
//     }
//   }

//   const resetPassword = async (email) => {
//     try {
//       isLoading.value = true
//       error.value = null

//       await api.post('/auth/reset-password', { email })
//     } catch (err) {
//       error.value = err.response?.data?.message || t('auth.reset_password_error')
//       throw err
//     } finally {
//       isLoading.value = false
//     }
//   }

//   // Initialize auth check on store creation
//   checkAuth()

//   return {
//     // State
//     user,
//     token,
//     isLoading,
//     error,

//     // Getters
//     isAuthenticated,
//     userRole,
//     fullName,

//     // Actions
//     login,
//     register,
//     logout,
//     checkAuth,
//     resetPassword
//   }
// })