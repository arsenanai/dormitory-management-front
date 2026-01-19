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
          :placeholder="t('All Rooms')"
          :label="t('Room')"
          class="lg:w-40"
        />
        <CSelect
          id="status-filter"
          v-model="filters.status"
          :options="statusOptions"
          :placeholder="t('All Statuses')"
          :label="t('Status')"
          class="lg:w-40"
        />
      </div>

      <!-- Checkbox and Actions -->
      <div class="flex flex-col items-stretch justify-between gap-4 lg:flex-row">
        <!-- <CCheckbox
          id="show-dormitory-students"
          v-model="filters.showDormitoryStudents"
          :label="t('Show only students in dormitory')"
        /> -->
        <div class="flex flex-col items-stretch justify-between gap-4 lg:flex-row">
          <CButton @click="exportStudents" :disabled="loading">
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("Download") }}
          </CButton>
          <CButton @click="navigateToAddStudent">
            <PlusIcon class="h-5 w-5" />
            {{ t("Add Student") }}
          </CButton>
        </div>
      </div>

      <!-- Student Table using CTable components -->
      <CTable
        :data="students"
        :columns="tableColumns"
        :loading="loading"
        data-testid="students-table"
        hoverable
        @row-click="handleRowClick"
      >
        <template #cell-student="{ row }">
          <div class="flex items-center space-x-2">
            <!-- Profile Picture -->
            <div class="flex-shrink-0">
              <div
                v-if="getProfilePictureUrl(row)"
                class="h-10 w-10 cursor-pointer overflow-hidden rounded bg-gray-200 transition-opacity hover:opacity-80"
              >
                <img
                  :src="getProfilePictureUrl(row)"
                  :alt="row.name || 'Student'"
                  class="h-full w-full object-cover"
                  style="
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                  "
                  @click.stop="showStudentPicture(row)"
                />
              </div>
              <div
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200"
              >
                <UserIcon class="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <!-- Student Name -->
            <span class="font-medium">{{ row.name || "-" }}</span>
          </div>
        </template>
        <template #cell-status="{ row }">
          <span
            :class="getStatusClass(row.status)"
            class="rounded-full px-2 py-1 text-xs font-medium"
          >
            {{ getStatusLabel(row.status) }}
          </span>
        </template>
        <template #cell-enrollment_year="{ row }">
          {{ row.student_profile?.enrollment_year || row.enrollment_year || "-" }}
        </template>
        <template #cell-faculty="{ row }">
          {{ row.student_profile?.faculty || row.faculty || "-" }}
        </template>
        <template #cell-bed="{ row }">
          <span v-if="row.room && row.student_bed" class="whitespace-nowrap">
            {{ row.room.number }}-{{ row.student_bed.bed_number }}
          </span>
          <span v-else>-</span>
        </template>
        <template #cell-telephone="{ row }">
          {{ row.phone_numbers?.[0] || row.phone || "-" }}
        </template>
        <template #cell-registration_date="{ row }">
          {{ formatDate(row.created_at) || "-" }}
        </template>
        <template #cell-in_out="{ row }">
          <span v-if="row.status === 'active'" class="text-green-500">
            <CheckCircleIcon class="mx-auto h-6 w-6" />
          </span>
          <span v-else class="text-red-500">
            <XCircleIcon class="mx-auto h-6 w-6" />
          </span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex justify-end gap-2">
            <CButton @click="navigateToEditStudent(row.id)" size="small">
              <PencilSquareIcon class="h-5 w-5" />
            </CButton>
            <CButton @click="confirmDeleteStudent(row.id)" size="small" variant="danger">
              <TrashIcon class="h-5 w-5" />
            </CButton>
          </div>
        </template>
      </CTable>

      <!-- Pagination -->
      <div
        class="flex flex-col items-center justify-between gap-4 md:flex-row"
        data-testid="pagination"
      >
        <div class="text-sm text-gray-700">
          <span v-if="totalStudents > 0">
            <span class="font-medium">{{ fromStudent }}</span> -
            <span class="font-medium">{{ toStudent }}</span> /
            <span class="font-medium">{{ totalStudents }}</span>
          </span>
          <span v-else>
            {{ t("No data available") }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <CButton
            :disabled="currentPage === 1"
            @click="currentPage--"
            :aria-label="t('Previous page')"
            class="h-10"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </CButton>
          <div class="flex items-center gap-1 text-sm">
            <div class="w-20">
              <CInput
                id="page-input"
                v-model.number="pageInput"
                type="number"
                :min="1"
                :max="totalPages"
                class="h-10 text-center"
                @keyup.enter="goToPage"
              />
            </div>
            <span>/ {{ totalPages }}</span>
          </div>
          <CButton
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            :aria-label="t('Next page')"
            class="h-10"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </CButton>
        </div>
      </div>
    </div>

    <!-- Picture Modal -->
    <CModal v-model="showPictureModal" :title="selectedStudent?.name || 'Student Picture'">
      <div
        v-if="selectedStudent && getProfilePictureUrl(selectedStudent)"
        class="flex flex-col items-center"
      >
        <img
          :src="getProfilePictureUrl(selectedStudent)"
          :alt="selectedStudent.name || 'Student'"
          class="max-h-[70vh] max-w-full rounded-lg object-contain"
        />
        <p class="mt-4 text-center text-gray-600">
          <strong>{{ selectedStudent.name }}</strong
          ><br />
          <span v-if="selectedStudent.student_profile?.enrollment_year">
            {{ selectedStudent.student_profile.enrollment_year }}
          </span>
          <span v-if="selectedStudent.student_profile?.faculty">
            • {{ selectedStudent.student_profile.faculty }}
          </span>
        </p>
      </div>
      <div v-else class="text-center text-gray-500">
        <UserIcon class="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <p>No picture available</p>
      </div>
    </CModal>
  </Navigation>
</template>

<script setup lang="ts">
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
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import CButton from "@/components/CButton.vue";
import { useStudentStore } from "@/stores/student";
import { useToast } from "@/composables/useToast";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CModal from "@/components/CModal.vue";
import { studentService } from "@/services/api";

const { t } = useI18n();
const router = useRouter();
const studentStore = useStudentStore();

const searchQuery = ref("");
const { showSuccess, showError, showConfirmation } = useToast();
const filters = ref({
  faculty: "",
  room: "",
  status: "pending",
  showDormitoryStudents: false,
});
const students = ref([]);
const loading = ref(false);
const error = ref(null);

const statusOptions = [
  { value: "", name: t("All Statuses") },
  { value: "pending", name: t("Pending") },
  { value: "active", name: t("Active") },
  { value: "suspended", name: t("Suspended") },
];

const tableColumns = [
  { key: "student", label: t("STUDENT") },
  { key: "status", label: t("STATUS") },
  { key: "enrollment_year", label: t("ENROLMENT YEAR") },
  { key: "faculty", label: t("FACULTY") },
  { key: "bed", label: t("BED") },
  { key: "telephone", label: t("TELEPHONE") },
  { key: "registration_date", label: t("REGISTRATION DATE") },
  { key: "in_out", label: t("IN/OUT") },
  { key: "actions", label: "" },
];

const allRooms = ref([]);
const roomOptions = computed(() => {
  return [
    { value: "", name: t("All Rooms") },
    ...allRooms.value.map((room) => ({
      value: room.id,
      name: room.number,
    })),
  ];
});

const currentPage = ref(1);
const itemsPerPage = 10;
const pageInput = ref(1);
const totalStudents = ref(0);
const fromStudent = ref(0);
const toStudent = ref(0);

const totalPages = ref(1);
const selectedStudent = ref(null);
const showPictureModal = ref(false);

// Fetch students from API
const fetchStudents = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    console.log("🔐 Token from localStorage:", token ? "exists" : "missing");

    if (!token) {
      error.value = "Authentication required";
      students.value = [];
      return;
    }

    const apiParams: any = {
      page: currentPage.value,
      per_page: itemsPerPage,
    };

    if (searchQuery.value) apiParams.search = searchQuery.value;
    if (filters.value.faculty) apiParams.faculty = filters.value.faculty;
    if (filters.value.room) apiParams.room_id = filters.value.room;
    if (filters.value.status) apiParams.status = filters.value.status;
    if (filters.value.showDormitoryStudents) {
      // Assuming the backend uses the authenticated admin's dormitory ID when this is true
      apiParams.my_dormitory_only = true;
    }

    const response = await studentService.getAll(apiParams);
    console.log("📡 API Response received:", response);
    console.log("📡 Response data structure:", {
      hasData: !!response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasDataData: response.data?.data,
      dataDataIsArray: response.data?.data && Array.isArray(response.data.data),
    });

    // Handle Laravel paginated response structure
    if (response?.data) {
      // Laravel paginated response: { data: [...], current_page: 1, ... }
      currentPage.value = response.data.current_page;
      totalPages.value = response.data.last_page;
      totalStudents.value = response.data.total;
      fromStudent.value = response.data.from;
      toStudent.value = response.data.to;
      if (response.data.data && Array.isArray(response.data.data)) {
        students.value = response.data.data;
        console.log("✅ Using paginated response data");
      } else if (Array.isArray(response.data)) {
        // Direct array response
        students.value = response.data;
        console.log("✅ Using direct array response");
      } else {
        totalStudents.value = 0;
        fromStudent.value = 0;
        toStudent.value = 0;
        // Fallback - try to find data in the response
        students.value = [];
        console.log("⚠️ No valid data structure found, setting empty array");
      }
    } else {
      students.value = [];
      console.log("⚠️ No response data, setting empty array");
    }

    console.log("📊 Final students array:", students.value);
    console.log("📊 Number of students:", students.value.length);
    console.log("📊 First student (if any):", students.value[0]);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    console.error("❌ Error details:", {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
    });
    error.value = err.message || "Failed to fetch students";
    students.value = [];
    totalStudents.value = 0;
  } finally {
    loading.value = false;
    console.log("🏁 fetchStudents completed, loading:", loading.value);
  }
};

