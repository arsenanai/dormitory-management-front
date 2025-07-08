<template>
  <Navigation :title="t('Add/Edit Dormitory')">
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

      <!-- Admin Username -->
      <div>
        <CInput
          id="dormitory-admin"
          v-model="dormitory.admin"
          type="text"
          :label="t('Admin Username')"
          placeholder="Enter Admin Username"
          required
        />
      </div>

      <!-- Registered Students -->
      <div>
        <CInput
          id="dormitory-registered"
          v-model="dormitory.registered"
          type="number"
          :label="t('Registered Students')"
          placeholder="Enter Registered Students"
          required
        />
      </div>

      <!-- Free Beds -->
      <div>
        <CInput
          id="dormitory-freeBeds"
          v-model="dormitory.freeBeds"
          type="number"
          :label="t('Free Beds')"
          placeholder="Enter Free Beds"
          required
        />
      </div>

      <!-- Rooms -->
      <div>
        <CInput
          id="dormitory-rooms"
          v-model="dormitory.rooms"
          type="number"
          :label="t('Rooms')"
          placeholder="Enter Number of Rooms"
          required
        />
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex justify-end">
      <CButton
        variant="primary"
        @click="submitDormitory"
        class="w-full lg:w-auto"
      >
        {{ t("Submit") }}
      </CButton>
    </div>
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
import { Dormitory } from "@/models/Dormitory";
import { useDormitoriesStore } from "@/stores/dormitories";
import { useToast } from "@/composables/useToast";
import { dormitoryService } from "@/services/api";

const { t } = useI18n();
const route = useRoute();
const dormitoryStore = useDormitoriesStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const dormitoryId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!dormitoryId.value);

// Dormitory Form Data
const dormitory = ref(new Dormitory());

// Gender Options
const genderOptions: { value: string; name: string }[] = [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
  { value: "mixed", name: t("Mixed") },
];

// Submit Dormitory
const submitDormitory = async (): Promise<void> => {
  try {
    console.log("Dormitory submitted:", dormitory.value);
    
    if (isEditing.value) {
      // await dormitoryService.update(dormitoryId.value!, dormitory.value);
      showSuccess(t("Dormitory updated successfully!"));
    } else {
      // await dormitoryService.create(dormitory.value);
      showSuccess(t("Dormitory created successfully!"));
    }
  } catch (error) {
    showError(t("Failed to save dormitory. Please try again."));
  }
};

// Load dormitory from API if editing
const loadDormitory = async (id: number) => {
  try {
    const response = await dormitoryService.getById(id);
    const dormitoryData = response.data;
    
    // Populate form with API data
    dormitory.value = new Dormitory(
      dormitoryData.name || "",
      dormitoryData.capacity || 0,
      dormitoryData.gender || "",
      dormitoryData.admin || "",
      dormitoryData.registered || 0,
      dormitoryData.freeBeds || 0,
      dormitoryData.rooms || 0
    );
  } catch (error) {
    showError(t("Failed to load dormitory data"));
  }
};

// Populate the form if editing an existing dormitory
watch(
  () => dormitoryStore.selectedDormitory,
  (selectedDormitory: any) => {
    if (selectedDormitory) {
      dormitory.value = new Dormitory(
        selectedDormitory.name || "",
        selectedDormitory.capacity || 0,
        selectedDormitory.gender || "",
        selectedDormitory.admin || "",
        selectedDormitory.registered || 0,
        selectedDormitory.freeBeds || 0,
        selectedDormitory.rooms || 0
      );
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // First try to restore from store
  dormitoryStore.restoreSelectedDormitory();
  
  // If editing and no data in store, load from API
  if (isEditing.value && !dormitoryStore.selectedDormitory) {
    await loadDormitory(dormitoryId.value!);
  }
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
