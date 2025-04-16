<template>
  <div class="flex min-h-screen items-start justify-center bg-blue-50 py-2 lg:items-center lg:p-4">
    <div class="w-full max-w-md" :class="activeTab === 'registration' ? 'lg:max-w-5xl' : 'lg:max-w-md'">
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
          <CTab name="login" :title="t('Login')">
            <form class="flex flex-col gap-2" @submit.prevent="handleLogin">
              <div>
                <CInput
                  id="login-email"
                  v-model="credentials.email"
                  type="email"
                  :label="t('Email')"
                  :placeholder="t('example@domain.com')"
                  required
                  autocomplete="username"
                  :validationState="credentialsValidationState.email"
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
                  autocomplete="current-password"
                  :validationState="credentialsValidationState.password"
                  :validationMessage="credentialsValidationMessage.password"
                />
              </div>

              <CButton type="submit" class="w-full mt-4" variant="primary">
                {{ t("Login") }}
              </CButton>
            </form>
          </CTab>

          <CTab name="registration" :title="t('Registration')">
            <form class="flex flex-col gap-2">
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
                  />
                </div>

                <div>
                  <CInput
                    id="registration-name"
                    v-model="registration.name"
                    type="text"
                    :label="t('Fullname')"
                    :placeholder="t('Anna Fettisov')"
                    required
                    :validationState="registrationValidationState.name"
                    :validationMessage="registrationValidationMessage.name"
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
                    :validationState="registrationValidationState.enrollmentYear"
                    :validationMessage="registrationValidationMessage.enrollmentYear"
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
                    :placeholder="t('a.fettisov@gmail.com')"
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
                  />
                </div>

                <div>
                  <CInput
                    id="registration-confirm-password"
                    v-model="registration.confirmPassword"
                    type="password"
                    :label="t('Confirm Password')"
                    required
                    :validationState="registrationValidationState.confirmPassword"
                    :validationMessage="registrationValidationMessage.confirmPassword"
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

              <div>
                <CCheckbox
                  id="registration-reserve-list"
                  v-model="registration.addToReserveList"
                  :label="t('Add to Reserve List')"
                />
              </div>

              <div class="mt-4">
                <div v-for="(file, index) in registration.files" :key="index" class="mb-2">
                  <CFileInput
                    :id="`guest-file-${index}`"
                    :description="t('Documents to be Uploaded')"
                    :allowedExtensions="['jpg', 'jpeg', 'png', 'pdf']"
                    :maxFileSize="2 * 1024 * 1024"
                    @change="(file) => updateRegistrationFileInput(index, file)"
                  />
                </div>
                <div class="flex justify-end">
                  <CButton @click="addRegistrationFileInput">
                    {{ t("Upload more files") }}
                  </CButton>
                </div>
              </div>

              <div class="">
                <div class="mx-auto h-24 w-24">
                  <img
                    :src="qrCodeUrl"
                    :alt="t('Kaspi QR Code')"
                    class="h-full w-full object-contain"
                  />
                </div>
                <p class="text-center">{{ t("Kaspi QR Code") }}</p>
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
                <CButton type="submit" class="w-full mt-4" variant="primary">
                  {{ t("Register") }}
                </CButton>
              </div>
            </form>
          </CTab>

          <CTab name="guests" :title="t('Guests')">
            <form class="flex flex-col gap-2">
              <CSelect
                id="guest-room-type"
                v-model="guest.roomType"
                :options="roomTypeOptions"
                :label="t('Room Type')"
                required
              />

              <CInput
                id="guest-name"
                v-model="guest.name"
                type="text"
                :label="t('Fullname')"
                :placeholder="t('Anna Fettisova')"
                required
              />
              
              <div class="mt-4">
                <div v-for="(file, index) in guest.files" :key="index" class="mb-2">
                  <CFileInput
                    :id="`guest-file-${index}`"
                    :description="t('Upload ID Card or Passport')"
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

              

              <CButton type="submit" class="w-full mt-4" variant="primary">
                {{ t("Book Room") }}
              </CButton>
            </form>
          </CTab>
        </CTabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import CSelect from "@/components/CSelect.vue";
import CTabs from "@/components/CTabs.vue";
import CTab from "@/components/CTab.vue";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import CFileInput from "@/components/CFileInput.vue";

const { t } = useI18n();
const router = useRouter();

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

const credentialsValidationState = ref({
  email: "",
  password: "",
});

const credentialsValidationMessage = ref({
  email: "",
  password: "",
});

const registration = ref({
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
  addToReserveList: false,
  files: [null],
  agreeToDormitoryRules: false,
});

const registrationValidationState = ref({
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

const registrationValidationMessage = ref({
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
  if (!credentials.value.email || !credentials.value.password) {
    credentialsValidationState.value.email = "error";
    credentialsValidationMessage.value.email = t("Email is required.");
    credentialsValidationState.value.password = "error";
    credentialsValidationMessage.value.password = t("Password is required.");
    return;
  }

  try {
    router.push("/main");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
</script>