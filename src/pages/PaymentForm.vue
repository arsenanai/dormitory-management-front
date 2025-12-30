<template>
  <CModal
    :model-value="isVisible"
    @update:model-value="closeModal"
    :title="selectedPayment ? t('Update Payment') : t('Create Payment')"
  >
    <form @submit.prevent="handleFormSubmit">
      <div class="space-y-4">
        <!-- User Type Selection (admin-only) -->
        <!-- <CSelect v-if="!props.selfService" id="user-type-select" v-model="formData.user_type" :label="t('Role')"
          :options="userTypeOptions" required /> -->
        <CSelect
          id="user-type-select"
          v-model="formData.user_type"
          :label="t('Role')"
          :options="userTypeOptions"
          required
        />

        <!-- User Selection (admin-only, for both student and guest) -->
        <!-- <CSelect v-if="!props.selfService" id="student-select" data-testid="payment-student-select"
          v-model="formData.user_id" :label="t('User')" :options="userOptions" :disabled="loadingUsers"
          :placeholder="loadingUsers ? t('Loading users...') : t('Select a user')" required /> -->
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

        <CInput v-model="formData.date_from" type="date" :label="t('From Date')" />
        <CInput v-model="formData.date_to" type="date" :label="t('To Date')" />

        <!-- Common Fields -->
        <CInput
          v-model="formData.deal_number"
          :label="t('Deal Number')"
          :placeholder="t('Enter Deal Number')"
        />
        <CInput v-model="formData.deal_date" type="date" :label="t('Deal Date')" />

        <!-- Amount with Currency -->
        <CInput
          v-model="formData.amount"
          data-testid="payment-amount-input"
          :label="`${t('Amount')} (${currencySymbol})`"
          type="number"
          step="0.01"
          min="0"
          required
        />
        <CTextarea
          id="dormitory-rules"
          :label="t('Bank requisites')"
          :model-value="settingsStore.publicSettings?.bank_requisites"
          readonly
          additionalClass="h-full flex-1"
          wrapperClass="flex flex-col flex-1"
        />
        <!-- <CFileInput id="payment-check-upload" :label="t('Payment Check')" :required="props.selfService"
          :allowed-extensions="['jpg', 'jpeg', 'png', 'pdf']" @change="handleFileChange"
          :file-path="formData.payment_check" /> -->
        <CFileInput
          id="payment-check-upload"
          :label="t('Payment Check')"
          :allowed-extensions="['jpg', 'jpeg', 'png', 'pdf']"
          @change="handleFileChange"
          :file-path="formData.payment_check"
        />
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <CButton @click="closeModal">
          {{ t("Cancel") }}
        </CButton>
        <CButton
          type="submit"
          variant="primary"
          data-testid="payment-submit-button"
          :loading="loading"
        >
          {{ selectedPayment ? t("Update") : t("Submit") }}
        </CButton>
      </div>
    </form>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";
import { paymentService, studentService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
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
  // When true, the form behaves in "self-service" mode for students/guests:
  // - hides role/user selection
  // - sends requests to /my-payments
  // - restricts creation to the authenticated user
  // selfService?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [];
}>();

const { t } = useI18n();
const { showSuccess, showError } = useToast();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();

const loading = ref(false);
const loadingUsers = ref(false);
const targetUser = ref(ref<User | null>(null));
const studentOptions = ref<Array<{ value: string; name: string }>>([]);
const guestOptions = ref<Array<{ value: string; name: string }>>([]);

const formData = ref({
  user_type: "student",
  user_id: "",
  amount: "",
  semester: "",
  deal_number: "",
  deal_date: "",
  date_from: "",
  date_to: "",
  payment_check: "",
} as { payment_check: string | File | null; [key: string]: any });

const userOptions = computed(() => {
  return formData.value.user_type === "student" ? studentOptions.value : guestOptions.value;
});

const userTypeOptions = [
  { value: "student", name: t("Student") },
  { value: "guest", name: t("Guest") },
];

const handleFileChange = (file: File | null | string) => {
  formData.value.payment_check = file;
};

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const closeModal = () => {
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
  formData.value = {
    user_type: "student",
    user_id: "",
    amount: "",
    semester: "",
    deal_number: "",
    deal_date: "",
    date_from: "",
    date_to: "",
    payment_check: null,
  };
};

