<template>
  <div class="flex h-auto lg:h-screen flex-col">
    <!-- Top Navigation Bar (not fixed) -->
    <nav 
      class="relative z-30"
      @keydown.tab="handleKeyboardNav"
      @keydown.enter="handleEnterKey"
    >
      <!-- Main Navigation Bar -->
      <div class="flex flex-row items-center justify-between py-2 pr-4">
        <!-- Logo & Brand Section -->
        <div class="flex items-center justify-start space-x-2 lg:w-64 lg:justify-center">
          <!-- Mobile Menu Toggle -->
          <button
            v-if="isMobile"
            @click="toggleMobileMenu"
            class="lg:hidden p-2 rounded hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            :aria-label="'Toggle mobile menu'"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>
          
          <!-- Collapse Button (desktop) -->
          <button
            v-if="collapsible"
            @click="toggleCollapse"
            class="hidden lg:block p-2 rounded hover:bg-gray-200"
          >
            <Bars3Icon class="h-5 w-5" />
          </button>
          
          <img src="/src/assets/sdu logo.png" class="h-12 inline-block" alt="Logo" />
          <span class="text-lg font-bold text-primary-700 lg:hidden">{{ title }}</span>
        </div>

        <!-- Desktop Title (aligned with main content) -->
        <div class="hidden lg:flex items-center">
          <span class="text-lg font-bold text-primary-700">{{ title }}</span>
        </div>

        <!-- Spacer -->
        <div class="flex flex-1"></div>

        <!-- User Menu & Actions -->
        <div class="flex items-center space-x-2 lg:space-x-4">
          <!-- User Info & Menu -->
          <div class="relative z-40">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 p-2 rounded hover:bg-gray-200 user-menu-button"
              data-testid="user-menu-button"
              type="button"
            >
              <div v-if="currentUser" class="text-right">
                <p class="text-sm font-medium text-primary-700">{{ currentUser.name }}</p>
                <p class="text-xs text-primary-500">{{ currentUser.email }}</p>
              </div>
              <div v-else class="text-right">
                <p class="text-sm font-medium text-primary-700">IBRAHIM TUNCER</p>
                <p class="text-xs text-primary-500">Super Admin</p>
              </div>
              <ChevronDownIcon class="h-4 w-4" />
            </button>
            
            <!-- User Dropdown Menu -->
            <Teleport to="body">
              <div 
                v-if="userMenuOpen"
                :class="[
                  'fixed w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-[9999] user-menu-dropdown',
                  isAccessibilityMode ? 'border' : ''
                ]"
                :style="dropdownStyle"
                :data-visible="userMenuOpen"
              >
                <button 
                  @click="handleProfileClick"
                  data-testid="profile-link"
                  class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-200"
                >
                  Profile
                </button>
                <hr class="my-1 border-gray-200">
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-200 text-red-600"
                >
                  Logout
                </button>
              </div>
            </Teleport>
          </div>
        </div>
      </div>

      <!-- Breadcrumbs -->
      <div v-if="breadcrumbs && breadcrumbs.length" class="px-4 py-2 border-t border-gray-200">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-1">
            <li v-for="(crumb, index) in breadcrumbs" :key="index">
              <router-link
                v-if="index < breadcrumbs.length - 1"
                :to="crumb.path"
                class="text-blue-600 hover:text-blue-800"
              >
                {{ crumb.name }}
              </router-link>
              <span v-else class="text-gray-500">{{ crumb.name }}</span>
              <ChevronRightIcon
                v-if="index < breadcrumbs.length - 1"
                class="h-4 w-4 text-gray-400 mx-1"
              />
            </li>
          </ol>
        </nav>
      </div>
    </nav>

    <!-- Mobile Sidebar (expands below navigation bar) -->
    <div 
      v-if="isMobile && mobileMenuOpen"
      class="lg:hidden transition-all duration-300 ease-in-out relative z-30 lg:z-10 border-b border-gray-200 bg-white max-h-screen overflow-y-auto"
    >
      <div class="bg-white shadow-sm">
        <CSidebar @nav-click="handleSidebarNavClick" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex flex-1 relative">
      <!-- Desktop Sidebar -->
      <div 
        v-if="!isMobile"
        class="hidden lg:block border-r border-gray-200 w-64 relative z-10"
      >
        <CSidebar />
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto bg-white shadow relative min-h-full p-4 lg:p-6 z-10 lg:z-30">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, Teleport } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Bars3Icon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import CSelect from '@/components/CSelect.vue';
import { useAccessibility } from '@/composables/useAccessibility';
import CSidebar from '@/components/CSidebar.vue';

// Define component name for test recognition
defineOptions({ name: 'CNavigation' });

// Auth store
const authStore = useAuthStore();

// Accessibility composable
const { settings: accessibilitySettings } = useAccessibility();

// Props interface
interface BreadcrumbItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  path: string;
  icon?: any;
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
const isCollapsed = ref(false);
const isMobile = ref(false);
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const focusedItem = ref<string | null>(null);

// Dynamic navigation items from router configuration
const defaultNavItems = computed<NavItem[]>(() => {
  return router.options.routes
    .filter((route) => route.meta?.sidebar && !route.meta?.parent)
    .filter((route) => {
      // Check role-based access
      if (route.meta?.roles && Array.isArray(route.meta.roles) && route.meta.roles.length > 0) {
        return route.meta.roles.includes(authStore.userRole || '');
      }
      return true;
    })
    .map((route) => ({
      name: (route.meta?.title as string) || (route.name as string) || '',
      path: route.path,
      icon: (route.meta?.icon as any) || HomeIcon,
      permission: (route.meta?.permission as string) || undefined,
    }));
});

// Computed properties
const isAccessibilityMode = computed(() => accessibilitySettings.accessibilityMode);

const dropdownStyle = computed(() => {
  if (!userMenuOpen.value) return {};
  
  // Default positioning - will be refined if needed
  return {
    right: '1rem',
    top: '4rem'
  };
});

const visibleNavItems = computed(() => {
  return defaultNavItems.value.filter((item: NavItem) => {
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
  
  // Always navigate to account preferences for own profile
  router.push('/account-preferences');
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

const handleSidebarNavClick = (item: any) => {
  closeMobileMenu();
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
    const item = visibleNavItems.value.find((item: NavItem) => item.path === focusedItem.value);
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
    const userMenuButton = target.closest('.user-menu-button');
    const userMenuDropdown = target.closest('.user-menu-dropdown');
    
    // Only close if we're not clicking on the button or dropdown
    if (!userMenuButton && !userMenuDropdown) {
      userMenuOpen.value = false;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const { t } = useI18n();
</script>