<template>
  <label
    :for="id"
    class="block text-sm font-medium text-gray-900 dark:text-white"
  >
    {{ label }}
  </label>
  <textarea
    :id="id"
    :rows="rows"
    :placeholder="placeholder"
    :value="modelValue"
    @input="updateValue(($event.target as HTMLTextAreaElement).value)"
    :class="[
      baseTextareaClass,
      validationState === 'success' ? successClass : 
      validationState === 'error' ? errorClass : 
      validationClass,
    ]"
    :readonly="readonly"
  ></textarea>
  <p v-if="!isValid" class="mt-1 text-sm text-red-600 dark:text-red-500">
    {{ validationMessage }}
  </p>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// Props
const {
  id,
  label,
  rows,
  placeholder,
  validationMessage,
  readonly,
  modelValue,
  required = false,
  validationState = "",
} = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "Your message",
  },
  rows: {
    type: Number,
    default: 4,
  },
  placeholder: {
    type: String,
    default: "Write your thoughts here...",
  },
  validationMessage: {
    type: String,
    default: "This field cannot be empty.",
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  validationState: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["update:modelValue"]);

// State
const inputValue = ref(modelValue);
const isValid = ref(true);

// Watch for external changes to modelValue
watch(
  () => modelValue,
  (newValue) => {
    inputValue.value = newValue;
  }
);

// Methods
const updateValue = (value: string) => {
  inputValue.value = value;
  emit("update:modelValue", value);
};

const validateInput = () => {
  isValid.value = inputValue.value.trim().length > 0;
};

// Classes
const baseTextareaClass =
  "block p-2.5 w-full text-sm rounded-lg border focus:ring-4 focus:outline-none transition-colors";

const validationClass =
  "border-gray-300 text-gray-900 bg-gray-50 focus:ring-primary-300 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500";

const errorClass =
  "border-red-500 text-red-900 bg-red-50 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 dark:text-red-500 dark:focus:ring-red-500 dark:focus:border-red-500";

const successClass =
  "border-green-500 text-green-900 bg-green-50 focus:ring-green-300 focus:border-green-500 dark:bg-green-900 dark:border-green-400 dark:text-green-400 dark:focus:ring-green-800 dark:focus:border-green-400";
</script>