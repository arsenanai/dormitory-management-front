<template>
  <div class="bg-primary-50 flex h-full items-stretch justify-center py-2 lg:items-center lg:p-4">
    <div class="flex w-full flex-col items-center">
      <div
        v-if="successMessage"
        class="mx-auto mb-4 w-full max-w-md rounded bg-green-100 p-3 text-green-800"
        data-testid="success-message"
      >
        {{ successMessage }}
      </div>
      <div class="w-full max-w-md">
        <div class="mb-4 flex w-full justify-end">
          <CSelect
            id="language-switcher"
            v-model="selectedLanguage"
            :options="languageOptions"
            :label="t('Language')"
            class="w-40"
          />
        </div>
        <div class="rounded-lg bg-white shadow-lg">
          <CTabs v-model="activeTab">
            <!-- Login Tab -->
            <CTab name="login" :title="t('Login')">
              <LoginTab :email-placeholder="emailPlaceholder" />
            </CTab>

            <!-- Registration Tab -->
            <CTab name="registration" :title="t('New Student')" data-testid="registration-tab">
              <RegistrationTab
                :email-placeholder="emailPlaceholder"
                :ui-locale="selectedLanguage"
                @registered="onRegistered"
                @added-to-reserve-list="onAddedToReserveList"
                @registration-closed="onRegistrationClosed"
              />
            </CTab>

            <CTab name="guests" :title="t('New Guest')">
              <GuestTab :ui-locale="selectedLanguage" @registered="onRegistered" />
            </CTab>
          </CTabs>
        </div>
      </div>
      <div v-if="registrationClosed" class="mb-4 rounded bg-red-100 p-3 text-red-800">
        {{ t("Registration is closed. Student limit reached.") }}
      </div>
      <div v-if="reserveListMessage" class="mb-4 rounded bg-yellow-100 p-3 text-yellow-800">
        {{ reserveListMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed, watch } from "vue";
import { useToast } from "@/composables/useToast";
import i18n from "@/i18n";
import CSelect from "@/components/CSelect.vue";
import CTabs from "@/components/CTabs.vue";
import CTab from "@/components/CTab.vue";
import LoginTab from "@/pages/LoginTab.vue";
import RegistrationTab from "@/pages/RegistrationTab.vue";
import GuestTab from "@/pages/GuestTab.vue";

const { t } = useI18n();
const { showError } = useToast();

const registrationClosed = ref(false);
const reserveListMessage = ref("");
const successMessage = ref("");
const activeTab = ref("login");

const selectedLanguage = ref("en");
const languageOptions = [
  { value: "en", name: "English" },
  { value: "kk", name: "Қазақша" },
  { value: "ru", name: "Русский" },
];

const onRegistered = (message: string) => {
  successMessage.value = message;
  activeTab.value = "login";
};

const onAddedToReserveList = (message: string) => {
  reserveListMessage.value = message;
  activeTab.value = "login";
};

const onRegistrationClosed = () => {
  registrationClosed.value = true;
  showError(t("Registration is closed. Student limit reached."));
};

// Computed email placeholder based on selected language
const emailPlaceholder = computed(() => {
  switch (selectedLanguage.value) {
    case "kk":
      return "мысалы: user@mysdu.kz";
    case "ru":
      return "например: user@mysdu.kz";
    default:
      return "example@domain.com";
  }
});

// Watch for language change and update i18n locale
watch(selectedLanguage, (newLocale) => {
  i18n.global.locale.value = newLocale;
});
</script>
