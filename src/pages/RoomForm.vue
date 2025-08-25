<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/RoomForm.vue -->
<template>
  <Navigation :title="t('Add/Edit Room')">
    <h1 data-testid="room-form-title">{{ isEditing ? t('Edit Room') : t('Add Room') }}</h1>
    <form @submit.prevent="submitRoom">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Room Number -->
        <div>
          <CInput
            id="room-number"
            v-model="room.number"
            type="text"
            :label="t('Room Number')"
            placeholder="Enter Room Number"
            required
            data-testid="room-number-input"
          />
        </div>
        <!-- Floor -->
        <div>
          <CInput
            id="room-floor"
            v-model="room.floor"
            type="number"
            :label="t('Floor')"
            placeholder="Enter Floor"
            required
            data-testid="room-floor-input"
          />
        </div>
        <!-- Notes -->
        <div class="lg:col-span-2">
          <CInput
            id="room-notes"
            v-model="room.notes"
            type="text"
            :label="t('Notes')"
            placeholder="Enter Notes"
            data-testid="room-notes-input"
          />
        </div>
        <!-- Dormitory (readonly, linked to first dormitory) -->
        <div>
          <CInput
            id="room-dormitory"
            :model-value="room.dormitory?.name"
            :label="t('Dormitory')"
            readonly
            data-testid="dormitory-select"
          />
          <div v-if="loadingDormitories" class="text-sm text-gray-500 mt-1">
            {{ t('Loading dormitories...') }}
          </div>
        </div>
        <!-- Room Type -->
        <div>
          <CSelect
            id="room-type"
            v-model="selectedRoomTypeId"
            :options="roomTypeOptions"
            :label="t('Room Type')"
            :disabled="loadingRoomTypes"
            required
            data-testid="room-type-select"
          />
          <div v-if="loadingRoomTypes" class="text-sm text-gray-500 mt-1">
            {{ t('Loading room types...') }}
          </div>
          <div v-else-if="!loadingRoomTypes && roomTypeOptions.length === 0" class="text-sm text-red-500 mt-1">
            {{ t('No room types available') }}
          </div>
        </div>
        <!-- Quota -->
        <div>
          <CInput
            id="room-quota"
            v-model="room.quota"
            type="number"
            :label="t('Quota')"
            placeholder="Enter Room Quota"
            required
            data-testid="room-quota-input"
          />
        </div>
      </div>
      <!-- Beds Preview with Staff Reservation Toggle -->
      <div v-if="room.roomType" class="mt-6">
        <div class="font-semibold mb-2">{{ t('Beds Preview') }}</div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="bed in bedsPreview"
            :key="bed.id"
            :data-testid="`bed-${bed.number}`"
            class="inline-flex items-center px-3 py-1 rounded border"
            :class="bed.reserved_for_staff ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-primary-100 border-primary-300 text-primary-700'"
          >
            <span>{{ t('Bed') }} {{ bed.number }}</span>
            <CCheckbox
              v-model="bed.reserved_for_staff"
              :label="t('Reserved for Staff')"
              class="ml-2"
            />
          </div>
        </div>
      </div>
      <!-- Submit Button -->
      <div class="mt-6 flex flex-row items-end justify-end gap-2">
        <CButton variant="primary" type="submit" data-testid="submit-room-button">
          {{ t("Submit") }}
        </CButton>
      </div>
    </form>
  </Navigation>
</template>
  
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CCheckbox from "@/components/CCheckbox.vue";
import { Room } from "@/models/Room";
import { Dormitory } from "@/models/Dormitory";
import { RoomType } from "@/models/RoomType";
import { Bed } from "@/models/Bed";
import { useRoomsStore } from "@/stores/rooms";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { roomService, dormitoryService, roomTypeService } from "@/services/api";
import api from "@/services/api";

// i18n, router, and stores
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const roomStore = useRoomsStore();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const roomId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!roomId.value);

// Real dormitories and room types from API
const dormitories = ref<Dormitory[]>([]);
const roomTypes = ref<RoomType[]>([]);
const loadingDormitories = ref(false);
const loadingRoomTypes = ref(false);

// Room type options for select - computed based on available room types
const roomTypeOptions = computed(() => 
  roomTypes.value.map(rt => ({
    value: rt.id,
    name: rt.name,
  }))
);

