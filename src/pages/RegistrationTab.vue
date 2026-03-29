<template>
  <form
    @submit.prevent="handleRegistration"
    novalidate
    class="flex h-full min-h-[60vh] flex-col items-stretch"
  >
    <CStepper v-model="currentStep" @finish="handleRegistration">
      <!-- Step 1: Identification -->
      <CStep :title="t('Identification')" :validator="() => isIdentificationStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4">
          <div class="flex items-start gap-2">
            <CInput
              v-if="settingsStore.publicSettings?.sdu_enabled || settingsStore.publicSettings?.iin_integration_enabled"
              id="registration-student-id"
              v-model="user.student_profile.student_id"
              type="text"
              :label="t('Student ID')"
              class="flex-grow"
              required
              :loading="loadingStudentData"
              :validationState="registrationValidationState.student_id"
              :validationMessage="registrationValidationMessage.student_id"
              @validation="handleStudentIdValidation"
            />
            <CButton
              v-if="settingsStore.publicSettings?.iin_integration_enabled"
              type="button"
              class="h-[42px] mt-5"
              :disabled="!user.student_profile?.student_id || loadingOtp"
              @click="sendOtp"
            >
              {{ t("Verify") }}
            </CButton>
          </div>
          <CInput
            id="registration-iin"
            v-model="user.student_profile.iin"
            type="search"
            :label="t('IIN')"
            required
            :loading="loadingIinAvailability"
            :validationState="registrationValidationState.iin"
            :validationMessage="registrationValidationMessage.iin"
            pattern="\d{12}"
            minlength="12"
            maxlength="12"
            @validation="handleIinValidation"
          />
        </div>
      </CStep>

      <!-- Step 2: Gender -->
      <CStep :title="t('Gender')" :validator="() => isGenderStepValid">
        <div class="grid grid-cols-1 gap-2">
          <div class="flex items-start gap-4">
            <div v-if="user.student_profile" class="flex-grow">
              <CSelect
                id="registration-gender"
                v-model="user.student_profile.gender"
                :options="genderOptions"
                :label="t('Gender')"
                required
                :validationState="registrationValidationState.gender"
                :validationMessage="registrationValidationMessage.gender"
              />
            </div>
          </div>
          <div v-if="loadingDormitories" class="mt-8 flex justify-center">
            <div class="border-primary-500 h-5 w-5 animate-spin rounded-full border-b-2"></div>
          </div>
          <div
            v-if="user.student_profile?.gender && !hasAvailableDormitories && !loadingDormitories"
            class="p-4 text-center text-red-500"
          >
            {{ t("No Dormitories are available for selected gender at this time.") }}
          </div>
        </div>
      </CStep>

      <!-- Step 3: Account -->
      <CStep :title="t('Account')" :validator="() => isAccountStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4">
          <CInput
            id="registration-email"
            v-model="user.email"
            type="email"
            :label="t('Login Email')"
            :placeholder="emailPlaceholder"
            required
            :loading="loadingEmailAvailability"
            :validationState="registrationValidationState.email"
            :validationMessage="registrationValidationMessage.email"
            @validation="handleEmailValidation"
          />
          <CInput
            id="registration-password"
            v-model="user.password"
            type="password"
            :label="t('Password')"
            required
            :validationState="registrationValidationState.password"
            :validationMessage="registrationValidationMessage.password"
            pattern=".{6,}"
          />
          <CInput
            id="registration-confirm-password"
            v-model="user.password_confirmation"
            type="password"
            :label="t('Confirm Password')"
            required
            :validationState="registrationValidationState.confirm_password"
            :validationMessage="registrationValidationMessage.confirm_password"
            pattern=".{6,}"
          />
        </div>
      </CStep>

      <!-- Step 3: Personal Details -->
      <CStep :title="t('Personal Information')" :validator="() => isPersonalDetailsStepValid">
        <div
          v-if="user.student_profile"
          class="grid grid-cols-1 gap-4"
          data-testid="personal-info-step"
        >
          <CInput
            id="registration-first-name"
            v-model="user.first_name"
            type="text"
            :label="t('Name')"
            :placeholder="t('Enter Name')"
            required
            :validationState="registrationValidationState.first_name"
            :validationMessage="registrationValidationMessage.first_name"
          />
          <CInput
            id="registration-last-name"
            v-model="user.last_name"
            type="text"
            :label="t('Surname')"
            :placeholder="t('Enter Surname')"
            required
            :validationState="registrationValidationState.last_name"
            :validationMessage="registrationValidationMessage.last_name"
          />
          <CInput
            id="registration-country"
            v-model="user.student_profile.country"
            type="text"
            :label="t('Country')"
            :placeholder="t('Enter Country')"
          />
          <CInput
            id="registration-region"
            v-model="user.student_profile.region"
            type="text"
            :label="t('Region')"
            :placeholder="t('Enter Region')"
            :disabled="!user.student_profile.country"
          />
          <CInput
            id="registration-city"
            v-model="user.student_profile.city"
            type="text"
            :label="t('City')"
            :placeholder="t('Enter City')"
            :disabled="!user.student_profile.region"
          />
        </div>
      </CStep>

      <!-- Step 4: Phone Numbers -->
      <CStep :title="t('Phone Numbers')" :validator="() => isPhoneNumbersStepValid">
        <div class="lg:col-span-2">
          <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-end">
            <div v-if="user.phone_numbers" class="flex flex-col items-stretch gap-2">
              <label for="phones" class="text-sm font-medium">
                {{ t("Provide at least one phone number") }}
              </label>
              <div
                v-for="(phone, index) in user.phone_numbers"
                :key="index"
                id="phones"
                class="flex items-center gap-2"
              >
                <CInput
                  :id="`phone-number-${index}`"
                  v-model="user.phone_numbers[index]"
                  type="tel"
                  :placeholder="t('Enter Phone Number')"
                  class="flex-grow"
                />
                <CButton
                  type="button"
                  v-if="user.phone_numbers.length > 1"
                  @click="removePhoneField(index)"
                  class="py-2.5"
                >
                  <TrashIcon class="h-5 w-5 text-red-600" />
                </CButton>
                <CButton
                  type="button"
                  @click="addPhoneField"
                  class="py-2.5"
                  v-if="index === user.phone_numbers.length - 1 && user.phone_numbers.length < 3"
                >
                  <PlusIcon class="h-5 w-5" />
                </CButton>
              </div>
            </div>
          </div>
        </div>
      </CStep>

      <!-- Step 5: Emergency Contact -->
      <CStep :title="t('Emergency Contact')" :validator="() => isEmergencyContactStepValid">
        <div
          v-if="user.student_profile"
          class="grid grid-cols-1 gap-4"
          data-testid="emergency-contact-step"
        >
          <CInput
            id="registration-emergency-name"
            v-model="user.student_profile.emergency_contact_name"
            type="text"
            :label="t('Emergency Contact Name')"
            :placeholder="t('Enter Emergency Contact Name')"
          />
          <CSelect
            id="registration-emergency-type"
            v-model="user.student_profile.emergency_contact_type"
            :options="emergencyContactTypeOptions"
            :label="t('Emergency Contact Type')"
          />
          <CInput
            id="registration-emergency-phone"
            v-model="user.student_profile.emergency_contact_phone"
            type="tel"
            :label="t('Emergency Contact Phone')"
            :placeholder="t('Enter Emergency Contact Phone')"
          />
          <CInput
            id="registration-emergency-email"
            v-model="user.student_profile.emergency_contact_email"
            type="email"
            :label="t('Emergency Contact Email')"
            :placeholder="t('Enter Emergency Contact Email')"
          />
          <CSelect
            id="registration-identification-type"
            v-model="user.student_profile.identification_type"
            :options="identificationOptions"
            :label="t('Identification Type')"
            required
          />
          <CInput
            id="registration-identification-number"
            v-model="user.student_profile.identification_number"
            type="text"
            :label="t('Identification Number')"
            :placeholder="t('Enter Identification Number')"
            required
          />
        </div>
      </CStep>

      <!-- Step 6: Health Information -->
      <CStep :title="t('Health Information')" :validator="() => isHealthInfoStepValid">
        <div v-if="user.student_profile" class="grid grid-cols-1 gap-4">
          <CSelect
            id="registration-blood-type"
            v-model="user.student_profile.blood_type"
            :options="bloodTypeOptions"
            :label="t('Blood Type')"
          />
          <CInput
            id="registration-allergies"
            v-model="user.student_profile.allergies"
            type="text"
            :label="t('Allergies')"
            :placeholder="t('Enter Allergies (if any)')"
          />
          <CInput
            id="registration-violations"
            v-model="user.student_profile.violations"
            type="text"
            :label="t('Violations')"
            :placeholder="t('Enter Violations (if any)')"
          />
        </div>
      </CStep>

      <!-- Step 7: Educational Information -->
      <CStep :title="t('Educational Information')" :validator="() => isEducationalInfoStepValid">
        <div class="grid grid-cols-1 gap-4">
          <CInput
            v-if="user.student_profile"
            id="registration-faculty"
            v-model="user.student_profile.faculty"
            type="text"
            :label="t('Faculty')"
            :placeholder="t('Enter Faculty Name')"
            required
            :validationState="registrationValidationState.faculty"
            :validationMessage="registrationValidationMessage.faculty"
          />
          <CInput
            v-if="user.student_profile"
            id="registration-specialist"
            v-model="user.student_profile.specialist"
            type="text"
            :label="t('Specialty')"
            :placeholder="t('Enter Specialty/Program Name')"
            required
            :validationState="registrationValidationState.specialist"
            :validationMessage="registrationValidationMessage.specialist"
          />
          <CInput
            v-if="user.student_profile"
            id="registration-enrollment-year"
            v-model="user.student_profile.enrollment_year"
            type="number"
            :label="t('Enrollment Year')"
            required
            :validationState="registrationValidationState.enrollment_year"
            :validationMessage="registrationValidationMessage.enrollment_year"
          />
        </div>
      </CStep>

      <!-- Step 8: Accommodation -->
      <CStep :title="t('Accommodation')" :validator="() => isAccommodationStepValid">
        <div class="grid grid-cols-1 gap-4">
          <div>
            <CSelect
              id="registration-dormitory"
              v-model="user.dormitory_id"
              :options="filteredDormitoryOptions"
              :label="t('Select Dormitory')"
              required
              :disabled="!user.student_profile?.gender"
              :placeholder="
                filteredDormitoryOptions.length === 0
                  ? t('No Dormitories are available for selected gender')
                  : t('Select Dormitory')
              "
              :validationState="registrationValidationState.dormitory"
              :validationMessage="registrationValidationMessage.dormitory"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <CSelect
              id="registration-room"
              data-testid="registration-room"
              v-model="user.room_id"
              :options="roomOptions"
              :label="t('Select Room')"
              :disabled="!user.dormitory_id || loadingRooms"
              :validationState="registrationValidationState.room"
              :validationMessage="registrationValidationMessage.room"
              required
            />
            <CSelect
              id="registration-bed"
              v-model="user.bed_id"
              :options="bedOptions"
              :label="t('Bed')"
              :disabled="!user.room_id || loadingBeds"
              :validationState="registrationValidationState.bed"
              :validationMessage="registrationValidationMessage.bed"
              required
            />
            <div v-if="loadingBeds" class="mt-1 flex justify-center text-sm text-gray-500">
              <span>{{ t("Loading beds...") }}</span>
            </div>
          </div>

          <!-- Room Photos Display -->
          <CRoomTypePhotos :photos="selectedRoom?.room_type?.photos || []" />
        </div>
      </CStep>

      <!-- Step 9: Documents -->
      <CStep :title="t('Documents')" :validator="() => isDocumentsStepValid">
        <div class="grid grid-cols-1 gap-4">
          <div v-for="(fileLabel, index) in registrationFileLabels" :key="index">
            <CFileInput
              :id="`registration-file-${index}`"
              :name="fileLabel"
              :label="t(fileLabel)"
              :allowedExtensions="
                index === 2 ? ['jpg', 'jpeg', 'png'] : ['jpg', 'jpeg', 'png', 'pdf']
              "
              :maxFileSize="2 * 1024 * 1024"
              :validation-message="registrationValidationMessage.files[index]"
              :accept="index === 2 ? 'image/*' : undefined"
              data-testid="file-input"
              @validation="({ valid }: { valid: boolean }) => (fileValidationStatus[index] = valid)"
              @change="(file: any) => updateRegistrationFileInput(index, file)"
            />
            <p v-if="index === 2" class="mt-1 text-sm text-gray-500">
              {{ t("Please upload a 3x4 cm photo in JPG or PNG format") }}
            </p>
          </div>
        </div>
      </CStep>

      <!-- Step 11: Registration Status -->
      <CStep :title="t('Registration & Status')" :validator="() => isRegistrationStatusStepValid">
        <div v-if="user.student_profile" class="flex h-full flex-1 flex-col gap-4">
          <CHtmlView
            id="dormitory-rules"
            :label="t('Dormitory Rules and Regulations')"
            :html="dormitoryRulesHtml"
            :fallback-text="t('No dormitory rules have been configured.')"
            wrapperClass="flex flex-col flex-1 min-h-0"
            additionalClass="h-full flex-1 min-h-[200px]"
            fullscreen
          />
          <CCheckbox
            id="registration-agree-rules"
            v-model="user.student_profile.agree_to_dormitory_rules"
            :label="t('I have read and agree to the Dormitory Rules and Regulations')"
            required
          />
        </div>
      </CStep>
    </CStepper>
  </form>

  <CIinImportModal
    v-if="settingsStore.publicSettings?.iin_integration_enabled && showOtpModal"
    :student-id="user.student_profile?.student_id || ''"
    @close="showOtpModal = false"
    @data-fetched="handleIinData"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useToast } from "@/composables/useToast";
