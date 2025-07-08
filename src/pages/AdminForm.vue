<template>
  <Navigation :title="t('Admin Management')">
    <!-- Form Fields -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Name Field -->
      
        <CInput
          id="admin-name"
          v-model="admin.name"
          type="text"
          :label="t('Name')"
          placeholder="Enter Name"
          required
        />

      <!-- Surname Field -->
        <CInput
          id="admin-surname"
          v-model="admin.surname"
          type="text"
          :label="t('Surname')"
          placeholder="Enter Surname"
          required
        />

      <!-- Dormitory Field -->
        <CSelect
          id="admin-dormitory"
          v-model="admin.dormitory"
          :options="dormitoryOptions"
          :label="t('Dormitory')"
          required
        />

      <!-- Email Field -->
        <CInput
          id="admin-email"
          v-model="admin.email"
          type="email"
          :label="t('E-mail')"
          placeholder="Enter E-mail"
          required
        />

      <!-- Phone Numbers Field -->
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ t("Phone Numbers") }}
        </label>
        <div class="flex flex-col gap-2">
          <div
            v-for="(phone, index) in admin.phoneNumbers"
            :key="index"
            class="flex items-center gap-2"
          >
            <CInput
              :id="'phone-' + index"
              v-model="admin.phoneNumbers[index]"
              type="tel"
              required
            />
            <CButton
              v-if="index === 0 && admin.phoneNumbers.length < maxPhoneNumbers"
              variant="secondary"
              size="sm"
              @click="addPhoneNumber"
              :aria-label="t('Add Phone Number')"
            >
              <PlusIcon class="h-6 w-6" />
            </CButton>
            <CButton
              v-if="admin.phoneNumbers.length > 1"
              variant="danger"
              size="sm"
              @click="removePhoneNumber(index)"
              :aria-label="t('Remove Phone Number')"
            >
              <TrashIcon class="h-6 w-6" />
            </CButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex flex-row items-end justify-end gap-2">
      <CButton variant="primary" @click="submitForm">
        {{ t("Submit") }}
      </CButton>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { Dormitory } from "@/models/Dormitory";
import { useUserStore } from "@/stores/user";
import { userService } from "@/services/api";
import { useToast } from "@/composables/useToast";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";

// i18n
const { t } = useI18n();
const route = useRoute();
const userStore = useUserStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const userId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!userId.value);

// Example dormitory list
const dormitories = [
  new Dormitory("A-BLOCK", 300, "female", "admin1", 267, 33, 75),
  new Dormitory("B-BLOCK", 300, "female", "admin2", 300, 0, 78),
  new Dormitory("C-BLOCK", 293, "male", "admin3", 300, 7, 80),
];

// Dormitory options for select
const dormitoryOptions = dormitories.map((d) => ({
  value: d,
  name: d.name,
}));

// Admin Form Data
const admin = ref({
  name: "",
  surname: "",
  dormitory: dormitoryOptions[0]?.value ?? null,
  email: "",
  phoneNumbers: [""], // Initialize with one empty phone number
});

// Maximum number of phone numbers (from .env)
const maxPhoneNumbers = parseInt(import.meta.env.VITE_MAX_PHONE_NUMBERS || "3");

// Populate the form if editing an existing user
watch(
  () => userStore.selectedUser,
  (selectedUser) => {
    if (selectedUser) {
      // Deep clone to preserve reactivity and structure
      admin.value = JSON.parse(JSON.stringify(selectedUser));
    }
  },
  { immediate: true }
);

// Add a new phone number
const addPhoneNumber = () => {
  if (admin.value.phoneNumbers.length < maxPhoneNumbers) {
    admin.value.phoneNumbers.push("");
  }
};

// Remove a phone number
const removePhoneNumber = (index: number) => {
  if (admin.value.phoneNumbers.length > 1) {
    admin.value.phoneNumbers.splice(index, 1);
  }
};

// Submit the form
const submitForm = (): void => {
  if (admin.value.phoneNumbers.length === 0) {
    showError(t("At least one phone number is required."));
    return;
  }
  console.log("Admin submitted:", admin.value);
  showSuccess(t("Admin data submitted successfully!"));
  // Add logic to save or update admin data
};

// Load user from API if editing
const loadUser = async (id: number) => {
  try {
    const response = await userService.getById(id);
    const userData = response.data;
    
    // Populate form with API data
    admin.value = {
      name: userData.name || userData.first_name || "",
      surname: userData.surname || userData.last_name || "",
      dormitory: dormitoryOptions.find(d => d.value.name === userData.dormitory?.name) || dormitoryOptions[0]?.value || null,
      email: userData.email || "",
      phoneNumbers: userData.phone_numbers?.length ? [...userData.phone_numbers] : [""],
    };
    showSuccess(t("Admin data loaded successfully"));
  } catch (error) {
    console.error('Failed to load user:', error);
    showError(t("Failed to load admin data"));
  }
};

onMounted(async () => {
  // First try to restore from store
  userStore.restoreSelectedUser();
  
  // If editing and no data in store, load from API
  if (isEditing.value && !userStore.selectedUser) {
    await loadUser(userId.value!);
  }
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>