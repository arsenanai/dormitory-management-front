<template>
  <div>
    <CButton data-testid="open-modal" @click="showForm = true">{{ t("Open Modal") }}</CButton>
    <CModal v-model="showForm" data-testid="test-modal">
      <template #header>
        <h2>{{ t("Test Modal") }}</h2>
      </template>
      <template #body>
        <p>{{ t("This is a test modal using CModal component.") }}</p>
      </template>
      <template #footer>
        <CButton data-testid="close-modal" @click="showForm = false">{{ t("Close") }}</CButton>
      </template>
    </CModal>
    <div id="debug-showform">{{ t("showForm") }}: {{ showForm }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import CButton from "@/components/CButton.vue";
import CModal from "@/components/CModal.vue";

const { t } = useI18n();
const showForm = ref(false);
</script>
