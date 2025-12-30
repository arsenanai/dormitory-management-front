<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-800">{{ t("notFound.title") }}</h1>
      <p class="mt-4 text-2xl font-light text-gray-600">{{ t("notFound.pageTitle") }}</p>
      <p class="mt-2 text-gray-500">
        {{ t("notFound.message") }}
      </p>
      <div class="mt-6">
        <router-link
          to="/"
          class="bg-primary-600 hover:bg-primary-700 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white"
        >
          {{ t("notFound.goHome") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
