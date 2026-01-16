<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/RoomTypes.vue -->
<template>
  <Navigation :title="t('Room Types Management')">
    <div class="flex flex-col gap-4">
      <!-- Filters and Add Button -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-end"></div>
        <div class="flex flex-1 justify-end">
          <CButton @click="navigateToAddRoomType">
            <PlusIcon class="h-5 w-5" />
            {{ t("Add Room Type") }}
          </CButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-primary-600 py-4 text-center">
        {{ t("Loading...") }}
      </div>

      <!-- Error State -->
      <div v-if="error" class="py-4 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Room Types Table -->
      <div v-if="!loading && !error">
        <CTable :columns="columns" :data="paginatedRoomTypes" :loading="loading">
          <template #cell-name="{ row }">
            <span class="font-medium">{{ capitalize(row.name) }}</span>
          </template>
          <template #cell-capacity="{ row }">
            {{ row.capacity || getBedCount(row) }}
          </template>
          <template #cell-daily_rate="{ row }">
            {{ formatPrice(row.daily_rate || 0) }}
          </template>
          <template #cell-semester_rate="{ row }">
            {{ formatPrice(row.semester_rate || 0) }}
          </template>
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <CButton @click="navigateToEditRoomType(row.id)">
                <PencilSquareIcon class="h-5 w-5" />
              </CButton>
              <CButton variant="danger" @click="deleteRoomType(row.id)">
                <TrashIcon class="h-5 w-5" />
              </CButton>
            </div>
          </template>
        </CTable>
      </div>

      <!-- Pagination -->
      <!-- <div class="flex items-center justify-between">
          <CButton :disabled="currentPage === 1" @click="currentPage--" :aria-label="t('Previous page')">
            {{ t("Previous") }}
          </CButton>
          <span>
            {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
          </span>
          <CButton :disabled="currentPage === totalPages" @click="currentPage++" :aria-label="t('Next page')">
            {{ t("Next") }}
          </CButton>
        </div> -->
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { roomTypeService, dormitoryService, configurationService } from "@/services/api";
import { formatCurrency } from "@/utils/formatters";
import { useRoomTypesStore } from "@/stores/roomTypes";
import { useSettingsStore } from "@/stores/settings";
import { useToast } from "@/composables/useToast";

// i18n and router
const { t } = useI18n();
const router = useRouter();

// store
const roomTypesStore = useRoomTypesStore();
const settingsStore = useSettingsStore();
const { showError, showSuccess, showConfirmation } = useToast();

// Data
const roomTypes = ref<any[]>([]);
const dormitories = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const currencySymbol = computed(() => settingsStore.publicSettings?.currency_symbol || "USD");

const columns = [
  { key: "name", label: t("Room Type Name") },
  { key: "capacity", label: t("Capacity") },
  { key: "daily_rate", label: t("Daily Rate") },
  { key: "semester_rate", label: t("Semester Rate") },
  { key: "actions", label: t("Action"), class: "text-right" },
];

// Load data on component mount
const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [roomTypesResponse, dormitoriesResponse] = await Promise.all([
      roomTypeService.getAll(),
      dormitoryService.getAll(),
    ]);
    // Handle Laravel paginated response structure for room types
    if (roomTypesResponse?.data) {
      if (roomTypesResponse.data.data && Array.isArray(roomTypesResponse.data.data)) {
        roomTypes.value = roomTypesResponse.data.data;
      } else if (Array.isArray(roomTypesResponse.data)) {
        roomTypes.value = roomTypesResponse.data;
      } else {
        roomTypes.value = [];
      }
    } else {
      roomTypes.value = [];
    }

    // Handle Laravel paginated response structure for dormitories
    if (dormitoriesResponse?.data) {
      if (dormitoriesResponse.data.data && Array.isArray(dormitoriesResponse.data.data)) {
        dormitories.value = dormitoriesResponse.data.data;
      } else if (Array.isArray(dormitoriesResponse.data)) {
        dormitories.value = dormitoriesResponse.data;
      } else {
        dormitories.value = [];
      }
    } else {
      dormitories.value = [];
    }
  } catch (err) {
    console.error("Error loading room types:", err);
    error.value = "Failed to load room types data";
    showError(t("Failed to load room types data"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
  roomTypesStore.clearSelectedRoomType();
});

// Dormitory options for filter
const dormitoryOptions = computed(() => [
  { value: "", name: t("All Dormitories") },
  ...dormitories.value.map((d) => ({ value: d.id, name: d.name })),
]);

// Filtered Room Types
const filteredRoomTypes = computed(() => {
  if (!filters.value.dormitory) {
    return roomTypes.value;
  }
  return roomTypes.value.filter((rt) => rt.dormitory_id === parseInt(filters.value.dormitory, 10));
});

// Filters
const filters = ref({
  dormitory: "",
});

// Sorting
const sortBy = ref("");
const sortOrder = ref("asc");

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(filteredRoomTypes.value.length / itemsPerPage));
const paginatedRoomTypes = computed(() =>
  roomTypes.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage)
);

