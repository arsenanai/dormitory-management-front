<template>
  <CModal
    :model-value="isVisible"
    @update:model-value="closeModal"
    :title="
      isRestrictedUser && selectedPayment
        ? t('Upload Bank Check')
        : selectedPayment
          ? t('Update Payment')
          : t('Create Payment')
    "
  >
    <form @submit.prevent="handleFormSubmit">
      <div class="space-y-4">
        <!-- Role and User Selection (admin-only) - Inline -->
        <div v-if="!isRestrictedUser" class="grid grid-cols-2 gap-4">
          <CSelect
            id="user-type-select"
            v-model="formData.user_type"
            :label="t('Role')"
            :options="userTypeOptions"
            required
          />
          <CSelect
            id="student-select"
            data-testid="payment-student-select"
            v-model="formData.user_id"
            :label="t('User')"
            :options="userOptions"
            :disabled="loadingUsers"
            :placeholder="loadingUsers ? t('Loading users...') : t('Select a user')"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <CInput
            v-model="formData.date_from"
            type="date"
            :label="t('From Date')"
            :readonly="isReadOnlyForStudent"
          />
          <CInput
            v-model="formData.date_to"
            type="date"
            :label="t('To Date')"
            :readonly="isReadOnlyForStudent"
          />
        </div>

        <!-- Common Fields -->
        <div class="grid grid-cols-2 gap-4">
          <CInput
            v-model="formData.deal_number"
            :label="t('Deal Number')"
            :placeholder="t('Enter Deal Number')"
            :readonly="isReadOnlyForStudent"
          />
          <CInput
            v-model="formData.deal_date"
            type="date"
            :label="t('Deal Date')"
            :readonly="isReadOnlyForStudent"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <CSelect
            id="payment-type-select"
            v-model="formData.payment_type"
            :label="t('Payment Type')"
            :options="paymentTypeOptions"
            :placeholder="
              paymentTypesStore.loading
                ? t('Loading...')
                : formData.payment_type || t('Select Payment Type')
            "
            :disabled="isReadOnlyForStudent"
          />
          <!-- Amount with Currency -->
          <CInput
            v-model="formData.amount"
            data-testid="payment-amount-input"
            :label="`${t('Amount')} (${currencySymbol})`"
            type="number"
            step="0.01"
            min="0"
            :required="!isReadOnlyForStudent"
            :readonly="isReadOnlyForStudent"
          />
        </div>
        <!-- Status field (admin-only) -->
        <CSelect
          v-if="!isRestrictedUser"
          id="status-select"
          v-model="formData.status"
          :label="t('Status')"
          :options="statusOptions"
          :placeholder="formData.status || t('Select Status')"
        />
        <CTextarea
          id="dormitory-rules"
          :label="t('Bank requisites')"
          :model-value="settingsStore.publicSettings?.bank_requisites"
          readonly
          additionalClass="h-full flex-1"
          wrapperClass="flex flex-col flex-1"
        />
        <CFileInput
          id="payment-check-upload"
          :label="t('Payment Check')"
          :required="isRestrictedUser && props.selectedPayment"
          :allowed-extensions="['jpg', 'jpeg', 'png', 'pdf']"
          @change="handleFileChange"
          :file-path="typeof formData.payment_check === 'string' ? formData.payment_check : null"
        />
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <CButton @click="closeModal">
          {{ t("Cancel") }}
        </CButton>
        <CButton
          v-if="!isRestrictedUser || !props.selectedPayment"
          type="submit"
          variant="primary"
          data-testid="payment-submit-button"
          :loading="loading"
        >
          {{ selectedPayment ? t("Update") : t("Submit") }}
        </CButton>
        <CButton
          v-if="!!(isRestrictedUser && props.selectedPayment)"
          type="submit"
          variant="primary"
          data-testid="payment-submit-button"
          :loading="loading"
        >
          {{ t("Upload Bank Check") }}
        </CButton>
      </div>
    </form>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";