import { dormitoryService } from "@/services/api";
import api from "@/services/api";
import type { User } from "@/models/User";
import type { Room } from "@/models/Room";
import type { Bed } from "@/models/Bed";
import type { Dormitory } from "@/models/Dormitory";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import CSelect from "@/components/CSelect.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import CStepper from "@/components/CStepper.vue";
import CStep from "@/components/CStep.vue";
import CFileInput from "@/components/CFileInput.vue";
import CHtmlView from "@/components/CHtmlView.vue";
import CModal from "@/components/CModal.vue";
import CIinImportModal from "@/components/CIinImportModal.vue";
import CRoomTypePhotos from "@/components/CRoomTypePhotos.vue";
import { iinService } from "@/services/api";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/solid";
import { getCurrencySymbol } from "@/utils/formatters";
import { debounceHelper } from "@/utils/helpers"; // Import debounceHelper

const props = withDefaults(defineProps<{ emailPlaceholder: string; uiLocale?: string }>(), {
  uiLocale: "",
});

const emit = defineEmits<{
  (e: "registered", message: string): void;
  (e: "added-to-reserve-list", message: string): void;
  (e: "registration-closed"): void;
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const { showError, showSuccess, showWarning } = useToast();

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
    student_id: "", // User input
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
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_type: null,
    emergency_contact_email: "",
    identification_type: "",
    identification_number: "",
    agree_to_dormitory_rules: false,
    allergies: "",
    violations: "",
    files: [null, null, null], // Files belong to the profile (063 Form, 075 Form, Profile Picture)
  },
});

