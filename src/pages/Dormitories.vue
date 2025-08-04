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
        <CButton @click="exportToExcel">
          <ArrowDownTrayIcon class="h-5 w-5" />
          {{ t("Export to Excel") }}
        </CButton>
        <CButton @click="navigateToAddDormitory">
          <PlusIcon class="h-5 w-5" />
          {{ t("Add Dormitory") }}
        </CButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4 text-primary-600" data-testid="loading">
      {{ t("Loading...") }}
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <!-- Dormitory Table -->
    <CTable v-if="!loading && !error">
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
        <CTableRow v-for="(dorm, index) in paginatedDorms" :key="dorm.id">
          <CTableCell>
            <CCheckbox :id="'checkbox-' + index" />
          </CTableCell>
          <CTableCell>{{ dorm.name }}</CTableCell>
          <CTableCell>{{ dorm.quota || dorm.capacity }}</CTableCell>
          <CTableCell>{{ dorm.gender }}</CTableCell>
          <CTableCell>{{ dorm.admin?.username || dorm.admin || '-' }}</CTableCell>
          <CTableCell>{{ dorm.registered || '-' }}</CTableCell>
          <CTableCell :class="{ 'text-red-500': dorm.freeBeds === 0 }">
            {{ dorm.freeBeds || '-' }}
          </CTableCell>
          <CTableCell>{{ dorm.rooms?.length || dorm.rooms || '-' }}</CTableCell>
          <CTableCell class="text-center">
            <CButton
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
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        {{ t("Previous") }}
      </CButton>
      <span>
        {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
      </span>
      <CButton
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
import { ref, computed, onMounted } from "vue";
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
import { dormitoryService } from "@/services/api";
import { useDormitoriesStore } from "@/stores/dormitories";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const router = useRouter();

// store
const dormitoriesStore = useDormitoriesStore();
const { showError, showSuccess } = useToast();

const searchQuery = ref<string>("");
const bulkAction = ref<string>("");
const bulkActionOptions = [
  { value: "disable", name: t("Disable Delete") },
  { value: "export", name: t("Export Selected") },
];

// Dormitory Data
const dorms = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Load dormitories on component mount
const loadDormitories = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await dormitoryService.getAll();
    dorms.value = response.data;
  } catch (err) {
    error.value = 'Failed to load dormitories';
    showError(t('Failed to load dormitories'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDormitories();
  dormitoriesStore.clearSelectedDormitory();
});

// Filtered Dormitories
const filteredDorms = computed(() => {
  if (!searchQuery.value) return dorms.value;
  return dorms.value.filter(
    (dorm) =>
      dorm.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (dorm.admin && 
        (typeof dorm.admin === 'string' 
          ? dorm.admin.toLowerCase().includes(searchQuery.value.toLowerCase())
          : dorm.admin.username?.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      ),
  );
});

// Pagination
const currentPage = ref<number>(1);
const itemsPerPage = 10;
const totalPages = computed<number>(() =>
  Math.ceil(filteredDorms.value.length / itemsPerPage),
);
const paginatedDorms = computed(() =>
  filteredDorms.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage,
  ),
);

// Export function
const exportToExcel = async () => {
  try {
    const response = await dormitoryService.export();
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dormitories.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    showError(t('Failed to export dormitories'));
  }
};

// Navigation Functions
const navigateToAddDormitory = (): void => {
  router.push("/dormitory-form");
};

const navigateToEditDormitory = (id: number): void => {
  const dormitory = dorms.value.find(d => d.id === id);
  if (dormitory) {
    dormitoriesStore.setSelectedDormitory(dormitory);
  }
  router.push(`/dormitory-form/${id}`);
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
