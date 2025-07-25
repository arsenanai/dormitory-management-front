<template>
  <Navigation :title="t('Payment Management')">
    <div class="flex flex-col gap-4">
      <h1>Payments</h1>
      
      <!-- Filter and Add Payment Button Section -->
      <div class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-end lg:justify-between w-full">
        <!-- Filter Section -->
        <div class="flex-auto flex flex-col gap-2 lg:flex-row lg:items-end">
          <CInput
            id="search"
            v-model="searchTerm"
            :label="t('Search')"
            :placeholder="t('Search payments...')"
            class="lg:w-40"
          />
          <CSelect 
            id="status-filter" 
            v-model="statusFilter" 
            :options="statusFilterOptions" 
            :label="t('Status')"
            :placeholder="t('All Statuses')" 
            class="lg:w-40" 
          />
          <CSelect 
            id="type-filter" 
            v-model="typeFilter" 
            :options="typeFilterOptions" 
            :label="t('Type')"
            :placeholder="t('All Types')" 
            class="lg:w-40" 
          />
          <!-- Semester Filter (NEW) -->
          <CInput
            id="semester-filter"
            v-model="semesterFilter"
            :label="t('Semester')"
            :placeholder="t('e.g. 2024-fall')"
            class="lg:w-32"
          />
          <!-- Year Filter (NEW) -->
          <CInput
            id="year-filter"
            v-model="yearFilter"
            type="number"
            :label="t('Year')"
            :placeholder="t('Year')"
            class="lg:w-24"
          />
          <!-- Date Range Filter (NEW) -->
          <CInput
            id="start-date"
            v-model="startDate"
            type="date"
            :label="t('Start Date')"
            class="lg:w-36"
          />
          <CInput
            id="end-date"
            v-model="endDate"
            type="date"
            :label="t('End Date')"
            class="lg:w-36"
          />
          <!-- Predefined Range Filter (NEW) -->
          <CSelect
            id="predefined-range"
            v-model="predefinedRange"
            :options="predefinedRangeOptions"
            :label="t('Range')"
            class="lg:w-40"
          />
        </div>
        
        <!-- Add Payment Button and Export Button -->
        <div class="flex-1 flex justify-end gap-2">
          <CButton variant="primary" @click="showPaymentForm" data-testid="add-payment-button">
            <PencilSquareIcon class="h-5 w-5" />
            {{ t("Add Payment") }}
          </CButton>
          <CButton variant="secondary" @click="exportPayments" data-testid="export-payments-button">
            <span class="material-icons">download</span>
            {{ t("Export as .xlsx") }}
          </CButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-text text-center py-4">
        {{ t("Loading...") }}
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message text-red-500 text-center py-4">
        {{ error }}
      </div>

      <!-- Payments Table -->
      <CTable v-if="!loading && !error">
        <CTableHead>
          <CTableHeadCell>{{ t("User") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("Amount") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("Type") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("Date") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("Status") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("Description") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("Actions") }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
          <CTableRow
            v-for="payment in paginatedPayments"
            :key="payment.id"
          >
            <CTableCell>{{ payment.user?.name || '-' }}</CTableCell>
            <CTableCell>${{ payment.amount?.toFixed(2) || '0.00' }}</CTableCell>
            <CTableCell>{{ payment.payment_type || '-' }}</CTableCell>
            <CTableCell>{{ formatDate(payment.payment_date) }}</CTableCell>
            <CTableCell>
              <span 
                :class="getStatusColor(payment.status)"
                class="px-2 py-1 rounded text-xs"
              >
                {{ payment.status || '-' }}
              </span>
            </CTableCell>
            <CTableCell>{{ payment.description || '-' }}</CTableCell>
            <CTableCell>
              <div class="flex gap-2">
                <CButton @click="editPayment(payment)" size="small">
                  {{ t('Edit') }}
                </CButton>
                <CButton @click="deletePayment(payment.id)" variant="danger" size="small">
                  {{ t('Delete') }}
                </CButton>
              </div>
            </CTableCell>
          </CTableRow>
        </CTableBody>
      </CTable>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-4">
        <CButton 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          size="small"
        >
          {{ t('Previous') }}
        </CButton>
        <span class="px-4 py-2">
          {{ t('Page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
        </span>
        <CButton 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          size="small"
        >
          {{ t('Next') }}
        </CButton>
      </div>

      <!-- Total Amount Display -->
      <div v-if="payments.length > 0" class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="text-lg font-semibold">{{ t('Total Amount') }}: ${{ totalAmount.toFixed(2) }}</h3>
      </div>
    </div>

    <!-- Payment Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 class="text-xl font-bold mb-4">
          {{ selectedPayment ? t('Edit Payment') : t('Add Payment') }}
        </h2>
        
        <form @submit.prevent="handleFormSubmit(formData)">
          <div class="space-y-4">
            <CInput
              v-model="formData.user_id"
              :label="t('User ID')"
              type="number"
              required
            />
            <CInput
              v-model="formData.amount"
              :label="t('Amount')"
              type="number"
              step="0.01"
              required
            />
            <CSelect
              id="payment-type"
              v-model="formData.payment_type"
              :label="t('Payment Type')"
              :options="typeFilterOptions"
              required
            />
            <CInput
              v-model="formData.payment_date"
              :label="t('Payment Date')"
              type="date"
              required
            />
            <CSelect
              id="payment-status"
              v-model="formData.status"
              :label="t('Status')"
              :options="statusFilterOptions"
              required
            />
            <CInput
              v-model="formData.description"
              :label="t('Description')"
            />
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <CButton type="button" @click="closePaymentForm" variant="secondary">
              {{ t('Cancel') }}
            </CButton>
            <CButton type="submit" variant="primary">
              {{ selectedPayment ? t('Update') : t('Create') }}
            </CButton>
          </div>
        </form>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import CButton from "@/components/CButton.vue";
import { PencilSquareIcon } from "@heroicons/vue/24/outline";
import { paymentService } from "@/services/api";
import { usePaymentsStore } from "@/stores/payments";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const router = useRouter();

// store
const paymentsStore = usePaymentsStore();
const { showError, showSuccess } = useToast();

// State
const payments = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchTerm = ref<string>("");
const statusFilter = ref<string>("");
const typeFilter = ref<string>("");
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);
const showForm = ref<boolean>(false);
const selectedPayment = ref<any>(null);
const semesterFilter = ref('');
const yearFilter = ref('');
const startDate = ref('');
const endDate = ref('');
const predefinedRange = ref('');
const predefinedRangeOptions = [
  { value: '', name: t('Custom') },
  { value: '1_semester', name: t('1 Semester') },
  { value: '1_year', name: t('1 Year') },
  { value: '2_years', name: t('2 Years') },
  { value: '4_years', name: t('4 Years') },
];

// Form data
const formData = ref({
  user_id: "",
  amount: "",
  payment_type: "",
  payment_date: "",
  status: "",
  description: ""
});

// Filter options
const statusFilterOptions = [
  { value: "", name: t("All Statuses") },
  { value: "pending", name: t("Pending") },
  { value: "completed", name: t("Completed") },
  { value: "failed", name: t("Failed") },
  { value: "refunded", name: t("Refunded") }
];

const typeFilterOptions = [
  { value: "", name: t("All Types") },
  { value: "monthly_rent", name: t("Monthly Rent") },
  { value: "security_deposit", name: t("Security Deposit") },
  { value: "utilities", name: t("Utilities") },
  { value: "maintenance", name: t("Maintenance") },
  { value: "other", name: t("Other") }
];

// Load payments on component mount
async function loadPayments() {
  loading.value = true;
  error.value = '';
  try {
    const filters: any = {
      search: searchTerm.value,
      status: statusFilter.value,
      type: typeFilter.value,
      semester: semesterFilter.value,
      year: yearFilter.value,
      start_date: startDate.value,
      end_date: endDate.value,
      range: predefinedRange.value,
    };
    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    const response = await paymentService.getAll(filters);
    payments.value = response.data;
  } catch (err) {
    error.value = t('Failed to load payments');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPayments();
  paymentsStore.clearSelectedPayment();
});

// Watch filters and reload payments
watch([searchTerm, statusFilter, typeFilter, semesterFilter, yearFilter, startDate, endDate, predefinedRange], loadPayments);

// Filtered payments
const filteredPayments = computed(() => {
  let filtered = payments.value;

  // Apply search filter
  if (searchTerm.value) {
    filtered = filtered.filter(payment =>
      payment.user?.name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(payment => payment.status === statusFilter.value);
  }

  // Apply type filter
  if (typeFilter.value) {
    filtered = filtered.filter(payment => payment.payment_type === typeFilter.value);
  }

  return filtered;
});

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / itemsPerPage.value);
});

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPayments.value.slice(start, end);
});