type ValidationState = "success" | "error" | "";

const registrationFileLabels = [t("063 Form"), t("075 Form"), t("Student Photo (3x4)")];
const registrationValidationState = ref<{
  student_id: ValidationState;
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
}>({
  student_id: "",
  iin: "",
  first_name: "",
  last_name: "",
  faculty: "",
  specialist: "",
  enrollment_year: "",
  gender: "",
  email: "",
  password: "",
  confirm_password: "",
  dormitory: "",
  room: "",
  bed: "",
  files: [],
  payment_check: "",
});

const registrationValidationMessage = ref<{
  student_id: string;
  iin: string;
  first_name: string;
  last_name: string;
  faculty: string;
  specialist: string;
  enrollment_year: string;
  gender: string;
  email: string;
  password: string;
  confirm_password: string;
  dormitory: string;
  room: string;
  bed: string;
  files: string[];
  payment_check: string;
  [key: string]: string | string[];
}>({
  student_id: "",
  iin: "",
  first_name: "",
  last_name: "",
  faculty: "",
  specialist: "",
  enrollment_year: "",
  gender: "",
  email: "",
  password: "",
  confirm_password: "",
  dormitory: "",
  room: "",
  bed: "",
  files: [],
  payment_check: "",
});
const isSubmitting = ref(false);
const fileValidationStatus = ref<boolean[]>([true, true]);
const currentStep = ref(0);
const loadingEmailAvailability = ref(false);
const loadingIinAvailability = ref(false);
const loadingStudentData = ref(false);
const loadingOtp = ref(false);
const showOtpModal = ref(false);
const otpIdentifier = ref("");

