<template>
  <form @submit.prevent="handleRegistration" novalidate class="min-h-[60vh] flex flex-col items-stretch h-full">
    <CStepper v-model="currentStep" @finish="handleRegistration">

      <!-- Step 1: Gender -->
      <CStep :title="t('Gender')" :validator="() => isGenderStepValid">
        <div class="grid grid-cols-1 gap-2">
          <div class="flex items-start gap-4">
            <div v-if="user.student_profile" class="flex-grow">
              <CSelect id="registration-gender" v-model="user.student_profile.gender" :options="genderOptions"
                :label="t('Gender')" required :validationState="registrationValidationState.gender"
                :validationMessage="registrationValidationMessage.gender" />
            </div>
          </div>
          <div v-if="loadingDormitories" class="flex justify-center mt-8">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
          <div v-if="user.student_profile?.gender && !hasAvailableDormitories && !loadingDormitories"
            class="text-center text-red-500 p-4">
            {{ t('No Dormitories are available for selected gender at this time.') }}
          </div>
        </div>
      </CStep>

      <!-- Step 2: Account -->
      <CStep :title="t('Account')" :validator="() => isAccountStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4">
          <CInput id="registration-iin" v-model="user.student_profile.iin" type="search" :label="t('IIN')" required
            :validationState="registrationValidationState.iin" :validationMessage="registrationValidationMessage.iin"
            pattern="\d{12}" />
          <CInput id="registration-email" v-model="user.email" type="email" :label="t('Login Email')"
            :placeholder="emailPlaceholder" required :validationState="registrationValidationState.email"
            :validationMessage="registrationValidationMessage.email" />
          <CInput id="registration-password" v-model="user.password" type="password" :label="t('Password')" required
            :validationState="registrationValidationState.password"
            :validationMessage="registrationValidationMessage.password" pattern=".{6,}" />
          <CInput id="registration-confirm-password" v-model="user.password_confirmation" type="password"
            :label="t('Confirm Password')" required :validationState="registrationValidationState.confirm_password"
            :validationMessage="registrationValidationMessage.confirm_password" pattern=".{6,}" />
        </div>
      </CStep>

      <!-- Step 3: Personal Details -->
      <CStep :title="t('Personal Information')" :validator="() => isPersonalDetailsStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4" data-testid="personal-info-step">
          <CInput id="registration-first-name" v-model="user.first_name" type="text" :label="t('Name')"
            :placeholder="t('Enter Name')" required :validationState="registrationValidationState.first_name"
            :validationMessage="registrationValidationMessage.first_name" />
          <CInput id="registration-last-name" v-model="user.last_name" type="text" :label="t('Surname')"
            :placeholder="t('Enter Surname')" required :validationState="registrationValidationState.last_name"
            :validationMessage="registrationValidationMessage.last_name" />
          <CInput id="registration-country" v-model="user.student_profile.country" type="text" :label="t('Country')"
            :placeholder="t('Enter Country')" />
          <CInput id="registration-region" v-model="user.student_profile.region" type="text" :label="t('Region')"
            :placeholder="t('Enter Region')" :disabled="!user.student_profile.country" />
          <CInput id="registration-city" v-model="user.student_profile.city" type="text" :label="t('City')"
            :placeholder="t('Enter City')" :disabled="!user.student_profile.region" />
        </div>
      </CStep>

      <!-- Step 4: Phone Numbers -->
      <CStep :title="t('Phone Numbers')" :validator="() => isPhoneNumbersStepValid">
        <div class="lg:col-span-2">
          <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-end">
            <div v-if="user.phone_numbers" class="flex flex-col items-stretch gap-2">
              <div v-for="(phone, index) in user.phone_numbers" :key="index" class="flex items-center gap-2">
                <CInput :id="`phone-number-${index}`" v-model="user.phone_numbers[index]" type="tel"
                  :placeholder="t('Enter Phone Number')" class="flex-grow" />
                <CButton type="button" v-if="user.phone_numbers.length > 1" @click="removePhoneField(index)"
                  class="py-2.5">
                  <TrashIcon class="h-5 w-5 text-red-600" />
                </CButton>
                <CButton type="button" @click="addPhoneField" class="py-2.5"
                  v-if="index === user.phone_numbers.length - 1 && user.phone_numbers.length < 3">
                  <PlusIcon class="h-5 w-5" />
                </CButton>
              </div>
            </div>
          </div>
        </div>
      </CStep>

      <!-- Step 5: Family Information -->
      <CStep :title="t('Family Information')" :validator="() => isFamilyInfoStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4" data-testid="family-info-step">
          <CInput id="registration-parent-name" v-model="user.student_profile.parent_name" type="text"
            :label="t('Parent Name')" :placeholder="t('Enter Parent Name')" />
          <CInput id="registration-parent-phone" v-model="user.student_profile.parent_phone" type="tel"
            :label="t('Parent Phone')" :placeholder="t('Enter Parent Phone')" />
          <CInput id="registration-parent-email" v-model="user.student_profile.parent_email" type="email"
            :label="t('Parent Email')" :placeholder="t('Enter Parent Email')" />
          <CInput id="registration-mentor-name" v-model="user.student_profile.mentor_name" type="text"
            :label="t('Mentor Name')" :placeholder="t('Enter Mentor Name')" />
          <CInput id="registration-mentor-email" v-model="user.student_profile.mentor_email" type="email"
            :label="t('Mentor Email')" :placeholder="t('Enter Mentor Email')" />
        </div>
      </CStep>

      <!-- Step 6: Emergency Contact -->
      <CStep :title="t('Emergency Contact')" :validator="() => isEmergencyContactStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4" data-testid="emergency-contact-step">
          <CInput id="registration-emergency-name" v-model="user.student_profile.emergency_contact_name" type="text"
            :label="t('Emergency Contact Name')" :placeholder="t('Enter Emergency Contact Name')" />
          <CInput id="registration-emergency-phone" v-model="user.student_profile.emergency_contact_phone" type="tel"
            :label="t('Emergency Contact Phone')" :placeholder="t('Enter Emergency Contact Phone')" />
        </div>
      </CStep>

      <!-- Step 7: Health Information -->
      <CStep :title="t('Health Information')" :validator="() => isHealthInfoStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4">
          <CSelect id="registration-blood-type" v-model="user.student_profile.blood_type" :options="bloodTypeOptions"
            :label="t('Blood Type')" />
          <CInput id="registration-allergies" v-model="user.student_profile.allergies" type="text"
            :label="t('Allergies')" :placeholder="t('Enter Allergies (if any)')" />
          <CInput id="registration-violations" v-model="user.student_profile.violations" type="text"
            :label="t('Violations')" :placeholder="t('Enter Violations (if any)')" />
        </div>
      </CStep>

      <!-- Step 8: Educational Information -->
      <CStep :title="t('Educational Information')" :validator="() => isEducationalInfoStepValid">
        <div class="grid grid-cols-1 gap-4">
          <CInput v-if="user.student_profile" id="registration-faculty" v-model="user.student_profile.faculty"
            type="text" :label="t('Faculty')" :placeholder="t('Enter Faculty Name')" required
            :validationState="registrationValidationState.faculty"
            :validationMessage="registrationValidationMessage.faculty" />
          <CInput v-if="user.student_profile" id="registration-specialist" v-model="user.student_profile.specialist"
            type="text" :label="t('Specialist')" :placeholder="t('Enter Specialty/Program Name')" required
            :validationState="registrationValidationState.specialist"
            :validationMessage="registrationValidationMessage.specialist" />
          <div class="grid grid-cols-2 gap-4">
            <CInput v-if="user.student_profile" id="registration-enrollment-year"
              v-model="user.student_profile.enrollment_year" type="number" :label="t('Enrollment Year')" required
              :validationState="registrationValidationState.enrollment_year"
              :validationMessage="registrationValidationMessage.enrollment_year" />
            <CInput v-if="user.student_profile" id="registration-deal-number" v-model="user.student_profile.deal_number"
              type="text" :label="t('Deal Number')" :placeholder="t('Enter Deal Number')" required />
          </div>
          <div>
            <CSelect id="registration-dormitory" v-model="user.dormitory_id" :options="filteredDormitoryOptions"
              :label="t('Select Dormitory')" required :disabled="!user.student_profile?.gender"
              :placeholder="filteredDormitoryOptions.length === 0 ? t('No Dormitories are available for selected gender') : t('Select Dormitory')"
              :validationState="registrationValidationState.dormitory"
              :validationMessage="registrationValidationMessage.dormitory" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <CSelect id="registration-room" data-testid="registration-room" v-model="user.room_id"
              :options="roomOptions" :label="t('Select Room')" :disabled="!user.dormitory_id || loadingRooms"
              :validationState="registrationValidationState.room"
              :validationMessage="registrationValidationMessage.room" required />
            <CSelect id="registration-bed" v-model="user.bed_id" :options="bedOptions" :label="t('Bed')"
              :disabled="!user.room_id || loadingBeds" :validationState="registrationValidationState.bed"
              :validationMessage="registrationValidationMessage.bed" required />
            <div v-if="loadingBeds" class="flex justify-center text-sm text-gray-500 mt-1">
              <span>{{ t('Loading beds...') }}</span>
            </div>
          </div>
        </div>
      </CStep>

      <!-- Step 9: Documents -->
      <CStep :title="t('Documents')" :validator="() => isDocumentsStepValid">
        <div class="grid grid-cols-1 gap-4">
          <div v-for="(fileLabel, index) in registrationFileLabels" :key="index">
            <CFileInput :id="`registration-file-${index}`" :name="fileLabel" :label="t(fileLabel)"
              :allowedExtensions="['jpg', 'jpeg', 'png', 'pdf']" :maxFileSize="2 * 1024 * 1024"
              :validation-message="registrationValidationMessage.files[index]" data-testid="file-input"
              @validation="({ valid }) => fileValidationStatus[index] = valid"
              @change="(file) => updateRegistrationFileInput(index, file)" />
          </div>
          <CCheckbox v-if="user.student_profile" id="registration-has-meal-plan"
            v-model="user.student_profile.has_meal_plan" :label="t('Has Meal Plan')" />
        </div>
      </CStep>

      <!-- Step 10: Payment -->
      <CStep :title="t('Payment')" :validator="() => isPaymentStepValid">
        <div class="grid grid-cols-1 gap-4">
          
          <CFileInput :id="`payment-file`" :name="t('Bank Check')" :label="t('Bank Check')"
            :allowedExtensions="['jpg', 'jpeg', 'png', 'pdf']" :maxFileSize="2 * 1024 * 1024"
            :validation-message="registrationValidationMessage.payment_check" data-testid="file-input"
            @validation="({ valid }) => registrationValidationState.payment_check = valid"
            @change="(file) => updateRegistrationFileInput(index, file)" />
        </div>
      </CStep>

      <!-- Step 11: Registration Status -->
      <CStep :title="t('Registration & Status')" :validator="() => isRegistrationStatusStepValid">
        <div v-if="user.student_profile" class="flex-1 flex flex-col gap-4 h-full">
          <CTextarea id="dormitory-rules" :label="t('Dormitory Rules and Regulations')"
            :model-value="settingsStore.publicSettings?.dormitory_rules" readonly additionalClass="h-full flex-1"
            wrapperClass="flex flex-col flex-1" fullscreen />
          <CCheckbox id="registration-agree-rules" v-model="user.student_profile.agree_to_dormitory_rules"
            :label="t('I have read and agree to the Dormitory Rules and Regulations')" required />
        </div>
      </CStep>
    </CStepper>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useToast } from '@/composables/useToast';
