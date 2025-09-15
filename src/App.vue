<template>
  <router-view v-slot="{ Component }" class="">
    <component :is="Component" />
  </router-view>
  <div
    v-if="appVersion"
    class="fixed bottom-2 left-2 text-[10px] md:text-xs text-gray-500 bg-white/70 dark:bg-gray-800/70 px-2 py-1 rounded shadow-sm select-none"
  >
    v{{ appVersion }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter, RouteLocationNormalized } from "vue-router";
import { initFlowbite } from "flowbite";
import { useAuthStore } from '@/stores/auth';

// Hardcoded version label
const appVersion = "1.0.1";

// Initialize the router
const router = useRouter();
const authStore = useAuthStore();

// Optional: Watch for route changes
watch(
  () => router.currentRoute.value,
  (newRoute: RouteLocationNormalized) => {
    console.log("Route changed to:", newRoute.path);
  },
);

// Initialize Flowbite and auth on component mount
onMounted(async () => {
  initFlowbite();
  try {
    await authStore.initializeAuth();
  } catch (error) {
    console.warn('Auth initialization failed:', error);
  }
});
</script>

<style></style>
