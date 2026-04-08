<template>
  <Navigation :title="t('Transaction Management')">
    <div class="flex flex-col gap-4">
      <!-- Filter Section -->
      <div class="flex w-full flex-col gap-4">
        <!-- Filter Section - Organized in rows for better responsive layout -->
        <div class="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div class="flex-1">
            <CInput
              id="search"
              v-model="searchTerm"
              :label="t('Search')"
              :placeholder="t('Search transactions...')"
            />
          </div>

          <!-- Date filters -->
          <div class="flex-1">
            <CInput id="start-date" v-model="startDate" type="date" :label="t('Start Date')" />
          </div>
          <div class="flex-1">
            <CInput id="end-date" v-model="endDate" type="date" :label="t('End Date')" />
          </div>

          <!-- Payment Method filter -->
          <div class="flex-1">
            <CSelect
              id="payment-method-filter"
              v-model="selectedPaymentMethod"
              :options="paymentMethodOptions"
              :label="t('Payment Method')"
            />
          </div>

          <!-- Status filter -->
          <div class="flex-1">
            <CSelect
              id="status-filter"
              v-model="selectedStatus"
              :options="statusOptions"
              :label="t('Status')"
            />
          </div>

          <!-- Role filter for admin -->
          <div class="flex-1" v-if="isAdmin">
            <CSelect
              id="role-filter"
              v-model="selectedRole"
              :options="roleOptions"
              :label="t('Role')"
            />
          </div>
        </div>
        
        <!-- Action Buttons Section -->
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <CButton
            v-if="isAdmin"
            @click="showTransactionForm"
            data-testid="add-transaction-button"
            :disabled="loading"
          >
            <PencilSquareIcon class="h-5 w-5" />
            {{ t("Add Transaction") }}
          </CButton>
          <CButton
            @click="exportTransactions"
            data-testid="export-transactions-button"
            :disabled="loading"
            v-if="isAdmin"
          >
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("Download") }}
          </CButton>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message py-4 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Transactions Table -->
      <CTable
        v-if="!error"
        :columns="tableColumns"
        :data="transactions"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <template #cell-amount="{ row }">
          {{ formatCurrency(row.amount, currencySymbol) }}
        </template>
        
        <template #cell-status="{ row }">
          <span
            :class="getStatusClass(row.status)"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ t(row.status) }}
          </span>
        </template>

        <template #cell-createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>

        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <CButton
              variant="link"
              size="sm"
              @click="viewTransaction(row)"
              class=""
            >
              <EyeIcon class="h-4 w-4" />
              {{ t("View") }}
            </CButton>
            <CButton
              v-if="isAdmin"
              variant="link"
              size="sm"
              @click="editTransaction(row)"
              class=""
            >
              <PencilIcon class="h-4 w-4" />
              {{ t("Edit") }}
            </CButton>
            <CButton
              v-if="isAdmin"
              variant="danger"
              @click="deleteTransaction(row)"
            >
              <TrashIcon class="h-5 w-5" />
            </CButton>
          </div>
        </template>
      </CTable>
    </div>

    <!-- Transaction Form Modal -->
    <TransactionForm
      v-if="showFormModal"
      :transaction="selectedTransaction"
      :payments="availablePayments"
      :preselected-payment="preselectedPayment"
      @close="closeFormModal"
      @saved="handleTransactionSaved"
    />

    <!-- Transaction Details Modal -->
    <TransactionDetails
      v-if="showDetailsModal"
      :transaction="selectedTransaction"
      @close="closeDetailsModal"
    />
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import {
  PencilSquareIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";
import TransactionForm from "./TransactionForm.vue";
import TransactionDetails from "./TransactionDetails.vue";
import { useTransactionsStore } from "@/stores/transactions";
import { transactionService, paymentService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useToast } from "@/composables/useToast";
import { formatDateTime, formatCurrency } from "@/utils/formatters";
import type { Transaction } from "@/models/Transaction";
import type { Payment } from "@/models/Payment";

const { t } = useI18n();
const transactionsStore = useTransactionsStore();
const authStore = useAuthStore();
const { showError, showSuccess, showConfirmation } = useToast();

const settingsStore = useSettingsStore();
const currencySymbol = computed(() => settingsStore.publicSettings?.currency_symbol || "USD");

const { transactions, loading, error } = storeToRefs(transactionsStore);

// Reactive state
const searchTerm = ref("");
const startDate = ref("");
const endDate = ref("");
const selectedPaymentMethod = ref("");
const selectedStatus = ref("");
const selectedRole = ref("");
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
});

// Modal state
const showFormModal = ref(false);
const showDetailsModal = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const availablePayments = ref<Payment[]>([]);

// Preselection state from query params
const preselectedPayment = ref<{ id: number; amount: number } | null>(null);

// Computed properties
const isAdmin = computed(() => authStore.user?.role?.name === "admin" || authStore.user?.role?.name === "sudo");

