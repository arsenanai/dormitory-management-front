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
      <!-- Beds Preview -->
      <div v-if="room.roomType" class="mt-6">
        <div class="font-semibold mb-2">{{ t('Beds Preview') }}</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="bed in bedsPreview"
            :key="bed.id"
            class="inline-block px-3 py-1 rounded bg-primary-100 text-primary-700 border border-primary-300"
          >
            {{ t('Bed') }} {{ bed.number }}
          </span>
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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { Room } from "@/models/Room";
import { Dormitory } from "@/models/Dormitory";
import { RoomType } from "@/models/RoomType";
import { Bed } from "@/models/Bed";

// i18n
const { t } = useI18n();

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
      { id: "b1", number: "1" },
      { id: "b2", number: "2" },
    ];
  }
  if (room.value.roomType.name === "Lux") {
    return [
      { id: "b1", number: "1" },
      { id: "b2", number: "2" },
      { id: "b3", number: "3" },
    ];
  }
  return [];
});

// Submit handler
function submitRoom() {
  // You can add validation and API call here
  console.log("Room submitted:", room.value);
  alert(t("Room saved!"));
}
</script>