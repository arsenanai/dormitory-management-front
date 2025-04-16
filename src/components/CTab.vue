<template>
  <div
    v-show="isActive"
    role="tabpanel"
    :aria-labelledby="`${name}-tab`"
    class="p-4 rounded-lg"
  >
    <slot />
  </div>
</template>

<script setup>
import { inject, onMounted, computed } from 'vue';

// Props
const { name, title } = defineProps({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

// Inject activeTab and registerTab from the parent Tabs component
const activeTab = inject('activeTab');
const registerTab = inject('registerTab');

// Register this tab with the parent Tabs component
onMounted(() => {
  registerTab({ name, title });
});

// Computed property to check if this tab is active
const isActive = computed(() => activeTab.value === name);
</script>