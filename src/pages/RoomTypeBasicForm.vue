<template>
  <Navigation :title="isEditing ? t('Edit Room Type') : t('Add Room Type')">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6" data-testid="form-title">
        {{ isEditing ? t('Edit Room Type') : t('Add Room Type') }}
      </h1>
      
      <form name="room-type-form" @submit.prevent="handleSubmit">
        <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
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
          :error="errors.capacity"
          class="mb-4"
        />

        <!-- Room Type Price -->
        <CInput
          id="room-type-price"
          v-model="form.price"
          type="number"
          :label="t('Room Type Price') + ` (${currencySymbol})`"
          min="0"
          step="0.01"
          required
          :placeholder="t('Enter room price')"
          :error="errors.price"
          class="mb-6"
        />

        <!-- Submit and Cancel Buttons -->
        <div class="flex gap-4">
          <CButton
          type="submit"
          :disabled="loading"
          variant="primary"
          :loading="loading"
          >
            {{ isEditing ? t('Update') : t('Create') }}
          </CButton>
          <CButton
            type="button"
            @click="goBack"
          >
            {{ t('Cancel') }}
          </CButton>
        </div>
      </form>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Navigation from '@/components/CNavigation.vue'; 
import { roomTypeService, configurationService } from '@/services/api';
import CInput from '@/components/CInput.vue';
import CTextarea from '@/components/CTextarea.vue';
import CButton from '@/components/CButton.vue';

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
const currencySymbol = ref('USD');

onMounted(async () => {
  try {
    const currencyResponse = await configurationService.getCurrency();
    currencySymbol.value = currencyResponse.data.currency_symbol || 'USD';
  } catch (e) {
    console.error("Failed to load currency symbol", e);
  }
  if (isEditing.value) {
    await loadRoomType();
  }
});

// Watch for route changes to handle navigation
watch(() => route.params.id, async (newId) => {
  if (newId && isEditing.value && route.name === 'Room Type Basic Form') {
    await loadRoomType();
  }
}, { immediate: true });

async function loadRoomType() {
  try {
    loading.value = true;    
    const response = await roomTypeService.getById(parseInt(route.params.id as string));
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
    let hasErrors = false;
    
    if (!form.value.name.trim()) {
      errors.value.name = t('Name is required');
      hasErrors = true;
    }
    if (form.value.capacity < 1) {
      errors.value.capacity = t('Capacity must be at least 1'); // This validation is now client-side only
      hasErrors = true;
    }
    if (form.value.price < 0) {
      errors.value.price = t('Price must be non-negative');
      hasErrors = true;
    }
    
    if (hasErrors) {
      loading.value = false;
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
      // Handle validation errors from API
      Object.keys(err.response.data.errors).forEach(key => {
        if (Array.isArray(err.response.data.errors[key])) {
          errors.value[key] = err.response.data.errors[key][0]; // Take first error
        } else {
          errors.value[key] = err.response.data.errors[key];
        }
      });
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