const sendOtp = () => {
  const sid = user.value.student_profile?.student_id;
  if (!sid) return;
  showOtpModal.value = true;
};

const handleIinData = (data: any) => {
  showOtpModal.value = false;
  if (data) {
    if (data.firstName) user.value.first_name = data.firstName;
    if (data.lastName) user.value.last_name = data.lastName;
    if (user.value.student_profile) {
      if (data.iin) user.value.student_profile.iin = data.iin;
      if (data.passportNumber) {
        user.value.student_profile.identification_number = data.passportNumber;
        user.value.student_profile.identification_type = 'passport';
      }
      if (data.studentId) user.value.student_profile.student_id = data.studentId;
      if (data.gender) user.value.student_profile.gender = data.gender.toLowerCase();
      if (data.email) user.value.email = data.email;
      if (data.phones && Array.isArray(data.phones)) {
        // If phones array is empty, keep at least one empty input field
        user.value.phone_numbers = data.phones.length > 0 ? data.phones : [""];
      }
      if (data.country) user.value.student_profile.country = data.country;
      if (data.region) user.value.student_profile.region = data.region;
      if (data.city) user.value.student_profile.city = data.city;
      if (data.specialist) user.value.student_profile.specialist = data.specialist;
      if (data.enrollmentYear) user.value.student_profile.enrollment_year = data.enrollmentYear;
      
      // Emergency contact mapping
      if (data.emergencyContactName) user.value.student_profile.emergency_contact_name = data.emergencyContactName;
      if (data.emergencyContactPhone) user.value.student_profile.emergency_contact_phone = data.emergencyContactPhone;
      if (data.emergencyContactType) {
        // Normalize "Father" and "Mother" to "Parent"
        const normalizedType = data.emergencyContactType.toLowerCase();
        if (normalizedType === 'father' || normalizedType === 'mother') {
          user.value.student_profile.emergency_contact_type = "parent";
        } else {
          user.value.student_profile.emergency_contact_type = normalizedType;
        }
      } else if (data.emergencyContactPhone || data.emergencyContactEmail) {
        // Assign "Other" as default type when phone or email exists but no type is specified
        user.value.student_profile.emergency_contact_type = "other";
      }
      if (data.emergencyContactEmail) user.value.student_profile.emergency_contact_email = data.emergencyContactEmail;

      // Handle photo path from IIN integration
      if (data.photoPath) {
        // Index 2 is Student Photo (3x4)
        if (!user.value.student_profile.files) {
          user.value.student_profile.files = [null, null, null];
        }
        // Store the path as a string. StudentService.storeNewFiles will preserve it.
        user.value.student_profile.files[2] = data.photoPath;
      }
    }
    // Auto-trigger availability checks for IIN and email
    if (data.iin && user.value.student_profile?.iin) {
      debouncedCheckIinAvailability(data.iin);
    }
    if (data.email && user.value.email) {
      debouncedCheckEmailAvailability(data.email);
    }

    showSuccess(t("Your information imported successfully, related fields are automatically populated"));
  }
};

