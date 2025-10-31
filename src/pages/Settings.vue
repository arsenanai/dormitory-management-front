<template>
  <Navigation :title="t('Settings & Configuration')">
    <div class="flex flex-col gap-8">
      <div class="flex justify-between items-center">
        <h1>{{ t('Settings & Configuration') }}</h1>
      </div>

      <!-- Feature Toggles Section -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Feature Toggles') }}</h2>
        <form @submit.prevent="saveAllSettings" class="space-y-6">

          <!-- General Settings -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-md font-medium mb-3 text-primary-600">{{ t('General Settings') }}</h3>
            <CInput
              id="currency-symbol"
              v-model="generalSettingsForm.currency_symbol"
              :label="t('Currency Symbol')"
              :placeholder="t('e.g., USD, KZT')"
              class="mb-4"
              required
            />
          </div>
          
          <!-- 1C Integration Toggle -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-md font-medium mb-3 text-primary-600">{{ t('1C Integration') }}</h3>
            <CCheckbox
              id="onec-enabled"
              v-model="onecForm.onec_enabled"
              :label="t('Enable 1C Integration')"
            />
            <div v-if="onecForm.onec_enabled" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <CInput
                v-model="onecForm.onec_host"
                :label="t('1C Host')"
                required
              />
              <CInput
                v-model="onecForm.onec_database"
                :label="t('1C Database')"
                required
              />
              <CInput
                v-model="onecForm.onec_username"
                :label="t('1C Username')"
                required
              />
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
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-md font-medium mb-3 text-primary-600">{{ t('Kaspi Integration') }}</h3>
            <CCheckbox
              id="kaspi-enabled"
              v-model="kaspiForm.kaspi_enabled"
              :label="t('Enable Kaspi Integration')"
            />
            <div v-if="kaspiForm.kaspi_enabled" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <CInput
                v-model="kaspiForm.kaspi_api_key"
                :label="t('Kaspi API Key')"
                required
              />
              <CInput
                v-model="kaspiForm.kaspi_merchant_id"
                :label="t('Merchant ID')"
                required
              />
              <CInput
                v-model="kaspiForm.kaspi_webhook_url"
                :label="t('Webhook URL')"
                required
              />
            </div>
          </div>

          <!-- Card Security Toggle -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-md font-medium mb-3 text-primary-600">{{ t('Card Security') }}</h3>
            <CCheckbox
              id="card-reader-enabled"
              v-model="cardReaderForm.card_reader_enabled"
              :label="t('Enable Card Reader')"
            />
            <div v-if="cardReaderForm.card_reader_enabled" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Card Reader Locations') }}
              </label>
              <div class="space-y-2">
                <div v-for="(location, index) in cardReaderForm.card_reader_locations" :key="index" class="flex gap-2">
                  <CInput
                    v-model="cardReaderForm.card_reader_locations[index]"
                    :placeholder="t('Location name')"
                    class="flex-1"
                  />
                  <CButton @click="removeLocation(index)" variant="danger" size="sm">
                    {{ t('Remove') }}
                  </CButton>
                </div>
                <CButton @click="addLocation" size="sm">
                  {{ t('Add Location') }}
                </CButton>
              </div>
            </div>
          </div>

          <!-- Single Save Button -->
          <div class="flex justify-end">
            <CButton type="submit" variant="primary" :loading="loading">
              {{ t('Save All Settings') }}
            </CButton>
          </div>
        </form>
      </section>


    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Navigation from '@/components/CNavigation.vue';
import CButton from '@/components/CButton.vue';
import CInput from '@/components/CInput.vue';
import CCheckbox from '@/components/CCheckbox.vue';
import { useSettingsStore, type CardReaderSettings, type OneCSettings, type KaspiSettings, type GeneralSettings } from '@/stores/settings';

const { t } = useI18n(); 
const settingsStore = useSettingsStore();

const generalSettingsForm = reactive({
  currency_symbol: 'USD',
});


// Form data
const kaspiForm = reactive<KaspiSettings>({
  kaspi_enabled: false,
  kaspi_api_key: null,
  kaspi_merchant_id: null,
  kaspi_webhook_url: null,
});



const cardReaderForm = reactive<CardReaderSettings>({
  card_reader_enabled: false,
  card_reader_host: '',
  card_reader_port: 8080,
  card_reader_timeout: 30,
  card_reader_locations: ['Main Entrance', 'Back Entrance'],
});

const onecForm = reactive<OneCSettings>({
  onec_enabled: false,
  onec_host: '',
  onec_database: '',
  onec_username: '',
  onec_password: '',
  onec_sync_interval: 3600,
});







// Computed
const loading = computed(() => settingsStore.loading); 

// Methods
const loadSettings = async () => {
  await settingsStore.fetchAllSettings();
  
  if (settingsStore.generalSettings) {
    Object.assign(generalSettingsForm, settingsStore.generalSettings);
  }

  if (settingsStore.cardReaderSettings) {
    Object.assign(cardReaderForm, settingsStore.cardReaderSettings);
  }
  if (settingsStore.onecSettings) {
    Object.assign(onecForm, settingsStore.onecSettings);
  }
  // Load Kaspi settings if available
  // Note: This would need to be implemented in the backend
};

const saveAllSettings = async () => {
  try {
    const generalPayload: GeneralSettings = {
      currency_symbol: generalSettingsForm.currency_symbol || 'USD'
    };

    const cardPayload: CardReaderSettings = {
      card_reader_enabled: !!cardReaderForm.card_reader_enabled,
      card_reader_host: String(cardReaderForm.card_reader_host || ''),
      card_reader_port: Number(cardReaderForm.card_reader_port || 1),
      card_reader_timeout: Number(cardReaderForm.card_reader_timeout || 60),
      card_reader_locations: Array.isArray(cardReaderForm.card_reader_locations) ? cardReaderForm.card_reader_locations.filter(Boolean) : [],
    };

    const onecPayload: OneCSettings = {
      onec_enabled: !!onecForm.onec_enabled,
      onec_host: onecForm.onec_enabled ? String(onecForm.onec_host || '') : '',
      onec_database: onecForm.onec_enabled ? String(onecForm.onec_database || '') : '',
      onec_username: onecForm.onec_enabled ? String(onecForm.onec_username || '') : '',
      onec_password: onecForm.onec_enabled ? String(onecForm.onec_password || '') : '',
      onec_sync_interval: Number(onecForm.onec_sync_interval || 60),
    };

    const kaspiPayload: KaspiSettings = {
      kaspi_enabled: !!kaspiForm.kaspi_enabled,
      kaspi_api_key: kaspiForm.kaspi_enabled ? (kaspiForm.kaspi_api_key ?? '') : null,
      kaspi_merchant_id: kaspiForm.kaspi_enabled ? (kaspiForm.kaspi_merchant_id ?? '') : null,
      kaspi_webhook_url: kaspiForm.kaspi_enabled ? (kaspiForm.kaspi_webhook_url ?? '') : null,
    };

    await Promise.all([
      settingsStore.updateCurrencySettings(generalPayload),
      settingsStore.updateCardReaderSettings(cardPayload),
      settingsStore.updateOnecSettings(onecPayload),
      settingsStore.updateKaspiSettings(kaspiPayload),
    ]);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

const addLocation = () => {
  cardReaderForm.card_reader_locations.push('');
};

const removeLocation = (index: number) => {
  cardReaderForm.card_reader_locations.splice(index, 1);
};

// Lifecycle
onMounted(async () => {
  await loadSettings();
});
</script> 