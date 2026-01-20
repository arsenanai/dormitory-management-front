<template>
  <Navigation :title="t('Add/Edit Room')">
    <h1 data-testid="room-form-title">{{ isEditing ? t("Edit Room") : t("Add Room") }}</h1>
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
            :error="errors.number ? t(errors.number) : ''"
          />
          <!--  t('The number has already been taken.') -->
        </div>
        <!-- Floor -->
        <div>
          <CInput
            id="room-floor"
            v-model="room.floor"
            type="number"
            :label="t('Floor')"
            placeholder="Enter Floor (Optional)"
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
        <!-- Dormitory -->
        <div>
          <CSelect
            v-if="authStore.user?.role?.name === 'sudo' && !isEditing"
            id="room-dormitory-select"
            v-model="room.dormitory_id"
            :options="dormitoryOptions"
            :label="t('Dormitory')"
            :disabled="loadingDormitories"
            required
            data-testid="dormitory-select"
          />
          <CInput
            v-else
            id="room-dormitory"
            :model-value="room.dormitory?.name"
            :label="t('Dormitory')"
            :readonly="true"
            :placeholder="t('Dormitory preset to your assigned dormitory')"
          />
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
          <div v-if="loadingRoomTypes" class="mt-1 text-sm text-gray-500">
            {{ t("Loading room types...") }}
          </div>
          <div
            v-else-if="!loadingRoomTypes && roomTypeOptions.length === 0"
            class="mt-1 text-sm text-red-500"
          >
            {{ t("No room types available") }}
          </div>
        </div>

        <!-- Quota -->
        <div>
          <CInput
            id="room-quota"
            :model-value="room.roomType?.capacity || 0"
            type="number"
            :label="t('Capacity')"
            placeholder="t('Room Capacity')"
            :readonly="true"
            data-testid="room-quota-input"
          />
        </div>
        <!-- Occupant Type -->
        <div>
          <CSelect
            id="room-occupant-type"
            v-model="room.occupant_type"
            :options="occupantTypeOptions"
            :label="t('Occupant Type')"
            required
            data-testid="occupant-type-select"
          />
        </div>

        <!-- Reserved Beds -->
        <div>
          <label for="staff-beds" class="block text-sm font-medium text-gray-900 dark:text-white">
            {{ t("Staff reservation") }}
          </label>
          <div id="staff-beds" class="flex flex-col gap-2">
            <div
              v-for="(bed, index) in bedsPreview"
              :key="bed.id"
              :data-testid="`bed-${bed.number}`"
              class="inline-flex items-center rounded border px-3 py-1"
              :class="
                bed.reserved_for_staff
                  ? 'border-yellow-400 bg-yellow-100 text-yellow-800'
                  : 'bg-primary-100 border-primary-300 text-primary-700'
              "
            >
              <span>{{ t("Bed") }} {{ room.number }}-{{ index + 1 }}</span>
              <CCheckbox
                :id="'room-bed-' + bed.id"
                v-model="bed.reserved_for_staff"
                :label="
                  bed.is_occupied
                    ? `${t('Occupied by')}: ${bed.user?.first_name} ${bed.user?.last_name}`
                    : t('Reserved for Staff')
                "
                class="ml-2"
                :disabled="bed.is_occupied === true"
              />
            </div>
          </div>
        </div>
        <!-- Maintenance Status -->
        <div>
          <label class="block text-sm font-medium text-gray-900 dark:text-white">
            {{ t("Room Status") }}
          </label>
          <div class="mt-2 flex items-center">
            <CCheckbox
              id="room-is-maintenance"
              v-model="room.is_maintenance"
              :label="t('In Maintenance')"
              data-testid="is-maintenance-checkbox"
            />
          </div>
        </div>
      </div>
      <!-- Submit Button -->
      <div class="mt-4 flex flex-row items-end justify-end gap-2">
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
import { RoomType } from "@/models/RoomType";
import { Bed } from "@/models/Bed";
import { useRoomsStore } from "@/stores/rooms";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { roomService, roomTypeService, bedService, resolvedBaseUrl } from "@/services/api";
import api from "@/services/api";

