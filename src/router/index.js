import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Main from '@/pages/Statistics.vue';
import {
  HomeIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline';

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      title: 'Login',
      requiresAuth: false,
    },
  },
  {
    path: '/main',
    name: 'Main Page',
    component: () => Main,
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      sidebar: true,
      icon: HomeIcon, // Icon for Main Page
    },
  },
  {
    path: '/student-main',
    name: 'Student Main',
    component: () => import('@/pages/StudentMain.vue'), // Lazy-loaded
    meta: {
      title: 'Student Main',
      requiresAuth: true,
      sidebar: true,
      icon: HomeIcon, // Icon for Student Main
    },
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('@/pages/Students.vue'),
    meta: {
      title: 'Students',
      requiresAuth: true,
      sidebar: true,
      icon: AcademicCapIcon, // Icon for Students
    },
  },
  {
    path: '/student-form/:id?',
    name: 'Student Form',
    component: () => import('@/pages/StudentForm.vue'),
    meta: {
      title: 'Student Form',
      parent: 'Students', // Submenu under Students
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon, // Icon for Student Form
    },
  },
  {
    path: '/guest-house',
    name: 'Guests',
    component: () => import('@/pages/Guests.vue'),
    meta: {
      title: 'Guests',
      requiresAuth: true,
      sidebar: true,
      icon: BuildingOfficeIcon, // Icon for Guest House
    },
  },
  {
    path: '/guest-form/:id?',
    name: 'Guest Form',
    component: () => import('@/pages/GuestForm.vue'),
    meta: {
      title: 'Guest Form',
      parent: 'Guests', // Submenu under Guests
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon, // Icon for Guest Form
    },
  },
  // Uncomment and implement these routes when ready
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/pages/Messages.vue'), // Lazy-loaded
    meta: {
      title: 'Messages',
      requiresAuth: true,
      sidebar: true,
      icon: ChatBubbleLeftRightIcon, // Icon for Messages
    },
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/pages/Payments.vue'), // Lazy-loaded
    meta: {
      title: 'Payments',
      requiresAuth: true,
      sidebar: true,
      icon: ClipboardDocumentListIcon, // Icon for Accounting
    },
  },
  {
    path: '/configuration',
    name: 'Configuration',
    component: () => import('@/pages/Options.vue'), // Lazy-loaded
    meta: {
      title: 'Configuration',
      requiresAuth: true,
      sidebar: true,
      icon: Cog6ToothIcon, // Icon for Configuration
    },
  },
  {
    path: '/dormitory-form/:id?',
    name: 'Dormitory Form',
    component: () => import('@/pages/DormitoryForm.vue'), // Lazy-loaded
    meta: {
      title: 'Dormitory Form',
      parent: 'Configuration', // Submenu under Configuration
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon, // Icon for Configuration Form
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Optional: Add navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = 'SDU Dormitory | ' + (to.meta.title ?? '');

  // Example: Redirect to login if route requires auth
  const isAuthenticated = true; // Replace with actual authentication logic
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;