import { paymentService, studentService, guestService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { usePaymentTypesStore } from "@/stores/paymentTypes";
import { useUserOptions } from "@/composables/useUserOptions";
import CModal from "@/components/CModal.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CTextarea from "@/components/CTextarea.vue";
import CButton from "@/components/CButton.vue";
import CFileInput from "@/components/CFileInput.vue";
import { User } from "@/models/User";

const props = defineProps<{
  modelValue: boolean;
  selectedPayment?: any | null;
  currencySymbol: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [];
}>();

const { t } = useI18n();
const { showSuccess, showError, showWarning } = useToast();
const settingsStore = useSettingsStore();
const paymentTypesStore = usePaymentTypesStore();
const authStore = useAuthStore();

const loading = ref(false);
const isLoadingPayment = ref(false); // Flag to prevent watchers from interfering when loading existing payment
const isCurrentlyLoading = ref(false); // Track if we're currently loading to prevent multiple executions
const targetUser = ref<User | null>(null);

// Use shared user options composable
const {
  studentOptions,
  guestOptions,
  loadingStudents,
  loadingGuests,
  loadUsers: loadUsersFromComposable,
} = useUserOptions();

// Expose loadingUsers for template compatibility
const loadingUsers = computed(() => loadingStudents.value || loadingGuests.value);

// Alias used throughout this file
const loadUsers = loadUsersFromComposable;

const formData = ref({
  user_type: "student",
  user_id: "",
  amount: "",
  semester: "",
  deal_number: "",
  deal_date: "",
  date_from: "",
  date_to: "",
  payment_type: "",
  payment_check: "",
  status: "",
} as { payment_check: string | File | null; [key: string]: any });

const paymentTypeOptions = computed(() => {
  const options = paymentTypesStore.paymentTypes.map((t) => ({
    value: t.name,
    name: t.name,
  }));

  // If we have a payment type value but it's not in the options (e.g., payment types not loaded yet or API failed),
  // add it to the options so it can be displayed (especially important for students who can't load payment types)
  const currentPaymentType = formData.value.payment_type;
  if (currentPaymentType && typeof currentPaymentType === "string" && currentPaymentType.trim()) {
    const trimmedType = currentPaymentType.trim();
    // Check if it's already in options (case-insensitive comparison)
    const exists = options.find((o) => String(o.value).toLowerCase() === trimmedType.toLowerCase());
    if (!exists) {
      options.unshift({
        // Add at the beginning so it's visible
        value: trimmedType,
        name: trimmedType,
      });
    }
  }

  return options;
});

const userOptions = computed(() => {
  return formData.value.user_type === "student" ? studentOptions.value : guestOptions.value;
});

const isRestrictedUser = computed(() => {
  const role = authStore.userRole;
  return role === "student" || role === "guest";
});

// Computed property for readonly/disabled state for students viewing their own payments
const isReadOnlyForStudent = computed(() => {
  return !!(isRestrictedUser.value && props.selectedPayment);
});

const userTypeOptions = [
  { value: "student", name: t("Student") },
  { value: "guest", name: t("Guest") },
];

// Status options for admin
const statusOptions = [
  { value: "pending", name: t("Pending") },
  { value: "processing", name: t("Processing") },
  { value: "completed", name: t("Completed") },
  { value: "failed", name: t("Failed") },
  { value: "cancelled", name: t("Cancelled") },
  { value: "refunded", name: t("Refunded") },
  { value: "expired", name: t("Expired") },
];

const handleFileChange = (file: File | null | string) => {
  // Only accept File objects or null, never strings (strings are for display only)
  if (file instanceof File) {
    formData.value.payment_check = file;
  } else if (file === null) {
    formData.value.payment_check = null;
  }
  // Ignore string values - they're for display only
};

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const closeModal = () => {
  // Reset form data when closing to prevent stale File objects
  formData.value.payment_check = null;
  isVisible.value = false;
};

const getSemesterDates = (semester: string): { from: string; to: string } => {
  const [year, type] = semester.split("-");
  const yearNum = parseInt(year);

  if (type === "fall") {
    return { from: `${yearNum}-09-01`, to: `${yearNum}-12-31` };
  }
  if (type === "spring") {
    return { from: `${yearNum}-01-01`, to: `${yearNum}-05-31` };
  }
  if (type === "summer") {
    return { from: `${yearNum}-06-01`, to: `${yearNum}-08-31` };
  }

  return { from: "", to: "" }; // fallback
};

const determineSemesterFromDates = (dateFrom: string, dateTo: string): string => {
  if (!dateFrom || !dateTo) return "";

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  // Generate semester options for a reasonable range (e.g., current year +/- 1)
  const currentYear = new Date().getFullYear();
  const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];

  for (const year of yearsToCheck) {
    const semesters = ["spring", "summer", "fall"];
    for (const type of semesters) {
      const semesterKey = `${year}-${type}`;
      const { from, to } = getSemesterDates(semesterKey);
      if (
        fromDate.toISOString().split("T")[0] === from &&
        toDate.toISOString().split("T")[0] === to
      ) {
        return semesterKey;
      }
    }
  }
  return ""; // No exact match found
};

