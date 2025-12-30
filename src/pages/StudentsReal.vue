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
          <CButton @click="exportStudents" :disabled="isLoading">
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("Download") }}
          </CButton>
          <CButton @click="navigateToAddStudent">
            <PlusIcon class="h-5 w-5" />
            {{ t("Add Student") }}
          </CButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center p-8">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
      >
        {{ error }}
      </div>

      <!-- Student Table -->
      <CTable v-else>
        <CTableHead>
          <CTableHeadCell>
            <CCheckbox id="select-all-checkbox" />
          </CTableHeadCell>
          <CTableHeadCell>{{ t("FIRST NAME") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("LAST NAME") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("EMAIL") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("STUDENT ID") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("STATUS") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("FACULTY") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("COURSE") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("PHONE") }}</CTableHeadCell>
          <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="student in students" :key="student.id">
            <CTableCell>
              <CCheckbox :id="'checkbox-' + student.id" />
            </CTableCell>
            <CTableCell>{{ student.first_name || student.name || "" }}</CTableCell>
            <CTableCell>{{ student.last_name || "" }}</CTableCell>
            <CTableCell>{{ student.email }}</CTableCell>
            <CTableCell>{{ student.student_id || "" }}</CTableCell>
            <CTableCell>
              <span
                :class="getStatusClass(student.status)"
                class="rounded-full px-2 py-1 text-xs font-medium"
              >
                {{ getStatusLabel(student.status) }}
              </span>
            </CTableCell>
            <CTableCell>{{ student.faculty || "" }}</CTableCell>
            <CTableCell>{{ student.course || "" }}</CTableCell>
            <CTableCell>{{ student.phone || "" }}</CTableCell>
            <CTableCell class="text-right">
              <div class="flex justify-end gap-2">
                <CButton @click="editStudent(student)" size="small">
                  <PencilSquareIcon class="h-4 w-4" />
                </CButton>
                <CButton
                  v-if="student.status === 'pending'"
                  @click="approveStudent(student.id)"
                  size="small"
                  variant="success"
                >
                  <CheckCircleIcon class="h-4 w-4" />
                </CButton>
              </div>
            </CTableCell>
          </CTableRow>
        </CTableBody>
      </CTable>

      <!-- Pagination -->
      <div v-if="pagination" class="mt-4 flex items-center justify-between">
        <div class="text-primary-600 text-sm">
          {{ t("Showing") }} {{ pagination.from || 0 }} {{ t("to") }} {{ pagination.to || 0 }}
          {{ t("of") }} {{ pagination.total || 0 }} {{ t("results") }}
        </div>
        <div class="flex gap-2">
          <CButton @click="previousPage" :disabled="!pagination.prev_page_url" size="small">
            {{ t("Previous") }}
          </CButton>
          <CButton @click="nextPage" :disabled="!pagination.next_page_url" size="small">
            {{ t("Next") }}
          </CButton>
        </div>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
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
import { useToast } from "@/composables/useToast";
import { studentService } from "@/services/api";

const { t } = useI18n();
const router = useRouter();
const studentStore = useStudentStore();
const { showError, showSuccess } = useToast();

// State
const students = ref([]);
const pagination = ref(null);
const isLoading = ref(false);
const error = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);

const filters = ref({
  faculty: "",
  room: "",
  status: "",
  showDormitoryStudents: false,
});

// Options
const roomOptions = ref([{ value: "", name: t("All Rooms") }]);

const statusOptions = [
  { value: "", name: t("All Statuses") },
  { value: "pending", name: t("Pending") },
  { value: "approved", name: t("Approved") },
  { value: "rejected", name: t("Rejected") },
];

// Methods
const fetchStudents = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const params = {
      page: currentPage.value,
      search: searchQuery.value,
      faculty: filters.value.faculty,
      status: filters.value.status,
      has_room: filters.value.showDormitoryStudents ? 1 : undefined,
    };

    // Remove empty parameters
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await studentService.getAll(params);

    if (response.data.data) {
      students.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
        prev_page_url: response.data.prev_page_url,
        next_page_url: response.data.next_page_url,
      };
    } else {
      students.value = response.data;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t("Failed to fetch students");
    showError(error.value);
    console.error("Error fetching students:", err);
  } finally {
    isLoading.value = false;
  }
};

const approveStudent = async (studentId: number) => {
  try {
    await studentService.approve(studentId);
    await fetchStudents(); // Refresh the list
  } catch (err: any) {
    error.value = err.response?.data?.message || t("Failed to approve student");
    showError(error.value);
  }
};

const exportStudents = async () => {
  try {
    const params = {
      search: searchQuery.value,
      faculty: filters.value.faculty,
      status: filters.value.status,
      has_room: filters.value.showDormitoryStudents ? 1 : undefined,
    };

    const response = await studentService.export(params);

    // Create blob and download
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students_${new Date().toISOString().split("T")[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    error.value = err.response?.data?.message || t("Failed to export students");
    showError(error.value);
  }
};

const editStudent = (student: any) => {
  studentStore.setSelectedStudent(student);
  router.push(`/students/${student.id}/edit`);
};

const navigateToAddStudent = () => {
  router.push("/students/create");
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "approved":
      return t("Approved");
    case "pending":
      return t("Pending");
    case "rejected":
      return t("Rejected");
    default:
      return status;
  }
};

const previousPage = () => {
  if (pagination.value?.prev_page_url) {
    currentPage.value--;
    fetchStudents();
  }
};

const nextPage = () => {
  if (pagination.value?.next_page_url) {
    currentPage.value++;
    fetchStudents();
  }
};

// Watchers
watch(
  [searchQuery, filters],
  () => {
    currentPage.value = 1;
    fetchStudents();
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  fetchStudents();
});
</script>
