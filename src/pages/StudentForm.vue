<template>
  <Navigation :title="t('Student page')">
    <form class="grid grid-cols-1 gap-8" novalidate @submit.prevent="submitForm">
      <!-- Personal Information -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Personal Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- IIN Field -->
          <div>
            <CInput id="student-profile-iin" v-model="user.student_profile.iin" type="search" :label="t('IIN')"
              :error="validationErrors['student_profile.iin']?.[0]" placeholder="Enter IIN" required />
          </div>
          <!-- Name Field -->
          <div>
            <CInput id="student-name" v-model="user.first_name" type="text" :label="t('Name')"
              :error="validationErrors.first_name?.[0]" placeholder="Enter Name" required />
          </div>
          <!-- Surname Field -->
          <div>
            <CInput id="student-surname" v-model="user.last_name" type="text" :label="t('Surname')"
              :error="validationErrors.last_name?.[0]" placeholder="Enter Surname" required />
          </div>
          <!-- Gender Field -->
          <div>
            <CSelect id="student-gender" v-model="user.student_profile.gender" :options="filteredGenderOptions"
              :label="t('Gender')" required />
          </div>
          <!-- Email Field -->
          <div>
            <CInput id="student-email" v-model="user.email" type="email" :label="t('E-mail')"
              :error="validationErrors.email?.[0]" placeholder="Enter E-mail" required />
          </div>
          <!-- Country Field -->
          <div>
            <CInput id="student-country" v-model="user.student_profile.country" type="text" :label="t('Country')"
              placeholder="Enter Country" :list="countryList" />
          </div>
          <!-- Region Field -->
          <div>
            <CInput id="student-region" v-model="user.student_profile.region" type="text" :label="t('Region')"
              placeholder="Enter Region" :disabled="!user.student_profile.country" />
          </div>
          <!-- City Field -->
          <div>
            <CInput id="student-city" v-model="user.student_profile.city" type="text" :label="t('City')"
              placeholder="Enter City" :disabled="!user.student_profile.region" />
          </div>
          <div>
            <CInput id="student-password" v-model="user.password" type="password" :label="t('Password')"
              :error="validationErrors.password?.[0]" :placeholder="t('Password')"
              :required="isEditing ? false : true" />
          </div>
          <div>
            <CInput id="student-password-repeat" v-model="user.password_confirmation" type="password"
              :error="validationErrors.password_confirmation?.[0]" :label="t('Password Confirmation')"
              :placeholder="t('Password Confirmation')" :required="isEditing ? false : true" />
          </div>
          <!-- Phone Numbers (moved to the end) -->
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ t("Phone Numbers") }}
            </label>
            <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-end">
              <div class="flex flex-col items-stretch gap-2">
                <div v-for="(phone, index) in user.phone_numbers" :key="index" class="flex items-center gap-2">
                  <CInput :id="'phone-number-' + index" v-model="user.phone_numbers[index]" type="tel"
                    :error="validationErrors[`phone_numbers.${index}`]?.[0]" placeholder="Enter Phone Number" />
                  <CButton v-if="user.phone_numbers.length > 1" @click="removePhoneField(index)" class="py-2.5">
                    <TrashIcon class="text-red-600 h-5 w-5" />
                  </CButton>
                </div>
              </div>
              <CButton @click="addPhoneField" class="py-2.5">
                <PlusIcon class="h-5 w-5" />
              </CButton>
            </div>
          </div>
        </div>
      </fieldset>

      <!-- Family Information -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Family Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">

          <!-- Parent Name Field -->
          <div>
            <CInput id="student-parent-name" v-model="user.student_profile.parent_name" type="text"
              :error="validationErrors['student_profile.parent_name']?.[0]" :label="t('Parent Name')"
              placeholder="Enter Parent Name" />
          </div>
          <!-- Parent Phone Field -->
          <div>
            <CInput id="student-parent-phone" v-model="user.student_profile.parent_phone" type="tel"
              :error="validationErrors['student_profile.parent_phone']?.[0]" :label="t('Parent Phone')"
              placeholder="Enter Parent Phone" />
          </div>
          <!-- Parent Email Field -->
          <div>
            <CInput id="student-parent-email" v-model="user.student_profile.parent_email" type="email"
              :error="validationErrors['student_profile.parent_email']?.[0]" :label="t('Parent Email')"
              placeholder="Enter Parent Email" />
          </div>
          <!-- Mentor Name Field -->
          <div>
            <CInput id="student-mentor-name" v-model="user.student_profile.mentor_name" type="text"
              :error="validationErrors['student_profile.mentor_name']?.[0]" :label="t('Mentor Name')"
              placeholder="Enter Mentor Name" />
          </div>
          <!-- Mentor Email Field -->
          <div>
            <CInput id="student-mentor-email" v-model="user.student_profile.mentor_email" type="email"
              :label="t('Mentor Email')" placeholder="Enter Mentor Email" />
          </div>
        </div>
      </fieldset>

      <!-- Health Information -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Health Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Blood Type Field -->
          <div>
            <CSelect id="student-blood-type" v-model="user.student_profile.blood_type" :options="bloodTypeOptions"
              :label="t('Blood Type')" />
          </div>
          <!-- Allergies Field -->
          <div>
            <CInput id="student-allergies" v-model="user.student_profile.allergies" type="text" :label="t('Allergies')"
              :error="validationErrors['student_profile.allergies']?.[0]" placeholder="Enter Allergies (if any)" />
          </div>
          <!-- Violations Field -->
          <div>
            <CInput id="student-violations" v-model="user.student_profile.violations" type="text"
              :error="validationErrors['student_profile.violations']?.[0]" :label="t('Violations')"
              placeholder="Enter Violations (if any)" />
          </div>
        </div>
      </fieldset>

      <!-- Emergency Contact -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Emergency Contact") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Emergency Contact Name Field -->
          <div>
            <CInput id="student-emergency-name" v-model="user.student_profile.emergency_contact_name" type="text"
              :error="validationErrors['student_profile.emergency_contact_name']?.[0]"
              :label="t('Emergency Contact Name')" placeholder="Enter Emergency Contact Name" />
          </div>
          <!-- Emergency Contact Phone Field -->
          <div>
            <CInput id="student-emergency-phone" v-model="user.student_profile.emergency_contact_phone" type="tel"
              :error="validationErrors['student_profile.emergency_contact_phone']?.[0]"
              :label="t('Emergency Contact Phone')" placeholder="Enter Emergency Contact Phone" />
          </div>
        </div>
      </fieldset>

      <!-- Registration & Status -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Registration & Status") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Status Field -->
          <div>
            <CSelect id="student-status" v-model="user.status" :options="statusOptions" :label="t('Status')" required />
          </div>
          <!-- Registration Date Field -->
          <div>
            <CInput id="student-registration-date" v-model="user.created_at" type="date" :label="t('Registration Date')"
              v-if="isEditing" :disabled="isEditing" />
          </div>
          <!-- Agree to Dormitory Rules Field -->
          <div>
            <CCheckbox id="student-agree-rules" v-model="user.student_profile.agree_to_dormitory_rules"
              :label="t('Agree to Dormitory Rules')" :disabled="isEditing"
              :aria-disabled="isEditing ? 'true' : 'false'" />
          </div>
          <!-- Has Meal Plan Field -->
          <div>
            <CCheckbox id="student-meal-plan" v-model="user.student_profile.has_meal_plan"
              :label="t('Has Meal Plan')" />
          </div>
        </div>
      </fieldset>

      <!-- Educational Information -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Educational Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Faculty Field -->
          <div>
            <CInput id="student-faculty" v-model="user.student_profile.faculty" type="text" :label="t('Faculty')"
              :error="validationErrors['student_profile.faculty']?.[0]" :placeholder="t('Enter Faculty Name')"
              required />
          </div>
          <!-- Specialist Field -->
          <div>
            <CInput id="student-specialist" v-model="user.student_profile.specialist" type="text"
              :error="validationErrors['student_profile.specialist']?.[0]" :label="t('Specialist')"
              :placeholder="t('Enter Specialty/Program Name')" required />
          </div>
          <!-- Enrollment Year Field -->
          <div>
            <CInput id="student-enrollment-year" v-model="user.student_profile.enrollment_year" type="number"
              :error="validationErrors['student_profile.enrollment_year']?.[0]" :label="t('Enrollment Year')"
              placeholder="Enter Enrollment Year" required />
          </div>
          <!-- Deal Number Field -->
          <div>
            <CInput id="student-deal-number" v-model="user.student_profile.deal_number" type="text"
              :error="validationErrors['student_profile.deal_number']?.[0]" :label="t('Deal Number')"
              placeholder="Enter Deal Number" required />
          </div>
          <!-- Room Field - Only visible after dormitory selection -->
          <div>
            <CSelect id="student-room" v-model="user.room_id" :options="roomOptions" :label="t('Room')"
              :validation-message="validationErrors.room_id?.[0]"
              :validation-state="validationErrors.room_id ? 'error' : ''"
              :disabled="loadingRooms || roomOptions.length === 0" required />
            <div v-if="loadingRooms" class="text-sm text-gray-500 mt-1">
              {{ t('Loading rooms...') }}
            </div>
            <div v-else-if="!loadingRooms && roomOptions.length === 0" class="text-sm text-red-500 mt-1">
              {{ t('No rooms available in this dormitory') }}
            </div>
          </div>
          <!-- Bed Field - Only visible after room selection -->
          <div v-if="user.room_id">
            <CSelect id="student-bed" v-model="user.bed_id" :options="bedOptions" :label="t('Bed')"
              :validation-message="validationErrors.bed_id?.[0]"
              :validation-state="validationErrors.bed_id ? 'error' : ''" :disabled="bedOptions.length === 0" required />
            <div v-if="bedOptions.length === 0" class="text-sm text-red-500 mt-1">
              {{ t('No beds available in this room') }}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- Documents -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Documents") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2" data-testid="document-uploads">
          <div v-for="(file, index) in (user.student_profile.files || [])" :key="`file-${index}`">
            <CFileInput :id="`student-file-${index}`" :label="registrationFileLabels[index]"
              :file-path="typeof file === 'string' ? file : null" :allowed-extensions="['jpg', 'jpeg', 'png', 'pdf']"
              :validation-message="validationErrors[`student_profile.files.${index}`]?.[0]"
              @change="(newFile) => handleFileChange(index, newFile)" />
          </div>
        </div>
      </fieldset>
      <div class="mt-6 flex flex-row items-end justify-end gap-2">
        <CButton onclick="window.print()">
          <PrinterIcon class="h-5 w-5" />
          {{ t("Print") }}
        </CButton>
        <CButton variant="primary" type="submit">
          {{ t("Submit") }}
        </CButton>
      </div>
    </form>
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
import CCheckbox from "@/components/CCheckbox.vue";
import CFileInput from "@/components/CFileInput.vue";
import { PlusIcon, PrinterIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { User } from "@/models/User";
import { Room } from "@/models/Room";
import { useStudentStore } from "@/stores/student";
import { useAuthStore } from "@/stores/auth";
import { studentService, roomService } from "@/services/api";
import { useToast } from "@/composables/useToast";

const registrationFileLabels = [
  "063 Form",
  "075 Form",
  "ID Check",
  "Bank Check",
];

// Real dormitories and rooms from API
const rooms = ref<Room[]>([]);
const allBeds = ref<any[]>([]);
const loadingRooms = ref(false);
const { locale } = useI18n();

const validationErrors = ref<Record<string, string[]>>({});

onMounted(async () => {

  // Only restore from store for self-profile flows (not when editing a student by id)
  if (!isEditing.value) {
    studentStore.restoreSelectedStudent();
  }

  // If editing by id, load the specific student
  if (isEditing.value) {
    await loadStudent(studentId.value!);
  }
});

// i18n and store
const { t } = useI18n();
const route = useRoute();
const studentStore = useStudentStore();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const studentId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!studentId.value);

