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
            class="block border-transparent p-3 focus:ring-0 lg:hidden lg:focus:ring-2 text-primary-900"
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
      <Sidebar
        class="lg:max-h-screen overflow-hidden transition-all duration-150 ease-in"
        :class="{
          'max-h-[0px] opacity-0': isSideMenuOpen === false,
          'max-h-[700px] opacity-100': isSideMenuOpen === true,
        }"
      />
      <!-- Content -->
      <main class="flex-1 bg-white p-6 shadow space-y-6 overflow-auto">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { FwbButton } from "flowbite-vue";
import { ref } from "vue";
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import Sidebar from "./Sidebar.vue";

defineProps({
  title: {
    type: String,
    default: "Admin Panel",
  },
});

// State for mobile menu toggle
const isSideMenuOpen = ref(false);
</script>