// i18n, router, and stores
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const roomStore = useRoomsStore();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const roomId = computed(() => (route.params.id ? Number(route.params.id) : null));
const isEditing = computed(() => !!roomId.value);

// Real dormitories and room types from API
const roomTypes = ref<RoomType[]>([]);
const dormitories = ref<any[]>([]);
const loadingDormitories = ref(false);
const loadingRoomTypes = ref(false);

// Room type options for select - computed based on available room types
const roomTypeOptions = computed(() =>
  roomTypes.value.map((rt) => ({
    value: rt.id,
    name: rt.name,
  }))
);

const dormitoryOptions = computed(() =>
  dormitories.value.map((d) => ({
    value: d.id,
    name: d.name,
  }))
);

const occupantTypeOptions = computed(() => [
  { value: "student", name: t("student") },
  { value: "guest", name: t("guest") },
]);

// Room type selection - use direct ref instead of computed property
const selectedRoomTypeId = ref<number | null>(null);

// Room form state
const room = ref(
  new Room(
    "", // number
    null, // floor
    "", // notes
    { id: null, name: "" }, // dormitory
    null, // roomType
    [], // beds
    2, // quota
    "student" // occupant_type
  )
);

// Store original bed data from API for updates
const originalBeds = ref<any[]>([]);

// Error handling
const errors = ref<Record<string, string>>({});

// Beds preview - use ref instead of computed to maintain reactivity
const bedsPreview = ref<any[]>([]);

// Function to update beds preview
const updateBedsPreview = () => {
  // Always generate beds based on the room type's capacity.
  if (room.value.roomType?.capacity && room.value.roomType.capacity > 0) {
    const capacity = room.value.roomType.capacity;
    const newPreviewBeds = [];
    const newOriginalBeds = [];

    for (let i = 1; i <= capacity; i++) {
      // Find the corresponding original bed if it exists (by bed_number)
      const originalBed = originalBeds.value.find(
        (b) => parseInt(b.bed_number || b.number, 10) === i
      );

      const bedData = {
        // Use the original bed's ID if it exists, otherwise generate a temporary one.
        id: originalBed ? originalBed.id : null,
        number: i.toString(),
        bed_number: i.toString(),
        reserved_for_staff: originalBed ? originalBed.reserved_for_staff || false : false,
        is_occupied: originalBed ? originalBed.is_occupied || false : false,
        user: originalBed ? originalBed.user : null,
      };

      newPreviewBeds.push(bedData);
      if (originalBed) {
        newOriginalBeds.push(originalBed); // Keep existing bed data for submission
      }
    }
    bedsPreview.value = newPreviewBeds;
  } else {
    // If no capacity, clear the preview.
    bedsPreview.value = [];
  }
};

// Submit handler
async function submitRoom() {
  errors.value = {}; // Clear previous errors

  try {
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
      room_type_id: room.value.roomType?.id || null,
      dormitory_id: room.value.dormitory_id || room.value.dormitory?.id || null,
      occupant_type: room.value.occupant_type,
      is_maintenance: !!room.value.is_maintenance,
    } as any;

    // If editing, also update bed reservations
    //if (isEditing.value) {
    // Include bed reservation data in the main room update payload
    roomData.beds = bedsPreview.value.map((bed) => ({
      id: bed.id,
      reserved_for_staff: !!bed.reserved_for_staff,
    }));
    //}

    // If editing, update the room, otherwise create new
    if (isEditing.value) {
      try {
        await roomService.update(roomId.value!, roomData);
        console.log("Room updated successfully");
        showSuccess(t("Room updated successfully!"));
      } catch (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }
    } else {
      console.log("Creating new room");
      console.log("Create data:", roomData);
      try {
        await roomService.create(roomData);
        console.log("Room created successfully");
        showSuccess(t("Room created successfully!"));
      } catch (createError) {
        console.error("Create error:", createError);
        throw createError;
      }
    }

    console.log("Navigating back to rooms page");
    // Navigate back to rooms page
    router.push("/rooms");
  } catch (error) {
    const err = error as any;
    if (err.response?.data?.errors) {
      // Handle validation errors from API
      Object.keys(err.response.data.errors).forEach((key) => {
        errors.value[key] = Array.isArray(err.response.data.errors[key])
          ? err.response.data.errors[key][0]
          : err.response.data.errors[key];
      });
    } else {
      showError(err.response?.data?.message || t("Failed to save room. Please try again."));
    }
    console.error("Error saving room:", error);
  }
}