// Check if current user is an admin
const isAdmin = computed(() => authStore.user?.role?.name === 'admin');

// Note: Country, region, and city are now text input fields instead of select dropdowns

// Student Form Data (split into user and studentProfile)
const user = ref<Partial<User>>({
  bed_id: null,
  email: "",
  first_name: "",
  last_name: "",
  password_confirmation: "", // Already snake_case
  password: "", // Already snake_case
  phone_numbers: [""], // Already snake_case
  room_id: null,
  room: null,
  status: "pending",
  student_bed: null,
  student_profile: {
    agree_to_dormitory_rules: false,
    allergies: "",
    blood_type: "",
    city: "",
    country: "",
    deal_number: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    enrollment_year: new Date().getFullYear(),
    faculty: "",
    files: [null, null, null, null],
    gender: "",
    has_meal_plan: false,
    iin: "",
    mentor_email: "",
    mentor_name: "",
    parent_email: "",
    parent_name: "",
    parent_phone: "",
    region: "",
    registration_date: "",
    specialist: "",
    violations: "",
  },
});

// Function to fetch rooms for selected dormitory
const fetchRooms = async () => {
  loadingRooms.value = true;
  try {
    // Try public rooms endpoint first to avoid 403 with role-protected endpoints
    const roomsResponse = await roomService.getAvailable({ occupant_type: 'student' });
    rooms.value = Array.isArray(roomsResponse.data) ? roomsResponse.data : [];
    allBeds.value = rooms.value.flatMap(room => (room.beds || []).map(bed => ({ ...bed, room })));
  } catch (e) {
    console.error('Failed to fetch rooms:', e);
    rooms.value = [];
    allBeds.value = [];
  } finally {
    loadingRooms.value = false;
  }
};

