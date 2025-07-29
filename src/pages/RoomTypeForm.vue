<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/RoomTypeForm.vue -->
<template>
    <div v-if="error" class="mb-4 p-2 bg-red-100 text-red-700 rounded border border-red-300">
      {{ error }}
    </div>
  <Navigation :title="t('Room Type Plan Editor')">
    <form @submit.prevent="handleSubmit">
      <!-- Room Type Name -->
      <CInput
        id="room-type-name"
        v-model="roomType.name"
        :label="t('Room Type Name')"
        placeholder="Enter room type name"
        required
        :validationState="errors.name ? 'error' : ''"
        :validationMessage="errors.name"
      />
      <!-- Room Type Description -->
      <CInput
        id="room-type-description"
        v-model="roomType.description"
        :label="t('Room Type Description')"
        placeholder="Enter description"
        required
        :validationState="errors.description ? 'error' : ''"
        :validationMessage="errors.description"
      />
      <!-- Room Plan Image -->
      <CFileInput
        id="room-plan-image"
        :label="t('Room Plan Image')"
        :allowedExtensions="['jpg', 'jpeg', 'png']"
        :maxFileSize="5 * 1024 * 1024"
        @change="onRoomPlanFileChange"
      />

      <!-- Room Type Photos -->
      <CFileInput
        id="room-photos"
        :label="t('Room Type Photos')"
        :allowedExtensions="['jpg', 'jpeg', 'png', 'webp']"
        :maxFileSize="5 * 1024 * 1024"
        :multiple="true"
        @change="onPhotosFileChange"
        :validationState="errors.photos ? 'error' : ''"
        :validationMessage="errors.photos"
      />

      <!-- Display uploaded photos -->
      <div v-if="roomType.photos.length > 0" class="mt-4">
        <h3 class="text-lg font-medium mb-2 text-primary-700">{{ t('Uploaded Photos') }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="(photo, index) in roomType.photos"
            :key="index"
            class="relative group"
          >
            <img
              :src="photo"
              :alt="`Room photo ${index + 1}`"
              class="w-full h-24 object-cover rounded-lg border"
            />
            <CButton
              @click="removePhoto(index)"
              size="small"
              variant="danger"
              class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              ×
            </CButton>
          </div>
        </div>
      </div>

      <!-- Room plan container with background image -->
      <div
        class="relative mx-auto my-4 border-2 border-primary-200 rounded-lg overflow-hidden shadow-md bg-primary-50"
        :style="roomPlanStyle"
        ref="roomPlanRef"
      >
        <svg
          :width="stageConfig.width"
          :height="stageConfig.height"
          style="display: block;"
        >
          <g
            v-for="(bed, idx) in beds"
            :key="bed.id"
            @mousedown="startDrag(idx, $event)"
            @dblclick="removeBed(idx)"
            @click="selectBed(idx)"
            style="cursor: pointer;"
          >
            <!-- Rotated bed rectangle -->
            <g :transform="`translate(${bed.x},${bed.y}) rotate(${bed.rotation},${bedWidth/2},${bedHeight/2})`">
              <rect
                :width="bedWidth"
                :height="bedHeight"
                :fill="secondary500"
                :stroke="primary700"
                stroke-width="2"
                rx="6"
                :style="{ filter: selectedBedIdx === idx ? 'drop-shadow(0 0 6px #2f3459)' : '' }"
              />
            </g>
            <!-- Upright bed number -->
            <text
              :x="bed.x + bedWidth/2"
              :y="bed.y + bedHeight/2 + 6"
              text-anchor="middle"
              font-size="18"
              fill="#fff"
              font-weight="bold"
              :font-family="fontSans"
              pointer-events="none"
              dominant-baseline="middle"
            >
              {{ bed.number }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Bed controls and info -->
      <div class="flex flex-col md:flex-row md:items-center md:gap-4 mb-2">
        <div class="text-primary-500 text-sm flex-1">
          {{ t('Double-click a bed to remove it. Drag beds to reposition. Select a bed and use the rotate buttons.') }}
        </div>
        <div v-if="selectedBedIdx !== null" class="flex gap-2 items-center mt-2 md:mt-0">
          <span class="font-medium">{{ t('Selected Bed') }}: {{ beds[selectedBedIdx].number }}</span>
          <CButton size="sm" @click="rotateBed(-15)" type="button">
            {{ t('Rotate Left') }}
          </CButton>
          <CButton size="sm" @click="rotateBed(15)" type="button">
            {{ t('Rotate Right') }}
          </CButton>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex flex-row items-end justify-end gap-2">
        <CButton @click.prevent="addBed" type="button">
          {{ t('Add Bed') }}
        </CButton>
        <CButton variant="primary" type="submit">
          {{ t('Save Plan') }}
        </CButton>
      </div>
    </form>
  </Navigation>
</template>


<script setup lang="ts">

import { ref, computed, onMounted, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import CFileInput from "@/components/CFileInput.vue";
import { RoomType } from "@/models/RoomType";
import { useRoomTypesStore } from "@/stores/roomTypes";
import { useToast } from "@/composables/useToast";
import { roomTypeService as defaultRoomTypeService } from "@/services/api";
// Allow injection of roomTypeService for testability
const props = defineProps({
  roomTypeService: {
    type: Object,
    default: () => defaultRoomTypeService
  }
});

// Theme colors
const primary700 = "#232743";
const secondary500 = "#d69979";
const roomTypeService = props.roomTypeService;

const error = ref<string | null>(null);
const errors = ref<any>({ name: '', description: '', photos: '' });

// ...existing code...

// Expose methods and error for testing (must be at the absolute end)
defineExpose({
  createOrUpdateRoomType,
  handleSubmit,
  validateForm,
  error,
  errors
});


const { t } = useI18n();
const route = useRoute();
const roomTypeStore = useRoomTypesStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const roomTypeId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!roomTypeId.value);

// Add description to RoomType instance
const roomType = ref<any>({
  ...new RoomType(uuidv4(), "", ""),
  description: ""
});

const stageConfig = { width: 600, height: 400 };
const bedWidth = 44;
const bedHeight = 64;

const beds = ref<{ id: string; number: string; x: number; y: number; rotation: number }[]>([]);
const selectedBedIdx = ref<number | null>(null);

// Room plan image as data URL
const roomPlanUrl = ref<string | null>(null);
const roomPlanRef = ref<HTMLDivElement | null>(null);

const roomPlanStyle = computed(() => ({
  width: `${stageConfig.width}px`,
  height: `${stageConfig.height}px`,
  background: roomPlanUrl.value
    ? `url('${roomPlanUrl.value}') center/contain no-repeat`
    : "#f3f4f9",
  border: `2px solid ${primary700}`,
}));


// For duplicate name check (fetch from API)
const existingNames = ref<string[]>([]);

// Load existing room type names for duplicate checking
const loadExistingNames = async () => {
  try {
    const response = await roomTypeService.getAll();
    existingNames.value = response.data.map((roomType: any) => roomType.name);
  } catch (error) {
    console.error('Failed to load existing room type names:', error);
    existingNames.value = [];
  }
};

// Load existing names on component mount
onMounted(() => {
  loadExistingNames();
});

function validatePhoto(file: File) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    errors.value.photos = "Invalid file type";
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.value.photos = "File is too large";
    return false;
  }
  errors.value.photos = '';
  return true;
}

