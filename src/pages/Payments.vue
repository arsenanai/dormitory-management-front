<template>
  <Navigation :title="t('Payment Management')">
    <div class="flex flex-col gap-4">

      <!-- Filter Section -->
      <div class="flex flex-col gap-4 w-full">
        <!-- Filter Section - Organized in rows for better responsive layout -->
        <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div class="flex-1">
            <CInput id="search" v-model="searchTerm" :label="t('Search')" :placeholder="t('Search payments...')" />
          </div>
          <div class="flex-1">
            <CInput id="start-date" v-model="startDate" type="date" :label="t('Start Date')" />
          </div>
          <div class="flex-1">
            <CInput id="end-date" v-model="endDate" type="date" :label="t('End Date')" />
          </div>
          <div class="flex-1">
            <CSelect id="role-filter" v-model="selectedRole" :options="roleOptions" :label="t('Role')" />
          </div>
        </div>
        <!-- Action Buttons Section -->
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <CButton @click="showPaymentForm" data-testid="add-payment-button" :disabled="loading">
            <PencilSquareIcon class="h-5 w-5" />
            {{ t("Add Payment") }}
          </CButton>
          <CButton @click="exportPayments" data-testid="export-payments-button" :disabled="loading">
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("Download") }}
          </CButton>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message text-red-500 text-center py-4">
        {{ error }}
      </div>

      <!-- Payments Table -->
      <CTable v-if="!error" :columns="tableColumns" :data="paginatedPayments" :loading="loading"
        data-testid="payments-table">
        <template #cell-user="{ row: payment }">
          <div class="flex flex-col gap-2">
            <span>
              {{ payment.user?.name || '-' }}
            </span>
            <span>
              {{ payment.user?.email ? payment.user.email : '' }}
            </span>
            <span v-if="payment.user.phone_numbers" class="flex flex-col">
              <span v-for="phone in payment.user.phone_numbers">
                {{ phone }}
              </span>
            </span>
          </div>
        </template>
        <template #cell-amount="{ row: payment }">
          {{ formatPrice(parseFloat(payment.amount || '0')) }}
        </template>
        <template #cell-role="{ row: payment }">
          <span class="capitalize">{{ payment.user?.role?.name || '-' }}</span>
        </template>
        <template #cell-deal_number="{ row: payment }">
          {{ payment.deal_number || '-' }}
        </template>
        <template #cell-period="{ row: payment }">
          {{ payment.date_from?.split('T')[0] }} - {{ payment.date_to?.split('T')[0] }}
        </template>
        <template #cell-actions="{ row: payment }">
          <div class="flex gap-2 justify-end">
            <CButton @click="editPayment(payment)" :disabled="loading">
              <PencilSquareIcon class="h-5 w-5" />
            </CButton>
            <CButton variant="danger" @click="confirmDeletePayment(payment.id)" :disabled="loading">
              <TrashIcon class="h-5 w-5" />
            </CButton>
          </div>
        </template>
      </CTable>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex flex-col items-center justify-between gap-4 md:flex-row"
        data-testid="pagination">
        <div class="text-sm text-gray-700">
          <span v-if="total > 0">
            <span class="font-medium">{{ fromPayment }}</span> - <span class="font-medium">{{ toPayment }}</span> /
            <span class="font-medium">{{ total }}</span>
          </span>
          <span v-else>
            {{ t('No data available') }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <CButton :disabled="currentPage === 1" @click="currentPage--" :aria-label="t('Previous page')" class="h-10">
            <ChevronLeftIcon class="h-5 w-5" />
          </CButton>
          <div class="flex items-center gap-1 text-sm">
            <div class="w-20">
              <CInput id="page-input" v-model.number="pageInput" type="number" :min="1" :max="totalPages"
                class="text-center h-10" @keyup.enter="goToPage" />
            </div>
            <span>/ {{ totalPages }}</span>
          </div>
          <CButton :disabled="currentPage === totalPages" @click="currentPage++" :aria-label="t('Next page')"
            class="h-10">
            <ChevronRightIcon class="h-5 w-5" />
          </CButton>
        </div>
      </div>

    </div>

    <!-- Delete Confirmation Modal -->
    <CConfirmationModal v-if="showDeleteConfirmation" :message="t('Are you sure? This change is not recoverable')"
      :title="t('Delete Payment')" :confirm-text="t('Delete')" :cancel-text="t('Cancel')" @confirm="deletePayment"
      @cancel="showDeleteConfirmation = false" />
    <PaymentForm v-model="showForm" :selected-payment="selectedPayment" :currency-symbol="currencySymbol"
      @submit="handleFormSubmission" />
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CTable from "@/components/CTable.vue";
import CButton from "@/components/CButton.vue";
import CConfirmationModal from "@/components/CConfirmationModal.vue";
import CSelect from "@/components/CSelect.vue";
import PaymentForm from "./PaymentForm.vue";
import { useSettingsStore } from "@/stores/settings";
import { PencilSquareIcon, ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { paymentService, configurationService } from "@/services/api";
import { usePaymentsStore } from "@/stores/payments";
import { useToast } from "@/composables/useToast";
import { formatCurrency } from "@/utils/formatters";

const { t } = useI18n();
const router = useRouter();

// store
const paymentsStore = usePaymentsStore();
const settingsStore = useSettingsStore();
const { showError, showSuccess } = useToast();

// State
const payments = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const total = ref<number>(0);
const startDate = ref<string>('');
const endDate = ref<string>('');
const searchTerm = ref<string>('');
const selectedRole = ref<string>('');
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);
const pageInput = ref(1);
const fromPayment = ref(0);
const toPayment = ref(0);
const showForm = ref<boolean>(false);
const selectedPayment = ref<any>(null);
const showDeleteConfirmation = ref<boolean>(false);
const paymentToDelete = ref<number | null>(null);
const currencySymbol = computed(() => settingsStore.publicSettings?.currency_symbol || '$');

// Role filter options
const roleOptions = [
  { value: '', name: t('All Roles') },
  { value: 'student', name: t('Student') },
  { value: 'guest', name: t('Guest') },
];

// Table columns
const tableColumns = [
  { key: "user", label: t("User"), class: "whitespace-nowrap" },
  { key: "role", label: t("Role") },
  { key: "amount", label: t("Amount") },
  { key: "deal_number", label: t("Deal Number") },
  { key: "period", label: t("Period") },
  { key: "actions", label: t("Actions"), class: "text-right" },
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

    if (searchTerm.value) params.search = searchTerm.value;
    if (startDate.value) params.date_from = startDate.value;
    if (endDate.value) params.date_to = endDate.value;
    if (selectedRole.value) params.role = selectedRole.value;

    const response = await paymentService.getAll(params);

    if (response.data && response.data.meta) { // Check for the new paginated structure
      payments.value = response.data.data;
      currentPage.value = response.data.meta.current_page;
      total.value = response.data.meta.total || 0;
      fromPayment.value = response.data.meta.from || 0;
      toPayment.value = response.data.meta.to || 0;
      itemsPerPage.value = response.data.meta.per_page;
    } else {
      payments.value = [];
      total.value = 0;
      fromPayment.value = 0;
      toPayment.value = 0;
    }
  } catch (err) {
    payments.value = [];
    error.value = 'Failed to load payments';
    console.error('Error loading payments:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  loadPayments();
  pageInput.value = currentPage.value;
  paymentsStore.clearSelectedPayment();
});

// Watch filters and reload payments
watch([searchTerm, startDate, endDate, selectedRole], () => {
  currentPage.value = 1;
  pageInput.value = 1;
  loadPayments();
});

// Pagination
const totalPages = computed(() => {
  return Math.ceil(total.value / itemsPerPage.value);
});

const paginatedPayments = computed(() => {
  return payments.value; // Backend already returns paginated data
});

watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage && newPage > 0 && newPage <= totalPages.value) {
    pageInput.value = newPage;
    loadPayments();
  }
});

const formatPrice = (price: number): string => formatCurrency(price, currencySymbol.value, 'USD');

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
    const filters: any = {};
    if (searchTerm.value) filters.search = searchTerm.value;
    if (startDate.value) filters.date_from = startDate.value;
    if (endDate.value) filters.date_to = endDate.value;

    const response = await paymentService.export(filters);
    const blob = new Blob([(response && (response as any).data) ? (response as any).data : response], { type: 'text/csv' }); // Changed to text/csv
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (err) {
    showError(t('Failed to export payments'));
    console.error('Error exporting payments:', err);
  }
}

// Modal and form handling
const showPaymentForm = async () => {
  showForm.value = true;
  selectedPayment.value = null;
};

const closePaymentForm = () => {
  showForm.value = false;
  selectedPayment.value = null;
};

const editPayment = async (payment: any) => {
  selectedPayment.value = payment;
  showForm.value = true;
};

const handleFormSubmission = () => {
  loadPayments();
  closePaymentForm();
};

// Pagination handlers
const goToPage = () => {
  const page = Number(pageInput.value);
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  } else {
    pageInput.value = currentPage.value;
  }
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
