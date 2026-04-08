<template>
  <CModal
    :model-value="isVisible"
    @update:model-value="closeModal"
    :title="transaction ? t('Update Transaction') : t('Create Transaction')"
  >
    <form @submit.prevent="handleFormSubmit">
      <div class="space-y-4">
        <!-- User Selection (admin-only) -->
        <CUserAutocomplete
          v-if="isAdmin"
          id="user-select"
          :model-value="formData.user_id || null"
          @update:model-value="formData.user_id = $event ?? ''"
          :label="t('User')"
          :initial-label="transaction?.user?.name"
          required
        />

        <!-- Amount -->
        <CInput
          v-model="formData.amount"
          data-testid="transaction-amount-input"
          :label="`${t('Amount')} (${currencySymbol})`"
          type="number"
          step="0.01"
          min="0.01"
          required
        />

        <!-- Payment Method -->
        <CSelect
          id="payment-method-select"
          v-model="formData.payment_method"
          :label="t('Payment Method')"
          :options="paymentMethodOptions"
          required
        />

        <!-- Payment Check Upload -->
        <CFileInput
          v-if="formData.payment_method === 'bank_check'"
          id="payment-check-input"
          v-model="formData.payment_check"
          :label="t('Bank Check')"
          accept="image/*,.pdf"
          :required="!transaction && !existingPaymentCheck"
          :file-path="existingPaymentCheck"
          :help-text="transaction ? t('Leave empty to keep current check') : t('Upload bank check image or PDF')"
        />

        <!-- Status (admin-only) -->
        <CSelect
          v-if="isAdmin"
          id="status-select"
          v-model="formData.status"
          :label="t('Status')"
          :options="statusOptions"
          :placeholder="formData.status || t('Select Status')"
        />

        <!-- Payment Selection -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium mb-3">{{ transaction ? t('Covered Payments') : t('Select Payments to Cover') }}</h3>

          <!-- No user selected -->
          <div v-if="!formData.user_id" class="text-gray-400 text-sm text-center py-4">
            {{ t('Select a user to see their payments') }}
          </div>

          <!-- Loading -->
          <div v-else-if="loadingPayments" class="text-gray-400 text-sm text-center py-4">
            {{ t('Loading payments...') }}
          </div>

          <!-- Payment list -->
          <div v-else-if="availablePayments.length > 0" class="space-y-2">
            <div
              v-for="payment in availablePayments"
              :key="payment.id"
              class="flex items-center gap-3 p-3 border rounded-lg"
              :class="selectedPaymentIds.includes(payment.id) ? 'border-primary-400 bg-primary-50' : 'border-gray-200'"
            >
              <CCheckbox
                :id="`payment-${payment.id}`"
                v-model="selectedPaymentIds"
                :value="payment.id"
              />

              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm">{{ payment.type?.name || t('Payment') }} #{{ payment.id }}</div>
                <div class="text-xs text-gray-600">
                  {{ t('Due') }}: {{ formatCurrency(payment.amount, currencySymbol) }}
                  <span v-if="payment.paid_amount && payment.paid_amount > 0" class="text-green-600 ml-1">
                    &bull; {{ t('Paid') }}: {{ formatCurrency(payment.paid_amount, currencySymbol) }}
                  </span>
                </div>
                <div class="text-xs text-gray-400">
                  {{ t('Remaining') }}: {{ formatCurrency(payment.amount - (payment.paid_amount || 0) - (selectedPaymentIds.includes(payment.id) ? Number(paymentAllocations[payment.id]) || 0 : 0), currencySymbol) }}
                </div>
              </div>

              <!-- Amount allocation -->
              <div class="w-28 shrink-0">
                <CInput
                  v-if="selectedPaymentIds.includes(payment.id)"
                  v-model="paymentAllocations[payment.id]"
                  type="number"
                  step="0.01"
                  min="0.01"
                  :max="payment.amount - (payment.paid_amount || 0)"
                  :placeholder="t('Amount')"
                  size="sm"
                  :readonly="selectedPaymentIds.length === 1"
                />
              </div>
            </div>
          </div>

          <!-- No payments found -->
          <div v-else class="text-gray-400 text-sm text-center py-4">
            {{ t('No pending payments found for this user') }}
          </div>
        </div>

        <!-- Total Allocation Summary -->
        <div v-if="selectedPaymentIds.length > 0" class="border-t pt-4">
          <div class="flex justify-between items-center">
            <span class="font-medium">{{ t('Total Allocated') }}:</span>
            <span class="font-bold text-lg">{{ formatCurrency(totalAllocated, currencySymbol) }}</span>
          </div>
          <div v-if="Math.abs(totalAllocated - Number(formData.amount)) >= 0.01" class="text-red-600 text-sm mt-2">
            {{ t('Total allocated must equal transaction amount') }}
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 mt-6">
        <CButton
          type="button"
          @click="closeModal"
          :disabled="saving"
        >
          {{ t("Cancel") }}
        </CButton>
        <CButton
          type="submit"
          variant="primary"
          :disabled="saving || !isFormValid"
          :loading="saving"
        >
          {{ transaction ? t("Update") : t("Create") }}
        </CButton>
      </div>
    </form>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import CModal from "@/components/CModal.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CFileInput from "@/components/CFileInput.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import CButton from "@/components/CButton.vue";
