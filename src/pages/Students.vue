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
          class=""
        />
      </div>

      <!-- Filter Select Boxes -->
      <div
        class="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:justify-start"
      >
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
      <div
        class="flex flex-col items-stretch justify-between gap-4 lg:flex-row"
      >
        <CCheckbox
          id="show-dormitory-students"
          v-model="filters.showDormitoryStudents"
          :label="t('Show only students in dormitory')"
        />
        <div
          class="flex flex-col items-stretch justify-between gap-4 lg:flex-row"
        >
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
      <CTable>
        <CTableHead>
          <CTableHeadCell>
            <CCheckbox />
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
          <CTableRow v-for="(student, index) in paginatedStudents" :key="index">
            <CTableCell>
              <CCheckbox />
            </CTableCell>
            <CTableCell>{{ student.name }}</CTableCell>
            <CTableCell>{{ student.surname }}</CTableCell>
            <CTableCell>{{ student.status }}</CTableCell>
            <CTableCell>{{ student.enrolmentYear }}</CTableCell>
            <CTableCell>{{ student.faculty }}</CTableCell>
            <CTableCell>{{ student.dorm }}</CTableCell>
            <CTableCell>{{ student.room }}</CTableCell>
            <CTableCell>{{ student.telephone }}</CTableCell>
            <CTableCell>
              <component
                :is="student.status === t('In') ? CheckCircleIcon : XCircleIcon"
                :class="
                  student.status === t('In') ? 'text-green-500' : 'text-red-500'
                "
                class="mx-auto h-6 w-6"
              />
            </CTableCell>
            <CTableCell class="text-right">
              <CButton @click="navigateToEditStudent(index)">
                <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
              </CButton>
            </CTableCell>
          </CTableRow>
        </CTableBody>
      </CTable>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <CButton :disabled="currentPage === 1" @click="currentPage--">
          {{ t("Previous") }}
        </CButton>
        <span
          >{{ t("Page") }} {{ currentPage }} {{ t("of") }}
          {{ totalPages }}</span
        >
        <CButton :disabled="currentPage === totalPages" @click="currentPage++">
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
import { ref, computed } from "vue";
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

const { t } = useI18n();
const router = useRouter();

const searchQuery = ref("");
const filters = ref({
  faculty: "",
  room: "",
  status: "",
  showDormitoryStudents: false,
});
const bulkAction = ref("");

const facultyOptions = [
  { value: "law", name: t("Law and Social Sciences") },
  { value: "cs", name: t("Computer Science") },
  { value: "management", name: t("Management") },
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

const students = ref([
  {
    name: "Student1",
    surname: "Studentov1",
    status: t("In"),
    enrolmentYear: 2024,
    faculty: t("Law and Social Sciences"),
    dorm: "A-BLOCK",
    room: "A227",
    telephone: "+71234567890",
  },
  {
    name: "Student2",
    surname: "Studentov2",
    status: t("Out"),
    enrolmentYear: 2023,
    faculty: t("Education"),
    dorm: "B-BLOCK",
    room: "B317",
    telephone: "+71234567891",
  },
]);

const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() =>
  Math.ceil(students.value.length / itemsPerPage),
);
const paginatedStudents = computed(() =>
  students.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage,
  ),
);

const navigateToAddStudent = () => {
  router.push("/student-form");
};

const navigateToEditStudent = (id) => {
  router.push(`/student-form/${id}`);
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
