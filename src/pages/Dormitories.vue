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
          <CCheckbox id="select-all-checkbox"/>
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
            <CCheckbox :id="'checkbox-' + index" />
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

  </Navigation>
</template>

<script setup lang="ts">
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
import { Dormitory } from "@/models/Dormitory";

const { t } = useI18n();
const router = useRouter();

const searchQuery = ref<string>("");
const bulkAction = ref<string>("");
const bulkActionOptions = [
  { value: "disable", name: t("Disable Delete") },
  { value: "export", name: t("Export Selected") },
];

// Dormitory Data (all numeric fields are numbers, not strings)
const dorms = ref<Dormitory[]>([
  new Dormitory("A-Block", 300, "Female", "admin1", 267, 33, 75),
  new Dormitory("B-Block", 300, "Female", "admin2", 300, 0, 78),
  new Dormitory("C-Block", 293, "Male", "admin3", 300, 7, 80),
]);

// Education Settings
const educationSettings = ref({
  faculty: "Engineering and natural sciences",
  specialist: "Computer Science",
  informationSystems: "",
});

// Filtered Dormitories
const filteredDorms = computed<Dormitory[]>(() => {
  if (!searchQuery.value) return dorms.value;
  return dorms.value.filter(
    (dorm) =>
      dorm.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      dorm.admin.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// Pagination
const currentPage = ref<number>(1);
const itemsPerPage = 10;
const totalPages = computed<number>(() =>
  Math.ceil(filteredDorms.value.length / itemsPerPage),
);
const paginatedDorms = computed<Dormitory[]>(() =>
  filteredDorms.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage,
  ),
);

// Navigation Functions
const navigateToAddDormitory = (): void => {
  router.push("/dormitory-form");
};

const navigateToEditDormitory = (id: number): void => {
  router.push(`/dormitory-form/${id}`);
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
