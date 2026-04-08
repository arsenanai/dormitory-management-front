<template>
  <div class="flex items-center">
    <input
      :id="id"
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
      :class="[
        'text-primary-500 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'focus:ring-primary-300 dark:focus:ring-primary-600 focus:ring-4 focus:ring-offset-0 dark:ring-offset-gray-800',
      ]"
    />
    <label
      :for="id"
      :class="[
        'ml-2 text-sm font-medium',
        disabled
          ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
          : 'text-gray-900 dark:text-gray-300',
      ]"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Define props using TypeScript
interface Props {
  id: string;
  label?: string;
  modelValue?: boolean | unknown[];
  value?: unknown;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean | unknown[]): void;
}>();

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return !!props.modelValue;
});

const handleChange = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  if (Array.isArray(props.modelValue)) {
    const next = [...props.modelValue];
    if (checked) {
      next.push(props.value);
    } else {
      const idx = next.indexOf(props.value);
      if (idx > -1) next.splice(idx, 1);
    }
    emit("update:modelValue", next);
  } else {
    emit("update:modelValue", checked);
  }
};
</script>