import CUserAutocomplete from "@/components/CUserAutocomplete.vue";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useToast } from "@/composables/useToast";
import { transactionService, paymentService } from "@/services/api";
import { formatCurrency } from "@/utils/formatters";
import type { Transaction } from "@/models/Transaction";
import type { Payment } from "@/models/Payment";

interface Props {
  transaction?: Transaction | null;
  payments?: Payment[];
  preselectedPayment?: { id: number; amount: number } | null;
}

interface Emits {
  (e: "close"): void;
  (e: "saved"): void;
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
  payments: () => [],
  preselectedPayment: null,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const { showError } = useToast();

const currencySymbol = computed(() => settingsStore.publicSettings?.currency_symbol || "USD");

// Form data
const formData = ref({
  user_id: props.transaction?.userId || authStore.user?.id || "",
  amount: props.transaction?.amount || 0,
  payment_method: props.transaction?.paymentMethod || "bank_check",
  payment_check: null as File | null,
  status: props.transaction?.status || "pending",
});

// Payment selection
const selectedPaymentIds = ref<number[]>([]);
const paymentAllocations = ref<Record<number, number>>({});

// State
const saving = ref(false);
const loadingPayments = ref(false);
const availablePayments = ref<Payment[]>([]);
const existingPaymentCheck = ref<string | null>(null);

// Computed properties
const isVisible = computed(() => true);

const isAdmin = computed(() => authStore.user?.role?.name === "admin" || authStore.user?.role?.name === "sudo");

const paymentMethodOptions = computed(() => [
  { value: "bank_check", name: t("Bank Check") },
]);

const statusOptions = computed(() => [
  { value: "pending", name: t("Pending") },
  { value: "processing", name: t("Processing") },
  { value: "completed", name: t("Completed") },
  { value: "failed", name: t("Failed") },
  { value: "cancelled", name: t("Cancelled") },
  { value: "refunded", name: t("Refunded") },
]);

const totalAllocated = computed(() => {
  return selectedPaymentIds.value.reduce((total, paymentId) => {
    return total + (Number(paymentAllocations.value[paymentId]) || 0);
  }, 0);
});

const isFormValid = computed(() => {
  if (!formData.value.user_id || !formData.value.amount || !formData.value.payment_method) {
    return false;
  }
  
  if (formData.value.payment_method === "bank_check" && !props.transaction && !formData.value.payment_check) {
    return false;
  }
  
  if (selectedPaymentIds.value.length === 0) {
    return false;
  }
  
  return Math.abs(totalAllocated.value - Number(formData.value.amount)) < 0.01;
});

// Methods
const closeModal = () => {
  emit("close");
};

const initializeForm = () => {
  if (props.transaction) {
    existingPaymentCheck.value = props.transaction.paymentCheck ?? null;
    formData.value = {
      user_id: props.transaction.userId,
      amount: props.transaction.amount,
      payment_method: props.transaction.paymentMethod,
      payment_check: null,
      status: props.transaction.status,
    };
    
    // Initialize payment selections from transaction
    if (props.transaction.payments) {
      selectedPaymentIds.value = props.transaction.payments.map((p: { id: number; amount: number; pivotAmount: number }) => p.id);
      paymentAllocations.value = {};
      props.transaction.payments.forEach((p: { id: number; amount: number; pivotAmount: number }) => {
        paymentAllocations.value[p.id] = p.pivotAmount;
      });
    }
  } else {
    existingPaymentCheck.value = null;
    formData.value = {
      user_id: authStore.user?.id || "",
      amount: props.preselectedPayment?.amount || 0,
      payment_method: "bank_check",
      payment_check: null,
      status: "pending",
    };
    selectedPaymentIds.value = [];
    paymentAllocations.value = {};
    
    // Handle preselected payment
    if (props.preselectedPayment) {
      selectedPaymentIds.value = [props.preselectedPayment.id];
      paymentAllocations.value[props.preselectedPayment.id] = props.preselectedPayment.amount;
    }
  }
};

const fetchPaymentsForUser = async (userId: string | number, includePaymentIds: number[] = []) => {
  if (!userId) {
    availablePayments.value = [];
    return;
  }
  loadingPayments.value = true;
  try {
    const response = isAdmin.value
      ? await paymentService.getAll({ user_id: userId, status: 'pending', per_page: 100 })
      : await paymentService.getMyPayments({ status: 'pending', per_page: 100 });
    const pending: Payment[] = response.data?.data || [];
    const pendingIds = pending.map((p: Payment) => p.id);
    const extraIds = includePaymentIds.filter(id => !pendingIds.includes(id));
    if (extraIds.length > 0) {
      const extras = await Promise.all(extraIds.map(id => paymentService.getById(id)));
      const extraPayments = extras.map((r: { data: { data?: Payment } | Payment }) => (r.data as any)?.data ?? r.data).filter(Boolean);
      availablePayments.value = [...pending, ...extraPayments];
    } else {
      availablePayments.value = pending;
    }
  } catch (err) {
    console.error('Failed to fetch payments for user:', err);
    availablePayments.value = [];
  } finally {
    loadingPayments.value = false;
  }
};

const handleFormSubmit = async () => {
  if (!isFormValid.value) return;

  saving.value = true;

  try {
    const submitData = new FormData();
    
    // Add basic fields
    submitData.append("user_id", formData.value.user_id.toString());
    submitData.append("amount", formData.value.amount.toString());
    submitData.append("payment_method", formData.value.payment_method);
    submitData.append("status", formData.value.status);
    
    // Add payment check if provided
    if (formData.value.payment_check) {
      submitData.append("payment_check", formData.value.payment_check);
    }
    
    // Add payment IDs and amounts as proper FormData arrays
    selectedPaymentIds.value.forEach((id, index) => {
      submitData.append(`payment_ids[${index}]`, id.toString());
      submitData.append(`amounts[${index}]`, (paymentAllocations.value[id] || 0).toString());
    });

    if (props.transaction) {
      submitData.append("_method", "PUT");
      await transactionService.update(props.transaction.id, submitData);
    } else if (isAdmin.value) {
      await transactionService.create(submitData);
    } else {
      await transactionService.createMyTransaction(submitData);
    }

    emit("saved");
  } catch (error: any) {
    showError(error.response?.data?.message || t("Failed to save transaction"));
  } finally {
    saving.value = false;
  }
};


// Watch for changes in payment selection
watch(selectedPaymentIds, (newIds) => {
  // Initialize allocations for newly selected payments
  newIds.forEach(id => {
    if (!(id in paymentAllocations.value)) {
      const payment = availablePayments.value.find((p: Payment) => p.id === id);
      if (payment) {
        const remainingAmount = payment.amount - (payment.paid_amount || 0);
        paymentAllocations.value[id] = Math.min(remainingAmount, Number(formData.value.amount));
      }
    }
  });
  
  // Remove allocations for deselected payments
  Object.keys(paymentAllocations.value).forEach(id => {
    if (!newIds.includes(Number(id))) {
      delete paymentAllocations.value[Number(id)];
    }
  });
}, { deep: true });

// Watch for amount changes to auto-adjust allocations
watch(() => formData.value.amount, (newAmount) => {
  if (selectedPaymentIds.value.length === 1) {
    const paymentId = selectedPaymentIds.value[0];
    const payment = availablePayments.value.find((p: Payment) => p.id === paymentId);
    if (payment) {
      const remainingAmount = payment.amount - (payment.paid_amount || 0);
      paymentAllocations.value[paymentId] = Math.min(remainingAmount, newAmount);
    }
  }
});

// Watch user_id — reload payments and reset selection when user changes
watch(() => formData.value.user_id, (newUserId, oldUserId) => {
  if (newUserId === oldUserId) return;
  if (!props.transaction) {
    selectedPaymentIds.value = [];
    paymentAllocations.value = {};
  }
  fetchPaymentsForUser(newUserId);
});

// Lifecycle
onMounted(() => {
  initializeForm();
  const linkedIds = props.transaction?.payments?.map((p: { id: number; amount: number; pivotAmount: number }) => p.id) ?? [];
  fetchPaymentsForUser(formData.value.user_id, linkedIds);
});

// Watch for props changes
watch(() => props.transaction, initializeForm);
</script>
