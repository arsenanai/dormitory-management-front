<template>
  <Navigation :title="t('Account Preferences')">
    <div class="flex flex-col gap-8">
      <!-- Profile Information Section -->
      <section v-if="!isStudent && !isGuest">
        <h2 class="text-primary-700 mb-2 text-lg font-semibold">{{ t("Profile Information") }}</h2>
        <p class="mb-4 text-sm text-gray-600">
          {{
            t(
              "Manage your contact info here. Use the section below to adjust other registration data tied to your role."
            )
          }}
        </p>
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CInput
              id="profile-name"
              v-model="profileForm.first_name"
              :label="t('Firstname')"
              required
            />
            <CInput
              id="profile-lastname"
              v-model="profileForm.last_name"
              :label="t('Lastname')"
              required
            />
            <CInput
              id="profile-email"
              v-model="profileForm.email"
              :label="t('Email')"
              type="email"
              required
            />
            <CSelect
              id="profile-language"
              v-model="profileForm.language"
              :label="t('Preferred Language')"
              :options="languageOptions"
              required
            />
            <div class="flex w-full flex-col items-stretch gap-2">
              <div
                v-for="(phone, index) in profileForm.phone_numbers"
                :key="index"
                class="flex items-center gap-2"
              >
                <CInput
                  :id="`profile-phone-${index}`"
                  v-model="profileForm.phone_numbers[index]"
                  :label="t('Phone Number')"
                  required
                  class="flex-1"
                />
                <div class="flex items-center gap-2">
                  <CButton
                    v-if="profileForm.phone_numbers.length > 1"
                    type="button"
                    @click="removePhone(index)"
                    class="mt-5 py-2.5"
                  >
                    <TrashIcon class="h-5 w-5 text-red-600" />
                  </CButton>
                  <CButton
                    v-if="index === profileForm.phone_numbers.length - 1"
                    type="button"
                    @click="addPhone"
                    class="mt-5 py-2.5"
                  >
                    <PlusIcon class="h-5 w-5" />
                  </CButton>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-6 flex flex-row items-end justify-end gap-2">
            <CButton type="submit" variant="primary" :loading="loading">
              {{ t("Save Profile") }}
            </CButton>
          </div>
        </form>
      </section>

      <!-- Security Settings Section -->
      <section>
        <h2 class="text-primary-700 mb-4 text-lg font-semibold">{{ t("Security Settings") }}</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div class="mt-6 flex flex-row items-end justify-end gap-2">
            <CButton type="submit" variant="primary" :loading="loading">
              {{ t("Change Password") }}
            </CButton>
          </div>
        </form>
      </section>

      <!-- Notification Settings Section -->
      <!-- <section>
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

      <!-- Booking Settings Section -->
      <section v-if="isStudent || isGuest" class="space-y-4">
        <h2 class="text-primary-700 mb-2 text-lg font-semibold">{{ t("Booking Settings") }}</h2>
        <p class="mb-4 text-sm text-gray-600">
          {{
            t(
              "Manage your booking preferences and payment settings here. Changes will affect future payments."
            )
          }}
        </p>

        <!-- Student Booking Settings -->
        <div v-if="isStudent" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CSelect
              id="booking-room-type"
              v-model="bookingForm.roomType"
              :label="t('Preferred Room Type')"
              :options="roomTypeOptions"
            />
            <CSelect
              id="booking-meal-plan"
              v-model="bookingForm.mealPlan"
              :label="t('Meal Plan Preference')"
              :options="mealPlanOptions"
            />
          </div>
          <p class="text-sm text-gray-600">
            {{ t("Note: Room type changes will generate new payments based on current rates.") }}
          </p>
        </div>

        <!-- Guest Booking Settings -->
        <div v-else-if="isGuest" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CInput
              id="booking-checkin"
              v-model="bookingForm.checkInDate"
              type="date"
              :label="t('Preferred Check-in Date')"
            />
            <CInput
              id="booking-checkout"
              v-model="bookingForm.checkOutDate"
              type="date"
              :label="t('Preferred Check-out Date')"
            />
          </div>
          <p class="text-sm text-gray-600">
            {{ t("Note: Booking changes will recalculate payments based on daily rates.") }}
          </p>
        </div>

        <CButton @click="saveBookingSettings" :loading="loading">
          {{ t("Save Booking Settings") }}
        </CButton>
      </section>

      <!-- Accessibility Settings Section -->
      <!-- <section>
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
      </section> -->

      <section v-if="isStudent" class="space-y-4">
        <!-- <h2 class="text-lg font-semibold text-primary-700">{{ t('Other registration data') }}</h2> -->
        <StudentForm
          v-if="selfProfileId"
          :embedded="true"
          :initial-student-id="selfProfileId"
          :show-print="false"
          :submit-label="t('Save Personal Data')"
        />
      </section>

      <section v-else-if="isGuest" class="space-y-4">
        <!-- <h2 class="text-lg font-semibold text-primary-700">{{ t('Other registration data') }}</h2> -->
        <GuestForm
          v-if="selfProfileId"
          :embedded="true"
          :initial-guest-id="selfProfileId"
          :redirect-on-submit="false"
          :submit-label="t('Save Personal Data')"
        />
      </section>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CButton from "@/components/CButton.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import { useAuthStore } from "@/stores/auth";
import { useAccessibility } from "@/composables/useAccessibility";
import { useToast } from "@/composables/useToast";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";
import StudentForm from "@/pages/StudentForm.vue";
import GuestForm from "@/pages/GuestForm.vue";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const {
  settings: accessibilitySettings,
  loadSettings: loadAccessibilitySettings,
  saveSettings: saveAccessibilitySettingsFromComposable,
} = useAccessibility();

