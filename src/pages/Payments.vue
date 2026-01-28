<template>
  <Navigation :title="t('Payment Management')">
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
              :placeholder="t('Search payments...')"
            />
          </div>

          <!-- Date filters for admin users (when not filtering students) -->
          <template v-if="!showSemesterFilter">
            <div class="flex-1">
              <CInput id="start-date" v-model="startDate" type="date" :label="t('Start Date')" />
            </div>
            <div class="flex-1">
              <CInput id="end-date" v-model="endDate" type="date" :label="t('End Date')" />
            </div>
          </template>

          <!-- Semester selector for students or admin filtering students -->
          <div class="flex-1" v-if="showSemesterFilter">
            <CSelect
              id="semester-filter"
              v-model="selectedSemester"
              :options="semesterOptions"
              :label="t('Semester')"
            />
          </div>

          <!-- Payment Type filter -->
          <div class="flex-1">
            <CSelect
              id="payment-type-filter"
              v-model="selectedPaymentType"
              :options="paymentTypeOptions"
              :label="t('Payment Type')"
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

          <!-- <div v-if="!isMyPayments" class="flex-1"> -->
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
            @click="showPaymentForm"
            data-testid="add-payment-button"
            :disabled="loading"
          >
            <PencilSquareIcon class="h-5 w-5" />
            {{ t("Add Payment") }}
          </CButton>
          <!-- <CButton v-if="!isMyPayments" @click="exportPayments" data-testid="export-payments-button"
            :disabled="loading"> -->
          <CButton
            @click="exportPayments"
            data-testid="export-payments-button"
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

      <!-- Payments Table -->
      <CTable
        v-if="!error"
        :columns="tableColumns"
        :data="paginatedPayments"
        :loading="loading"
        data-testid="payments-table"
      >
        <template #cell-user="{ row: payment }">
          <div class="flex flex-col gap-2">
            <span>
              {{ payment.user?.name || "-" }}
            </span>
            <span>
              {{ payment.user?.email ? payment.user.email : "" }}
            </span>
            <span v-if="payment.user.phoneNumbers" class="flex flex-col">
              <span v-for="phone in payment.user.phoneNumbers" :key="phone">
                {{ phone }}
              </span>
            </span>
            <span v-if="payment.user?.room?.number" class="text-sm text-gray-600">
              {{ payment.user.room.number
              }}{{
                payment.user.room.room_type?.name ? ` (${payment.user.room.room_type.name})` : ""
              }}
            </span>
          </div>
        </template>
        <template #cell-amount="{ row: payment }">
          {{ formatPrice(parseFloat(payment.amount || "0")) }}
        </template>
        <template #cell-payment_type="{ row: payment }">
          <span>{{ formatPaymentType(payment.paymentType) }}</span>
        </template>
        <template #cell-role="{ row: payment }">
          <span class="capitalize">{{ payment.user?.role?.name || "-" }}</span>
        </template>
        <template #cell-id="{ row: payment }">
          <span
            v-if="
              payment.user?.role?.name === 'student' &&
              payment.user?.student_profile?.iin &&
              payment.user.student_profile.iin.trim()
            "
          >
            {{ payment.user.student_profile.iin }} (IIN)
          </span>
          <span
            v-else-if="
              payment.user?.role?.name === 'guest' &&
              payment.user?.guest_profile?.identification_number &&
              payment.user.guest_profile.identification_number.trim()
            "
          >
            {{ payment.user.guest_profile.identification_number }}
            <span v-if="payment.user.guest_profile.identification_type === 'national_id'">
              (Nat. ID)</span
            >
            <span v-else-if="payment.user.guest_profile.identification_type === 'passport'">
              (Pas. ID)</span
            >
            <span v-else-if="payment.user.guest_profile.identification_type">
              ({{ payment.user.guest_profile.identification_type }})</span
            >
          </span>
          <span v-else>-</span>
        </template>
        <template #cell-period="{ row: payment }">
          <span class="whitespace-nowrap">{{ payment.dateFrom?.split("T")[0] }}</span> -
          <span class="whitespace-nowrap">{{ payment.dateTo?.split("T")[0] }}</span>
        </template>
        <template #cell-status="{ row: payment }">
          <span
            :class="{
              'bg-yellow-100 text-yellow-800': payment.status === 'pending',
              'bg-blue-100 text-blue-800': payment.status === 'processing',
              'bg-green-100 text-green-800': payment.status === 'completed',
              'bg-red-100 text-red-800':
                payment.status === 'failed' || payment.status === 'cancelled',
              'bg-gray-100 text-gray-800':
                payment.status === 'expired' || payment.status === 'refunded',
            }"
            class="inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize"
          >
            {{ formatStatus(payment.status) }}
          </span>
        </template>
        <template #cell-actions="{ row: payment }">
          <div class="flex justify-end gap-2">
            <!-- For students/guests: show Pay button only for pending payments -->
            <template
              v-if="
                isMyPayments || (!isAdmin && (isStudent || authStore.user?.role?.name === 'guest'))
              "
            >
              <CButton
                v-if="payment.status === 'pending'"
                @click="openPaymentForm(payment)"
                :disabled="loading"
                size="sm"
              >
                <CreditCardIcon class="h-4 w-4" />
                {{ t("Pay") }}
              </CButton>
            </template>
            <!-- For admins: show edit and delete -->
            <template v-else>
              <CButton @click="editPayment(payment)" :disabled="loading">
                <PencilSquareIcon class="h-5 w-5" />
              </CButton>
              <CButton
                variant="danger"
                @click="confirmDeletePayment(payment.id)"
                :disabled="loading"
              >
                <TrashIcon class="h-5 w-5" />
              </CButton>
            </template>
          </div>
        </template>
      </CTable>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex flex-col items-center justify-between gap-4 md:flex-row"
        data-testid="pagination"
      >
        <div class="text-sm text-gray-700">
          <span v-if="total > 0">
            <span class="font-medium">{{ fromPayment }}</span> -
            <span class="font-medium">{{ toPayment }}</span> /
            <span class="font-medium">{{ total }}</span>
          </span>
          <span v-else>
            {{ t("No data available") }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <CButton
            :disabled="currentPage === 1"
            @click="currentPage--"
            :aria-label="t('Previous page')"
            class="h-10"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </CButton>
          <div class="flex items-center gap-1 text-sm">
            <div class="w-20">
              <CInput
                id="page-input"
                v-model.number="pageInput"
                type="number"
                :min="1"
                :max="totalPages"
                class="h-10 text-center"
                @keyup.enter="goToPage"
              />
            </div>
            <span>/ {{ totalPages }}</span>
          </div>
          <CButton
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            :aria-label="t('Next page')"
            class="h-10"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </CButton>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <!-- <CConfirmationModal v-if="!isMyPayments && showDeleteConfirmation"
      :message="t('Are you sure? This change is not recoverable')" :title="t('Delete Payment')"
      :confirm-text="t('Delete')" :cancel-text="t('Cancel')" @confirm="deletePayment"
      @cancel="showDeleteConfirmation = false" /> -->
    <CConfirmationModal
      v-if="showDeleteConfirmation"
      :message="t('Are you sure? This change is not recoverable')"
      :title="t('Delete Payment')"
      :confirm-text="t('Delete')"
      :cancel-text="t('Cancel')"
      @confirm="deletePayment"
      @cancel="showDeleteConfirmation = false"
    />
    <!-- <PaymentForm v-model="showForm" :selected-payment="isMyPayments ? null : selectedPayment"
      :currency-symbol="currencySymbol" :self-service="isMyPayments" @submit="handleFormSubmission" /> -->
    <PaymentForm
      v-model="showForm"
      :selected-payment="selectedPayment"
      :currency-symbol="currencySymbol"
      @submit="handleFormSubmission"
    />
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CTable from "@/components/CTable.vue";
import CButton from "@/components/CButton.vue";
import CConfirmationModal from "@/components/CConfirmationModal.vue";
import CSelect from "@/components/CSelect.vue";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import {
  PencilSquareIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  CreditCardIcon,
} from "@heroicons/vue/24/outline";
import { paymentService, configurationService } from "@/services/api";
import { usePaymentsStore } from "@/stores/payments";
import { usePaymentTypesStore } from "@/stores/paymentTypes";
import { useToast } from "@/composables/useToast";
import { useUserOptions } from "@/composables/useUserOptions";
import { formatCurrency } from "@/utils/formatters";

const authStore = useAuthStore();
const isAdmin = computed(
  () => authStore.user?.role?.name === "admin" || authStore.user?.role === "admin"
);
const isStudent = computed(() => authStore.user?.role?.name === "student");

const PaymentForm = defineAsyncComponent(() => import("./PaymentForm.vue"));

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// store
const paymentsStore = usePaymentsStore();
const paymentTypesStore = usePaymentTypesStore();
const settingsStore = useSettingsStore();
const { showError, showSuccess, showWarning } = useToast();

// State
const payments = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const total = ref<number>(0);
const startDate = ref<string>("");
const endDate = ref<string>("");
const searchTerm = ref<string>("");
const selectedRole = ref<string>("");
const selectedSemester = ref<string>("");
const selectedPaymentType = ref<string>("");
const selectedStatus = ref<string>("");
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);
const pageInput = ref(1);
const fromPayment = ref(0);
const toPayment = ref(0);
const showForm = ref<boolean>(false);
const selectedPayment = ref<any>(null);
const showDeleteConfirmation = ref<boolean>(false);
const paymentToDelete = ref<number | null>(null);
const currencySymbol = computed(() => settingsStore.publicSettings?.currency_symbol || "$");

