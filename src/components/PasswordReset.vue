<template>
  <CModal v-model="isVisible" :title="t('Password Reset')">
    <div class="space-y-4">
      <p class="text-gray-600">
        {{ t("Enter your email address to receive a password reset link.") }}
      </p>

      <CInput
        id="reset-email"
        v-model="resetEmail"
        type="email"
        :label="t('Email Address')"
        :placeholder="t('Enter your email')"
        required
      />

      <div class="flex justify-end gap-2">
        <CButton @click="closeModal">
          {{ t("Close") }}
        </CButton>
        <CButton variant="primary" @click="sendResetLink" :loading="loading">
          {{ t("Send Reset Link") }}
        </CButton>
      </div>
    </div>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";
import CModal from "./CModal.vue";
import { useAuthStore } from "@/stores/auth";
import CInput from "./CInput.vue";
import CButton from "./CButton.vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const { t } = useI18n();
const { showSuccess, showError } = useToast();
const authStore = useAuthStore();

const resetEmail = ref("");
const loading = ref(false);

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const closeModal = () => {
  isVisible.value = false;
  resetEmail.value = "";
};

const sendResetLink = async () => {
  if (!resetEmail.value) {
    showError(t("Please enter your email address"));
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(resetEmail.value)) {
    showError(t("Please enter a valid email address"));
    return;
  }

  loading.value = true;
  try {
    await authStore.resetPassword(resetEmail.value);
    showSuccess(t("Password reset link sent to your email"));
    closeModal();
  } catch (error: any) {
    console.error("Password reset failed:", error);
    showError(error.response?.data?.message || t("Failed to send password reset link"));
  } finally {
    loading.value = false;
  }
};

// Export for testing
defineExpose({
  resetEmail,
  sendResetLink,
});
</script>
