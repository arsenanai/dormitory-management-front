<template>
  <div class="flex w-full flex-col items-start justify-center">
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
      class="flex w-full cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600 dark:focus:ring-primary-700"
      tabindex="0"
    >
      <div class="relative px-2.5 py-2 pl-10">
        <!-- File Icon -->
        <ArrowDownTrayIcon
          class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
        />

        <!-- Show link to file or "not available" text -->
        <a
          v-if="filePath"
          :id="id"
          :href="fileUrl"
          :download="fileName"
          target="_blank"
          rel="noopener noreferrer"
          class="text-base font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          {{ fileName }}
        </a>
        <p v-else class="text-base text-gray-500 dark:text-gray-400">
          {{ t('common.notAvailable') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline';

interface Props {
  id: string;
  label?: string;
  filePath?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  filePath: null,
});

const { t } = useI18n();

const fileName = computed(() => props.filePath?.split('/').pop() || '');
const fileUrl = computed(() => `/storage/${props.filePath}`);
</script>