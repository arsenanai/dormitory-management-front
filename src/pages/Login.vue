<template>
  <div
    class="flex min-h-screen items-start justify-center bg-blue-50 py-2 lg:items-center lg:p-4"
  >
    <div class="w-full max-w-md" :class="activeTab === 'registration' ? 'lg:max-w-5xl': 'lg:max-w-md'">
      <FlowbiteThemable :theme="theme">
        <!-- Language Selector -->
        <div class="mb-4 flex justify-center lg:justify-end lg:p-0">
          <FwbSelect
            v-model="selectedLanguage"
            :options="languageOptions"
            class="w-40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Login Card -->
        <div class="rounded-lg bg-white shadow-lg">
          <FwbTabs v-model="activeTab" variant="underline" class="p-4 lg:p-8">
            <FwbTab name="login" :title="t('Login')">
              <form @submit.prevent="handleLogin">
                <!-- Email/Username Field -->
                <div class="mb-4">
                  <FwbInput
                    v-model="credentials.email"
                    type="email"
                    :label="t('Email or Username')"
                    placeholder="example@domain.com"
                    required
                    autocomplete="username"
                    class="focus:outline-none"
                  />
                </div>

                <!-- Password Field -->
                <div class="mb-6">
                  <FwbInput
                    v-model="credentials.password"
                    type="password"
                    :label="t('Password')"
                    required
                    autocomplete="current-password"
                    class="focus:outline-none"
                  />
                </div>

                <!-- Submit Button -->
                <FwbButton type="submit" class="w-full" size="lg" outline>
                  {{ t("Login") }}
                </FwbButton>
              </form>
            </FwbTab>
            <FwbTab name="registration" :title="t('Student Registration')">
              <form>
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <!-- IIN Field -->
                  <div>
                    <FwbInput
                      v-model="registration.iin"
                      type="text"
                      :label="t('IIN')"
                      required
                      class="focus:outline-none"
                    />
                  </div>

                  <!-- Fullname Field -->
                  <div>
                    <FwbInput
                      v-model="registration.name"
                      type="text"
                      :label="t('Fullname')"
                      placeholder="Anna Fettisov"
                      required
                      class="focus:outline-none"
                    />
                  </div>

                  <!-- Faculty Field -->
                  <div>
                    <FwbSelect
                      v-model="registration.faculty"
                      :options="facultyOptions"
                      :label="t('Faculty')"
                      required
                      class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <!-- Specialist Field -->
                  <div>
                    <FwbSelect
                      v-model="registration.specialist"
                      :options="specialistOptions"
                      :label="t('Specialist')"
                      required
                      class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <!-- Enrollment Year Field -->
                  <div>
                    <FwbInput
                      v-model="registration.enrollmentYear"
                      type="text"
                      :label="t('Enrollment Year')"
                      required
                      class="focus:outline-none"
                    />
                  </div>

                  <!-- Gender Field -->
                  <div>
                    <FwbSelect
                      v-model="registration.gender"
                      :options="genderOptions"
                      :label="t('Gender')"
                      required
                      class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <!-- Login Email Field -->
                  <div>
                    <FwbInput
                      v-model="registration.email"
                      type="email"
                      :label="t('Login Email')"
                      placeholder="a.fettisov@gmail.com"
                      required
                      class="focus:outline-none"
                    />
                  </div>
                  <div></div>

                  <!-- Password Field -->
                  <div>
                    <FwbInput
                      v-model="registration.password"
                      type="password"
                      :label="t('Password')"
                      required
                      class="focus:outline-none"
                    />
                  </div>

                  <!-- Confirm Password Field -->
                  <div>
                    <FwbInput
                      v-model="registration.confirmPassword"
                      type="password"
                      :label="t('Confirm Password')"
                      required
                      class="focus:outline-none"
                    />
                  </div>

                  <!-- Dormitory Field -->
                  <div class="mb-4">
                    <FwbSelect
                      v-model="registration.dormitory"
                      :options="dormitoryOptions"
                      :label="t('Select Dormitory')"
                      required
                      class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <!-- Room Field -->
                  <div>
                    <FwbSelect
                      v-model="registration.room"
                      :options="roomOptions"
                      :label="t('Select Room')"
                      required
                      class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <!-- Add to Reserve List Checkbox -->
                <div class="mb-4">
                  <FwbCheckbox
                    v-model="registration.addToReserveList"
                    :label="t('Add to Reserve List')"
                    class="focus:outline-none"
                  />
                </div>

                <!-- Upload ID Fields -->
                <div
                  v-for="(file, index) in registration.files"
                  :key="index"
                  class="mb-4"
                >
                  <FwbFileInput
                    :modelValue="file"
                    @update:modelValue="
                      updateRegistrationFileInput(index, $event)
                    "
                    :label="t('Files to be Uploaded')"
                    required
                    class=""
                  />
                </div>

                <!-- Add More Files Button -->
                <div class="mb-4 flex justify-end">
                  <AddMoreButton @click="addRegistrationFileInput" />
                </div>

                <!-- QR Code -->
                <div class="mb-4">
                  <div class="mx-auto h-24 w-24">
                    <img
                      :src="qrCodeUrl"
                      alt="Kaspi QR Code"
                      class="h-full w-full object-contain"
                    />
                  </div>
                  <p class="text-center">{{ t("Kaspi QR Code") }}</p>
                </div>

                <!-- Agree to Dormitory Rules Checkbox -->
                <div class="mb-4">
                  <FwbCheckbox
                    v-model="registration.agreeToDormitoryRules"
                    :label="t('I Agree to Dormitory Rules')"
                    required
                    class="focus:outline-none"
                  />
                </div>

                <!-- Submit Button -->
                <FwbButton type="submit" class="w-full" size="lg" outline>
                  {{ t("Register") }}
                </FwbButton>
              </form>
            </FwbTab>
            <FwbTab name="guest" :title="t('Guest Home')">
              <form>
                <!-- Room Type Field -->
                <div class="mb-4">
                  <FwbSelect
                    v-model="guest.roomType"
                    :options="roomTypeOptions"
                    :label="t('Room Type')"
                    required
                    class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <!-- Fullname Field -->
                <div class="mb-4">
                  <FwbInput
                    v-model="guest.name"
                    type="text"
                    :label="t('Fullname')"
                    placeholder="Anna Fettisov"
                    required
                    class="focus:outline-none"
                  />
                </div>

                <!-- Upload ID Fields -->
                <div
                  v-for="(file, index) in guest.files"
                  :key="index"
                  class="mb-4"
                >
                  <FwbFileInput
                    :modelValue="file"
                    @update:modelValue="updateFileInput(index, $event)"
                    :label="t('Upload ID Card or Passport')"
                    required
                    class=""
                  />
                </div>

                <!-- Add More Files Button -->
                <div class="mb-4 flex justify-end">
                  <AddMoreButton @click="addFileInput" />
                </div>

                <!-- Submit Button -->
                <FwbButton type="submit" class="w-full" outline size="lg">
                  {{ t("Booking") }}
                </FwbButton>
              </form>
            </FwbTab>
          </FwbTabs>
        </div>
      </FlowbiteThemable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  FwbInput,
  FwbSelect,
  FwbButton,
  FwbTab,
  FwbTabs,
  FwbFileInput,
  FwbCheckbox,
  FlowbiteThemable,
} from "flowbite-vue";
import AddMoreButton from "@/components/AddMoreButton.vue";
// import { useAuthStore } from '@/stores/auth'

