<template>
  <CModal :model-value="isVisible" @update:model-value="closeModal"
    :title="selectedPayment ? t('Update Payment') : t('Create Payment')">
    <form @submit.prevent="handleFormSubmit">
      <div class="space-y-4">
        <!-- User Type Selection -->
        <CSelect id="user-type-select" v-model="formData.user_type" :label="t('Role')" :options="userTypeOptions"
          required />

        <!-- User Selection (Common for both student and guest) -->
        <CSelect id="student-select" data-testid="payment-student-select" v-model="formData.user_id" :label="t('User')"
          :options="userOptions" :disabled="loadingUsers"
          :placeholder="loadingUsers ? t('Loading users...') : t('Select a user')" required />


        <CInput v-model="formData.date_from" type="date" :label="t('From Date')" />
        <CInput v-model="formData.date_to" type="date" :label="t('To Date')" />

        <!-- Common Fields -->
        <CInput v-model="formData.deal_number" :label="t('Deal Number')" :placeholder="t('Enter Deal Number')" />
        <CInput v-model="formData.deal_date" type="date" :label="t('Deal Date')" />

        <!-- Amount with Currency -->
        <CInput v-model="formData.amount" data-testid="payment-amount-input"
          :label="`${t('Amount')} (${currencySymbol})`" type="number" step="0.01" min="0" required />
        <CFileInput id="payment-check-upload" :label="t('Payment Check')" @change="handleFileChange"
          :file-path="selectedPayment?.payment_check" />
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <CButton @click="closeModal">
          {{ t('Cancel') }}
        </CButton>
        <CButton type="submit" variant="primary" data-testid="payment-submit-button" :loading="loading">
          {{ selectedPayment ? t('Update') : t('Submit') }}
        </CButton>
      </div>
    </form>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { paymentService, studentService } from '@/services/api';
import { useToast } from '@/composables/useToast';
import CModal from '@/components/CModal.vue';
import CInput from '@/components/CInput.vue';
import CSelect from '@/components/CSelect.vue';
import CButton from '@/components/CButton.vue';
import CFileInput from '@/components/CFileInput.vue';

const props = defineProps<{
  modelValue: boolean;
  selectedPayment?: any | null;
  currencySymbol: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'submit': [];
}>();

const { t } = useI18n();
const { showSuccess, showError } = useToast();

const loading = ref(false);
const loadingUsers = ref(false);
const studentOptions = ref<Array<{ value: string; name: string }>>([]);
const guestOptions = ref<Array<{ value: string; name: string }>>([]);

const formData = ref({
  user_type: 'student',
  user_id: "",
  amount: "",
  semester: "",
  deal_number: "",
  deal_date: "",
  date_from: "",
  date_to: "",
  payment_check: null as File | null,
});

const userOptions = computed(() => {
  return formData.value.user_type === 'student' ? studentOptions.value : guestOptions.value;
});

const userTypeOptions = [
  { value: 'student', name: t('Student') },
  { value: 'guest', name: t('Guest') },
];

const handleFileChange = (file: File | null) => { formData.value.payment_check = file; };

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const closeModal = () => {
  isVisible.value = false;
};

const semesterOptions = computed(() => {
  const year = new Date().getFullYear();
  return [
    { value: `${year}-spring`, name: `${t('Spring')} ${year}` },
    { value: `${year}-summer`, name: `${t('Summer')} ${year}` },
    { value: `${year}-fall`, name: `${t('Fall')} ${year}` },
    { value: `${year + 1}-spring`, name: `${t('Spring')} ${year + 1}` },
  ];
});

const getSemesterDates = (semester: string): { from: string, to: string } => {
  const [year, type] = semester.split('-');
  const yearNum = parseInt(year);
  if (type === 'fall') {
    return { from: `${yearNum}-09-01`, to: `${yearNum}-12-31` };
  }
  if (type === 'spring') {
    return { from: `${yearNum}-01-01`, to: `${yearNum}-05-31` };
  }
  if (type === 'summer') {
    return { from: `${yearNum}-06-01`, to: `${yearNum}-08-31` };
  }
  return { from: '', to: '' };
};

const determineSemesterFromDates = (dateFrom: string, dateTo: string): string => {
  if (!dateFrom || !dateTo) return '';

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  // Generate semester options for a reasonable range (e.g., current year +/- 1)
  const currentYear = new Date().getFullYear();
  const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];

  for (const year of yearsToCheck) {
    const semesters = ['spring', 'summer', 'fall'];
    for (const type of semesters) {
      const semesterKey = `${year}-${type}`;
      const { from, to } = getSemesterDates(semesterKey);
      const semesterFromDate = new Date(from);
      const semesterToDate = new Date(to);

      if (fromDate.getTime() === semesterFromDate.getTime() && toDate.getTime() === semesterToDate.getTime()) {
        return semesterKey;
      }
    }
  }
  return ''; // No exact match found
};

