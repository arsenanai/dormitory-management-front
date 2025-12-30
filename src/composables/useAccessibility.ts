import { ref, reactive, watch } from "vue";

interface AccessibilitySettings {
  accessibilityMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
}

const defaultSettings: AccessibilitySettings = {
  accessibilityMode: false,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
};

const settings = reactive<AccessibilitySettings>({ ...defaultSettings });
const isInitialized = ref(false);

export function useAccessibility() {
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("accessibility-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(settings, { ...defaultSettings, ...parsed });
      } else {
        // If no saved settings, use defaults (accessibilityMode: false)
        Object.assign(settings, defaultSettings);
      }

      // Ensure accessibilityMode is false by default for admin@email.com
      if (settings.accessibilityMode === undefined || settings.accessibilityMode === null) {
        settings.accessibilityMode = false;
      }

      applySettings();
      isInitialized.value = true;
    } catch (error) {
      console.error("Failed to load accessibility settings:", error);
      // Fallback to defaults on error
      Object.assign(settings, defaultSettings);
      applySettings();
      isInitialized.value = true;
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("accessibility-settings", JSON.stringify(settings));
      applySettings();
    } catch (error) {
      console.error("Failed to save accessibility settings:", error);
    }
  };

  const applySettings = () => {
    const root = document.documentElement;

    // Apply accessibility mode (remove borders, use shadows)
    if (settings.accessibilityMode) {
      root.classList.add("accessibility-mode");
    } else {
      root.classList.remove("accessibility-mode");
    }

    // Apply high contrast mode
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Apply large text
    if (settings.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    settings[key] = value;
    saveSettings();
  };

  const resetSettings = () => {
    Object.assign(settings, defaultSettings);
    saveSettings();
  };

  const resetAccessibilityMode = () => {
    settings.accessibilityMode = false;
    saveSettings();
  };

  // Watch for changes and apply them
  watch(
    settings,
    () => {
      applySettings();
    },
    { deep: true }
  );

  return {
    settings,
    isInitialized,
    loadSettings,
    saveSettings,
    applySettings,
    updateSetting,
    resetSettings,
    resetAccessibilityMode,
  };
}
