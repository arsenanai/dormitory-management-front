<template>
  <CModal :show="true" :title="t('Import from IIN Service')" @close="$emit('close')">
    <div class="space-y-4">
      <!-- Step 1: Input Student ID -->
      <div v-if="step === 'input_id'">
        <p class="mb-4 text-sm text-gray-600">
          {{ t("Enter the Student ID to send a verification code.") }}
        </p>
        <CInput
          v-model="localStudentId"
          :label="t('Student ID')"
          placeholder="Enter Student ID"
          required
          :error="error"
        />
      </div>

      <!-- Step 2: Input OTP -->
      <div v-else-if="step === 'input_otp'">
        <p class="mb-4 text-sm text-gray-600">
          {{ t("A verification code has been sent to your registered contact:") }}
          <span class="font-medium">{{ maskedIdentifier }}</span>
        </p>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t("One-Time Password (OTP)") }}</label>
          <div class="flex gap-2 justify-center">
            <input
              v-for="i in 6"
              :key="i"
              :id="`otp-input-${i - 1}`"
              v-model="otpParts[i - 1]"
              type="text"
              maxlength="1"
              class="w-10 h-12 text-center text-xl font-bold border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              @input="handleOtpInput(i - 1)"
              @keydown.backspace="handleOtpBackspace(i - 1)"
            />
          </div>
          <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <CButton variant="secondary" @click="$emit('close')">
          {{ t("Cancel") }}
        </CButton>
        <CButton
          v-if="step === 'input_id'"
          variant="primary"
          :loading="loading"
          @click="sendOtp"
          :disabled="!localStudentId"
        >
          {{ t("Send Code") }}
        </CButton>
        <CButton
          v-else
          variant="primary"
          :loading="loading"
          @click="verifyOtp"
          :disabled="!isOtpComplete"
        >
          {{ t("Verify & Import") }}
        </CButton>
      </div>
    </template>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import CModal from "@/components/CModal.vue";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import { iinService } from "@/services/api";

const props = defineProps<{
  studentId?: string;
}>();

const emit = defineEmits(["close", "data-fetched"]);

const { t } = useI18n();

const step = ref<"input_id" | "input_otp">("input_id");
const localStudentId = ref(props.studentId || "");
const otpParts = ref<string[]>(new Array(6).fill(""));
const maskedIdentifier = ref("");
const loading = ref(false);
const error = ref("");

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
  } finally {
    loading.value = false;
  }
};
</script>
