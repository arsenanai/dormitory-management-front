<template>
  <Navigation :title="isEditing ? t('Edit Dormitory') : t('Add Dormitory')">
    <form @submit.prevent="submitDormitory" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            placeholder="Select Gender"
            required
          />
        </div>

        <!-- Admin -->
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

        <!-- Room Selection -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('Rooms') }}
          </label>
          <div class="space-y-3">
            <!-- Existing Rooms -->
            <div v-for="(room, index) in dormitory.rooms" :key="index" class="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md">
              <CSelect
                :id="`room-${index}`"
                v-model="room.id"
                :options="roomOptions"
                :label="t('Room')"
                placeholder="Select a Room"
                required
                class="flex-1"
              />
              <CButton
                variant="danger"
                size="sm"
                @click="removeRoom(index)"
                class="shrink-0"
              >
                {{ t('Remove') }}
              </CButton>
            </div>
            
            <!-- Add Room Button -->
            <CButton
              variant="secondary"
              @click="addRoom"
              class="w-full"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              {{ t('Add Room') }}
            </CButton>
          </div>
        </div>

        <!-- Computed Fields (Display-Only) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('Student Capacity') }}
          </label>
          <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <span class="text-gray-900 dark:text-gray-100">{{ calculatedCapacity }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ t('Calculated from rooms') }})</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('Registered Students') }}
          </label>
          <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <span class="text-gray-900 dark:text-gray-100">{{ calculatedRegisteredStudents }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ t('Calculated automatically') }})</span>
          </div>
        </div>

        <!-- Free Beds -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('Free Beds') }}
          </label>
          <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <span class="text-gray-900 dark:text-gray-100">{{ calculatedFreeBeds }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ t('Calculated automatically') }})</span>
          </div>
        </div>

        <!-- Rooms Count -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('Rooms Count') }}
          </label>
          <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <span class="text-gray-900 dark:text-gray-100">{{ calculatedRoomsCount }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ t('Calculated automatically') }})</span>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-end">
        <CButton
          type="submit"
          variant="primary"
          :disabled="loading"
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
import PlusIcon from "@heroicons/vue/24/outline/PlusIcon";

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
    console.log('Loading admin options...');
    const response = await adminService.getAll();
    console.log('Admin API response:', response);
    
    let admins = [];
    
    // Handle different response structures
    if (response.data && response.data.data) {
      // Paginated response
      admins = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Direct array response
      admins = response.data;
    } else if (Array.isArray(response)) {
      // Direct response
      admins = response;
    }
    
    console.log('Extracted admins:', admins);
    
    // Map admins to options format
    adminOptions.value = admins.map((admin: any) => ({
      value: admin.id,
      name: admin.name || admin.email || `Admin ${admin.id}`,
    }));
    
    console.log('Admin options set:', adminOptions.value);
  } catch (error) {
    console.error('Failed to load admins:', error);
    showError(t("Failed to load admin options"));
    
    // Fallback to mock data if API fails
    adminOptions.value = [
      { value: 1, name: "System Administrator" },
      { value: 2, name: "Admin User" },
    ];
  }
};

// Submit Dormitory
const submitDormitory = async (): Promise<void> => {
  // Prevent multiple submissions
  if (isSubmitting.value) {
    return;
  }

  // Set loading state to prevent multiple submissions
  isSubmitting.value = true;
  loading.value = true;

  try {
    // Use the Dormitory class method to get only updatable fields
    const dormitoryData = dormitory.value.toSubmissionData();
    
    if (isEditing.value) {
      console.log('Updating dormitory with ID:', dormitoryId.value);
      const response = await dormitoryService.update(dormitoryId.value!, dormitoryData);
      showSuccess(t("Dormitory updated successfully"));
    } else {
      console.log('Creating new dormitory');
      const response = await dormitoryService.create(dormitoryData);
      showSuccess(t("Dormitory created successfully"));
    }
    
    // Redirect to dormitories list
    router.push('/dormitories');
  } catch (error) {
    console.error('Error submitting dormitory:', error);
    showError(t("Failed to submit dormitory"));
  } finally {
    isSubmitting.value = false;
    loading.value = false;
  }
};