// Room type selection - use direct ref instead of computed property
const selectedRoomTypeId = ref<number | null>(null);

// Room form state
const room = ref(new Room("", null, "", null, null, [], 1)); // Default quota of 1

// Store original bed data from API for updates
const originalBeds = ref<any[]>([]);

// Beds preview - use ref instead of computed to maintain reactivity
const bedsPreview = ref<any[]>([]);

// Function to update beds preview
const updateBedsPreview = () => {
  if (!room.value.roomType) {
    bedsPreview.value = [];
    return;
  }
  
  // If editing and we have existing beds, use them
  if (isEditing.value && originalBeds.value.length > 0) {
    bedsPreview.value = originalBeds.value.map(bed => ({
      id: bed.id,
      number: bed.bed_number || bed.number, // API returns bed_number, model expects number
      reserved_for_staff: bed.reserved_for_staff || false
    }));
  } else {
    // Otherwise, generate preview beds based on room type capacity
    const capacity = room.value.roomType.capacity || room.value.quota || 2;
    const beds = [];
    for (let i = 1; i <= capacity; i++) {
      beds.push({
        id: `bed-${i}`,
        number: i.toString(),
        reserved_for_staff: false
      });
    }
    bedsPreview.value = beds;
  }
};

  // Submit handler
  async function submitRoom() {
    try {
      // Check permissions for admin users
      if (authStore.user && authStore.user.role?.name === 'admin') {
        const userDormitoryId = authStore.user.admin_profile?.dormitory_id;
        if (userDormitoryId && dormitories.value[0]?.id !== userDormitoryId) {
          showError(t("Access denied: You can only create rooms in your assigned dormitory"));
          return;
        }
      }
      
      // Validate required fields
      if (!room.value.number || !room.value.roomType) {
        showError(t("Please fill in all required fields"));
        return;
      }
      
      // Prepare room data for API
      const roomData = {
        number: room.value.number,
        floor: room.value.floor,
        notes: room.value.notes,
        dormitory_id: dormitories.value[0]?.id,
        room_type_id: room.value.roomType?.id || null,
        quota: room.value.quota || 2,
      };
      
      // If editing, also update bed reservations
      if (isEditing.value && originalBeds.value.length > 0) {
        console.log('Updating bed reservations:', originalBeds.value);
        
        // Update bed reservations
        const bedUpdatePromises = originalBeds.value.map(async (bed) => {
          try {
            const response = await api.put(`/beds/${bed.id}`, {
              reserved_for_staff: bed.reserved_for_staff
            });
            
            console.log(`Bed ${bed.id} updated successfully:`, response.data);
            return { success: true, bedId: bed.id };
          } catch (bedError) {
            console.error(`Error updating bed ${bed.id}:`, bedError);
            return { success: false, bedId: bed.id, error: bedError };
          }
        });
        
        // Wait for all bed updates to complete
        const bedUpdateResults = await Promise.all(bedUpdatePromises);
        const failedUpdates = bedUpdateResults.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error('Some bed updates failed:', failedUpdates);
          showError(t(`Failed to update ${failedUpdates.length} bed(s). Please try again.`));
          return; // Don't proceed with room update if bed updates failed
        }
        
        console.log('All bed updates completed successfully');
      }
    
    // If editing, update the room, otherwise create new
    if (isEditing.value) {
      console.log('Updating room with ID:', roomId.value);
      console.log('Update data:', roomData);
      try {
        await roomService.update(roomId.value!, roomData);
        console.log('Room updated successfully');
        showSuccess(t("Room updated successfully!"));
      } catch (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
    } else {
      console.log('Creating new room');
      console.log('Create data:', roomData);
      try {
        await roomService.create(roomData);
        console.log('Room created successfully');
        showSuccess(t("Room created successfully!"));
      } catch (createError) {
        console.error('Create error:', createError);
        throw createError;
      }
    }
    
    console.log('Navigating back to rooms page');
    // Navigate back to rooms page
    router.push('/rooms');
  } catch (error) {
    console.error('Error saving room:', error);
    showError(t("Failed to save room. Please try again."));
  }
}

  // Load room from API if editing
  const loadRoom = async (id: number) => {
    try {
      // Ensure room types are loaded before loading room data
      if (roomTypes.value.length === 0) {
        console.log('Room types not loaded yet, loading them first...');
        await loadDormitoriesAndRoomTypes();
      }
      
      const response = await roomService.getById(id);
      const roomData = response.data;
      
      // Check if admin user has permission to access this room
      if (isEditing.value && authStore.user && authStore.user.role?.name === 'admin') {
        // Get user's assigned dormitory from their profile
        const userDormitoryId = authStore.user.admin_profile?.dormitory_id;
        
        if (userDormitoryId && roomData.dormitory_id !== userDormitoryId) {
          console.log('Access denied: Admin user cannot access room from different dormitory');
          showError(t("Access denied: You can only edit rooms in your assigned dormitory"));
          // Redirect back to rooms page
          router.push('/rooms');
          return;
        }
        
        console.log('Admin user has permission to access this room');
      }
    
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Full API response:', response);
    console.log('Response data:', roomData);
    console.log('Response data keys:', Object.keys(roomData));
    console.log('Room type from API (roomType):', roomData.roomType);
    console.log('Room type from API (room_type):', roomData.room_type);
    console.log('Room type type:', typeof (roomData.room_type || roomData.roomType));
    console.log('Room type keys:', (roomData.room_type || roomData.roomType) ? Object.keys(roomData.room_type || roomData.roomType) : 'null');
    console.log('Available room types:', roomTypes.value);
    console.log('Room type options:', roomTypeOptions.value);
    console.log('=== END API DEBUG ===');
    
    // Store original bed data from API for updates
    originalBeds.value = roomData.beds || [];
    console.log('Original beds loaded:', originalBeds.value);
    
    // Populate form with API data
    room.value = {
      number: roomData.number || "",
      floor: roomData.floor || "",
      notes: roomData.notes || "",
      dormitory: roomData.dormitory || dormitories.value[0] || null,
      roomType: roomData.room_type || roomData.roomType || null, // API returns room_type (snake_case)
      quota: roomData.quota || 2,
      beds: roomData.beds || [], // Load existing beds from API
    } as Room;
    
    // Update beds preview after loading room data
    updateBedsPreview();
    
    console.log('Form populated with:', room.value);
    console.log('Room type object after population:', room.value.roomType);
    
    // Manually set the selected room type ID for the CSelect
    if (room.value.roomType) {
      selectedRoomTypeId.value = room.value.roomType.id;
      console.log('Manually set selectedRoomTypeId to:', selectedRoomTypeId.value);
      
      // Verify the room type exists in our loaded room types
      const matchingRoomType = roomTypes.value.find(rt => rt.id === room.value.roomType?.id);
      if (matchingRoomType) {
        console.log('Found matching room type:', matchingRoomType);
        // Update the room type to use the loaded one (ensures consistency)
        room.value.roomType = matchingRoomType;
      } else {
        console.log('WARNING: Room type not found in loaded room types!');
        console.log('Looking for ID:', room.value.roomType.id);
        console.log('Available IDs:', roomTypes.value.map(rt => rt.id));
      }
    } else {
      console.log('No room type found in room data');
    }
    
    console.log('Selected room type ID after manual set:', selectedRoomTypeId.value);
    console.log('Room type object after manual set:', room.value.roomType);
    
  } catch (error) {
    console.error('Error loading room:', error);
    showError(t("Failed to load room data"));
  }
};

