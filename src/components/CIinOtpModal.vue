<template>
  <CModal :show="show" :title="t('Verify IIN')" @close="$emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        {{ t("A verification code has been sent to your registered contact:") }}
        <span class="font-medium">{{ identifier }}</span>
      </p>

      <div class="space-y-2">
        <label class="text-sm font-medium">{{ t("One-Time Password (OTP)") }}</label>
        <div class="flex gap-2">
          <input
            v-for="i in 6"
            :key="i"
            :id="`otp-input-${i - 1}`"
            v-model="otpParts[i - 1]"
            type="text"
            maxlength="1"
            class="w-10 h-12 text-center text-xl font-bold border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            @input="handleInput(i - 1)"
            @keydown.backspace="handleBackspace(i - 1)"
            @keydown.enter="handleEnterKey"
            @paste.prevent="handlePaste"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <CButton variant="secondary" @click="$emit('close')">
          {{ t("Cancel") }}
        </CButton>
        <CButton variant="primary" :loading="loading" :disabled="!isOtpComplete" @click="verifyOtp">
          {{ t("Verify") }}
        </CButton>
      </div>
    </div>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import CModal from "@/components/CModal.vue";
import CButton from "@/components/CButton.vue";
import { iinService } from "@/services/api";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  show: boolean;
  studentId: string;
  identifier?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "verified", data: any): void;
}>();

const { t } = useI18n();
const { showError, showSuccess } = useToast();

const otpParts = ref<string[]>(new Array(6).fill(""));
const loading = ref(false);

const isOtpComplete = computed(() => {
  return otpParts.value.every((p) => p.length === 1);
});

const handleInput = (index: number) => {
  if (otpParts.value[index] && index < 5) {
    const nextInput = document.getElementById(`otp-input-${index + 1}`);
    nextInput?.focus();
  }
};

const handleBackspace = (index: number) => {
  if (!otpParts.value[index] && index > 0) {
    const prevInput = document.getElementById(`otp-input-${index - 1}`);
    prevInput?.focus();
  }
};

const handleEnterKey = (event: KeyboardEvent) => {
  if (isOtpComplete.value) {
    verifyOtp();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  const pastedData = event.clipboardData?.getData('text') || '';
  
  // Take only first 6 characters and ignore the rest
  const otpDigits = pastedData.slice(0, 6).split('');
  
  // Fill the otp parts array
  otpDigits.forEach((digit, i) => {
    if (i < 6) {
      otpParts.value[i] = digit;
    }
  });
  
  // Focus the last filled input or the next empty one
  const lastFilledIndex = Math.min(otpDigits.length - 1, 5);
  setTimeout(() => {
    document.getElementById(`otp-input-${lastFilledIndex}`)?.focus();
  }, 10);
};

const verifyOtp = async () => {
  const otp = otpParts.value.join("");
  loading.value = true;
  try {
    const response = await iinService.verifyOtp(props.studentId, otp);
    showSuccess(t("IIN verified successfully"));
    emit("verified", response.data);
  } catch (error: any) {
    showError(error.response?.data?.message || t("Invalid OTP"));
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      otpParts.value = new Array(6).fill("");
      setTimeout(() => {
        document.getElementById("otp-input-0")?.focus();
      }, 100);
    }
  }
);
</script>