const resetForm = () => {
  // Ensure payment_check is explicitly set to null (not File object)
  formData.value = {
    user_type: "student",
    user_id: "",
    amount: "",
    semester: "",
    deal_number: "",
    deal_date: "",
    date_from: "",
    date_to: "",
    payment_type: "",
    payment_check: null as string | File | null,
    status: "",
  };
};

const loadIndividual = async (id: string | number, service: any) => {
  // If the requested ID matches the currently authenticated user, use the cached user data
  const currentUser = authStore.user;
  if (Number(id) === currentUser?.id) {
    return currentUser;
  }
  // Otherwise, fetch via the service (admin or other users)
  try {
    const one: any = await service.getById(Number(id));
    return one?.data;
  } catch (err) {
    console.error(`Failed to fetch individual ${id}:`, err);
    return null;
  }
};

const handleFormSubmit = async () => {
  // For students/guests with selectedPayment: only allow bank check upload
  if (isRestrictedUser.value && props.selectedPayment) {
    if (!formData.value.payment_check || !(formData.value.payment_check instanceof File)) {
      showError(t("Please select a bank check file to upload"));
      return;
    }

    loading.value = true;
    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        "payment_check",
        formData.value.payment_check,
        formData.value.payment_check.name
      );

      const response = await paymentService.updateMyPayment(
        props.selectedPayment.id,
        formDataToSend
      );
      const message = response?.data?.message || response?.message;
      showSuccess(t("Bank check uploaded successfully"));
      showWarning(message || t("Payment will be validated soon"));
      // Reset payment_check to prevent File object from persisting
      formData.value.payment_check = null;
      emit("submit");
      closeModal();
    } catch (err: any) {
      showError(err.response?.data?.message || t("Failed to upload bank check"));
    } finally {
      loading.value = false;
    }
    return;
  }

  // Enforce payment check for restricted users (Student/Guest) when creating new payments
  if (isRestrictedUser.value && !props.selectedPayment && !formData.value.payment_check) {
    showError(t("Payment check is required"));
    return;
  }

  loading.value = true;
  try {
    const submissionData = new FormData();
    submissionData.append("user_id", formData.value.user_id);
    submissionData.append("amount", formData.value.amount);
    submissionData.append("date_from", formData.value.date_from);
    submissionData.append("date_to", formData.value.date_to);
    if (formData.value.payment_type) {
      submissionData.append("payment_type", formData.value.payment_type);
    }

    if (formData.value.payment_check instanceof File) {
      // 1. New file is uploaded
      submissionData.append(
        "payment_check",
        formData.value.payment_check,
        formData.value.payment_check.name
      );
    } else if (formData.value.payment_check === null) {
      // 2. File is marked for deletion, send an empty string.
      submissionData.append("payment_check", "");
    }
    submissionData.append("deal_number", formData.value.deal_number);
    submissionData.append("deal_date", formData.value.deal_date);
    // Add status field for admin users
    if (!isRestrictedUser.value && formData.value.status) {
      submissionData.append("status", formData.value.status);
    }
    if (props.selectedPayment) {
      // Only admins can update payments
      // When sending FormData with a file for an update, we must use POST
      // and add a `_method` field to tell Laravel to treat it as a PUT request.
      // This is because PHP doesn't natively parse multipart/form-data for PUT requests.
      submissionData.append("_method", "PUT");
      const response = await paymentService.update(props.selectedPayment.id, submissionData);
      showSuccess(t("Payment updated successfully"));
      // After a successful update, if the same payment is being edited,
      // update its `payment_check` with the path returned from the server.
      // This prevents passing a stale `File` object on subsequent edits.
      if (response.data?.data?.paymentCheck) {
        formData.value.payment_check = response.data.data.paymentCheck;
      }
    } else {
      const response = isRestrictedUser.value
        ? await paymentService.createMyPayment(submissionData)
        : await paymentService.create(submissionData);

      showSuccess(t("Payment created successfully"));
      // After creating, update payment_check with the path from response to prevent File object issues
      if (response.data?.data?.paymentCheck) {
        formData.value.payment_check = response.data.data.paymentCheck;
      } else if (formData.value.payment_check instanceof File) {
        // If no path returned but we had a file, reset it to null to prevent issues
        formData.value.payment_check = null;
      }
    }
    emit("submit");
    closeModal();
  } catch (err) {
    console.log("submitting error", err);
    showError(
      props.selectedPayment ? t("Failed to update payment") : t("Failed to create payment")
    );
  } finally {
    loading.value = false;
  }
};

