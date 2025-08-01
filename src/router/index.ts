import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
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
  UserGroupIcon,
} from '@heroicons/vue/24/outline';

// Define meta fields for routes
interface RouteMeta {
  title: string;
  requiresAuth: boolean;
  sidebar?: boolean;
  icon?: any;
  parent?: string;
  roles?: string[]; // Roles that can access this route
}

type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
};

const routes: AppRouteRecordRaw[] = [
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('@/pages/ResetPassword.vue'),
    meta: {
      title: 'Reset Password',
      requiresAuth: false,
    },
  },
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
      roles: ['sudo', 'admin', 'student', 'guest'],
    },
  },
  {
    path: '/admins',
    name: 'Admins',
    component: () => import('@/pages/Admins.vue'),
    meta: {
      title: 'Admins',
      requiresAuth: true,
      sidebar: true,
      icon: UserGroupIcon,
      roles: ['sudo'],
    },
  },
  {
    path: '/admin-form/:id?',
    name: 'Admin Form',
    component: () => import('@/pages/AdminForm.vue'),
    meta: {
      title: 'Admin Form',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
      parent: 'Admins',
      roles: ['sudo'],
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
      icon: UserGroupIcon,
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/student-form/:id?',
    name: 'Student Form',
    component: () => import('@/pages/StudentForm.vue'),
    meta: {
      title: 'Student Form',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
      parent: 'Students',
      roles: ['sudo', 'admin'],
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
      roles: ['student'],
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
      roles: ['sudo', 'admin'],
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
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/guest-home',
    name: 'Guest Home',
    component: () => import('@/pages/GuestHome.vue'),
    meta: {
      title: 'Guest Home',
      requiresAuth: true,
      sidebar: true,
      icon: HomeIcon,
      roles: ['guest'],
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
      roles: ['sudo', 'admin', 'student', 'guest'],
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
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/payment-form/:id?',
    name: 'Payment Form',
    component: () => import('@/pages/PaymentForm.vue'),
    meta: {
      title: 'Payment Form',
      parent: 'Payments',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: () => import('@/pages/Accounting.vue'),
    meta: {
      title: 'Accounting',
      requiresAuth: true,
      sidebar: true,
      icon: ClipboardDocumentListIcon,
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: {
      title: 'Settings',
      requiresAuth: true,
      sidebar: true,
      icon: Cog6ToothIcon,
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/dormitories',
    name: 'Dormitories',
    component: () => import('@/pages/Dormitories.vue'),
    meta: {
      title: 'Dormitories',
      requiresAuth: true,
      sidebar: true,
      icon: Cog6ToothIcon,
      roles: ['sudo'],
    },
  },
  {
    path: '/dormitory-form/:id?',
    name: 'Dormitory Form',
    component: () => import('@/pages/DormitoryForm.vue'),
    meta: {
      title: 'Dormitory Form',
      parent: 'Dormitories',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
      roles: ['sudo'],
    },
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: () => import('@/pages/Rooms.vue'),
    meta: {
      title: 'Rooms',
      requiresAuth: true,
      sidebar: true,
      icon: BuildingOfficeIcon,
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/room-form/:number?',
    name: 'Room Form',
    component: () => import('@/pages/RoomForm.vue'),
    meta: {
      title: 'Room Form',
      parent: 'Rooms',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
      roles: ['sudo', 'admin'],
    },
  },
  {
    path: '/room-types',
    name: 'Room Types',
    component: () => import('@/pages/RoomTypes.vue'),
    meta: {
      title: 'Room Types',
      requiresAuth: true,
      sidebar: true,
      icon: BuildingOfficeIcon,
      roles: ['sudo'],
    },
  },
  {
    path: '/room-type-form/:id?',
    name: 'Room Type Form',
    component: () => import('@/pages/RoomTypeForm.vue'),
    meta: {
      title: 'Room Type Form',
      parent: 'Room Types',
      requiresAuth: true,
      sidebar: true,
      icon: PencilSquareIcon,
      roles: ['sudo'],
    },
  },
  {
    path: '/modal-test',
    name: 'ModalTest',
    component: () => import('@/pages/ModalTest.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = 'SDU Dormitory | ' + (to.meta?.title ?? '');
  
  // Initialize auth store in the context of the navigation guard
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  
  if (to.meta?.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    // Redirect authenticated users away from login page
    next({ path: '/main' });
  } else if (to.meta?.roles && to.meta.roles.length > 0) {
    // Check role-based access
    const userRole = authStore.userRole;
    if (!userRole || !to.meta.roles.includes(userRole)) {
      // Redirect to main page if user doesn't have required role
      next({ path: '/main' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;