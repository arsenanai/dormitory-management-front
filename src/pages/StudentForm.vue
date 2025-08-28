<template>
  <Navigation :title="t('Student page')">
    <div class="grid grid-cols-1 gap-8">
      <!-- Personal Information -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Personal Information") }}</legend>
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
            <CInput
              id="student-country"
              v-model="studentProfile.country"
              type="text"
              :label="t('Country')"
              placeholder="Enter Country"
            />
          </div>
          <!-- Region Field -->
          <div>
            <CInput
              id="student-region"
              v-model="studentProfile.region"
              type="text"
              :label="t('Region')"
              placeholder="Enter Region"
            />
          </div>
          <!-- City Field -->
          <div>
            <CInput
              id="student-city"
              v-model="studentProfile.city"
              type="text"
              :label="t('City')"
              placeholder="Enter City"
            />
          </div>
          <!-- Phone Numbers (moved to the end) -->
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ t("Phone Numbers") }}
            </label>
            <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-end">
              <div class="flex flex-col items-stretch gap-2">
                <div v-for="(phone, index) in user.phone_numbers" :key="index" class="flex items-center gap-2">
                  <CInput
                    :id="'phone-number-' + index"
                    v-model="user.phone_numbers[index]"
                    type="tel"
                    placeholder="Enter Phone Number"
                  />
                  <CButton variant="danger" v-if="user.phone_numbers.length > 1" @click="removePhoneField(index)"><TrashIcon class="h-5 w-5" /></CButton>
                </div>
              </div>
              <CButton @click="addPhoneField">
                <PlusIcon class="h-5 w-5" /> {{ t("Add more") }}
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
            <CInput
              id="student-parent-name"
              v-model="studentProfile.parent_name"
              type="text"
              :label="t('Parent Name')"
              placeholder="Enter Parent Name"
            />
          </div>
          <!-- Parent Phone Field -->
          <div>
            <CInput
              id="student-parent-phone"
              v-model="studentProfile.parent_phone"
              type="tel"
              :label="t('Parent Phone')"
              placeholder="Enter Parent Phone"
            />
          </div>
          <!-- Parent Email Field -->
          <div>
            <CInput
              id="student-parent-email"
              v-model="studentProfile.parent_email"
              type="email"
              :label="t('Parent Email')"
              placeholder="Enter Parent Email"
            />
          </div>
          <!-- Mentor Name Field -->
          <div>
            <CInput
              id="student-mentor-name"
              v-model="studentProfile.mentor_name"
              type="text"
              :label="t('Mentor Name')"
              placeholder="Enter Mentor Name"
            />
          </div>
          <!-- Mentor Email Field -->
          <div>
            <CInput
              id="student-mentor-email"
              v-model="studentProfile.mentor_email"
              type="email"
              :label="t('Mentor Email')"
              placeholder="Enter Mentor Email"
            />
          </div>
        </div>
      </fieldset>

      <!-- Health Information -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Health Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Blood Type Field -->
          <div>
            <CSelect
              id="student-blood-type"
              v-model="studentProfile.blood_type"
              :options="bloodTypeOptions"
              :label="t('Blood Type')"
            />
          </div>
          <!-- Allergies Field -->
          <div>
            <CInput
              id="student-allergies"
              v-model="studentProfile.allergies"
              type="text"
              :label="t('Allergies')"
              placeholder="Enter Allergies (if any)"
            />
          </div>
          <!-- Violations Field -->
          <div>
            <CInput
              id="student-violations"
              v-model="studentProfile.violations"
              type="text"
              :label="t('Violations')"
              placeholder="Enter Violations (if any)"
            />
          </div>
        </div>
      </fieldset>

      <!-- Emergency Contact -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Emergency Contact") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Emergency Contact Name Field -->
          <div>
            <CInput
              id="student-emergency-name"
              v-model="studentProfile.emergency_contact_name"
              type="text"
              :label="t('Emergency Contact Name')"
              placeholder="Enter Emergency Contact Name"
            />
          </div>
          <!-- Emergency Contact Phone Field -->
          <div>
            <CInput
              id="student-emergency-phone"
              v-model="studentProfile.emergency_contact_phone"
              type="tel"
              :label="t('Emergency Contact Phone')"
              placeholder="Enter Emergency Contact Phone"
            />
          </div>
        </div>
      </fieldset>

      <!-- Registration & Status -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Registration & Status") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Status Field -->
          <div>
            <CSelect
              id="student-status"
              v-model="studentProfile.status"
              :options="statusOptions"
              :label="t('Status')"
              required
            />
          </div>
          <!-- Registration Date Field -->
          <div>
            <CInput
              id="student-registration-date"
              v-model="studentProfile.registration_date"
              type="date"
              :label="t('Registration Date')"
              :disabled="isEditing"
              required
            />
          </div>
          <!-- Agree to Dormitory Rules Field -->
          <div>
            <CCheckbox
              id="student-agree-rules"
              v-model="studentProfile.agree_to_dormitory_rules"
              :label="t('Agree to Dormitory Rules')"
              :disabled="isEditing"
              :aria-disabled="isEditing ? 'true' : 'false'"
            />
          </div>
          <!-- Has Meal Plan Field -->
          <div>
            <CCheckbox
              id="student-meal-plan"
              v-model="studentProfile.has_meal_plan"
              :label="t('Has Meal Plan')"
            />
          </div>
        </div>
      </fieldset>

      <!-- Educational Information -->
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Educational Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Faculty Field -->
          <div>
            <CInput
              id="student-faculty"
              v-model="studentProfile.faculty"
              type="text"
              :label="t('Faculty')"
              :placeholder="t('Enter Faculty Name')"
              required
            />
          </div>
          <!-- Specialist Field -->
          <div>
            <CInput
              id="student-specialist"
              v-model="studentProfile.specialist"
              type="text"
              :label="t('Specialist')"
              :placeholder="t('Enter Specialty/Program Name')"
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
          <!-- Dormitory Field - Only visible after dormitory selection -->
          <div>
            <CSelect
              id="student-dormitory"
              v-model="selectedDormitory"
              :options="dormitoryOptions"
              :label="t('Dormitory')"
              :disabled="loadingDormitories || isAdmin"
              required
            />
            <div v-if="loadingDormitories" class="text-sm text-gray-500 mt-1">
              {{ t('Loading dormitories...') }}
            </div>
            <div v-if="isAdmin" class="text-sm text-gray-500 mt-1">
              {{ t('Dormitory cannot be changed by admin') }}
            </div>
          </div>
          <!-- Room Field - Only visible after dormitory selection -->
          <div v-if="selectedDormitory">
            <CSelect
              id="student-room"
              v-model="studentProfile.room_id"
              :options="roomOptions"
              :label="t('Room')"
              :disabled="loadingRooms || roomOptions.length === 0"
              required
            />
            <div v-if="loadingRooms" class="text-sm text-gray-500 mt-1">
              {{ t('Loading rooms...') }}
            </div>
            <div v-else-if="!loadingRooms && roomOptions.length === 0" class="text-sm text-red-500 mt-1">
              {{ t('No rooms available in this dormitory') }}
            </div>
          </div>
          <!-- Bed Field - Only visible after room selection -->
          <div v-if="studentProfile.room_id">
            <CSelect
              id="student-bed"
              v-model="studentProfile.bed_id"
              :options="bedOptions"
              :label="t('Bed')"
              :disabled="bedOptions.length === 0"
              required
            />
            <div v-if="bedOptions.length === 0" class="text-sm text-red-500 mt-1">
              {{ t('No beds available in this room') }}
            </div>
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
import { PlusIcon, PrinterIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { User } from "@/models/User";
import type { StudentProfile } from "@/models/StudentProfile";
import { Room } from "@/models/Room";
import { Dormitory } from "@/models/Dormitory";
import { useStudentStore } from "@/stores/student";
import { useAuthStore } from "@/stores/auth";
import { studentService, authService, roomService, dormitoryService } from "@/services/api";
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

// Real dormitories and rooms from API
const dormitories = ref<Dormitory[]>([]);
const rooms = ref<Room[]>([]);
const allBeds = ref<any[]>([]);
const loadingRooms = ref(false);
const loadingDormitories = ref(false);

onMounted(async () => {
  loadingDormitories.value = true;
  try {
    console.log('Fetching dormitories from public endpoint...');
    // Fetch dormitories from public endpoint (bypasses role-based filtering)
    const dormitoriesResponse = await fetch('/api/dormitories/public');
    console.log('Dormitories response status:', dormitoriesResponse.status);
    if (dormitoriesResponse.ok) {
      const data = await dormitoriesResponse.json();
      console.log('Dormitories data received:', data);
      dormitories.value = data || [];
    } else {
      console.log('Public endpoint failed, falling back to regular endpoint...');
      // Fallback to regular endpoint
      const dormitoriesResponse = await dormitoryService.getAll();
      dormitories.value = dormitoriesResponse.data || [];
    }
    console.log('Final dormitories value:', dormitories.value);
  } catch (e) {
    console.error('Failed to fetch dormitories:', e);
    dormitories.value = [];
  } finally {
    loadingDormitories.value = false;
  }
  
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
  name: "",
  surname: "",
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
  country: "",
  region: "",
  city: "",
  parent_name: "",
  parent_phone: "",
  parent_email: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  deal_number: "",
  agree_to_dormitory_rules: false,
  has_meal_plan: false,
  allergies: "",
  status: "",
  registration_date: "",
  violations: "",
  mentor_name: "",
  mentor_email: "",
  room: null,
  bed: null,
  bed_id: null,
});

// Selected dormitory (separate from room selection)
const selectedDormitory = ref<number | null>(null);

// Populate the form if editing an existing student
watch(
  () => studentStore.selectedStudent,
  (selectedStudent) => {
    // Do not overwrite when editing a specific student by id
    if (selectedStudent && !isEditing.value) {
      // Populate user fields
      user.value = {
        name: selectedStudent.first_name || selectedStudent.name || "",
        email: selectedStudent.email || "",
        phone_numbers: (() => {
          const arr = normalizePhones(selectedStudent.phone_numbers, selectedStudent.phone);
          return arr.length ? arr : [""];
        })()
      };
      // Populate studentProfile fields
      studentProfile.value = {
        iin: selectedStudent.student_profile?.iin || "",
        faculty: selectedStudent.student_profile?.faculty || "",
        specialist: selectedStudent.student_profile?.specialist || "",
        enrollment_year: selectedStudent.student_profile?.enrollment_year,
        gender: selectedStudent.student_profile?.gender || "",
        blood_type: selectedStudent.student_profile?.blood_type || "",
        country: selectedStudent.student_profile?.country || "",
        region: selectedStudent.student_profile?.region || "",
        city: selectedStudent.student_profile?.city || "",
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
  dormitories.value.map((d) => ({ value: d.id, name: d.name }))
);

const roomOptions = computed(() =>
  rooms.value
    .map((r) => ({ value: r.id, name: r.number }))
);

// Function to fetch rooms for selected dormitory
const fetchRoomsForDormitory = async (dormitoryId: number) => {
  loadingRooms.value = true;
  try {
    // Try public rooms endpoint first to avoid 403 with role-protected endpoints
    const publicResp = await fetch(`/api/dormitories/${dormitoryId}/rooms`);
    if (publicResp.ok) {
      const data = await publicResp.json();
      rooms.value = Array.isArray(data) ? data : (data?.rooms || []);
    } else {
      // Fallback to authenticated service(s)
      try {
        const response = await dormitoryService.getById(dormitoryId);
        rooms.value = response.data?.rooms || [];
      } catch (_) {
        const roomsResponse = await roomService.getAll({ dormitory_id: dormitoryId });
        rooms.value = roomsResponse.data?.data || roomsResponse.data || [];
      }
    }
    // Flatten all available beds for selection
    allBeds.value = rooms.value.flatMap(room => (room.beds || []).map(bed => ({ ...bed, room })));
  } catch (e) {
    console.error('Failed to fetch rooms for dormitory:', e);
    rooms.value = [];
    allBeds.value = [];
  } finally {
    loadingRooms.value = false;
  }
};

// Bed options for selected room
const bedOptions = computed(() => {
  const rid = (studentProfile.value as any).room_id || studentProfile.value.room?.id;
  if (!rid) return [];
  return allBeds.value
    .filter(b => (b.room?.id || b.room_id) === rid)
    .filter(bed => !bed.reserved_for_staff) // Exclude staff reserved beds completely
    .map(bed => ({
      value: bed.id,
      name: `${t('Bed')} ${bed.bed_number}`,
      disabled: false // No need to disable since we filtered out staff reserved beds
    }));
});

// Watch for changes to selectedDormitory and fetch rooms
watch(selectedDormitory, async (newDormId) => {
  if (newDormId) {
    (studentProfile.value as any).room_id = null;
    studentProfile.value.bed = null;
    studentProfile.value.bed_id = null;
    await fetchRoomsForDormitory(newDormId);
  } else {
    rooms.value = [];
    allBeds.value = [];
    (studentProfile.value as any).room_id = null;
    studentProfile.value.bed = null;
    studentProfile.value.bed_id = null;
  }
});

// Watch for changes to room and reset bed if needed
watch(() => (studentProfile.value as any).room_id, (newRoomId) => {
  if (newRoomId) {
    // keep existing bed_id if it matches selected room; it may be set after rooms load
  } else {
    studentProfile.value.bed = null;
    studentProfile.value.bed_id = null;
  }
});

// Options for Select Fields
const genderOptions = [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
];

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
      } catch (_) {}
    }
    return trimmed ? [trimmed] : [];
  }
  if (typeof fallback === "string" && (fallback as string).trim() !== "") return [(fallback as string).trim()];
  return [];
};

