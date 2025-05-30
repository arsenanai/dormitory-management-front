<template>
  <Navigation :title="t('Student page')">
    <div class="grid grid-cols-1 gap-8">
      <!-- Personal Information -->
      <fieldset class="border border-gray-200 rounded p-4">
        <legend class="text-lg font-semibold px-2">{{ t("Personal Information") }}</legend>
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
          <!-- Name Field -->
          <div>
            <CInput
              id="student-name"
              v-model="student.name"
              type="text"
              :label="t('Name')"
              placeholder="Enter Name"
              required
            />
          </div>
          <!-- Surname Field -->
          <div>
            <CInput
              id="student-surname"
              v-model="student.surname"
              type="text"
              :label="t('Surname')"
              placeholder="Enter Surname"
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
          <!-- Phone Numbers (moved to the end) -->
          <div class="lg:col-span-2">
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
        </div>
      </fieldset>

      <!-- Educational Information -->
      <fieldset class="border border-gray-200 rounded p-4">
        <legend class="text-lg font-semibold px-2">{{ t("Educational Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
          <!-- Dormitory Field -->
          <div>
            <CSelect
              id="student-dormitory"
              v-model="selectedDormitory"
              :options="dormitoryOptions"
              :label="t('Dormitory')"
              required
            />
          </div>
          <!-- Room Field -->
          <div>
            <CSelect
              id="student-room"
              v-model="student.room"
              :options="roomOptions"
              :label="t('Room')"
              required
            />
          </div>
        </div>
      </fieldset>

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
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { PlusIcon, PrinterIcon } from "@heroicons/vue/24/outline";
import { Country } from "@/models/Country";
import { Region } from "@/models/Region";
import { City } from "@/models/City";
import { Room } from "@/models/Room";
import { Dormitory } from "@/models/Dormitory";
import { useStudentStore } from "@/stores/student";

// --- Mock models (same as Students.vue) ---
class DormitoryMock {
  constructor(name, capacity = 0, gender = "") {
    this.name = name;
    this.capacity = capacity;
    this.gender = gender;
  }
}
class RoomMock {
  constructor(number, dormitory, floor = null, notes = "") {
    this.number = number;
    this.dormitory = dormitory;
    this.floor = floor;
    this.notes = notes;
  }
}

// --- Use the same dormitories and rooms as Students.vue ---
const dormA = new DormitoryMock("A-Block", 300, "female");
const dormB = new DormitoryMock("B-Block", 300, "male");
const roomA210 = new RoomMock("A210", dormA, 2, "Near the stairs");
const roomA211 = new RoomMock("A211", dormA, 2, "");
const roomB101 = new RoomMock("B101", dormB, 1, "Window view");

const dormitories = ref([dormA, dormB]);
const rooms = ref([roomA210, roomA211, roomB101]);

// i18n and store
const { t } = useI18n();
const studentStore = useStudentStore();
studentStore.restoreSelectedStudent();

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
const student = ref({
  iin: "",
  name: "",
  surname: "",
  faculty: "",
  specialist: "",
  enrollmentYear: "",
  gender: "",
  email: "",
  phoneNumbers: [""],
  city: null,
  dealNumber: "",
  room: null, // Only room, dormitory is accessed via room.dormitory
});

// Computed for selected dormitory (syncs with student.room)
const selectedDormitory = computed({
  get() {
    return student.value.room?.dormitory ?? null;
  },
  set(newDorm) {
    // If the current room is not in the new dormitory, reset room
    if (!student.value.room || student.value.room.dormitory !== newDorm) {
      student.value.room = null;
    }
  }
});

// Populate the form if editing an existing student
watch(
  () => studentStore.selectedStudent,
  (selectedStudent) => {
    if (selectedStudent) {
      student.value = {
        iin: selectedStudent.iin || "",
        name: selectedStudent.name || "",
        surname: selectedStudent.surname || "",
        faculty: selectedStudent.faculty || "",
        specialist: selectedStudent.specialist || "",
        enrollmentYear: selectedStudent.enrollmentYear || "",
        gender: selectedStudent.gender || "",
        email: selectedStudent.email || "",
        phoneNumbers: selectedStudent.phoneNumbers?.length ? [...selectedStudent.phoneNumbers] : [""],
        city: selectedStudent.city || null,
        dealNumber: selectedStudent.dealNumber || "",
        room: selectedStudent.room
          ? rooms.value.find(
              r =>
                r.number === selectedStudent.room.number &&
                r.dormitory.name === selectedStudent.room.dormitory.name
            ) || null
          : null,
      };
    }
  },
  { immediate: true }
);

// Dormitory and Room options
const dormitoryOptions = computed(() =>
  dormitories.value.map((d) => ({ value: d, name: d.name }))
);

const roomOptions = computed(() =>
  rooms.value
    .filter((r) => !selectedDormitory.value || r.dormitory === selectedDormitory.value)
    .map((r) => ({ value: r, name: r.number }))
);

// Watch for changes to selectedDormitory and reset room if needed
watch(selectedDormitory, (newDorm) => {
  if (student.value.room && student.value.room.dormitory !== newDorm) {
    student.value.room = null;
  }
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

onMounted(() => {
  studentStore.restoreSelectedStudent();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
