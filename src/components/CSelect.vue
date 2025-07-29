<template>
  <div>
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      :class="['block text-sm font-medium', disabled ? 'text-gray-400' : 'text-gray-900 dark:text-white']"
    >
      {{ label }}
    </label>

    <!-- Select Dropdown -->
    <select
      :id="id"
      v-model="internalValue"
      :class="[
        baseSelectClass,
        validationClass,
        disabled ? disabledSelectClass : '',
      ]"
      :required="required"
      :disabled="disabled"
    >
      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <!-- options must always have a defined value (string | number) -->
      <option
        v-for="option in safeOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.name }}
      </option>
    </select>

    <!-- Validation Message -->
    <p v-if="validationMessage" :class="validationMessageClass">
      <span class="font-medium">{{ validationMessagePrefix }}</span>
      {{ validationMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type ComputedRef } from "vue";

// Define the type for options
interface Option {
  value: string | number;
  name: string;
}

// Define props using TypeScript
interface Props {
  id: string;
  label?: string;
  modelValue?: string | number;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  validationState?: "success" | "error" | "";
  validationMessage?: string;
  disabled?: boolean;
}

// Define props
const props = defineProps<Props>();

// Computed property to filter out options with undefined/null value
const safeOptions: ComputedRef<Array<{ value: string | number; name: string }>> = computed(() =>
  (props.options || []).filter((o): o is { value: string | number; name: string } => o.value !== undefined && o.value !== null)
);

// Emit events
const emit = defineEmits<{
  (event: "update:modelValue", value: string | number): void;
}>();

// Internal state for v-model
const internalValue = ref(props.modelValue);

// Watch for changes in modelValue and update internalValue
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  },
  { immediate: true }
);

// Emit changes to modelValue when internalValue changes
watch(internalValue, (newValue) => {
  emit("update:modelValue", newValue);
});

// Base Classes
const baseSelectClass =
  "bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-4 focus:ring-primary-300 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-700 dark:focus:border-primary-500";

// Disabled Classes
const disabledSelectClass = 'cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400';

// Validation Classes
const validationClass = computed(() => {
  switch (props.validationState) {
    case "success":
      return "bg-green-50 border-green-500 text-green-900 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500 dark:text-green-400";
    case "error":
      return "bg-red-50 border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 dark:text-red-500";
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
</script>
