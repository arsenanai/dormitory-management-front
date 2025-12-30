<template>
  <div class="flex w-full flex-col items-start justify-center">
    <p v-if="downloadError" class="text-sm text-red-500">{{ downloadError }}</p>
    <!-- Label -->
    <label
      v-if="label"
      :for="id + '-wrapper'"
      class="block text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ label }}
    </label>

    <!-- File Link Wrapper -->
    <div
      :id="id + '-wrapper'"
      class="focus:ring-primary-300 dark:focus:ring-primary-700 flex w-full cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-200 focus:ring-4 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      tabindex="0"
    >
      <div class="relative px-2.5 py-2 pl-10">
        <!-- File Icon -->
        <ArrowDownTrayIcon
          class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
        />

        <!-- Show link to file or "not available" text -->
        <button
          v-if="filePath"
          :id="id"
          type="button"
          @click.prevent="downloadFile"
          class="text-primary-600 dark:text-primary-400 text-base font-medium hover:underline"
        >
          {{ fileName }}
        </button>
        <p v-else class="text-base text-gray-500 dark:text-gray-400">
          {{ t("common.notAvailable") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from "vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline";

interface Props {
  id: string;
  label?: string;
  filePath?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  filePath: null,
});

const { t } = useI18n();
const downloadError = ref<string | null>(null);

const fileName = computed(() => props.filePath?.split("/").pop() || "");
const fileUrl = computed(() => `/api/files/download/${props.filePath}`);

const downloadFile = async () => {
  downloadError.value = null;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(fileUrl.value, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.value;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error: any) {
    console.error("Download error:", error);
    downloadError.value = t("Failed to download file. Please try again.");
  }
};
</script>