// Determine if this page is used as "My Payments" for students/guests
const isMyPayments = computed(() => {
  // Check user role first - if student or guest, they should see "My Payments" view
  const userRole = authStore.user?.role?.name || authStore.user?.role;
  const isStudentOrGuest = userRole === "student" || userRole === "guest";

  // If user is student/guest and not admin, always show "My Payments" view
  if (isStudentOrGuest && !isAdmin.value) {
    return true;
  }

  // Otherwise, check route path and meta
  const path = route.path;
  const isMyPaymentsRoute = path === "/student-my-payments" || path === "/guest-my-payments";
  const metaMyPayments = route.meta && (route.meta as any).myPayments === true;

  return isMyPaymentsRoute || metaMyPayments;
});

// Determine if semester filtering should be shown
const showSemesterFilter = computed(() => {
  return isStudent.value || (isAdmin.value && selectedRole.value === "student");
});

// Role filter options
const roleOptions = [
  { value: "", name: t("All Roles") },
  { value: "student", name: t("Student") },
  { value: "guest", name: t("Guest") },
];

// Status filter options
const statusOptions = [
  { value: "", name: t("All Statuses") },
  { value: "pending", name: t("Pending") },
  { value: "processing", name: t("Processing") },
  { value: "completed", name: t("Completed") },
  { value: "failed", name: t("Failed") },
  { value: "cancelled", name: t("Cancelled") },
  { value: "refunded", name: t("Refunded") },
  { value: "expired", name: t("Expired") },
];

