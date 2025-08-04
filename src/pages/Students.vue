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
        <CSelect
          id="faculty-filter"
          v-model="filters.faculty"
          :options="facultyOptions"
          :label="t('Faculty')"
          :placeholder="t('Select Faculty')"
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
      <CTable data-testid="students-table">
        <CTableHead>
          <CTableHeadCell>
            <CCheckbox id="select-all-checkbox" />
          </CTableHeadCell>
          <CTableHeadCell>{{ t("NAME") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("SURNAME") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("STATUS") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("ENROLMENT YEAR") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("FACULTY") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("DORM") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("ROOM") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("TELEPHONE") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("IN/OUT") }}</CTableHeadCell>
          <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="(student, index) in paginatedStudents" :key="student.id || index">
            <CTableCell>
              <CCheckbox :id="'checkbox-' + index" />
            </CTableCell>
            <CTableCell>{{ student.first_name || student.name }}</CTableCell>
            <CTableCell>{{ student.last_name || student.surname }}</CTableCell>
            <CTableCell>{{ student.status }}</CTableCell>
            <CTableCell>{{ student.enrollment_year || student.year_of_study }}</CTableCell>
            <CTableCell>{{ student.faculty }}</CTableCell>
            <CTableCell>
              {{ student.room?.dormitory?.name || student.dormitory?.name || "" }}
            </CTableCell>
            <CTableCell>
              {{ student.room?.number || student.room || "" }}
            </CTableCell>
            <CTableCell>{{ student.phone || student.telephone }}</CTableCell>
            <CTableCell>
              <component
                :is="student.status === t('In') ? CheckCircleIcon : XCircleIcon"
                :class="student.status === t('In') ? 'text-green-500' : 'text-red-500'"
                class="mx-auto h-6 w-6"
              />
            </CTableCell>
            <CTableCell class="text-right">
              <CButton @click="navigateToEditStudent(student.id || index)">
                <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
              </CButton>
            </CTableCell>
          </CTableRow>
        </CTableBody>
      </CTable>

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
import { ref, computed, onMounted } from "vue";
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
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import { useStudentStore } from "@/stores/student";
import api from "@/services/api";

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

const facultyOptions = [
  { value: "engineering", name: t("Engineering and natural sciences") },
  { value: "business", name: t("Business and economics") },
  { value: "law", name: t("Law and social sciences") },
];

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
const totalPages = computed(() =>
  Math.ceil(students.value.length / itemsPerPage),
);
const paginatedStudents = computed(() => {
  console.log('paginatedStudents computed - students.value:', students.value);
  console.log('paginatedStudents computed - students.value.length:', students.value.length);
  console.log('paginatedStudents computed - currentPage.value:', currentPage.value);
  console.log('paginatedStudents computed - itemsPerPage:', itemsPerPage);
  
  const result = students.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage,
  );
  
  console.log('paginatedStudents computed - result:', result);
  console.log('paginatedStudents computed - result.length:', result.length);
  
  return result;
});

// Fetch students from API
const fetchStudents = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.get('/students');
    console.log('API Response:', response.data);
    
    // Handle both paginated and non-paginated responses
    if (response.data.data && Array.isArray(response.data.data)) {
      // Paginated response: { data: [...], current_page: 1, ... }
      students.value = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Direct array response: [...]
      students.value = response.data;
    } else {
      // Fallback
      students.value = [];
    }
    
    console.log('Fetched students:', students.value);
    console.log('Number of students:', students.value.length);
  } catch (err) {
    console.error('Error fetching students:', err);
    error.value = err.message || 'Failed to fetch students';
    students.value = [];
  } finally {
    loading.value = false;
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

onMounted(async () => {
  studentStore.clearSelectedStudent();
  await fetchStudents();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
