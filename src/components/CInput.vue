<template>
  <!-- Label -->
  <label
    v-if="label"
    :for="id"
    class="block text-sm font-medium"
    :class="labelClass"
  >
    {{ label }}
  </label>

  <!-- Input with Icon or Prepend Text -->
  <div v-if="icon || prependText || type === 'search' || type === 'email' || type === 'tel'" class="relative">
    <!-- Search Icon -->
    <component
      v-if="type === 'search'"
      :is="MagnifyingGlassIcon"
      class="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-8 text-gray-500 dark:text-gray-400 pointer-events-none pl-3"
    />
    <!-- Email Icon -->
    <component
      v-else-if="type === 'email'"
      :is="EnvelopeIcon"
      class="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-8 text-gray-500 dark:text-gray-400 pointer-events-none pl-3"
    />
    <!-- Mobile Icon -->
    <component
      v-else-if="type === 'tel'"
      :is="PhoneIcon"
      class="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-8 text-gray-500 dark:text-gray-400 pointer-events-none pl-3"
    />
    <!-- Custom Icon -->
    <component
      v-else-if="icon"
      :is="icon"
      class="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-8 text-gray-500 dark:text-gray-400 pointer-events-none pl-3"
      :class="iconClass"
    />
    <!-- Prepend Text -->
    <span
      v-else
      class="absolute inset-y-0 left-0 flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
    >
      {{ prependText }}
    </span>
    <input
      :type="type"
      :id="id"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        baseInputClass,
        validationClass,
        icon || prependText || type === 'search' || type === 'email' || type === 'tel' ? 'pl-10' : '',
      ]"
      :required="required"
      :pattern="pattern"
    />
  </div>

  <!-- Input Without Icon -->
  <input
    v-else
    :type="type"
    :id="id"
    :placeholder="placeholder"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="[baseInputClass, validationClass]"
    :required="required"
    :pattern="pattern"
  />

  <!-- Validation Message -->
  <p v-if="validationMessage" :class="validationMessageClass">
    <span class="font-medium">{{ validationMessagePrefix }}</span>
    {{ validationMessage }}
  </p>
</template>

<script setup>
import { computed } from 'vue';
import { MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/vue/24/outline'; // Correct imports

// Props
const {
  id,
  type,
  label,
  placeholder,
  modelValue,
  required,
  pattern,
  validationState,
  validationMessage,
  prependText,
  icon,
} = defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  pattern: {
    type: String,
    default: '.*',
  },
  validationState: {
    type: String,
    default: '', // 'success', 'error', or ''
  },
  validationMessage: {
    type: String,
    default: '',
  },
  prependText: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
});

// Computed Classes
const baseInputClass =
  'bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-4 focus:ring-primary-300 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500';

const validationClass = computed(() => {
  switch (validationState) {
    case 'success':
      return 'bg-green-50 border-green-500 text-green-900 placeholder-green-700 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500 dark:text-green-400 dark:placeholder-green-500';
    case 'error':
      return 'bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500';
    default:
      return 'border-gray-300';
  }
});

const validationMessageClass = computed(() => {
  return validationState === 'success'
    ? 'text-sm text-green-600 dark:text-green-500'
    : 'text-sm text-red-600 dark:text-red-500';
});

const validationMessagePrefix = computed(() => {
  return validationState === 'success' ? 'Well done!' : 'Oh, snap!';
});

const iconClass = computed(() => {
  return validationState === 'success'
    ? 'text-green-500'
    : validationState === 'error'
    ? 'text-red-500'
    : 'text-gray-500 dark:text-gray-400';
});

const labelClass = computed(() => {
  return validationState === 'success'
    ? 'text-green-700 dark:text-green-500'
    : validationState === 'error'
    ? 'text-red-700 dark:text-red-500'
    : 'text-gray-900 dark:text-white';
});
</script>