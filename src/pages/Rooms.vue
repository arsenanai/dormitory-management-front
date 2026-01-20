<template>
  <Navigation :title="t('Rooms Management')">
    <div class="flex flex-col gap-4">
      <h1>{{ t("Rooms") }}</h1>

      <!-- Search and Filters -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-end">
          <!-- Search -->
          <CInput
            id="search-rooms"
            v-model="searchTerm"
            :placeholder="t('Search rooms...')"
            :label="t('Search')"
            type="search"
          />

          <!-- Status Filter -->
          <CSelect
            id="status-filter"
            v-model="statusFilter"
            :options="statusOptions"
            :label="t('Status')"
            :placeholder="t('Select Status')"
            class="lg:w-40"
          />

          <CSelect
            id="room-type-filter"
            v-model="filters.roomType"
            :options="roomTypeOptions"
            :label="t('Room Type')"
            :placeholder="t('Select Room Type')"
            class="lg:w-40"
          />

          <CSelect
            id="occupant-type-filter"
            v-model="filters.occupantType"
            :options="occupantTypeOptions"
            :label="t('Occupant Type')"
            :placeholder="t('Select Occupant Type')"
            class="lg:w-40"
          />
        </div>
        <div class="flex flex-1 justify-end">
          <CButton @click="navigateToAddRoom" data-testid="add-room-button">
            <PlusIcon class="h-5 w-5" />
            {{ t("Add Room") }}
          </CButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-text py-4 text-center">
        {{ t("Loading...") }}
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message py-4 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Rooms Table -->
      <div v-if="!loading && !error" class="overflow-x-auto">
        <CTable :columns="tableColumns" :data="paginatedRooms" :loading="loading">
          <template #cell-room_type="{ row }">
            {{ getRoomTypeName(row) }}
          </template>
          <template #cell-occupant_type="{ row }">
            {{ t(row.occupant_type) }}
          </template>
          <template #cell-beds="{ row }">
            {{ getBedsCount(row) }}
          </template>
          <template #cell-free_beds="{ row }">
            {{ getFreeBeds(row) }}
          </template>
          <template #cell-notes="{ row }">
            {{ row.notes || "-" }}
          </template>
          <template #cell-status="{ row }">
            <span
              v-if="row.is_maintenance"
              class="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            >
              {{ t("Maintenance") }}
            </span>
            <span
              v-else-if="getFreeBeds(row) > 0"
              class="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
            >
              {{ t("Available") }}
            </span>
            <span
              v-else
              class="rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300"
            >
              {{ t("Occupied") }}
            </span>
          </template>
          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <CButton @click="navigateToEditRoom(row.id)" data-testid="edit-room-button">
                <PencilSquareIcon class="h-5 w-5" />
              </CButton>
              <CButton
                variant="danger"
                @click="deleteRoom(row.id)"
                data-testid="delete-room-button"
              >
                <TrashIcon class="h-5 w-5" />
              </CButton>
            </div>
          </template>
        </CTable>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col items-center justify-between gap-4 md:flex-row"
        data-testid="pagination"
      >
        <div class="text-sm text-gray-700">
          <span v-if="totalRooms > 0">
            <span class="font-medium">{{ fromRoom }}</span> -
            <span class="font-medium">{{ toRoom }}</span> /
            <span class="font-medium">{{ totalRooms }}</span>
          </span>
          <span v-else>
            {{ t("No data available") }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <CButton
            :disabled="currentPage === 1"
            @click="currentPage--"
            :aria-label="t('Previous page')"
            class="h-10"
          >
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
                class="h-10 text-center"
                @keyup.enter="goToPage"
              />
            </div>
            <span>/ {{ totalPages }}</span>
          </div>
          <CButton
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            :aria-label="t('Next page')"
            class="h-10"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </CButton>
        </div>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import CTable from "@/components/CTable.vue";
import { roomService, dormitoryService, roomTypeService } from "@/services/api";
import { useRoomsStore } from "@/stores/rooms";
import { useToast } from "@/composables/useToast";
import CInput from "@/components/CInput.vue";

// i18n and router
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// store
const roomsStore = useRoomsStore();
const { showError, showSuccess, showConfirmation } = useToast();

// Room Data
const rooms = ref<any[]>([]);
const dormitories = ref<any[]>([]);
const roomTypes = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Pagination state
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(15); // Default, will be updated from API
const pageInput = ref(1);
const totalRooms = ref(0);
const fromRoom = ref(0);
const toRoom = ref(0);

// Search and filter state
const searchTerm = ref("");
const statusFilter = ref("");

const tableColumns = [
  { key: "number", label: t("Room Number") },
  { key: "room_type", label: t("Room Type") },
  { key: "occupant_type", label: t("Occupant Type") },
  { key: "floor", label: t("Floor") },
  { key: "beds", label: t("Beds") },
  { key: "free_beds", label: t("Free beds") },
  { key: "notes", label: t("Notes") },
  { key: "status", label: t("Status") },
  { key: "actions", label: t("Action"), class: "text-right" },
];
const dormitoryFilter = ref<number | "">("");

// Modal state
const showForm = ref(false);

// Load data on component mount
const loadRooms = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      error.value = "Authentication required";
      rooms.value = [];
      dormitories.value = [];
      roomTypes.value = [];
      return;
    }

    // Prepare filters for backend API
    const apiFilters: any = {};
    apiFilters.page = currentPage.value;

    // Add search term as number filter (backend searches room numbers)
    if (searchTerm.value.trim()) {
      apiFilters.number = searchTerm.value.trim();
    }

    // Add other filters
    if (statusFilter.value) {
      apiFilters.status = statusFilter.value;
    }

    if (dormitoryFilter.value) {
      apiFilters.dormitory_id = dormitoryFilter.value;
    }

    if (filters.value.roomType) {
      apiFilters.room_type_id = filters.value.roomType;
    }

    if (filters.value.occupantType) {
      apiFilters.occupant_type = filters.value.occupantType;
    }

    console.log("Sending filters to API:", apiFilters);

    const [roomsResponse, dormitoriesResponse, roomTypesResponse] = await Promise.all([
      roomService.getAll(apiFilters),
      dormitoryService.getAll(),
      roomTypeService.getAll(),
    ]);

    // Handle Laravel paginated response structure for rooms
    if (roomsResponse?.data) {
      if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
        // Update pagination state from API response
        currentPage.value = roomsResponse.data.current_page;
        totalPages.value = roomsResponse.data.last_page;
        perPage.value = roomsResponse.data.per_page;
        totalRooms.value = roomsResponse.data.total;
        fromRoom.value = roomsResponse.data.from;
        toRoom.value = roomsResponse.data.to;
        rooms.value = roomsResponse.data.data;
      } else if (Array.isArray(roomsResponse.data)) {
        rooms.value = roomsResponse.data;
      } else {
        rooms.value = [];
      }
    } else {
      rooms.value = [];
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

    console.log("Fetched rooms:", rooms.value);
    console.log("Fetched dormitories:", dormitories.value);
    console.log("Fetched room types:", roomTypes.value);
  } catch (err) {
    console.error("Error loading rooms:", err);
    error.value = "Failed to load rooms";
    showError(t("Failed to load rooms data"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRooms();
  pageInput.value = currentPage.value;
  roomsStore.clearSelectedRoom();
});

// Route watcher to reload rooms when the component becomes active again
watch(route, () => {
  if (route.path === "/rooms") {
    loadRooms();
  }
});

// Also watch for route path changes more specifically
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/rooms") {
      console.log("Route changed to /rooms, reloading rooms...");
      loadRooms();
    }
  }
);