// Load dormitory data from API
const loadDormitory = async (id: number) => {
  try {
    console.log('Loading dormitory data from API for ID:', id);
    const response = await dormitoryService.getById(id);
    
    if (response.data) {
      const dormitoryData = response.data;
      console.log('Loaded dormitory data from API:', dormitoryData);
      
      // Extract admin_id from the admin object if it exists
      let adminId = dormitoryData.admin_id;
      if (dormitoryData.admin && dormitoryData.admin.id) {
        adminId = dormitoryData.admin.id;
        console.log('Extracted admin_id:', adminId);
      }
      
      // Create new Dormitory instance with the loaded data
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
        dormitoryData.registered || 0,
        dormitoryData.freeBeds || 0,
        dormitoryData.rooms_count || 0,
        dormitoryData.rooms || []
      );
      
      console.log('Populated dormitory form with fresh data:', dormitory.value);
    }
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
        // Computed fields should be 0 for form display (they're calculated by backend)
        0, // registered
        0, // freeBeds
        0, // rooms_count
        selectedDormitory.rooms || [] // Include rooms array
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
  // Load admin options first
  await loadAdmins();
  
  // Load room options
  await loadRoomOptions();
  
  // If editing, always load fresh data from API (don't rely on store)
  if (isEditing.value && dormitoryId.value) {
    console.log('Loading fresh dormitory data from API for ID:', dormitoryId.value);
    await loadDormitory(dormitoryId.value);
  } else {
    // Only restore from store for new dormitory creation
    dormitoryStore.restoreSelectedDormitory();
  }
});

// Computed properties for display-only fields
const calculatedCapacity = computed(() => dormitory.value.calculateTotalCapacity());
const calculatedRegisteredStudents = computed(() => dormitory.value.calculateRegisteredStudents());
const calculatedFreeBeds = computed(() => dormitory.value.calculateFreeBeds());
const calculatedRoomsCount = computed(() => dormitory.value.calculateTotalRooms());

// Room options for the new room selection
const roomOptions = ref<{ value: number; name: string }[]>([]);

// Load room options from API
const loadRoomOptions = async () => {
  try {
    console.log('Loading room options...');
    
    // Try to get rooms from the room service if available
    if (window.roomService) {
      const response = await window.roomService.getAll();
      if (response.data && response.data.data) {
        roomOptions.value = response.data.data.map((room: any) => ({
          value: room.id,
          name: room.name || room.number || `Room ${room.id}`,
        }));
      } else if (response.data && Array.isArray(response.data)) {
        roomOptions.value = response.data.map((room: any) => ({
          value: room.id,
          name: room.name || room.number || `Room ${room.id}`,
        }));
      }
    } else {
      // Fallback to mock data if room service is not available
      roomOptions.value = [
        { value: 1, name: "Room 101" },
        { value: 2, name: "Room 102" },
        { value: 3, name: "Room 103" },
        { value: 4, name: "Room 201" },
        { value: 5, name: "Room 202" },
        { value: 6, name: "Room 301" },
        { value: 7, name: "Room 302" },
        { value: 8, name: "Room 401" },
        { value: 9, name: "Room 402" },
        { value: 10, name: "Room 501" },
      ];
    }
    
    console.log('Room options loaded:', roomOptions.value.length, 'rooms');
  } catch (error) {
    console.error('Failed to load room options:', error);
    showError(t("Failed to load room options"));
    
    // Fallback to mock data if API fails
    roomOptions.value = [
      { value: 1, name: "Room 101" },
      { value: 2, name: "Room 102" },
      { value: 3, name: "Room 103" },
      { value: 4, name: "Room 201" },
      { value: 5, name: "Room 202" },
    ];
  }
};

// Add a new room to the dormitory
const addRoom = () => {
  // Create a new room object with the correct structure
  const newRoom = {
    id: null,
    name: "",
    number: "",
    floor: 1,
    capacity: 2,
    room_type_id: null,
    dormitory_id: null,
    notes: "",
    beds: []
  };
  dormitory.value.rooms.push(newRoom);
  console.log('Added new room, total rooms:', dormitory.value.rooms.length);
};

// Remove a room from the dormitory
const removeRoom = (index: number) => {
  dormitory.value.rooms.splice(index, 1);
};

// Watch for changes in rooms to update computed fields
watch(
  () => dormitory.value.rooms,
  () => {
    // Re-calculate and update computed fields whenever rooms change
    // This ensures they are always up-to-date with the current room data
    // The dormitory.value.toSubmissionData() will include these computed values
  },
  { deep: true }
);
</script>

<style scoped>
/* Add custom styles if needed */
</style>
