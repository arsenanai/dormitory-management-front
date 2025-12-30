<template>
  <form class="flex flex-col gap-2" @submit.prevent="handleLogin" novalidate>
    <div>
      <CInput
        id="login-email"
        v-model="credentials.email"
        type="email"
        :label="t('Email')"
        :placeholder="emailPlaceholder"
        required
        autocomplete="email"
        :validationState="credentialsValidationState.email"
        validationstate-attr="validationstate"
        :validationMessage="credentialsValidationMessage.email"
        data-testid="email-input"
      />
    </div>

    <div>
      <CInput
        id="login-password"
        v-model="credentials.password"
        type="password"
        :label="t('Password')"
        required
        autocomplete="password"
        :validationState="credentialsValidationState.password"
        validationstate-attr="validationstate"
        :validationMessage="credentialsValidationMessage.password"
        pattern=".{6,}"
        data-testid="password-input"
      />
    </div>

    <CButton type="submit" class="mt-4 w-full" variant="primary" data-testid="login-button">
      {{ t("Login") }}
    </CButton>
  </form>
  <div class="mt-2 flex justify-end">
    <a
      class="text-primary-600 hover:text-primary-800 focus-visible:ring-primary-300 cursor-pointer rounded text-xs outline-none hover:underline focus-visible:ring-2"
      data-testid="forgot-password"
      @click="showPasswordReset = true"
      tabindex="0"
      role="button"
      @keydown.enter="showPasswordReset = true"
      @keydown.space.prevent="showPasswordReset = true"
    >
      {{ t("Forgot password") }}
    </a>
  </div>
  <Teleport to="body">
    <PasswordReset v-if="showPasswordReset" v-model="showPasswordReset" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import PasswordReset from "@/components/PasswordReset.vue";

defineProps<{
  emailPlaceholder: string;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

const credentials = ref({ email: "", password: "" });
const credentialsValidationState = ref<{
  email: "" | "error" | "success";
  password: "" | "error" | "success";
}>({ email: "", password: "" });
const credentialsValidationMessage = ref({ email: "", password: "" });
const showPasswordReset = ref(false);

const handleLogin = async () => {
  credentialsValidationState.value = { email: "", password: "" };
  credentialsValidationMessage.value = { email: "", password: "" };

  const emailPattern = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let hasError = false;

  if (!credentials.value.email) {
    credentialsValidationState.value.email = "error";
    credentialsValidationMessage.value.email = t("Email is required.");
    hasError = true;
  } else if (!emailPattern.test(credentials.value.email)) {
    credentialsValidationState.value.email = "error";
    credentialsValidationMessage.value.email = t("Invalid email format.");
    hasError = true;
  }

  if (!credentials.value.password) {
    credentialsValidationState.value.password = "error";
    credentialsValidationMessage.value.password = t("Password is required.");
    hasError = true;
  }

  if (hasError) return;

  try {
    await authStore.login(credentials.value);
    showSuccess(t("Login successful"));
  } catch (error: any) {
    // possible messages
    // t('auth.invalid_credentials')
    // t('auth.not_approved')
    // t('auth.not_assigned_admin')
    showError(
      t("Login failed") + ": " + t(error.response?.data?.message || "auth.invalid_credentials")
    );
  }
};
</script>
