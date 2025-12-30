<template>
  <div class="bg-primary-50 flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
      <h2 class="text-primary-700 text-center text-2xl font-bold">{{ t("Set New Password") }}</h2>
      <form
        v-if="!successMessage && !tokenError"
        @submit.prevent="onSubmit"
        class="flex flex-col gap-4"
      >
        <CInput
          id="new-password"
          v-model="password"
          type="password"
          :label="t('New Password')"
          :placeholder="t('Enter your new password')"
          required
          autocomplete="new-password"
          :error="passwordError"
        />
        <CInput
          id="confirm-password"
          v-model="password_confirmation"
          type="password"
          :label="t('Confirm New Password')"
          :placeholder="t('Confirm your new password')"
          required
          autocomplete="new-password"
          :error="passwordConfirmationError"
        />
        <div v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</div>
        <CButton type="submit" variant="primary" :loading="loading">
          {{ t("Reset Password") }}
        </CButton>
      </form>
      <div v-if="successMessage" class="rounded bg-green-50 p-4 text-center text-green-600">
        {{ successMessage }}
        <router-link to="/" class="text-primary-600 mt-4 block hover:underline">{{
          t("Go to Login")
        }}</router-link>
      </div>
      <div v-if="tokenError" class="rounded bg-red-50 p-4 text-center text-red-600">
        {{ tokenError }}
        <router-link to="/password-reset" class="text-primary-600 mt-4 block hover:underline">{{
          t("Request a new link")
        }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authService } from "@/services/api";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const token = ref<string | null>(null);
const email = ref<string | null>(null);
const password = ref("");
const password_confirmation = ref("");

const passwordError = ref("");
const passwordConfirmationError = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const tokenError = ref("");
const loading = ref(false);

onMounted(() => {
  token.value = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token;
  email.value = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email;

  if (!token.value || !email.value) {
    tokenError.value = t("Invalid or expired password reset link.");
  }
});

async function onSubmit() {
  passwordError.value = "";
  passwordConfirmationError.value = "";
  errorMessage.value = "";
  successMessage.value = "";
  loading.value = true;

  if (password.value.length < 6) {
    passwordError.value = t("Password must be at least 6 characters.");
    loading.value = false;
    return;
  }

  if (password.value !== password_confirmation.value) {
    passwordConfirmationError.value = t("Passwords do not match.");
    loading.value = false;
    return;
  }

  try {
    const response = await authService.resetPasswordConfirm({
      token: token.value!,
      email: email.value!,
      password: password.value,
      password_confirmation: password_confirmation.value,
    });
    successMessage.value = response.message || t("Your password has been reset successfully!");
  } catch (e: any) {
    errorMessage.value = e.response?.data?.message || t("An error occurred. Please try again.");
  } finally {
    loading.value = false;
  }
}
</script>
