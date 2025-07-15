<template>
  <div
    class="flex min-h-screen items-start justify-center bg-blue-50 py-2 lg:items-center lg:p-4"
  >
    <div
      class="w-full max-w-md"
      :class="activeTab === 'registration' ? 'lg:max-w-5xl' : 'lg:max-w-md'"
    >
      <div class="mb-4 flex justify-center lg:justify-end lg:p-0">
        <CSelect
          id="language-selector"
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
                  placeholder="example@domain.com"
                  required
                  autocomplete="email"
                  :validationState="credentialsValidationState.email"
                  validationstate-attr="validationstate"
                  :validationMessage="credentialsValidationMessage.email"
                  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
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
              
              <!-- Password Reset Component -->
              <div class="mt-4">
                <PasswordReset />
              </div>
            </form>
          </CTab>

          <!-- Registration Tab -->
          <CTab name="registration" :title="t('Registration')">
            <form class="flex flex-col gap-4">
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
                    placeholder="example@domain.com"
                    required
                    :validationState="registrationValidationState.email"
                    :validationMessage="registrationValidationMessage.email"
                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
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
                    v-model="registration.room"
                    :options="roomOptions"
                    :label="t('Select Room')"
                    required
                    :validationState="registrationValidationState.room"
                    :validationMessage="registrationValidationMessage.room"
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
            <form class="flex flex-col gap-2">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

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
  "063 Form",
  "075 Form",
  "ID Check",
  "Bank Check",
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

const roomTypeOptions = [
  { value: "single", name: "Single Room" },
  { value: "double", name: "Double Room" },
  { value: "suite", name: "Suite" },
];

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

const dormitoryOptions = [
  { value: "a_block", name: "A-Block" },
  { value: "b_block", name: "B-Block" },
];

const roomOptions = [
  { value: "a210", name: "A210" },
  { value: "a211", name: "A211" },
  { value: "a212", name: "A212" },
];

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
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
</script>
