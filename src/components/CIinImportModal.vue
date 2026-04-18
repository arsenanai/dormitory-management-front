<template>
  <CModal v-model="modalOpen" :title="t('Import from IIN Service')">
    <div class="space-y-4">
      <!-- Step 1: Sending OTP -->
      <div v-if="step === 'input_id'">
        <p v-if="!error" class="mb-4 text-sm text-gray-600">
          {{ t("Sending verification code...") }}
        </p>
        <p v-else class="text-sm text-red-600">{{ error }}</p>
        <details v-if="debugInfo" class="mt-2">
          <summary class="cursor-pointer text-xs text-gray-500">Debug Info</summary>
          <pre class="mt-1 max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs">{{
            JSON.stringify(debugInfo, null, 2)
          }}</pre>
        </details>
      </div>

      <!-- Step 2: Input OTP -->
      <div v-else-if="step === 'input_otp'">
        <p class="mb-4 text-sm text-gray-600">
          {{ t("A verification code has been sent to your registered contact:") }}
          <span class="font-medium">{{ maskedIdentifier }}</span>
        </p>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t("One-Time Password (OTP)") }}</label>
          <div class="flex justify-center gap-2">
            <input
              v-for="i in 6"
              :key="i"
              :id="`otp-input-${i - 1}`"
              v-model="otpParts[i - 1]"
              type="text"
              maxlength="1"
              class="focus:ring-primary-500 focus:border-primary-500 h-12 w-10 rounded-md border text-center text-xl font-bold outline-none focus:ring-2"
              @input="handleOtpInput(i - 1)"
              @keydown.backspace="handleOtpBackspace(i - 1)"
              @keydown.enter="handleEnterKey"
              @paste.prevent="handlePaste"
            />
          </div>
          <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 pt-2">
        <CButton @click="close">
          {{ t("Cancel") }}
        </CButton>
        <CButton
          v-if="step === 'input_id' && error"
          variant="primary"
          :loading="loading"
          @click="sendOtp"
        >
          {{ t("Retry") }}
        </CButton>
        <CButton
          v-if="step === 'input_otp'"
          variant="primary"
          :loading="loading"
          @click="verifyOtp"
          :disabled="!isOtpComplete"
        >
          {{ t("Verify & Import") }}
        </CButton>
      </div>
    </div>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import CModal from "@/components/CModal.vue";
import CButton from "@/components/CButton.vue";
import { iinService } from "@/services/api";

const props = defineProps<{
  studentId: string;
}>();

const emit = defineEmits(["close", "data-fetched"]);

const { t } = useI18n();

const modalOpen = ref(true);

const close = () => {
  modalOpen.value = false;
  emit("close");
};

watch(modalOpen, (val) => {
  if (!val) emit("close");
});

const step = ref<"input_id" | "input_otp">("input_id");
const localStudentId = ref(props.studentId);

onMounted(() => {
  sendOtp();
});
const otpParts = ref<string[]>(new Array(6).fill(""));
const maskedIdentifier = ref("");
const loading = ref(false);
const error = ref("");
const debugInfo = ref<unknown>(null);

const isOtpComplete = computed(() => {
  return otpParts.value.every((p) => p.length === 1);
});

const handleOtpInput = (index: number) => {
  if (otpParts.value[index] && index < 5) {
    const nextInput = document.getElementById(`otp-input-${index + 1}`);
    nextInput?.focus();
  }
};

const handleOtpBackspace = (index: number) => {
  if (!otpParts.value[index] && index > 0) {
    const prevInput = document.getElementById(`otp-input-${index - 1}`);
    prevInput?.focus();
  }
};

const handleEnterKey = () => {
  if (isOtpComplete.value) {
    verifyOtp();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  const pastedData = event.clipboardData?.getData("text") || "";

  // Take only first 6 characters and ignore the rest
  const otpDigits = pastedData.trim().slice(0, 6).split("");

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

const sendOtp = async () => {
  if (!localStudentId.value) return;

  loading.value = true;
  error.value = "";

  try {
    const response = await iinService.sendOtp(localStudentId.value);
    maskedIdentifier.value = response.data.identifier || "your contact";
    step.value = "input_otp";
    nextTick(() => {
      document.getElementById("otp-input-0")?.focus();
    });
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data?.message || t("Failed to send OTP.");
    debugInfo.value = err.response?.data?.debug || null;
  } finally {
    loading.value = false;
  }
};

const verifyOtp = async () => {
  const otp = otpParts.value.join("");
  if (otp.length !== 6) return;

  loading.value = true;
  error.value = "";

  try {
    const response = await iinService.verifyOtp(localStudentId.value, otp);
    emit("data-fetched", response.data);
    emit("close");
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data?.message || t("Verification failed.");
    debugInfo.value = err.response?.data?.debug || null;
  } finally {
    loading.value = false;
  }
};
</script>