const numberOfNightsBetween = (date1: string | Date, date2: string | Date): number => {
  // Ensure both are Date objects
  const start = typeof date1 === "string" ? new Date(date1) : date1;
  const end = typeof date2 === "string" ? new Date(date2) : date2;

  // Normalize to midnight
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffDays = (end.getTime() - start.getTime()) / 86400000;
  return diffDays > 0 ? diffDays : 0;
};

watch(
  () => formData.value.user_type,
  (newUserType) => {
    // Don't clear user_id if we're currently loading a payment (isLoadingPayment flag prevents this)
    // This prevents the watcher from clearing user_id when we set it during payment hydration
    if (isLoadingPayment.value) {
      return;
    }
    formData.value.user_id = "";
    loadUsers(newUserType as "student" | "guest");
  }
);

watch(
  () => formData.value.user_id,
  async (newUserId) => {
    if (!newUserId || newUserId === "") {
      targetUser.value = null;
      return;
    }
    // formData.value.amount = '0';
    const service = formData.value.user_type === "guest" ? guestService : studentService;
    targetUser.value = await loadIndividual(newUserId, service);
  }
);

// Watch for semester changes to update date_from and date_to for students
watch(
  () => formData.value.semester,
  (newSemester) => {
    if (formData.value.user_type === "student" && newSemester) {
      const { from, to } = getSemesterDates(newSemester);
      formData.value.date_from = from;
      formData.value.date_to = to;
    }
  }
);

watch(
  () => formData.value.date_to,
  (newDateTo) => {
    // Don't recalculate amount when loading an existing payment
    if (isLoadingPayment.value) {
      return;
    }
    if (formData.value.date_from && newDateTo) {
      if (formData.value.user_type === "guest" && targetUser.value) {
        const nights = numberOfNightsBetween(
          new Date(formData.value.date_from),
          new Date(formData.value.date_to)
        );
        const rate = Number(targetUser.value?.room?.room_type?.daily_rate);
        formData.value.amount = nights * rate + "";
      } else if (targetUser.value) {
        formData.value.amount = Number(targetUser.value?.room?.room_type?.semester_rate) + "";
        console.log("amount", formData.value.amount);
      }
    }
  }
);