const paymentMethodOptions = computed(() => [
  { value: "", name: t("All Methods") },
  { value: "bank_check", name: t("Bank Check") },
  { value: "kaspi", name: t("Kaspi") },
  { value: "stripe", name: t("Stripe") },
]);

const statusOptions = computed(() => [
  { value: "", name: t("All Statuses") },
  { value: "pending", name: t("Pending") },
  { value: "processing", name: t("Processing") },
  { value: "completed", name: t("Completed") },
  { value: "failed", name: t("Failed") },
  { value: "cancelled", name: t("Cancelled") },
  { value: "refunded", name: t("Refunded") },
]);

const roleOptions = computed(() => [
  { value: "", name: t("All Roles") },
  { value: "student", name: t("Student") },
  { value: "guest", name: t("Guest") },
]);

const tableColumns = computed(() => [
  { key: "id", label: t("ID") },
  { key: "user.name", label: t("User") },
  { key: "amount", label: t("Amount") },
  { key: "paymentMethod", label: t("Payment Method") },
  { key: "status", label: t("Status") },
  { key: "createdAt", label: t("Created At") },
  { key: "actions", label: t("Actions") },
]);

// Methods
const fetchTransactions = async () => {
  transactionsStore.setLoading(true);
  transactionsStore.setError(null);

  try {
    const params: any = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
    };

    if (searchTerm.value) params.search = searchTerm.value;
    if (startDate.value) params.date_from = startDate.value;
    if (endDate.value) params.date_to = endDate.value;
    if (selectedPaymentMethod.value) params.payment_method = selectedPaymentMethod.value;
    if (selectedStatus.value) params.status = selectedStatus.value;
    if (selectedRole.value) params.role = selectedRole.value;

    const response = isAdmin.value
      ? await transactionService.getAll(params)
      : await transactionService.getMyTransactions(params);

    transactionsStore.setTransactions(response.data.data);
    pagination.value = response.data;
  } catch (err: any) {
    transactionsStore.setError(err.response?.data?.message || t("Failed to load transactions"));
  } finally {
    transactionsStore.setLoading(false);
  }
};

const fetchPayments = async () => {
  try {
    const params = { status: 'pending', per_page: 100 };
    const response = isAdmin.value
      ? await paymentService.getAll(params)
      : await paymentService.getMyPayments(params);
    availablePayments.value = response.data.data;
  } catch (err) {
    console.error("Failed to fetch payments:", err);
  }
};

const handlePageChange = (page: number) => {
  pagination.value.current_page = page;
  fetchTransactions();
};

const handlePerPageChange = (perPage: number) => {
  pagination.value.per_page = perPage;
  pagination.value.current_page = 1;
  fetchTransactions();
};

const showTransactionForm = () => {
  selectedTransaction.value = null;
  showFormModal.value = true;
};

const viewTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  showDetailsModal.value = true;
};

const editTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  showFormModal.value = true;
};

const deleteTransaction = async (transaction: Transaction) => {
  const confirmed = await showConfirmation(
    t("Are you sure? This change is not recoverable"),
    t("Delete Transaction")
  );
  if (!confirmed) return;

  try {
    await transactionService.delete(transaction.id);
    transactionsStore.removeTransaction(transaction.id);
    showSuccess(t("Transaction deleted successfully"));
    fetchTransactions();
  } catch (err: any) {
    showError(err.response?.data?.message || t("Failed to delete transaction"));
  }
};

const closeFormModal = () => {
  showFormModal.value = false;
  selectedTransaction.value = null;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedTransaction.value = null;
};

const handleTransactionSaved = () => {
  closeFormModal();
  fetchTransactions();
};

const exportTransactions = async () => {
  try {
    const params: any = {};
    if (searchTerm.value) params.search = searchTerm.value;
    if (startDate.value) params.date_from = startDate.value;
    if (endDate.value) params.date_to = endDate.value;
    if (selectedPaymentMethod.value) params.payment_method = selectedPaymentMethod.value;
    if (selectedStatus.value) params.status = selectedStatus.value;
    if (selectedRole.value) params.role = selectedRole.value;

    const blob = await transactionService.export(params);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    showError(err.response?.data?.message || t("Failed to export transactions"));
  }
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

// Watch for filter changes
watch(
  [searchTerm, startDate, endDate, selectedPaymentMethod, selectedStatus, selectedRole],
  () => {
    pagination.value.current_page = 1;
    fetchTransactions();
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  fetchTransactions();
  fetchPayments();
  
  // Handle preselected payment from query params
  const route = useRoute();
  if (route.query.preselect_payment && route.query.amount) {
    preselectedPayment.value = {
      id: Number(route.query.preselect_payment),
      amount: Number(route.query.amount)
    };
    // Auto-open the transaction form
    showFormModal.value = true;
  }
});
</script>
