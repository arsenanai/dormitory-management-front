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
  <div
    v-if="
      icon ||
      prependText ||
      type === 'search' ||
      type === 'email' ||
      type === 'tel'
    "
    class="relative"
    v-bind="$attrs"
  >
    <!-- Search Icon -->
    <component
      v-if="type === 'search'"
      :is="MagnifyingGlassIcon"
      class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
    />
    <!-- Email Icon -->
    <component
      v-else-if="type === 'email'"
      :is="EnvelopeIcon"
      class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
    />
    <!-- Mobile Icon -->
    <component
      v-else-if="type === 'tel'"
      :is="DevicePhoneMobileIcon"
      class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
    />
    <!-- Custom Icon -->
    <component
      v-else-if="icon"
      :is="icon"
      class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
      :class="iconClass"
    />
    <!-- Prepend Text -->
    <span
      v-else
      class="absolute inset-y-0 left-0 flex items-center rounded-l-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
    >
      {{ prependText }}
    </span>
    <input
      :type="type"
      :id="id"
      :placeholder="placeholder"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :class="[
        baseInputClass,
        validationClass,
        icon ||
        prependText ||
        type === 'search' ||
        type === 'email' ||
        type === 'tel'
          ? 'pl-10'
          : '',
      ]"
      :required="required"
      :pattern="pattern"
      :autocomplete="autocomplete"
    />
  </div>

  <!-- Input Without Icon -->
  <input
    v-else
    :type="type"
    :id="id"
    :placeholder="placeholder"
    :value="modelValue"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
    :class="[baseInputClass, validationClass]"
    :required="required"
    :readonly="readonly"
    :pattern="pattern"
    :autocomplete="autocomplete"
    v-bind="$attrs"
  />

  <!-- Validation Message -->
  <p v-if="validationMessage" :class="validationMessageClass">
    <span class="font-medium">{{ validationMessagePrefix }}</span>
    {{ validationMessage }}
  </p>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/vue/24/outline";

// Define props using TypeScript
interface Props {
  id: string;
  type?: string;
  label?: string;
  placeholder?: string;
  modelValue?: string | number;
  required?: boolean;
  readonly?: boolean;
  pattern?: string;
  validationState?: "success" | "error" | "";
  validationMessage?: string;
  prependText?: string;
  icon?: object | (() => void);
  autocomplete?: string;
}

// Define props
const props = defineProps<Props>();

// Emit event types
const emit = defineEmits<{
  (event: "update:modelValue", value: string | number): void;
}>();

// Computed Classes
const baseInputClass =
  "bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-4 focus:ring-primary-300 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500";

const validationClass = computed(() => {
  switch (props.validationState) {
    case "success":
      return "bg-green-50 border-green-500 text-green-900 placeholder-green-700 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500 dark:text-green-400 dark:placeholder-green-500";
    case "error":
      return "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500";
    default:
      return "border-gray-300";
  }
});

const validationMessageClass = computed(() => {
  return props.validationState === "success"
    ? "text-sm text-green-600 dark:text-green-500"
    : "text-sm text-red-600 dark:text-red-500";
});

const validationMessagePrefix = computed(() => {
  return props.validationState === "success" ? "Well done!" : "Oh, snap!";
});

const iconClass = computed(() => {
  return props.validationState === "success"
    ? "text-green-500"
    : props.validationState === "error"
      ? "text-red-500"
      : "text-gray-500 dark:text-gray-400";
});

const labelClass = computed(() => {
  return props.validationState === "success"
    ? "text-green-700 dark:text-green-500"
    : props.validationState === "error"
      ? "text-red-700 dark:text-red-500"
      : "text-gray-900 dark:text-white";
});
</script>
