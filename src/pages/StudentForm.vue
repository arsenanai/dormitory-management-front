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
      <fieldset class="border border-primary-200 rounded p-4">
        <legend class="text-lg font-semibold px-2 text-primary-700">{{ t("Family Information") }}</legend>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Father's Name Field -->
          <div>
            <CInput
              id="student-father-name"
              v-model="studentProfile.father_name"
              type="text"
              :label="t('Father\'s Name')"
              placeholder="Enter Father's Name"
            />
          </div>
          <!-- Mother's Name Field -->
          <div>
            <CInput
              id="student-mother-name"
              v-model="studentProfile.mother_name"
              type="text"
              :label="t('Mother\'s Name')"
              placeholder="Enter Mother's Name"
            />
          </div>
          <!-- Father's Phone Field -->
          <div>
            <CInput
              id="student-father-phone"
              v-model="studentProfile.father_phone"
              type="tel"
              :label="t('Father\'s Phone')"
              placeholder="Enter Father's Phone"
            />
          </div>
          <!-- Mother's Phone Field -->
          <div>
            <CInput
              id="student-mother-phone"
              v-model="studentProfile.mother_phone"
              type="tel"
              :label="t('Mother\'s Phone')"
              placeholder="Enter Mother's Phone"
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
              required
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
              :disabled="loadingDormitories"
              required
            />
            <div v-if="loadingDormitories" class="text-sm text-gray-500 mt-1">
              {{ t('Loading dormitories...') }}
            </div>
          </div>
          <!-- Room Field - Only visible after dormitory selection -->
          <div v-if="selectedDormitory">
            <CSelect
              id="student-room"
              v-model="studentProfile.room"
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
          <div v-if="studentProfile.room">
            <CSelect
              id="student-bed"
              v-model="studentProfile.bed"
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
import { PlusIcon, PrinterIcon } from "@heroicons/vue/24/outline";
import type { User } from "@/models/User";
import type { StudentProfile } from "@/models/StudentProfile";
import { Room } from "@/models/Room";
import { Dormitory } from "@/models/Dormitory";
import { useStudentStore } from "@/stores/student";
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
  // ... add all other fields as needed
});

// Selected dormitory (separate from room selection)
const selectedDormitory = ref<number | null>(null);

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
          const response = await dormitoryService.getById(dormitoryId);
    if (response.data && response.data.rooms) {
      rooms.value = response.data.rooms;
      // Flatten all available beds for selection
      allBeds.value = rooms.value.flatMap(room => 
        (room.beds || []).map(bed => ({ ...bed, room }))
      );
    } else {
      // Fallback: try to get rooms from rooms endpoint with dormitory filter
      const roomsResponse = await roomService.getAll({ dormitory_id: dormitoryId });
      rooms.value = roomsResponse.data?.data || roomsResponse.data || [];
      allBeds.value = rooms.value.flatMap(room => 
        (room.beds || []).map(bed => ({ ...bed, room }))
      );
    }
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
  if (!studentProfile.value.room) return [];
  return allBeds.value
    .filter(b => b.room.id === studentProfile.value.room.id)
    .map(bed => ({
      value: bed,
      name: `${t('Bed')} ${bed.number}${bed.reserved_for_staff ? ' (' + t('Staff Reserved') + ')' : ''}`,
      disabled: bed.reserved_for_staff // For students, staff-reserved beds are disabled
    }));
});

// Watch for changes to selectedDormitory and fetch rooms
watch(selectedDormitory, async (newDormId) => {
  if (newDormId) {
    // Reset room and bed when dormitory changes
    studentProfile.value.room = null;
    studentProfile.value.bed = null;
    
    // Fetch rooms for the selected dormitory
    await fetchRoomsForDormitory(newDormId);
  } else {
    // Clear rooms and beds if no dormitory selected
    rooms.value = [];
    allBeds.value = [];
    studentProfile.value.room = null;
    studentProfile.value.bed = null;
  }
});

// Watch for changes to room and reset bed if needed
watch(() => studentProfile.value.room, (newRoom) => {
  if (newRoom) {
    // Reset bed when room changes
    studentProfile.value.bed = null;
  } else {
    // Clear bed if no room selected
    studentProfile.value.bed = null;
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

// Note: Country, region, and city are now direct text input fields

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
