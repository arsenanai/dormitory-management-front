<template>
  <Navigation :title="t('Dormitory Rules')">
    <div class="flex flex-col gap-6">
      <div v-if="loading" class="py-8 text-center text-lg">{{ t("Loading...") }}</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">{{ error }}</div>
      <template v-else>
        <h1 class="text-primary-700 text-xl font-semibold">
          {{ t("Dormitory Rules and Regulations") }}
        </h1>

        <CTabs v-model="activeLanguageTab">
          <CTab v-for="loc in supportedLocales" :key="loc.code" :name="loc.code" :title="loc.label">
            <div class="space-y-4 rounded-lg border border-gray-200 p-4">
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-900 dark:text-white">
                    {{ t("Content (HTML)") }}
                  </label>
                  <CButton
                    type="button"
                    :variant="showPreview[loc.code] ? undefined : 'primary'"
                    @click="showPreview[loc.code] = false"
                  >
                    {{ t("Editor") }}
                  </CButton>
                  <CButton
                    type="button"
                    :variant="showPreview[loc.code] ? 'primary' : undefined"
                    @click="showPreview[loc.code] = true"
                  >
                    {{ t("Preview") }}
                  </CButton>
                </div>
                <CTextarea
                  v-if="!showPreview[loc.code]"
                  :id="`rules-${loc.code}`"
                  v-model="formByLocale[loc.code]"
                  :label="''"
                  :rows="14"
                  class="font-mono text-sm"
                />
                <div
                  v-else
                  class="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
                >
                  <div
                    class="prose prose-sm dark:prose-invert max-w-none"
                    data-testid="preview-html"
                    v-html="formByLocale[loc.code] || t('(empty)')"
                  />
                </div>
              </div>
            </div>
          </CTab>
        </CTabs>

        <div class="flex justify-end gap-2">
          <CButton variant="primary" :loading="saving" @click="save">
            {{ t("Save") }}
          </CButton>
        </div>
      </template>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTabs from "@/components/CTabs.vue";
import CTab from "@/components/CTab.vue";
import CTextarea from "@/components/CTextarea.vue";
import CButton from "@/components/CButton.vue";
import { dormitoryRulesService, type DormitoryRulesLocales } from "@/services/api";
import { useToast } from "@/composables/useToast";
import { useSettingsStore } from "@/stores/settings";
import { LOCALE_CONSTANTS } from "@/utils/constants";

const { t } = useI18n();
const settingsStore = useSettingsStore();
const { showSuccess, showError } = useToast();

const loading = ref(true);
const error = ref("");
const saving = ref(false);
const activeLanguageTab = ref("en");

const supportedLocales = computed(() => [
  { code: "en", label: t("English") },
  { code: "kk", label: t("Kazakh") },
  { code: "ru", label: t("Russian") },
]);

const formByLocale = reactive<DormitoryRulesLocales>({
  en: "",
  kk: "",
  ru: "",
});

const showPreview = reactive<Record<string, boolean>>({
  en: false,
  kk: false,
  ru: false,
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const res = await dormitoryRulesService.get();
    const data = res.data;
    const locales = (data as { locales?: DormitoryRulesLocales })?.locales ?? {};
    for (const code of LOCALE_CONSTANTS.AVAILABLE) {
      if (locales[code as keyof DormitoryRulesLocales]) {
        formByLocale[code as keyof DormitoryRulesLocales] =
          locales[code as keyof DormitoryRulesLocales] ?? "";
      }
    }
  } catch (e) {
    error.value = (e as Error).message || t("Failed to load dormitory rules.");
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    await dormitoryRulesService.update(formByLocale);
    await settingsStore.fetchPublicSettings();
    showSuccess(t("Dormitory rules saved successfully."));
  } catch (e) {
    error.value = (e as Error).message || t("Failed to save dormitory rules.");
    showError(error.value);
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>
