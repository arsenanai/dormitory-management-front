<template>
  <Navigation :title="t('Website Settings')">
    <div class="flex flex-col gap-8">
      <div class="flex items-center justify-between">
        <h1>{{ t("Website Settings") }}</h1>
      </div>

      <!-- Feature Toggles Section -->
      <section>
        <h2 class="text-primary-700 mb-4 text-lg font-semibold">{{ t("Feature Toggles") }}</h2>
        <form @submit.prevent="saveAllSettings" class="space-y-6">
          <!-- General Settings -->
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="text-md text-primary-600 mb-3 font-medium">{{ t("General Settings") }}</h3>
            <CSelect
              id="currency-symbol"
              v-model="dormitorySettingsForm.currency_symbol"
              :label="t('Currency')"
              class="mb-4"
              :options="currencyOptions"
              required
            />
          </div>

          <!-- Dormitory Settings -->
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="text-md text-primary-600 mb-3 font-medium">{{ t("Dormitory Settings") }}</h3>
            <CTextarea
              id="dormitory-rules"
              v-model="dormitorySettingsForm.dormitory_rules"
              :label="t('Dormitory Rules and Regulations')"
              class="mb-4"
              rows="10"
            />
          </div>

          <!-- Dormitory Bank requisites/payment instructions -->
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="text-md text-primary-600 mb-3 font-medium">
              {{ t("Bank requisites / payment instructions") }}
            </h3>
            <CTextarea
              id="dormitory-rules"
              v-model="dormitorySettingsForm.bank_requisites"
              :label="t('Dormitory Bank requisites / payment instructions')"
              class="mb-4"
              rows="10"
            />
          </div>

          <!-- 1C Integration Toggle -->
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="text-md text-primary-600 mb-3 font-medium">{{ t("1C Integration") }}</h3>
            <CCheckbox
              id="onec-enabled"
              v-model="onecForm.onec_enabled"
              :label="t('Enable 1C Integration')"
            />
            <div v-if="onecForm.onec_enabled" class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <CInput v-model="onecForm.onec_host" :label="t('1C Host')" required />
              <CInput v-model="onecForm.onec_database" :label="t('1C Database')" required />
              <CInput v-model="onecForm.onec_username" :label="t('1C Username')" required />
              <CInput
                v-model="onecForm.onec_password"
                :label="t('1C Password')"
                type="password"
                required
              />
              <CInput
                v-model="onecForm.onec_sync_interval"
                :label="t('Sync Interval (seconds)')"
                type="number"
                required
              />
            </div>
          </div>

          <!-- Kaspi Integration Toggle -->
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="text-md text-primary-600 mb-3 font-medium">{{ t("Kaspi Integration") }}</h3>
            <CCheckbox
              id="kaspi-enabled"
              v-model="kaspiForm.kaspi_enabled"
              :label="t('Enable Kaspi Integration')"
            />
            <div v-if="kaspiForm.kaspi_enabled" class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <CInput v-model="kaspiForm.kaspi_api_key" :label="t('Kaspi API Key')" required />
              <CInput v-model="kaspiForm.kaspi_merchant_id" :label="t('Merchant ID')" required />
              <CInput v-model="kaspiForm.kaspi_webhook_url" :label="t('Webhook URL')" required />
            </div>
          </div>

          <!-- Card Security Toggle -->
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="text-md text-primary-600 mb-3 font-medium">{{ t("Card Security") }}</h3>
            <CCheckbox
              id="card-reader-enabled"
              v-model="cardReaderForm.card_reader_enabled"
              :label="t('Enable Card Reader')"
            />
            <div
              v-if="cardReaderForm.card_reader_enabled"
              class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <CInput
                v-model="cardReaderForm.card_reader_host"
                :label="t('Card Reader Host')"
                required
              />
              <CInput
                v-model="cardReaderForm.card_reader_port"
                :label="t('Card Reader Port')"
                type="number"
                required
              />
              <CInput
                v-model="cardReaderForm.card_reader_timeout"
                :label="t('Timeout (seconds)')"
                type="number"
                required
              />
            </div>
            <div v-if="cardReaderForm.card_reader_enabled" class="mt-3">
              <label class="mb-2 block text-sm font-medium text-gray-700">
                {{ t("Card Reader Locations") }}
              </label>
              <div class="space-y-2">
                <div
                  v-for="(location, index) in cardReaderForm.card_reader_locations"
                  :key="index"
                  class="flex gap-2"
                >
                  <CInput
                    v-model="cardReaderForm.card_reader_locations[index]"
                    :placeholder="t('Location name')"
                    class="flex-1"
                  />
                  <CButton @click="removeLocation(index)" variant="danger" size="sm">
                    {{ t("Remove") }}
                  </CButton>
                </div>
                <CButton @click="addLocation" size="sm">
                  {{ t("Add Location") }}
                </CButton>
              </div>
            </div>
          </div>

          <!-- Single Save Button -->
          <div class="flex justify-end">
            <CButton type="submit" variant="primary" :loading="loading">
              {{ t("Save All Settings") }}
            </CButton>
          </div>
        </form>
      </section>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CButton from "@/components/CButton.vue";