// Get bed count from minimap JSON or bed count field
function getBedCount(roomType: any): number {
  // Prefer the 'beds' array length if it exists
  if (Array.isArray(roomType.beds)) {
    return roomType.beds.length;
  }

  try {
    const beds = JSON.parse(roomType.beds || "[]");
    return Array.isArray(beds) ? beds.length : 0;
  } catch {
    return 0;
  }
}

// Get dormitory name
function getDormitoryName(roomType: any): string {
  return (
    roomType.dormitory?.name ||
    dormitories.value.find((d) => d.id === roomType.dormitory_id)?.name ||
    "-"
  );
}

// Form state
const showForm = ref(false);

// Missing methods expected by tests
async function createRoomType(roomTypeData: any) {
  try {
    loading.value = true;
    const response = await roomTypeService.create(roomTypeData);
    await loadData(); // Reload data
    showSuccess(t("Room type created successfully"));
    return response.data;
  } catch (err) {
    error.value = "Failed to create room type";
    showError(t("Failed to create room type"));
    throw err;
  } finally {
    loading.value = false;
  }
}

async function updateRoomType(id: number, roomTypeData: any) {
  try {
    loading.value = true;
    const response = await roomTypeService.update(id, roomTypeData);
    await loadData(); // Reload data
    showSuccess(t("Room type updated successfully"));
    return response.data;
  } catch (err) {
    error.value = "Failed to update room type";
    showError(t("Failed to update room type"));
    throw err;
  } finally {
    loading.value = false;
  }
}

async function loadRoomTypes() {
  try {
    loading.value = true;
    error.value = null;
    const response = await roomTypeService.getAll();
    roomTypes.value = response.data || [];
  } catch (err) {
    error.value = "Failed to load room types";
    showError(t("Failed to load room types"));
    // Do not rethrow the error - let the test check error state
  } finally {
    loading.value = false;
  }
}

function showRoomTypeForm() {
  showForm.value = true;
}

function closeRoomTypeForm() {
  showForm.value = false;
}

async function handleFormSubmit(formData: any) {
  try {
    await roomTypeService.create(formData);
    closeRoomTypeForm();
    await loadData();
    showSuccess(t("Room type created successfully"));
  } catch (err) {
    showError(t("Failed to create room type"));
    throw err;
  }
}

// Utility functions
const formatPrice = (price: number): string => formatCurrency(price, currencySymbol.value, "USD");

const formatAmenities = (amenities: string[]): string => {
  return amenities.join(", ");
};

const getCapacityColor = (capacity: number): string => {
  if (capacity <= 1) return "blue";
  if (capacity <= 2) return "green";
  if (capacity <= 4) return "orange";
  return "red";
};

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Computed properties expected by tests
const averageSemesterRate = computed(() => {
  if (roomTypes.value.length === 0) return 0;
  const total = roomTypes.value.reduce((sum, rt) => sum + (rt.semester_rate || 0), 0);
  return roomTypes.value.length > 0 ? total / roomTypes.value.length : 0;
});

const sortedRoomTypes = computed(() => {
  const sorted = [...roomTypes.value];

  if (!sortBy.value) {
    return sorted;
  }

  return sorted.sort((a, b) => {
    let aValue, bValue;

    if (sortBy.value === "daily_rate") {
      aValue = a.daily_rate || 0;
      bValue = b.daily_rate || 0;
    } else if (sortBy.value === "semester_rate") {
      aValue = a.semester_rate || 0;
      bValue = b.semester_rate || 0;
    } else if (sortBy.value === "capacity") {
      aValue = a.capacity || getBedCount(a);
      bValue = b.capacity || getBedCount(b);
    } else {
      return 0;
    }

    const comparison = aValue - bValue;
    return sortOrder.value === "desc" ? -comparison : comparison;
  });
});

// Navigation actions
function navigateToAddRoomType() {
  router.push("/room-type-form");
}

function navigateToEditRoomType(id: number) {
  const roomType = roomTypes.value.find((rt) => rt.id === id);
  if (roomType) {
    roomTypesStore.setSelectedRoomType(roomType);
  }
  router.push(`/room-type-form/${id}`);
}

async function deleteRoomType(id: number) {
  const confirmed = await showConfirmation(
    t("Are you sure? This change is not recoverable"),
    t("Delete Room Type")
  );

  if (confirmed) {
    try {
      await roomTypeService.delete(id);
      await loadData(); // Reload data
      showSuccess(t("Room type deleted successfully"));
    } catch (err) {
      showError(t("Failed to delete room type"));
    }
  }
}
</script>

<style scoped>
/* Add custom styles if needed */
</style>
