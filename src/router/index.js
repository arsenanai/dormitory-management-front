// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Main from '@/pages/Statistics.vue';

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
  {
    path: '/main',
    name: 'Main Page',
    component: () => Main,
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('@/pages/Students.vue'),
    meta: {
      title: 'Student Management',
      requiresAuth: true
    }
  },
  {
    path: '/guest-house',
    name: 'GuestHouse',
    component: () => import('@/pages/Guests.vue'),
    meta: {
      title: 'Guest House',
      requiresAuth: true
    }
  },
  // {
  //   path: '/messages',
  //   name: 'Messages',
  //   component: () => import('@/pages/Messages.vue'), // Lazy-loaded
  //   meta: {
  //     title: 'Messages',
  //     requiresAuth: true
  //   }
  // },
  // {
  //   path: '/accounting',
  //   name: 'Accounting',
  //   component: () => import('@/pages/Accounting.vue'), // Lazy-loaded
  //   meta: {
  //     title: 'Accounting',
  //     requiresAuth: true
  //   }
  // },
  // {
  //   path: '/configuration',
  //   name: 'Configuration',
  //   component: () => import('@/pages/Configuration.vue'), // Lazy-loaded
  //   meta: {
  //     title: 'Configuration',
  //     requiresAuth: true
  //   }
  // }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Optional: Add navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = 'SDU Dormitory | ' + to.meta.title ?? '';

  // Example: Redirect to login if route requires auth
  const isAuthenticated = true; // Replace with actual authentication logic
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;