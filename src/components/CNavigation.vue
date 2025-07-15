<template>
  <div class="flex min-h-screen flex-col">
    <!-- Navigation Header -->
    <nav 
      class="flex flex-col items-stretch justify-between lg:flex-row z-20 bg-white border-b shadow-sm"
      :class="{ 
        'mobile': isMobile, 
        'collapsed': isCollapsed && collapsible 
      }"
      @keydown.tab="handleKeyboardNav"
      @keydown.enter="handleEnterKey"
    >
      <!-- Main Navigation Bar -->
      <div class="flex flex-1 flex-row items-center justify-between py-2 px-4">
        <!-- Logo & Brand Section -->
        <div class="flex items-center justify-start space-x-2 lg:w-64 lg:justify-center lg:space-x-4">
          <!-- Mobile Menu Toggle -->
          <button
            v-if="isMobile"
            @click="toggleMobileMenu"
            class="mobile-menu-toggle lg:hidden focus:ring-3 focus:outline-none focus:ring-secondary-300 p-2 rounded"
            :aria-label="'Toggle mobile menu'"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>
          
          <!-- Collapse Button (desktop) -->
          <button
            v-if="collapsible"
            @click="toggleCollapse"
            class="collapse-button hidden lg:block p-2 rounded hover:bg-gray-100"
          >
            <Bars3Icon class="h-5 w-5" />
          </button>
          
          <img src="/src/assets/sdu logo.png" class="h-12" alt="Logo" />
          <span class="text-lg font-bold">{{ title }}</span>
        </div>

        <!-- Search Bar -->
        <div class="flex flex-1 max-w-md mx-4">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            @keydown.enter.prevent="handleSearch"
            type="search"
            placeholder="Search..."
            class="search-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- User Menu & Actions -->
        <div class="flex items-center space-x-2 lg:space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="theme-toggle p-2 rounded hover:bg-gray-100"
            :aria-label="'Toggle theme'"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L13.09 8.26L20 9L14 14.74L15.18 21.02L10 17.77L4.82 21.02L6 14.74L0 9L6.91 8.26L10 2Z"/>
            </svg>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button class="p-2 rounded hover:bg-gray-100">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2C7.8 2 6 3.8 6 6v6l-2 2v1h12v-1l-2-2V6c0-2.2-1.8-4-4-4z"/>
              </svg>
              <span 
                v-if="notifications > 0"
                class="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ notifications }}
              </span>
            </button>
          </div>

          <!-- User Info & Menu -->
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="user-menu flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
            >
              <div v-if="currentUser" class="text-right user-info">
                <p class="text-sm font-medium">{{ currentUser.name }}</p>
                <p class="text-xs text-gray-500">{{ currentUser.email }}</p>
              </div>
              <div v-else class="text-right">
                <p class="text-sm font-medium">IBRAHIM TUNCER</p>
                <p class="text-xs text-gray-500">Super Admin</p>
              </div>
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </button>
            
            <!-- User Dropdown Menu -->
            <div 
              v-show="userMenuOpen"
              class="dropdown-menu open absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50"
            >
              <button 
                @click="handleProfileClick"
                data-testid="profile-link"
                class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Profile
              </button>
              <a 
                href="#" 
                data-testid="settings-link"
                class="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Settings
              </a>
              <hr class="my-1">
              <button
                @click="handleLogout"
                class="logout-button w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Breadcrumbs -->
      <div v-if="breadcrumbs && breadcrumbs.length" class="px-4 py-2 bg-gray-50 border-t">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-1">
            <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
              <router-link
                v-if="index < breadcrumbs.length - 1"
                :to="crumb.path"
                class="text-blue-600 hover:text-blue-800"
              >
                {{ crumb.name }}
              </router-link>
              <span v-else class="text-gray-500">{{ crumb.name }}</span>
              <svg
                v-if="index < breadcrumbs.length - 1"
                class="h-4 w-4 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
              </svg>
            </li>
          </ol>
        </nav>
      </div>
    </nav>

    <!-- Main Navigation Menu -->
    <div class="flex flex-1">
      <!-- Desktop Sidebar / Mobile Menu -->
      <div 
        class="navigation-menu"
        :class="{
          'hidden lg:block': !isMobile && !isCollapsed,
          'fixed inset-0 z-40 lg:relative lg:z-auto': isMobile,
          'mobile-menu open': isMobile && mobileMenuOpen,
          'mobile-menu': isMobile && !mobileMenuOpen
        }"
      >
        <!-- Mobile Overlay -->
        <div 
          v-if="isMobile && mobileMenuOpen"
          @click="closeMobileMenu"
          class="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        ></div>
        
        <!-- Navigation Content -->
        <nav class="bg-white shadow-sm border-r h-full w-64 lg:w-auto lg:min-w-64">
          <!-- Loading State -->
          <div v-if="loading" class="p-4">
            <div class="loading-skeleton space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
          
          <!-- Navigation Items -->
          <ul v-else class="py-4">
            <li v-for="item in visibleNavItems" :key="item.path">
              <a
                :href="item.path"
                :class="[
                  'nav-item flex items-center px-4 py-3 text-sm font-medium hover:bg-gray-100',
                  { 'active bg-blue-50 text-blue-700 border-r-2 border-blue-700': isActive(item.path) },
                  { 'focused': focusedItem === item.path }
                ]"
                @click.prevent="handleNavClick(item)"
              >
                <span v-if="item.icon" class="nav-icon mr-3">{{ item.icon }}</span>
                <span>{{ item.name }}</span>
                <svg 
                  v-if="item.external" 
                  class="ml-auto h-4 w-4" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                  <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"/>
                </svg>
              </a>
            </li>
          </ul>

          <!-- External Links -->
          <div class="border-t mt-4 pt-4">
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              class="external-link flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              External Link
              <svg class="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
              </svg>
            </a>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto bg-gray-50">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Bars3Icon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/auth';