const loadUsers = async (userType: "student" | "guest", ensureUserId?: number | string) => {
  const optionsRef = userType === "student" ? studentOptions : guestOptions;
  if (optionsRef.value.length > 0 && !ensureUserId) {
    return; // Already loaded
  }

  loadingUsers.value = true;
  try {
    let res: any;
    let service: any;
    let users: Array<any>;

    if (userType === "student") {
      service = studentService;
      if (studentOptions.value.length === 0) {
        res = await service.listAll();
        users = res?.data?.data || (Array.isArray(res.data) ? res.data : []);
        studentOptions.value = users
          .filter((u) => u && u.id)
          .map((u) => ({
            value: String(u.id),
            name: `${u.name || "Unknown"}${u.email ? ` (${u.email})` : ""}`,
          }));
      }
    } else {
      service = (await import("@/services/api")).guestService;
      if (guestOptions.value.length === 0) {
        res = await service.listAll();
        users = res?.data?.data || (Array.isArray(res.data) ? res.data : []);
        guestOptions.value = users
          .filter((u) => u && u.id)
          .map((u) => ({
            value: String(u.id),
            name: `${u.name || u.first_name || "Unknown"}${u.email ? ` (${u.email})` : ""}`,
          }));
      }
    }

    if (ensureUserId && !optionsRef.value.some((o) => o.value === String(ensureUserId))) {
      const u = await loadIndividual(ensureUserId, service);
      if (u && u.id) {
        // Construct name from parts if 'name' is not present
        const userName =
          u.name ||
          (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name || "User");
        const displayName = `${userName}${u.email ? ` (${u.email})` : ""}`;
        optionsRef.value.push({ value: String(u.id), name: displayName });
      }
    }
  } catch (err) {
    console.error(`Failed to load ${userType}s:`, err);
    if (userType === "student") studentOptions.value = [];
    else guestOptions.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

const loadIndividual = async (id: string | number, service: any) => {
  try {
    const one: any = await service.getById(Number(id));
    return one?.data;
  } catch (err) {
    console.error(`Failed to fetch individual ${id}:`, err);
    return null;
  }
};

const handleFormSubmit = async () => {
  // In self-service mode, enforce that a payment check is attached before submitting
  if (/*props.selfService &&*/ !formData.value.payment_check) {
    showError(t("Payment check is required"));
    return;
  }

  loading.value = true;
  try {
    const submissionData = new FormData();
    // For self-service submissions, backend determines user_id from auth token.
    // if (!props.selfService) {
    submissionData.append("user_id", formData.value.user_id);
    //}
    submissionData.append("amount", formData.value.amount);
    submissionData.append("date_from", formData.value.date_from);
    submissionData.append("date_to", formData.value.date_to);

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
      console.log("payment check as empty string");
    }
    submissionData.append("deal_number", formData.value.deal_number);
    submissionData.append("deal_date", formData.value.deal_date);
    if (props.selectedPayment) {
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
      const response = // props.selfService
        /*? await paymentService.createForSelf(submissionData)
        :*/ await paymentService.create(submissionData);
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
    const service =
      formData.value.user_type === "guest"
        ? (await import("@/services/api")).guestService
        : studentService;
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
  async (newValue) => {
    if (newValue) {
      const payment = props.selectedPayment;
      if (payment) {
        let userType: "student" | "guest" = "student"; // Default
        if (payment.user?.role) {
          if (typeof payment.user.role === "object" && payment.user.role.name) {
            userType = payment.user.role.name === "guest" ? "guest" : "student";
          } // else if (typeof payment.user.role === 'string') {
          //   userType = payment.user.role === 'guest' ? 'guest' : 'student';
          // }
        }

        // Set user_type first to prevent the watcher from re-triggering loadUsers
        formData.value.user_type = userType;

        await loadUsers(userType, payment.userId);

        const paymentDateFrom = payment.dateFrom ? payment.dateFrom.split("T")[0] : "";
        const paymentDateTo = payment.dateTo ? payment.dateTo.split("T")[0] : "";
        const detectedSemester = determineSemesterFromDates(paymentDateFrom, paymentDateTo);

        // Ensure payment_check is always a string or null, never a File object
        let paymentCheckValue: string | null = null;
        if (payment.paymentCheck) {
          // Only use if it's a string; ignore File objects
          paymentCheckValue =
            typeof payment.paymentCheck === "string" ? payment.paymentCheck : null;
        }

        formData.value = {
          user_type: userType,
          user_id: payment.userId || "",
          amount: payment.amount || "",
          deal_number: payment.dealNumber || "",
          deal_date: payment.dealDate ? payment.dealDate.split("T")[0] : "",
          date_from: paymentDateFrom,
          date_to: paymentDateTo,
          semester: detectedSemester,
          payment_check: paymentCheckValue,
        };
      } else {
        resetForm();
        await loadUsers(formData.value.user_type as "student" | "guest");
      }
    }
  }
);
</script>