fetchRooms();

const roomOptions = computed(() =>
  rooms.value
    .filter(r => r.occupant_type === 'student')
    .map((r) => ({ value: r.id, name: r.number })),
);

// Bed options for selected room
const bedOptions = computed(() => {
  const rid = (user.value as any).room_id || user.value.room?.id;
  if (!rid) return [];
  return allBeds.value
    .filter(b => (b.room?.id || b.room_id) === rid) // Beds in selected room
    .filter(bed => !bed.reserved_for_staff) // Exclude staff reserved beds
    .filter(bed => !bed.is_occupied || bed.user_id === user.value.id) // Exclude occupied beds, unless it's the current student's
    .map(bed => ({ // Correctly map bed properties
      value: bed.id,
      name: `${bed.room.number}-${bed.bed_number}`,
    }));
});

// Watch for changes to room and reset bed if needed
watch(() => (user.value as any).room_id, (newRoomId, oldRoomId) => {
  if (newRoomId && oldRoomId && newRoomId !== oldRoomId) {
    // Reset bed when room changes to a different room
    user.value.bed = null;
    user.value.student_bed = null;
  } else if (newRoomId && oldRoomId === undefined) {
    // Initial room selection - don't reset bed yet
  } else if (!newRoomId) {
    // Reset bed when room is cleared
    user.value.bed = null;
    user.value.student_bed = null;
  } else if (oldRoomId && newRoomId !== oldRoomId) {
    // Room changed from one value to another (including from undefined)
    user.value.bed = null;
    user.value.student_bed = null;
  }
});

