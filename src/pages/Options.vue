<template>
  <Navigation :title="t('Dormitory Information')">
    <!-- Search and Filters -->
    <div class="mb-4">
      <CInput
        id="search-dormitory"
        v-model="searchQuery"
        type="text"
        :placeholder="t('Search dormitory')"
        :label="t('Search')"
      />
    </div>

    <!-- Action Buttons -->
    <div class="mb-4 flex items-center justify-between">
      <div
        class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center"
      >
        <CButton variant="default">
          <ArrowDownTrayIcon class="h-5 w-5" />
          {{ t("Export to Excel") }}
        </CButton>
        <CButton variant="default" @click="navigateToAddDormitory">
          <PlusIcon class="h-5 w-5" />
          {{ t("Add Dormitory") }}
        </CButton>
      </div>
    </div>

    <!-- Dormitory Table -->
    <CTable>
      <CTableHead>
        <CTableHeadCell>
          <CCheckbox />
        </CTableHeadCell>
        <CTableHeadCell>{{ t("DORMITORY") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("STUDENT CAPACITY") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("GENDER") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("ADMIN USERNAME") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("REGISTERED STUDENTS") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("FREE BEDS") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("ROOM") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("EDIT") }}</CTableHeadCell>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(dorm, index) in paginatedDorms" :key="index">
          <CTableCell>
            <CCheckbox />
          </CTableCell>
          <CTableCell>{{ dorm.name }}</CTableCell>
          <CTableCell>{{ dorm.capacity }}</CTableCell>
          <CTableCell>{{ dorm.gender }}</CTableCell>
          <CTableCell>{{ dorm.admin }}</CTableCell>
          <CTableCell>{{ dorm.registered }}</CTableCell>
          <CTableCell :class="{ 'text-red-500': dorm.freeBeds === 0 }">
            {{ dorm.freeBeds }}
          </CTableCell>
          <CTableCell>{{ dorm.rooms }}</CTableCell>
          <CTableCell class="text-center">
            <CButton
              variant="default"
              @click="navigateToEditDormitory(dorm.id)"
            >
              {{ t("Edit") }}
            </CButton>
          </CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>

    <!-- Pagination -->
    <div class="mt-4 mb-4 flex items-center justify-between">
      <CButton
        variant="default"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        {{ t("Previous") }}
      </CButton>
      <span>
        {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
      </span>
      <CButton
        variant="default"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        {{ t("Next") }}
      </CButton>
    </div>

    <!-- Bulk Actions -->
    <div class="flex flex-row items-end justify-end space-x-4">
      <CSelect
        id="bulk-action"
        v-model="bulkAction"
        :options="bulkActionOptions"
        :label="t('Action')"
        :placeholder="t('Select Action')"
      />
      <CButton variant="primary">
        {{ t("Submit") }}
      </CButton>
    </div>

    <!-- Divider -->
    <hr class="my-6 border-gray-300" />

    <!-- Education Information Settings -->
    <h2 class="mb-4 text-xl font-bold text-gray-800">
      {{ t("EDUCATION INFORMATION SETTINGS") }}
    </h2>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <CInput
        id="faculty"
        v-model="educationSettings.faculty"
        type="text"
        :label="t('Faculty')"
        readonly
      />
      <CInput
        id="specialist"
        v-model="educationSettings.specialist"
        type="text"
        :label="t('Specialist')"
        readonly
      />
      <div class="md:col-span-2">
        <CInput
          id="information-systems"
          v-model="educationSettings.informationSystems"
          type="text"
          :label="t('Information systems')"
          readonly
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
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/vue/24/outline";
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
const bulkAction = ref("");
const bulkActionOptions = [
  { value: "disable", name: t("Disable Delete") },
  { value: "export", name: t("Export Selected") },
];

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

const educationSettings = ref({
  faculty: "Engineering and natural sciences",
  specialist: "Computer Science",
  informationSystems: "",
});

const filteredDorms = computed(() => {
  if (!searchQuery.value) return dorms.value;
  return dorms.value.filter(
    (dorm) =>
      dorm.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      dorm.admin.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() =>
  Math.ceil(filteredDorms.value.length / itemsPerPage),
);
const paginatedDorms = computed(() =>
  filteredDorms.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage,
  ),
);

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
