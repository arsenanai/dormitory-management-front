<template>
  <Navigation :title="t('Student page')">
    <!-- Form Fields -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- IIN Field -->
      <div>
        <CInput
          id="student-iin"
          v-model="student.iin"
          type="search"
          :label="t('IIN')"
          placeholder="Enter IIN"
          required
        />
      </div>

      <!-- Name-Surname Field -->
      <div>
        <CInput
          id="student-name"
          v-model="student.name"
          type="text"
          :label="t('Name-Surname')"
          placeholder="Enter Name and Surname"
          required
        />
      </div>

      <!-- Faculty Field -->
      <div>
        <CSelect
          id="student-faculty"
          v-model="student.faculty"
          :options="facultyOptions"
          :label="t('Faculty')"
          required
        />
      </div>

      <!-- Specialist Field -->
      <div>
        <CSelect
          id="student-specialist"
          v-model="student.specialist"
          :options="specialistOptions"
          :label="t('Specialist')"
          required
        />
      </div>

      <!-- Enrollment Year Field -->
      <div>
        <CInput
          id="student-enrollment-year"
          v-model="student.enrollmentYear"
          type="number"
          :label="t('Enrollment Year')"
          placeholder="Enter Enrollment Year"
          required
        />
      </div>

      <!-- Gender Field -->
      <div>
        <CSelect
          id="student-gender"
          v-model="student.gender"
          :options="genderOptions"
          :label="t('Gender')"
          required
        />
      </div>

      <!-- Email Field -->
      <div>
        <CInput
          id="student-email"
          v-model="student.email"
          type="email"
          :label="t('E-mail')"
          placeholder="Enter E-mail"
          required
        />
      </div>

      <!-- Phone Numbers -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ t("Phone Numbers") }}
        </label>
        <div class="flex flex-col lg:flex-row items-stretch lg:items-end gap-2">
          <div class="flex flex-col items-stretch gap-2">
            <CInput
              v-for="(phone, index) in student.phoneNumbers"
              :key="index"
              v-model="student.phoneNumbers[index]"
              type="tel"
              placeholder="Enter Phone Number"
            />
          </div>
          <CButton @click="addPhoneField">
            <PlusIcon class="h-5 w-5" /> {{ t("Add more") }}
          </CButton>
        </div>
      </div>

      <!-- Country Field -->
      <div>
        <CSelect
          id="student-country"
          v-model="student.country"
          :options="countryOptions"
          :label="t('Country')"
          required
        />
      </div>

      <!-- Region Field -->
      <div>
        <CSelect
          id="student-region"
          v-model="student.region"
          :options="regionOptions"
          :label="t('Region')"
          required
        />
      </div>

      <!-- City Field -->
      <div>
        <CSelect
          id="student-city"
          v-model="student.city"
          :options="cityOptions"
          :label="t('City')"
          required
        />
      </div>

      <!-- Deal Number Field -->
      <div>
        <CInput
          id="student-deal-number"
          v-model="student.dealNumber"
          type="text"
          :label="t('Deal Number')"
          placeholder="Enter Deal Number"
          required
        />
      </div>
    </div>
    <!-- Submit and Print Buttons -->
    <div class="mt-6 flex flex-row items-end justify-end gap-2">
      <CButton onclick="window.print()">
        <PrinterIcon class="h-5 w-5" />
        {{ t("Print") }}
      </CButton>
      <CButton variant="primary">
        {{ t("Submit") }}
      </CButton>
    </div>
  </Navigation>
</template>

<script setup>
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { PlusIcon, PrinterIcon } from "@heroicons/vue/24/outline";

const { t } = useI18n();

// Student Form Data
const student = ref({
  iin: "",
  name: "",
  faculty: "",
  specialist: "",
  enrollmentYear: "",
  gender: "",
  email: "",
  phoneNumbers: [""], // Initialize with one phone number field
  dealNumber: "",
  country: "",
  region: "",
  city: "",
});

// Options for Select Fields
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

const countryOptions = [
  { value: "kazakhstan", name: "Kazakhstan" },
  { value: "russia", name: "Russia" },
];

const regionOptions = [
  { value: "almaty", name: "Almaty" },
  { value: "zhetisu", name: "Zhetisu" },
];

const cityOptions = [
  { value: "kaskelen", name: "Kaskelen" },
  { value: "talgar", name: "Talgar" },
];

// Add More Phone Numbers
const addPhoneField = () => {
  student.value.phoneNumbers.push("");
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>