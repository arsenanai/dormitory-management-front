<template>
  <CModal
    :model-value="isVisible"
    @update:model-value="closeModal"
    :title="t('Transaction Details')"
  >
    <div v-if="transaction" class="space-y-6">
      <!-- Transaction Information -->
      <div class="rounded-lg bg-gray-50 p-4">
        <h3 class="mb-4 text-lg font-medium">{{ t("Transaction Information") }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("Transaction ID") }}</label>
            <p class="text-gray-900">#{{ transaction.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("User") }}</label>
            <p class="text-gray-900">{{ transaction.user?.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("Amount") }}</label>
            <p class="font-bold text-gray-900">{{ formatCurrency(transaction.amount) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("Payment Method") }}</label>
            <p class="text-gray-900">{{ t(transaction.paymentMethod) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("Status") }}</label>
            <span
              :class="getStatusClass(transaction.status)"
              class="rounded-full px-2 py-1 text-xs font-medium"
            >
              {{ t(transaction.status) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("Created At") }}</label>
            <p class="text-gray-900">{{ formatDate(transaction.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Bank Check -->
      <div v-if="transaction.paymentCheck" class="rounded-lg bg-gray-50 p-4">
        <h3 class="mb-4 text-lg font-medium">{{ t("Bank Check") }}</h3>
        <div class="space-y-3">
          <img
            v-if="isImageFile(transaction.paymentCheck)"
            :src="`/storage/${transaction.paymentCheck}`"
            :alt="t('Bank Check')"
            class="max-h-64 w-full rounded-lg border bg-white object-contain"
          />
          <div v-else class="flex items-center gap-3 text-gray-500">
            <DocumentIcon class="h-10 w-10 shrink-0" />
            <p class="text-sm break-all">{{ getFileName(transaction.paymentCheck) }}</p>
          </div>
          <div>
            <CButton size="sm" @click="downloadCheck(transaction.paymentCheck)">
              <ArrowDownTrayIcon class="mr-1 h-4 w-4" />
              {{ t("Download") }}
            </CButton>
          </div>
        </div>
      </div>

      <!-- Covered Payments -->
      <div
        v-if="transaction.payments && transaction.payments.length > 0"
        class="rounded-lg bg-gray-50 p-4"
      >
        <h3 class="mb-4 text-lg font-medium">{{ t("Covered Payments") }}</h3>
        <div class="space-y-3">
          <div
            v-for="payment in transaction.payments"
            :key="payment.id"
            class="flex items-center justify-between rounded-lg border bg-white p-3"
          >
            <div>
              <div class="font-medium">
                {{ payment.type?.name || t("Payment") }} #{{ payment.id }}
              </div>
              <div class="text-sm text-gray-600">{{ t("User") }}: {{ payment.user?.name }}</div>
              <div class="text-sm text-gray-500">
                {{ t("Payment Amount") }}: {{ formatCurrency(payment.amount) }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-green-600">
                {{ t("Allocated") }}: {{ formatCurrency(payment.pivotAmount) }}
              </div>
              <div class="text-sm text-gray-500">{{ t("Status") }}: {{ t(payment.status) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gateway Information (if available) -->
      <div v-if="transaction.gatewayTransactionId" class="rounded-lg bg-gray-50 p-4">
        <h3 class="mb-4 text-lg font-medium">{{ t("Gateway Information") }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">{{
              t("Gateway Transaction ID")
            }}</label>
            <p class="font-mono text-sm text-gray-900">{{ transaction.gatewayTransactionId }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">
      <CButton @click="closeModal">
        {{ t("Close") }}
      </CButton>
    </div>
  </CModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import CModal from "@/components/CModal.vue";
import CButton from "@/components/CButton.vue";
import { ArrowDownTrayIcon, DocumentIcon } from "@heroicons/vue/24/outline";
import type { Transaction } from "@/models/Transaction";

interface Props {
  transaction?: Transaction | null;
}

interface Emits {
  (e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

const isVisible = computed(() => !!props.transaction);

// Methods
const closeModal = () => {
  emit("close");
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KZT",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getStatusClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    refunded: "bg-purple-100 text-purple-800",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

const isImageFile = (filename: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return imageExtensions.includes(extension);
};

const getFileName = (path: string) => {
  return path.substring(path.lastIndexOf("/") + 1);
};

const downloadCheck = async (checkPath: string) => {
  try {
    const response = await fetch(`/storage/${checkPath}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getFileName(checkPath);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download file:", error);
  }
};
</script>
