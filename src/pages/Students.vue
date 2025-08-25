<template>
  <Navigation :title="t('Student Management')">
    <!-- Main Content -->
    <div class="flex flex-col gap-4">
      <!-- Search Input -->
      <div class="w-auto lg:w-128">
        <CInput
          id="search-input"
          v-model="searchQuery"
          type="search"
          :placeholder="t('Search')"
          :label="t('Search')"
        />
      </div>

      <!-- Filter Select Boxes -->
      <div class="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:justify-start">
        <CInput
          id="faculty-filter"
          v-model="filters.faculty"
          type="text"
          :label="t('Faculty')"
          :placeholder="t('Enter Faculty Name')"
          class="lg:w-40"
        />
        <CSelect
          id="room-filter"
          v-model="filters.room"
          :options="roomOptions"
          :label="t('Room')"
          :placeholder="t('Select Room')"
          class="lg:w-40"
        />
        <CSelect
          id="status-filter"
          v-model="filters.status"
          :options="statusOptions"
          :label="t('Status')"
          :placeholder="t('Select Status')"
          class="lg:w-40"
        />
      </div>

      <!-- Checkbox and Actions -->
      <div class="flex flex-col items-stretch justify-between gap-4 lg:flex-row">
        <CCheckbox
          id="show-dormitory-students"
          v-model="filters.showDormitoryStudents"
          :label="t('Show only students in dormitory')"
        />
        <div class="flex flex-col items-stretch justify-between gap-4 lg:flex-row">
          <CButton>
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("Export to Excel") }}
          </CButton>
          <CButton @click="navigateToAddStudent">
            <PlusIcon class="h-5 w-5" />
            {{ t("Add Student") }}
          </CButton>
        </div>
      </div>

      <!-- Student Table -->
      <div class="overflow-x-auto relative border border-gray-300 sm:rounded-lg" data-testid="students-table">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-primary-700 uppercase bg-primary-50 dark:bg-primary-700 dark:text-primary-400">
            <tr>
              <th class="px-6 py-3">
                <CCheckbox id="select-all-checkbox" />
              </th>
              <th class="px-6 py-3">{{ t("NAME") }}</th>
              <th class="px-6 py-3">{{ t("SURNAME") }}</th>
              <th class="px-6 py-3">{{ t("STATUS") }}</th>
              <th class="px-6 py-3">{{ t("ENROLMENT YEAR") }}</th>
              <th class="px-6 py-3">{{ t("FACULTY") }}</th>
              <th class="px-6 py-3">{{ t("DORM") }}</th>
              <th class="px-6 py-3">{{ t("ROOM") }}</th>
              <th class="px-6 py-3">{{ t("TELEPHONE") }}</th>
              <th class="px-6 py-3">{{ t("IN/OUT") }}</th>
              <th class="px-6 py-3 text-right">{{ t("Action") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="students.length === 0">
              <td colspan="11" class="px-6 py-4 text-center text-gray-500">
                {{ loading ? t("Loading...") : t("No data available") }}
              </td>
            </tr>
            <tr v-for="(student, index) in students" :key="student.id || index" class="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <td class="px-6 py-4">
                <CCheckbox :id="'checkbox-' + index" />
              </td>
              <td class="px-6 py-4">{{ student.first_name || student.name }}</td>
              <td class="px-6 py-4">{{ student.last_name || student.surname }}</td>
              <td class="px-6 py-4">{{ student.status }}</td>
              <td class="px-6 py-4">{{ student.studentProfile?.enrollment_year || student.enrollment_year || student.year_of_study }}</td>
              <td class="px-6 py-4">{{ student.studentProfile?.faculty || student.faculty }}</td>
              <td class="px-6 py-4">
                {{ student.room?.dormitory?.name || student.dormitory?.name || "" }}
              </td>
              <td class="px-6 py-4">
                {{ student.room?.number || student.room || "" }}
              </td>
              <td class="px-6 py-4">{{ student.phone_numbers?.[0] || student.phone || student.telephone }}</td>
              <td class="px-6 py-4">
                <component
                  :is="student.status === t('In') ? CheckCircleIcon : XCircleIcon"
                  :class="student.status === t('In') ? 'text-green-500' : 'text-red-500'"
                  class="mx-auto h-6 w-6"
                />
              </td>
              <td class="px-6 py-4 text-right">
                <CButton @click="navigateToEditStudent(student.id || index)">
                  <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
                </CButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between" data-testid="pagination">
        <CButton :disabled="currentPage === 1" @click="currentPage--" :aria-label="t('Previous page')">
          {{ t("Previous") }}
        </CButton>
        <span>
          {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
        </span>
        <CButton :disabled="currentPage === totalPages" @click="currentPage++" :aria-label="t('Next page')">
          {{ t("Next") }}
        </CButton>
      </div>

      <!-- Bulk Actions -->
      <div class="flex flex-row items-end gap-4">
        <CSelect
          id="bulk-action"
          v-model="bulkAction"
          :options="bulkActionOptions"
          :label="t('Action')"
          :placeholder="t('Select Action')"
          class="w-auto lg:w-40"
        />
        <CButton variant="primary">
          {{ t("Submit") }}
        </CButton>
      </div>
    </div>
  </Navigation>
</template>

<script setup>
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowDownTrayIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
} from "@heroicons/vue/24/outline";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import CButton from "@/components/CButton.vue";
import { useStudentStore } from "@/stores/student";
import { studentService } from "@/services/api";

const { t } = useI18n();
const router = useRouter();
const studentStore = useStudentStore();

const searchQuery = ref("");
const filters = ref({
  faculty: "",
  room: "",
  status: "",
  showDormitoryStudents: false,
});
const bulkAction = ref("");
const students = ref([]);
const loading = ref(false);
const error = ref(null);

const roomOptions = [
  { value: "a227", name: "A227" },
  { value: "b317", name: "B317" },
  { value: "c105", name: "C105" },
];

const statusOptions = [
  { value: "registered", name: t("Registered") },
  { value: "reserv", name: t("Reserv") },
];

const bulkActionOptions = [
  { value: "deactivate", name: t("Deactivate") },
  { value: "delete", name: t("Delete") },
];

const currentPage = ref(1);
const itemsPerPage = 10;

// Filter students by searchQuery across common fields
const filteredStudents = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  console.log('🔍 Filtering students:', {
    searchQuery: searchQuery.value,
    trimmedQuery: q,
    totalStudents: students.value.length,
    hasQuery: !!q,
    studentsArrayRef: students.value
  });
  
  if (!q) {
    console.log('🔍 No search query, returning all students');
    return students.value;
  }
  
  const filtered = students.value.filter((s) => {
    const name = (s.first_name || s.name || '').toLowerCase();
    const surname = (s.last_name || s.surname || '').toLowerCase();
    const faculty = (s.studentProfile?.faculty || s.faculty || '').toLowerCase();
    const room = (s.room?.number || s.room || '').toString().toLowerCase();
    const dorm = (s.room?.dormitory?.name || s.dormitory?.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    
    const matches = (
      name.includes(q) ||
      surname.includes(q) ||
      faculty.includes(q) ||
      room.includes(q) ||
      dorm.includes(q) ||
      email.includes(q)
    );
    
    if (matches) {
      console.log('🔍 Student matches search:', { name, surname, faculty, room, dorm, email });
    }
    
    return matches;
  });
  
  console.log('🔍 Filtering result:', {
    originalCount: students.value.length,
    filteredCount: filtered.length,
    searchQuery: q
  });
  
  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / itemsPerPage));

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = currentPage.value * itemsPerPage;
  const result = filteredStudents.value.slice(start, end);
  
  console.log('📄 Pagination:', {
    currentPage: currentPage.value,
    itemsPerPage,
    start,
    end,
    filteredCount: filteredStudents.value.length,
    paginatedCount: result.length,
    hasData: result.length > 0,
    firstStudent: result[0] ? {
      id: result[0].id,
      name: result[0].first_name || result[0].name,
      email: result[0].email,
      faculty: result[0].studentProfile?.faculty || result[0].faculty,
      room: result[0].room?.number,
      dormitory: result[0].room?.dormitory?.name
    } : 'none'
  });
  
  return result;
});

