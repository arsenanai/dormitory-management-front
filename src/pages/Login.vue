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
                  />
                </div>

                <CButton type="submit" class="mt-4 w-full" variant="primary">
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
              <form class="flex flex-col gap-4" @submit.prevent="handleRegistration">
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
                      :placeholder="t('Fullname')"
                      required
                      :validationState="registrationValidationState.name"
                      :validationMessage="registrationValidationMessage.name"
                      pattern="^[a-zA-Z\s]+$"
                    />
                  </div>

                  <div>
                    <CSelect
                      id="registration-faculty"
                      v-model="registration.faculty"
                      :options="facultyOptions"
                      :label="t('Faculty')"
                      required
                      :validationState="registrationValidationState.faculty"
                      :validationMessage="registrationValidationMessage.faculty"
                    />
                  </div>

                  <div>
                    <CSelect
                      id="registration-specialist"
                      v-model="registration.specialist"
                      :options="specialistOptions"
                      :label="t('Specialist')"
                      required
                      :validationState="registrationValidationState.specialist"
                      :validationMessage="
                        registrationValidationMessage.specialist
                      "
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
                    <CSelect
                      id="registration-dormitory"
                      v-model="registration.dormitory"
                      :options="dormitoryOptions"
                      :label="t('Select Dormitory')"
                      required
                      :validationState="registrationValidationState.dormitory"
                      :validationMessage="registrationValidationMessage.dormitory"
                    />
                  </div>

                  <div>
                    <CSelect
                      id="registration-room"
                      data-testid="registration-room"
                      v-model="registration.room"
                      :options="roomOptions"
                      :label="t('Select Room')"
                      :disabled="!registration.dormitory || loadingRooms"
                      required
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
import i18n from '@/i18n';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

const registrationClosed = ref(false);
const reserveListMessage = ref("");
const successMessage = ref("");

const handleRegistration = async () => {
  // Validate registration fields
  const validationErrors = [];
  
  if (!registration.value.name?.trim()) {
    validationErrors.push(t('Name is required'));
  }
  
  if (!registration.value.email?.trim()) {
    validationErrors.push(t('Email is required'));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.value.email)) {
    validationErrors.push(t('Please enter a valid email address'));
  }
  
  if (!registration.value.password?.trim()) {
    validationErrors.push(t('Password is required'));
  } else if (registration.value.password.length < 6) {
    validationErrors.push(t('Password must be at least 6 characters'));
  }
  
  if (registration.value.password !== registration.value.confirmPassword) {
    validationErrors.push(t('Passwords do not match'));
  }
  
  if (validationErrors.length > 0) {
    showError(validationErrors.join(', '));
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
      room_id: registration.value.room?.id || null,
      password: registration.value.password,
      password_confirmation: registration.value.confirmPassword,
      deal_number: registration.value.dealNumber,
      city_id: registration.value.city?.id || null,
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
    null, // room
    "", // password
    "", // confirmPassword
    "", // dealNumber
    null, // city
    [null, null, null, null] as (File | null)[], // files
    false, // agreeToDormitoryRules
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

const facultyOptions = [
  { value: "engineering", name: "Engineering and natural sciences" },
  { value: "business", name: "Business and economics" },
  { value: "law", name: "Law and social sciences" },
];

const specialistOptions = [
  { value: "computer_sciences", name: "Computer sciences" },
  { value: "mechanical_engineering", name: "Mechanical engineering" },
  { value: "civil_engineering", name: "Civil engineering" },
];

const genderOptions = [
  { value: "male", name: "Male" },
  { value: "female", name: "Female" },
];

const dormitoryOptions = ref([]);

// Fetch dormitories on component mount
onMounted(async () => {
  try {
    const response = await dormitoryService.getAll();
    dormitoryOptions.value = response.data.data.map(dorm => ({
      value: dorm.id.toString(),
      name: dorm.name
    }));
  } catch (error) {
    console.error('Failed to fetch dormitories:', error);
    // Fallback to hardcoded options if API fails
    dormitoryOptions.value = [
      { value: "4", name: "A Block" },
    ];
  }
});

const availableRooms = ref([]);
const allAvailableBeds = ref([]);
const loadingRooms = ref(false);

watch(() => registration.value.dormitory, async (dormitoryId) => {
  registration.value.room = ""; // Reset room selection
  if (!dormitoryId) {
    availableRooms.value = [];
    allAvailableBeds.value = [];
    return;
  }
  loadingRooms.value = true;
  try {
    const response = await roomService.getAvailable({ dormitory_id: dormitoryId });
    availableRooms.value = response.data || [];
    allAvailableBeds.value = availableRooms.value.flatMap(room => room.beds.map(bed => ({ ...bed, room })));
  } catch (e) {
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
  if (!registration.value.room) return [];
  return allAvailableBeds.value
    .filter(b => b.room.id === registration.value.room.id)
    .map(bed => ({
      value: bed,
      name: `Bed ${bed.number}${bed.reserved_for_staff ? ' (Staff Reserved)' : ''}`,
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
    showError(t("Login failed"));
  }
};
const handleGuestRegistration = async () => {
  try {
    const payload = {
      ...guest.value,
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
