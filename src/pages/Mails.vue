<template>
  <Navigation :title="t('Mails')">
    <div class="flex flex-col gap-4">
      <div v-if="loading" class="py-8 text-center text-lg">{{ t("Loading...") }}</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">{{ error }}</div>
      <CTable
        v-else
        :columns="tableColumns"
        :data="mailTypes"
        :loading="loading"
        :row-key="(row) => row.type"
      >
        <template #cell-name="{ row: item }">
          <span class="font-medium">{{ item.name }}</span>
        </template>
        <template #cell-actions="{ row: item }">
          <div class="flex justify-end">
            <CButton @click="goToEdit(item.type)" data-testid="edit-mail-template">
              <PencilSquareIcon class="h-5 w-5" />
              {{ t("Edit") }}
            </CButton>
          </div>
        </template>
      </CTable>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { PencilSquareIcon } from "@heroicons/vue/24/outline";
import Navigation from "@/components/CNavigation.vue";
import CTable from "@/components/CTable.vue";
import CButton from "@/components/CButton.vue";
import { mailTemplateService, type MailTemplateListItem } from "@/services/api";

const { t } = useI18n();
const router = useRouter();

const loading = ref(true);
const error = ref("");
const mailTypes = ref<MailTemplateListItem[]>([]);

const tableColumns = computed(() => [
  { key: "name", label: t("Mail Type"), sortable: false },
  { key: "actions", label: t("Actions"), sortable: false, class: "text-right" },
]);

function goToEdit(type: string) {
  router.push({ name: "Mail Template Edit", params: { type } });
}

onMounted(async () => {
  try {
    const res = await mailTemplateService.getList();
    mailTypes.value = res.data ?? [];
  } catch (e) {
    error.value = (e as Error).message || t("Failed to load mail templates.");
  } finally {
    loading.value = false;
  }
});
</script>
