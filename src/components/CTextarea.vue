<template>
  <div :class="[wrapperClass]">
    <div class="flex items-center justify-between">
      <label :for="id" class="block text-sm font-medium text-gray-900 dark:text-white">
        {{ label }}
      </label>
      <button
        v-if="fullscreen"
        type="button"
        @click="toggleFullScreen"
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        :title="isFullScreen ? t('Exit fullscreen') : t('Enter fullscreen')"
      >
        <ArrowsPointingOutIcon class="h-5 w-5" />
      </button>
    </div>
    <textarea
      :id="id"
      :rows="rows"
      :placeholder="placeholder"
      :value="modelValue"
      @input="updateValue(($event.target as HTMLTextAreaElement).value)"
      :class="[
        baseTextareaClass,
        validationState === 'success'
          ? successClass
          : validationState === 'error'
            ? errorClass
            : validationClass,
        {
          'cursor-not-allowed bg-gray-100 dark:bg-gray-800': readonly || disabled,
          'resize-none': fullscreen,
        },
        additionalClass,
      ]"
      :disabled="readonly || disabled"
      :tabindex="readonly || disabled ? -1 : 0"
      @focus="onFocus"
    ></textarea>
    <p v-if="!isValid" class="mt-1 text-sm text-red-600 dark:text-red-500">
      {{ validationMessage }}
    </p>
    <!-- Fullscreen Overlay -->
    <div v-if="isFullScreen" class="fixed inset-0 z-50 flex flex-col bg-white p-4 dark:bg-gray-900">
      <div class="flex items-center justify-between pb-2">
        <label
          :for="`${id}-fullscreen`"
          class="block text-lg font-medium text-gray-900 dark:text-white"
          >{{ label }}</label
        >
        <button
          @click="toggleFullScreen"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          :title="t('Exit fullscreen')"
        >
          <ArrowsPointingInIcon class="h-6 w-6" />
        </button>
      </div>
      <textarea
        :id="`${id}-fullscreen`"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateValue(($event.target as HTMLTextAreaElement).value)"
        :class="[baseTextareaClass, validationClass, 'flex-grow']"
        class="h-full w-full flex-1"
        ref="fullscreenTextarea"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, nextTick, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/vue/24/outline";

// Props
const {
  id,
  label,
  rows,
  placeholder,
  validationMessage,
  readonly,
  disabled,
  modelValue,
  required = false,
  validationState = "",
  wrapperClass = "",
  additionalClass = "",
  fullscreen = false,
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
  disabled: {
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
  wrapperClass: {
    type: String,
    default: "",
  },
  additionalClass: {
    type: String,
    default: "",
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "focus"]);

// i18n
const { t } = useI18n();

// State
const inputValue = ref(modelValue);
const isValid = ref(true);
const isFullScreen = ref(false);
const fullscreenTextarea = ref<HTMLTextAreaElement | null>(null);

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

const onFocus = (event: Event) => {
  if (!readonly && !disabled) emit("focus", event);
};

const toggleFullScreen = async () => {
  isFullScreen.value = !isFullScreen.value;
  // if (isFullScreen.value) {
  //   await nextTick();
  //   fullscreenTextarea.value?.focus();
  // }
};

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isFullScreen.value) {
    toggleFullScreen();
  }
};

onMounted(() => {
  if (fullscreen) {
    window.addEventListener("keydown", handleEsc);
  }
});

onUnmounted(() => {
  if (fullscreen) {
    window.removeEventListener("keydown", handleEsc);
  }
});

// Classes
const baseTextareaClass =
  "block p-2.5 w-full text-sm rounded-lg border focus:ring-4 focus:outline-none transition-colors h-full";

const validationClass =
  "border-gray-300 text-gray-900 bg-gray-50 focus:ring-primary-300 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500";

const errorClass =
  "border-red-500 text-red-900 bg-red-50 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 dark:text-red-500 dark:focus:ring-red-500 dark:focus:border-red-500";

const successClass =
  "border-green-500 text-green-900 bg-green-50 focus:ring-green-300 focus:border-green-500 dark:bg-green-900 dark:border-green-400 dark:text-green-400 dark:focus:ring-green-800 dark:focus:border-green-400";
</script>
