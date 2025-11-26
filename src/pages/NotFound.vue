<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-gray-800">{{ t('notFound.title') }}</h1>
            <p class="text-2xl font-light text-gray-600 mt-4">{{ t('notFound.pageTitle') }}</p>
            <p class="mt-2 text-gray-500">
                {{ t('notFound.message') }}
            </p>
            <div class="mt-6">
                <router-link to="/"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                    {{ t('notFound.goHome') }}
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>