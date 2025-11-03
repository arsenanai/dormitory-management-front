<template>
  <div class="min-h-screen flex items-center justify-center bg-primary-50 py-2 lg:p-4">
    <div class="w-full flex flex-col items-center">
      <div v-if="successMessage" class="bg-green-100 text-green-800 p-3 rounded mb-4 w-full max-w-md mx-auto">
        {{ successMessage }}
      </div>
      <div class="w-full" :class="activeTab === 'registration' ? 'lg:max-w-5xl' : 'max-w-md'">
        <div class="mb-4 w-full flex justify-end">
          <CSelect
            id="language-switcher"
            v-model="selectedLanguage"
            :options="languageOptions"
            :label="t('Language')"
            class="w-40"
          />
        </div>
        <div class="rounded-lg bg-white shadow-lg">
          <CTabs v-model="activeTab">
            <!-- Login Tab -->
            <CTab name="login" :title="t('Login')">
              <form
                class="flex flex-col gap-2"
                @submit.prevent="handleLogin"
                novalidate
              >
                <div>
                  <CInput
                    id="login-email"
                    v-model="credentials.email"
                    type="email"
                    :label="t('Email')"
                    :placeholder="emailPlaceholder"
                    required
                    autocomplete="email"
                    :validationState="credentialsValidationState.email"
                    validationstate-attr="validationstate"
                    :validationMessage="credentialsValidationMessage.email"
                    data-testid="email-input"
                  />
                </div>

                <div>
                  <CInput
                    id="login-password"
                    v-model="credentials.password"
                    type="password"
                    :label="t('Password')"
                    required
                    autocomplete="password"
                    :validationState="credentialsValidationState.password"
                    validationstate-attr="validationstate"
                    :validationMessage="credentialsValidationMessage.password"
                    pattern=".{6,}"
                    data-testid="password-input"
                  />
                </div>

                <CButton type="submit" class="mt-4 w-full" variant="primary" data-testid="login-button">
                  {{ t("Login") }}
                </CButton>
              </form>
              <div class="mt-2 flex justify-end">
                <a
                  class="text-xs text-primary-600 hover:text-primary-800 hover:underline cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded"
                  data-testid="forgot-password"
                  @click="showPasswordReset = true"
                  tabindex="0"
                  role="button"
                  @keydown.enter="showPasswordReset = true"
                  @keydown.space.prevent="showPasswordReset = true"
                >
                  {{ t('Forgot password') }}
                </a>
              </div>
              <Teleport to="body">
                <PasswordReset v-model="showPasswordReset" />
              </Teleport>
            </CTab>

            <!-- Registration Tab -->
            <CTab name="registration" :title="t('Registration')" data-testid="registration-tab">
              <form class="flex flex-col gap-4" @submit.prevent="handleRegistration" novalidate>
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <CInput
                      id="registration-iin"
                      v-model="registration.iin"
                      type="search"
                      :label="t('IIN')"
                      required
                      :validationState="registrationValidationState.iin"
                      :validationMessage="registrationValidationMessage.iin"
                      pattern="\d{12}"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-name"
                      v-model="registration.name"
                      type="text"
                      :label="t('Fullname')"
                      :placeholder="t('Name Surname')"
                      required
                      :validationState="registrationValidationState.name"
                      :validationMessage="registrationValidationMessage.name"
                      pattern="^[a-zA-Z\s]+$"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-faculty"
                      v-model="registration.faculty"
                      type="text"
                      :label="t('Faculty')"
                      :placeholder="t('Enter Faculty Name')"
                      required
                      :validationState="registrationValidationState.faculty"
                      :validationMessage="registrationValidationMessage.faculty"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-specialist"
                      v-model="registration.specialist"
                      type="text"
                      :label="t('Specialist')"
                      :placeholder="t('Enter Specialty/Program Name')"
                      required
                      :validationState="registrationValidationState.specialist"
                      :validationMessage="registrationValidationMessage.specialist"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-enrollment-year"
                      v-model="registration.enrollmentYear"
                      type="text"
                      :label="t('Enrollment Year')"
                      required
                      :validationState="
                        registrationValidationState.enrollmentYear
                      "
                      :validationMessage="
                        registrationValidationMessage.enrollmentYear
                      "
                      pattern="^\d{4}$"
                    />
                  </div>

                  <div>
                    <CSelect
                      id="registration-gender"
                      v-model="registration.gender"
                      :options="genderOptions"
                      :label="t('Gender')"
                      required
                      :validationState="registrationValidationState.gender"
                      :validationMessage="registrationValidationMessage.gender"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-email"
                      v-model="registration.email"
                      type="email"
                      :label="t('Login Email')"
                      :placeholder="emailPlaceholder"
                      required
                      :validationState="registrationValidationState.email"
                      :validationMessage="registrationValidationMessage.email"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-password"
                      v-model="registration.password"
                      type="password"
                      :label="t('Password')"
                      required
                      :validationState="registrationValidationState.password"
                      :validationMessage="registrationValidationMessage.password"
                      pattern=".{6,}"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-confirm-password"
                      v-model="registration.confirmPassword"
                      type="password"
                      :label="t('Confirm Password')"
                      required
                      :validationState="
                        registrationValidationState.confirmPassword
                      "
                      :validationMessage="
                        registrationValidationMessage.confirmPassword
                      "
                      pattern=".{6,}"
                    />
                  </div>
                  <div>
                    <CInput
                      id="registration-deal-number"
                      v-model="registration.dealNumber"
                      type="text"
                      :label="t('Deal Number')"
                      :placeholder="t('Enter Deal Number')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ t("Phone Numbers") }}
                    </label>
                    <div v-for="(phone, index) in registration.phoneNumbers" :key="index" class="flex items-center gap-2 mb-2">
                      <CInput
                        :id="`phone-number-${index}`"
                        v-model="registration.phoneNumbers[index]"
                        type="tel"
                        :placeholder="t('Enter Phone Number')"
                        class="flex-1"
                      />
                      <CButton type="button" variant="danger" v-if="registration.phoneNumbers.length > 1" @click="removePhoneField(index)">-</CButton>
                    </div>
                    <CButton type="button" @click="addPhoneField" class="w-full">{{ t("Add more") }}</CButton>
                  </div>

                  <div>
                    <div class="flex items-end gap-2">
                      <div class="flex-1">
                        <CSelect
                          id="registration-dormitory"
                          v-model="registration.dormitoryId"
                          :options="filteredDormitoryOptions"
                          :label="t('Select Dormitory')"
                          required
                          :disabled="!registration.gender"
                          :placeholder="filteredDormitoryOptions.length === 0 ? t('No Dormitory exist for selected gender') : t('Select Dormitory')"
                          :validationState="registrationValidationState.dormitory"
                          :validationMessage="registrationValidationMessage.dormitory"
                        />
                      </div>
                      <CButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        :disabled="loadingDormitories"
                        @click="fetchDormitories"
                        data-testid="refresh-dormitories"
                        class="mb-1"
                      >
                        <svg v-if="loadingDormitories" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                      </CButton>
                    </div>
                  </div>

                  <div>
                    <CSelect
                      id="registration-room"
                      data-testid="registration-room" 
                      v-model="registration.roomId"
                      :options="roomOptions"
                      :label="t('Select Room')"
                      :disabled="!registration.dormitoryId || loadingRooms"
                      :validationState="registrationValidationState.room"
                      :validationMessage="registrationValidationMessage.room"
                    />
                  </div>

                  <!-- Location Information -->
                  <div>
                    <CInput
                      id="registration-country"
                      v-model="registration.country"
                      type="text"
                      :label="t('Country')"
                      :placeholder="t('Enter Country')"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-region"
                      v-model="registration.region"
                      type="text"
                      :label="t('Region')"
                      :placeholder="t('Enter Region')"
                    />
                  </div>

                  <div>
                    <CInput
                      id="registration-city"
                      v-model="registration.city"
                      type="text"
                      :label="t('City')"
                      :placeholder="t('Enter City')"
                    />
                  </div>
                </div>

                <div
                  v-for="(fileLabel, index) in registrationFileLabels"
                  :key="index"
                >
                  <CFileInput
                    :id="`registration-file-${index}`"
                    :name="fileLabel"
                    :label="t(fileLabel)"
                    :allowedExtensions="['jpg', 'jpeg', 'png', 'pdf']"
                    :maxFileSize="2 * 1024 * 1024"
                    @change="(file) => updateRegistrationFileInput(index, file)"
                  />
                </div>

                <div>
                  <CCheckbox
                    id="registration-agree-rules"
                    v-model="registration.agreeToDormitoryRules"
                    :label="t('I Agree to Dormitory Rules')"
                    required
                  />
                </div>

                <div>
                  <CButton type="submit" class="mt-4 w-full" variant="primary">
                    {{ t("Register") }}
                  </CButton>
                </div>
              </form>
            </CTab>

            <CTab name="guests" :title="t('Guests')">
              <form class="flex flex-col gap-2" @submit.prevent="handleGuestRegistration">
                <div>
                  <CSelect
                    id="guest-room-type"
                    v-model="guest.roomType"
                    :options="roomTypeOptions"
                    :label="t('Room Type')"
                    required
                  />
                </div>
                <div>
                  <CInput
                    id="guest-name"
                    v-model="guest.name"
                    type="text"
                    :label="t('Fullname')"
                    :placeholder="t('Fullname')"
                    required
                    pattern="^[a-zA-Z\s]+$"
                  />
                </div>
                <div>
                  <div class="flex flex-col gap-2">
                    <div
                      v-for="(file, index) in guest.files"
                      :key="index"
                      id="documents"
                    >
                      <CFileInput
                        :id="`guest-file-${index}`"
                        :label="`${t('Document')} ${index + 1}`"
                        :allowedExtensions="['jpg', 'jpeg', 'png', 'pdf']"
                        :maxFileSize="2 * 1024 * 1024"
                        @change="(file) => updateGuestFileInput(index, file)"
                      />
                    </div>
                    <div class="flex justify-end">
                      <CButton @click="addGuestFileInput">
                        {{ t("Upload more files") }}
                      </CButton>
                    </div>
                  </div>
                </div>

                <CButton type="submit" class="mt-4 w-full" variant="primary">
                  {{ t("Book Room") }}
                </CButton>
              </form>
            </CTab>
          </CTabs>
        </div>
      </div>
      <div v-if="registrationClosed" class="bg-red-100 text-red-800 p-3 rounded mb-4">
        {{ t('Registration is closed. Student limit reached.') }}
      </div>
      <div v-if="reserveListMessage" class="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
        {{ reserveListMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import CSelect from "@/components/CSelect.vue";
import CTabs from "@/components/CTabs.vue";
import CTab from "@/components/CTab.vue";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import CFileInput from "@/components/CFileInput.vue";
import PasswordReset from "@/components/PasswordReset.vue";
import { UserRegistration, UserStatus } from "@/models/User";
import { useToast } from "@/composables/useToast";
import { ref, onMounted, computed, watch } from 'vue';
import { roomService, dormitoryService } from '@/services/api';
import { academicService } from '@/services/academicService';
import i18n from '@/i18n';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

const registrationClosed = ref(false);
const reserveListMessage = ref("");
const successMessage = ref("");

const handleRegistration = async () => {
  // Reset per-field validation
  Object.assign(registrationValidationState.value, {
    iin: '', name: '', faculty: '', specialist: '', enrollmentYear: '', gender: '',
    email: '', password: '', confirmPassword: '', dormitory: '', room: ''
  });
  Object.assign(registrationValidationMessage.value, {
    iin: '', name: '', faculty: '', specialist: '', enrollmentYear: '', gender: '',
    email: '', password: '', confirmPassword: '', dormitory: '', room: ''
  });

  let hasError = false;
  const setErr = (field: keyof typeof registrationValidationState.value, msg: string) => {
    // @ts-ignore
    registrationValidationState.value[field] = 'error';
    // @ts-ignore
    registrationValidationMessage.value[field] = msg;
    hasError = true;
  };

  // IIN
  if (!/^\d{12}$/.test(registration.value.iin || '')) setErr('iin', t('IIN must be 12 digits'));
  // Name
  if (!registration.value.name?.trim()) setErr('name', t('Name is required'));
  // Faculty
  if (!registration.value.faculty?.trim()) setErr('faculty', t('Faculty is required'));
  // Specialist
  if (!registration.value.specialist?.trim()) setErr('specialist', t('Specialist is required'));
  // Enrollment Year
  if (!/^\d{4}$/.test(registration.value.enrollmentYear || '')) setErr('enrollmentYear', t('Enter 4-digit year'));
  // Gender
  if (!registration.value.gender) setErr('gender', t('Gender is required'));
  // Email
  const emailOk = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(registration.value.email || '');
  if (!emailOk) setErr('email', t('Invalid email format.'));
  // Passwords
  if (!registration.value.password || registration.value.password.length < 6) setErr('password', t('Password must be at least 6 characters'));
  if (registration.value.password !== registration.value.confirmPassword) setErr('confirmPassword', t('Passwords do not match'));
  // Dormitory & Room validation
  if (!registration.value.dormitoryId) setErr('dormitory', t('Select a dormitory'));
  if (!registration.value.roomId) setErr('room', t('Select a room'));
  // Rules - This was the source of the silent failure.
  if (!registration.value.agreeToDormitoryRules) {
    showError(t('Please agree to dormitory rules'));
    hasError = true; // Explicitly mark that there is an error.
  }

  if (hasError) {
    showError(t('Please fix the errors in the form'));
    return;
  }

  try {
    const payload = {
      iin: registration.value.iin,
      name: registration.value.name,
      faculty: registration.value.faculty,
      specialist: registration.value.specialist,
      enrollment_year: parseInt(registration.value.enrollmentYear),
      gender: registration.value.gender,
      email: registration.value.email,
      phone_numbers: registration.value.phoneNumbers.filter(p => p && p.trim() !== ''),
      room_id: registration.value.roomId,
      password: registration.value.password,
      password_confirmation: registration.value.confirmPassword,
      deal_number: registration.value.dealNumber,
      country: registration.value.country,
      region: registration.value.region,
      city: registration.value.city,
      files: registration.value.files.filter(f => f !== null && f instanceof File),
      agree_to_dormitory_rules: registration.value.agreeToDormitoryRules,
      user_type: 'student',
    };
    const response = await authStore.register(payload);
    if (response && response.message && response.message.includes('reserve list')) {
      reserveListMessage.value = t('Registration limit reached. You have been added to the reserve list.');
      showSuccess(reserveListMessage.value);
      activeTab.value = 'login';
      return;
    }
    if (response && response.message) {
      successMessage.value = response.message;
      showSuccess(response.message);
    } else {
      successMessage.value = t('Registration successful');
      showSuccess(successMessage.value);
    }
    activeTab.value = 'login';
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.response && error.response.status === 403 && error.response.data && error.response.data.message && error.response.data.message.includes('closed')) {
      registrationClosed.value = true;
      showError(t('Registration is closed. Student limit reached.'));
    } else {
      showError(t('Registration failed'));
    }
  }
};
const selectedLanguage = ref("en");
const languageOptions = [
  { value: "en", name: "English" },
  { value: "kk", name: "Қазақша" },
  { value: "ru", name: "Русский" },
];

const activeTab = ref("login");

const credentials = ref({
  email: "",
  password: "",
});

const credentialsValidationState = ref<{
  email: "" | "error" | "success";
  password: "" | "error" | "success";
}>({
  email: "",
  password: "",
});

const credentialsValidationMessage = ref({
  email: "",
  password: "",
});
import { ref } from 'vue';
const showPasswordReset = ref(false);
// Debug watcher removed

// Registration Form Data
const registration = ref(
  new UserRegistration(
    "", // iin
    "", // name
    "", // faculty
    "", // specialist
    "", // enrollmentYear
    "", // gender
    "", // email
    [""], // phoneNumbers
    null, // roomId
    null, // dormitoryId
    "", // password
    "", // confirmPassword
    "", // dealNumber
    "", // country
    "", // region
    "", // city
    [null, null, null, null] as (File | null)[], // files
    false, // agreeToDormitoryRules
    null, // dormitoryId
    "reserved", // status (UserStatus)
    [], // roles
  ),
);

// Fixed file input labels
const registrationFileLabels = [
  t("063 Form"),
  t("075 Form"),
  t("ID Check"),
  t("Bank Check"),
];

const registrationValidationState = ref<{
  iin: "" | "error" | "success";
  name: "" | "error" | "success";
  faculty: "" | "error" | "success";
  specialist: "" | "error" | "success";
  enrollmentYear: "" | "error" | "success";
  gender: "" | "error" | "success";
  email: "" | "error" | "success";
  password: "" | "error" | "success";
  confirmPassword: "" | "error" | "success";
  dormitory: "" | "error" | "success";
  room: "" | "error" | "success";
}>({
  iin: "",
  name: "",
  faculty: "",
  specialist: "",
  enrollmentYear: "",
  gender: "",
  email: "",
  password: "",
  confirmPassword: "",
  dormitory: "",
  room: "",
});

const registrationValidationMessage = ref<{
  iin: string;
  name: string;
  faculty: string;
  specialist: string;
  enrollmentYear: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
  dormitory: string;
  room: string;
}>({
  iin: "",
  name: "",
  faculty: "",
  specialist: "",
  enrollmentYear: "",
  gender: "",
  email: "",
  password: "",
  confirmPassword: "",
  dormitory: "",
  room: "",
});

const guest = ref({
  roomType: "",
  name: "",
  files: [null],
});

import { roomTypeService } from '@/services/api';
import { RoomType } from '@/models/RoomType';
const roomTypeOptions = ref<{ value: string; name: string }[]>([]);

async function fetchRoomTypes() {
  try {
    const response = await roomTypeService.getAll();
    // Only allow 'standard' and 'lux' (case-insensitive)
    const allowed = ['standard', 'lux'];
    roomTypeOptions.value = (response.data as RoomType[])
      .filter(rt => allowed.includes(rt.name.toLowerCase()))
      .map(rt => ({
        value: rt.id,
        name: t(rt.name.charAt(0).toUpperCase() + rt.name.slice(1)),
      }));
  } catch (e) {
    roomTypeOptions.value = [];
  }
}

onMounted(fetchRoomTypes);
watch(() => i18n.global.locale, fetchRoomTypes);

const addGuestFileInput = (event) => {
  guest.value.files.push(null);
};

const updateGuestFileInput = (index, file) => {
  guest.value.files[index] = file;
};

const addPhoneField = () => {
  registration.value.phoneNumbers.push('');
};

const removePhoneField = (index: number) => {
  if (registration.value.phoneNumbers.length > 1) {
    registration.value.phoneNumbers.splice(index, 1);
  }
};
const genderOptions = [
  { value: "male", name: "Male" },
  { value: "female", name: "Female" },
];

const dormitoryOptions = ref([]);
const loadingDormitories = ref(false);

// Function to fetch dormitories
const fetchDormitories = async () => {
  loadingDormitories.value = true;
  try {
    const response = await dormitoryService.getAll();
    // API returns an array directly, not wrapped in data.data
    const dormitories = Array.isArray(response.data) ? response.data : (response.data.data || []);
    dormitoryOptions.value = dormitories.map(dorm => ({
      value: dorm.id.toString(),
      name: dorm.name,
      gender: dorm.gender, // Keep the gender property for filtering
    }));
    console.log('✅ Loaded dormitories:', dormitoryOptions.value.length);
  } catch (error) {
    console.error('Failed to fetch dormitories:', error);
    // Fallback to hardcoded options if API fails
    dormitoryOptions.value = [
      { value: "3", name: "A Block" }, // Use dormitory 3 which has beds
    ];
  } finally {
    loadingDormitories.value = false;
  }
};

// Fetch dormitories on component mount
onMounted(async () => {
  await fetchDormitories();
});

// Watch for tab changes to refresh dormitories when registration tab is activated
watch(activeTab, async (newTab) => {
  if (newTab === 'registration') {
    // Refresh dormitories when switching to registration tab
    await fetchDormitories();
  }
});

const availableRooms = ref<any[]>([]);
const allAvailableBeds = ref([]);
const loadingRooms = ref(false);

const filteredDormitoryOptions = computed(() => {
  const gender = registration.value.gender;
  if (!gender) {
    return dormitoryOptions.value;
  }
  return dormitoryOptions.value.filter(dorm => {
    return dorm.gender === 'mixed' || dorm.gender === gender;
  });
});

watch(() => registration.value.dormitoryId, async (dormitoryId) => {
  registration.value.roomId = null; // Reset room selection
  if (!dormitoryId) {
    availableRooms.value = [];
    allAvailableBeds.value = [];
    return;
  }
  loadingRooms.value = true;
  try {
    console.log('🔄 Loading rooms for dormitory:', dormitoryId);
    
    // Use the new public registration endpoint with full URL
    const response = await fetch(`/api/dormitories/${dormitoryId}/registration`);
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('🔍 API response data:', data);
    
    if (data.data && data.data.rooms) {
      availableRooms.value = data.data.rooms;
      console.log('✅ Loaded rooms from registration endpoint:', availableRooms.value.length);
    } else {
      availableRooms.value = [];
      console.log('⚠️ No rooms found in dormitory data');
      console.log('🔍 Full response:', data);
    }
    
    // Extract beds from rooms
    allAvailableBeds.value = availableRooms.value.flatMap(room => 
      (room.beds || []).map(bed => ({ ...bed, room }))
    );
    
    console.log('📊 Total rooms available:', availableRooms.value.length);
    console.log('📊 Total beds available:', allAvailableBeds.value.length);
    
  } catch (e) {
    console.error('❌ Failed to load rooms:', e);
    availableRooms.value = [];
    allAvailableBeds.value = [];
  } finally {
    loadingRooms.value = false;
  }
});

const roomOptions = computed(() =>
  availableRooms.value.map((r) => ({ value: r.id, name: r.number }))
);
const bedOptions = computed(() => {
  if (!registration.value.roomId) return [];
  return allAvailableBeds.value
    .filter(b => b.room.id === registration.value.roomId)
    .map(bed => ({
      value: bed,
      name: `${bed.room.number}-${bed.number}${bed.reserved_for_staff ? ' (Staff Reserved)' : ''}`,
      disabled: bed.reserved_for_staff
    }));
});

const statusOptions = [
  { value: "reserved", name: t("Reserved") },
  { value: "indoor", name: t("Indoor") },
  { value: "outdoor", name: t("Outdoor") },
];

const addRegistrationFileInput = () => {
  registration.value.files.push(null);
};

const updateRegistrationFileInput = (index, file) => {
  registration.value.files[index] = file;
};

const qrCodeUrl = ref(
  `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Kaspi%20QR%20Code`,
);

const handleLogin = async () => {
  // Reset validation states
  credentialsValidationState.value.email = "";
  credentialsValidationMessage.value.email = "";
  credentialsValidationState.value.password = "";
  credentialsValidationMessage.value.password = "";

  // Email validation
  const emailPattern = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!credentials.value.email) {
    credentialsValidationState.value.email = "error";
    credentialsValidationMessage.value.email = t("Email is required.");
  } else if (!emailPattern.test(credentials.value.email)) {
    credentialsValidationState.value.email = "error";
    credentialsValidationMessage.value.email = t("Invalid email format.");
  } else {
    credentialsValidationState.value.email = "success";
  }

  // Password validation
  if (!credentials.value.password) {
    credentialsValidationState.value.password = "error";
    credentialsValidationMessage.value.password = t("Password is required.");
  } else if (credentials.value.password.length < 6) {
    credentialsValidationState.value.password = "error";
    credentialsValidationMessage.value.password = t(
      "Password must be at least 6 characters long.",
    );
  } else {
    credentialsValidationState.value.password = "success";
  }

  // If validation fails, stop submission
  if (
    credentialsValidationState.value.email === "error" ||
    credentialsValidationState.value.password === "error"
  ) {
    return;
  }

  // Proceed with login
  try {
    await authStore.login(credentials.value);
    // The auth store will handle the redirect
    showSuccess(t("Login successful"));
  } catch (error) {
    // possible messages
    // t('auth.not_assigned_admin')
    // t('auth.not_approved')
    // t('auth.invalid_credentials')
    showError(t("Login failed") + ": "+ t(error.response.data.message));
  }
};
const handleGuestRegistration = async () => {
  try {
    const payload = {
      name: guest.value.name,
      room_type: guest.value.roomType, // Corrected from roomType to room_type
      user_type: 'guest',
    };
    const response = await authStore.register(payload);
    if (response && response.message) {
      successMessage.value = response.message;
      showSuccess(response.message);
    } else {
      successMessage.value = t('Guest registration successful');
      showSuccess(successMessage.value);
    }
    activeTab.value = 'login';
  } catch (error) {
    showError(t('Registration failed'));
  }
};

// Computed email placeholder based on selected language
const emailPlaceholder = computed(() => {
  switch (selectedLanguage.value) {
    case 'kk':
      return 'мысалы: user@mysdu.kz';
    case 'ru':
      return 'например: user@mysdu.kz';
    default:
      return 'example@domain.com';
  }
});

// Watch for language change and update i18n locale
watch(selectedLanguage, (newLocale) => {
  i18n.global.locale.value = newLocale;
});
</script>
