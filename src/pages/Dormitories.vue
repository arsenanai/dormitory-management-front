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
      <div class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
        <!-- <CButton @click="exportToExcel">
          <ArrowDownTrayIcon class="h-5 w-5" />
          {{ t("Download") }}
        </CButton> -->
        <CButton @click="navigateToAddDormitory">
          <PlusIcon class="h-5 w-5" />
          {{ t("Add Dormitory") }}
        </CButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-primary-600 py-4 text-center" data-testid="loading">
      {{ t("Loading...") }}
    </div>

    <!-- Error State -->
    <div v-if="error" class="py-4 text-center text-red-500">
      {{ error }}
    </div>

    <!-- Dormitory Table -->
    <CTable v-if="!loading && !error" :columns="columns" :data="paginatedDorms" :loading="loading">
      <template #cell-admin_name="{ row }">
        {{ row.admin?.name || row.admin?.username || row.admin || "-" }}
      </template>

      <template #cell-freeBeds="{ row }">
        <span :class="{ 'text-red-500': row.freeBeds === 0 }">
          {{ row.freeBeds || "-" }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <CButton @click="navigateToEditDormitory(row.id)" size="sm">
            <PencilSquareIcon class="h-5 w-5" />
          </CButton>
          <CButton variant="danger" @click="deleteDormitory(row)" size="sm">
            <TrashIcon class="h-5 w-5" />
          </CButton>
        </div>
      </template>
    </CTable>

    <!-- Pagination
    <div class="flex flex-col items-center justify-between gap-4 md:flex-row" data-testid="pagination">
        <div class="text-sm text-gray-700">
          <span v-if="totalDorms > 0">
            <span class="font-medium">{{ fromDorm }}</span> - <span class="font-medium">{{ toDorm }}</span> / <span class="font-medium">{{ totalDorms }}</span>
          </span>
          <span v-else>
            {{ t('No data available') }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <CButton :disabled="currentPage === 1" @click="currentPage--" :aria-label="t('Previous page')" class="h-10">
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
            class="text-center h-10"
            @keyup.enter="goToPage"
          />
            </div>
            <span>/ {{ totalPages }}</span>
          </div>
          <CButton :disabled="currentPage === totalPages" @click="currentPage++" :aria-label="t('Next page')" class="h-10">
            <ChevronRightIcon class="h-5 w-5" />
          </CButton>
        </div>
      </div> -->
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  ArrowDownTrayIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
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
import { dormitoryService } from "@/services/api";
import { useDormitoriesStore } from "@/stores/dormitories";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// store
const dormitoriesStore = useDormitoriesStore();
const { showError, showSuccess, showConfirmation } = useToast();

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

    // Handle different response structures
    if (response && response.data) {
      // If response.data is an array, use it directly (this is what the backend returns)
      if (Array.isArray(response.data)) {
        dorms.value = response.data;
      }
      // If response.data is an object with data property (paginated structure)
      else if (
        typeof response.data === "object" &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        dorms.value = response.data.data;
      }
      // If response.data is an object but not an array, try to find data property
      else if (typeof response.data === "object" && response.data.data) {
        dorms.value = Array.isArray(response.data.data) ? response.data.data : [];
      }
      // Otherwise, try to use response.data as is
      else {
        dorms.value = [];
      }
    } else if (Array.isArray(response)) {
      // Direct array response

      dorms.value = response;
    } else {
      dorms.value = [];
    }
  } catch (err) {
    console.error("Error loading dormitories:", err);
    error.value = "Failed to load dormitories";
    showError(t("Failed to load dormitories"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  pageInput.value = currentPage.value;
  loadDormitories();
  dormitoriesStore.clearSelectedDormitory();

  // Listen for dormitory update/creation events
  window.addEventListener("dormitory-updated", () => {
    loadDormitories();
  });

  window.addEventListener("dormitory-created", () => {
    loadDormitories();
  });
});

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener("dormitory-updated", () => {});
  window.removeEventListener("dormitory-created", () => {});
});

// Watch for route changes to refresh data when returning to this page
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/dormitories") {
      loadDormitories();
    }
  }
);

// Filtered Dormitories
const filteredDorms = computed(() => {
  if (!searchQuery.value) return dorms.value;
  return dorms.value.filter(
    (dorm) =>
      dorm.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (dorm.admin &&
        (typeof dorm.admin === "string"
          ? dorm.admin.toLowerCase().includes(searchQuery.value.toLowerCase())
          : dorm.admin.username?.toLowerCase().includes(searchQuery.value.toLowerCase())))
  );
});

// Pagination
const currentPage = ref<number>(1);
const itemsPerPage = 10;
const pageInput = ref(1);

const totalPages = computed<number>(() => Math.ceil(filteredDorms.value.length / itemsPerPage));

const totalDorms = computed(() => filteredDorms.value.length);
const fromDorm = computed(() => {
  if (totalDorms.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});
const toDorm = computed(() => {
  const end = currentPage.value * itemsPerPage;
  return end > totalDorms.value ? totalDorms.value : end;
});

const paginatedDorms = computed(() =>
  filteredDorms.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
);

// Export function
const exportToExcel = async () => {
  try {
    const response = await dormitoryService.export();
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dormitories.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    showError(t("Failed to export dormitories"));
  }
};

// Navigation Functions
const navigateToAddDormitory = (): void => {
  router.push("/dormitory-form");
};

const navigateToEditDormitory = (id: number): void => {
  const dormitory = dorms.value.find((d) => d.id === id);
  if (dormitory) {
    dormitoriesStore.setSelectedDormitory(dormitory);
  }
  router.push(`/dormitory-form/${id}`);
};

// Delete function
const deleteDormitory = async (row: any) => {
  const confirmed = await showConfirmation(
    t("Are you sure? This change is not recoverable"),
    t("Delete Dormitory")
  );

  if (confirmed) {
    try {
      await dormitoryService.delete(row.id);
      showSuccess(t("Dormitory deleted successfully"));
      loadDormitories(); // Reload data after deletion
    } catch (err) {
      console.error("Error deleting dormitory:", err);
      showError(t("Failed to delete dormitory"));
    }
  }
};

// Columns for the table
const columns = [
  { key: "name", label: t("DORMITORY") },
  { key: "capacity", label: t("STUDENT CAPACITY") },

  { key: "gender", label: t("GENDER") },
  { key: "admin_name", label: t("ADMIN USERNAME") },
  { key: "registered", label: t("REGISTERED STUDENTS") },
  { key: "freeBeds", label: t("FREE BEDS") },
  { key: "rooms_count", label: t("ROOM") },
  { key: "actions", label: t("EDIT") },
];

const goToPage = () => {
  const page = Number(pageInput.value);
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  } else {
    // Reset input to current page if value is invalid
    pageInput.value = currentPage.value;
  }
};

watch(currentPage, (newPage) => {
  pageInput.value = newPage;
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
