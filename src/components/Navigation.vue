<template>
  <div class="flex min-h-screen flex-col bg-gray-100">
    <!-- Header -->
    <header
      class="flex flex-col lg:flex-row items-stretch justify-between bg-blue-50  text-blue-800 shadow"
    >
      <div class="flex flex-row items-center justify-between px-2 lg:pl-6 lg:pr-4 py-4 flex-1">
        <div class="flex items-center space-x-2 lg:space-x-4 lg:w-60">
          <!-- Burger Menu -->
          <FwbButton
            type="button"
            outline
            class="block lg:hidden p-3 border-transparent text-blue-900"
            @click="isSideMenuOpen = !isSideMenuOpen"
          >
            <Bars3Icon class="h-6 w-6" />
          </FwbButton>
          <img src="/src/assets/sdu logo.png" class="h-10" alt="Logo">
        </div>
        <div class="flex-1 hidden lg:block text-blue-900 font-bold">
          {{ title }}
        </div> 
        <div class="flex items-center space-x-2 lg:space-x-4">
          <div class="text-right">
            <p class="font-bold text-sm lg:text-base text-blue-900">IBRAHIM TUNCER</p>
            <p class="text-xs lg:text-sm text-blue-900">Super Admin</p>
          </div>
          <router-link
            to="/"
            class="flex items-center gap-3 text-left p-3 rounded font-medium text-base leading-5 hover:bg-blue-100 text-blue-900"
          >
            <ArrowRightOnRectangleIcon class="h-6 w-6" />
          </router-link>
        </div>
      </div>
      <p class="block lg:hidden text-center p-2">{{ title }}</p>
    </header>

    <div class="flex flex-col lg:flex-row flex-1">
      <!-- Sidebar -->
      <aside
        class="flex flex-col overflow-x-auto bg-blue-50 p-4 text-blue-800 shadow lg:static lg:h-auto lg:w-64 lg:flex-col lg:overflow-visible"
        :class="isSideMenuOpen ? 'block' : 'hidden lg:block'"
      >
        <!-- Menu Items -->
        <nav class="w-full flex-col space-y-2 lg:flex">
          <router-link
            v-for="menu in menus"
            :key="menu.path"
            :to="menu.path"
            :class="[
              'flex items-center gap-3 w-full text-left p-3 rounded font-medium text-base leading-5 hover:bg-blue-100',
              route.path === menu.path
                ? 'bg-blue-100 text-blue-900'
                : 'bg-transparent text-blue-900 lg:text-gray-500'
            ]"
          >
            <component
              :is="menu.icon"
              class="h-5 w-5"
              :class="route.path === menu.path ? 'text-blue-900' : 'text-gray-500'"
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
  { name: t("Accounting"), path: "/accounting", icon: ClipboardDocumentListIcon },
  { name: t("Configuration"), path: "/configuration", icon: Cog6ToothIcon },
];
</script>

<style scoped>
/* Add custom styles if needed */
</style>