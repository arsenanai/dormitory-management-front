<template>
  <router-view v-slot="{ Component }" class="">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter, RouteLocationNormalized } from "vue-router";
import { initFlowbite } from "flowbite";

// Initialize the router
const router = useRouter();

// Optional: Watch for route changes
watch(
  () => router.currentRoute.value,
  (newRoute: RouteLocationNormalized) => {
    console.log("Route changed to:", newRoute.path);
  },
);

// Initialize Flowbite on component mount
onMounted(() => {
  initFlowbite();
});
</script>

<style></style>