// Populate the form if editing an existing room
watch(
  () => roomStore.selectedRoom,
  (selectedRoom) => {
    if (selectedRoom) {
      room.value = {
        number: selectedRoom.number || "",
        floor: selectedRoom.floor || "",
        notes: selectedRoom.notes || "",
        dormitory: selectedRoom.dormitory || dormitories[0],
        roomType: selectedRoom.roomType || null,
        quota: selectedRoom.quota || 2,
      };
      
      // Sync the selected room type ID
      if (room.value.roomType) {
        selectedRoomTypeId.value = room.value.roomType.id;
      }
    }
  },
  { immediate: true }
);

// Watch for changes in selectedRoomTypeId and update room.roomType
watch(selectedRoomTypeId, (newValue) => {
  if (newValue) {
    room.value.roomType = roomTypes.value.find(rt => rt.id === newValue) || null;
    updateBedsPreview(); // Update beds preview when room type changes
  } else {
    room.value.roomType = null;
    updateBedsPreview();
  }
});

// Also watch for changes in room.roomType and sync selectedRoomTypeId
watch(() => room.value.roomType, (newRoomType) => {
  if (newRoomType && newRoomType.id !== selectedRoomTypeId.value) {
    selectedRoomTypeId.value = newRoomType.id;
  }
});

