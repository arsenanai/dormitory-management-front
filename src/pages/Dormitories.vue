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
    <CTable v-if="!loading && !error" :columns="columns" :data="paginatedDorms" :loading="loading">
      <template #cell-admin_name="{ row }">
        {{ row.admin?.name || row.admin?.username || row.admin || '-' }}
      </template>
      <template #cell-quota="{ row }">
        {{ row.quota || row.capacity || '-' }}
      </template>
      <template #cell-freeBeds="{ row }">
        <span :class="{ 'text-red-500': row.freeBeds === 0 }">
          {{ row.freeBeds || '-' }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <CButton @click="navigateToEditDormitory(row.id)" size="sm">
            {{ t("Edit") }}
          </CButton>
          <CButton @click="deleteDormitory(row)" size="sm" variant="danger">
            {{ t("Delete") }}
          </CButton>
        </div>
      </template>
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
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
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
const route = useRoute();

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
    console.log('API Response:', response);
    console.log('Response type:', typeof response);
    console.log('Response.data type:', typeof response.data);
    console.log('Response.data is array:', Array.isArray(response.data));
    console.log('Response.data length:', response.data ? response.data.length : 'undefined');
    
    // Handle different response structures
    if (response && response.data) {
      // If response.data is an array, use it directly (this is what the backend returns)
      if (Array.isArray(response.data)) {
        console.log('Using response.data as array');
        dorms.value = response.data;
      } 
      // If response.data is an object with data property (paginated structure)
      else if (typeof response.data === 'object' && response.data.data && Array.isArray(response.data.data)) {
        console.log('Using response.data.data as array');
        dorms.value = response.data.data;
      } 
      // If response.data is an object but not an array, try to find data property
      else if (typeof response.data === 'object' && response.data.data) {
        console.log('Using response.data.data from object');
        dorms.value = Array.isArray(response.data.data) ? response.data.data : [];
      }
      // Otherwise, try to use response.data as is
      else {
        console.log('Using response.data as is');
        dorms.value = [];
      }
    } else if (Array.isArray(response)) {
      // Direct array response
      console.log('Using response as direct array');
      dorms.value = response;
    } else {
      console.log('No valid data found, setting empty array');
      dorms.value = [];
    }
    
    console.log('Fetched dormitories:', dorms.value);
    console.log('Number of dormitories:', dorms.value.length);
  } catch (err) {
    console.error('Error loading dormitories:', err);
    error.value = 'Failed to load dormitories';
    showError(t('Failed to load dormitories'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDormitories();
  dormitoriesStore.clearSelectedDormitory();
  
  // Listen for dormitory update/creation events
  window.addEventListener('dormitory-updated', () => {
    console.log('Dormitory updated event received, refreshing data...');
    loadDormitories();
  });
  
  window.addEventListener('dormitory-created', () => {
    console.log('Dormitory created event received, refreshing data...');
    loadDormitories();
  });
});

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('dormitory-updated', () => {});
  window.removeEventListener('dormitory-created', () => {});
});

// Watch for route changes to refresh data when returning to this page
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/dormitories') {
      console.log('Route changed to dormitories, refreshing data...');
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

// Delete function
const deleteDormitory = async (row: any) => {
  if (confirm(t('Are you sure you want to delete this dormitory?'))) {
    try {
      await dormitoryService.delete(row.id);
      showSuccess(t('Dormitory deleted successfully'));
      loadDormitories(); // Reload data after deletion
    } catch (err) {
      console.error('Error deleting dormitory:', err);
      showError(t('Failed to delete dormitory'));
    }
  }
};

// Columns for the table
const columns = [
  { key: 'name', label: t('DORMITORY') },
  { key: 'capacity', label: t('STUDENT CAPACITY') },
  { key: 'quota', label: t('QUOTA') },
  { key: 'gender', label: t('GENDER') },
  { key: 'admin_name', label: t('ADMIN USERNAME') },
  { key: 'registered', label: t('REGISTERED STUDENTS') },
  { key: 'freeBeds', label: t('FREE BEDS') },
  { key: 'rooms_count', label: t('ROOM') },
  { key: 'actions', label: t('EDIT') },
];
</script>

<style scoped>
/* Custom styles if needed */
</style>