// Submit Form
const submitForm = async (): Promise<void> => {
  const cleanedPhones = (user.value.phone_numbers || [])
    .map(p => (p ?? "").toString().trim())
    .filter(p => p.length > 0);
  if (!cleanedPhones.length) {
    showError(t("At least one phone number is required."));
    return;
  }
  if (!studentProfile.value.bed_id) {
    showError(t("Please select a bed."));
    return;
  }
  
  // Check if selected bed is staff reserved
  const selectedBed = allBeds.value.find(b => b.id === studentProfile.value.bed_id);
  if (selectedBed && selectedBed.reserved_for_staff) {
    showError(t("Staff reserved beds cannot be selected for students."));
    return;
  }
  
  // For admins, prevent dormitory changes
  if (isAdmin.value && isEditing.value) {
    // Get the original student data to check if dormitory was changed
    const originalStudent = await studentService.getById(studentId.value!);
    const originalDormitoryId = originalStudent.data.room?.dormitory_id;
    
    if (originalDormitoryId && selectedDormitory.value !== originalDormitoryId) {
      showError(t("Admins cannot change student dormitory assignments."));
      return;
    }
  }
  try {
    // Clean profile data - convert empty strings to null for optional fields
    const cleanProfileData = { ...studentProfile.value };
    
    // Convert empty strings to null for optional fields
    const optionalFields = [
      'faculty', 'specialist', 'country', 'region', 'city', 'parent_name', 
      'parent_phone', 'parent_email', 'emergency_contact_name', 'emergency_contact_phone',
      'deal_number', 'allergies', 'violations', 'mentor_name', 'mentor_email'
    ];
    
    optionalFields.forEach(field => {
      if (cleanProfileData[field] === '') {
        cleanProfileData[field] = null;
      }
    });
    
    // Handle enrollment_year - convert null to undefined if not set
    if (cleanProfileData.enrollment_year === null || cleanProfileData.enrollment_year === '') {
      cleanProfileData.enrollment_year = undefined;
    }
    
    // Handle gender - convert empty string to null
    if (cleanProfileData.gender === '') {
      cleanProfileData.gender = null;
    }

    // Construct payload
    const payload = {
      user: {
        name: user.value.name,
        email: user.value.email,
        phone_numbers: cleanedPhones,
        password: user.value.password,
        password_confirmation: user.value.confirmPassword,
      },
      profile: {
        ...cleanProfileData,
        bed_id: studentProfile.value.bed_id || studentProfile.value.bed?.id,
        room_id: studentProfile.value.room?.id || studentProfile.value.room_id,
      },
    };
    
    console.log('Submitting payload:', JSON.stringify(payload, null, 2));
    console.log('Cleaned profile data:', JSON.stringify(cleanProfileData, null, 2));
    
    if (isEditing.value) {
      await studentService.update(studentId.value, payload);
      showSuccess(t("Student profile updated successfully!"));
    } else {
      await studentService.create(payload);
      showSuccess(t("Student created successfully!"));
    }
  } catch (error: any) {
    console.error('Profile update failed:', error);
    console.error('Error response:', error.response?.data);
    console.error('Validation errors:', error.response?.data?.errors);
    console.error('Full error object:', error);
    showError(error.response?.data?.message || t("Failed to save student data"));
  }
};