// Fetch students from API
const fetchStudents = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    console.log('🔐 Token from localStorage:', token ? 'exists' : 'missing');
    
    if (!token) {
      error.value = 'Authentication required';
      students.value = [];
      return;
    }

    console.log('📡 Making API call to /api/students...');
    const response = await studentService.getAll({ per_page: 100 });
    console.log('📡 API Response received:', response);
    console.log('📡 Response data structure:', {
      hasData: !!response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasDataData: response.data && response.data.data,
      dataDataIsArray: response.data && response.data.data && Array.isArray(response.data.data)
    });
    
    // Handle Laravel paginated response structure
    if (response && response.data) {
      // Laravel paginated response: { data: [...], current_page: 1, ... }
      if (response.data.data && Array.isArray(response.data.data)) {
        students.value = response.data.data;
        console.log('✅ Using paginated response data');
      } else if (Array.isArray(response.data)) {
        // Direct array response
        students.value = response.data;
        console.log('✅ Using direct array response');
      } else {
        // Fallback - try to find data in the response
        students.value = [];
        console.log('⚠️ No valid data structure found, setting empty array');
      }
    } else {
      students.value = [];
      console.log('⚠️ No response data, setting empty array');
    }
    
    console.log('📊 Final students array:', students.value);
    console.log('📊 Number of students:', students.value.length);
    console.log('📊 First student (if any):', students.value[0]);
  } catch (err) {
    console.error('❌ Error fetching students:', err);
    console.error('❌ Error details:', {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    });
    error.value = err.message || 'Failed to fetch students';
    students.value = [];
  } finally {
    loading.value = false;
    console.log('🏁 fetchStudents completed, loading:', loading.value);
  }
};

const navigateToAddStudent = () => {
  router.push("/student-form");
};

const navigateToEditStudent = (studentId) => {
  const student = students.value.find(s => s.id === studentId);
  if (student) {
    studentStore.setSelectedStudent(student);
    router.push(`/student-form/${studentId}`);
  }
};

// Watch for changes in students array
watch(students, (newStudents, oldStudents) => {
  console.log('👀 Students array changed:', {
    oldLength: oldStudents?.length || 0,
    newLength: newStudents?.length || 0,
    oldFirst: oldStudents?.[0] || 'none',
    newFirst: newStudents?.[0] || 'none'
  });
  
  // Force re-computation of filtered and paginated students
  console.log('👀 After change - filteredStudents.length:', filteredStudents.value.length);
  console.log('👀 After change - paginatedStudents.length:', paginatedStudents.value.length);
}, { deep: true });

onMounted(async () => {
  console.log('🚀 Students component mounted');
  console.log('🔐 Current auth state:', {
    hasToken: !!localStorage.getItem('token'),
    tokenLength: localStorage.getItem('token')?.length || 0
  });
  
  studentStore.clearSelectedStudent();
  console.log('📡 Starting to fetch students...');
  await fetchStudents();
  console.log('✅ Component mount completed');
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
