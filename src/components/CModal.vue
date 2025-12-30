<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,30,30,0.35)] backdrop-blur-md backdrop-saturate-125"
    role="dialog"
  >
    <div
      class="border-primary-200 relative w-full max-w-md rounded-lg border bg-white pt-10 shadow-lg"
      @click.stop
      ref="modalContent"
      tabindex="-1"
      @keydown.tab="onTab"
    >
      <!-- Modal Header -->
      <div class="absolute top-0 right-0 left-0 flex h-10 items-center px-3">
        <div class="group">
          <button
            @click="$emit('update:modelValue', false)"
            class="group flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-[#E33E41] bg-[#FF5F57] shadow transition-all duration-150 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#FFB3B3]"
            :aria-label="$t ? $t('Close') : 'Close'"
            type="button"
          >
            <XMarkIcon
              class="text-primary-900 h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
            <span class="sr-only">{{ $t ? $t("Close") : "Close" }}</span>
          </button>
        </div>
        <h3
          v-if="title"
          class="pointer-events-none -ml-5 flex-1 text-center text-sm font-semibold text-gray-500 dark:text-gray-400"
        >
          {{ title }}
        </h3>
      </div>
      <div class="max-h-[80vh] max-w-[80vw] overflow-x-auto overflow-y-auto px-3 pb-3">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:modelValue"]);

const modalContent = ref<HTMLElement | null>(null);

function getFocusableElements(): HTMLElement[] {
  if (!modalContent.value) return [];
  return Array.from(
    modalContent.value.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]'
    )
  ).filter((el): el is HTMLElement => (el as HTMLElement).offsetParent !== null);
}

function onTab(e: KeyboardEvent) {
  const focusable = getFocusableElements();
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function trapFocus() {
  nextTick(() => {
    const focusable = getFocusableElements();
    if (focusable.length) {
      focusable[0].focus();
    } else if (modalContent.value) {
      modalContent.value.focus();
    }
  });
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      trapFocus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);

onMounted(() => {
  if (props.modelValue) trapFocus();
});
onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>
