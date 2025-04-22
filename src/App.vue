<template>
  <router-view v-slot="{ Component }" class="">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { initFlowbite } from 'flowbite'

const router = useRouter()

// Optional: Watch for route changes
watch(
  () => router.currentRoute.value,
  (newRoute) => {
    console.log('Route changed to:', newRoute.path)
  }
)

onMounted(() => {
    initFlowbite();
})
</script>

<style>
</style>