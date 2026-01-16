<template>
  <div v-if="photos && photos.length > 0" class="mt-4">
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium text-gray-900">{{ t("Room Photos") }}</h3>
      <div class="flex gap-2 overflow-x-auto pb-2">
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="relative h-24 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-300 transition-colors hover:border-blue-500"
          @click="openPhotoModal(index)"
        >
          <img
            :src="`${resolvedBaseUrl}/files/download/${encodeURIComponent(photo)}`"
            :alt="`${t('Room Photo')} ${index + 1}`"
            class="h-full w-full object-cover"
          />
        </div>
      </div>
      <p class="mt-2 text-sm text-gray-600">{{ t("Click on any photo to view full size") }}</p>
    </div>

    <!-- Photo Modal -->
    <CModal v-model="showPhotoModal" :title="`${t('Room Photo')} ${currentPhotoIndex + 1}`">
      <div class="flex flex-col items-center justify-center gap-2">
        <div class="flex w-full items-center justify-center gap-4">
          <CButton
            @click="previousPhoto"
            :disabled="currentPhotoIndex === 0"
            size="small"
            class="!p-2"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </CButton>
          <div
            class="flex h-72 w-72 items-center justify-center overflow-hidden rounded-lg bg-gray-100"
          >
            <img
              v-if="currentPhoto"
              :src="`${resolvedBaseUrl}/files/download/${encodeURIComponent(currentPhoto)}`"
              :alt="`${t('Room Photo')} ${currentPhotoIndex + 1}`"
              class="h-full w-full object-cover"
            />
          </div>
          <CButton
            @click="nextPhoto"
            :disabled="currentPhotoIndex === photos.length - 1"
            size="small"
            class="!p-2"
          >
            <ChevronRightIcon class="h-6 w-6" />
          </CButton>
        </div>
        <span class="mt-2 px-3 py-1 text-sm text-gray-900 dark:text-white">
          {{ currentPhotoIndex + 1 }} / {{ photos.length }}
        </span>
        <div class="mt-2 flex items-center justify-center gap-2">
          <div
            v-for="(photo, idx) in photos"
            :key="idx"
            @click="goToPhoto(idx)"
            :class="[
              'h-3 w-3 cursor-pointer rounded-full transition-colors',
              idx === currentPhotoIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-blue-400',
            ]"
            aria-label="Go to photo"
          ></div>
        </div>
      </div>
    </CModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { resolvedBaseUrl } from "@/services/api";
import CModal from "@/components/CModal.vue";
import CButton from "@/components/CButton.vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  photos: string[];
}>();

const { t } = useI18n();

const showPhotoModal = ref(false);
const currentPhotoIndex = ref(0);

const currentPhoto = computed(() => props.photos[currentPhotoIndex.value]);

function openPhotoModal(index: number) {
  currentPhotoIndex.value = index;
  showPhotoModal.value = true;
}

function previousPhoto() {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
  }
}

function nextPhoto() {
  if (currentPhotoIndex.value < props.photos.length - 1) {
    currentPhotoIndex.value++;
  }
}

function goToPhoto(idx: number) {
  currentPhotoIndex.value = idx;
}
</script>