// Watch for search term and filter changes to reload rooms
// Note: This watcher will be moved after filters ref is declared

// Status options for filter
const statusOptions = computed(() => [
  { value: "", name: t("All Statuses") },
  { value: "available", name: t("Available") },
  { value: "occupied", name: t("Occupied") },
  { value: "maintenance", name: t("Maintenance") },
]);

// Dormitory options for filter
const dormitoryOptions = computed(() => [
  { value: "", name: t("All Dormitories") },
  ...dormitories.value.map((d) => ({ value: d.id, name: d.name })),
]);

// Room type options for filter
const roomTypeOptions = computed(() => [
  { value: "", name: t("All Room Types") },
  ...roomTypes.value.map((rt) => ({ value: rt.id, name: rt.name })),
]);

// Filters
const filters = ref({
  dormitory: "",
  roomType: "",
  occupantType: "",
});

const occupantTypeOptions = computed(() => [
  { value: "", name: t("All Occupant Types") },
  { value: "student", name: t("Student") },
  { value: "guest", name: t("Guest") },
]);

// Watch for search term and filter changes to reload rooms
watch(
  [
    searchTerm,
    statusFilter,
    dormitoryFilter,
    () => filters.value.roomType,
    () => filters.value.occupantType,
  ],
  () => {
    currentPage.value = 1; // Reset to first page on filter change
    console.log("Filters changed, reloading rooms...");
    loadRooms();
  }
);