const fetchStudentData = async (studentId: string) => {
  if (!studentId || !settingsStore.publicSettings?.sdu_enabled) return;

  loadingStudentData.value = true;
  try {
    const response = await api.get("/student/autocomplete", { params: { student_id: studentId } });
    const data = response.data;
    if (data) {
      if (data.first_name) user.value.first_name = data.first_name;
      if (data.last_name) user.value.last_name = data.last_name;
      if (user.value.student_profile) {
        if (data.iin) user.value.student_profile.iin = data.iin;
        if (data.faculty) user.value.student_profile.faculty = data.faculty;
        if (data.specialty) user.value.student_profile.specialist = data.specialty;
        if (data.enrollment_year) user.value.student_profile.enrollment_year = data.enrollment_year;
        if (data.gender) user.value.student_profile.gender = data.gender;
        if (data.course) user.value.student_profile.course = data.course; // Assuming course field exists or mapped in normalize
      }
      registrationValidationState.value.student_id = "success";
      registrationValidationMessage.value.student_id = "";
    }
  } catch (error) {
    console.error("Error fetching student data:", error);
    // Don't error out necessarily, maybe just no autocomplete found
    // If we want to show error:
    // registrationValidationState.value.student_id = 'error';
    // registrationValidationMessage.value.student_id = t('Student not found');
  } finally {
    loadingStudentData.value = false;
  }
};

const debouncedFetchStudentData = debounceHelper(fetchStudentData, 500);

const handleStudentIdValidation = ({ valid, message }: { valid: boolean; message: string }) => {
  if (valid && user.value.student_profile?.student_id) {
    registrationValidationState.value.student_id = "";
    registrationValidationMessage.value.student_id = "";
    debouncedFetchStudentData(user.value.student_profile.student_id);
  } else {
    registrationValidationState.value.student_id = valid ? "success" : "error";
    registrationValidationMessage.value.student_id = message;
  }
};

const checkEmailAvailability = async (email: string) => {
  if (!email) {
    registrationValidationState.value.email = "error";
    registrationValidationMessage.value.email = t("Email is required.");
    return;
  }
  // Prevent race condition if user changed input while debounce was waiting
  if (email !== user.value.email) return;

  loadingEmailAvailability.value = true;
  try {
    const response = await api.get("/email/check-availability", { params: { email } });
    if (response.data.is_available) {
      registrationValidationState.value.email = "success";
      registrationValidationMessage.value.email = "";
    } else {
      registrationValidationState.value.email = "error";
      registrationValidationMessage.value.email = t("This email is already registered.");
    }
  } catch (error) {
    console.error("Error checking email availability:", error);
    registrationValidationState.value.email = "error";
    registrationValidationMessage.value.email = t("Could not verify email availability.");
  } finally {
    loadingEmailAvailability.value = false;
  }
};

const debouncedCheckEmailAvailability = debounceHelper(checkEmailAvailability, 500);

const handleEmailValidation = ({ valid, message }: { valid: boolean; message: string }) => {
  if (valid && user.value.email) {
    registrationValidationState.value.email = "";
    debouncedCheckEmailAvailability(user.value.email);
  } else {
    registrationValidationState.value.email = valid ? "success" : "error";
    registrationValidationMessage.value.email = message;
  }
};

// Add after email availability check
const checkIinAvailability = async (iin: string) => {
  if (iin?.length !== 12) return;

  // Prevent race condition if user changed input while debounce was waiting
  if (iin !== user.value.student_profile?.iin) return;

  loadingIinAvailability.value = true;
  try {
    const response = await api.get("/iin/check-availability", { params: { iin } });
    if (response.data.is_available) {
      registrationValidationState.value.iin = "success";
      registrationValidationMessage.value.iin = "";
    } else {
      registrationValidationState.value.iin = "error";
      registrationValidationMessage.value.iin = t("This IIN is already registered.");
    }
  } catch (error) {
    registrationValidationState.value.iin = "error";
    registrationValidationMessage.value.iin = t("Could not verify IIN availability.");
  } finally {
    loadingIinAvailability.value = false;
  }
};

const debouncedCheckIinAvailability = debounceHelper(checkIinAvailability, 500);

const handleIinValidation = ({ valid, message }: { valid: boolean; message: string }) => {
  if (
    valid &&
    user.value.student_profile &&
    user.value.student_profile.iin &&
    user.value.student_profile.iin.length === 12
  ) {
    registrationValidationState.value.iin = "";
    debouncedCheckIinAvailability(user.value.student_profile.iin);
  } else {
    registrationValidationState.value.iin = valid ? "success" : "error";
    registrationValidationMessage.value.iin = message;
  }
};

