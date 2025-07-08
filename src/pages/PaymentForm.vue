<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/PaymentForm.vue -->
<template>
  <Navigation :title="t('Payment Form')">
    <div v-if="loading" class="loading-text">Loading...</div>
    <div v-if="error" class="error-text">{{ error }}</div>
    
    <form @submit.prevent="submitForm" v-if="!loading">
      <h1>Payment Form</h1>
      
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- User Selection -->
        <div>
          <CSelect
            id="user"
            v-model="form.user_id"
            :options="userOptions"
            :label="t('User')"
            required
          />
        </div>
        
        <!-- Amount -->
        <div>
          <CInput
            id="amount"
            v-model="form.amount"
            type="number"
            :label="t('Amount')"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <!-- Payment Details -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
        <div>
          <CInput
            id="payment-date"
            v-model="form.payment_date"
            type="date"
            :label="t('Payment Date')"
            required
          />
        </div>
        <div>
          <CSelect
            id="payment-type"
            v-model="form.payment_type"
            :options="paymentTypeSelectOptions"
            :label="t('Payment Type')"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
        <div>
          <CSelect
            id="status"
            v-model="form.status"
            :options="statusOptions"
            :label="t('Status')"
            required
          />
        </div>
      </div>

      <!-- Description -->
      <div class="mt-4">
        <CInput
          id="description"
          v-model="form.description"
          type="textarea"
          :label="t('Description')"
          placeholder="Payment description..."
        />
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-end gap-2">
        <CButton type="button" variant="secondary" @click="cancel" class="w-full lg:w-auto">
          {{ t("Cancel") }}
        </CButton>
        <CButton type="submit" variant="primary" :disabled="loading" class="w-full lg:w-auto">
          {{ loading ? t("Submitting...") : t("Submit") }}
        </CButton>
      </div>
    </form>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { usePaymentsStore } from "@/stores/payments";
import { useToast } from "@/composables/useToast";
import { paymentService, userService } from "@/services/api";

// Helper function to create mock AxiosResponse
function createMockAxiosResponse<T>(data: T) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    request: {}
  };
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const paymentStore = usePaymentsStore();
const { showError, showSuccess } = useToast();

// Reactive state
const loading = ref(false);
const error = ref('');
const users = ref<any[]>([]);
const errors = ref<Record<string, string>>({});
const hasUnsavedChanges = ref(false);

// Check if we're editing (ID in route params)
const paymentId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!paymentId.value);

const form = ref({
  user_id: null as number | null,
  amount: null as number | null,
  payment_type: '',
  payment_date: '',
  status: '',
  description: ''
});

// Status options
const statusOptions = [
  { value: "pending", name: "Pending" },
  { value: "completed", name: "Completed" },
  { value: "failed", name: "Failed" },
];

// User options computed from users array
const userOptions = computed(() => 
  users.value.map(user => ({
    value: user.id,
    name: user.name
  }))
);

// Selected user computed property
const selectedUser = computed(() => 
  users.value.find(user => user.id === form.value.user_id)
);

// Return payment type options as array of values (for tests)
const paymentTypeOptions = computed(() => 
  ['monthly_rent', 'utilities', 'deposit', 'damage_fee']
);

// Payment type options for select component
const paymentTypeSelectOptions = [
  { value: "monthly_rent", name: "Monthly Rent" },
  { value: "utilities", name: "Utilities" },
  { value: "deposit", name: "Deposit" },
  { value: "damage_fee", name: "Damage Fee" },
];

// Validation functions
function validateForm(): boolean {
  errors.value = {};
  let isValid = true;

  if (!form.value.user_id) {
    errors.value.user_id = 'User is required';
    isValid = false;
  }

  if (!form.value.amount) {
    errors.value.amount = 'Amount is required';
    isValid = false;
  }

  if (!form.value.payment_type) {
    errors.value.payment_type = 'Payment type is required';
    isValid = false;
  }

  if (!form.value.payment_date) {
    errors.value.payment_date = 'Payment date is required';
    isValid = false;
  }

  return isValid;
}

