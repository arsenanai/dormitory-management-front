<template>
  <!-- Global Wrapper -->
  <div :id="`${id}-input-wrapper`">
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-medium" :class="labelClass">
      {{ label }}
    </label>
    <div
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
      <span
        v-else-if="prependText"
        class="absolute inset-y-0 left-0 flex items-center rounded-l-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
      >
        {{ prependText }}
      </span>

      <!-- Input -->
      <input
        :type="type"
        :id="id"
        :placeholder="placeholder"
        :value="modelValue"
        @input="onInput"
        :class="inputClass"
        :required="required"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :readonly="readonly"
      />
    </div>
    <!-- Validation Message -->
    <p v-if="validationMessage" :id="`${id}-validation`" :class="validationMessageClass">
      <span class="font-medium">{{ validationMessagePrefix }}</span>
      {{ validationMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, useAttrs } from "vue";
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  id: String,
  type: String,
  label: String,
  placeholder: String,
  modelValue: [String, Number],
  required: Boolean,
  readonly: Boolean,
  pattern: String,
  validationState: String,
  validationMessage: String,
  prependText: String,
  icon: [Object, Function],
  autocomplete: String,
  mask: String,
});
const emit = defineEmits(["update:modelValue"]);
const $attrs = useAttrs();

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit(
    "update:modelValue",
    props.mask ? applyMask(value, props.mask) : value
  );
}

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
  return props.validationState === "success" ? "Well done!" : "";
});

const labelClass = computed(() => {
  return props.validationState === "success"
    ? "text-green-700 dark:text-green-500"
    : props.validationState === "error"
      ? "text-red-700 dark:text-red-500"
      : "text-gray-900 dark:text-white";
});

const iconClass = computed(() => {
  return props.validationState === "success"
    ? "text-green-500"
    : props.validationState === "error"
      ? "text-red-500"
      : "text-gray-500 dark:text-gray-400";
});

const inputClass = computed(() => [
  baseInputClass,
  validationClass.value,
  (props.icon || props.prependText || props.type === 'search' || props.type === 'email' || props.type === 'tel') ? 'pl-10' : '',
  $attrs.class
]);

// Example mask function (replace with your actual logic)
function applyMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, "");
  let maskedValue = "";
  let digitIndex = 0;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "X") {
      if (digitIndex < digits.length) {
        maskedValue += digits[digitIndex];
        digitIndex++;
      } else {
        break;
      }
    } else {
      maskedValue += mask[i];
    }
  }

  return maskedValue;
}
</script>