const handleRegistration = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  Object.keys(registrationValidationState.value).forEach(
    (key) => (registrationValidationState.value[key] = "")
  );
  Object.keys(registrationValidationMessage.value).forEach(
    (key) => (registrationValidationMessage.value[key] = "")
  );
  registrationValidationMessage.value.files = [];

  let hasError = !isRegistrationStatusStepValid.value;
  const setErr = (field: string, msg: string) => {
    (registrationValidationState.value as Record<string, any>)[field] = "error";
    (registrationValidationMessage.value as Record<string, any>)[field] = msg;
    hasError = true;
  };

  if (registrationValidationState.value.iin === "error") {
    hasError = true;
  }
  if (registrationValidationState.value.email === "error") {
    hasError = true;
  }

  if (!user.value.first_name?.trim()) setErr("first_name", t("First name is required"));
  if (!user.value.last_name?.trim()) setErr("last_name", t("Last name is required"));
  if (!user.value.student_profile?.faculty?.trim()) setErr("faculty", t("Faculty is required"));
  if (!user.value.student_profile?.specialist?.trim())
    setErr("specialist", t("Specialist is required"));
  if (user.value.student_profile?.enrollment_year?.toString().length !== 4)
    setErr("enrollment_year", t("Enter 4-digit year"));
  if (!user.value.student_profile?.gender) setErr("gender", t("Gender is required"));
  if (!user.value.password || user.value.password.length < 6)
    setErr("password", t("Password must be at least 6 characters"));
  if (user.value.password !== user.value.password_confirmation)
    setErr("confirm_password", t("Passwords do not match"));
  if (!user.value.dormitory_id) setErr("dormitory", t("Select a dormitory"));
  if (!user.value.room_id) setErr("room", t("Select a room"));
  if (!user.value.bed_id) setErr("bed", t("Select a bed"));
  if (!user.value.student_profile?.agree_to_dormitory_rules) {
    showError(t("Please agree to dormitory rules"));
    hasError = true;
  }

  if (hasError) {
    showError(t("Please fix the errors in the form before submitting."));
    isSubmitting.value = false;
    return;
  }

  // Helper to recursively build FormData from a nested object
  const buildFormData = (formData: FormData, data: Record<string, unknown>, parentKey?: string) => {
    if (data === null || data === undefined) {
      return;
    }

    Object.keys(data).forEach((key) => {
      const value = data[key] as any;
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value instanceof File) {
        formData.append(formKey, value, value.name);
      } else if (key === "files" && Array.isArray(value) && formKey === "student_profile[files]") {
        // Append student profile files with explicit indices 0, 1, 2 so backend receives avatar at index 2
        for (let i = 0; i < 3; i++) {
          const file = value[i];
          if (file instanceof File) {
            formData.append(`${formKey}[${i}]`, file, file.name);
          }
        }
      } else if (key === "files" && Array.isArray(value)) {
        value.forEach((file, index) => {
          if (file instanceof File) {
            formData.append(`${formKey}[${index}]`, file, file.name);
          }
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const arrayKey = `${formKey}[${index}]`;
          if (typeof item === "object" && item !== null && !(item instanceof File)) {
            buildFormData(formData, item, arrayKey);
          } else if (item !== null && item !== undefined && item !== "") {
            formData.append(arrayKey, item);
          }
        });
      } else if (typeof value === "object" && value !== null) {
        buildFormData(formData, value, formKey);
      } else if (typeof value === "boolean") {
        formData.append(formKey, value ? "1" : "0");
      } else if (value !== null && value !== undefined) {
        formData.append(formKey, value);
      }
    });
  };

  try {
    const formData = new FormData();
    // Add user_type at the root level as expected by the backend
    formData.append("user_type", "student");
    let localeToSend = (props.uiLocale || unref(locale) || "en").trim().toLowerCase();
    if (localeToSend === "kz") localeToSend = "kk";
    formData.append("locale", ["en", "kk", "ru"].includes(localeToSend) ? localeToSend : "en");
    // Recursively build the rest of the payload from the user object
    buildFormData(formData, user.value as unknown as Record<string, unknown>);

    const response = await authStore.register(formData);
    if (response?.message?.includes("reserve list")) {
      emit(
        "added-to-reserve-list",
        t("Registration limit reached. You have been added to the reserve list.")
      );
    } else {
      // t('Registration successful. Please log in and make due payments.')
      emit("registered", response?.message ? t(response.message) : t("Registration successful"));
    }
  } catch (error: unknown) {
    //NOSONAR
    console.error("registration error", error);
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string; errors?: Record<string, string[]> };
      };
    };
    const response = axiosError.response;
    if (response?.status === 403 && response.data?.message?.includes("closed")) {
      emit("registration-closed");
    } else if (response?.status === 422 && response.data?.errors) {
      const errors = response.data.errors;
      showError(response.data.message || t("Please fix the errors in the form"));

      const fieldToStepMap: Record<string, number> = {
        "student_profile.gender": 0,
        "student_profile.iin": 1,
        email: 1,
        password: 1,
        password_confirmation: 1,
        first_name: 2,
        last_name: 2,
        "student_profile.country": 2,
        "student_profile.region": 2,
        "student_profile.city": 2,
        phone_numbers: 3,
        "student_profile.emergency_contact_name": 4,
        "student_profile.emergency_contact_type": 4,
        "student_profile.emergency_contact_phone": 4,
        "student_profile.emergency_contact_email": 4,
        "student_profile.faculty": 6,
        "student_profile.specialist": 7,
        "student_profile.enrollment_year": 6,
        dormitory_id: 6,
        room_id: 6,
        bed_id: 6,
        "student_profile.files": 7,
        "student_profile.agree_to_dormitory_rules": 8,
      };

      let firstErrorStep = -1;

      for (const serverKey in errors) {
        const message = errors[serverKey][0];

        // Handle file array errors like "student_profile.files.3"
        if (serverKey.startsWith("student_profile.files.")) {
          const index = parseInt(serverKey.split(".")[2], 10);
          if (!isNaN(index) && registrationValidationMessage.value.files) {
            registrationValidationMessage.value.files[index] = message;
          }
          const step = fieldToStepMap["student_profile.files"];
          if (step !== undefined && (firstErrorStep === -1 || step < firstErrorStep)) {
            firstErrorStep = step;
          }
        } else {
          const baseKey = serverKey.split(".")[0]; // e.g., 'student_profile' or 'email'
          const frontendKey = serverKey.replace("student_profile.", "");
          setErr(frontendKey, message);
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
      showError((error as any).response?.data?.message || t("Registration failed"));
    }
  } finally {
    isSubmitting.value = false;
  }
};