import CInput from "@/components/CInput.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import CTextarea from "@/components/CTextarea.vue";
import CSelect from "@/components/CSelect.vue";
import { useSettingsStore } from "@/stores/settings";
import { currencySymbolMap } from "@/utils/formatters";
import { CardReaderSettings } from "@/models/CardReaderSettings";
import { OneCSettings } from "@/models/OneCSettings";
import { KaspiSettings } from "@/models/KaspiSettings";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const { showSuccess } = useToast();
const settingsStore = useSettingsStore();

const kaspiForm = reactive<KaspiSettings>({
  kaspi_enabled: false,
  kaspi_api_key: null,
  kaspi_merchant_id: null,
  kaspi_webhook_url: null,
});
const cardReaderForm = reactive<CardReaderSettings>({
  card_reader_enabled: false,
  card_reader_host: "",
  card_reader_port: 8080,
  card_reader_timeout: 30,
  card_reader_locations: ["Main Entrance"],
});
const onecForm = reactive<OneCSettings>({
  onec_enabled: false,
  onec_host: "",
  onec_database: "",
  onec_username: "",
  onec_password: "",
  onec_sync_interval: 3600,
});
const dormitorySettingsForm = reactive({
  currency_symbol: "USD",
  dormitory_rules: "",
  bank_requisites: "",
});

const currencyOptions = computed(() =>
  Object.keys(currencySymbolMap).map((key) => ({
    value: key,
    name: `${key} (${currencySymbolMap[key]})`,
  }))
);

const loading = computed(() => settingsStore.loading);

const loadSettings = async () => {
  await Promise.all([
    settingsStore.fetchCardReaderSettings(),
    settingsStore.fetchOnecSettings(),
    settingsStore.fetchKaspiSettings(),
    settingsStore.fetchPublicSettings(),
    settingsStore.fetchPublicSettings(),
  ]);

  if (settingsStore.cardReaderSettings)
    Object.assign(cardReaderForm, settingsStore.cardReaderSettings);
  if (settingsStore.onecSettings) Object.assign(onecForm, settingsStore.onecSettings);
  if (settingsStore.kaspiSettings) Object.assign(kaspiForm, settingsStore.kaspiSettings);
  if (settingsStore.publicSettings)
    Object.assign(dormitorySettingsForm, settingsStore.publicSettings);
  // if (settingsStore.publicSettings) {
  //     dormitorySettingsForm.currency_symbol = settingsStore.publicSettings?.currency_symbol || 'KZT';
  //     dormitorySettingsForm.dormitory_rules = settingsStore.publicSettings?.dormitory_rules || '';
  // }
};

const saveAllSettings = async () => {
  try {
    // Build explicit plain payloads so required boolean fields are always present
    const cardReaderPayload = {
      card_reader_enabled: !!cardReaderForm.card_reader_enabled,
      card_reader_host: cardReaderForm.card_reader_host ?? null,
      card_reader_port: cardReaderForm.card_reader_port ?? null,
      card_reader_timeout: cardReaderForm.card_reader_timeout ?? null,
      card_reader_locations: Array.isArray(cardReaderForm.card_reader_locations)
        ? cardReaderForm.card_reader_locations
        : [],
    };

    const onecPayload = {
      onec_enabled: !!onecForm.onec_enabled,
      onec_host: onecForm.onec_host ?? null,
      onec_database: onecForm.onec_database ?? null,
      onec_username: onecForm.onec_username ?? null,
      onec_password: onecForm.onec_password ?? null,
      onec_sync_interval: onecForm.onec_sync_interval ?? null,
    };

    const kaspiPayload = {
      kaspi_enabled: !!kaspiForm.kaspi_enabled,
      kaspi_api_key: kaspiForm.kaspi_api_key ?? null,
      kaspi_merchant_id: kaspiForm.kaspi_merchant_id ?? null,
      kaspi_webhook_url: kaspiForm.kaspi_webhook_url ?? null,
    };

    await Promise.all([
      settingsStore.updateCardReaderSettings(cardReaderPayload as any),
      settingsStore.updateOnecSettings(onecPayload as any),
      settingsStore.updateKaspiSettings(kaspiPayload as any),
      settingsStore.updateDormitoryRules(dormitorySettingsForm.dormitory_rules),
      settingsStore.updateCurrencySettings(dormitorySettingsForm.currency_symbol),
      settingsStore.updateBankRequisites(dormitorySettingsForm.bank_requisites),
    ]);

    showSuccess(t("All settings saved successfully!"));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};

const addLocation = () => cardReaderForm.card_reader_locations.push("");
const removeLocation = (index: number) => cardReaderForm.card_reader_locations.splice(index, 1);

onMounted(loadSettings);
</script>
