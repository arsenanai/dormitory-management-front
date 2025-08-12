<template>
  <Navigation :title="isEditing ? t('Edit Dormitory') : t('Add Dormitory')">
    <!-- Debug Info -->
    <div style="background: yellow; color: black; padding: 10px; margin: 10px; border: 2px solid red;">
      <strong>DEBUG:</strong> Route: {{ route.path }}, Params: {{ route.params }}, ID: {{ dormitoryId }}, isEditing: {{ isEditing }}
    </div>
    
    <form @submit.prevent="submitDormitory">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Dormitory Name -->
        <div>
          <CInput
            id="dormitory-name"
            v-model="dormitory.name"
            type="text"
            :label="t('Dormitory Name')"
            placeholder="Enter Dormitory Name"
            required
          />
        </div>

        <!-- Capacity -->
        <div>
          <CInput
            id="dormitory-capacity"
            v-model="dormitory.capacity"
            type="number"
            :label="t('Capacity')"
            placeholder="Enter Capacity"
            required
          />
        </div>

        <!-- Gender -->
        <div>
          <CSelect
            id="dormitory-gender"
            v-model="dormitory.gender"
            :options="genderOptions"
            :label="t('Gender')"
            required
          />
        </div>

        <!-- Admin Selection -->
        <div>
          <CSelect
            id="dormitory-admin"
            v-model="dormitory.admin_id"
            :options="adminOptions"
            :label="t('Admin')"
            placeholder="Select an Admin"
            required
          />
        </div>

        <!-- Address -->
        <div>
          <CInput
            id="dormitory-address"
            v-model="dormitory.address"
            type="text"
            :label="t('Address')"
            placeholder="Enter Address"
          />
        </div>

        <!-- Description -->
        <div>
          <CInput
            id="dormitory-description"
            v-model="dormitory.description"
            type="text"
            :label="t('Description')"
            placeholder="Enter Description"
          />
        </div>

        <!-- Quota -->
        <div>
          <CInput
            id="dormitory-quota"
            v-model="dormitory.quota"
            type="number"
            :label="t('Quota')"
            placeholder="Enter Quota"
          />
        </div>

        <!-- Phone -->
        <div>
          <CInput
            id="dormitory-phone"
            v-model="dormitory.phone"
            type="text"
            :label="t('Phone')"
            placeholder="Enter Phone Number"
          />
        </div>

        <!-- Computed Fields (Display-Only) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('Registered Students') }}
          </label>
          <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <span class="text-gray-900 dark:text-gray-100">{{ dormitory.registered }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ t('Calculated automatically') }})</span>
          </div>
        </div>

        <!-- Free Beds -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('Free Beds') }}
          </label>
          <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <span class="text-gray-900 dark:text-gray-100">{{ dormitory.freeBeds }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ t('Calculated automatically') }})</span>
          </div>
        </div>

        <!-- Rooms Count -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('Rooms Count') }}
          </label>
          <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <span class="text-gray-900 dark:text-gray-100">{{ dormitory.rooms_count }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ t('Calculated automatically') }})</span>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-end">
        <CButton
          variant="primary"
          :disabled="loading"
          @click="submitDormitory"
          @click.prevent="submitDormitory"
          class="w-full lg:w-auto"
        >
          {{ loading ? t("Submitting...") : t("Submit") }}
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
import { Dormitory } from "@/models/Dormitory";
import { useDormitoriesStore } from "@/stores/dormitories";
import { useToast } from "@/composables/useToast";
import { dormitoryService, adminService } from "@/services/api";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const dormitoryStore = useDormitoriesStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const dormitoryId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => {
  // Force check if we're in edit mode by looking at the route path
  const hasIdInPath = route.path.includes('/dormitory-form/') && route.path.split('/').length > 2;
  const hasIdInParams = !!dormitoryId.value;
  console.log('isEditing computed:', { hasIdInPath, hasIdInParams, routePath: route.path, routeParams: route.params });
  return hasIdInPath || hasIdInParams;
});

// Dormitory Form Data
const dormitory = ref(new Dormitory());

// Form submission state
const isSubmitting = ref(false);
const loading = ref(false);

// Gender Options
const genderOptions: { value: string; name: string }[] = [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
  { value: "mixed", name: t("Mixed") },
];

