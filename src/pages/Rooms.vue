<template>
    <Navigation :title="t('Rooms Management')">
      <div class="flex flex-col gap-4">
        <h1>{{ t('Rooms') }}</h1>
        
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
          </div>
          <div class="flex-1 flex justify-end">
            <CButton @click="navigateToAddRoom" data-testid="add-room-button">
              <PlusIcon class="h-5 w-5" />
              {{ t("Add Room") }}
            </CButton>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-text text-center py-4">
          {{ t("Loading...") }}
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-message text-red-500 text-center py-4">
          {{ error }}
        </div>
  
        <!-- Rooms Table -->
        <div v-if="!loading && !error" class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-primary-700 uppercase bg-primary-50">
              <tr>
                <th class="px-6 py-3">{{ t("Room Number") }}</th>
                <th class="px-6 py-3">{{ t("Dormitory") }}</th>
                <th class="px-6 py-3">{{ t("Room Type") }}</th>
                <th class="px-6 py-3">{{ t("Floor") }}</th>
                <th class="px-6 py-3">{{ t("Beds") }}</th>
                <th class="px-6 py-3">{{ t("Free beds") }}</th>
                <th class="px-6 py-3">{{ t("Notes") }}</th>
                <th class="px-6 py-3 text-right">{{ t("Action") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedRooms.length === 0" class="bg-white border-b">
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                  No rooms available
                </td>
              </tr>
              <tr v-for="room in paginatedRooms" :key="room.id" class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium">{{ room.number }}</td>
                <td class="px-6 py-4">{{ getDormitoryName(room) }}</td>
                <td class="px-6 py-4">{{ getRoomTypeName(room) }}</td>
                <td class="px-6 py-4">{{ room.floor !== null ? room.floor : '-' }}</td>
                <td class="px-6 py-4">{{ getBedsCount(room) }}</td>
                <td class="px-6 py-4">{{ getFreeBeds(room) }}</td>
                <td class="px-6 py-4">{{ room.notes || '-' }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex gap-2 justify-end">
                    <CButton @click="navigateToEditRoom(room.id)" data-testid="edit-room-button">
                      <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
                    </CButton>
                    <CButton variant="danger" @click="deleteRoom(room.id)" data-testid="delete-room-button">
                      <TrashIcon class="h5 w-5" /> {{ t("Delete") }}
                    </CButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <CButton :disabled="currentPage === 1" @click="currentPage--" :aria-label="t('Previous page')" data-testid="pagination-button">
            {{ t("Previous") }}
          </CButton>
          <span>
            {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
          </span>
          <CButton :disabled="currentPage === totalPages" @click="currentPage++" :aria-label="t('Next page')" data-testid="pagination-button">
            {{ t("Next") }}
          </CButton>
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
import CTable from "@/components/CTable.vue";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
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

// Search and filter state
const searchTerm = ref('');
const statusFilter = ref('');
const dormitoryFilter = ref<number | ''>('');

// Modal state
const showForm = ref(false);

// Load data on component mount
const loadRooms = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required';
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

    console.log('Sending filters to API:', apiFilters);

    const [roomsResponse, dormitoriesResponse, roomTypesResponse] = await Promise.all([
      roomService.getAll(apiFilters),
      dormitoryService.getAll(),
      roomTypeService.getAll()
    ]);
    
    // Handle Laravel paginated response structure for rooms
    if (roomsResponse && roomsResponse.data) {
      if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
        // Update pagination state from API response
        currentPage.value = roomsResponse.data.current_page;
        totalPages.value = roomsResponse.data.last_page;
        perPage.value = roomsResponse.data.per_page;
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
    if (dormitoriesResponse && dormitoriesResponse.data) {
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
    if (roomTypesResponse && roomTypesResponse.data) {
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
    
    console.log('Fetched rooms:', rooms.value);
    console.log('Fetched dormitories:', dormitories.value);
    console.log('Fetched room types:', roomTypes.value);
  } catch (err) {
    console.error('Error loading rooms:', err);
    error.value = 'Failed to load rooms';
    showError(t('Failed to load rooms data'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRooms();
  roomsStore.clearSelectedRoom();
});

// Route watcher to reload rooms when the component becomes active again
watch(route, () => {
  if (route.path === '/rooms') {
    loadRooms();
  }
});

// Also watch for route path changes more specifically
watch(() => route.path, (newPath) => {
  if (newPath === '/rooms') {
    console.log('Route changed to /rooms, reloading rooms...');
    loadRooms();
  }
});

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
});

// Watch for search term and filter changes to reload rooms
watch([searchTerm, statusFilter, dormitoryFilter, () => filters.value.roomType], () => {
  currentPage.value = 1; // Reset to first page on filter change
  console.log('Filters changed, reloading rooms...');
  loadRooms();
});

// The `rooms` ref now holds the already-paginated data for the current page.
// We can use it directly in the template.
const paginatedRooms = computed(() => rooms.value);

// Occupancy stats
const occupancyStats = computed(() => {
  const totalRooms = rooms.value.length;
  const availableRooms = rooms.value.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.value.filter(r => r.status === 'occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  return {
    totalRooms,
    availableRooms, 
    occupiedRooms,
    occupancyRate
  };
});

// Keep currentPage in range when rooms change
watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    loadRooms();
  }
});
watch(paginatedRooms, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
});

// CRUD operations
async function createRoom(roomData: any) {
  try {
    await roomService.create(roomData);
    await loadRooms();
    showSuccess(t('Room created successfully'));
  } catch (err) {
    showError(t('Failed to create room'));
  }
}

async function updateRoom(id: number, roomData: any) {
  try {
    await roomService.update(id, roomData);
    await loadRooms();
    showSuccess(t('Room updated successfully'));
  } catch (err) {
    showError(t('Failed to update room'));
  }
}

async function deleteRoom(id: number) {
  const confirmed = await showConfirmation(
    t('Are you sure? This change is not recoverable'),
    t('Delete Room')
  );
  
  if (confirmed) {
    try {
      await roomService.delete(id);
      await loadRooms(); // Reload data
      showSuccess(t('Room deleted successfully'));
    } catch (err) {
      showError(t('Failed to delete room'));
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
const getDormitoryName = (room: any) => {
  return room.dormitory?.name || 
         dormitories.value.find(d => d.id === room.dormitory_id)?.name || 
         '-';
};

const getRoomTypeName = (room: any) => {
  return room.room_type?.name || 
         roomTypes.value.find(rt => rt.id === room.room_type_id)?.name || 
         '-';
};

const getBedsCount = (room: any) => {
  return room.beds?.length || 0;
};

const getFreeBeds = (room: any) => {
  if (!room.beds || !Array.isArray(room.beds)) return 0;
  return room.beds.filter((bed: any) => !bed.is_occupied && !bed.reserved_for_staff).length;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'available': return 'green';
    case 'occupied': return 'yellow';
    case 'maintenance': return 'red';
    default: return 'gray';
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}


</script>