// Options for Select Fields
const genderOptions = [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
];

const filteredGenderOptions = computed(() => {
  let dormGenderPolicy: string | undefined;
  try {
    dormGenderPolicy = rooms.value[0].dormitory.gender;
    if (dormGenderPolicy && dormGenderPolicy !== "mixed") {
      return genderOptions.filter((opt) => opt.value === dormGenderPolicy);
    }
  } catch (e) { }
  return genderOptions;
});

const bloodTypeOptions = [
  { value: "A+", name: "A+" },
  { value: "A-", name: "A-" },
  { value: "B+", name: "B+" },
  { value: "B-", name: "B-" },
  { value: "AB+", name: "AB+" },
  { value: "AB-", name: "AB-" },
  { value: "O+", name: "O+" },
  { value: "O-", name: "O-" },
];

const statusOptions = [
  { value: "pending", name: t("Pending") },
  { value: "active", name: t("Active") },
  { value: "suspended", name: t("Suspended") },
];

// Note: Country, region, and city are now direct text input fields

// Add More Phone Numbers
const addPhoneField = (): void => {
  user.value.phone_numbers.push("");
};

// Remove a phone number field
const removePhoneField = (index: number): void => {
  if (!Array.isArray(user.value.phone_numbers)) return;
  user.value.phone_numbers.splice(index, 1);
  if (user.value.phone_numbers.length === 0) user.value.phone_numbers.push("");
};

