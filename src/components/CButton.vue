<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :title="tooltip"
    :class="buttonClasses"
    @click="handleClick"
  >
    <div v-if="icon && iconPosition === 'left'" :class="iconClasses">
      {{ icon }}
    </div>

    <div v-if="loading" class="loading-spinner">
      <ArrowPathIcon class="h-4 w-4 animate-spin" />
    </div>

    <span v-if="label && !$slots.default">{{ label }}</span>
    <slot v-else></slot>

    <div v-if="icon && iconPosition === 'right'" :class="iconClasses">
      {{ icon }}
    </div>

    <button
      v-if="clearable && modelValue"
      type="button"
      class="clear-button ml-2 text-gray-400 hover:text-gray-600"
      @click.stop="handleClear"
    >
      ×
    </button>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";

// Define props using TypeScript
interface Props {
  label?: string;
  variant?: "default" | "primary" | "secondary" | "secondary-circle" | "transparent" | "danger";
  size?: "small" | "medium" | "large";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  outline?: boolean;
  block?: boolean;
  rounded?: boolean;
  tooltip?: string;
  confirm?: string;
  clearable?: boolean;
  modelValue?: any;
}

// Define emits
const emit = defineEmits<{
  click: [event: MouseEvent];
  clear: [];
  "update:modelValue": [value: any];
}>();

// Define props with TypeScript
const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "medium",
  type: "button",
  disabled: false,
  loading: false,
  iconPosition: "left",
  outline: false,
  block: false,
  rounded: false,
});

// Base classes for all buttons
const baseClasses =
  "font-medium inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-white focus:outline-none transition-all";

// Computed property for button classes
const buttonClasses = computed(() => {
  const classes = [baseClasses];

  // Variant classes
  if (props.variant === "primary") {
    classes.push("primary");
    if (props.outline) {
      classes.push(
        "text-primary-500 border border-primary-500 bg-transparent hover:bg-primary-500 hover:text-white focus:ring-4 focus:ring-primary-200"
      );
    } else {
      classes.push(
        "text-white bg-primary-500 hover:bg-primary-600 border border-primary-500 focus:ring-4 focus:ring-primary-200"
      );
    }
  } else if (props.variant === "secondary") {
    classes.push("secondary");
    if (props.outline) {
      classes.push(
        "text-secondary-500 border border-secondary-500 bg-transparent hover:bg-secondary-500 hover:text-white"
      );
    } else {
      classes.push(
        "text-white bg-secondary-500 hover:bg-secondary-600 border border-secondary-500"
      );
    }
  } else if (props.variant === "danger") {
    classes.push("danger");
    if (props.outline) {
      classes.push(
        "text-red-500 border border-red-500 bg-transparent hover:bg-red-500 hover:text-white focus:ring-4 focus:ring-red-200"
      );
    } else {
      classes.push(
        "text-white bg-red-500 hover:bg-red-600 border border-red-500 focus:ring-4 focus:ring-red-200"
      );
    }
  } else if (props.variant === "secondary-circle") {
    classes.push("secondary-circle");
    classes.push(
      "text-secondary-500 border border-secondary-500 bg-transparent hover:bg-secondary-500 hover:text-white focus:ring-4 focus:ring-secondary-300 rounded-lg p-3"
    );
  } else if (props.variant === "transparent") {
    classes.push("transparent");
    classes.push(
      "text-gray-900 bg-transparent hover:text-gray-700 focus:ring-4 focus:ring-gray-200"
    );
  } else {
    classes.push("default");
    classes.push(
      "text-gray-900 bg-white border border-gray-300 hover:bg-gray-200 focus:ring-4 focus:ring-gray-200"
    );
  }

  // Size classes
  if (props.size === "small") {
    classes.push("small", "px-2 py-1 text-sm");
  } else if (props.size === "large") {
    classes.push("large", "px-6 py-3 text-lg");
  } else {
    classes.push("medium", "px-4 py-2 text-base");
  }

  // Additional classes
  if (props.disabled) {
    classes.push("disabled");
  }
  if (props.outline) {
    classes.push("outline");
  }
  if (props.block) {
    classes.push("block", "w-full");
  }
  if (props.rounded) {
    classes.push("rounded", "rounded-full");
  } else {
    classes.push("rounded-lg");
  }

  return classes.join(" ");
});

// Icon classes
const iconClasses = computed(() => {
  const classes = [];
  if (props.iconPosition === "left") {
    classes.push("icon-left");
  } else {
    classes.push("icon-right");
  }
  return classes.join(" ");
});

// Handle click events
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    return;
  }

  if (props.confirm) {
    if (confirm(props.confirm)) {
      emit("click", event);
    }
  } else {
    emit("click", event);
  }
};

// Handle clear
const handleClear = () => {
  emit("clear");
  emit("update:modelValue", "");
};
</script>