// Watch for changes in beds preview and sync back to originalBeds
watch(bedsPreview, (newBedsPreview) => {
  if (isEditing.value && originalBeds.value.length > 0) {
    console.log('Beds preview changed, syncing to originalBeds:', newBedsPreview);
    // Update originalBeds with the new reservation status
    newBedsPreview.forEach((previewBed, index) => {
      if (originalBeds.value[index] && previewBed.id) {
        // For editing mode, bed IDs are numbers from API
        // For preview mode, bed IDs are strings like 'bed-1'
        if (typeof previewBed.id === 'number' || (typeof previewBed.id === 'string' && previewBed.id.startsWith('bed-'))) {
          originalBeds.value[index].reserved_for_staff = previewBed.reserved_for_staff;
          console.log(`Updated bed ${originalBeds.value[index].id} reserved_for_staff to:`, previewBed.reserved_for_staff);
        }
      }
    });
  }
}, { deep: true });

  onMounted(async () => {
    console.log('RoomForm mounted, isEditing:', isEditing.value);
    
    // Check permissions before loading any data
    if (isEditing.value && authStore.user && authStore.user.role?.name === 'admin') {
      // For admin users, we need to check if they can access this room
      // We'll do this check in loadRoom, but we can add an early check here
      console.log('Admin user accessing edit form, will check permissions in loadRoom');
    }
    
    // Load dormitories and room types from API first
    await loadDormitoriesAndRoomTypes();
    
    console.log('Dormitories and room types loaded');
    console.log('Current room state:', room.value);
    
    // If editing, always load fresh room data from API to ensure we have full relationships
    if (isEditing.value) {
      console.log('Loading room from API, ID:', roomId.value);
      await loadRoom(roomId.value!);
      
      // Debug: Check the final state
      console.log('Final room state after loading:', room.value);
      console.log('Final roomType:', room.value.roomType);
      console.log('Final selectedRoomTypeId:', selectedRoomTypeId.value);
      console.log('Beds preview should show:', bedsPreview.value);
    } else {
      // Only restore from store for new rooms
      roomStore.restoreSelectedRoom();
    }
    
    console.log('Final room state after mount:', room.value);
  });

// Load dormitories and room types
// TODO: Implement full CSV business logic:
// - Dormitory Admin should only see their assigned dormitory
// - Room types should be filtered by dormitory context
// - Quota should be dormitory-specific
// - Room management should be restricted to assigned dormitory
const loadDormitoriesAndRoomTypes = async () => {
  loadingDormitories.value = true;
  loadingRoomTypes.value = true;
  
  try {
    // Load dormitories
    const dormitoriesResponse = await dormitoryService.getAll();
    dormitories.value = dormitoriesResponse.data || [];
    
    // Load room types (these are global, not dormitory-specific)
    const roomTypesResponse = await roomTypeService.getAll();
    if (roomTypesResponse.data && roomTypesResponse.data.data) {
      roomTypes.value = roomTypesResponse.data.data;
    } else if (roomTypesResponse.data && Array.isArray(roomTypesResponse.data)) {
      roomTypes.value = roomTypesResponse.data;
    } else {
      roomTypes.value = [];
    }
    
    // Set default dormitory if available
    if (dormitories.value.length > 0) {
      room.value.dormitory = dormitories.value[0];
    }
    
    // Only set default room type for new rooms, not when editing
    if (!isEditing.value && roomTypes.value.length > 0) {
      selectedRoomTypeId.value = roomTypes.value[0].id;
    }
  } catch (error) {
    console.error('Failed to load dormitories or room types:', error);
    showError(t("Failed to load form data"));
  } finally {
    loadingDormitories.value = false;
    loadingRoomTypes.value = false;
  }
};
</script>