// Load room from API if editing
const loadRoom = async (id: number) => {
  try {
    // Ensure room types are loaded before loading room data
    if (roomTypes.value.length === 0) {
      console.log("Room types not loaded yet, loading them first...");
      await loadRoomTypes();
    }

    const response = await roomService.getById(id);
    const roomData = response.data;

    // Store original bed data from API for updates
    // IMPORTANT: We need to sync the beds with the room type's capacity
    const capacity = roomData.room_type?.capacity || roomData.quota || 0;
    const existingBeds = roomData.beds || [];
    const syncedBeds = [];
    for (let i = 1; i <= capacity; i++) {
      const existingBed = existingBeds.find((b) => parseInt(b.bed_number, 10) === i);
      if (existingBed) {
        syncedBeds.push(existingBed);
      }
    }
    originalBeds.value = syncedBeds;
    console.log("Original beds loaded:", originalBeds.value);

    // Populate form with API data
    room.value = {
      number: roomData.number || "",
      floor: roomData.floor || null,
      notes: roomData.notes || "",
      roomType: roomData.room_type || null, // API returns room_type (snake_case)
      quota: roomData.quota || 4,
      beds: roomData.beds || [], // Load existing beds from API
      dormitory: roomData.dormitory || null,
      dormitory_id: roomData.dormitory?.id || null,
      occupant_type: roomData.occupant_type || "student",
      is_maintenance: !!roomData.is_maintenance,
    } as Room;

    // Update beds preview after loading room data
    updateBedsPreview();

    console.log("Form populated with:", room.value);
    console.log("Room type object after population:", room.value.roomType);

    // Manually set the selected room type ID for the CSelect
    if (room.value.roomType) {
      selectedRoomTypeId.value = room.value.roomType.id;
      console.log("Manually set selectedRoomTypeId to:", selectedRoomTypeId.value);

      // Verify the room type exists in our loaded room types
      const matchingRoomType = roomTypes.value.find((rt) => rt.id === room.value.roomType?.id);
      if (matchingRoomType) {
        console.log("Found matching room type:", matchingRoomType);
        // Update the room type to use the loaded one (ensures consistency)
        room.value.roomType = matchingRoomType;
      } else {
        console.log("WARNING: Room type not found in loaded room types!");
        console.log("Looking for ID:", room.value.roomType.id);
        console.log(
          "Available IDs:",
          roomTypes.value.map((rt) => rt.id)
        );
      }
    } else {
      console.log("No room type found in room data");
    }

    console.log("Selected room type ID after manual set:", selectedRoomTypeId.value);
    console.log("Room type object after manual set:", room.value.roomType);
  } catch (error) {
    console.error("Error loading room:", error);
    showError(t("Failed to load room data"));
  }
};

// Watch for changes in the selected room type ID from the dropdown
watch(selectedRoomTypeId, (newId) => {
  if (newId) {
    const newRoomType = roomTypes.value.find((rt) => rt.id === newId);
    if (newRoomType) {
      // Update the entire roomType object on the room
      room.value.roomType = newRoomType;
      // Trigger the beds preview to update with the new capacity
      updateBedsPreview();
    }
  }
});

