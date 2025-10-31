import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';

export interface SmtpSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  mail_from_address: string;
  mail_from_name: string;
}

export interface CardReaderSettings {
  card_reader_enabled: boolean;
  card_reader_host: string;
  card_reader_port: number;
  card_reader_timeout: number;
  card_reader_locations: string[];
}

export interface OneCSettings {
  onec_enabled: boolean;
  onec_host: string;
  onec_database: string;
  onec_username: string;
  onec_password: string;
  onec_sync_interval: number;
}

export interface KaspiSettings {
  kaspi_enabled: boolean;
  kaspi_api_key: string | null;
  kaspi_merchant_id: string | null;
  kaspi_webhook_url: string | null;
}

export interface DormitorySettings {
  max_students_per_dormitory: number;
  registration_enabled: boolean;
  backup_list_enabled: boolean;
  payment_deadline_days: number;
  default_room_price: number;
}

export interface SystemLog {
  file: string;
  content: string;
  timestamp: string;
}

export const useSettingsStore = defineStore('settings', () => {
  const { showError, showSuccess } = useToast();
  
  // State
  const smtpSettings = ref<SmtpSettings | null>(null);
  const cardReaderSettings = ref<CardReaderSettings | null>(null);
  const onecSettings = ref<OneCSettings | null>(null);
  const kaspiSettings = ref<KaspiSettings | null>(null);
  const dormitorySettings = ref<DormitorySettings | null>(null);
  const generalSettings = ref<GeneralSettings | null>(null);
  const installedLanguages = ref<string[]>([]);
  const systemLogs = ref<SystemLog[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Computed
  const hasSmtpSettings = computed(() => smtpSettings.value !== null);
  const hasCardReaderSettings = computed(() => cardReaderSettings.value !== null);
  const hasOnecSettings = computed(() => onecSettings.value !== null);
  const hasDormitorySettings = computed(() => dormitorySettings.value !== null);
  const hasGeneralSettings = computed(() => generalSettings.value !== null);

  // Actions
  const fetchSmtpSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/smtp');
      smtpSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch SMTP settings');
    } finally {
      loading.value = false;
    }
  };

  const updateSmtpSettings = async (settings: SmtpSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put('/configurations/smtp', settings);
      smtpSettings.value = response.data;
      error.value = null;
      showSuccess('SMTP settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to update SMTP settings');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCardReaderSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/card-reader');
      cardReaderSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch card reader settings');
    } finally {
      loading.value = false;
    }
  };

  const updateCardReaderSettings = async (settings: CardReaderSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put('/configurations/card-reader', settings);
      cardReaderSettings.value = response.data;
      error.value = null;
      showSuccess('Card reader settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to update card reader settings');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOnecSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/onec');
      onecSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch 1C settings');
    } finally {
      loading.value = false;
    }
  };

  const updateOnecSettings = async (settings: OneCSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put('/configurations/onec', settings);
      onecSettings.value = response.data;
      error.value = null;
      showSuccess('1C settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to update 1C settings');
    } finally {
      loading.value = false;
    }
  };

  // Kaspi settings
  const fetchKaspiSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/kaspi');
      kaspiSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch Kaspi settings');
    } finally {
      loading.value = false;
    }
  };

  const updateKaspiSettings = async (settings: KaspiSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put('/configurations/kaspi', settings);
      kaspiSettings.value = response.data;
      error.value = null;
      showSuccess('Kaspi settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to update Kaspi settings');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCurrencySettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/currency');
      generalSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch currency settings');
    } finally {
      loading.value = false;
    }
  };

  const updateCurrencySettings = async (settings: GeneralSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put('/configurations/currency', settings);
      generalSettings.value = settings; // Optimistic update
      error.value = null;
      showSuccess('Currency settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to update currency settings');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchDormitorySettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/dormitory');
      dormitorySettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch dormitory settings');
    } finally {
      loading.value = false;
    }
  };

  const updateDormitorySettings = async (settings: DormitorySettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put('/configurations/dormitory', settings);
      dormitorySettings.value = response.data;
      error.value = null;
      const { showSuccess } = useToast();
      showSuccess('Dormitory settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to update dormitory settings');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchInstalledLanguages = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/languages');
      installedLanguages.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch installed languages');
    } finally {
      loading.value = false;
    }
  };

  const uploadLanguageFile = async (file: File, language: string) => {
    try {
      loading.value = true;
      error.value = null;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      
      const response = await api.post('/configurations/languages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchInstalledLanguages();
      error.value = null;
      showSuccess('Language file uploaded successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to upload language file');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSystemLogs = async (type: string = 'all', limit: number = 100) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/logs', {
        params: { type, limit }
      });
      systemLogs.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to fetch system logs');
    } finally {
      loading.value = false;
    }
  };

  const clearSystemLogs = async () => {
    try {
      loading.value = true;
      error.value = null;
      await api.delete('/configurations/logs');
      systemLogs.value = [];
      error.value = null;
      showSuccess('System logs cleared successfully');
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to clear system logs');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const initializeDefaults = async () => {
    try {
      loading.value = true;
      error.value = null;
      await api.post('/configurations/initialize');
      error.value = null;
      showSuccess('Default configurations initialized successfully');
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || 'Failed to initialize defaults');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllSettings = async () => {
    await Promise.all([
      fetchCardReaderSettings(),
      fetchOnecSettings(),
      fetchKaspiSettings(),
      fetchDormitorySettings(),
      fetchCurrencySettings(),
    ]);
  };

  return {
    // State
    smtpSettings,
    cardReaderSettings,
    onecSettings,
    kaspiSettings,
    dormitorySettings,
    generalSettings,
    installedLanguages,
    systemLogs,
    loading,
    error,
    
    // Computed
    hasSmtpSettings,
    hasCardReaderSettings,
    hasOnecSettings,
    hasDormitorySettings,
    hasGeneralSettings,
    
    // Actions
    fetchSmtpSettings,
    updateSmtpSettings,
    fetchCardReaderSettings,
    updateCardReaderSettings,
    fetchOnecSettings,
    updateOnecSettings,
    fetchKaspiSettings,
    updateKaspiSettings,
    fetchDormitorySettings,
    updateDormitorySettings,
    fetchCurrencySettings,
    updateCurrencySettings,
    fetchInstalledLanguages,
    uploadLanguageFile,
    fetchSystemLogs,
    clearSystemLogs,
    initializeDefaults,
    fetchAllSettings,
  };
}); 