// Payment Type options - show human-readable names
const paymentTypeOptions = computed(() => {
  return [
    { value: "", name: t("All Payment Types") },
    ...paymentTypesStore.paymentTypes.map((type) => ({
      value: type.name,
      name: formatPaymentType(type.name),
    })),
  ];
});

// Generate semester options for the current and past few years
const semesterOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const options = [{ value: "", name: t("All Semesters"), startDate: "", endDate: "" }];

  // Generate semesters for current year and past 3 years
  for (let year = currentYear; year >= currentYear - 3; year--) {
    // Fall semester (September - December)
    options.push({
      value: `${year}-fall`,
      name: `${t("Fall")} ${year}`,
      startDate: `${year}-09-01`,
      endDate: `${year}-12-31`,
    });

    // Spring semester (January - May)
    options.push({
      value: `${year}-spring`,
      name: `${t("Spring")} ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-05-31`,
    });

    // Summer semester (June - August)
    options.push({
      value: `${year}-summer`,
      name: `${t("Summer")} ${year}`,
      startDate: `${year}-06-01`,
      endDate: `${year}-08-31`,
    });
  }

  return options;
});

// Function to get semester date range
const getSemesterDateRange = (semesterValue: string) => {
  const semester = semesterOptions.value.find((opt) => opt.value === semesterValue);
  if (semester?.startDate && semester.endDate) {
    return {
      startDate: semester.startDate,
      endDate: semester.endDate,
    };
  }
  return { startDate: "", endDate: "" };
};

