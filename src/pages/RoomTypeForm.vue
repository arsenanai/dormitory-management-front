<template>
  <Navigation :title="isEditing ? t('Edit Room Type') : t('Add Room Type')">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-2xl font-bold text-gray-900" data-testid="form-title">
        {{ isEditing ? t("Edit Room Type") : t("Add Room Type") }}
      </h1>

      <form name="room-type-form" @submit.prevent="handleSubmit">
        <div v-if="error" class="mb-4 rounded border border-red-300 bg-red-100 p-4 text-red-700">
          {{ error }}
        </div>

        <!-- Room Type Name -->
        <CInput
          id="room-type-name"
          v-model="form.name"
          type="text"
          :label="t('Room Type Name')"
          required
          :placeholder="t('Enter room type name')"
          data-testid="room-type-name"
          :error="errors.name"
          class="mb-4"
        />

        <!-- Room Type Description -->
        <CTextarea
          id="room-type-description"
          v-model="form.description"
          :label="t('Room Type Description')"
          rows="3"
          :placeholder="t('Enter room type description (optional)')"
          :error="errors.description"
          class="mb-4"
        />

        <!-- Room Type Capacity -->
        <CInput
          id="room-type-capacity"
          v-model="form.capacity"
          type="number"
          :label="t('Room Type Capacity')"
          min="1"
          required
          :placeholder="t('Enter room capacity')"
          data-testid="room-type-capacity"
          :error="errors.capacity"
          class="mb-4"
        />

        <!-- Daily Rate -->
        <CInput
          id="room-type-daily-rate"
          v-model="form.daily_rate"
          type="number"
          :label="t('Daily Rate') + ` (${currencySymbol})`"
          min="0"
          step="0.01"
          required
          :placeholder="t('Enter daily rate')"
          :error="errors.daily_rate"
          data-testid="room-type-daily-rate"
          name="room-type-daily-rate"
          class="mb-4"
        />

        <!-- Semester Rate -->
        <CInput
          id="room-type-semester-rate"
          v-model="form.semester_rate"
          type="number"
          :label="t('Semester Rate') + ` (${currencySymbol})`"
          min="0"
          step="0.01"
          required
          :placeholder="t('Enter semester rate')"
          :error="errors.semester_rate"
          data-testid="room-type-semester-rate"
          name="room-type-semester-rate"
          class="mb-6"
        />

        <!-- Room Type Photos -->
        <div class="mb-6">
          <label class="mb-2 block text-sm font-medium text-gray-900">
            {{ t("Room Type Photos") }} (1-10) <span class="text-red-500">*</span>
          </label>
          <div class="space-y-4">
            <div v-for="(photo, index) in photoFields" :key="index" class="flex items-start gap-2">
              <div class="flex-grow">
                <CFileInput
                  :id="`room-type-photo-${index}`"
                  :label="t('Photo') + ' ' + (index + 1)"
                  :allowedExtensions="['jpg', 'jpeg', 'png', 'webp']"
                  :maxFileSize="5 * 1024 * 1024"
                  :filePath="typeof photo === 'string' ? photo : null"
                  @change="(file) => handlePhotoChange(index, file)"
                />
              </div>
              <CButton
                v-if="photoFields.length > 1"
                type="button"
                class="mt-5 p-2.5"
                @click="removePhotoField(index)"
              >
                <TrashIcon class="h-6 w-5" />
              </CButton>
            </div>
            <CButton
              v-if="photoFields.length < 10"
              type="button"
              size="small"
              @click="addPhotoField"
            >
              <PlusIcon class="mr-1 h-6 w-6" />
              {{ t("Add Photo") }}
            </CButton>
          </div>
          <p v-if="errors.photos" class="mt-1 text-sm text-red-600">
            {{ errors.photos }}
          </p>
        </div>

        <!-- Submit and Cancel Buttons -->
        <div class="flex gap-4">
          <CButton type="submit" :disabled="loading" variant="primary" :loading="loading">
            {{ isEditing ? t("Update") : t("Create") }}
          </CButton>
          <CButton type="button" @click="goBack">
            {{ t("Cancel") }}
          </CButton>
        </div>
      </form>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import { roomTypeService } from "@/services/api";
import CInput from "@/components/CInput.vue";
import CTextarea from "@/components/CTextarea.vue";
import CButton from "@/components/CButton.vue";
import { useSettingsStore } from "@/stores/settings";

import { PaperClipIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";
import CFileInput from "@/components/CFileInput.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const isEditing = computed(() => !!route.params.id);

const form = ref({
  name: "",
  description: "",
  capacity: 1,
  daily_rate: 0,
  semester_rate: 0,
});

const loading = ref(false);
const error = ref("");
const errors = ref<Record<string, string>>({});
const settingsStore = useSettingsStore();
const currencySymbol = computed(() => settingsStore.generalSettings?.currency_symbol || "$");

const photoFields = ref<(File | string | null)[]>([null]);

function addPhotoField() {
  if (photoFields.value.length < 10) {
    photoFields.value.push(null);
  }
}

function removePhotoField(index: number) {
  if (photoFields.value.length > 1) {
    photoFields.value.splice(index, 1);
  } else {
    photoFields.value[0] = null;
  }
}

function handlePhotoChange(index: number, file: File | null) {
  photoFields.value[index] = file;
}

onMounted(async () => {
  await settingsStore.fetchAllSettings();

  if (isEditing.value) {
    await loadRoomType();
  }
});

// Watch for route changes to handle navigation
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && isEditing.value && route.name === "Room Type Form") {
      await loadRoomType();
    }
  },
  { immediate: true }
);

async function loadRoomType() {
  try {
    loading.value = true;
    const response = await roomTypeService.getById(parseInt(route.params.id as string));
    const roomType = response.data;

    form.value = {
      name: roomType.name || "",
      description: roomType.description || "",
      capacity: roomType.capacity || 1,
      daily_rate: roomType.daily_rate || 0,
      semester_rate: roomType.semester_rate || 0,
    };

    if (roomType.photos && Array.isArray(roomType.photos) && roomType.photos.length > 0) {
      photoFields.value = [...roomType.photos];
    } else {
      photoFields.value = [null];
    }
  } catch {
    error.value = t("Failed to load room type");
    // console.error('Error loading room type:', err);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = "";
    errors.value = {};

    // Basic validation
    let hasErrors = false;

    if (!form.value.name.trim()) {
      errors.value.name = t("Name is required");
      hasErrors = true;
    }
    if (form.value.capacity < 1) {
      errors.value.capacity = t("Capacity must be at least 1");
      hasErrors = true;
    }
    if (form.value.daily_rate < 0) {
      errors.value.daily_rate = t("Daily rate must be non-negative");
      hasErrors = true;
    }
    if (form.value.semester_rate < 0) {
      errors.value.semester_rate = t("Semester rate must be non-negative");
      hasErrors = true;
    }

    // At least one photo is mandatory
    const hasPhoto = photoFields.value.some((p) => p !== null);
    if (!hasPhoto) {
      errors.value.photos = t("At least one photo is required");
      hasErrors = true;
    }

    if (hasErrors) {
      loading.value = false;
      return;
    }

    const formData = new FormData();
    formData.append("name", form.value.name);
    formData.append("description", form.value.description || "");
    formData.append("capacity", form.value.capacity.toString());
    formData.append("daily_rate", form.value.daily_rate.toString());
    formData.append("semester_rate", form.value.semester_rate.toString());

    const existingPhotos: string[] = [];
    photoFields.value.forEach((photo) => {
      if (photo instanceof File) {
        formData.append("photos[]", photo);
      } else if (typeof photo === "string") {
        existingPhotos.push(photo);
      }
    });

    if (isEditing.value) {
      formData.append("existing_photos", JSON.stringify(existingPhotos));
      await roomTypeService.update(parseInt(route.params.id as string), formData);
    } else {
      await roomTypeService.create(formData);
    }

    // Redirect back to room types list
    router.push("/room-types");
  } catch (err: any) {
    if (err.response?.data?.errors) {
      // Handle validation errors from API
      Object.keys(err.response.data.errors).forEach((key) => {
        if (Array.isArray(err.response.data.errors[key])) {
          errors.value[key] = err.response.data.errors[key][0]; // Take first error
        } else {
          errors.value[key] = err.response.data.errors[key];
        }
      });
    } else {
      error.value = err.response?.data?.message || t("Failed to save room type");
    }
    // console.error('Error saving room type:', err);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push("/room-types");
}

defineExpose({
  handleSubmit,
  loadRoomType,
  form,
  photoFields,
});
</script>