const addPhoneField = () => {
  if (!user.value.phone_numbers) {
    user.value.phone_numbers = [];
  }
  user.value.phone_numbers.push("");
};
const removePhoneField = (index: number) => {
  if (user.value.phone_numbers && user.value.phone_numbers.length > 1) {
    user.value.phone_numbers.splice(index, 1);
  }
};
const updateRegistrationFileInput = (index: number, fileOrEvent: File | Event | null) => {
  // The CFileInput component might emit the file directly or an event object.
  // We need to handle both cases to get the actual file.
  const file =
    fileOrEvent instanceof File
      ? fileOrEvent
      : ((fileOrEvent as Event)?.target as HTMLInputElement)?.files?.[0] || null;
  if (user.value.student_profile?.files) {
    user.value.student_profile.files[index] = file;
  }
};

const genderOptions = computed(() => [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
]);
const emergencyContactTypeOptions = [
  { value: "parent", name: t("Parent") },
  { value: "guardian", name: t("Guardian") },
  { value: "other", name: t("Other") },
];
const identificationOptions = computed(() => [
  { value: "passport", name: t("Passport") },
  { value: "national_id", name: t("National ID") },
  { value: "drivers_license", name: t("Driver's License") },
  { value: "other", name: t("Other") },
]);
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
const dormitoryOptions = ref<Dormitory[]>([]);
const loadingDormitories = ref(false);

const hasAvailableDormitories = computed(() => {
  if (!user.value.student_profile?.gender) return true; // Don't block if gender isn't selected yet
  return dormitoryOptions.value.some(
    (dorm: Dormitory) =>
      (dorm.gender === "mixed" || dorm.gender === user.value.student_profile?.gender) &&
      dorm.freeBeds > 0
  );
});

watch(
  () => user.value.student_profile?.gender,
  async (newGender) => {
    if (!newGender) {
      dormitoryOptions.value = [];
      return;
    }
    loadingDormitories.value = true;
    user.value.dormitory_id = null; // Reset dormitory on gender change
    try {
      const response = await dormitoryService.getForRegistration();
      dormitoryOptions.value = response.data || [];
    } catch {
      showError(t("Failed to load dormitories. Please try again."));
    } finally {
      loadingDormitories.value = false; // This will trigger hasAvailableDormitories re-evaluation
    }
  }
);

onMounted(async () => {
  // Public settings are now fetched in App.vue
});

// --- Step Validators ---

// Step 1: Identification
const isIdentificationStepValid = computed(() => {
  const iinValid = registrationValidationState.value.iin === "success";
  const sidValid = settingsStore.publicSettings?.sdu_enabled
    ? registrationValidationState.value.student_id === "success"
    : true;
  return iinValid && sidValid;
});

// Step 2: Gender
const isGenderStepValid = computed(() => {
  // Ensure gender is selected and dormitories are available (or not loading)
  return (
    !!user.value.student_profile?.gender &&
    hasAvailableDormitories.value &&
    !loadingDormitories.value
  );
});

