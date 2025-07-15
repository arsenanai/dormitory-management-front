<template>
  <div v-if="!showResetForm" class="text-center">
    <button 
      @click="showResetForm = true"
      class="text-sm text-blue-600 hover:text-blue-500 underline"
    >
      {{ t("Forgot your password?") }}
    </button>
  </div>

  <div v-else class="space-y-4">
    <div v-if="!resetLinkSent">
      <h3 class="text-lg font-semibold mb-4">{{ t("Reset Password") }}</h3>
      <CInput
        id="reset-email"
        v-model="resetEmail"
        type="email"
        :label="t('Email Address')"
        placeholder="Enter your email"
        required
      />
      <div class="flex gap-2 mt-4">
        <CButton 
          type="button" 
          variant="primary" 
          @click="sendResetLink"
          :disabled="loading"
        >
          {{ loading ? t("Sending...") : t("Send Reset Link") }}
        </CButton>
        <CButton 
          type="button" 
          variant="secondary" 
          @click="cancelReset"
        >
          {{ t("Cancel") }}
        </CButton>
      </div>
    </div>

    <div v-else class="text-center">
      <p class="text-green-600 mb-4">{{ t("Reset link sent! Check your email.") }}</p>
      <button 
        @click="resetLinkSent = false"
        class="text-sm text-blue-600 hover:text-blue-500 underline"
      >
        {{ t("Try again") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import { authService } from "@/services/api";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const { showError, showSuccess } = useToast();

const showResetForm = ref(false);
const resetLinkSent = ref(false);
const resetEmail = ref("");
const loading = ref(false);

const sendResetLink = async () => {
  if (!resetEmail.value) {
    showError(t("Email is required"));
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(resetEmail.value)) {
    showError(t("Please enter a valid email address"));
    return;
  }

  loading.value = true;
  try {
    const response = await authService.sendPasswordResetLink(resetEmail.value);
    showSuccess(response.data.message);
    resetLinkSent.value = true;
    
    // In development, also show the debug token
    if (response.data.debug_token) {
      console.log("Debug reset token:", response.data.debug_token);
    }
  } catch (error: any) {
    showError(error.response?.data?.message || t("Failed to send reset link"));
  } finally {
    loading.value = false;
  }
};

const cancelReset = () => {
  showResetForm.value = false;
  resetEmail.value = "";
  resetLinkSent.value = false;
};
</script>
