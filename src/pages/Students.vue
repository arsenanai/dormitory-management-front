<template>
  <Navigation :title="t('Student Management')">
    <!-- Main Content -->
    <main class="flex-1 bg-white p-6 shadow space-y-6">
      <!-- Search Input -->
      <div class="mb-4">
        <FwbInput
          v-model="searchQuery"
          type="text"
          :placeholder="t('Search')"
          class="w-full pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <!-- Filter Select Boxes -->
      <div class="flex items-center gap-4 mb-4">
        <FwbSelect
          class="w-40"
          :options="[
            { value: 1, name: t('Law and Social Sciences') },
            { value: 2, name: t('Computer Science') },
            { value: 3, name: t('Management') }
          ]"
          :placeholder="t('Faculty')"
        />
        <FwbSelect
          class="w-40"
          :options="[
            { value: 1, name: 'A227' },
            { value: 2, name: 'B317' },
            { value: 3, name: 'C105' }
          ]"
          :placeholder="t('Room')"
        />
        <FwbSelect
          class="w-40"
          :options="[
            { value: 1, name: t('Registered') }, 
            { value: 2, name: t('Reserv') }
          ]"
          :placeholder="t('Status')"
        />
      </div>

      <!-- Checkbox and Actions -->
      <div class="flex items-center justify-end mb-4">
        <div class="flex items-center space-x-4">
          <FwbButton
            type="button"
            outline
            class="text-blue-500"
          >
            <span class="flex items-center gap-2">
              <ArrowDownTrayIcon class="h-5 w-5" />
              {{ t('Export to Excel') }}
            </span>
          </FwbButton>
          <FwbButton
            type="button"
            outline
            class="text-blue-500"
            @click="navigateToAddStudent"
          >
            <span class="flex items-center gap-2">
              <PlusIcon class="h-5 w-5" />
              {{ t('Add Student') }}
            </span>
          </FwbButton>
        </div>
      </div>

      <label class="flex items-center space-x-2 mb-4">
        <FwbCheckbox />
        <span>{{ t('Show only students in dormitory') }}</span>
      </label>

      <!-- Student Table -->
      <FwbTable hoverable>
        <FwbTableHead>
          <FwbTableHeadCell>
            <FwbCheckbox />
          </FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('NAME') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('SURNAME') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('STATUS') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('ENROLMENT YEAR') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('FACULTY') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('DORM') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('ROOM') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('TELEPHONE') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('EDIT') }}</FwbTableHeadCell>
          <FwbTableHeadCell>{{ t('IN/OUT') }}</FwbTableHeadCell>
        </FwbTableHead>
        <FwbTableBody>
          <FwbTableRow
            v-for="(student, index) in paginatedStudents"
            :key="index"
            class="border-gray-300"
          >
            <FwbTableCell>
              <FwbCheckbox />
            </FwbTableCell>
            <FwbTableCell>{{ student.name }}</FwbTableCell>
            <FwbTableCell>{{ student.surname }}</FwbTableCell>
            <FwbTableCell>{{ student.status }}</FwbTableCell>
            <FwbTableCell>{{ student.enrolmentYear }}</FwbTableCell>
            <FwbTableCell>{{ student.faculty }}</FwbTableCell>
            <FwbTableCell>{{ student.dorm }}</FwbTableCell>
            <FwbTableCell>{{ student.room }}</FwbTableCell>
            <FwbTableCell>{{ student.telephone }}</FwbTableCell>
            <FwbTableCell class="text-center">
              <FwbButton
                type="button"
                outline
                class="text-blue-500"
                @click="navigateToEditStudent(index)"
              >
                {{ t('Edit') }}
              </FwbButton>
            </FwbTableCell>
            <FwbTableCell class="text-center">
              <component
                :is="student.status === t('In') ? CheckCircleIcon : XCircleIcon"
                :class="student.status === t('In') ? 'text-green-500' : 'text-red-500'"
                class="h-6 w-6 mx-auto"
              />
            </FwbTableCell>
          </FwbTableRow>
        </FwbTableBody>
      </FwbTable>

      <!-- Pagination -->
      <div class="flex justify-between items-center mb-4">
        <FwbButton
          type="button"
          outline
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          {{ t('Previous') }}
        </FwbButton>
        <span>{{ t('Page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}</span>
        <FwbButton
          type="button"
          outline
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          {{ t('Next') }}
        </FwbButton>
      </div>

      <div class="flex flex-row space-x-4 items-center">
        <FwbSelect
          class="w-40"
          :options="[
            { value: 1, name: t('Deactivate') },
            { value: 2, name: t('Delete') },
          ]"
          :placeholder="t('Action')"
        />
        <FwbButton type="button" outline>
          {{ t('Submit') }}
        </FwbButton>
      </div>
    </main>
  </Navigation>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowDownTrayIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import { FwbInput, FwbSelect, FwbCheckbox, FwbButton, FwbTable, FwbTableHead, FwbTableHeadCell, FwbTableBody, FwbTableRow, FwbTableCell } from "flowbite-vue";

const { t } = useI18n();
const router = useRouter();

// Navigate to Add Student form
const navigateToAddStudent = () => {
  router.push("/student-form");
};

// Navigate to Edit Student form
const navigateToEditStudent = (id) => {
  router.push(`/student-form/${id}`);
};

// Student data
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

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(students.value.length / itemsPerPage));
const paginatedStudents = computed(() =>
  students.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
);

// Search Query
const searchQuery = ref("");
</script>

<style scoped>
/* Add custom styles if needed */
</style>