// Form data
const profileForm = reactive({
  id: null as number | null,
  name: "",
  first_name: "",
  last_name: "",
  email: "",
  phone_numbers: [""],
  language: "en",
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
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

// Booking settings form data
const bookingForm = reactive({
  roomType: "",
  mealPlan: "",
  checkInDate: "",
  checkOutDate: "",
});

// Options
const languageOptions = [
  { value: "en", name: "English" },
  { value: "ru", name: "Russian" },
  { value: "kk", name: "Kazakh" },
];

const localeOptions = [
  { value: "en", name: "English" },
  { value: "ru", name: "Русский" },
  { value: "kk", name: "Қазақша" },
];

// Booking options
const roomTypeOptions = [
  { value: "standard", name: "Standard" },
  { value: "lux", name: "Luxury" },
];

const mealPlanOptions = [
  { value: "with_meals", name: "With Meals" },
  { value: "without_meals", name: "Without Meals" },
];

// State
const loading = ref(false);
const userRole = computed(() => authStore.userRole);
const isStudent = computed(() => userRole.value === "student");
const isGuest = computed(() => userRole.value === "guest");
const selfProfileId = computed<number | null>(() => {
  if (profileForm.id) return profileForm.id;
  return authStore.user?.id ?? null;
});

// Computed
const currentLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value;
  },
});

// Methods
const changeLocale = (newLocale: string) => {
  locale.value = newLocale;
  // Save to localStorage for persistence
  localStorage.setItem("locale", newLocale);
};

const loadProfile = async () => {
  try {
    // Ensure authStore has the latest profile (will fetch from server if missing)
    try {
      // Always attempt to load latest profile from server
      await authStore.loadProfile();
    } catch (err) {
      // ignore - we'll still try to read whatever is present
    }

    // Load user profile data from the store
    const user = authStore.user;
    if (user) {
      const u = user as any;
      profileForm.id = u.id;
      // prefer explicit first_name/last_name, fall back to splitting `name`
      if (u.first_name || u.last_name) {
        profileForm.first_name = u.first_name || "";
        profileForm.last_name = u.last_name || "";
        profileForm.name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
      } else if (u.name) {
        const parts = (u.name as string).split(" ");
        profileForm.first_name = parts.shift() || "";
        profileForm.last_name = parts.join(" ") || "";
      }
      profileForm.email = u.email || "";

      // Normalize phone_numbers: prefer `phone_numbers` array, then `phone` string, then try JSON parse
      if (Array.isArray(u.phone_numbers) && u.phone_numbers.length) {
        profileForm.phone_numbers = [...u.phone_numbers.map((p: any) => (p ?? "").toString())];
      } else if (u.phone) {
        profileForm.phone_numbers = [u.phone.toString()];
      } else if (typeof u.phone_numbers === "string") {
        const raw = (u.phone_numbers as string).trim();
        if (raw.startsWith("[") && raw.endsWith("]")) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length)
              profileForm.phone_numbers = parsed.map((p: any) => (p ?? "").toString());
          } catch (_) {
            profileForm.phone_numbers = [raw];
          }
        } else if (raw) {
          profileForm.phone_numbers = [raw];
        }
      }
      profileForm.language = u.language || "en";
    }

    // Load accessibility settings
    loadAccessibilitySettings();

    // Initialize accessibility form with loaded settings
    accessibilityForm.accessibilityMode = accessibilitySettings.accessibilityMode;
    accessibilityForm.highContrast = accessibilitySettings.highContrast;
    accessibilityForm.reducedMotion = accessibilitySettings.reducedMotion;
    accessibilityForm.largeText = accessibilitySettings.largeText;
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
};

const saveProfile = async () => {
  loading.value = true;
  try {
    await authStore.updateProfile(profileForm);
    // Also update the i18n locale and save it for persistence
    if (locale.value !== profileForm.language) {
      changeLocale(profileForm.language);
    }
    useToast().showSuccess(t("Profile updated successfully!"));
  } catch (error) {
    useToast().showError(t("Failed to update profile"));
    console.error("Failed to save profile:", error);
  } finally {
    loading.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    useToast().showError(t("Passwords do not match"));
    return;
  }

  loading.value = true;
  try {
    await authStore.changePassword({
      current_password: passwordForm.currentPassword,
      password: passwordForm.newPassword,
      password_confirmation: passwordForm.confirmPassword,
    });

    useToast().showSuccess(t("Password changed successfully"));
    // Clear password fields
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  } catch (err: any) {
    useToast().showError(err.response?.data?.message || t("Failed to change password"));
    console.error("Failed to change password:", err);
  } finally {
    loading.value = false;
  }
};

const saveNotificationSettings = async () => {
  loading.value = true;
  try {
    // Save notification settings logic here
    console.log("Saving notification settings:", notificationForm);
  } catch (error) {
    console.error("Failed to save notification settings:", error);
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
    console.error("Failed to save accessibility settings:", error);
  } finally {
    loading.value = false;
  }
};

// Booking settings methods
const saveBookingSettings = async () => {
  loading.value = true;
  try {
    // For now, just show success message
    // In future, this would call API to update booking preferences
    useToast().showSuccess(t("Booking settings saved successfully!"));

    // TODO: Implement API call to save booking preferences
    // await authStore.updateBookingPreferences(bookingForm);
  } catch (error) {
    useToast().showError(t("Failed to save booking settings"));
    console.error("Failed to save booking settings:", error);
  } finally {
    loading.value = false;
  }
};

// Phone helpers
const addPhone = () => {
  profileForm.phone_numbers.push("");
};

const removePhone = (index: number) => {
  if (profileForm.phone_numbers.length > 1) {
    profileForm.phone_numbers.splice(index, 1);
  }
};

// Lifecycle
onMounted(() => {
  loadProfile();
});
</script>
