<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/RoomForm.vue -->
<template>
  <Navigation :title="t('Add/Edit Room')">
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
          />
        </div>
        <!-- Dormitory (readonly, linked to first dormitory) -->
        <div>
          <CInput
            id="room-dormitory"
            :model-value="room.dormitory?.name"
            :label="t('Dormitory')"
            readonly
          />
        </div>
        <!-- Room Type -->
        <div>
          <CSelect
            id="room-type"
            v-model="room.roomType"
            :options="roomTypeOptions"
            :label="t('Room Type')"
            required
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
        <CButton variant="primary" type="submit">
          {{ t("Submit") }}
        </CButton>
      </div>
    </form>
  </Navigation>
</template>
  
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
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
import { useToast } from "@/composables/useToast";
import { roomService } from "@/services/api";

// i18n, router, and stores
const { t } = useI18n();
const route = useRoute();
const roomStore = useRoomsStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const roomId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!roomId.value);

// Mock dormitories (use real store/api in production)
const dormitories = [
  new Dormitory("A-BLOCK", 300, "female", "admin1", 267, 33, 75),
  new Dormitory("B-BLOCK", 300, "female", "admin2", 300, 0, 78),
  new Dormitory("C-BLOCK", 293, "male", "admin3", 300, 7, 80),
];

// Only Standard and Lux room types
const roomTypes = [
  new RoomType("1", "Standard"),
  new RoomType("2", "Lux"),
];

// Room type options for select
const roomTypeOptions = roomTypes.map(rt => ({
  value: rt,
  name: rt.name,
}));

// Room form state
const room = ref(new Room());

// By default, link to the first dormitory
room.value.dormitory = dormitories[0];

// Beds preview based on selected room type
const bedsPreview = computed(() => {
  if (!room.value.roomType) return [];
  // For demo: Standard = 2 beds, Lux = 3 beds
  if (room.value.roomType.name === "Standard") {
    return [
      { id: "b1", number: "1", reserved_for_staff: false },
      { id: "b2", number: "2", reserved_for_staff: false },
    ];
  }
  if (room.value.roomType.name === "Lux") {
    return [
      { id: "b1", number: "1", reserved_for_staff: false },
      { id: "b2", number: "2", reserved_for_staff: false },
      { id: "b3", number: "3", reserved_for_staff: false },
    ];
  }
  return [];
});

// Submit handler
async function submitRoom() {
  try {
    // You can add validation and API call here
    console.log("Room submitted:", room.value);
    
    // If editing, update the room, otherwise create new
    if (isEditing.value) {
      // await roomService.update(roomId.value!, room.value);
      showSuccess(t("Room updated successfully!"));
    } else {
      // await roomService.create(room.value);
      showSuccess(t("Room created successfully!"));
    }
  } catch (error) {
    showError(t("Failed to save room. Please try again."));
  }
}

// Load room from API if editing
const loadRoom = async (id: number) => {
  try {
    const response = await roomService.getById(id);
    const roomData = response.data;
    
    // Populate form with API data
    room.value = {
      number: roomData.number || "",
      floor: roomData.floor || "",
      notes: roomData.notes || "",
      dormitory: roomData.dormitory || dormitories[0],
      roomType: roomData.roomType || null,
    };
  } catch (error) {
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
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // First try to restore from store
  roomStore.restoreSelectedRoom();
  
  // If editing and no data in store, load from API
  if (isEditing.value && !roomStore.selectedRoom) {
    await loadRoom(roomId.value!);
  }
});
</script>