const resetForm = () => {
  formData.value = {
    user_type: 'student',
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

const loadUsers = async (userType: 'student' | 'guest', ensureUserId?: number | string) => {
  const optionsRef = userType === 'student' ? studentOptions : guestOptions;
  if (optionsRef.value.length > 0 && !ensureUserId) {
    return; // Already loaded
  }

  loadingUsers.value = true;
  try {
    let res: any;
    let service: any;
    let users: Array<any>;

    if (userType === 'student') {
      service = studentService;
      if (studentOptions.value.length === 0) {
        res = await service.listAll();
        users = res?.data?.data || (Array.isArray(res.data) ? res.data : []);
        studentOptions.value = users.filter(u => u && u.id).map(u => ({
          value: String(u.id),
          name: `${u.name || 'Unknown'}${u.email ? ` (${u.email})` : ''}`
        }));
      }
    } else {
      service = (await import('@/services/api')).guestService;
      if (guestOptions.value.length === 0) {
        res = await service.listAll();
        users = res?.data?.data || (Array.isArray(res.data) ? res.data : []);
        guestOptions.value = users.filter(u => u && u.id).map(u => ({
          value: String(u.id),
          name: `${u.name || u.first_name || 'Unknown'}${u.email ? ` (${u.email})` : ''}`
        }));
      }
    }

    if (ensureUserId && !optionsRef.value.some(o => o.value === String(ensureUserId))) {
      try {
        const one: any = await service.getById(Number(ensureUserId));
        const u = one?.data;
        if (u && u.id) {
          // Construct name from parts if 'name' is not present
          const userName = u.name || (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name || 'User');
          const displayName = `${userName}${u.email ? ` (${u.email})` : ''}`;
          optionsRef.value.push({ value: String(u.id), name: displayName });
        }
      } catch (err) {
        console.error(`Failed to fetch individual ${userType}:`, err);
      }
    }
  } catch (err) {
    console.error(`Failed to load ${userType}s:`, err);
    if (userType === 'student') studentOptions.value = [];
    else guestOptions.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

const handleFormSubmit = async () => {
  loading.value = true;
  try {
    const submissionData = new FormData();
    submissionData.append('user_id', formData.value.user_id);
    submissionData.append('amount', formData.value.amount);
    submissionData.append('date_from', formData.value.date_from);
    submissionData.append('date_to', formData.value.date_to);
    if (formData.value.payment_check instanceof File) {
      console.log('Uploading payment check:', formData.value.payment_check.name);
      submissionData.append('payment_check', formData.value.payment_check);
    }
    submissionData.append('deal_number', formData.value.deal_number);
    submissionData.append('deal_date', formData.value.deal_date);
    if (props.selectedPayment) {
      // When sending FormData with a file for an update, we must use POST
      // and add a `_method` field to tell Laravel to treat it as a PUT request.
      // This is because PHP doesn't natively parse multipart/form-data for PUT requests.
      submissionData.append('_method', 'PUT');
      // The service needs to know to use POST for the update call
      // The `update` method in api.ts will need to be adjusted.
      await paymentService.update(props.selectedPayment.id, submissionData);
      showSuccess(t('Payment updated successfully'));
    } else {
      await paymentService.create(submissionData);
      showSuccess(t('Payment created successfully'));
    }
    emit('submit');
    closeModal();
  } catch (err) {
    showError(props.selectedPayment ? t('Failed to update payment') : t('Failed to create payment'));
  } finally {
    loading.value = false;
  }
};

watch(() => formData.value.user_type, (newUserType) => {
  formData.value.user_id = "";
  loadUsers(newUserType as 'student' | 'guest');
});

// Watch for semester changes to update date_from and date_to for students
watch(() => formData.value.semester, (newSemester) => {
  if (formData.value.user_type === 'student' && newSemester) {
    const { from, to } = getSemesterDates(newSemester);
    formData.value.date_from = from;
    formData.value.date_to = to;
  }
});

watch(() => props.modelValue, async (newValue) => {
  if (newValue) {

    const payment = props.selectedPayment;
    if (payment) {
      let userType: 'student' | 'guest' = 'student'; // Default
      if (payment.user?.role) {
        if (typeof payment.user.role === 'object' && payment.user.role.name) {
          userType = payment.user.role.name === 'guest' ? 'guest' : 'student';
        } else if (typeof payment.user.role === 'string') {
          userType = payment.user.role === 'guest' ? 'guest' : 'student';
        }
      }

      // Set user_type first to prevent the watcher from re-triggering loadUsers
      formData.value.user_type = userType;

      await loadUsers(userType, payment.user_id || payment.user?.id);

      const paymentDateFrom = payment.date_from ? payment.date_from.split('T')[0] : "";
      const paymentDateTo = payment.date_to ? payment.date_to.split('T')[0] : "";
      const detectedSemester = determineSemesterFromDates(paymentDateFrom, paymentDateTo);

      formData.value = {
        user_type: userType,
        user_id: payment.user_id || payment.user?.id ? String(payment.user_id || payment.user?.id) : "",
        amount: payment.amount?.toString() || "",
        deal_number: payment.deal_number || "",
        deal_date: payment.deal_date ? payment.deal_date.split('T')[0] : "",
        date_from: paymentDateFrom,
        date_to: paymentDateTo,
        semester: detectedSemester,
        payment_check: null,
      };
    } else {
      resetForm();
      await loadUsers(formData.value.user_type as 'student' | 'guest');
    }
  }
});

</script>