// Table columns
const tableColumns = computed(() => {
  const base = [
    { key: "user", label: t("User"), class: "whitespace-nowrap" },
    { key: "amount", label: t("Amount") },
    { key: "payment_type", label: t("Type") },
    { key: "status", label: t("Status") },
    { key: "id", label: t("ID") },
    { key: "period", label: t("Period") },
  ];

  if (!isMyPayments.value) {
    base.splice(1, 0, { key: "role", label: t("Role") } as any);
    base.push({ key: "actions", label: t("Actions"), class: "text-right" } as any);
  } else {
    // For students/guests, add actions column for uploading bank check
    base.push({ key: "actions", label: t("Actions"), class: "text-right" } as any);
  }

  return base;
});

// Load payments data
const loadPayments = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      error.value = "Authentication required";
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
    if (selectedPaymentType.value) params.payment_type = selectedPaymentType.value;
    if (selectedStatus.value) params.status = selectedStatus.value;
    if (selectedRole.value && !isMyPayments.value) params.role = selectedRole.value;

    // Handle semester selection for students or admin filtering students
    if (showSemesterFilter.value && selectedSemester.value) {
      const dateRange = getSemesterDateRange(selectedSemester.value);
      params.date_from = dateRange.startDate;
      params.date_to = dateRange.endDate;
    }

    const response = isMyPayments.value
      ? await paymentService.getMyPayments(params)
      : await paymentService.getAll(params);

    if (response.data?.meta) {
      // Check for the new paginated structure
      // Create new array to ensure Vue reactivity detects changes
      payments.value = response.data.data.map((payment: any) => {
        if (payment.user && typeof payment.user.phoneNumbers === "string") {
          try {
            payment.user.phoneNumbers = JSON.parse(payment.user.phoneNumbers);
          } catch (e) {
            console.error("Failed to parse phoneNumbers", e);
          }
        }
        // Return a new object to ensure reactivity
        // Ensure payment_check is always a string or null, never a File object
        const cleanPayment = { ...payment };
        if (cleanPayment.paymentCheck && typeof cleanPayment.paymentCheck !== "string") {
          cleanPayment.paymentCheck = null;
        }
        if (cleanPayment.payment_check && typeof cleanPayment.payment_check !== "string") {
          cleanPayment.payment_check = null;
        }
        return cleanPayment;
      });
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
    error.value = "Failed to load payments";
    console.error("Error loading payments:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Default status filter is "All Statuses" (empty string) for all users
  selectedStatus.value = "";

  loadPayments();

  // Pre-load payment types for filters (students/guests can access this)
  try {
    await paymentTypesStore.fetchPaymentTypes();
  } catch (err) {
    console.error("Failed to pre-load payment types:", err);
    // Continue - payment types will be loaded when form opens
  }

  // Pre-load user options for admin users (needed for editing payments)
  // This ensures the edit form opens quickly with user options already available
  if (isAdmin.value) {
    const { loadUsers } = useUserOptions();
    try {
      // Load both students and guests in parallel (non-blocking)
      Promise.all([loadUsers("student"), loadUsers("guest")]).catch((err) => {
        console.error("Failed to pre-load user options:", err);
        // Continue - options will be loaded when form opens
      });
    } catch (err) {
      console.error("Failed to pre-load user options:", err);
      // Continue - options will be loaded when form opens
    }
  }

  pageInput.value = currentPage.value;
  paymentsStore.clearSelectedPayment();
});

// Watch filters and reload payments
watch(
  [
    searchTerm,
    startDate,
    endDate,
    selectedRole,
    selectedSemester,
    selectedPaymentType,
    selectedStatus,
  ],
  () => {
    currentPage.value = 1;
    pageInput.value = 1;
    loadPayments();
  }
);