import { dormitoryService } from '@/services/api';
import type { User } from '@/models/User';
import CInput from '@/components/CInput.vue';
import CButton from '@/components/CButton.vue';
import CSelect from '@/components/CSelect.vue';
import CCheckbox from '@/components/CCheckbox.vue';
import CStepper from '@/components/CStepper.vue';
import CStep from '@/components/CStep.vue';
import CFileInput from '@/components/CFileInput.vue';
import CTextarea from '@/components/CTextarea.vue';
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/solid';
import { getCurrencySymbol } from '@/utils/formatters';

defineProps<{
  emailPlaceholder: string;
}>();

const emit = defineEmits<{
  (e: 'registered', message: string): void;
  (e: 'added-to-reserve-list', message: string): void;
  (e: 'registration-closed'): void;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const { showError, showSuccess } = useToast();

const user = ref<Partial<User>>({
  first_name: "",
  last_name: "",
  email: "",
  phone_numbers: [""],
  password: "",
  password_confirmation: "",
  dormitory_id: null,
  room_id: null,
  bed_id: null,
  student_profile: {
    student_id: "0", // Will be set by backend
    user_id: 0, // Will be set by backend
    iin: "",
    faculty: "",
    specialist: "",
    enrollment_year: new Date().getFullYear(),
    gender: null,
    blood_type: "",
    country: "",
    region: "",
    city: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    deal_number: "",
    agree_to_dormitory_rules: false,
    has_meal_plan: false,
    allergies: "",
    violations: "",
    mentor_name: "",
    mentor_email: "",
    files: [null, null, null], // Files belong to the profile
  },
  payment: {
    payment_check: null,
  }
});

type ValidationState = 'success' | 'error' | '';

const registrationFileLabels = [t("063 Form"), t("075 Form"), t("ID Check")];
const registrationValidationState = ref<{
  iin: ValidationState;
  first_name: ValidationState;
  last_name: ValidationState;
  faculty: ValidationState;
  specialist: ValidationState;
  enrollment_year: ValidationState;
  gender: ValidationState;
  email: ValidationState;
  password: ValidationState;
  confirm_password: ValidationState;
  dormitory: ValidationState;
  room: ValidationState;
  bed: ValidationState;
  files: ValidationState[];
  payment_check: ValidationState;
  [key: string]: ValidationState | ValidationState[];
}>({ iin: '', first_name: '', last_name: '', faculty: '', specialist: '', enrollment_year: '', gender: '', email: '', password: '', confirm_password: '', dormitory: '', room: '', bed: '', files: [], payment_check: '' });


const registrationValidationMessage = ref({ iin: '', first_name: '', last_name: '', faculty: '', specialist: '', enrollment_year: '', gender: '', email: '', password: '', confirm_password: '', dormitory: '', room: '', bed: '', files: [], payment_check: '' });
const isSubmitting = ref(false);
const fileValidationStatus = ref<boolean[]>([true, true, true, true]);
const currentStep = ref(0);

const handleRegistration = async () => {
  isSubmitting.value = true;
  Object.keys(registrationValidationState.value).forEach(key => registrationValidationState.value[key] = '');
  Object.keys(registrationValidationMessage.value).forEach(key => registrationValidationMessage.value[key] = '');
  registrationValidationMessage.value.files = [];
  registrationValidationMessage.value.payment_check = '';

  let hasError = !isRegistrationStatusStepValid.value;
  const setErr = (field: keyof typeof registrationValidationState.value, msg: string) => {
    registrationValidationState.value[field] = 'error';
    registrationValidationMessage.value[field] = msg;
    hasError = true;
  };

  if (!user.value.student_profile || !/^\d{12}$/.test(user.value.student_profile.iin || '')) setErr('iin', t('IIN must be 12 digits'));
  if (!user.value.first_name?.trim()) setErr('first_name', t('First name is required'));
  if (!user.value.last_name?.trim()) setErr('last_name', t('Last name is required'));
  if (!user.value.student_profile?.faculty?.trim()) setErr('faculty', t('Faculty is required'));
  if (!user.value.student_profile?.specialist?.trim()) setErr('specialist', t('Specialist is required'));
  if (!user.value.student_profile?.enrollment_year || user.value.student_profile.enrollment_year.toString().length !== 4) setErr('enrollment_year', t('Enter 4-digit year'));
  if (!user.value.student_profile?.gender) setErr('gender', t('Gender is required'));
  if (!/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(user.value.email || '')) setErr('email', t('Invalid email format.'));
  if (!user.value.password || user.value.password.length < 6) setErr('password', t('Password must be at least 6 characters'));
  if (user.value.password !== user.value.password_confirmation) setErr('confirm_password', t('Passwords do not match'));
  if (!user.value.dormitory_id) setErr('dormitory', t('Select a dormitory'));
  if (!user.value.room_id) setErr('room', t('Select a room'));
  if (!user.value.bed_id) setErr('bed', t('Select a bed'));
  if (!user.value.student_profile?.agree_to_dormitory_rules) {
    showError(t('Please agree to dormitory rules'));
    hasError = true;
  }

  if (hasError) {
    showError(t('Please fix the errors in the form before submitting.'));
    isSubmitting.value = false;
    return;
  }

  // Helper to recursively build FormData from a nested object
  const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
    if (data === null || data === undefined) {
      return;
    }

    Object.keys(data).forEach(key => {
      const value = data[key];
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value instanceof File) {
        formData.append(formKey, value, value.name);
      } else if (key === 'files' && Array.isArray(value)) {
        // Handle the files array specifically to match backend expectation (e.g., student_profile[files][0])
        value.forEach((file, index) => {
          if (file instanceof File) {
            formData.append(`${formKey}[${index}]`, file, file.name);
          }
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const arrayKey = `${formKey}[${index}]`;
          if (typeof item === 'object' && item !== null && !(item instanceof File)) {
            buildFormData(formData, item, arrayKey);
          } else if (item !== null && item !== undefined && item !== '') {
            formData.append(arrayKey, item);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        buildFormData(formData, value, formKey);
      } else if (typeof value === 'boolean') {
        formData.append(formKey, value ? '1' : '0');
      } else if (value !== null && value !== undefined) {
        formData.append(formKey, value);
      }
    });
  };

  try {
    const formData = new FormData();
    // Add user_type at the root level as expected by the backend
    formData.append('user_type', 'student');
    // Recursively build the rest of the payload from the user object
    buildFormData(formData, user.value);

    const response = await authStore.register(formData);
    if (response?.message?.includes('reserve list')) {
      emit('added-to-reserve-list', t('Registration limit reached. You have been added to the reserve list.'));
    } else {
      emit('registered', response?.message || t('Registration successful'));
    }
  } catch (error: any) { //NOSONAR
    console.error('registration error', error);
    const response = error.response;
    if (response?.status === 403 && response.data?.message?.includes('closed')) {
      emit('registration-closed');
    } else if (response?.status === 422 && response.data?.errors) {
      const errors = response.data.errors;
      showError(response.data.message || t('Please fix the errors in the form'));

      const fieldToStepMap: Record<string, number> = {
        'student_profile.gender': 0,
        'student_profile.iin': 1,
        'email': 1,
        'password': 1,
        'password_confirmation': 1,
        'first_name': 2,
        'last_name': 2,
        'student_profile.country': 2,
        'student_profile.region': 2,
        'student_profile.city': 2,
        'phone_numbers': 3,
        'student_profile.faculty': 7,
        'student_profile.specialist': 7,
        'student_profile.enrollment_year': 7,
        'student_profile.deal_number': 7,
        'dormitory_id': 7,
        'room_id': 7,
        'bed_id': 7,
        'student_profile.files': 8,
        'student_profile.agree_to_dormitory_rules': 9,
        'payment.payment_check': 10
      };

      let firstErrorStep = -1;

      for (const serverKey in errors) {
        const message = errors[serverKey][0];

        // Handle file array errors like "student_profile.files.3"
        if (serverKey.startsWith('student_profile.files.')) {
          const index = parseInt(serverKey.split('.')[2], 10);
          if (!isNaN(index) && registrationValidationMessage.value.files) {
            registrationValidationMessage.value.files[index] = message;
          }
          const step = fieldToStepMap['student_profile.files'];
          if (step !== undefined && (firstErrorStep === -1 || step < firstErrorStep)) {
            firstErrorStep = step;
          }
        // Handle single file input error: "payment.payment_check"
        } else if (serverKey === 'payment.payment_check') {
          if (registrationValidationMessage.value.payment) {
            registrationValidationMessage.value.payment.payment_check = message;
          }
          const step = fieldToStepMap['payment.payment_check'] ?? fieldToStepMap['payment'];
          if (step !== undefined && (firstErrorStep === -1 || step < firstErrorStep)) {
            firstErrorStep = step;
          }
        } else {
          const baseKey = serverKey.split('.')[0]; // e.g., 'student_profile' or 'email'
          const frontendKey = serverKey.replace('student_profile.', '');
          setErr(frontendKey as keyof typeof registrationValidationState.value, message);
          const step = fieldToStepMap[serverKey] ?? fieldToStepMap[baseKey];
          if (step !== undefined && (firstErrorStep === -1 || step < firstErrorStep)) {
            firstErrorStep = step;
          }
        }
      }
      if (firstErrorStep !== -1) {
        currentStep.value = firstErrorStep;
      }
    } else {
      showError(error.response?.data?.message || t('Registration failed'));
    }
  } finally {
    isSubmitting.value = false;
  }
};

const addPhoneField = () => {
  if (!user.value.phone_numbers) {
    user.value.phone_numbers = [];
  }
  user.value.phone_numbers.push('');
};
const removePhoneField = (index: number) => {
  if (user.value.phone_numbers && user.value.phone_numbers.length > 1) {
    user.value.phone_numbers.splice(index, 1);
  }
};
const updateRegistrationFileInput = (index: number, fileOrEvent: File | Event | null) => {
  // The CFileInput component might emit the file directly or an event object.
  // We need to handle both cases to get the actual file.
  const file = fileOrEvent instanceof File ? fileOrEvent : ((fileOrEvent as Event)?.target as HTMLInputElement)?.files?.[0] || null;
  if (user.value.student_profile?.files) {
    user.value.student_profile.files[index] = file;
  }
};

const updatePaymentCheckInput = (fileOrEvent: File | Event | null) => {
  const file = fileOrEvent instanceof File ? fileOrEvent : ((fileOrEvent as Event)?.target as HTMLInputElement)?.files?.[0] || null;
  if (user.value.payment.payment_check) {
    user.value.payment.payment_check = file;
  }
}

const genderOptions = [{ value: 'male', name: 'Male' }, { value: 'female', name: 'Female' }];
const bloodTypeOptions = [
  { value: "A+", name: "A+" },
  { value: "A-", name: "A-" },
  { value: "B+", name: "B+" },
  { value: "B-", name: "B-" }, // Corrected typo here
  { value: "AB+", name: "AB+" }, // Corrected typo here
  { value: "AB-", name: "AB-" },
  { value: "O+", name: "O+" },
  { value: "O-", name: "O-" },
];
const dormitoryOptions = ref([]);
const loadingDormitories = ref(false);

const hasAvailableDormitories = computed(() => {
  if (!user.value.student_profile?.gender) return true; // Don't block if gender isn't selected yet
  return dormitoryOptions.value.some(dorm => (dorm.gender === 'mixed' || dorm.gender === user.value.student_profile?.gender) && dorm.freeBeds > 0);
});

watch(() => user.value.student_profile?.gender, async (newGender) => {
  if (!newGender) {
    dormitoryOptions.value = [];
    return;
  }
  loadingDormitories.value = true;
  user.value.dormitory_id = null; // Reset dormitory on gender change
  try {
    const response = await dormitoryService.getAll();
    // The response.data is already the array of dormitories
    dormitoryOptions.value = response.data || [];
  } catch (e) {
    showError(t('Failed to load dormitories. Please try again.'));
  } finally {
    loadingDormitories.value = false; // This will trigger hasAvailableDormitories re-evaluation
  }
});

onMounted(async () => {
  // Public settings are now fetched in App.vue
});

// --- Step Validators ---

// Step 1: Gender
const isGenderStepValid = computed(() => {
  // Ensure gender is selected and dormitories are available (or not loading)
  return !!user.value.student_profile?.gender && hasAvailableDormitories.value && !loadingDormitories.value;
});

// Step 2: Account
const isAccountStepValid = computed(() => { // Corrected property name
  const iin = user.value.student_profile?.iin;
  const { email, password, password_confirmation } = user.value;
  return !!iin && /^\d{12}$/.test(iin) && !!email && /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && !!password && password.length >= 6 && !!password_confirmation && password === password_confirmation;
});

// Step 3: Personal Details
const isPersonalDetailsStepValid = computed(() => {
  const { first_name, last_name } = user.value;
  return !!first_name?.trim() &&
    !!last_name?.trim();
  // country, region, city are not marked as required in the template, so not included here.
});

// Step 4: Phone Numbers
const isPhoneNumbersStepValid = computed(() => {
  return !!user.value.phone_numbers?.some(phone => phone && phone.trim() !== '');
});

// Step 5: Family Information
const isFamilyInfoStepValid = computed(() => {
  // No required fields in this step based on the template
  return true;
});

// Step 6: Emergency Contact
const isEmergencyContactStepValid = computed(() => {
  // No required fields in this step based on the template
  return true;
});

// Step 7: Health Information
const isHealthInfoStepValid = computed(() => {
  // No required fields in this step based on the template
  return true;
});

// Step 8: Educational Information
const isEducationalInfoStepValid = computed(() => {
  const { faculty, specialist, enrollment_year, deal_number } = user.value.student_profile ?? {};
  const { dormitory_id, room_id, bed_id } = user.value;
  return !!faculty?.trim() &&
    !!specialist?.trim() &&
    !!deal_number?.trim() &&
    !!enrollment_year && enrollment_year.toString().length === 4 &&
    !!dormitory_id &&
    !!room_id &&
    !!bed_id;
});

// Step 9: Documents (No required files based on current template)
const isDocumentsStepValid = computed(() => {
  return fileValidationStatus.value.every(isValid => isValid);
});

// Step 10: Payment Chek
const isPaymentStepValid = computed(() => {
  const file = user.value?.payment?.payment_check;
  return file instanceof File || (typeof file === 'string' && file.trim() !== '');
});
// Step 11: Registration & Status
const isRegistrationStatusStepValid = computed(() => {
  return !!user.value.student_profile?.agree_to_dormitory_rules;
});

const availableRooms = ref<any[]>([]);
const loadingRooms = ref(false);
const availableBeds = ref<any[]>([]);
const loadingBeds = ref(false);
const selectedRoomNumber = ref('');
const selectedRoomPrice = ref<number | null>(null);

const filteredDormitoryOptions = computed(() => {
  const gender = user.value.student_profile?.gender;
  if (!gender) return dormitoryOptions.value;
  return (dormitoryOptions.value || [])
    .filter(dorm => (dorm.gender === 'mixed' || dorm.gender === gender) && dorm.freeBeds > 0)
    .map(dorm => ({ value: dorm.id.toString(), name: dorm.name }));
});

watch(() => user.value.dormitory_id, async (dormitoryId) => {
  user.value.room_id = null;
  selectedRoomNumber.value = '';
  selectedRoomPrice.value = null;
  user.value.bed_id = null;
  if (!dormitoryId) {
    availableRooms.value = [];
    availableBeds.value = [];
    return; //NOSONAR
  }
  loadingRooms.value = true;
  try {
    const apiResponse = await dormitoryService.getRegistrationData(dormitoryId as number);
    availableRooms.value = apiResponse.data?.data?.rooms || [];
  } catch (e) {
    console.error('Failed to load rooms:', e);
    availableRooms.value = [];
  } finally {
    loadingRooms.value = false;
  }
});

watch(() => user.value.room_id, async (roomId) => {
  if (user.value.student_profile) user.value.student_profile.bed_id = null;
  selectedRoomPrice.value = null;
  if (!roomId) {
    availableBeds.value = [];
    return;
  }
  loadingBeds.value = true;
  try {
    const room = availableRooms.value.find(r => r.id === roomId);
    if (room && room.beds) {
      selectedRoomNumber.value = room.number;
      selectedRoomPrice.value = room.room_type?.semester_rate ? parseFloat(room.room_type.semester_rate) : null;
      availableBeds.value = room.beds.filter(bed => !bed.is_occupied && !bed.reserved_for_staff);
    } else {
      availableBeds.value = [];
    }
  } catch (e) {
    console.error('Failed to load beds:', e);
    availableBeds.value = [];
  } finally {
    loadingBeds.value = false;
  }
});

const roomOptions = computed(() => availableRooms.value.map((r) => {
  const priceValue = r.room_type?.semester_rate;
  const currencyCode = settingsStore.publicSettings?.currency_symbol;
  let priceString = '';
  if (priceValue != null) {
    const currencySymbol = getCurrencySymbol(currencyCode);
    priceString = ` - ${Math.round(parseFloat(priceValue))} ${currencySymbol}`;
  }
  return { value: r.id, name: `${r.number}${priceString}` };
}));
const bedOptions = computed(() => availableBeds.value.map((b) => {
  return { value: b.id, name: `${selectedRoomNumber.value}-${b.bed_number}` }; //NOSONAR
}));
</script>