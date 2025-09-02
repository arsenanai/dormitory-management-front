<template>
  <Navigation :title="t('Payment Management')">
    <div class="flex flex-col gap-4">
      <h1>{{ t('Payments') }}</h1>
      
      <!-- Filter and Add Payment Button Section -->
      <div class="flex flex-col gap-4 w-full">
        <!-- Filter Section - Organized in rows for better responsive layout -->
        <div class="flex flex-col gap-4">
          <!-- Row 1: Search and Status filters -->
          <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div class="flex-1">
              <CInput
                id="search"
                v-model="searchTerm"
                :label="t('Search')"
                :placeholder="t('Search payments...')"
              />
            </div>
            <div class="flex-1">
              <CSelect 
                id="status-filter" 
                v-model="statusFilter" 
                :options="statusFilterOptions" 
                :label="t('Status')"
                :placeholder="t('All Statuses')" 
              />
            </div>
            <div class="flex-1">
              <CSelect 
                id="type-filter" 
                v-model="typeFilter" 
                :options="typeFilterOptions" 
                :label="t('Type')"
                :placeholder="t('All Types')" 
              />
            </div>
          </div>
          
          <!-- Row 2: Semester and Year filters -->
          <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div class="flex-1">
              <CInput
                id="semester-filter"
                v-model="semesterFilter"
                :label="t('Semester')"
                :placeholder="t('e.g. 2024-fall')"
              />
            </div>
            <div class="flex-1">
              <CInput
                id="year-filter"
                v-model="yearFilter"
                type="number"
                :label="t('Year')"
                :placeholder="t('Year')"
              />
            </div>
            <div class="flex-1">
              <CSelect
                id="predefined-range"
                v-model="predefinedRange"
                :options="predefinedRangeOptions"
                :label="t('Range')"
              />
            </div>
          </div>
          
          <!-- Row 3: Date range filters -->
          <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div class="flex-1">
              <CInput
                id="start-date"
                v-model="startDate"
                type="date"
                :label="t('Start Date')"
              />
            </div>
            <div class="flex-1">
              <CInput
                id="end-date"
                v-model="endDate"
                type="date"
                :label="t('End Date')"
              />
            </div>
            <div class="flex-1"></div> <!-- Empty div for spacing -->
          </div>
        </div>
        
        <!-- Action Buttons Section -->
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <CButton @click="showPaymentForm" data-testid="add-payment-button">
            <PencilSquareIcon class="h-5 w-5" />
            {{ t("Add Payment") }}
          </CButton>
          <CButton @click="exportPayments" data-testid="export-payments-button">
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("Download") }}
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
      <div v-if="!loading && !error" class="overflow-x-auto relative border border-gray-300 sm:rounded-lg" data-testid="payments-table">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-primary-700 uppercase bg-primary-50 dark:bg-primary-700 dark:text-primary-400">
            <tr>
              <th class="px-6 py-3">{{ t("User") }}</th>
              <th class="px-6 py-3">{{ t("Amount") }}</th>
              <th class="px-6 py-3">{{ t("Semester") }}</th>
              <th class="px-6 py-3">{{ t("Actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedPayments.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                {{ t("No data available") }}
              </td>
            </tr>
            <tr
              v-for="payment in paginatedPayments"
              :key="payment.id"
              class="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
            >
              <td class="px-6 py-4">{{ payment.user?.name || '-' }}</td>
              <td class="px-6 py-4">${{ parseFloat(payment.amount || 0).toFixed(2) }}</td>
              <td class="px-6 py-4">{{ payment.semester || '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <CButton @click="editPayment(payment)" size="small">
                    {{ t('Edit') }}
                  </CButton>
                  <CButton variant="danger" @click="confirmDeletePayment(payment.id)" size="small">
                    {{ t('Delete') }}
                  </CButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
      <div v-if="payments.length > 0" class="mt-4 p-4 bg-primary-50 rounded">
        <h3 class="text-lg font-semibold text-primary-700">{{ t('Total Amount') }}: ${{ totalAmount.toFixed(2) }}</h3>
      </div>
    </div>

    <!-- Payment Form Modal -->
    <CModal v-if="showForm" v-model="showForm">
      <template #header>
        <h2 class="text-xl font-bold text-primary-700">
          {{ selectedPayment ? t('Edit Payment') : t('Add Payment') }}
        </h2>
      </template>
        
        <form @submit.prevent="handleFormSubmit(formData)">
          <div class="space-y-4">
            <CSelect
              id="student-select"
              v-model="formData.user_id"
              :label="t('Student')"
              :options="studentOptions"
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
              id="semester-select"
              v-model="formData.semester"
              :label="t('Semester')"
              :options="semesterOptions"
              required
            />
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <CButton @click="closePaymentForm">
              {{ t('Cancel') }}
            </CButton>
            <CButton type="submit" variant="primary">
              {{ selectedPayment ? t('Update') : t('Create') }}
            </CButton>
          </div>
        </form>
      </CModal>

    <!-- Delete Confirmation Modal -->
    <CConfirmationModal
      v-if="showDeleteConfirmation"
      :message="t('Are you sure? This change is not recoverable')"
      :title="t('Delete Payment')"
      :confirm-text="t('Delete')"
      :cancel-text="t('Cancel')"
      @confirm="deletePayment"
      @cancel="showDeleteConfirmation = false"
    />
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
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
import CModal from "@/components/CModal.vue"; // Added CModal import
import CConfirmationModal from "@/components/CConfirmationModal.vue";
import { PencilSquareIcon, ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
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
const showDeleteConfirmation = ref<boolean>(false);
const paymentToDelete = ref<number | null>(null);
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
  semester: ""
});

// Filter options
const statusFilterOptions = [
  { value: "", name: t("All Statuses") }
];

const typeFilterOptions = [
  { value: "", name: t("All Types") }
];

// Table columns
const tableColumns = [
  { key: "user", label: t("User") },
  { key: "amount", label: t("Amount") },
  { key: "payment_type", label: t("Type") },
  { key: "payment_date", label: t("Date") },
  { key: "status", label: t("Status") },
  { key: "description", label: t("Description") },
  { key: "actions", label: t("Actions") },
];

// Load payments data
const loadPayments = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required';
      payments.value = [];
      loading.value = false;
      return;
    }

    const params: any = {
      page: currentPage.value,
      per_page: itemsPerPage.value,
    };

    // Only add non-empty filter values
    if (searchTerm.value) params.search = searchTerm.value;
    if (statusFilter.value) params.status = statusFilter.value;
    if (typeFilter.value) params.type = typeFilter.value;
    if (semesterFilter.value) params.semester = semesterFilter.value;
    if (yearFilter.value) params.year = yearFilter.value;
    if (startDate.value) params.date_from = startDate.value;
    if (endDate.value) params.date_to = endDate.value;

    const response = await paymentService.getAll(params);
    
    if (response.data && response.data.data) {
      payments.value = response.data.data;
      // total.value = response.data.total || 0; // total is not defined, using filteredPayments.length instead
    } else {
      payments.value = [];
      // total.value = 0; // total is not defined
    }
  } catch (err) {
    error.value = 'Failed to load payments';
    console.error('Error loading payments:', err);
  } finally {
    loading.value = false;
  }
};

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

const confirmDeletePayment = (id: number) => {
  paymentToDelete.value = id;
  showDeleteConfirmation.value = true;
};

const deletePayment = async () => {
  if (!paymentToDelete.value) return;
  
  try {
    await paymentService.delete(paymentToDelete.value);
    payments.value = payments.value.filter(p => p.id !== paymentToDelete.value);
    showSuccess(t('Payment deleted successfully'));
  } catch (err) {
    showError(t('Failed to delete payment'));
    throw err;
  } finally {
    showDeleteConfirmation.value = false;
    paymentToDelete.value = null;
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
    const blob = new Blob([// @ts-expect-error handle both Axios and raw Blob
      (response && (response as any).data) ? (response as any).data : response
    ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
const showPaymentForm = async () => {
  showForm.value = true;
  selectedPayment.value = null;
  resetForm();
  await loadStudents(); // Load students when form opens
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
    semester: payment.semester || currentSemester()
  };
  showForm.value = true;
};

const resetForm = () => {
  formData.value = {
    user_id: "",
    amount: "",
    semester: currentSemester()
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

// Semester options and helpers
const semesterOptions = [
  { value: 'spring', name: t('Spring') },
  { value: 'summer', name: t('Summer') },
  { value: 'fall', name: t('Fall') }
];

function currentSemester(): string {
  const month = new Date().getMonth() + 1;
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'fall';
}

// Student options (name surname email)
const studentOptions = ref<Array<{ value: string; name: string }>>([]);

// Load students function
const loadStudents = async () => {
  try {
    // For now, create some mock student options since we don't have a students API
    // In a real implementation, this would fetch from /api/students or /api/users
    studentOptions.value = [
      { value: '1', name: 'John Doe (john@example.com)' },
      { value: '2', name: 'Jane Smith (jane@example.com)' },
      { value: '3', name: 'Bob Johnson (bob@example.com)' }
    ];
  } catch (err) {
    console.error('Failed to load students:', err);
    // Fallback to empty array
    studentOptions.value = [];
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