// Normalize incoming phone numbers into a string array
const normalizePhones = (phones: unknown, fallback?: unknown): string[] => {
  if (Array.isArray(phones)) {
    return (phones as unknown[]).map(p => (p ?? "").toString());
  }
  if (typeof phones === "string") {
    const trimmed = phones.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((p: any) => (p ?? "").toString());
      } catch (_) { }
    }
    return trimmed ? [trimmed] : [];
  }
  if (typeof fallback === "string" && (fallback as string).trim() !== "") return [(fallback as string).trim()];
  return [];
};

// Handle file input change
const handleFileChange = (index: number, newFile: File | null | string) => {
  user.value.student_profile.files[index] = newFile;
};

// Submit Form
const submitForm = async (): Promise<void> => {
  validationErrors.value = {}; // Clear previous errors

  // Basic validation
  if (!user.value.student_profile.iin || user.value.student_profile.iin.length !== 12) {
    showError(t("IIN must be exactly 12 digits."));
    return;
  }
  if (!user.value.first_name || !user.value.last_name) {
    showError(t("First name and last name are required."));
    return;
  }
  if (!user.value.email) {
    showError(t("E-mail is required."));
    return;
  }
  if (!user.value.student_profile.faculty) {
    showError(t("Faculty is required."));
    return;
  }
  if (!user.value.student_profile.specialist) {
    showError(t("Specialty is required."));
    return;
  }
  if (!user.value.student_profile.enrollment_year || user.value.student_profile.enrollment_year.toString().length !== 4) {
    showError(t("Enrollment year must be a 4-digit year."));
    return;
  }
  if (!user.value.student_profile.deal_number) {
    showError(t("Deal number is required."));
    return;
  }
  if (!user.value.status) {
    showError(t("Status is required."));
    return;
  }
  // Ensure at least one phone number is provided and not empty
  if (!user.value.phone_numbers || user.value.phone_numbers.length === 0) {
    showError(t("At least one phone number is required."));
    return;
  }
  // On creation, password is required
  if (!isEditing.value && (!user.value.password || user.value.password.length < 6)) {
    showError(t("Password is required and must be at least 6 characters long."));
    return;
  }
  // If password is provided, confirmation must match
  if (user.value.password) {
    if (user.value.password !== user.value.password_confirmation) {
      showError(t("Password and confirmation do not match."));
      return;
    }
  }

  const cleanedPhones = (user.value.phone_numbers || [])
    .map(p => (p ?? "").toString().trim())
    .filter(p => p.length > 0);
  if (!cleanedPhones.length) {
    showError(t("At least one phone number is required."));
    return;
  }

  // Check if selected bed is staff reserved
  const selectedBed = allBeds.value.find(b => b.id === user.value.bed_id);
  if (selectedBed && selectedBed.reserved_for_staff) {
    showError(t("Staff reserved beds cannot be selected for students."));
    return;
  }

  // If no beds are available, set status to 'reserved' and don't require room/bed
  const availableBeds = bedOptions.value.length > 0;
  if (availableBeds && (!user.value.room_id || !user.value.bed_id)) {
    showError(t("Please select a room and bed."));
    return;
  } else if (!availableBeds && !isEditing.value) {
    // If no beds are available on creation, set room/bed to null.
    // The status will remain 'pending' or as selected by the admin.
    user.value.room_id = null;
    user.value.bed_id = null;
  }

  try {
    const formData = new FormData();
    buildFormData(formData, user.value);
    if (isEditing.value) {
      formData.append('_method', 'PUT');
      await studentService.update(studentId.value, formData);
      showSuccess(t("Student profile updated successfully!"));
    } else {
      await studentService.create(formData);
      showSuccess(t("Student created successfully!"));
    }
  } catch (error: any) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      validationErrors.value = error.response.data.errors;
      showError(error.response.data.message || t("Please check the form for errors."));
      // Find the first element with an error and scroll to it
      const firstErrorKey = Object.keys(error.response.data.errors)[0];
      document.querySelector(`[id*="${firstErrorKey.replace('.', '-')}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.error("Submission Error:", error.response?.data);
      showError(error.response?.data?.message || t("Failed to save student data"));
    }
  }
};

const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
  if (data === null || data === undefined) {
    return;
  }

  Object.keys(data).forEach(key => {
    const value = data[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (formKey === 'student_profile[files]' && Array.isArray(value)) {
      // Special handling for the files array inside student_profile
      value.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(`${formKey}[${index}]`, file, file.name);
        } else if (file === '' || typeof file === 'string') {
          // Send empty string for deletion or string path for existing/unchanged files.
          formData.append(`${formKey}[${index}]`, file);
        }
        // `null` values are intentionally skipped, as FormData doesn't need them.
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${formKey}[${index}]`;
        if (typeof item === 'object' && item !== null && !(item instanceof File)) {
          buildFormData(formData, item, arrayKey);
        } else if (item !== null && item !== undefined && item !== '') {
          formData.append(arrayKey, item as any);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      // This will handle student_profile and other nested objects
      buildFormData(formData, value, formKey);
    } else if (typeof value === 'boolean') {
      formData.append(formKey, value ? '1' : '0');
    } else if (value !== null && value !== undefined) {
      formData.append(formKey, value.toString());
    }
  });
};

