<template>
  <div class="flex items-center">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded-sm focus:ring-4 focus:ring-primary-300 focus:ring-offset-0 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
    />
    <label
      :for="id"
      class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Define props using TypeScript
interface Props {
  id: string;
  label?: string;
  modelValue?: boolean;
}

// Define props
const props = defineProps<Props>();

// Define emits
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();
</script>