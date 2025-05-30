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
      <CTable>
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
          <CTableRow v-for="(student, index) in paginatedStudents" :key="index">
            <CTableCell>
              <CCheckbox :id="'checkbox-' + index" />
            </CTableCell>
            <CTableCell>{{ student.name }}</CTableCell>
            <CTableCell>{{ student.surname }}</CTableCell>
            <CTableCell>{{ student.status }}</CTableCell>
            <CTableCell>{{ student.enrollmentYear }}</CTableCell>
            <CTableCell>{{ student.faculty }}</CTableCell>
            <CTableCell>
              {{ typeof student.room === 'object' ? student.room?.dormitory?.name : "" }}
            </CTableCell>
            <CTableCell>
              {{ typeof student.room === 'object' ? student.room?.number : student.room }}
            </CTableCell>
            <CTableCell>{{ student.telephone }}</CTableCell>
            <CTableCell>
              <component
                :is="student.status === t('In') ? CheckCircleIcon : XCircleIcon"
                :class="student.status === t('In') ? 'text-green-500' : 'text-red-500'"
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

// Mock models for demonstration
class Dormitory {
  constructor(name, capacity = 0, gender = "") {
    this.name = name;
    this.capacity = capacity;
    this.gender = gender;
  }
}
class Room {
  constructor(number, dormitory, floor = null, notes = "") {
    this.number = number;
    this.dormitory = dormitory;
    this.floor = floor;
    this.notes = notes;
  }
}
class Country {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}
class Region {
  constructor(id, name, country) {
    this.id = id;
    this.name = name;
    this.country = country;
  }
}
class City {
  constructor(id, name, region) {
    this.id = id;
    this.name = name;
    this.region = region;
  }
}

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

// Mock data for countries, regions, cities, dormitories, and rooms
const countries = [
  new Country(1, "Kazakhstan"),
  new Country(2, "Russia"),
];
const regions = [
  new Region(1, "Almaty", countries[0]),
  new Region(2, "Zhetisu", countries[0]),
  new Region(3, "Moscow", countries[1]),
];
const cities = [
  new City(1, "Kaskelen", regions[0]),
  new City(2, "Talgar", regions[0]),
  new City(3, "Taldykorgan", regions[1]),
  new City(4, "Moscow City", regions[2]),
];

const dormA = new Dormitory("A-Block", 300, "female");
const dormB = new Dormitory("B-Block", 300, "male");
const roomA210 = new Room("A210", dormA, 2, "Near the stairs");
const roomA211 = new Room("A211", dormA, 2, "");
const roomB101 = new Room("B101", dormB, 1, "Window view");

// Use Room and Dormitory objects for students
const students = ref([
  {
    iin: "010101123456",
    name: "Aigerim",
    surname: "Aitkazinova",
    faculty: "engineering",
    specialist: "computer_sciences",
    enrollmentYear: "2022",
    gender: "female",
    email: "aigerim@example.com",
    phoneNumbers: ["+77011234567", "+77019876543"],
    city: cities[0],
    dealNumber: "D-001",
    dormitory: dormA,
    room: roomA210,
    status: t("In"),
    telephone: "+77011234567",
  },
  {
    iin: "020202654321",
    name: "Daniyar",
    surname: "Nurzhanov",
    faculty: "business",
    specialist: "mechanical_engineering",
    enrollmentYear: "2021",
    gender: "male",
    email: "daniyar@example.com",
    phoneNumbers: ["+77021234567"],
    city: cities[2],
    dealNumber: "D-002",
    dormitory: dormB,
    room: roomB101,
    status: t("Out"),
    telephone: "+77021234567",
  },
  {
    iin: "030303789012",
    name: "Irina",
    surname: "Petrova",
    faculty: "law",
    specialist: "civil_engineering",
    enrollmentYear: "2023",
    gender: "female",
    email: "irina@example.com",
    phoneNumbers: ["+77031234567"],
    city: cities[3],
    dealNumber: "D-003",
    dormitory: dormA,
    room: roomA211,
    status: t("In"),
    telephone: "+77031234567",
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

const navigateToEditStudent = (index) => {
  const student = paginatedStudents.value[index];
  if (student) {
    studentStore.setSelectedStudent(student);
    router.push(`/student-form/${index}`);
  }
};

onMounted(() => {
  studentStore.clearSelectedStudent();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
