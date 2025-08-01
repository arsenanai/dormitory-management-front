<template>
  <aside
    class="overflow-hidden lg:static lg:w-64 lg:flex-shrink-0 z-10"
  >
    <nav
      v-if="isVisible"
      class="flex flex-col space-y-2 p-4"
      aria-label="Main sidebar navigation"
    >
      <h2 class="sr-only">Main Navigation</h2>
      <div v-for="menu in topLevelMenus" :key="menu.name" class="p-0">
        <!-- Top-Level Menu -->
        <router-link
          :to="menu.path"
          :class="[
            'hover:bg-primary-100 focus:ring-3 focus:outline-none focus:ring-secondary-300 flex w-full items-center gap-3 rounded p-3 text-left text-base leading-5 font-medium transition-all duration-150',
            route.path === menu.path
              ? 'bg-primary-100 shadow border-l-4 border-l-secondary-600'
              : 'bg-transparent lg:text-gray-500 border-l-4 border-l-transparent',
          ]"
          :aria-current="route.path === menu.path ? 'page' : undefined"
        >
          <component
            :is="menu.meta.icon"
            class="h-5 w-5"
            :class="
              route.path === menu.path ? 'text-secondary-600' : 'text-gray-500'
            "
            aria-hidden="true"
          />
          <span class="flex-1">{{ t(menu.meta.title) }}</span>
          <!-- Badge for messages -->
          <span 
            v-if="menu.name === 'Messages' && unreadMessagesCount > 0"
            class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]"
          >
            {{ unreadMessagesCount > 99 ? '99+' : unreadMessagesCount }}
          </span>
        </router-link>

        <!-- Submenus -->
        <div
          v-if="
            menu.submenus &&
            menu.submenus.length &&
            isSubmenuActive(menu.submenus)
          "
          class="mt-2 ml-6 flex flex-col gap-2 space-y-2"
        >
          <router-link
            v-for="submenu in menu.submenus"
            :key="submenu.name"
            :to="submenu.path"
            :class="[
              'hover:bg-primary-100 focus:ring-3 focus:outline-none focus:ring-secondary-300 flex w-full items-center gap-3 rounded p-3 text-left text-sm leading-5 font-medium transition-all duration-150',
              isSubmenuHighlighted(submenu)
                ? 'bg-primary-100 shadow border-l-4 border-l-secondary-600'
                : 'bg-transparent lg:text-gray-500 border-l-4 border-l-transparent',
            ]"
            :aria-current="isSubmenuHighlighted(submenu) ? 'page' : undefined"
          >
            <component
              :is="submenu.meta.icon"
              class="h-4 w-4"
              :class="
                isSubmenuHighlighted(submenu)
                  ? 'text-secondary-600'
                  : 'text-gray-500'
              "
              aria-hidden="true"
            />
            {{ t(submenu.meta.title) }}
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

// Define the type for a menu item
interface Menu {
  name: string;
  path: string;
  meta: {
    title: string;
    icon: object | (() => void);
    sidebar?: boolean;
    parent?: string;
    roles?: string[];
  };
  submenus?: Menu[];
}

// Get the current route and router
const route = useRoute();
const router = useRouter();

// Import the `t` function from vue-i18n
const { t } = useI18n();

// Get auth store for role-based access
const authStore = useAuthStore();

// Mock unread messages count (in real app, this would come from a messages store)
const unreadMessagesCount = ref(3);

// State to control visibility
const isVisible = ref(true);

// Function to map a route to a menu item
const mapRouteToMenu = (route: any): Menu => ({
  name: route.name as string,
  path: route.path,
  meta: {
    title: (route.meta?.title as string) || "",
    icon: (route.meta?.icon as object | (() => void)) || (() => {}),
    sidebar: (route.meta?.sidebar as boolean) || false,
    parent: (route.meta?.parent as string) || "",
    roles: (route.meta?.roles as string[]) || [],
  },
  submenus: [],
});

// Function to map submenus for a given menu
const mapSubmenus = (menuName: string): Menu[] => {
  return router.options.routes
    .filter(
      (submenu) => submenu.meta?.parent === menuName && submenu.meta?.sidebar,
    )
    .filter((submenu) => {
      // Check role-based access
      if (submenu.meta?.roles && submenu.meta.roles.length > 0) {
        return submenu.meta.roles.includes(authStore.userRole || '');
      }
      return true;
    })
    .map(mapRouteToMenu);
};

// Filter top-level menus with role-based access
const topLevelMenus = computed<Menu[]>(() => {
  return router.options.routes
    .filter((route) => route.meta?.sidebar && !route.meta?.parent)
    .filter((route) => {
      // Check role-based access
      if (route.meta?.roles && route.meta.roles.length > 0) {
        return route.meta.roles.includes(authStore.userRole || '');
      }
      return true;
    })
    .map((menu) => ({
      ...mapRouteToMenu(menu),
      submenus: mapSubmenus(menu.name as string),
    }));
});

// Check if any submenu is active
const isSubmenuActive = (submenus: Menu[]): boolean => {
  return submenus.some((submenu) => {
    return route.matched.some(
      (matchedRoute: RouteLocationMatched) =>
        matchedRoute.path === submenu.path,
    );
  });
};

// Check if a specific submenu is highlighted
const isSubmenuHighlighted = (submenu: Menu): boolean => {
  return route.matched.some(
    (matchedRoute: RouteLocationMatched) => matchedRoute.path === submenu.path,
  );
};

// Watch for route changes and user role changes to update the sidebar dynamically
watch(
  [() => route.path, () => authStore.userRole],
  () => {
    // The computed property will automatically update when dependencies change
  },
);
</script>