const { t } = useI18n();
const router = useRouter();
const theme = ref("blue");
// const authStore = useAuthStore()

// Language Selection
const selectedLanguage = ref("en");
const languageOptions = [
  { value: "en", name: "English" },
  { value: "kk", name: "Қазақша" },
  { value: "ru", name: "Русский" },
];
const activeTab = ref("login");

// Login Credentials
const credentials = ref({
  email: "",
  password: "",
});

// Registration Form Data
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
  files: [null], // Initialize with one file input
  agreeToDormitoryRules: false,
});

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

// Guest Form Data
const guest = ref({
  roomType: "",
  name: "",
  files: [null], // Initialize with one file input
});

const roomTypeOptions = [
  { value: "one_person", name: "One person" },
  { value: "double", name: "Double" },
  { value: "suit", name: "Suit" },
];

// Add More Files Handler for Guest Form
const addFileInput = () => {
  guest.value.files.push(null);
};

// Update File Input Handler for Guest Form
const updateFileInput = (index, value) => {
  guest.value.files[index] = value;
};

// Add More Files Handler for Registration Form
const addRegistrationFileInput = () => {
  registration.value.files.push(null);
};

// Update File Input Handler for Registration Form
const updateRegistrationFileInput = (index, value) => {
  registration.value.files[index] = value;
};

// Example QR Code URL (replace with your desired content)
const qrCodeUrl = ref(
  `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Kaspi%20QR%20Code`,
);

// Login Handler
const handleLogin = async () => {
  try {
    // await authStore.login(credentials.value)
    router.push("/main");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
