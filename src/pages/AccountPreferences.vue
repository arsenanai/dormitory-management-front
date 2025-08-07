<template>
  <Navigation :title="t('Account Preferences')">
    <div class="flex flex-col gap-8">
      <!-- Profile Information Section -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Profile Information') }}</h2>
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CInput
              id="profile-name"
              v-model="profileForm.name"
              :label="t('Full Name')"
              required
            />
            <CInput
              id="profile-email"
              v-model="profileForm.email"
              :label="t('Email')"
              type="email"
              required
            />
            <CInput
              id="profile-phone"
              v-model="profileForm.phone"
              :label="t('Phone Number')"
              required
            />
            <CSelect
              id="profile-language"
              v-model="profileForm.language"
              :label="t('Preferred Language')"
              :options="languageOptions"
              required
            />
          </div>
          <CButton type="submit" :loading="loading">
            {{ t('Save Profile') }}
          </CButton>
        </form>
      </section>

      <!-- Website Language Section -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Website Language') }}</h2>
        <div class="space-y-4">
          <CSelect
            id="website-locale"
            v-model="currentLocale"
            :label="t('Display Language')"
            :options="localeOptions"
            @update:model-value="changeLocale"
          />
          <p class="text-sm text-gray-600">
            {{ t('Choose the language for displaying the website interface.') }}
          </p>
        </div>
      </section>

      <!-- Security Settings Section -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Security Settings') }}</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CInput
              id="current-password"
              v-model="passwordForm.currentPassword"
              :label="t('Current Password')"
              type="password"
              required
            />
            <CInput
              id="new-password"
              v-model="passwordForm.newPassword"
              :label="t('New Password')"
              type="password"
              required
            />
            <CInput
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              :label="t('Confirm New Password')"
              type="password"
              required
            />
          </div>
          <CButton type="submit" :loading="loading">
            {{ t('Change Password') }}
          </CButton>
        </form>
      </section>

      <!-- Notification Settings Section -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Notification Settings') }}</h2>
        <div class="space-y-4">
          <CCheckbox
            id="email-notifications"
            v-model="notificationForm.emailNotifications"
            :label="t('Email Notifications')"
          />
          <CCheckbox
            id="sms-notifications"
            v-model="notificationForm.smsNotifications"
            :label="t('SMS Notifications')"
          />
          <CCheckbox
            id="system-notifications"
            v-model="notificationForm.systemNotifications"
            :label="t('System Notifications')"
          />
          <CButton @click="saveNotificationSettings" :loading="loading">
            {{ t('Save Notification Settings') }}
          </CButton>
        </div>
      </section>

      <!-- Accessibility Settings Section -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-primary-700">{{ t('Accessibility Settings') }}</h2>
        <div class="space-y-4">
          <CCheckbox
            id="accessibility-mode"
            v-model="accessibilityForm.accessibilityMode"
            :label="t('Enable Accessibility Mode')"
          />
          <p class="text-sm text-gray-600">
            {{ t('When enabled, removes black borders and uses shadows for focus indicators instead.') }}
          </p>
          <CCheckbox
            id="high-contrast"
            v-model="accessibilityForm.highContrast"
            :label="t('High Contrast Mode')"
          />
          <CCheckbox
            id="reduced-motion"
            v-model="accessibilityForm.reducedMotion"
            :label="t('Reduce Motion')"
          />
          <CCheckbox
            id="large-text"
            v-model="accessibilityForm.largeText"
            :label="t('Large Text')"
          />
          <CButton @click="saveAccessibilitySettings" :loading="loading">
            {{ t('Save Accessibility Settings') }}
          </CButton>
        </div>
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
import CSelect from '@/components/CSelect.vue';
import CCheckbox from '@/components/CCheckbox.vue';
import { useAuthStore } from '@/stores/auth';
import { useAccessibility } from '@/composables/useAccessibility';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const { settings: accessibilitySettings, loadSettings: loadAccessibilitySettings, saveSettings: saveAccessibilitySettingsFromComposable } = useAccessibility();

// Form data
const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  language: 'en',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const notificationForm = reactive({
  emailNotifications: true,
  smsNotifications: false,
  systemNotifications: true,
});

const accessibilityForm = reactive({
  accessibilityMode: false,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
});

// Options
const languageOptions = [
  { value: 'en', name: 'English' },
  { value: 'ru', name: 'Russian' },
  { value: 'kk', name: 'Kazakh' },
];

const localeOptions = [
  { value: 'en', name: 'English' },
  { value: 'ru', name: 'Русский' },
  { value: 'kk', name: 'Қазақша' },
];

// State
const loading = ref(false);

// Computed
const currentLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value;
  }
});

// Methods
const changeLocale = (newLocale: string) => {
  locale.value = newLocale;
  // Save to localStorage for persistence
  localStorage.setItem('locale', newLocale);
};

const loadProfile = async () => {
  try {
    // Load user profile data
    const user = authStore.user;
    if (user) {
      profileForm.name = user.name || '';
      profileForm.email = user.email || '';
      profileForm.phone = user.phone || '';
      profileForm.language = user.language || 'en';
    }
    
    // Load accessibility settings
    loadAccessibilitySettings();
    
    // Initialize accessibility form with loaded settings
    accessibilityForm.accessibilityMode = accessibilitySettings.accessibilityMode;
    accessibilityForm.highContrast = accessibilitySettings.highContrast;
    accessibilityForm.reducedMotion = accessibilitySettings.reducedMotion;
    accessibilityForm.largeText = accessibilitySettings.largeText;
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};

const saveProfile = async () => {
  loading.value = true;
  try {
    // Save profile logic here
    console.log('Saving profile:', profileForm);
  } catch (error) {
    console.error('Failed to save profile:', error);
  } finally {
    loading.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    console.error('Passwords do not match');
    return;
  }

  loading.value = true;
  try {
    // Change password logic here
    console.log('Changing password');
  } catch (error) {
    console.error('Failed to change password:', error);
  } finally {
    loading.value = false;
  }
};

const saveNotificationSettings = async () => {
  loading.value = true;
  try {
    // Save notification settings logic here
    console.log('Saving notification settings:', notificationForm);
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  } finally {
    loading.value = false;
  }
};

const saveAccessibilitySettings = async () => {
  loading.value = true;
  try {
    // Update accessibility settings with form values
    accessibilitySettings.accessibilityMode = accessibilityForm.accessibilityMode;
    accessibilitySettings.highContrast = accessibilityForm.highContrast;
    accessibilitySettings.reducedMotion = accessibilityForm.reducedMotion;
    accessibilitySettings.largeText = accessibilityForm.largeText;
    
    // Save accessibility settings
    saveAccessibilitySettingsFromComposable();
  } catch (error) {
    console.error('Failed to save accessibility settings:', error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadProfile();
});
</script> 