// Total amount calculation
const totalAmount = computed(() => {
  return filteredPayments.value.reduce((total, payment) => {
    return total + (parseFloat(payment.amount) || 0);
  }, 0);
});

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

// Status color helper
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// CRUD operations
const createPayment = async (paymentData: any) => {
  try {
    const response = await paymentService.create(paymentData);
    payments.value.push(response.data);
    showSuccess(t('Payment created successfully'));
    return response.data;
  } catch (err) {
    showError(t('Failed to create payment'));
    throw err;
  }
};

const updatePayment = async (id: number, paymentData: any) => {
  try {
    const response = await paymentService.update(id, paymentData);
    const index = payments.value.findIndex(p => p.id === id);
    if (index !== -1) {
      payments.value[index] = response.data;
    }
    showSuccess(t('Payment updated successfully'));
    return response.data;
  } catch (err) {
    showError(t('Failed to update payment'));
    throw err;
  }
};

const deletePayment = async (id: number) => {
  try {
    await paymentService.delete(id);
    payments.value = payments.value.filter(p => p.id !== id);
    showSuccess(t('Payment deleted successfully'));
  } catch (err) {
    showError(t('Failed to delete payment'));
    throw err;
  }
};

async function exportPayments() {
  try {
    const filters: any = {
      search: searchTerm.value,
      status: statusFilter.value,
      type: typeFilter.value,
      semester: semesterFilter.value,
      year: yearFilter.value,
      start_date: startDate.value,
      end_date: endDate.value,
      range: predefinedRange.value,
    };
    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    const response = await paymentService.export(filters);
    // Create a blob and trigger download
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payments.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(t('Failed to export payments'));
  }
}