// Admin Options
const adminOptions = ref<{ value: number; name: string }[]>([]);

// Load admins from API
const loadAdmins = async () => {
  try {
    const response = await adminService.getAll();
    if (response.data && response.data.data) {
      // Handle paginated response
      adminOptions.value = response.data.data.map((admin: any) => ({
        value: admin.id,
        name: admin.name || admin.email || `Admin ${admin.id}`,
      }));
    } else if (Array.isArray(response.data)) {
      // Handle direct array response
      adminOptions.value = response.data.map((admin: any) => ({
        value: admin.id,
        name: admin.name || admin.email || `Admin ${admin.id}`,
      }));
    }
  } catch (error) {
    console.error('Failed to load admins:', error);
    showError(t("Failed to load admin options"));
  }
};

// Submit Dormitory
const submitDormitory = async (): Promise<void> => {
  console.log('=== submitDormitory FUNCTION CALLED ===');
  
  // Prevent multiple submissions
  if (isSubmitting.value) {
    console.log('Form submission already in progress, ignoring duplicate click');
    return;
  }

  // Set loading state to prevent multiple submissions
  isSubmitting.value = true;
  loading.value = true;

  try {
    console.log("Dormitory submitted:", dormitory.value);
    
    // Prepare the data for submission - only include STORED fields (not computed fields)
    const dormitoryData = {
      name: dormitory.value.name,
      capacity: dormitory.value.capacity,
      gender: dormitory.value.gender,
      admin_id: dormitory.value.admin_id !== null && dormitory.value.admin_id !== undefined ? Number(dormitory.value.admin_id) : null,
      address: dormitory.value.address || null,
      description: dormitory.value.description || null,
      quota: dormitory.value.quota || null,
      phone: dormitory.value.phone || null,
    };
    
    console.log('Complete dormitory data being submitted:', dormitoryData);
    console.log('Form values before submission:', {
      name: dormitory.value.name,
      capacity: dormitory.value.capacity,
      gender: dormitory.value.gender,
      admin_id: dormitory.value.admin_id,
      address: dormitory.value.address,
      description: dormitory.value.description,
      quota: dormitory.value.quota,
      phone: dormitory.value.phone,
      // Computed fields (read-only)
      registered: dormitory.value.registered,
      freeBeds: dormitory.value.freeBeds,
      rooms_count: dormitory.value.rooms_count
    });
    
    console.log('Submitting dormitory data:', dormitoryData);
    
    if (isEditing.value) {
      console.log('=== EXECUTING UPDATE BRANCH ===');
      console.log('About to call dormitoryService.update with:', { id: dormitoryId.value, data: dormitoryData });
      const response = await dormitoryService.update(dormitoryId.value!, dormitoryData);
      console.log('dormitoryService.update completed successfully', response);
      showSuccess(t("Dormitory updated successfully!"));
      // Clear the selected dormitory from store to force fresh data load
      dormitoryStore.clearSelectedDormitory();
      // Dispatch a custom event to notify other components to refresh
      window.dispatchEvent(new CustomEvent('dormitory-updated'));
      // Force browser to clear any cached data for this dormitory
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            await cache.delete(`/api/dormitories/${dormitoryId.value}`);
          }
        } catch (e) {
          console.log('Cache clearing failed:', e);
        }
      }
      // Wait a moment for the success message to be visible
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('=== EXECUTING CREATE BRANCH ===');
      const response = await dormitoryService.create(dormitoryData);
      console.log('dormitoryService.create completed successfully', response);
      showSuccess(t("Dormitory created successfully!"));
      // Dispatch a custom event to notify other components to refresh
      window.dispatchEvent(new CustomEvent('dormitory-created'));
      // Wait a moment for the success message to be visible
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    router.push('/dormitories');
  } catch (error) {
    console.error('Error submitting dormitory:', error);
    showError(t("Failed to save dormitory. Please try again."));
  } finally {
    // Reset submission flags
    isSubmitting.value = false;
    loading.value = false;
  }
};

