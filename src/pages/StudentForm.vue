<template>
  <Navigation :title="t('Add-edit student page')">
    <!-- Form Fields -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- IIN Field -->
      <div>
        <FwbInput
          v-model="student.iin"
          type="text"
          :label="t('IIN')"
          placeholder="Enter IIN"
          required
          class="focus:outline-none"
        />
      </div>

      <!-- Name-Surname Field -->
      <div>
        <FwbInput
          v-model="student.name"
          type="text"
          :label="t('Name-Surname')"
          placeholder="Enter Name and Surname"
          required
          class="focus:outline-none"
        />
      </div>

      <!-- Faculty Field -->
      <div>
        <FwbSelect
          v-model="student.faculty"
          :options="facultyOptions"
          :label="t('Faculty')"
          required
          class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Specialist Field -->
      <div>
        <FwbSelect
          v-model="student.specialist"
          :options="specialistOptions"
          :label="t('Specialist')"
          required
          class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Enrollment Year Field -->
      <div>
        <FwbInput
          v-model="student.enrollmentYear"
          type="number"
          :label="t('Enrollment Year')"
          placeholder="Enter Enrollment Year"
          required
          class="focus:outline-none"
        />
      </div>

      <!-- Gender Field -->
      <div>
        <FwbSelect
          v-model="student.gender"
          :options="genderOptions"
          :label="t('Gender')"
          required
          class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Email Field -->
      <div>
        <FwbInput
          v-model="student.email"
          type="email"
          :label="t('E-mail')"
          placeholder="Enter E-mail"
          required
          class="focus:outline-none"
        />
      </div>
      <div></div>

      <!-- Phone Numbers -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ t("Phone Numbers") }}
        </label>
        <div class="flex flex-row items-end gap-2">
          <div class="flex flex-col items-stretch gap-2">
            <FwbInput
              v-for="(phone, index) in student.phoneNumbers"
              :key="index"
              v-model="student.phoneNumbers[index]"
              type="tel"
              placeholder="Enter Phone Number"
              class="w-full flex-1 focus:outline-none"
            />
          </div>
          <Button @click="addPhoneField" class="">
            <PlusIcon class="h-5 w-5" /> {{ t("Add more") }}
          </Button>
        </div>
      </div>

      <!-- Country Field -->
      <div>
        <FwbSelect
          v-model="student.country"
          :options="countryOptions"
          :label="t('Country')"
          required
          class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Region Field -->
      <div>
        <FwbSelect
          v-model="student.region"
          :options="regionOptions"
          :label="t('Region')"
          required
          class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- City Field -->
      <div>
        <FwbSelect
          v-model="student.city"
          :options="cityOptions"
          :label="t('City')"
          required
          class="focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <!-- Deal Number Field -->
      <div>
        <FwbInput
          v-model="student.dealNumber"
          type="text"
          :label="t('Deal Number')"
          placeholder="Enter Deal Number"
          required
          class="focus:outline-none"
        />
      </div>
      <div class="flex flex-row items-end justify-start gap-2">
        <PrimaryButton>
          {{ t("Submit") }}
        </PrimaryButton>
        <Button>
          <PrinterIcon class="h-5 w-5" />
          {{ t("Print") }}
        </Button>
      </div>
    </div>

    <!-- Submit and Print Buttons -->
    <div class="flex items-end justify-between gap-2"></div>
  </Navigation>
</template>

<script setup>
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { FwbInput, FwbSelect } from "flowbite-vue";
import { PlusIcon, PrinterIcon } from "@heroicons/vue/24/outline"; // Import icons
import { ref } from "vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import Button from "@/components/CButton.vue";

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
