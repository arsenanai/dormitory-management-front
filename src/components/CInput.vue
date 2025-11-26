<template>
  <!-- Global Wrapper -->
    <div :id="`${id}-input-wrapper`" :class="wrapperClass">
      <!-- Label -->
      <label v-if="label" :for="id" class="block text-sm font-medium" :class="labelClass">
        {{ label }}{{ required ? '*' : '' }}
      </label>
      <div class="relative">
        <!-- Prefix Icon -->
        <div v-if="prefix || type === 'search' || type === 'email' || type === 'tel'"
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <component v-if="type === 'search'" :is="MagnifyingGlassIcon"
            class="h-5 w-5 text-gray-500 dark:text-gray-400 prefix-icon" :class="iconClass" />
          <component v-else-if="type === 'email'" :is="EnvelopeIcon"
            class="h-5 w-5 text-gray-500 dark:text-gray-400 prefix-icon" :class="iconClass" />
          <component v-else-if="type === 'tel'" :is="DevicePhoneMobileIcon"
            class="h-5 w-5 text-gray-500 dark:text-gray-400 prefix-icon" :class="iconClass" />
        </div>

        <span v-if="prependText"
          class="absolute inset-y-0 left-0 flex items-center rounded-l-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
          {{ prependText }}
        </span>

        <!-- Input -->
        <input v-bind="$attrs" data-test="visible" :data-testid="dataTestId" :id="idProp" :type="type"
          :placeholder="placeholder" :value="modelValue" @input="onInput" @focus="onFocus" @blur="onBlur"
          @keydown.enter="onEnter" @keydown.escape="onEscape" :class="inputClass" :required="required"
          :disabled="disabled || loading" :readonly="readonly" :pattern="pattern" :autocomplete="autocomplete"
          :min="(type === 'number' || type === 'date') ? min : undefined" :max="type === 'number' ? max : undefined"
          :minlength="minLength" :maxlength="maxLength" :list="datalistId" :tabindex="readonly ? -1 : undefined" />

        <!-- Datalist for autocomplete options (countries/regions/cities) -->
        <datalist v-if="list && datalistId" :id="datalistId">
          <option v-for="(opt, idx) in list" :key="idx" :value="typeof opt === 'string' ? opt : opt.id">
            <template v-if="typeof opt === 'object' && opt.value">{{ opt.value }}</template>
          </option>
        </datalist>
        <!-- Suffix elements -->
        <div v-if="suffix || clearable || loading" class="absolute inset-y-0 right-0 flex items-center pr-3">
          <!-- Loading spinner -->
          <div v-if="loading" class="loading-spinner animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2">
          </div>

          <!-- Clear button -->
          <button v-if="clearable && modelValue && !loading" @click="onClear" type="button"
            class="clear-button text-gray-400 hover:text-gray-600 focus:outline-none">
            ×
          </button>

          <!-- Suffix icon -->
          <span v-if="suffix" class="suffix-icon text-gray-500">{{ suffix }}</span>
        </div>
      </div>

      <!-- Error Message -->
      <p v-if="error" class="error-message text-sm text-red-600 dark:text-red-500 mt-1">
        {{ error }}
      </p>

      <!-- Help Text -->
      <p v-if="help" class="help-text text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ help }}
      </p>

      <!-- Validation Message -->
      <p v-if="validationMessage" :id="`${id}-validation`" :class="validationMessageClass">
        <span class="font-medium">{{ validationMessagePrefix }}</span>
        {{ validationMessage }}
      </p>
    </div>
  </template>

  <script setup lang="ts">
import { computed, defineProps, defineEmits, useAttrs, type PropType } from "vue";
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  id: String,
  dataTestId: String,
  type: { type: String, default: 'text' },
  label: String,
  placeholder: String,
  modelValue: [String, Number],
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  pattern: String,
  validationState: String,
  validationMessage: String,
  prependText: String,
  icon: [Object, Function],
  autocomplete: String,
  mask: String,
  error: String,
  help: String,
  min: [String, Number],
  max: [String, Number],
  minLength: [String, Number],
  maxLength: [String, Number],
  size: String,
  prefix: String,
  suffix: String,
  clearable: Boolean,
  loading: Boolean,
  class: String,
  list: { type: Array as PropType<Array<string | { id: string; value: string }>>, default: undefined },
  wrapperClass: String,
});

const emit = defineEmits([
  "update:modelValue",
  "focus",
  "blur",
  "enter",
  "escape",
  "clear",
  "validation"
]);

const $attrs = useAttrs();

const dataTestId = props.dataTestId || $attrs['data-testid'] || undefined;
const idProp = props.id || $attrs['id'] || undefined;

// computed id for datalist (used as input's list attr)
const datalistId = computed(() => {
  if (!props.list || (Array.isArray(props.list) && props.list.length === 0)) return undefined;
  return idProp ? `${idProp}-datalist` : (dataTestId ? `${dataTestId}-datalist` : undefined);
});

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  const finalValue = props.mask ? applyMask(value, props.mask) : value;
  emit("update:modelValue", finalValue);
}

function onFocus(event: Event) {
  if (props.readonly) {
    (event.target as HTMLInputElement).blur();
    return;
  }
  emit("focus", event);
}

function onBlur(event: Event) {
  emit("blur", event);
  validateInput();
}

function onEnter(event: Event) {
  emit("enter", event);
}

function onEscape(event: Event) {
  emit("escape", event);
}

function onClear() {
  emit("update:modelValue", "");
  emit("clear");
}

function validateInput() {
  const value = props.modelValue;
  let isValid = true;

  if (props.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isValid = emailRegex.test(String(value));
  } else if (props.type === 'number' && value) {
    isValid = !isNaN(Number(value));
  }

  emit("validation", { valid: isValid, value });
}

const baseInputClass =
  "bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-4 focus:ring-primary-300 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500";

const validationClass = computed(() => {
  if (props.error) {
    return "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500 error";
  }

  switch (props.validationState) {
    case "success":
      return "bg-green-50 border-green-500 text-green-900 placeholder-green-700 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500 dark:text-green-400 dark:placeholder-green-500";
    case "error":
      return "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500 error";
    default:
      return "border-gray-300";
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'small p-1.5 text-xs';
    case 'large':
      return 'large p-3 text-base';
    default:
      return '';
  }
});

const stateClasses = computed(() => {
  const classes = [];

  if (props.disabled) classes.push('disabled opacity-50 cursor-not-allowed');
  if (props.readonly) classes.push('readonly bg-gray-100 cursor-not-allowed');

  return classes.join(' ');
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
  if (props.error) {
    return "text-red-700 dark:text-red-500";
  }

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
  sizeClass.value,
  stateClasses.value,
  (props.icon || props.prependText || props.prefix || props.type === 'search' || props.type === 'email' || props.type === 'tel') ? 'pl-10' : '',
  (props.suffix || props.clearable || props.loading) ? 'pr-10' : '',
  props.class
].filter(Boolean).join(' '));

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