// Load student from API if editing
const loadStudent = async (id: number) => {
  try {
    // Use studentService.getById to load specific student data
    const response = await studentService.getById(id);
    const data = response.data;

    // Create a default student_profile if it's null
    if (!data.student_profile) {
      data.student_profile = {};
    }

    // Ensure student_profile.files is always an array of 3 elements
    const existingFiles = data.student_profile.files;
    const filesArray = Array(3).fill(null);
    if (existingFiles && typeof existingFiles === 'object') {
      // This handles both arrays and objects with numeric keys from PHP
      for (const index in existingFiles) {
        const numericIndex = parseInt(index, 10);
        if (!isNaN(numericIndex) && numericIndex >= 0 && numericIndex < 3) {
          filesArray[numericIndex] = existingFiles[index];
        }
      }
    }
    data.student_profile.files = filesArray;

    // Ensure the student's room and bed are present in local options so selects can display them
    if (data.room) {
      // narrow types for TS: treat API objects as `any` here
      const studentRoom = data.room as any;
      const roomExists = (rooms.value as any).some((r: any) => r?.id === studentRoom?.id);
      if (!roomExists) {
        // add the room so the room select can show the current value even if API didn't return it
        rooms.value = [...rooms.value, studentRoom];
      }

      // ensure beds from the room are present in allBeds (attach room object for mapping)
      const existingBedIds = (allBeds.value as any).map((b: any) => b.id);
      (studentRoom.beds || []).forEach((b: any) => {
        if (!existingBedIds.includes(b.id)) {
          allBeds.value.push({ ...b, room: studentRoom });
        }
      });
    }


    // Populate the user ref with data from the API
    user.value = {
      ...user.value, // Keep default structure for fields not in API response
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_numbers: normalizePhones(data.phone_numbers, data.phone),
      room_id: data.room_id, // Already snake_case
      bed_id: data.student_bed?.id,
      student_bed: data.student_bed,
      status: data.status,
      student_profile: { ...user.value.student_profile, ...data.student_profile }, // Correctly merge profile data
      password: '', // Clear password fields
      password_confirmation: '',
      created_at: formattedDate(data.created_at),
    };

    showSuccess(t("Student data loaded successfully"));
  } catch (error) {
    console.error('Failed to load student data:', error);
    showError(t("Failed to load student data"));
  }
};

function formattedDate(dateString: string): string {
  // 2025-10-26T14:00:55.000000Z to 2025-10-26
  if (dateString) {
    const r = dateString.split('T')[0];
    return r;
  }
  return '';
}

</script>
