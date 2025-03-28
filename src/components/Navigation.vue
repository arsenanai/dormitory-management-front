<template>
  <div class="flex min-h-screen flex-col bg-gray-100 text-primary-900">
    <!-- Header -->
    <header
      class="flex flex-col items-stretch justify-between bg-primary-50 shadow lg:flex-row"
    >
      <div class="flex flex-1 flex-row items-center justify-between py-2">
        <div
          class="flex items-center justify-start space-x-2 lg:w-64 lg:justify-center lg:space-x-4"
        >
          <!-- Burger Menu -->
          <FwbButton
            type="button"
            outline
            class="block border-transparent p-3 focus:ring-0 lg:hidden lg:focus:ring-2"
            @click="isSideMenuOpen = !isSideMenuOpen"
          >
            <Bars3Icon class="h-6 w-6" />
          </FwbButton>
          <img src="/src/assets/sdu logo.png" class="h-14" alt="Logo" />
        </div>
        <div class="hidden flex-1 font-bold lg:block">
          {{ title }}
        </div>
        <div class="flex items-center space-x-2 lg:space-x-4 lg:pr-4">
          <div class="text-right">
            <p class="text-sm font-bold lg:text-base">
              IBRAHIM TUNCER
            </p>
            <p class="text-xs lg:text-sm">Super Admin</p>
          </div>
          <router-link
            to="/"
            class="lg:focus-ring-2 lg:focus-ring-primary-200 flex items-center gap-3 rounded p-3 text-left text-base leading-5 font-medium hover:bg-primary-100 focus:ring-0"
          >
            <ArrowRightOnRectangleIcon class="h-6 w-6" />
          </router-link>
        </div>
      </div>
      <p class="block p-2 text-center lg:hidden">{{ title }}</p>
    </header>

    <div class="flex flex-1 flex-col lg:flex-row">
      <!-- Sidebar -->
      <aside
        class="flex flex-col overflow-x-auto bg-primary-50 p-4 shadow lg:static lg:h-auto lg:w-64 lg:flex-col lg:overflow-visible"
        :class="isSideMenuOpen ? 'block' : 'hidden lg:block'"
      >
        <!-- Menu Items -->
        <nav class="w-full flex-col space-y-2 lg:flex">
          <router-link
            v-for="menu in menus"
            :key="menu.name"
            :to="menu.path"
            :class="[
              'flex w-full items-center gap-3 rounded p-3 text-left text-base leading-5 font-medium hover:bg-primary-100',
              route.path === menu.path
                ? 'bg-primary-100'
                : 'bg-transparent lg:text-gray-500',
            ]"
          >
            <component
              :is="menu.icon"
              class="h-5 w-5"
              :class="
                route.path === menu.path ? 'text-secondary-500' : 'text-gray-500'
              "
            />
            {{ menu.name }}
          </router-link>
        </nav>
      </aside>

      <!-- Content -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { FwbButton } from "flowbite-vue";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  HomeIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

defineProps({
  title: {
    type: String,
    default: "Admin Panel",
  },
});

// State for mobile menu toggle
const isSideMenuOpen = ref(false);

// Get the current route
const route = useRoute();

// Import the `t` function from vue-i18n
const { t } = useI18n();

// Menu items array with icons and translated names
const menus = [
  { name: t("Main Page"), path: "/main", icon: HomeIcon },
  { name: t("Students"), path: "/students", icon: AcademicCapIcon },
  { name: t("Guest House"), path: "/guest-house", icon: BuildingOfficeIcon },
  { name: t("Messages"), path: "/messages", icon: ChatBubbleLeftRightIcon },
  {
    name: t("Accounting"),
    path: "/accounting",
    icon: ClipboardDocumentListIcon,
  },
  { name: t("Configuration"), path: "/configuration", icon: Cog6ToothIcon },
];
</script>

<style scoped>
/* Add custom styles if needed */
</style>