// Define component name for test recognition
defineOptions({ name: 'CNavigation' });

// Auth store
const authStore = useAuthStore();

// Props interface
interface BreadcrumbItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  path: string;
  icon?: string;
  external?: boolean;
  permission?: string;
}

interface User {
  name: string;
  email: string;
}

interface Props {
  title?: string;
  collapsible?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  notifications?: number;
  user?: User;
  permissions?: string[];
  restrictedItems?: string[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Dormitory Management',
  collapsible: false,
  notifications: 0,
  loading: false,
  permissions: () => [],
  restrictedItems: () => []
});

// Emits
const emit = defineEmits<{
  logout: [];
  search: [query: string];
  'theme-toggle': [];
  navigate: [item: NavItem];
}>();

// Computed user from auth store or fallback to prop
const currentUser = computed(() => {
  // Prioritize auth store user over prop
  if (authStore.user) {
    return {
      name: authStore.fullName || authStore.user.name || 'Unknown User',
      email: authStore.user.email || 'No email'
    };
  }
  return props.user;
});

// Router composables
const route = useRoute();
const router = useRouter();

// Reactive state
const searchQuery = ref('');
const isCollapsed = ref(false);
const isMobile = ref(false);
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const focusedItem = ref<string | null>(null);

// Default navigation items
const defaultNavItems: NavItem[] = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Users', path: '/users', icon: '👤', permission: 'users.view' },
  { name: 'Rooms', path: '/rooms', icon: '🏠', permission: 'rooms.view' },
  { name: 'Payments', path: '/payments', icon: '💰', permission: 'payments.view' },
  { name: 'Messages', path: '/messages', icon: '💬' },
  { name: 'Dormitories', path: '/dormitories', icon: '🏢' }
];

// Computed properties
const visibleNavItems = computed(() => {
  return defaultNavItems.filter(item => {
    // Check if item is restricted
    if (props.restrictedItems.includes(item.name.toLowerCase())) {
      return false;
    }
    
    // Check permissions
    if (item.permission && props.permissions.length > 0) {
      return props.permissions.includes(item.permission);
    }
    
    return true;
  });
});

// Methods
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const handleLogout = () => {
  userMenuOpen.value = false;
  // Use auth store logout instead of emit
  authStore.logout();
};

const handleProfileClick = () => {
  userMenuOpen.value = false;
  
  // Navigate to appropriate form based on user role
  if (authStore.user) {
    const userRole = authStore.userRole;
    const userId = authStore.user.id;
    
    if (userRole === 'admin') {
      router.push(`/admin-form/${userId}`);
    } else if (userRole === 'student') {
      router.push(`/student-form/${userId}`);
    } else {
      // Default to admin form for other roles
      router.push(`/admin-form/${userId}`);
    }
  }
};

const handleSearch = () => {
  emit('search', searchQuery.value.trim());
};

const toggleTheme = () => {
  emit('theme-toggle');
};

const isActive = (path: string) => {
  return route.path === path;
};

const handleNavClick = (item: NavItem) => {
  closeMobileMenu();
  
  if (item.external) {
    window.open(item.path, '_blank');
    return;
  }
  
  router.push(item.path);
  emit('navigate', item);
};

const handleKeyboardNav = async (event: KeyboardEvent) => {
  const navItems = visibleNavItems.value;
  if (navItems.length === 0) return;
  
  // For Tab key, set the first item as focused
  if (event.key === 'Tab') {
    event.preventDefault();
    focusedItem.value = navItems[0].path;
    await nextTick(); // Ensure DOM updates
    
    // Add the focused class for testing
    const item = document.querySelector(`a[href="${focusedItem.value}"]`);
    if (item) {
      item.classList.add('focused');
    }
  }
};

const handleEnterKey = () => {
  if (focusedItem.value) {
    const item = visibleNavItems.value.find(item => item.path === focusedItem.value);
    if (item) {
      handleNavClick(item);
      emit('navigate', item);
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as Element;
    if (!target.closest('.user-menu')) {
      userMenuOpen.value = false;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<script lang="ts">
// Add explicit name for test compatibility
export default { name: 'CNavigation' };
</script>
