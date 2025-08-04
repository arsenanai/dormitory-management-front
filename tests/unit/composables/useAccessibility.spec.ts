import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAccessibility } from '@/composables/useAccessibility';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
  },
};
Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
});

describe('useAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default settings', () => {
    const { settings } = useAccessibility();
    
    expect(settings.accessibilityMode).toBe(false);
    expect(settings.highContrast).toBe(false);
    expect(settings.reducedMotion).toBe(false);
    expect(settings.largeText).toBe(false);
  });

  it('should load settings from localStorage', () => {
    const savedSettings = {
      accessibilityMode: true,
      highContrast: true,
      reducedMotion: false,
      largeText: true,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { settings, loadSettings } = useAccessibility();
    loadSettings();

    expect(settings.accessibilityMode).toBe(true);
    expect(settings.highContrast).toBe(true);
    expect(settings.reducedMotion).toBe(false);
    expect(settings.largeText).toBe(true);
  });

  it('should save settings to localStorage', () => {
    const { settings, saveSettings, resetSettings } = useAccessibility();
    
    // Reset to defaults first
    resetSettings();
    vi.clearAllMocks();
    
    settings.accessibilityMode = true;
    settings.highContrast = true;
    saveSettings();

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'accessibility-settings',
      JSON.stringify({
        accessibilityMode: true,
        highContrast: true,
        reducedMotion: false,
        largeText: false,
      })
    );
  });

  it('should apply accessibility mode classes', () => {
    const { settings, applySettings } = useAccessibility();
    
    settings.accessibilityMode = true;
    applySettings();

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('accessibility-mode');
  });

  it('should apply high contrast mode classes', () => {
    const { settings, applySettings } = useAccessibility();
    
    settings.highContrast = true;
    applySettings();

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('high-contrast');
  });

  it('should apply reduced motion classes', () => {
    const { settings, applySettings } = useAccessibility();
    
    settings.reducedMotion = true;
    applySettings();

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('reduced-motion');
  });

  it('should apply large text classes', () => {
    const { settings, applySettings } = useAccessibility();
    
    settings.largeText = true;
    applySettings();

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('large-text');
  });

  it('should remove classes when settings are disabled', () => {
    const { settings, applySettings } = useAccessibility();
    
    // First enable all settings
    settings.accessibilityMode = true;
    settings.highContrast = true;
    settings.reducedMotion = true;
    settings.largeText = true;
    applySettings();

    // Then disable them
    settings.accessibilityMode = false;
    settings.highContrast = false;
    settings.reducedMotion = false;
    settings.largeText = false;
    applySettings();

    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('accessibility-mode');
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('high-contrast');
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('reduced-motion');
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('large-text');
  });

  it('should update individual settings', () => {
    const { updateSetting } = useAccessibility();
    
    updateSetting('accessibilityMode', true);
    updateSetting('highContrast', true);

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should reset settings to defaults', () => {
    const { settings, resetSettings } = useAccessibility();
    
    // Set some custom values
    settings.accessibilityMode = true;
    settings.highContrast = true;
    
    resetSettings();

    expect(settings.accessibilityMode).toBe(false);
    expect(settings.highContrast).toBe(false);
    expect(settings.reducedMotion).toBe(false);
    expect(settings.largeText).toBe(false);
  });
}); 