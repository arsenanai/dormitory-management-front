import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
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
  const { showToast } = useToast();
  
  // State
  const smtpSettings = ref<SmtpSettings | null>(null);
  const cardReaderSettings = ref<CardReaderSettings | null>(null);
  const onecSettings = ref<OneCSettings | null>(null);
  const dormitorySettings = ref<DormitorySettings | null>(null);
  const installedLanguages = ref<string[]>([]);
  const systemLogs = ref<SystemLog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasSmtpSettings = computed(() => smtpSettings.value !== null);
  const hasCardReaderSettings = computed(() => cardReaderSettings.value !== null);
  const hasOnecSettings = computed(() => onecSettings.value !== null);
  const hasDormitorySettings = computed(() => dormitorySettings.value !== null);

  // Actions
  const fetchSmtpSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/configurations/smtp');
      smtpSettings.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch SMTP settings';
      showToast('error', error.value);
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
      showToast('success', 'SMTP settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update SMTP settings';
      showToast('error', error.value);
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch card reader settings';
      showToast('error', error.value);
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
      showToast('success', 'Card reader settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update card reader settings';
      showToast('error', error.value);
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch 1C settings';
      showToast('error', error.value);
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
      showToast('success', '1C settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update 1C settings';
      showToast('error', error.value);
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch dormitory settings';
      showToast('error', error.value);
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
      showToast('success', 'Dormitory settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update dormitory settings';
      showToast('error', error.value);
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch installed languages';
      showToast('error', error.value);
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
      showToast('success', 'Language file uploaded successfully');
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upload language file';
      showToast('error', error.value);
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch system logs';
      showToast('error', error.value);
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
      showToast('success', 'System logs cleared successfully');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to clear system logs';
      showToast('error', error.value);
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
      showToast('success', 'Default configurations initialized successfully');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to initialize defaults';
      showToast('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllSettings = async () => {
    await Promise.all([
      fetchSmtpSettings(),
      fetchCardReaderSettings(),
      fetchOnecSettings(),
      fetchDormitorySettings(),
      fetchInstalledLanguages(),
    ]);
  };

  return {
    // State
    smtpSettings,
    cardReaderSettings,
    onecSettings,
    dormitorySettings,
    installedLanguages,
    systemLogs,
    loading,
    error,
    
    // Computed
    hasSmtpSettings,
    hasCardReaderSettings,
    hasOnecSettings,
    hasDormitorySettings,
    
    // Actions
    fetchSmtpSettings,
    updateSmtpSettings,
    fetchCardReaderSettings,
    updateCardReaderSettings,
    fetchOnecSettings,
    updateOnecSettings,
    fetchDormitorySettings,
    updateDormitorySettings,
    fetchInstalledLanguages,
    uploadLanguageFile,
    fetchSystemLogs,
    clearSystemLogs,
    initializeDefaults,
    fetchAllSettings,
  };
}); 