watch(
  () => props.modelValue,
  async (newValue, oldValue) => {
    // Prevent multiple simultaneous executions
    if (newValue === oldValue || isCurrentlyLoading.value) {
      return;
    }

    if (newValue) {
      isCurrentlyLoading.value = true;
      try {
        const payment = props.selectedPayment;

        // Reset form data first to clear any stale File objects
        formData.value.payment_check = null;

        // Set flag to prevent watchers from interfering
        isLoadingPayment.value = !!payment;

        // Fetch payment types when modal opens
        // For students/guests, this might fail with 403, but that's okay - we'll use the payment type from the payment object
        if (!isRestrictedUser.value || !payment) {
          // Only fetch for admins or when creating new payments (not viewing existing)
          try {
            await paymentTypesStore.fetchPaymentTypes();
          } catch (err: any) {
            console.error("Failed to fetch payment types:", err);
            if (err?.response?.status === 403 && !isRestrictedUser.value) {
              showError(t("You don't have permission to view payment types"));
            }
          }
        }
        // For students viewing their own payment, we don't need to fetch all payment types
        // The payment type will be displayed from the payment object itself

        if (payment) {
          let userType: "student" | "guest" = "student"; // Default
          if (payment.user?.role) {
            if (typeof payment.user.role === "object" && payment.user.role.name) {
              userType = payment.user.role.name === "guest" ? "guest" : "student";
            }
          }

          const userIdString = payment.userId ? String(payment.userId) : "";

          // Set isLoadingPayment flag BEFORE changing user_type to prevent watcher from clearing user_id
          isLoadingPayment.value = true;

          // First, quickly ensure the specific user is in options (don't wait for full list)
          // This allows formData to be set immediately with the correct user_id
          // The composable handles checking if user is already in options
          await loadUsers(userType, payment.userId);

          // Wait for nextTick to ensure reactive updates are complete
          await nextTick();

          // Parse dates
          const paymentDateFrom = payment.dateFrom ? payment.dateFrom.split("T")[0] : "";
          const paymentDateTo = payment.dateTo ? payment.dateTo.split("T")[0] : "";
          const detectedSemester = determineSemesterFromDates(paymentDateFrom, paymentDateTo);

          // Ensure payment_check is always a string or null, never a File object
          let paymentCheckValue: string | null = null;
          // Check both camelCase and snake_case, and ensure it's a string
          const paymentCheck = payment.paymentCheck || payment.payment_check;
          if (paymentCheck && typeof paymentCheck === "string") {
            paymentCheckValue = paymentCheck;
          } else if (paymentCheck && typeof paymentCheck !== "string") {
            // If it's not a string (e.g., File object), set to null
            paymentCheckValue = null;
          }

          // Get payment type - handle both camelCase (from API) and snake_case (from model)
          const paymentTypeValue = payment.paymentType || payment.payment_type || "";

          // Format amount - ensure it's a string and properly formatted
          // IMPORTANT: Use the payment amount directly, don't let watchers override it
          let amountValue = "";
          if (payment.amount !== null && payment.amount !== undefined) {
            // Convert to number first to handle string numbers, then format to 2 decimal places
            const numAmount =
              typeof payment.amount === "string"
                ? parseFloat(payment.amount)
                : Number(payment.amount);
            if (!isNaN(numAmount)) {
              amountValue = numAmount.toFixed(2);
            }
          }

          // Get status value from payment
          const statusValue = payment.status || "";

          // Set user_type FIRST, wait for watcher to complete (it will skip clearing due to isLoadingPayment flag)
          formData.value.user_type = userType || "student";
          await nextTick(); // Wait for user_type watcher to complete

          // Now set the rest of the fields, including user_id
          formData.value = {
            user_type: userType || "student",
            user_id: userIdString,
            amount: amountValue || "0.00", // Use payment amount, not calculated amount
            deal_number: payment.dealNumber || "",
            deal_date: payment.dealDate ? payment.dealDate.split("T")[0] : "",
            date_from: paymentDateFrom || "",
            date_to: paymentDateTo || "",
            payment_type: paymentTypeValue || "",
            semester: detectedSemester || "",
            payment_check: (typeof paymentCheckValue === "string" ? paymentCheckValue : null) as
              | string
              | File
              | null,
            status: statusValue,
          };

          // After setting all fields, ensure targetUser is set to prevent amount recalculation
          if (payment.userId) {
            const service = userType === "guest" ? guestService : studentService;
            targetUser.value = await loadIndividual(String(payment.userId), service);
          }

          // Debug log in development
          if (import.meta.env.DEV) {
            console.log("PaymentForm: Loading payment with all fields", {
              paymentId: payment.id,
              formData: formData.value,
              originalPayment: {
                amount: payment.amount,
                paymentType: payment.paymentType,
                dealNumber: payment.dealNumber,
                dateFrom: payment.dateFrom,
                dateTo: payment.dateTo,
              },
            });
          }

          // Clear the loading flag after all data is set to allow normal watcher behavior
          await nextTick();
          isLoadingPayment.value = false;

          // Load all users in the background (non-blocking) after formData is set
          // This ensures the dropdown has all options available, but doesn't block form population
          loadUsers(userType).catch((err) => {
            console.error(`Failed to load ${userType}s in background:`, err);
          });

          // Ensure payment type is in options after formData is set
          // Use nextTick to ensure reactive updates are complete
          await nextTick();
          if (
            paymentTypeValue &&
            !paymentTypeOptions.value.find((o) => o.value === paymentTypeValue)
          ) {
            // This should be handled by the computed property, but force a reactive update
            console.warn(
              "PaymentForm: Payment type not found in options, but should be added by computed property",
              {
                paymentTypeValue,
                availableOptions: paymentTypeOptions.value.map((o) => o.value),
              }
            );
          }
        } else {
          // Clear loading flag for new payments
          isLoadingPayment.value = false;

          // Logic for creating a new payment
          if (isRestrictedUser.value) {
            // Auto-populate for restricted users
            const role = authStore.userRole;
            // ensure valid role for form
            const userType = role === "guest" ? "guest" : "student";

            resetForm(); // Reset first
            formData.value.user_type = userType;
            // User ID is string in formData
            if (authStore.user?.id) {
              formData.value.user_id = String(authStore.user.id);
            }
          } else {
            // Admin logic
            resetForm();
            await loadUsers(formData.value.user_type as "student" | "guest");
          }
        }
      } finally {
        isCurrentlyLoading.value = false;
      }
    }
  }
);
</script>
