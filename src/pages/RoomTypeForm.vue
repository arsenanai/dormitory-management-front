<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/RoomTypeForm.vue -->
<template>
  <Navigation :title="t('Room Type Plan Editor')">
      <!-- Room Type Name -->
      <CInput
        id="room-type-name"
        v-model="roomType.name"
        :label="t('Room Type Name')"
        placeholder="Enter room type name"
        required
      />
      <!-- Room Plan Image -->
      <CFileInput
        id="room-plan-image"
        :label="t('Room Plan Image')"
        :allowedExtensions="['jpg', 'jpeg', 'png']"
        :maxFileSize="5 * 1024 * 1024"
        @change="onRoomPlanFileChange"
      />

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
      <div class="text-gray-500 text-sm flex-1">
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
      <CButton variant="primary" @click.prevent="savePlan" type="button">
        {{ t('Save Plan') }}
      </CButton>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import CFileInput from "@/components/CFileInput.vue";
import { RoomType } from "@/models/RoomType";

// Theme colors
const primary700 = "#232743";
const secondary500 = "#d69979";
const fontSans = "Noto Sans, Arial, sans-serif";

const { t } = useI18n();

const roomType = ref(new RoomType(uuidv4(), "", ""));

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

function savePlan() {
  roomType.value.minimap = JSON.stringify(beds.value);
  alert(t("Room plan saved!"));
}
</script>

<style scoped>
.room-plan-canvas {
  background: #f3f4f9;
  box-shadow: 0 2px 8px 0 rgba(44, 52, 89, 0.06);
  margin-bottom: 1.5rem;
}
</style>