// Watch for changes in beds preview and sync back to originalBeds
watch(
  bedsPreview,
  (newBedsPreview) => {
    if (isEditing.value && originalBeds.value.length > 0) {
      console.log("Beds preview changed, syncing to originalBeds:", newBedsPreview);
      // Sync changes from the preview back to the originalBeds array for submission
      newBedsPreview.forEach((previewBed) => {
        // Find the corresponding bed in the original data by ID or number
        const originalBed = originalBeds.value.find((b) => b.id === previewBed.id);

        if (originalBed) {
          // Only update if the value has actually changed
          if (originalBed.reserved_for_staff !== previewBed.reserved_for_staff) {
            console.log(
              `Syncing bed ${originalBed.id}: reserved_for_staff from ${originalBed.reserved_for_staff} to ${previewBed.reserved_for_staff}`
            );
            originalBed.reserved_for_staff = previewBed.reserved_for_staff;
          }
        }
      });
    }
  },
  { deep: true }
);

onMounted(async () => {
  console.log("RoomForm mounted, isEditing:", isEditing.value);

  // Check permissions before loading any data
  if (isEditing.value && authStore.user && authStore.user.role?.name === "admin") {
    // For admin users, we need to check if they can access this room
    // We'll do this check in loadRoom, but we can add an early check here
    console.log("Admin user accessing edit form, will check permissions in loadRoom");
  }

  // Load dormitories and room types from API first
  await loadDormitories();
  await loadRoomTypes();

  console.log("Dormitories and room types loaded");
  console.log("Current room state:", room.value);

  // If editing, always load fresh room data from API to ensure we have full relationships
  if (isEditing.value) {
    console.log("Loading room from API, ID:", roomId.value);
    await loadRoom(roomId.value!);
    console.log("Final room state after loading:", room.value);
    console.log("Final roomType:", room.value.roomType);
    console.log("Final selectedRoomTypeId:", selectedRoomTypeId.value);
    console.log("Beds preview should show:", bedsPreview.value);
  } else {
    // Only restore from store for new rooms
    if (roomStore.selectedRoom) {
      room.value.dormitory = roomStore.selectedRoom.dormitory;
      room.value.dormitory_id = roomStore.selectedRoom.dormitory_id;
    }
    // roomStore.restoreSelectedRoom();
  }

  console.log("Final room state after mount:", room.value);
});

const loadDormitories = async () => {
  if (authStore.user?.role?.name !== "sudo") return;
  loadingDormitories.value = true;
  try {
    const response = await api.dormitoryService.getAll();
    if (response.data && Array.isArray(response.data.data)) {
      dormitories.value = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      dormitories.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load dormitories:", error);
  } finally {
    loadingDormitories.value = false;
  }
};

const loadRoomTypes = async () => {
  loadingRoomTypes.value = true;

  const params: { dormitory_id?: number } = {};
  const user = authStore.user;

  // If the user is an admin and has an assigned dormitory, filter by it.
  if (user?.role?.name === "admin" && user.adminDormitory?.id) {
    params.dormitory_id = user.adminDormitory.id;
  }

  try {
    const roomTypesResponse = await roomTypeService.getAll(params);
    if (roomTypesResponse.data?.data) {
      roomTypes.value = roomTypesResponse.data.data;
    } else if (roomTypesResponse.data && Array.isArray(roomTypesResponse.data)) {
      roomTypes.value = roomTypesResponse.data;
    } else {
      roomTypes.value = [];
    }

    // Only set default room type for new rooms, not when editing
    if (!isEditing.value && roomTypes.value.length > 0) {
      selectedRoomTypeId.value = roomTypes.value[0].id;
    }
  } catch (error) {
    console.error("Failed to load dormitories or room types:", error);
    showError(t("Failed to load form data"));
  } finally {
    loadingDormitories.value = false;
    loadingRoomTypes.value = false;
  }
};
</script>