// Load dormitory from API if editing
const loadDormitory = async (id: number) => {
  try {
    console.log('=== LOADING DORMITORY DATA ===');
    console.log('Loading dormitory with ID:', id);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Cache-busting parameter added to request');
    
    const response = await dormitoryService.getById(id);
    const dormitoryData = response.data;
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    console.log('Loaded dormitory data from API:', dormitoryData);
    
    // Extract admin_id from the data - it might be in different places
    let adminId = null;
    if (dormitoryData.admin_id !== null && dormitoryData.admin_id !== undefined) {
      adminId = Number(dormitoryData.admin_id);
    } else if (dormitoryData.admin && dormitoryData.admin.id) {
      adminId = Number(dormitoryData.admin.id);
    }
    
    console.log('Extracted admin_id:', adminId);
    console.log('Admin data:', dormitoryData.admin);
    
    // Ensure admin options are loaded before setting dormitory data
    if (adminOptions.value.length === 0) {
      console.log('Admin options not loaded yet, loading now...');
      await loadAdmins();
    }
    
    // Populate form with API data - ensure all fields are properly mapped
    dormitory.value = new Dormitory(
      dormitoryData.name || "",
      dormitoryData.capacity || 0,
      dormitoryData.gender || "",
      dormitoryData.admin?.name || dormitoryData.admin || "",
      adminId,
      dormitoryData.address || "",
      dormitoryData.description || "",
      dormitoryData.quota || 0,
      dormitoryData.phone || "",
      // Computed fields (read-only)
      dormitoryData.registered || 0,
      dormitoryData.freeBeds || 0,
      dormitoryData.rooms_count || 0
    );
    
    console.log('Populated dormitory form with fresh data:', dormitory.value);
    console.log('Admin options available:', adminOptions.value.length);
    
    // Set the selected dormitory in store for consistency
    dormitoryStore.setSelectedDormitory(dormitory.value);
    
  } catch (error) {
    console.error('Error loading dormitory:', error);
    showError(t("Failed to load dormitory data"));
  }
};

// Populate the form if editing an existing dormitory
// Only restore from store if we're NOT editing (i.e., creating new dormitory)
watch(
  () => dormitoryStore.selectedDormitory,
  (selectedDormitory: any) => {
    if (selectedDormitory && !isEditing.value) {
      // Only update if we don't already have admin_id set (to avoid overriding from API)
      const currentAdminId = dormitory.value.admin_id;
      dormitory.value = new Dormitory(
        selectedDormitory.name || "",
        selectedDormitory.capacity || 0,
        selectedDormitory.gender || "",
        selectedDormitory.admin || "",
        currentAdminId !== null && currentAdminId !== undefined ? currentAdminId : (selectedDormitory.admin_id || null),
        selectedDormitory.address || "",
        selectedDormitory.description || "",
        selectedDormitory.quota || 0,
        selectedDormitory.phone || "",
        // Computed fields (read-only)
        selectedDormitory.registered || 0,
        selectedDormitory.freeBeds || 0,
        selectedDormitory.rooms_count || 0
      );
    }
  },
  { immediate: true }
);

// Watch for route changes to handle direct navigation to edit URLs
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && isEditing.value) {
      console.log('Route ID changed, loading fresh dormitory data for ID:', newId);
      await loadDormitory(Number(newId));
    }
  },
  { immediate: true }
);

// Watch for route path changes to handle navigation
watch(
  () => route.path,
  async (newPath) => {
    if (newPath.includes('/dormitory-form/') && isEditing.value && dormitoryId.value) {
      console.log('Route path changed, reloading dormitory data for ID:', dormitoryId.value);
      // Force fresh data load by clearing any cached data
      dormitoryStore.clearSelectedDormitory();
      await loadDormitory(dormitoryId.value);
    }
  }
);

onMounted(async () => {
  // Debug logging for route params
  console.log('=== DORMITORY FORM MOUNTED ===');
  console.log('Route params:', route.params);
  console.log('Dormitory ID:', dormitoryId.value);
  console.log('Is Editing:', isEditing.value);
  console.log('Current route path:', route.path);
  
  // Load admin options first
  await loadAdmins();
  
  // If editing, always load fresh data from API (don't rely on store)
  if (isEditing.value && dormitoryId.value) {
    console.log('Loading fresh dormitory data from API for ID:', dormitoryId.value);
    await loadDormitory(dormitoryId.value);
  } else {
    // Only restore from store for new dormitory creation
    dormitoryStore.restoreSelectedDormitory();
  }
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
