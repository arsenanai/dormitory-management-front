<template>
  <Navigation :title="t('Website Settings')">
    <div class="flex flex-col gap-8">
      <div class="flex items-center justify-between">
        <h1>{{ t("Website Settings") }}</h1>
      </div>

      <!-- Payment Configuration Section -->
      <section>
        <h2 class="text-primary-700 mb-4 text-lg font-semibold">
          {{ t("Payment Configuration") }}
        </h2>
        <p class="text-primary-600 mb-4 text-sm">
          {{
            t(
              "Payment types (renting, catering, guest stay, etc.) are managed in Configuration → Payment Types."
            )
          }}
        </p>

        <!-- Semester Configuration -->
        <div class="mb-6 rounded-lg border border-gray-200 p-4">
          <h3 class="text-md text-primary-600 mb-3 font-medium">
            {{ t("Semester Configuration") }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="(semester, semesterName) in paymentConfigForm.semester_config"
              :key="semesterName"
              class="rounded-lg border border-gray-100 p-4"
            >
              <h4 class="mb-3 text-sm font-medium text-gray-800 capitalize">
                {{ t(semesterName) }} {{ t("Semester") }}
              </h4>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="grid grid-cols-2 gap-2">
                  <CInput
                    :id="`${semesterName}-start-month`"
                    v-model.number="semester.start_month"
                    :label="t('Start Month')"
                    type="number"
                    min="1"
                    max="12"
                    required
                  />
                  <CInput
                    :id="`${semesterName}-start-day`"
                    v-model.number="semester.start_day"
                    :label="t('Start Day')"
                    type="number"
                    min="1"
                    max="31"
                    required
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <CInput
                    :id="`${semesterName}-end-month`"
                    v-model.number="semester.end_month"
                    :label="t('End Month')"
                    type="number"
                    min="1"
                    max="12"
                    required
                  />
                  <CInput
                    :id="`${semesterName}-end-day`"
                    v-model.number="semester.end_day"
                    :label="t('End Day')"
                    type="number"
                    min="1"
                    max="31"
                    required
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <CInput
                    :id="`${semesterName}-deadline-month`"
                    v-model.number="semester.payment_deadline_month"
                    :label="t('Deadline Month')"
                    type="number"
                    min="1"
                    max="12"
                    required
                  />
                  <CInput
                    :id="`${semesterName}-deadline-day`"
                    v-model.number="semester.payment_deadline_day"
                    :label="t('Deadline Day')"
                    type="number"
                    min="1"
                    max="31"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Toggles Section -->
      <section>
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

          <h2 class="text-primary-700 mb-4 text-lg font-semibold">{{ t("Feature Toggles") }}</h2>
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
import { computed, onMounted, reactive } from "vue";
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
import type { PaymentSettings } from "@/models/PaymentSettings";
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

const paymentConfigForm = reactive<{ semester_config: PaymentSettings["semester_config"] }>({
  semester_config: {
    fall: {
      start_month: 9,
      start_day: 1,
      end_month: 12,
      end_day: 31,
      payment_deadline_month: 8,
      payment_deadline_day: 22,
    },
    spring: {
      start_month: 1,
      start_day: 1,
      end_month: 5,
      end_day: 31,
      payment_deadline_month: 12,
      payment_deadline_day: 22,
    },
    summer: {
      start_month: 6,
      start_day: 1,
      end_month: 8,
      end_day: 31,
      payment_deadline_month: 5,
      payment_deadline_day: 22,
    },
  },
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
    settingsStore.fetchPaymentSettings(),
  ]);

  if (settingsStore.cardReaderSettings)
    Object.assign(cardReaderForm, settingsStore.cardReaderSettings);
  if (settingsStore.onecSettings) Object.assign(onecForm, settingsStore.onecSettings);
  if (settingsStore.kaspiSettings) Object.assign(kaspiForm, settingsStore.kaspiSettings);
  if (settingsStore.publicSettings)
    Object.assign(dormitorySettingsForm, settingsStore.publicSettings);
  if (settingsStore.paymentSettings?.semester_config) {
    paymentConfigForm.semester_config = JSON.parse(
      JSON.stringify(settingsStore.paymentSettings.semester_config)
    );
  }
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

    const paymentConfigPayload = { semester_config: paymentConfigForm.semester_config };

    await Promise.all([
      settingsStore.updateCardReaderSettings(cardReaderPayload as CardReaderSettings),
      settingsStore.updateOnecSettings(onecPayload as OneCSettings),
      settingsStore.updateKaspiSettings(kaspiPayload as KaspiSettings),
      settingsStore.updateDormitoryRules(dormitorySettingsForm.dormitory_rules),
      settingsStore.updateCurrencySettings(dormitorySettingsForm.currency_symbol),
      settingsStore.updateBankRequisites(dormitorySettingsForm.bank_requisites),
      settingsStore.updatePaymentSettings(paymentConfigPayload),
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
