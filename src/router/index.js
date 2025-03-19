// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/Login.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      title: 'Login',
      requiresAuth: false
    }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Optional: Add navigation guards
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore()

//   // Set page title
//   document.title = to.meta.title || 'Dormitory Management'

//   // Redirect to login if route requires auth
//   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//     next({ name: 'login' })
//   } else {
//     next()
//   }
// })

export default router