// Modal and form handling
const showPaymentForm = () => {
  showForm.value = true;
  selectedPayment.value = null;
  resetForm();
};

const closePaymentForm = () => {
  showForm.value = false;
  selectedPayment.value = null;
  resetForm();
};

const editPayment = (payment: any) => {
  selectedPayment.value = payment;
  formData.value = {
    user_id: payment.user_id?.toString() || "",
    amount: payment.amount?.toString() || "",
    payment_type: payment.payment_type || "",
    payment_date: payment.payment_date || "",
    status: payment.status || "",
    description: payment.description || ""
  };
  showForm.value = true;
};

const resetForm = () => {
  formData.value = {
    user_id: "",
    amount: "",
    payment_type: "",
    payment_date: "",
    status: "",
    description: ""
  };
};

const handleFormSubmit = async (data: any) => {
  try {
    if (selectedPayment.value) {
      await updatePayment(selectedPayment.value.id, data);
    } else {
      await createPayment(data);
    }
    closePaymentForm();
  } catch (err) {
    // Error handling is done in the CRUD methods
  }
};

// Navigation function
const navigateToEditPayment = (payment: any) => {
  paymentsStore.setSelectedPayment(payment);
  const id = payment.id || payment.contract_number || payment.dogovorNumber;
  router.push(`/payment-form/${id}`);
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
