<template>
  <router-view v-slot="{ Component }" class="">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
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
/* Optional: Add transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>