import { roomService } from "@/services/api";
const fetchFilterOptions = async () => {
  try {
    const response = await roomService.getAll({ per_page: 1000 });
    if (response.data?.data) {
      allRooms.value = response.data.data;
    }
  } catch (err) {
    console.error("Error fetching filter options:", err);
  }
};

const exportStudents = async () => {
  loading.value = true;
  try {
    const apiParams: any = {
      search: searchQuery.value,
      faculty: filters.value.faculty,
      room_id: filters.value.room,
      status: filters.value.status,
      my_dormitory_only: filters.value.showDormitoryStudents,
      columns: "name,status,enrollment_year,faculty,dormitory,bed,phone,created_at", // Only columns in the table
    };

    const response = await studentService.export(apiParams);

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `students_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showSuccess(t("Export completed successfully"));
  } catch (err) {
    console.error("Error exporting students:", err);
    showError(t("Failed to export students"));
  } finally {
    loading.value = false;
  }
};

const confirmDeleteStudent = async (studentId: number) => {
  const confirmed = await showConfirmation(
    t("Are you sure? This action is not recoverable."),
    t("Delete Student")
  );

  if (confirmed) {
    try {
      await studentService.delete(studentId);
      showSuccess(t("Student deleted successfully."));
      await fetchStudents(); // Refresh the list
    } catch (err) {
      console.error("Error deleting student:", err);
      showError(t("Failed to delete student."));
    }
  }
};

const navigateToAddStudent = () => {
  studentStore.clearSelectedStudent();
  router.push("/student-form/create");
};

const navigateToEditStudent = (studentId) => {
  const student = students.value.find((s) => s.id === studentId);
  if (student) {
    studentStore.setSelectedStudent(student);
    router.push(`/student-form/${studentId}`);
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  const statusMap = {
    active: t("Active"),
    pending: t("Pending"),
    suspended: t("Suspended"),
  };
  return statusMap[status] || status;
};

const getProfilePictureUrl = (row) => {
  const profilePicture = row.student_profile?.files?.[2];
  if (!profilePicture) return null;

  // If it's already a full URL, return as is
  if (profilePicture.startsWith("http")) {
    return profilePicture;
  }

  // Use unified download endpoint for avatars
  return `/api/files/download/${profilePicture}`;
};

const goToPage = () => {
  const page = Number(pageInput.value);
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  } else {
    // Reset input to current page if value is invalid
    pageInput.value = currentPage.value;
  }
};

// Watch for filter changes to trigger a new API call
watch(
  [searchQuery, filters],
  () => {
    currentPage.value = 1; // Reset to the first page on any filter change
    fetchStudents();
  },
  {
    deep: true, // Watch for nested changes in the filters object
  }
);

watch(currentPage, (newPage) => {
  pageInput.value = newPage;
  fetchStudents();
});

const handleRowClick = (row) => {
  showStudentPicture(row);
};

const showStudentPicture = (student) => {
  selectedStudent.value = student;
  showPictureModal.value = true;
};

onMounted(async () => {
  console.log("🚀 Students component mounted");
  console.log("🔐 Current auth state:", {
    hasToken: !!localStorage.getItem("token"),
    tokenLength: localStorage.getItem("token")?.length || 0,
  });

  studentStore.clearSelectedStudent();
  pageInput.value = currentPage.value;
  console.log("📡 Starting to fetch students...");
  await fetchFilterOptions();
  await fetchStudents();
  console.log("✅ Component mount completed");
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
