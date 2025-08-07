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
            
            <!-- Dormitory Filter -->
            <CSelect
              id="dormitory-filter"
              v-model="dormitoryFilter"
              :options="dormitoryOptions"
              :label="t('Dormitory')"
              :placeholder="t('Select Dormitory')"
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
            <CButton variant="primary" @click="navigateToAddRoom">
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
        <CTable v-if="!loading && !error">
          <CTableHead>
            <CTableHeadCell>{{ t("Room Number") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Dormitory") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Room Type") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Floor") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Beds") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Notes") }}</CTableHeadCell>
            <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="room in paginatedRooms" :key="room.id">
              <CTableCell>{{ room.number }}</CTableCell>
              <CTableCell>{{ getDormitoryName(room) }}</CTableCell>
              <CTableCell>{{ getRoomTypeName(room) }}</CTableCell>
              <CTableCell>
                {{ room.floor !== null ? room.floor : '-' }}
              </CTableCell>
              <CTableCell>{{ getBedsCount(room) }}</CTableCell>
              <CTableCell>{{ room.notes || '-' }}</CTableCell>
              <CTableCell class="text-right flex gap-2 justify-end">
                <CButton @click="navigateToEditRoom(room.id)">
                  <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
                </CButton>
                <CButton class="text-red-600" @click="deleteRoom(room.id)">
                  <TrashIcon class="h-5 w-5" /> {{ t("Delete") }}
                </CButton>
              </CTableCell>
            </CTableRow>
          </CTableBody>
        </CTable>
  
        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <CButton :disabled="currentPage === 1" @click="currentPage--" :aria-label="t('Previous page')">
            {{ t("Previous") }}
          </CButton>
          <span>
            {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
          </span>
          <CButton :disabled="currentPage === totalPages" @click="currentPage++" :aria-label="t('Next page')">
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
import { useRouter } from "vue-router";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { roomService, dormitoryService, roomTypeService } from "@/services/api";
import { useRoomsStore } from "@/stores/rooms";
import { useToast } from "@/composables/useToast";
import CInput from "@/components/CInput.vue";

// i18n and router
const { t } = useI18n();
const router = useRouter();

// store
const roomsStore = useRoomsStore();
const { showError, showSuccess, showConfirmation } = useToast();

// Room Data
const rooms = ref<any[]>([]);
const dormitories = ref<any[]>([]);
const roomTypes = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

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

    const [roomsResponse, dormitoriesResponse, roomTypesResponse] = await Promise.all([
      roomService.getAll(),
      dormitoryService.getAll(),
      roomTypeService.getAll()
    ]);
    
    // Handle Laravel paginated response structure for rooms
    if (roomsResponse && roomsResponse.data) {
      if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
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

// Filtered rooms
const filteredRooms = computed(() => {
  if (!rooms.value.length) return [];
  return rooms.value.filter((room) => {
    // Search filter
    const searchMatch = !searchTerm.value || 
      room.room_number?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    // Status filter
    const statusMatch = !statusFilter.value || room.status === statusFilter.value;
    
    // Dormitory filter
    const dormMatch = (!filters.value.dormitory && !dormitoryFilter.value) || 
      room.dormitory_id === parseInt(filters.value.dormitory) ||
      room.dormitory?.id === parseInt(filters.value.dormitory) ||
      room.dormitory_id === dormitoryFilter.value ||
      room.dormitory?.id === dormitoryFilter.value;
      
    // Room type filter
    const typeMatch = !filters.value.roomType || 
      room.room_type_id === parseInt(filters.value.roomType) ||
      room.roomType?.id === parseInt(filters.value.roomType);
      
    return searchMatch && statusMatch && dormMatch && typeMatch;
  });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRooms.value.length / itemsPerPage.value))
);
const paginatedRooms = computed(() =>
  filteredRooms.value.slice(
    (currentPage.value - 1) * itemsPerPage.value,
    currentPage.value * itemsPerPage.value
  )
);

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

// Keep currentPage in range when filteredRooms changes
watch(filteredRooms, () => {
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
    t('Are you sure you want to delete this room?'),
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
  const room = rooms.value.find(r => r.id === id);
  if (room) {
    roomsStore.setSelectedRoom(room);
  }
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
  return room.beds?.length || room.beds_count || 0;
};

// Additional helper functions expected by tests
function getAvailableCapacity(room: any) {
  return (room.capacity || 0) - (room.current_occupancy || 0);
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