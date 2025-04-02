<template>
    <aside
        class="flex flex-col overflow-x-auto bg-primary-50 p-4 shadow lg:static lg:h-auto lg:w-64 lg:flex-col lg:overflow-visible"
      >
        <!-- Menu Items -->
        <nav class="w-full flex-col space-y-2 lg:flex">
          <div v-for="menu in topLevelMenus" :key="menu.name">
            <!-- Top-Level Menu -->
            <router-link
              :to="menu.path"
              :class="[
                'flex w-full items-center gap-3 rounded p-3 text-left text-base leading-5 font-medium hover:bg-primary-100',
                route.path === menu.path
                  ? 'bg-primary-100'
                  : 'bg-transparent lg:text-gray-500',
              ]"
            >
              <component
                :is="menu.meta.icon"
                class="h-5 w-5"
                :class="
                  route.path === menu.path
                    ? 'text-secondary-500'
                    : 'text-gray-500'
                "
              />
              {{ t(menu.meta.title) }}
            </router-link>

            <!-- Submenus -->
            <div
              v-if="menu.submenus && menu.submenus.length && isSubmenuActive(menu.submenus)"
              class="ml-6 space-y-2"
            >
              <router-link
                v-for="submenu in menu.submenus"
                :key="submenu.name"
                :to="submenu.path"
                :class="[
                  'flex w-full items-center gap-3 rounded p-3 text-left text-sm leading-5 font-medium hover:bg-primary-100',
                  isSubmenuHighlighted(submenu)
                    ? 'bg-primary-100'
                    : 'bg-transparent lg:text-gray-500',
                ]"
              >
                <component
                  :is="submenu.meta.icon"
                  class="h-4 w-4"
                  :class="
                    isSubmenuHighlighted(submenu)
                      ? 'text-secondary-500'
                      : 'text-gray-500'
                  "
                />
                {{ t(submenu.meta.title) }}
              </router-link>
            </div>
          </div>
        </nav>
      </aside>
</template>
<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// Get the current route
const route = useRoute();
const router = useRouter();

// Import the `t` function from vue-i18n
const { t } = useI18n();

// Filter top-level menus
const topLevelMenus = ref(
  router.options.routes
    .filter((route) => route.meta?.sidebar && !route.meta?.parent)
    .map((menu) => ({
      ...menu,
      submenus: router.options.routes.filter(
        (submenu) => submenu.meta?.parent === menu.name && submenu.meta?.sidebar
      ),
    }))
);

// Check if any submenu is active
const isSubmenuActive = (submenus) => {
  return submenus.some((submenu) => {
    // Use route.matched to check if the current route matches the submenu's path
    return route.matched.some((matchedRoute) => matchedRoute.path === submenu.path);
  });
};

// Check if a specific submenu is highlighted
const isSubmenuHighlighted = (submenu) => {
  return route.matched.some((matchedRoute) => matchedRoute.path === submenu.path);
};

// Watch for route changes to update the sidebar dynamically
watch(
  () => route.path,
  () => {
    // Recompute top-level menus and submenus when the route changes
    topLevelMenus.value = router.options.routes
      .filter((route) => route.meta?.sidebar && !route.meta?.parent)
      .map((menu) => ({
        ...menu,
        submenus: router.options.routes.filter(
          (submenu) =>
            submenu.meta?.parent === menu.name && submenu.meta?.sidebar
        ),
      }));
  }
);
</script>