import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import { useToast } from "@/composables/useToast";
import { configurationService } from "@/services/api";
import type { PublicSettings } from "@/models/PublicSettings";
import type { SmtpSettings } from "@/models/SmtpSettings";
import type { CardReaderSettings } from "@/models/CardReaderSettings";
import type { OneCSettings } from "@/models/OneCSettings";
import type { KaspiSettings } from "@/models/KaspiSettings";
import type { SystemLog } from "@/models/SystemLog";
import type { PaymentSettings } from "@/models/PaymentSettings";

// export interface SmtpSettings {
//   smtp_host: string;
//   smtp_port: number;
//   smtp_username: string;
//   smtp_password: string;
//   smtp_encryption: 'tls' | 'ssl' | 'none';
//   mail_from_address: string;
//   mail_from_name: string;
// }

// export interface CardReaderSettings {
//   card_reader_enabled: boolean;
//   card_reader_host: string;
//   card_reader_port: number;
//   card_reader_timeout: number;
//   card_reader_locations: string[];
// }

// export interface OneCSettings {
//   onec_enabled: boolean;
//   onec_host: string;
//   onec_database: string;
//   onec_username: string;
//   onec_password: string;
//   onec_sync_interval: number;
// }

// export interface KaspiSettings {
//   kaspi_enabled: boolean;
//   kaspi_api_key: string | null;
//   kaspi_merchant_id: string | null;
//   kaspi_webhook_url: string | null;
// }

// export interface PublicSettings {
//   max_students_per_dormitory: number;
//   registration_enabled: boolean;
//   backup_list_enabled: boolean;
//   payment_deadline_days: number;
//   dormitory_rules: string;
//   currency_symbol: string;
//   bank_requisites: string;
// }

// export interface SystemLog {
//   file: string;
//   content: string;
//   timestamp: string;
// }

