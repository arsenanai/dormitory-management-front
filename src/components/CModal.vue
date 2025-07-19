<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative" @click.stop>
      <CButton
        @click="$emit('update:modelValue', false)"
        class="absolute top-2 right-2"
        variant="secondary"
        size="small"
        aria-label="Close"
        :label="'×'"
      />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import CButton from './CButton.vue';
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* Optional: add transitions or custom styles here */
</style>
