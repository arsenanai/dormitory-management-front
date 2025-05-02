import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
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

// Define meta fields for routes
interface RouteMeta {
  title: string;
  requiresAuth: boolean;
  sidebar?: boolean;
  icon?: any; // Use `any` for dynamic icon imports
  parent?: string; // Optional parent for submenu
}

// Extend RouteRecordRaw to include custom meta fields
type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
};

// Define routes with type safety
const routes: AppRouteRecordRaw[] = [
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
    component: Main,
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      sidebar: true,
      icon: HomeIcon,
    },
  },
  {
    path: '/student-main',
    name: 'Student Main',
    component: () => import('@/pages/StudentMain.vue'),
    meta: {
      title: 'Student Main',
      requiresAuth: true,
      sidebar: true,
      icon: HomeIcon,
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
      icon: AcademicCapIcon,
    },
  },
  {
    path: '/student-form/:id?',
    name: 'Student Form',
    component: () => import('@/pages/StudentForm.vue'),
    meta: {
      title: 'Student Form',
      parent: 'Students',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
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
      icon: BuildingOfficeIcon,
    },
  },
  {
    path: '/guest-form/:id?',
    name: 'Guest Form',
    component: () => import('@/pages/GuestForm.vue'),
    meta: {
      title: 'Guest Form',
      parent: 'Guests',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
    },
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/pages/Messages.vue'),
    meta: {
      title: 'Messages',
      requiresAuth: true,
      sidebar: true,
      icon: ChatBubbleLeftRightIcon,
    },
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/pages/Payments.vue'),
    meta: {
      title: 'Payments',
      requiresAuth: true,
      sidebar: true,
      icon: ClipboardDocumentListIcon,
    },
  },
  {
    path: '/configuration',
    name: 'Configuration',
    component: () => import('@/pages/Options.vue'),
    meta: {
      title: 'Configuration',
      requiresAuth: true,
      sidebar: true,
      icon: Cog6ToothIcon,
    },
  },
  {
    path: '/dormitory-form/:id?',
    name: 'Dormitory Form',
    component: () => import('@/pages/DormitoryForm.vue'),
    meta: {
      title: 'Dormitory Form',
      parent: 'Configuration',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
    },
  },
];

// Create the router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Add navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = 'SDU Dormitory | ' + (to.meta?.title ?? '');

  // Example: Redirect to login if route requires auth
  const isAuthenticated = true; // Replace with actual authentication logic
  if (to.meta?.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;