// Load student from API if editing
const loadStudent = async (id: number) => {
  try {
    // Use studentService.getById to load specific student data
    const response = await studentService.getById(id);
    const studentData = response.data;
    
    // Populate form with API data
    user.value = {
      name: studentData.first_name || studentData.name || "",
      surname: studentData.last_name || "",
      email: studentData.email || "",
      phone_numbers: (() => {
        const arr = normalizePhones(studentData.phone_numbers, studentData.phone);
        return arr.length ? arr : [""];
      })()
    };
    
    studentProfile.value = {
      iin: studentData.student_profile?.iin || "",
      faculty: studentData.student_profile?.faculty || "",
      specialist: studentData.student_profile?.specialist || studentData.student_profile?.specialty || "",
      enrollment_year: studentData.student_profile?.enrollment_year || studentData.enrollment_year,
      gender: studentData.student_profile?.gender || "",
      blood_type: studentData.student_profile?.blood_type || "",
      country: studentData.student_profile?.country || "",
      region: studentData.student_profile?.region || "",
      city: studentData.student_profile?.city || "",
      parent_name: studentData.student_profile?.parent_name || "",
      parent_phone: studentData.student_profile?.parent_phone || "",
      parent_email: studentData.student_profile?.parent_email || "",

      emergency_contact_name: studentData.student_profile?.emergency_contact_name || "",
      emergency_contact_phone: studentData.student_profile?.emergency_contact_phone || "",
      deal_number: studentData.student_profile?.deal_number || "",
      agree_to_dormitory_rules: studentData.student_profile?.agree_to_dormitory_rules || false,
      has_meal_plan: studentData.student_profile?.has_meal_plan || false,
      allergies: studentData.student_profile?.allergies || "",
      status: studentData.student_profile?.status || studentData.status || "",
      registration_date: studentData.student_profile?.registration_date || "",
      violations: studentData.student_profile?.violations || "",
      mentor_name: studentData.student_profile?.mentor_name || "",
      mentor_email: studentData.student_profile?.mentor_email || "",
      room: studentData.room || null,
      bed: null, // Will be set based on room selection
      bed_id: null,
    };
    
    // Set dormitory, room and bed selection
    if (studentData.room?.dormitory_id) {
      selectedDormitory.value = studentData.room.dormitory_id;
      await fetchRoomsForDormitory(studentData.room.dormitory_id);
      // Assign room id for select
      (studentProfile.value as any).room_id = studentData.room.id;
      // Try to hydrate bed selection if backend provided it
      const existingBedId = (studentData as any).bed_id || studentData.student_profile?.bed_id;
      if (existingBedId) {
        // Check if the existing bed is staff reserved
        const existingBed = allBeds.value.find(b => b.id === existingBedId);
        if (existingBed && existingBed.reserved_for_staff) {
          // Clear bed selection if it's staff reserved
          studentProfile.value.bed_id = null;
          console.warn('Cleared staff reserved bed selection for student');
        } else {
          studentProfile.value.bed_id = existingBedId as any;
        }
      }
    }
    
    showSuccess(t("Student data loaded successfully"));
  } catch (error) {
    console.error('Failed to load student data:', error);
    showError(t("Failed to load student data"));
  }
};

</script>

<style scoped>
/* Add custom styles if needed */
</style>