// The `rooms` ref now holds the already-paginated data for the current page.
// We can use it directly in the template.
const paginatedRooms = computed(() => rooms.value);

const occupancyStats = computed(() => {
  const totalRoomsCount = rooms.value.length;
  const maintenanceRooms = rooms.value.filter((r) => r.is_maintenance).length;
  const availableRooms = rooms.value.filter(
    (r) => !r.is_maintenance && getFreeBeds(r) > 0
  ).length;
  const occupiedRooms = rooms.value.filter(
    (r) => !r.is_maintenance && getFreeBeds(r) === 0
  ).length;
  const occupancyRate =
    totalRoomsCount > maintenanceRooms
      ? Math.round((occupiedRooms / (totalRoomsCount - maintenanceRooms)) * 100)
      : 0;

  return {
    totalRooms: totalRoomsCount,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    occupancyRate,
  };
});

// Keep currentPage in range when rooms change
watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage && newPage > 0) {
    pageInput.value = newPage;
    loadRooms();
  }
});
watch(paginatedRooms, () => {
  if (totalPages.value > 0 && currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

// CRUD operations
async function createRoom(roomData: any) {
  try {
    await roomService.create(roomData);
    await loadRooms();
    showSuccess(t("Room created successfully"));
  } catch (err) {
    showError(t("Failed to create room"));
  }
}

async function updateRoom(id: number, roomData: any) {
  try {
    await roomService.update(id, roomData);
    await loadRooms();
    showSuccess(t("Room updated successfully"));
  } catch (err) {
    showError(t("Failed to update room"));
  }
}

async function deleteRoom(id: number) {
  const confirmed = await showConfirmation(
    t("Are you sure? This change is not recoverable"),
    t("Delete Room")
  );

  if (confirmed) {
    try {
      await roomService.delete(id);
      await loadRooms(); // Reload data
      showSuccess(t("Room deleted successfully"));
    } catch (err) {
      showError(t("Failed to delete room"));
    }
  }
}

// Modal functions
function showRoomForm() {
  showForm.value = true;
}

function closeRoomForm() {
  showForm.value = false;
}

async function handleFormSubmit(formData: any) {
  await createRoom(formData);
  showForm.value = false;
}

// Navigation actions
function navigateToAddRoom() {
  router.push("/room-form");
}

function navigateToEditRoom(id: number) {
  router.push(`/room-form/${id}`);
}

// Helper functions
const getRoomTypeName = (room: any) => {
  return (
    room.room_type?.name || roomTypes.value.find((rt) => rt.id === room.room_type_id)?.name || "-"
  );
};

const getBedsCount = (room: any) => {
  return room.beds?.length || 0;
};

const getFreeBeds = (room: any) => {
  if (!room.beds || !Array.isArray(room.beds)) return 0;
  return room.beds.filter((bed: any) => !bed.is_occupied && !bed.reserved_for_staff).length;
};

const goToPage = () => {
  const page = Number(pageInput.value);
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  } else {
    // Reset input to current page if value is invalid
    pageInput.value = currentPage.value;
  }
};
</script>
