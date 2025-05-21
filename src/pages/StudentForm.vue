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
        <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-end">
          <div class="flex flex-col items-stretch gap-2">
            <CInput
              v-for="(phone, index) in student.phoneNumbers"
              :key="index"
              :id="'phone-number-' + index"
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
          :model-value="selectedCountry?.id"
          :options="countries.map((c) => ({ value: c.id, name: c.name }))"
          :label="t('Country')"
          @update:model-value="onCountryChange"
        />
      </div>

      <!-- Region Field -->
      <div>
        <CSelect
          id="student-region"
          :model-value="selectedRegion?.id"
          :options="regionOptions"
          :label="t('Region')"
          @update:model-value="onRegionChange"
        />
      </div>

      <!-- City Field -->
      <div>
        <CSelect
          id="student-city"
          :model-value="student.city?.id"
          :options="cityOptions"
          :label="t('City')"
          @update:model-value="onCityChange"
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
      <CButton variant="primary" @click="submitForm">
        {{ t("Submit") }}
      </CButton>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { PlusIcon, PrinterIcon } from "@heroicons/vue/24/outline";
import { Country } from "@/models/Country";
import { Region } from "@/models/Region";
import { City } from "@/models/City";

// Define the type for the student object
interface Student {
  iin: string;
  name: string;
  faculty: string;
  specialist: string;
  enrollmentYear: string;
  gender: string;
  email: string;
  phoneNumbers: string[];
  city: City | null;
  dealNumber: string;
}

// Initialize the `t` function from vue-i18n
const { t } = useI18n();

// Sample data for countries, regions, and cities
const countries = ref<Country[]>([
  new Country(1, "Kazakhstan"),
  new Country(2, "Russia"),
]);

const regions = ref<Region[]>([
  new Region(1, "Almaty", countries.value[0]),
  new Region(2, "Zhetisu", countries.value[0]),
  new Region(3, "Moscow", countries.value[1]),
]);

const cities = ref<City[]>([
  new City(1, "Kaskelen", regions.value[0]),
  new City(2, "Talgar", regions.value[0]),
  new City(3, "Taldykorgan", regions.value[1]),
  new City(4, "Moscow City", regions.value[2]),
]);

// Reactive selections
const selectedCountry = ref<Country | null>(countries.value[0]);
const selectedRegion = ref<Region | null>(regions.value[0]);

// Student Form Data
const student = ref<Student>({
  iin: "",
  name: "",
  faculty: "",
  specialist: "",
  enrollmentYear: "",
  gender: "",
  email: "",
  phoneNumbers: [""],
  city: null,
  dealNumber: "",
});

// Options for Select Fields
const facultyOptions = [
  { value: "engineering", name: t("Engineering and natural sciences") },
  { value: "business", name: t("Business and economics") },
  { value: "law", name: t("Law and social sciences") },
];

const specialistOptions = [
  { value: "computer_sciences", name: t("Computer sciences") },
  { value: "mechanical_engineering", name: t("Mechanical engineering") },
  { value: "civil_engineering", name: t("Civil engineering") },
];

const genderOptions = [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
];

// Computed options for region and city based on selection
const regionOptions = computed(() =>
  regions.value
    .filter((r) => r.country?.id === selectedCountry.value?.id)
    .map((r) => ({ value: r.id, name: r.name, obj: r })),
);

const cityOptions = computed(() =>
  cities.value
    .filter((c) => c.region?.id === selectedRegion.value?.id)
    .map((c) => ({ value: c.id, name: c.name, obj: c })),
);

// Watchers to reset dependent selections
function onCountryChange(id: number) {
  selectedCountry.value = countries.value.find((c) => c.id === id) || null;
  selectedRegion.value = regionOptions.value[0]?.obj || null;
  student.value.city = null;
}
function onRegionChange(id: number) {
  selectedRegion.value = regions.value.find((r) => r.id === id) || null;
  student.value.city = null;
}
function onCityChange(id: number) {
  student.value.city = cities.value.find((c) => c.id === id) || null;
}

// Add More Phone Numbers
const addPhoneField = (): void => {
  student.value.phoneNumbers.push("");
};

// Submit Form
const submitForm = (): void => {
  console.log("Form submitted:", student.value);
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
