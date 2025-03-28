<template>
  <Navigation :title="t('Student Management')">
    <!-- Main Content -->
    <main class="flex-1 bg-white p-6 shadow">
      <!-- Search Input -->
      <div class="mb-4">
        <FwbInput
          type="text"
          :placeholder="t('Search')"
          class="w-full"
        />
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
          >
            <span class="flex items-center gap-2">
              <PlusIcon class="h-5 w-5" />
              {{ t('Add Student') }}
            </span>
          </FwbButton>
        </div>
      </div>
      <label class="flex items-center space-x-2 mb-4">
        <FwbCheckbox/>
        <span>{{ t('Show only students in dormitory') }}</span>
      </label>

      <!-- Student Table -->
      <div class="overflow-x-auto mb-4">
        <table class="w-full border-collapse border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 p-2">
                <FwbCheckbox/>
              </th>
              <th class="border border-gray-300 p-2">{{ t('NAME') }}</th>
              <th class="border border-gray-300 p-2">{{ t('SURNAME') }}</th>
              <th class="border border-gray-300 p-2">{{ t('STATUS') }}</th>
              <th class="border border-gray-300 p-2">{{ t('ENROLMENT YEAR') }}</th>
              <th class="border border-gray-300 p-2">{{ t('FACULTY') }}</th>
              <th class="border border-gray-300 p-2">{{ t('DORM') }}</th>
              <th class="border border-gray-300 p-2">{{ t('ROOM') }}</th>
              <th class="border border-gray-300 p-2">{{ t('TELEPHONE') }}</th>
              <th class="border border-gray-300 p-2">{{ t('EDIT') }}</th>
              <th class="border border-gray-300 p-2">{{ t('IN/OUT') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in paginatedStudents" :key="index">
              <td class="border border-gray-300 p-2">
                <FwbCheckbox/>
              </td>
              <td class="border border-gray-300 p-2">{{ student.name }}</td>
              <td class="border border-gray-300 p-2">{{ student.surname }}</td>
              <td class="border border-gray-300 p-2">{{ student.status }}</td>
              <td class="border border-gray-300 p-2">{{ student.enrolmentYear }}</td>
              <td class="border border-gray-300 p-2">{{ student.faculty }}</td>
              <td class="border border-gray-300 p-2">{{ student.dorm }}</td>
              <td class="border border-gray-300 p-2">{{ student.room }}</td>
              <td class="border border-gray-300 p-2">{{ student.telephone }}</td>
              <td class="border border-gray-300 p-2 text-center">
                <FwbButton type="button" outline class="text-blue-500">
                  {{ t('Edit') }}
                </FwbButton>
              </td>
              <td class="border border-gray-300 p-2 text-center">
                <component
                  :is="student.status === t('In') ? CheckCircleIcon : XCircleIcon"
                  :class="student.status === t('In') ? 'text-green-500' : 'text-red-500'"
                  class="h-6 w-6 mx-auto"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
import {
  ArrowDownTrayIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import { FwbInput, FwbSelect, FwbCheckbox, FwbButton } from "flowbite-vue";

const { t } = useI18n();

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
  // Add more students as needed
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
</script>

<style scoped>
/* Add custom styles if needed */
</style>