function validateAmount(): boolean {
  errors.value.amount = '';
  
  if (typeof form.value.amount === 'string' && isNaN(Number(form.value.amount))) {
    errors.value.amount = 'Amount must be a valid number';
    return false;
  }

  if (Number(form.value.amount) <= 0) {
    errors.value.amount = 'Amount must be greater than 0';
    return false;
  }

  return true;
}

function validatePaymentDate(): boolean {
  errors.value.payment_date = '';
  
  if (form.value.payment_date) {
    const paymentDate = new Date(form.value.payment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (paymentDate > today) {
      errors.value.payment_date = 'Payment date cannot be in the future';
      return false;
    }
  }

  return true;
}

function validateDescription(): boolean {
  errors.value.description = '';
  
  if (form.value.description && form.value.description.length > 500) {
    errors.value.description = 'Description must be less than 500 characters';
    return false;
  }

  return true;
}

// Utility functions
function formatAmount(amount: number): string {
  return Number(amount).toFixed(2);
}

function clearForm(): void {
  form.value = {
    user_id: null,
    amount: null,
    payment_type: '',
    payment_date: '',
    status: '',
    description: ''
  };
  errors.value = {};
  hasUnsavedChanges.value = false;
}

// Load users function
async function loadUsers(): Promise<void> {
  try {
    const response = await userService.getAll();
    users.value = response.data;
  } catch (err) {
    console.error('Failed to load users:', err);
    showError(t("Failed to load users"));
  }
}

// Load payment function
async function loadPayment(id?: number): Promise<void> {
  // If no id provided, try to get from route params
  let targetId = id;
  if (!targetId) {
    const routeId = route.params.id;
    if (typeof routeId === 'string') {
      targetId = Number(routeId);
    } else if (typeof routeId === 'number') {
      targetId = routeId;
    }
  }
  
  if (!targetId) return;

  try {
    const response = await paymentService.getById(targetId);
    const paymentData = response.data;
    
    form.value = {
      user_id: paymentData.user_id,
      amount: paymentData.amount,
      payment_type: paymentData.payment_type,
      payment_date: paymentData.payment_date,
      status: paymentData.status,
      description: paymentData.description || ''
    };
  } catch (err) {
    console.error('Failed to load payment:', err);
    showError(t("Failed to load payment data"));
  }
}

// Submit form function
async function submitForm(): Promise<void> {
  loading.value = true;
  error.value = '';

  try {
    if (!validateForm()) {
      loading.value = false;
      return;
    }

    console.log("Payment submitted:", form.value);
    
    if (isEditing.value && paymentId.value) {
      await paymentService.update(paymentId.value, form.value);
      showSuccess(t("Payment updated successfully!"));
    } else {
      await paymentService.create(form.value);
      showSuccess(t("Payment created successfully!"));
    }

    hasUnsavedChanges.value = false;
    await router.push('/payments');
  } catch (err) {
    console.error('Form submission error:', err);
    error.value = isEditing.value ? 'Failed to update payment' : 'Failed to create payment';
    showError(error.value);
  } finally {
    loading.value = false;
  }
}

// Cancel function
async function cancel(): Promise<void> {
  if (hasUnsavedChanges.value) {
    const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
    if (!confirmed) return;
  }
  
  await router.push('/payments');
}

// Before route leave guard
function beforeRouteLeave(): boolean {
  if (hasUnsavedChanges.value) {
    return window.confirm('You have unsaved changes. Are you sure you want to leave?');
  }
  return true;
}

// Watch for form changes to track unsaved changes
watch(form, () => {
  hasUnsavedChanges.value = true;
}, { deep: true });

// Load users and payment data on mount
onMounted(async () => {
  await loadUsers();
  
  if (isEditing.value) {
    await loadPayment();
  }
});
</script>