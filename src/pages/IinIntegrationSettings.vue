<template>
  <Navigation :title="t('IIN Integration Settings')">
    <div class="flex flex-col gap-8">
      <div class="flex items-center justify-between">
        <h1>{{ t("IIN Integration Settings") }}</h1>
      </div>

      <section>
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="text-md text-primary-600 mb-3 font-medium">
              {{ t("Integration Configuration") }}
            </h3>
            <div class="space-y-4">
              <CCheckbox
                id="iin-enabled"
                v-model="form.iin_integration_enabled"
                :label="t('Enable IIN Integration (OTP Flow)')"
              />
            </div>
            <div v-if="form.iin_integration_enabled" class="mt-4 grid grid-cols-1 gap-4 border-t pt-4">
              <CInput
                v-model="form.iin_base_url"
                :label="t('Base URL')"
                placeholder="https://api.example.com"
                required
              />
              <CInput
                v-model="form.iin_encryption_key"
                :label="t('Encryption Key')"
                type="text"
                placeholder="Enter encryption key"
                required
              />
            </div>
          </div>

          <div class="flex justify-end">
            <CButton type="submit" variant="primary" :loading="loading">
              {{ t("Save Settings") }}
            </CButton>
          </div>
        </form>
      </section>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CButton from "@/components/CButton.vue";
import CInput from "@/components/CInput.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import { useSettingsStore } from "@/stores/settings";
import { useToast } from "@/composables/useToast";

// Define the IinSettings interface directly in this file as per the instruction's "Code Edit" snippet
export interface IinSettings {
  iin_integration_enabled: boolean;
  iin_base_url: string;
  iin_encryption_key: string;
}

const { t } = useI18n();
const { showSuccess } = useToast();
const settingsStore = useSettingsStore();

const form = reactive<IinSettings>({
  iin_integration_enabled: false,
  iin_base_url: "",
  iin_encryption_key: "",
});

const loading = computed(() => settingsStore.loading);

const loadSettings = async () => {
  await settingsStore.fetchIinSettings();
  if (settingsStore.iinSettings) {
    Object.assign(form, settingsStore.iinSettings);
  }
};

const saveSettings = async () => {
  await settingsStore.updateIinSettings({
    iin_integration_enabled: !!form.iin_integration_enabled,
    iin_base_url: form.iin_base_url,
    iin_encryption_key: form.iin_encryption_key,
  });
  showSuccess(t("IIN settings saved successfully!"));
};

onMounted(loadSettings);
</script>