// Reset semester selection when role changes
watch(selectedRole, (newRole) => {
  if (!showSemesterFilter.value) {
    selectedSemester.value = "";
  }
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

const formatPrice = (price: number): string => formatCurrency(price, currencySymbol.value, "USD");

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: t("Pending"),
    processing: t("Processing"),
    completed: t("Completed"),
    failed: t("Failed"),
    cancelled: t("Cancelled"),
    refunded: t("Refunded"),
    expired: t("Expired"),
  };
  return statusMap[status] || status;
};

const formatPaymentType = (paymentType: string | null | undefined): string => {
  if (!paymentType) return "-";

  // Map payment types to human-readable format
  const typeMap: Record<string, string> = {
    renting: t("Renting"),
    renting_semester: t("Renting"),
    catering: t("Catering"),
    catering_monthly: t("Catering"),
    "all-inclusive": t("All-Inclusive"),
    guest_stay: t("Guest Stay"),
  };

  // Return mapped value or capitalize the original
  return (
    typeMap[paymentType] ||
    paymentType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

const confirmDeletePayment = (id: number) => {
  paymentToDelete.value = id;
  showDeleteConfirmation.value = true;
};

const deletePayment = async () => {
  if (!paymentToDelete.value) return;

  try {
    await paymentService.delete(paymentToDelete.value);
    payments.value = payments.value.filter((p) => p.id !== paymentToDelete.value);
    showSuccess(t("Payment deleted successfully"));
  } catch (err) {
    showError(t("Failed to delete payment"));
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
    if (selectedPaymentType.value) filters.payment_type = selectedPaymentType.value;
    if (selectedStatus.value) filters.status = selectedStatus.value;
    if (selectedRole.value && !isMyPayments.value) filters.role = selectedRole.value;

    // Handle semester selection for students or admin filtering students
    if (showSemesterFilter.value && selectedSemester.value) {
      const dateRange = getSemesterDateRange(selectedSemester.value);
      filters.date_from = dateRange.startDate;
      filters.date_to = dateRange.endDate;
    }

    const response = await paymentService.export(filters);
    const blob = new Blob(
      [response && (response as any).data ? (response as any).data : response],
      { type: "text/csv" }
    ); // Changed to text/csv
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(t("Failed to export payments"));
    console.error("Error exporting payments:", err);
  }
}

// Modal and form handling
const showPaymentForm = async () => {
  // Ensure no payment is selected before opening the form
  selectedPayment.value = null;
  await nextTick();
  showForm.value = true;
};

const openPaymentForm = async (payment: any) => {
  // For students: open payment form to upload bank check
  // Only allow opening form for pending payments
  if (payment.status !== "pending") {
    return;
  }

  // Prevent opening if form is already open
  if (showForm.value) {
    return;
  }

  // Create a fresh copy of the payment object, ensuring payment_check is a string or null
  const cleanPayment = { ...payment };
  if (cleanPayment.paymentCheck && typeof cleanPayment.paymentCheck !== "string") {
    cleanPayment.paymentCheck = cleanPayment.paymentCheck || null;
  }
  if (cleanPayment.payment_check && typeof cleanPayment.payment_check !== "string") {
    cleanPayment.payment_check = cleanPayment.payment_check || null;
  }

  selectedPayment.value = cleanPayment;
  await nextTick();
  showForm.value = true;
};

const closePaymentForm = () => {
  // Clear selected payment first
  selectedPayment.value = null;
  // Then close form to prevent watchers from firing
  showForm.value = false;
};

const editPayment = async (payment: any) => {
  // For admins: edit payment
  selectedPayment.value = null;
  await nextTick();
  selectedPayment.value = payment;
  await nextTick();
  showForm.value = true;
};

const handleFormSubmission = async () => {
  // Close form first to prevent multiple submissions
  closePaymentForm();
  await nextTick();
  // Clear selected payment to ensure clean state
  selectedPayment.value = null;
  await nextTick();
  // Reload payments to get fresh data
  await loadPayments();
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
