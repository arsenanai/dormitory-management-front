<template>
  <div id="test-e2e-marker">E2E Marker</div>
  <router-view v-slot="{ Component }" class="">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter, RouteLocationNormalized } from "vue-router";
import { initFlowbite } from "flowbite";
import { useAuthStore } from '@/stores/auth';

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
onMounted(() => {
  console.log('E2E DEBUG: App.vue mounted');
  initFlowbite();
  authStore.initializeAuth();
});
</script>

<style></style>
