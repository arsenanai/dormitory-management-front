<template>
  <Navigation :title="t('Settings & Configuration')">
    <div class="flex flex-col gap-8">
      <h1>{{ t('Settings & Configuration') }}</h1>
      <!-- SMTP Section -->
      <section>
        <h2 class="text-lg font-semibold mb-2">SMTP</h2>
        <div class="text-gray-500">{{ t('Future/Not implemented in v1') }}</div>
      </section>
      <!-- Card Reader Section -->
      <section>
        <h2 class="text-lg font-semibold mb-2">Card Reader</h2>
        <div class="text-gray-500">{{ t('Future/Not implemented in v1') }}</div>
      </section>
      <!-- 1C Integration Section -->
      <section>
        <h2 class="text-lg font-semibold mb-2">1C Integration</h2>
        <div class="text-gray-500">{{ t('Future/Not implemented in v1') }}</div>
      </section>
      <!-- Language File Upload Section -->
      <section>
        <h2 class="text-lg font-semibold mb-2">Language File Upload</h2>
        <div class="text-gray-500">{{ t('For v1, language files remain static JSON in the codebase. Dynamic upload is a future feature.') }}</div>
      </section>
      <!-- System Logs Section -->
      <section>
        <h2 class="text-lg font-semibold mb-2">System Logs</h2>
        <div class="text-gray-500">{{ t('Future/Not implemented in v1') }}</div>
      </section>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Navigation from '@/components/CNavigation.vue';
const { t } = useI18n();
</script> 