export const useSettingsStore = defineStore("settings", () => {
  const { showError, showSuccess } = useToast();

  // State
  const smtpSettings = ref<SmtpSettings | null>(null);
  const cardReaderSettings = ref<CardReaderSettings | null>(null);
  const onecSettings = ref<OneCSettings | null>(null);
  const kaspiSettings = ref<KaspiSettings | null>(null);
  const publicSettings = ref<PublicSettings | null>(null);
  const paymentSettings = ref<PaymentSettings | null>(null);
  const installedLanguages = ref<string[]>([]);
  const systemLogs = ref<SystemLog[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Computed
  const hasSmtpSettings = computed(() => smtpSettings.value !== null);
  const hasCardReaderSettings = computed(() => cardReaderSettings.value !== null);
  const hasOnecSettings = computed(() => onecSettings.value !== null);
  const hasPublicSettings = computed(() => publicSettings.value !== null);

  // Actions
  const fetchSmtpSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/configurations/smtp");
      smtpSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to fetch SMTP settings");
    } finally {
      loading.value = false;
    }
  };

  const updateSmtpSettings = async (settings: SmtpSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/smtp", settings);
      smtpSettings.value = response.data;
      error.value = null;
      // showSuccess('SMTP settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to update SMTP settings");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCardReaderSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/configurations/card-reader");
      cardReaderSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to fetch card reader settings");
    } finally {
      loading.value = false;
    }
  };

  const updateCardReaderSettings = async (settings: CardReaderSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/card-reader", settings);
      cardReaderSettings.value = response.data;
      error.value = null;
      // showSuccess('Card reader settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to update card reader settings");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOnecSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/configurations/onec");
      onecSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to fetch 1C settings");
    } finally {
      loading.value = false;
    }
  };

  const updateOnecSettings = async (settings: OneCSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/onec", settings);
      onecSettings.value = response.data;
      error.value = null;
      // showSuccess('1C settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to update 1C settings");
    } finally {
      loading.value = false;
    }
  };

  // Kaspi settings
  const fetchKaspiSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/configurations/kaspi");
      kaspiSettings.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to fetch Kaspi settings");
    } finally {
      loading.value = false;
    }
  };

  const updateKaspiSettings = async (settings: KaspiSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/kaspi", settings);
      kaspiSettings.value = response.data;
      error.value = null;
      // showSuccess('Kaspi settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to update Kaspi settings");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrencySettings = async (currencySymbol: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/currency", {
        currency_symbol: currencySymbol,
      });
      error.value = null;
      // showSuccess('Currency settings updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to update currency settings");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDormitoryRules = async (rules: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/dormitory-rules", { dormitory_rules: rules });
      if (publicSettings.value) {
        publicSettings.value.dormitory_rules = rules;
      }
      // showSuccess('Dormitory rules updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to update dormitory rules");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBankRequisites = async (value: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/bank-requisites", { bank_requisites: value });
      error.value = null;
      // showSuccess('Bank requisites updated successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to update bank requisites");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchInstalledLanguages = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/configurations/languages");
      installedLanguages.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to fetch installed languages");
    } finally {
      loading.value = false;
    }
  };

  const uploadLanguageFile = async (file: File, language: string) => {
    try {
      loading.value = true;
      error.value = null;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const response = await api.post("/configurations/languages/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchInstalledLanguages();
      error.value = null;
      // showSuccess('Language file uploaded successfully');
      return response.data;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to upload language file");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSystemLogs = async (type: string = "all", limit: number = 100) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/configurations/logs", {
        params: { type, limit },
      });
      systemLogs.value = response.data;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to fetch system logs");
    } finally {
      loading.value = false;
    }
  };

  const clearSystemLogs = async () => {
    try {
      loading.value = true;
      error.value = null;
      await api.delete("/configurations/logs");
      systemLogs.value = [];
      error.value = null;
      // showSuccess('System logs cleared successfully');
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to clear system logs");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const initializeDefaults = async () => {
    try {
      loading.value = true;
      error.value = null;
      await api.post("/configurations/initialize");
      error.value = null;
      // showSuccess('Default configurations initialized successfully');
    } catch (err: any) {
      error.value = err;
      showError(err.response?.data?.message || "Failed to initialize defaults");
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
      fetchPublicSettings(),
    ]);
  };

  let publicSettingsPromise: Promise<void> | null = null;

  const fetchPublicSettings = async () => {
    // Prevent re-fetching if already loaded
    if (publicSettings.value) return Promise.resolve();
    // If a fetch is already in progress, return the existing promise
    if (publicSettingsPromise) return publicSettingsPromise;

    publicSettingsPromise = (async () => {
      try {
        loading.value = true;
        const response = await configurationService.getPublicSettings();
        publicSettings.value = response;
      } catch (err: any) {
        showError(err.response?.data?.message || "Failed to fetch public settings");
      } finally {
        loading.value = false;
        // Reset promise after completion to allow re-fetching if needed later
        publicSettingsPromise = null;
      }
    })();
    return publicSettingsPromise;
  };

  // Payment Settings
  const fetchPaymentSettings = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/configurations/payment-settings");
      paymentSettings.value = response.data;
      error.value = null;
    } catch (err: unknown) {
      error.value = err as Error;
      const errorMessage =
        (err as any).response?.data?.message ?? "Failed to fetch payment settings";
      showError(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  const updatePaymentSettings = async (settings: PaymentSettings) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put("/configurations/payment-settings", settings);
      paymentSettings.value = response.data;
      error.value = null;
      return response.data;
    } catch (err: unknown) {
      error.value = err as Error;
      const errorMessage =
        (err as any).response?.data?.message ?? "Failed to update payment settings";
      showError(errorMessage);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    smtpSettings,
    cardReaderSettings,
    onecSettings,
    kaspiSettings,
    publicSettings,
    paymentSettings,
    installedLanguages,
    systemLogs,
    loading,
    error,

    // Computed
    hasSmtpSettings,
    hasCardReaderSettings,
    hasOnecSettings,
    hasPublicSettings,

    // Actions
    fetchSmtpSettings,
    updateSmtpSettings,
    fetchCardReaderSettings,
    updateCardReaderSettings,
    fetchOnecSettings,
    updateOnecSettings,
    fetchKaspiSettings,
    updateKaspiSettings,
    updateDormitoryRules,
    updateBankRequisites,
    updateCurrencySettings,
    fetchInstalledLanguages,
    uploadLanguageFile,
    fetchSystemLogs,
    clearSystemLogs,
    initializeDefaults,
    fetchAllSettings,
    fetchPublicSettings,
    fetchPaymentSettings,
    updatePaymentSettings,
  };
});
