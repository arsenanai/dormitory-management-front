<template>
  <button type="button" :class="[baseClasses, variantClasses]">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Define props using TypeScript
interface Props {
  variant?: "default" | "primary" | "secondary-circle" | "transparent";
}

// Define props with TypeScript
const props = defineProps<Props>();

// Base classes for all buttons
const baseClasses =
  "font-medium inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-white focus:outline-none transition-all";

// Computed property for variant-specific classes
const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "text-primary-500 border border-primary-500 bg-transparent hover:bg-primary-500 hover:text-white focus:ring-4 focus:ring-primary-300 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-500 dark:hover:text-white dark:focus:ring-primary-700 rounded-lg px-4 py-2 text-base";
    case "secondary-circle":
      return "text-secondary-500 border border-secondary-500 bg-transparent hover:bg-secondary-500 hover:text-white focus:ring-4 focus:ring-secondary-300 dark:border-secondary-400 dark:text-secondary-400 dark:hover:bg-secondary-500 dark:hover:text-white dark:focus:ring-secondary-700 rounded-lg p-3";
    case "transparent":
      return "text-gray-900 bg-transparent hover:text-gray-700 focus:ring-4 focus:ring-gray-200 dark:text-white dark:bg-transparent dark:hover:text-gray-300 dark:focus:ring-gray-700 px-4 py-2 text-base";
    default:
      return "text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 rounded-lg px-4 py-2 text-base";
  }
});
</script>