// Step 3: Account
const isAccountStepValid = computed(() => {
  const { password, password_confirmation } = user.value;
  return (
    registrationValidationState.value.email === "success" &&
    !loadingEmailAvailability.value && // Ensure email check is complete
    !!password &&
    password.length >= 6 &&
    !!password_confirmation &&
    password === password_confirmation
  );
});

// Step 3: Personal Details
const isPersonalDetailsStepValid = computed(() => {
  const { first_name, last_name } = user.value;
  return !!first_name?.trim() && !!last_name?.trim();
  // country, region, city are not marked as required in the template, so not included here.
});

// Step 4: Phone Numbers
const isPhoneNumbersStepValid = computed(() => {
  return !!user.value.phone_numbers?.some((phone: string) => phone && phone.trim() !== "");
});

// Step 5: Emergency Contact
const isEmergencyContactStepValid = computed(() => {
  // Require identification fields
  const profile = user.value.student_profile;
  return !!profile?.identification_type?.trim() && !!profile?.identification_number?.trim();
});

// Step 6: Health Information
const isHealthInfoStepValid = computed(() => {
  // No required fields in this step based on the template
  return true;
});

// Step 7: Educational Information
const isEducationalInfoStepValid = computed(() => {
  const { faculty, specialist, enrollment_year } = user.value.student_profile ?? {};
  return (
    !!faculty?.trim() &&
    !!specialist?.trim() &&
    !!enrollment_year &&
    enrollment_year.toString().length === 4
  );
});

// Step 8: Accommodation
const isAccommodationStepValid = computed(() => {
  return !!user.value.dormitory_id && !!user.value.room_id && !!user.value.bed_id;
});

// Step 9: Documents (No required files based on current template)
const isDocumentsStepValid = computed(() => {
  return fileValidationStatus.value.every((isValid) => isValid);
});

// Step 11: Registration & Status
const dormitoryRulesHtml = computed(() => {
  const rules = settingsStore.publicSettings?.dormitory_rules;
  if (!rules) return "";
  if (typeof rules === "string") return rules;
  const loc = (props.uiLocale || locale.value || "en").toString().split("-")[0];
  return rules[loc] || rules.en || "";
});

const isRegistrationStatusStepValid = computed(() => {
  return !!user.value.student_profile?.agree_to_dormitory_rules;
});

const availableRooms = ref<Room[]>([]);
const loadingRooms = ref(false);
const availableBeds = ref<Bed[]>([]);
const loadingBeds = ref(false);
const selectedRoomNumber = ref("");
const selectedRoomPrice = ref<number | null>(null);

const filteredDormitoryOptions = computed(() => {
  const gender = user.value.student_profile?.gender;
  if (!gender) return dormitoryOptions.value;
  return (dormitoryOptions.value || [])
    .filter((dorm: Dormitory) => (dorm.gender === "mixed" || dorm.gender === gender) && dorm.freeBeds > 0)
    .map((dorm: Dormitory) => ({ value: dorm.id.toString(), name: dorm.name }));
});

const selectedRoom = computed(() => {
  return availableRooms.value.find((r: Room) => r.id === user.value.room_id);
});

watch(
  () => user.value.dormitory_id,
  async (dormitoryId) => {
    user.value.room_id = null;
    selectedRoomNumber.value = "";
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
      console.error("Failed to load rooms:", e);
      availableRooms.value = [];
    } finally {
      loadingRooms.value = false;
    }
  }
);

watch(
  () => user.value.room_id,
  async (roomId) => {
    if (user.value.student_profile) user.value.student_profile.bed_id = null;
    selectedRoomPrice.value = null;
    if (!roomId) {
      availableBeds.value = [];
      return;
    }
    loadingBeds.value = true;
    try {
      const room = availableRooms.value.find((r: Room) => r.id === roomId);
      if (room?.beds) {
        selectedRoomNumber.value = room.number;
        selectedRoomPrice.value = room.room_type?.semester_rate
          ? parseFloat(room.room_type.semester_rate)
          : null;
        availableBeds.value = room.beds.filter(
          (bed: Bed) => !bed.is_occupied && !bed.reserved_for_staff
        );
      } else {
        availableBeds.value = [];
      }
    } catch (e) {
      console.error("Failed to load beds:", e);
      availableBeds.value = [];
    } finally {
      loadingBeds.value = false;
    }
  }
);

const roomOptions = computed(() =>
  availableRooms.value.map((r: Room) => {
    return { value: r.id, name: r.number };
  })
);
const bedOptions = computed(() =>
  availableBeds.value.map((b: Bed) => {
    const priceValue = selectedRoomPrice.value;
    const currencyCode = settingsStore.publicSettings?.currency_symbol;
    let priceString = "";
    if (priceValue != null) {
      const currencySymbol = getCurrencySymbol(currencyCode);
      priceString = ` - ${Math.round(priceValue)} ${currencySymbol}`;
    }
    return { value: b.id, name: `${selectedRoomNumber.value}-${b.bed_number}${priceString}` }; //NOSONAR
  })
);
</script>
