import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000
})

// Request interceptor for adding token
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token')
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
// }, (error) => {
//     return Promise.reject(error)
// })

// // Response interceptor for handling errors
// api.interceptors.response.use((response) => {
//     return response
// }, (error) => {
//     if (error.response?.status === 401) {
//         const authStore = useAuthStore()
//         authStore.logout()
//     }
//     return Promise.reject(error)
// })

// export default api