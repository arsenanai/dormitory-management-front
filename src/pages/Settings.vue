<template>
  <Navigation :title="t('Settings & Configuration')">
    <div class="flex flex-col gap-8">
      <div class="flex justify-between items-center">
        <h1>{{ t('Settings & Configuration') }}</h1>
        <CButton @click="initializeDefaults" :loading="loading" variant="secondary">
          {{ t('Initialize Defaults') }}
        </CButton>
      </div>

      <!-- Dormitory Settings Section -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Dormitory Settings') }}</h2>
        <form @submit.prevent="saveDormitorySettings" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CInput
              v-model="dormitoryForm.max_students_per_dormitory"
              :label="t('Max Students per Dormitory')"
              type="number"
              required
            />
            <CInput
              v-model="dormitoryForm.default_room_price"
              :label="t('Default Room Price')"
              type="number"
              required
            />
            <CInput
              v-model="dormitoryForm.payment_deadline_days"
              :label="t('Payment Deadline (Days)')"
              type="number"
              required
            />
          </div>
          <div class="flex gap-4">
            <CCheckbox
              id="registration-enabled"
              v-model="dormitoryForm.registration_enabled"
              :label="t('Enable Registration')"
            />
            <CCheckbox
              id="backup-list-enabled"
              v-model="dormitoryForm.backup_list_enabled"
              :label="t('Enable Backup List')"
            />
          </div>
          <CButton type="submit" :loading="loading">
            {{ t('Save Dormitory Settings') }}
          </CButton>
        </form>
      </section>

      <!-- SMTP Section -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('SMTP Configuration') }}</h2>
        <form @submit.prevent="saveSmtpSettings" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CInput
              v-model="smtpForm.smtp_host"
              :label="t('SMTP Host')"
              required
            />
            <CInput
              v-model="smtpForm.smtp_port"
              :label="t('SMTP Port')"
              type="number"
              required
            />
            <CInput
              v-model="smtpForm.smtp_username"
              :label="t('SMTP Username')"
              required
            />
            <CInput
              v-model="smtpForm.smtp_password"
              :label="t('SMTP Password')"
              type="password"
              required
            />
            <CSelect
              id="smtp-encryption"
              v-model="smtpForm.smtp_encryption"
              :label="t('Encryption')"
              :options="encryptionOptions"
              required
            />
            <CInput
              v-model="smtpForm.mail_from_address"
              :label="t('From Email Address')"
              type="email"
              required
            />
            <CInput
              v-model="smtpForm.mail_from_name"
              :label="t('From Name')"
              required
            />
          </div>
          <CButton type="submit" :loading="loading">
            {{ t('Save SMTP Settings') }}
          </CButton>
        </form>
      </section>

      <!-- Card Reader Section -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Card Reader Configuration') }}</h2>
        <form @submit.prevent="saveCardReaderSettings" class="space-y-4">
          <CCheckbox
            id="card-reader-enabled"
            v-model="cardReaderForm.card_reader_enabled"
            :label="t('Enable Card Reader')"
          />
          <div v-if="cardReaderForm.card_reader_enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div v-if="cardReaderForm.card_reader_enabled">
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
              <CButton @click="addLocation" variant="secondary" size="sm">
                {{ t('Add Location') }}
              </CButton>
            </div>
          </div>
          <CButton type="submit" :loading="loading">
            {{ t('Save Card Reader Settings') }}
          </CButton>
        </form>
      </section>

      <!-- 1C Integration Section -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('1C Integration Configuration') }}</h2>
        <form @submit.prevent="saveOnecSettings" class="space-y-4">
          <CCheckbox
            id="onec-enabled"
            v-model="onecForm.onec_enabled"
            :label="t('Enable 1C Integration')"
          />
          <div v-if="onecForm.onec_enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <CButton type="submit" :loading="loading">
            {{ t('Save 1C Settings') }}
          </CButton>
        </form>
      </section>

      <!-- Language File Upload Section -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Language File Management') }}</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-md font-medium mb-2 text-primary-600">{{ t('Installed Languages') }}</h3>
            <div class="flex gap-2 flex-wrap">
              <span
                v-for="lang in installedLanguages"
                :key="lang"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {{ lang.toUpperCase() }}
              </span>
            </div>
          </div>
          <form @submit.prevent="uploadLanguage" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CSelect
                id="language-select"
                v-model="languageForm.language"
                :label="t('Language')"
                :options="languageOptions"
                required
              />
              <CFileInput
                id="language-file"
                v-model="languageForm.file"
                :label="t('Language File (JSON)')"
                accept=".json"
                required
              />
            </div>
            <CButton type="submit" :loading="loading">
              {{ t('Upload Language File') }}
            </CButton>
          </form>
        </div>
      </section>

      <!-- System Logs Section -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-primary-700">{{ t('System Logs') }}</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <CButton @click="refreshLogs" :disabled="loadingLogs">
              {{ t('Refresh Logs') }}
            </CButton>
            <CButton @click="clearLogs" variant="danger" :disabled="loadingLogs">
              {{ t('Clear All Logs') }}
            </CButton>
          </div>
          
          <div v-if="loadingLogs" class="text-center py-4">
            {{ t('Loading logs...') }}
          </div>
          
          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <div v-for="log in systemLogs" :key="log.file" class="p-3 border rounded bg-gray-50">
              <div class="text-gray-600 text-xs mb-1">{{ log.file }} - {{ log.timestamp }}</div>
              <div class="text-gray-800">{{ log.content }}</div>
            </div>
            <div v-if="systemLogs.length === 0" class="text-center text-gray-500 py-8">
              {{ t('No logs available') }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Navigation from '@/components/CNavigation.vue';
import CButton from '@/components/CButton.vue';
import CInput from '@/components/CInput.vue';
import CSelect from '@/components/CSelect.vue';
import CCheckbox from '@/components/CCheckbox.vue';
import CFileInput from '@/components/CFileInput.vue';
import { useSettingsStore, type SmtpSettings, type CardReaderSettings, type OneCSettings, type DormitorySettings } from '@/stores/settings';

const { t } = useI18n();
const settingsStore = useSettingsStore();

// Form data
const dormitoryForm = reactive<DormitorySettings>({
  max_students_per_dormitory: 500,
  registration_enabled: true,
  backup_list_enabled: true,
  payment_deadline_days: 30,
  default_room_price: 50000,
});

const smtpForm = reactive<SmtpSettings>({
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  smtp_encryption: 'tls',
  mail_from_address: '',
  mail_from_name: '',
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

const languageForm = reactive({
  language: 'en',
  file: null as File | null,
});

const logsForm = reactive({
  type: 'all',
  limit: 100,
});

// Options
const encryptionOptions = [
  { value: 'tls', label: 'TLS' },
  { value: 'ssl', label: 'SSL' },
  { value: 'none', label: 'None' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'kk', label: 'Kazakh' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
];

const logTypeOptions = [
  { value: 'all', label: 'All Logs' },
  { value: 'error', label: 'Errors Only' },
  { value: 'info', label: 'Info Only' },
  { value: 'warning', label: 'Warnings Only' },
];

// Computed
const { loading, systemLogs, installedLanguages } = settingsStore;

// Additional reactive properties
const loadingLogs = ref(false);
const refreshLogs = async () => {
  loadingLogs.value = true;
  try {
    await fetchLogs();
  } finally {
    loadingLogs.value = false;
  }
};

// Methods
const loadSettings = async () => {
  await settingsStore.fetchAllSettings();
  
  // Load form data from store
  if (settingsStore.smtpSettings) {
    Object.assign(smtpForm, settingsStore.smtpSettings);
  }
  if (settingsStore.cardReaderSettings) {
    Object.assign(cardReaderForm, settingsStore.cardReaderSettings);
  }
  if (settingsStore.onecSettings) {
    Object.assign(onecForm, settingsStore.onecSettings);
  }
  if (settingsStore.dormitorySettings) {
    Object.assign(dormitoryForm, settingsStore.dormitorySettings);
  }
};

const saveDormitorySettings = async () => {
  try {
    await settingsStore.updateDormitorySettings({ ...dormitoryForm });
  } catch (error) {
    console.error('Failed to save dormitory settings:', error);
  }
};

const saveSmtpSettings = async () => {
  try {
    await settingsStore.updateSmtpSettings({ ...smtpForm });
  } catch (error) {
    console.error('Failed to save SMTP settings:', error);
  }
};

const saveCardReaderSettings = async () => {
  try {
    await settingsStore.updateCardReaderSettings({ ...cardReaderForm });
  } catch (error) {
    console.error('Failed to save card reader settings:', error);
  }
};

const saveOnecSettings = async () => {
  try {
    await settingsStore.updateOnecSettings({ ...onecForm });
  } catch (error) {
    console.error('Failed to save 1C settings:', error);
  }
};

const uploadLanguage = async () => {
  if (!languageForm.file) return;
  
  try {
    await settingsStore.uploadLanguageFile(languageForm.file, languageForm.language);
    languageForm.file = null;
  } catch (error) {
    console.error('Failed to upload language file:', error);
  }
};

const fetchLogs = async () => {
  await settingsStore.fetchSystemLogs(logsForm.type, logsForm.limit);
};

const clearLogs = async () => {
  try {
    await settingsStore.clearSystemLogs();
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
};

const initializeDefaults = async () => {
  try {
    await settingsStore.initializeDefaults();
    await loadSettings();
  } catch (error) {
    console.error('Failed to initialize defaults:', error);
  }
};

const addLocation = () => {
  cardReaderForm.card_reader_locations.push('');
};

const removeLocation = (index: number) => {
  cardReaderForm.card_reader_locations.splice(index, 1);
};

// Lifecycle
onMounted(() => {
  loadSettings();
  fetchLogs();
});
</script> 