<template>
  <Navigation :title="t('Dormitory Information')">
    <!-- Search and Filters -->
    <div class="mb-4">
      <FwbInput
        v-model="searchQuery"
        type="text"
        :placeholder="t('Search dormitory')"
        class="w-full pl-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
      />
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
      >
        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <FwbButton type="button" color="light">
          <span class="flex items-center gap-2">
            <ArrowDownTrayIcon class="h-5 w-5" />
            {{ t("Export to Excel") }}
          </span>
        </FwbButton>
        <FwbButton type="button" color="light" @click="navigateToAddDormitory">
          <span class="flex items-center gap-2">
            <PlusIcon class="h-5 w-5" />
            {{ t("Add Dormitory") }}
          </span>
        </FwbButton>
      </div>
    </div>

    <!-- Dormitory Table -->
    <FwbTable hoverable>
      <FwbTableHead>
        <FwbTableHeadCell>
          <FwbCheckbox />
        </FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("DORMITORY") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("STUDENT CAPACITY") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("GENDER") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("ADMIN USERNAME") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("REGISTERED STUDENTS") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("FREE BEDS") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("ROOM") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("EDIT") }}</FwbTableHeadCell>
      </FwbTableHead>
      <FwbTableBody>
        <FwbTableRow
          v-for="(dorm, index) in filteredDorms"
          :key="index"
          class="border-gray-300"
        >
          <FwbTableCell>
            <FwbCheckbox />
          </FwbTableCell>
          <FwbTableCell>{{ dorm.name }}</FwbTableCell>
          <FwbTableCell>{{ dorm.capacity }}</FwbTableCell>
          <FwbTableCell>{{ dorm.gender }}</FwbTableCell>
          <FwbTableCell>{{ dorm.admin }}</FwbTableCell>
          <FwbTableCell>{{ dorm.registered }}</FwbTableCell>
          <FwbTableCell :class="{ 'text-red-500': dorm.freeBeds === 0 }">
            {{ dorm.freeBeds }}
          </FwbTableCell>
          <FwbTableCell>{{ dorm.rooms }}</FwbTableCell>
          <FwbTableCell class="text-center">
            <FwbButton
              type="button"
              color="light"
              @click="navigateToEditDormitory(dorm.id)"
            >
              {{ t("Edit") }}
            </FwbButton>
          </FwbTableCell>
        </FwbTableRow>
      </FwbTableBody>
    </FwbTable>

    <!-- Pagination -->
    <div class="mt-4 mb-4 flex items-center justify-between">
      <FwbButton
        type="button"
        color="light"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        {{ t("Previous") }}
      </FwbButton>
      <span>
        {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
      </span>
      <FwbButton
        type="button"
        color="light"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        {{ t("Next") }}
      </FwbButton>
    </div>

    <!-- Bulk Actions -->
    <div class="flex flex-row items-center space-x-4">
      <FwbSelect
        class="w-40"
        :options="[
          { value: 1, name: t('Disable Delete') },
          { value: 2, name: t('Export Selected') },
        ]"
        :placeholder="t('Action')"
      />
      <blueButton>
        {{ t("SUBMIT") }}
      </blueButton>
    </div>

    <!-- Divider -->
    <hr class="my-6 border-gray-300" />

    <!-- Education Information Settings -->
    <h2 class="mb-4 text-xl font-bold text-gray-800">
      {{ t("EDUCATION INFORMATION SETTINGS") }}
    </h2>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FwbInput
        v-model="educationSettings.faculty"
        type="text"
        :label="t('Faculty')"
        readonly
        class="bg-gray-100"
      />
      <FwbInput
        v-model="educationSettings.specialist"
        type="text"
        :label="t('Specialist')"
        readonly
        class="bg-gray-100"
      />
      <div class="md:col-span-2">
        <FwbInput
          v-model="educationSettings.informationSystems"
          type="text"
          :label="t('Information systems')"
          readonly
          class="bg-gray-100"
        />
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
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import {
  FwbInput,
  FwbSelect,
  FwbCheckbox,
  FwbButton,
  FwbTable,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableBody,
  FwbTableRow,
  FwbTableCell,
} from "flowbite-vue";
import blueButton from "@/components/blueButton.vue";

const { t } = useI18n();
const router = useRouter();

// Dormitory Data
const dorms = ref([
  {
    id: 1,
    name: "A-Block",
    capacity: 300,
    gender: "Female",
    admin: "admin1",
    registered: 267,
    freeBeds: 33,
    rooms: 75,
  },
  {
    id: 2,
    name: "B-block",
    capacity: 300,
    gender: "Female",
    admin: "admin2",
    registered: 300,
    freeBeds: 0,
    rooms: 78,
  },
  {
    id: 3,
    name: "C-Block",
    capacity: 293,
    gender: "Male",
    admin: "admin3",
    registered: 300,
    freeBeds: 7,
    rooms: 80,
  },
]);

// Education Settings Data
const educationSettings = ref({
  faculty: "Engineering and natural sciences",
  specialist: "Computer Science",
  informationSystems: "",
});

// Search functionality
const searchQuery = ref("");
const filteredDorms = computed(() => {
  if (!searchQuery.value) return dorms.value;
  return dorms.value.filter(
    (dorm) =>
      dorm.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      dorm.admin.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() =>
  Math.ceil(filteredDorms.value.length / itemsPerPage),
);

// Navigation functions
const navigateToAddDormitory = () => {
  router.push("/dormitory-form");
};

const navigateToEditDormitory = (id) => {
  router.push(`/dormitory-form/${id}`);
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
