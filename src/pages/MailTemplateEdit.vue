<template>
  <Navigation :title="t('Edit Mail Template')">
    <div class="flex flex-col gap-6">
      <div v-if="loading" class="py-8 text-center text-lg">{{ t("Loading...") }}</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">{{ error }}</div>
      <template v-else>
        <h1 class="text-primary-700 text-xl font-semibold">{{ templateName }}</h1>

        <CTabs v-model="activeLanguageTab">
          <CTab
            v-for="loc in supportedLocales"
            :key="loc.code"
            :name="loc.code"
            :title="loc.label"
          >
            <div class="space-y-4 rounded-lg border border-gray-200 p-4">
              <CInput
                :id="`subject-${loc.code}`"
                v-model="formByLocale[loc.code].subject"
                :label="t('Subject')"
                type="text"
              />

              <div>
                <div class="mb-2 flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-900 dark:text-white">
                    {{ t("Body (HTML)") }}
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
                  :id="`body-${loc.code}`"
                  v-model="formByLocale[loc.code].body"
                  :label="''"
                  :rows="14"
                  class="font-mono text-sm"
                />
                <div
                  v-else
                  class="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
                >
                  <div
                    class="prose prose-sm max-w-none dark:prose-invert"
                    data-testid="preview-html"
                    v-html="formByLocale[loc.code].body || t('(empty)')"
                  />
                </div>
              </div>
            </div>
          </CTab>
        </CTabs>

        <div v-if="Object.keys(placeholders).length > 0" class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="text-primary-600 mb-2 text-sm font-medium">{{ t("Available placeholders") }}</h3>
          <p class="mb-2 text-xs text-gray-600 dark:text-gray-400">
            {{ t("Use these in subject or body (e.g. app_name, user_name).") }}
          </p>
          <ul class="flex flex-wrap gap-2 text-xs">
            <li
              v-for="(desc, key) in placeholders"
              :key="key"
              class="rounded bg-gray-200 px-2 py-1 dark:bg-gray-700"
              :title="desc"
            >
              <span v-text="placeholderTag(key)"></span>
            </li>
          </ul>
        </div>

        <div class="flex justify-end gap-2">
          <CButton @click="goBack">{{ t("Cancel") }}</CButton>
          <CButton variant="primary" :loading="saving" @click="save">
            {{ t("Save") }}
          </CButton>
        </div>
      </template>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTabs from "@/components/CTabs.vue";
import CTab from "@/components/CTab.vue";
import CInput from "@/components/CInput.vue";
import CTextarea from "@/components/CTextarea.vue";
import CButton from "@/components/CButton.vue";
import { mailTemplateService, type MailTemplateLocale } from "@/services/api";
import { LOCALE_CONSTANTS } from "@/utils/constants";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const mailType = computed(() => (route.params.type as string) ?? "");
const loading = ref(true);
const error = ref("");
const saving = ref(false);
const templateName = ref("");
const placeholders = ref<Record<string, string>>({});
const activeLanguageTab = ref("en");

const supportedLocales = computed(() => [
  { code: "en", label: t("English") },
  { code: "kk", label: t("Kazakh") },
  { code: "ru", label: t("Russian") },
]);

const formByLocale = reactive<Record<string, MailTemplateLocale>>({
  en: { subject: "", body: "" },
  kk: { subject: "", body: "" },
  ru: { subject: "", body: "" },
});

const showPreview = reactive<Record<string, boolean>>({
  en: false,
  kk: false,
  ru: false,
});

function goBack() {
  router.push({ name: "Mails" });
}

async function load() {
  if (!mailType.value) {
    error.value = t("Mail type is required.");
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const res = await mailTemplateService.getByType(mailType.value);
    const data = res.data;
    if (!data) {
      error.value = t("Template not found.");
      return;
    }
    templateName.value = data.name;
    placeholders.value = data.placeholders ?? {};
    const locales = data.locales ?? {};
    for (const code of LOCALE_CONSTANTS.AVAILABLE) {
      if (locales[code]) {
        formByLocale[code] = { ...locales[code] };
      }
    }
    if (!activeLanguageTab.value || !LOCALE_CONSTANTS.AVAILABLE.includes(activeLanguageTab.value)) {
      activeLanguageTab.value = LOCALE_CONSTANTS.AVAILABLE[0];
    }
  } catch (e) {
    error.value = (e as Error).message || t("Failed to load template.");
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    await mailTemplateService.update(mailType.value, formByLocale);
    goBack();
  } catch (e) {
    error.value = (e as Error).message || t("Failed to save template.");
  } finally {
    saving.value = false;
  }
}

function placeholderTag(key: string): string {
  return `{{${key}}}`;
}

onMounted(load);
watch(mailType, load);
</script>
