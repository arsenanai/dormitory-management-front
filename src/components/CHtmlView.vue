<template>
  <div :class="[wrapperClass]">
    <div class="flex items-center justify-between">
      <label :for="id" class="block text-sm font-medium text-gray-900 dark:text-white">
        {{ label || t("Content") }}
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
    <div
      :id="id"
      :class="[
        baseContentClass,
        additionalClass,
      ]"
    >
      <div
        v-if="displayHtml"
        class="prose prose-sm max-w-none dark:prose-invert"
        v-html="displayHtml"
      />
      <div
        v-else
        class="prose prose-sm max-w-none dark:prose-invert text-gray-500 dark:text-gray-400 italic"
      >
        {{ effectiveFallbackText }}
      </div>
    </div>
    <!-- Fullscreen Overlay -->
    <div
      v-if="isFullScreen"
      class="fixed inset-0 z-50 flex flex-col bg-white p-4 dark:bg-gray-900"
    >
      <div class="flex items-center justify-between pb-2">
        <label
          :for="`${id}-fullscreen`"
          class="block text-lg font-medium text-gray-900 dark:text-white"
        >
          {{ label || t("Content") }}
        </label>
        <button
          @click="toggleFullScreen"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          :title="t('Exit fullscreen')"
        >
          <ArrowsPointingInIcon class="h-6 w-6" />
        </button>
      </div>
      <div
        :id="`${id}-fullscreen`"
        class="overflow-auto flex-1 min-h-0 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
      >
        <div
          v-if="displayHtml"
          class="prose prose-sm max-w-none dark:prose-invert"
          v-html="displayHtml"
        />
        <div
          v-else
          class="prose prose-sm max-w-none dark:prose-invert text-gray-500 dark:text-gray-400 italic"
        >
          {{ effectiveFallbackText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    id: string;
    label?: string;
    html?: string;
    fallbackText?: string;
    wrapperClass?: string;
    additionalClass?: string;
    fullscreen?: boolean;
  }>(),
  {
    label: "",
    html: "",
    fallbackText: "",
    wrapperClass: "",
    additionalClass: "",
    fullscreen: false,
  }
);

const { t } = useI18n();

const isFullScreen = ref(false);

const displayHtml = computed(() => props.html?.trim() || "");

const defaultFallbackText = t("No content available.");

const effectiveFallbackText = computed(
  () => props.fallbackText || defaultFallbackText
);

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isFullScreen.value) {
    toggleFullScreen();
  }
};

onMounted(() => {
  if (props.fullscreen) {
    window.addEventListener("keydown", handleEsc);
  }
});

onUnmounted(() => {
  if (props.fullscreen) {
    window.removeEventListener("keydown", handleEsc);
  }
});

const baseContentClass =
  "overflow-auto rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800";
</script>
