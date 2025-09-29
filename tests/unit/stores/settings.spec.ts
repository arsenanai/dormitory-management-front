import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore, type SmtpSettings, type CardReaderSettings, type OneCSettings, type DormitorySettings } from '@/stores/settings';

// Mock the API service as a default export
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the toast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('State', () => {
    it('should have initial state', () => {
      const store = useSettingsStore();
      
      expect(store.smtpSettings).toBeNull();
      expect(store.cardReaderSettings).toBeNull();
      expect(store.onecSettings).toBeNull();
      expect(store.dormitorySettings).toBeNull();
      expect(store.installedLanguages).toEqual([]);
      expect(store.systemLogs).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Computed', () => {
    it('should compute hasSmtpSettings correctly', () => {
      const store = useSettingsStore();
      
      expect(store.hasSmtpSettings).toBe(false);
      
      store.smtpSettings = {} as SmtpSettings;
      expect(store.hasSmtpSettings).toBe(true);
    });

    it('should compute hasCardReaderSettings correctly', () => {
      const store = useSettingsStore();
      
      expect(store.hasCardReaderSettings).toBe(false);
      
      store.cardReaderSettings = {} as CardReaderSettings;
      expect(store.hasCardReaderSettings).toBe(true);
    });

    it('should compute hasOnecSettings correctly', () => {
      const store = useSettingsStore();
      
      expect(store.hasOnecSettings).toBe(false);
      
      store.onecSettings = {} as OneCSettings;
      expect(store.hasOnecSettings).toBe(true);
    });

    it('should compute hasDormitorySettings correctly', () => {
      const store = useSettingsStore();
      
      expect(store.hasDormitorySettings).toBe(false);
      
      store.dormitorySettings = {} as DormitorySettings;
      expect(store.hasDormitorySettings).toBe(true);
    });
  });

  describe('SMTP Settings', () => {
    it('should fetch SMTP settings successfully', async () => {
      const mockSmtpSettings: SmtpSettings = {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: 'test@example.com',
        smtp_password: 'password',
        smtp_encryption: 'tls',
        mail_from_address: 'noreply@example.com',
        mail_from_name: 'Test System',
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockSmtpSettings });

      const store = useSettingsStore();
      await store.fetchSmtpSettings();

      expect(api.get).toHaveBeenCalledWith('/configurations/smtp');
      expect(store.smtpSettings).toEqual(mockSmtpSettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should handle SMTP settings fetch error', async () => {
      const error = new Error('Network error');
      const api = (await import('@/services/api')).default;
      vi.mocked(api.get).mockRejectedValueOnce(error);

      const store = useSettingsStore();
      await store.fetchSmtpSettings();

      expect(api.get).toHaveBeenCalledWith('/configurations/smtp');
      expect(store.smtpSettings).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBe(error);
    });

    it('should update SMTP settings successfully', async () => {
      const mockSmtpSettings: SmtpSettings = {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: 'test@example.com',
        smtp_password: 'password',
        smtp_encryption: 'tls',
        mail_from_address: 'noreply@example.com',
        mail_from_name: 'Test System',
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockSmtpSettings });

      const store = useSettingsStore();
      const result = await store.updateSmtpSettings(mockSmtpSettings);

      expect(api.put).toHaveBeenCalledWith('/configurations/smtp', mockSmtpSettings);
      expect(store.smtpSettings).toEqual(mockSmtpSettings);
      expect(result).toEqual(mockSmtpSettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Card Reader Settings', () => {
    it('should fetch card reader settings successfully', async () => {
      const mockCardReaderSettings: CardReaderSettings = {
        card_reader_enabled: true,
        card_reader_host: '192.168.1.100',
        card_reader_port: 8080,
        card_reader_timeout: 30,
        card_reader_locations: ['Main Entrance', 'Back Door'],
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockCardReaderSettings });

      const store = useSettingsStore();
      await store.fetchCardReaderSettings();

      expect(api.get).toHaveBeenCalledWith('/configurations/card-reader');
      expect(store.cardReaderSettings).toEqual(mockCardReaderSettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should update card reader settings successfully', async () => {
      const mockCardReaderSettings: CardReaderSettings = {
        card_reader_enabled: true,
        card_reader_host: '192.168.1.100',
        card_reader_port: 8080,
        card_reader_timeout: 30,
        card_reader_locations: ['Main Entrance', 'Back Door'],
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockCardReaderSettings });

      const store = useSettingsStore();
      const result = await store.updateCardReaderSettings(mockCardReaderSettings);

      expect(api.put).toHaveBeenCalledWith('/configurations/card-reader', mockCardReaderSettings);
      expect(store.cardReaderSettings).toEqual(mockCardReaderSettings);
      expect(result).toEqual(mockCardReaderSettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('1C Settings', () => {
    it('should fetch 1C settings successfully', async () => {
      const mockOnecSettings: OneCSettings = {
        onec_enabled: true,
        onec_host: '192.168.1.200',
        onec_database: 'testdb',
        onec_username: 'admin',
        onec_password: 'password',
        onec_sync_interval: 3600,
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockOnecSettings });

      const store = useSettingsStore();
      await store.fetchOnecSettings();

      expect(api.get).toHaveBeenCalledWith('/configurations/onec');
      expect(store.onecSettings).toEqual(mockOnecSettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should update 1C settings successfully', async () => {
      const mockOnecSettings: OneCSettings = {
        onec_enabled: true,
        onec_host: '192.168.1.200',
        onec_database: 'testdb',
        onec_username: 'admin',
        onec_password: 'password',
        onec_sync_interval: 3600,
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockOnecSettings });

      const store = useSettingsStore();
      const result = await store.updateOnecSettings(mockOnecSettings);

      expect(api.put).toHaveBeenCalledWith('/configurations/onec', mockOnecSettings);
      expect(store.onecSettings).toEqual(mockOnecSettings);
      expect(result).toEqual(mockOnecSettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Dormitory Settings', () => {
    it('should fetch dormitory settings successfully', async () => {
      const mockDormitorySettings: DormitorySettings = {
        max_students_per_dormitory: 100,
        default_room_price: 50000,
        payment_deadline_days: 30,
        registration_enabled: true,
        backup_list_enabled: true,
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockDormitorySettings });

      const store = useSettingsStore();
      await store.fetchDormitorySettings();

      expect(api.get).toHaveBeenCalledWith('/configurations/dormitory');
      expect(store.dormitorySettings).toEqual(mockDormitorySettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should update dormitory settings successfully', async () => {
      const mockDormitorySettings: DormitorySettings = {
        max_students_per_dormitory: 100,
        default_room_price: 50000,
        payment_deadline_days: 30,
        registration_enabled: true,
        backup_list_enabled: true,
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockDormitorySettings });

      const store = useSettingsStore();
      const result = await store.updateDormitorySettings(mockDormitorySettings);

      expect(api.put).toHaveBeenCalledWith('/configurations/dormitory', mockDormitorySettings);
      expect(store.dormitorySettings).toEqual(mockDormitorySettings);
      expect(result).toEqual(mockDormitorySettings);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Language Management', () => {
    it('should fetch installed languages successfully', async () => {
      const mockLanguages = ['en', 'ru', 'kk'];

      const api = (await import('@/services/api')).default;
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockLanguages });

      const store = useSettingsStore();
      await store.fetchInstalledLanguages();

      expect(api.get).toHaveBeenCalledWith('/configurations/languages');
      expect(store.installedLanguages).toEqual(mockLanguages);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should upload language file successfully', async () => {
      const mockResponse = {
        message: 'Language file uploaded successfully',
        language: 'fr',
        file_path: 'languages/fr.json',
      };

      const api = (await import('@/services/api')).default;
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const store = useSettingsStore();
      const file = new File(['{"hello": "bonjour"}'], 'fr.json', { type: 'application/json' });
      const result = await store.uploadLanguageFile('fr', file);

      expect(api.post).toHaveBeenCalledWith('/configurations/languages/upload', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('System Logs', () => {
    it('should fetch system logs successfully', async () => {
      const mockLogs = [
        { file: 'laravel.log', content: 'Error message', timestamp: '2024-01-01 12:00:00' },
        { file: 'access.log', content: 'Access log entry', timestamp: '2024-01-01 12:01:00' },
      ];

      const api = (await import('@/services/api')).default;
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockLogs });

      const store = useSettingsStore();
      await store.fetchSystemLogs('all', 100);

      expect(api.get).toHaveBeenCalledWith('/configurations/logs', {
        params: { type: 'all', limit: 100 },
      });
      expect(store.systemLogs).toEqual(mockLogs);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should clear system logs successfully', async () => {
      const api = (await import('@/services/api')).default;
      vi.mocked(api.delete).mockResolvedValueOnce({});

      const store = useSettingsStore();
      store.systemLogs = [{ file: 'test.log', content: 'test', timestamp: '2024-01-01 12:00:00' }];
      await store.clearSystemLogs();

      expect(api.delete).toHaveBeenCalledWith('/configurations/logs');
      expect(store.systemLogs).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Initialize Defaults', () => {
    it('should initialize defaults successfully', async () => {
      const api = (await import('@/services/api')).default;
      vi.mocked(api.post).mockResolvedValueOnce({});

      const store = useSettingsStore();
      await store.initializeDefaults();

      expect(api.post).toHaveBeenCalledWith('/configurations/initialize');
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Fetch All Settings', () => {
    it('should fetch all settings successfully', async () => {
      const mockSmtpSettings: SmtpSettings = {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: 'test@example.com',
        smtp_password: 'password',
        smtp_encryption: 'tls',
        mail_from_address: 'noreply@example.com',
        mail_from_name: 'Test System',
      };

      const mockCardReaderSettings: CardReaderSettings = {
        card_reader_enabled: true,
        card_reader_host: '192.168.1.100',
        card_reader_port: 8080,
        card_reader_timeout: 30,
        card_reader_locations: ['Main Entrance'],
      };

      const mockOnecSettings: OneCSettings = {
        onec_enabled: true,
        onec_host: '192.168.1.200',
        onec_database: 'testdb',
        onec_username: 'admin',
        onec_password: 'password',
        onec_sync_interval: 3600,
      };

      const mockDormitorySettings: DormitorySettings = {
        max_students_per_dormitory: 100,
        default_room_price: 50000,
        payment_deadline_days: 30,
        registration_enabled: true,
        backup_list_enabled: true,
      };

      const mockLanguages = ['en', 'ru', 'kk'];

      const api = (await import('@/services/api')).default;
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockCardReaderSettings })
        .mockResolvedValueOnce({ data: mockOnecSettings })
        .mockResolvedValueOnce({ data: { kaspi_enabled: false, kaspi_api_key: null, kaspi_merchant_id: null, kaspi_webhook_url: null } });

      const store = useSettingsStore();
      await store.fetchAllSettings();

      expect(api.get).toHaveBeenCalledTimes(3);
      expect(store.cardReaderSettings).toEqual(mockCardReaderSettings);
      expect(store.onecSettings).toEqual(mockOnecSettings);
      expect(store.kaspiSettings).toEqual({ kaspi_enabled: false, kaspi_api_key: null, kaspi_merchant_id: null, kaspi_webhook_url: null });
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });
}); 