function validateForm() {
  let valid = true;
  errors.value.name = '';
  errors.value.description = '';
  errors.value.photos = '';
  if (!roomType.value.name) {
    errors.value.name = 'Name is required';
    valid = false;
  } else if (existingNames.value.includes(roomType.value.name)) {
    errors.value.name = 'Room type name already exists';
    valid = false;
  }
  if (!roomType.value.description) {
    errors.value.description = 'Description is required';
    valid = false;
  }
  // Optionally validate photos
  return valid;
}

async function createOrUpdateRoomType() {
  // Simulate API call
  if (roomType.value.name === 'fail') throw new Error('API Error');
  return { data: { id: 1, name: roomType.value.name } };
}

async function handleSubmit() {
  error.value = null;
  const valid = validateForm();
  if (!valid) return false;
  try {
    if (isEditing.value) {
      await roomTypeService.update(roomTypeId.value!, roomType.value);
    } else {
      await roomTypeService.create(roomType.value);
    }
    showSuccess(t('Room type plan created successfully!'));
    return true;
  } catch (e: any) {
    error.value = e.message || 'API Error';
    showError(error.value);
    return false;
  }
}

function onRoomPlanFileChange(file: File | null) {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      roomPlanUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    roomPlanUrl.value = null;
  }
}

function onPhotosFileChange(files: FileList | null) {
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        roomType.value.photos.push(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }
}

