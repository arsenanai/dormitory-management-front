<template>
  <router-view v-slot="{ Component }" class="">
    <component :is="Component" />
  </router-view>
  <div
    v-if="appVersion"
    class="fixed bottom-2 left-2 hidden rounded bg-white/70 px-2 py-1 text-[10px] text-gray-500 shadow-sm select-none md:text-xs lg:block dark:bg-gray-800/70"
  >
    v{{ appVersion }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter, RouteLocationNormalized } from "vue-router";
import { initFlowbite } from "flowbite";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

// Hardcoded version label
const appVersion = ref("");

// Initialize the router
const router = useRouter();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

settingsStore.fetchPublicSettings();

// Optional: Watch for route changes
watch(
  () => router.currentRoute.value,
  (newRoute: RouteLocationNormalized) => {
    console.log("Route changed to:", newRoute.path);
  }
);

const fetchAppVersion = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/app-version`);
  const data = await response.json();
  appVersion.value = data.version;
};

// Initialize Flowbite and auth on component mount
onMounted(async () => {
  fetchAppVersion();
  initFlowbite();
  try {
    await authStore.initializeAuth();
  } catch (error) {
    console.warn("Auth initialization failed:", error);
  }
});
</script>

<style></style>
