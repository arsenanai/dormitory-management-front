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
              v-model="studentProfile.iin"
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
              v-model="user.name"
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
              v-model="user.surname"
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
              v-model="studentProfile.gender"
              :options="genderOptions"
              :label="t('Gender')"
              required
            />
          </div>
          <!-- Email Field -->
          <div>
            <CInput
              id="student-email"
              v-model="user.email"
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
              :model-value="studentProfile.city?.id"
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
                  v-for="(phone, index) in user.phone_numbers"
                  :key="index"
                  :id="'phone-number-' + index"
                  v-model="user.phone_numbers[index]"
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

      <!-- Family Information -->
      <fieldset class="border border-gray-200 rounded p-4">
        <legend class="text-lg font-semibold px-2">{{ t("Family Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CInput id="parent-name" v-model="studentProfile.parent_name" type="text" :label="t('Parent Name')" placeholder="Enter Parent Name" />
          <CInput id="parent-phone" v-model="studentProfile.parent_phone" type="tel" :label="t('Parent Phone')" placeholder="Enter Parent Phone" />
          <CInput id="parent-email" v-model="studentProfile.parent_email" type="email" :label="t('Parent Email')" placeholder="Enter Parent Email" />
          <CInput id="guardian-name" v-model="studentProfile.guardian_name" type="text" :label="t('Guardian Name')" placeholder="Enter Guardian Name" />
          <CInput id="guardian-phone" v-model="studentProfile.guardian_phone" type="tel" :label="t('Guardian Phone')" placeholder="Enter Guardian Phone" />
          <CInput id="mentor-name" v-model="studentProfile.mentor_name" type="text" :label="t('Mentor Name')" placeholder="Enter Mentor Name" />
          <CInput id="mentor-email" v-model="studentProfile.mentor_email" type="email" :label="t('Mentor Email')" placeholder="Enter Mentor Email" />
        </div>
      </fieldset>

      <!-- Health Information -->
      <fieldset class="border border-gray-200 rounded p-4">
        <legend class="text-lg font-semibold px-2">{{ t("Health Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CInput id="blood-type" v-model="studentProfile.blood_type" type="text" :label="t('Blood Type')" placeholder="Enter Blood Type" />
          <CInput id="medical-conditions" v-model="studentProfile.medical_conditions" type="text" :label="t('Medical Conditions')" placeholder="Enter Medical Conditions" />
          <CInput id="dietary-restrictions" v-model="studentProfile.dietary_restrictions" type="text" :label="t('Dietary Restrictions')" placeholder="Enter Dietary Restrictions" />
        </div>
      </fieldset>

      <!-- Emergency Contact -->
      <fieldset class="border border-gray-200 rounded p-4">
        <legend class="text-lg font-semibold px-2">{{ t("Emergency Contact") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CInput id="emergency-contact-name" v-model="studentProfile.emergency_contact_name" type="text" :label="t('Emergency Contact Name')" placeholder="Enter Emergency Contact Name" />
          <CInput id="emergency-contact-phone" v-model="studentProfile.emergency_contact_phone" type="tel" :label="t('Emergency Contact Phone')" placeholder="Enter Emergency Contact Phone" />
          <CInput id="emergency-contact-relationship" v-model="studentProfile.emergency_contact_relationship" type="text" :label="t('Emergency Contact Relationship')" placeholder="Enter Relationship" />
        </div>
      </fieldset>

      <!-- Registration & Status -->
      <fieldset class="border border-gray-200 rounded p-4">
        <legend class="text-lg font-semibold px-2">{{ t("Registration & Status") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CInput id="program" v-model="studentProfile.program" type="text" :label="t('Program')" placeholder="Enter Program" />
          <CInput id="year-level" v-model="studentProfile.year_level" type="number" :label="t('Year Level')" placeholder="Enter Year Level" />
          <CInput id="nationality" v-model="studentProfile.nationality" type="text" :label="t('Nationality')" placeholder="Enter Nationality" />
          <CInput id="violations" v-model="studentProfile.violations" type="text" :label="t('Violations')" placeholder="Enter Violations" />
          <CCheckbox id="agree-to-dormitory-rules" v-model="studentProfile.agree_to_dormitory_rules" :label="t('I Agree to Dormitory Rules')" />
          <CCheckbox id="has-meal-plan" v-model="studentProfile.has_meal_plan" :label="t('Has Meal Plan')" />
          <CCheckbox id="registration-limit-reached" v-model="studentProfile.registration_limit_reached" :label="t('Registration Limit Reached')" />
          <CCheckbox id="is-backup-list" v-model="studentProfile.is_backup_list" :label="t('Is Backup List')" />
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
              v-model="studentProfile.faculty"
              :options="facultyOptions"
              :label="t('Faculty')"
              required
            />
          </div>
          <!-- Specialist Field -->
          <div>
            <CSelect
              id="student-specialist"
              v-model="studentProfile.specialist"
              :options="specialistOptions"
              :label="t('Specialist')"
              required
            />
          </div>
          <!-- Enrollment Year Field -->
          <div>
            <CInput
              id="student-enrollment-year"
              v-model="studentProfile.enrollment_year"
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
              v-model="studentProfile.deal_number"
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
              v-model="studentProfile.room"
              :options="roomOptions"
              :label="t('Room')"
              required
            />
          </div>
          <!-- Bed Field (NEW) -->
          <div v-if="studentProfile.room">
            <CSelect
              id="student-bed"
              v-model="studentProfile.bed"
              :options="bedOptions"
              :label="t('Bed')"
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
import { useRoute } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CCheckbox from "@/components/CCheckbox.vue"; // Added CCheckbox import
import { PlusIcon, PrinterIcon } from "@heroicons/vue/24/outline";
import type { User } from "@/models/User";
import type { StudentProfile } from "@/models/StudentProfile";
import { Country } from "@/models/Country";
import { Region } from "@/models/Region";
import { City } from "@/models/City";
import { Room } from "@/models/Room";
import { Dormitory } from "@/models/Dormitory";
import { useStudentStore } from "@/stores/student";
import { studentService, authService, roomService } from "@/services/api";
import { useToast } from "@/composables/useToast";

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
const rooms = ref([]);
const allBeds = ref([]);
const loadingRooms = ref(false);

onMounted(async () => {
  loadingRooms.value = true;
  try {
    const response = await roomService.getAvailable();
    rooms.value = response.data || [];
    // Flatten all available beds for selection
    allBeds.value = rooms.value.flatMap(room => room.beds.map(bed => ({ ...bed, room })));
  } catch (e) {
    // fallback or show error
    rooms.value = [];
    allBeds.value = [];
  } finally {
    loadingRooms.value = false;
  }
  // First try to restore from store
  studentStore.restoreSelectedStudent();
  
  // If editing and no data in store, load from API
  if (isEditing.value && !studentStore.selectedStudent) {
    await loadStudent(studentId.value!);
  }
});

// i18n and store
const { t } = useI18n();
const route = useRoute();
const studentStore = useStudentStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const studentId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!studentId.value);

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

// Student Form Data (split into user and studentProfile)
const user = ref<Partial<User>>({
  name: "",
  email: "",
  phone_numbers: [""],
  password: "",
  confirmPassword: "",
});
const studentProfile = ref<Partial<StudentProfile>>({
  iin: "",
  faculty: "",
  specialist: "",
  enrollment_year: undefined,
  gender: "",
  blood_type: "",
  parent_name: "",
  parent_phone: "",
  parent_email: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  deal_number: "",
  agree_to_dormitory_rules: false,
  has_meal_plan: false,
  // ... add all other fields as needed
});

// Computed for selected dormitory (syncs with student.room)
const selectedDormitory = computed({
  get() {
    return studentProfile.value.room?.dormitory ?? null;
  },
  set(newDorm) {
    // If the current room is not in the new dormitory, reset room
    if (!studentProfile.value.room || studentProfile.value.room.dormitory !== newDorm) {
      studentProfile.value.room = null;
    }
  }
});

// Populate the form if editing an existing student
watch(
  () => studentStore.selectedStudent,
  (selectedStudent) => {
    if (selectedStudent) {
      // Populate user fields
      user.value = {
        name: selectedStudent.first_name || selectedStudent.name || "",
        email: selectedStudent.email || "",
        phone_numbers: selectedStudent.phone_numbers?.length ? [...selectedStudent.phone_numbers] : selectedStudent.phone ? [selectedStudent.phone] : [""]
      };
      // Populate studentProfile fields
      studentProfile.value = {
        iin: selectedStudent.student_profile?.iin || "",
        faculty: selectedStudent.student_profile?.faculty || "",
        specialist: selectedStudent.student_profile?.specialist || "",
        enrollment_year: selectedStudent.student_profile?.enrollment_year,
        gender: selectedStudent.student_profile?.gender || "",
        blood_type: selectedStudent.student_profile?.blood_type || "",
        parent_name: selectedStudent.student_profile?.parent_name || "",
        parent_phone: selectedStudent.student_profile?.parent_phone || "",
        parent_email: selectedStudent.student_profile?.parent_email || "",
        emergency_contact_name: selectedStudent.student_profile?.emergency_contact_name || "",
        emergency_contact_phone: selectedStudent.student_profile?.emergency_contact_phone || "",
        deal_number: selectedStudent.student_profile?.deal_number || "",
        agree_to_dormitory_rules: selectedStudent.student_profile?.agree_to_dormitory_rules || false,
        has_meal_plan: selectedStudent.student_profile?.has_meal_plan || false,
        // ... add all other fields as needed
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
    .map((r) => ({ value: r, name: r.number }))
);

// Bed options for selected room
const bedOptions = computed(() => {
  if (!studentProfile.value.room) return [];
  return allBeds.value
    .filter(b => b.room.id === studentProfile.value.room.id)
    .map(bed => ({
      value: bed,
      name: `${t('Bed')} ${bed.number}${bed.reserved_for_staff ? ' (' + t('Staff Reserved') + ')' : ''}`,
      disabled: bed.reserved_for_staff // For students, staff-reserved beds are disabled
    }));
});

// Watch for changes to selectedDormitory and reset room if needed
watch(selectedDormitory, (newDorm) => {
  if (studentProfile.value.room && studentProfile.value.room.dormitory !== newDorm) {
    studentProfile.value.room = null;
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
  studentProfile.value.city = null;
}
function onRegionChange(id: number) {
  selectedRegion.value = regions.value.find((r) => r.id === id) || null;
  studentProfile.value.city = null;
}
function onCityChange(id: number) {
  studentProfile.value.city = cities.value.find((c) => c.id === id) || null;
}

// Add More Phone Numbers
const addPhoneField = (): void => {
  user.value.phone_numbers.push("");
};

// Submit Form
const submitForm = async (): Promise<void> => {
  if (!user.value.phone_numbers?.length || !user.value.phone_numbers[0]) {
    showError(t("At least one phone number is required."));
    return;
  }
  if (!studentProfile.value.bed_id) {
    showError(t("Please select a bed."));
    return;
  }
  try {
    // Construct payload
    const payload = {
      user: {
        name: user.value.name,
        email: user.value.email,
        phone_numbers: user.value.phone_numbers,
        password: user.value.password,
        password_confirmation: user.value.confirmPassword,
      },
      profile: {
        ...studentProfile.value,
      },
    };
    if (isEditing.value) {
      await studentService.update(studentId.value, payload);
      showSuccess(t("Student profile updated successfully!"));
    } else {
      await studentService.create(payload);
      showSuccess(t("Student created successfully!"));
    }
  } catch (error: any) {
    console.error('Profile update failed:', error);
    showError(error.response?.data?.message || t("Failed to save student data"));
  }
};

// Load student from API if editing
const loadStudent = async (id: number) => {
  try {
    // Use profile endpoint for current user's own data to avoid permission issues
    const response = await authService.getProfile();
    const studentData = response.data;
    
    // Populate form with API data
    user.value = {
      name: studentData.first_name || studentData.name || "",
      email: studentData.email || "",
      phone_numbers: studentData.phone_numbers?.length ? [...studentData.phone_numbers] : studentData.phone ? [studentData.phone] : [""]
    };
    studentProfile.value = {
      iin: studentData.student_profile?.iin || "",
      faculty: studentData.student_profile?.faculty || "",
      specialist: studentData.student_profile?.specialist || studentData.student_profile?.specialty || "",
      enrollment_year: studentData.student_profile?.enrollment_year || studentData.enrollment_year,
      gender: studentData.student_profile?.gender || "",
      blood_type: studentData.student_profile?.blood_type || "",
      parent_name: studentData.student_profile?.parent_name || "",
      parent_phone: studentData.student_profile?.parent_phone || "",
      parent_email: studentData.student_profile?.parent_email || "",
      emergency_contact_name: studentData.student_profile?.emergency_contact_name || "",
      emergency_contact_phone: studentData.student_profile?.emergency_contact_phone || "",
      emergency_contact_relationship: studentData.student_profile?.emergency_contact_relationship || "",
      program: studentData.student_profile?.program || "",
      year_level: studentData.student_profile?.year_level || "",
      nationality: studentData.student_profile?.nationality || "",
      violations: studentData.student_profile?.violations || "",
      agree_to_dormitory_rules: studentData.student_profile?.agree_to_dormitory_rules || false,
      has_meal_plan: studentData.student_profile?.has_meal_plan || false,
      registration_limit_reached: studentData.student_profile?.registration_limit_reached || false,
      is_backup_list: studentData.student_profile?.is_backup_list || false,
    };
    showSuccess(t("Student data loaded successfully"));
  } catch (error) {
    showError(t("Failed to load student data"));
  }
};

</script>

<style scoped>
/* Add custom styles if needed */
</style>