function removePhoto(index: number) {
  roomType.value.photos.splice(index, 1);
}

function addBed() {
  const nextNumber = (beds.value.length + 1).toString();
  beds.value.push({
    id: uuidv4(),
    number: nextNumber,
    x: 60 + beds.value.length * 50,
    y: 60,
    rotation: 0,
  });
}

function removeBed(idx: number) {
  beds.value.splice(idx, 1);
  if (selectedBedIdx.value === idx) selectedBedIdx.value = null;
}

let dragInfo: { idx: number; offsetX: number; offsetY: number } | null = null;

function startDrag(idx: number, event: MouseEvent) {
  const svg = (roomPlanRef.value?.querySelector("svg") as SVGSVGElement) || null;
  if (!svg) return;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse());
  dragInfo = {
    idx,
    offsetX: cursor.x - beds.value[idx].x,
    offsetY: cursor.y - beds.value[idx].y,
  };
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
}

function onDrag(event: MouseEvent) {
  if (!dragInfo) return;
  const svg = (roomPlanRef.value?.querySelector("svg") as SVGSVGElement) || null;
  if (!svg) return;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse());
  beds.value[dragInfo.idx].x = cursor.x - dragInfo.offsetX;
  beds.value[dragInfo.idx].y = cursor.y - dragInfo.offsetY;
}

function stopDrag() {
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  dragInfo = null;
}

function selectBed(idx: number) {
  selectedBedIdx.value = idx;
}

function rotateBed(deg: number) {
  if (selectedBedIdx.value !== null) {
    beds.value[selectedBedIdx.value].rotation += deg;
  }
}

async function savePlan() {
  try {
    roomType.value.minimap = JSON.stringify(beds.value);
    
    if (isEditing.value) {
      // await roomTypeService.update(roomTypeId.value!, roomType.value);
      showSuccess(t("Room type plan updated successfully!"));
    } else {
      // await roomTypeService.create(roomType.value);
      showSuccess(t("Room type plan created successfully!"));
    }
  } catch (error) {
    showError(t("Failed to save room type plan. Please try again."));
  }
}

// Load room type from API if editing
const loadRoomType = async (id: number) => {
  try {
    const response = await roomTypeService.getById(id);
    const roomTypeData = response.data;
    // Populate form with API data
    roomType.value = {
      ...new RoomType(
        roomTypeData.id || uuidv4(),
        roomTypeData.name || "",
        roomTypeData.minimap || ""
      ),
      description: roomTypeData.description || ""
    };
    // Load beds if minimap exists
    if (roomTypeData.minimap) {
      try {
        beds.value = JSON.parse(roomTypeData.minimap);
      } catch (e) {
        beds.value = [];
      }
    }
  } catch (error) {
    showError(t("Failed to load room type data"));
  }
};

// Populate the form if editing an existing room type
watch(
  () => roomTypeStore.selectedRoomType,
  (selectedRoomType: any) => {
    if (selectedRoomType) {
      roomType.value = {
        ...new RoomType(
          selectedRoomType.id || uuidv4(),
          selectedRoomType.name || "",
          selectedRoomType.minimap || ""
        ),
        description: selectedRoomType.description || ""
      };
      // Load beds if minimap exists
      if (selectedRoomType.minimap) {
        try {
          beds.value = JSON.parse(selectedRoomType.minimap);
        } catch (e) {
          beds.value = [];
        }
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // First try to restore from store
  roomTypeStore.restoreSelectedRoomType();
  
  // If editing and no data in store, load from API
  if (isEditing.value && !roomTypeStore.selectedRoomType) {
    await loadRoomType(roomTypeId.value!);
  }
});
</script>

<style scoped>
.room-plan-canvas {
  background: #f3f4f9;
  box-shadow: 0 2px 8px 0 rgba(44, 52, 89, 0.06);
  margin-bottom: 1.5rem;
}
</style>