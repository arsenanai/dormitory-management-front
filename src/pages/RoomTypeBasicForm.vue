<template>
  <Navigation :title="isEditing ? t('Edit Room Type') : t('Add Room Type')">
    <form @submit.prevent="handleSubmit" class="max-w-2xl mx-auto">
      <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
        {{ error }}
      </div>

      <!-- Room Type Name -->
      <div class="mb-4">
        <label for="room-type-name" class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Room Type Name') }} *
        </label>
        <input
          id="room-type-name"
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          :placeholder="t('Enter room type name')"
        />
        <div v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</div>
      </div>

      <!-- Room Type Description -->
      <div class="mb-4">
        <label for="room-type-description" class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Room Type Description') }} *
        </label>
        <textarea
          id="room-type-description"
          v-model="form.description"
          required
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          :placeholder="t('Enter room type description')"
        ></textarea>
        <div v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</div>
      </div>

      <!-- Room Type Capacity -->
      <div class="mb-4">
        <label for="room-type-capacity" class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Room Type Capacity') }} *
        </label>
        <input
          id="room-type-capacity"
          v-model="form.capacity"
          type="number"
          min="1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          :placeholder="t('Enter room capacity')"
        />
        <div v-if="errors.capacity" class="mt-1 text-sm text-red-600">{{ errors.capacity }}</div>
      </div>

      <!-- Room Type Price -->
      <div class="mb-6">
        <label for="room-type-price" class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Room Type Price') }} *
        </label>
        <input
          id="room-type-price"
          v-model="form.price"
          type="number"
          min="0"
          step="0.01"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          :placeholder="t('Enter room price')"
        />
        <div v-if="errors.price" class="mt-1 text-sm text-red-600">{{ errors.price }}</div>
      </div>

      <!-- Submit and Cancel Buttons -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <span v-if="loading">{{ t('Saving...') }}</span>
          <span v-else>{{ isEditing ? t('Update') : t('Create') }}</span>
        </button>
        <button
          type="button"
          @click="goBack"
          class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {{ t('Cancel') }}
        </button>
      </div>
    </form>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Navigation from '@/components/CNavigation.vue';
import { roomTypeService } from '@/services/api';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const isEditing = computed(() => !!route.params.id);

const form = ref({
  name: '',
  description: '',
  capacity: 1,
  price: 0
});

const loading = ref(false);
const error = ref('');
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  if (isEditing.value) {
    await loadRoomType();
  }
});

async function loadRoomType() {
  try {
    loading.value = true;
    const response = await roomTypeService.get(parseInt(route.params.id as string));
    const roomType = response.data;
    
    form.value = {
      name: roomType.name || '',
      description: roomType.description || '',
      capacity: roomType.capacity || 1,
      price: roomType.price || 0
    };
  } catch (err) {
    error.value = t('Failed to load room type');
    console.error('Error loading room type:', err);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';
    errors.value = {};

    // Basic validation
    if (!form.value.name.trim()) {
      errors.value.name = t('Name is required');
      return;
    }
    if (!form.value.description.trim()) {
      errors.value.description = t('Description is required');
      return;
    }
    if (form.value.capacity < 1) {
      errors.value.capacity = t('Capacity must be at least 1');
      return;
    }
    if (form.value.price < 0) {
      errors.value.price = t('Price must be non-negative');
      return;
    }

    if (isEditing.value) {
      await roomTypeService.update(parseInt(route.params.id as string), form.value);
    } else {
      await roomTypeService.create(form.value);
    }

    // Redirect back to room types list
    router.push('/room-types');
  } catch (err: any) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors;
    } else {
      error.value = err.response?.data?.message || t('Failed to save room type');
    }
    console.error('Error saving room type:', err);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/room-types');
}
</script>
