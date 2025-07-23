<template>
  <Navigation :title="t('Admin Management')">
    <!-- Form Fields -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Name Field -->
      <CInput
        id="admin-name"
        v-model="admin.name"
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

      <!-- Password Fields (only when adding) -->
      <template v-if="!isEditing">
        <CInput
          id="admin-password"
          v-model="admin.password"
          type="password"
          :label="t('Password')"
          placeholder="Enter Password"
          required
        />
        <CInput
          id="admin-confirm-password"
          v-model="admin.confirmPassword"
          type="password"
          :label="t('Confirm Password')"
          placeholder="Confirm Password"
          required
        />
      </template>

      <!-- Phone Number Field -->
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ t("Phone Number") }}
        </label>
        <div class="flex items-center gap-2">
          <CInput
            id="admin-phone"
            v-model="admin.phoneNumbers[0]"
            type="tel"
            placeholder="Enter Phone Number"
            required
          />
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex flex-row items-end justify-end gap-2">
      <CButton v-if="isEditing" type="default" variant="secondary" @click="showPasswordForm = !showPasswordForm">
        {{ t("Change Password") }}
      </CButton>
      <CButton type="submit" variant="primary" @click="submitForm">
        {{ t("Submit") }}
      </CButton>
    </div>

    <!-- Password Change Section -->
    <div v-if="showPasswordForm" class="mt-6 border-t pt-6">
      <h3 class="text-lg font-semibold mb-4">{{ t("Change Password") }}</h3>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CInput
          id="current-password"
          v-model="passwordData.current_password"
          type="password"
          :label="t('Current Password')"
          placeholder="Enter current password"
          required
        />
        <div></div>
        <CInput
          id="new-password"
          v-model="passwordData.password"
          type="password"
          :label="t('New Password')"
          placeholder="Enter new password"
          required
        />
        <CInput
          id="confirm-password"
          v-model="passwordData.password_confirmation"
          type="password"
          :label="t('Confirm New Password')"
          placeholder="Confirm new password"
          required
        />
      </div>
      <div class="mt-4 flex gap-2">
        <CButton type="button" variant="primary" @click="changePassword">
          {{ t("Update Password") }}
        </CButton>
        <CButton type="button" variant="secondary" @click="cancelPasswordChange">
          {{ t("Cancel") }}
        </CButton>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { Dormitory } from "@/models/Dormitory";
import { useUserStore } from "@/stores/user";
import { adminService, dormitoryService, userService, authService } from "@/services/api";
import { useToast } from "@/composables/useToast";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";

// i18n
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const userId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!userId.value);

// Dormitories loaded from API
const dormitories = ref([]);
const dormitoryOptions = computed(() => 
  dormitories.value.map((d: any) => ({
    value: d.id,
    name: d.name,
  }))
);

// Admin Form Data
const admin = ref({
  name: "",
  surname: "",
  dormitory: null, // Will store dormitory ID
  email: "",
  phoneNumbers: [""], // Initialize with one empty phone number
  password: "", // Added for new admin
  confirmPassword: "", // Added for new admin
});

// Password change form
const showPasswordForm = ref(false);
const passwordData = ref({
  current_password: "",
  password: "",
  password_confirmation: "",
});

// Maximum number of phone numbers (from .env)
const maxPhoneNumbers = parseInt(import.meta.env.VITE_MAX_PHONE_NUMBERS || "3");

// Combine phone number parts into single phone number
const combinePhoneNumber = (phoneArray: string[]): string => {
  if (!phoneArray || phoneArray.length === 0) return '';
  return phoneArray.join('');
};

// Split combined phone number into parts for display
const splitPhoneNumber = (phoneNumber: string): string[] => {
  // For now, just return as single entry
  return phoneNumber ? [phoneNumber] : [''];
};

// Submit the form
const submitForm = async (): Promise<void> => {
  if (admin.value.phoneNumbers.length === 0) {
    showError(t("At least one phone number is required."));
    return;
  }
  
  try {
    console.log("Admin submitted:", admin.value);
    
    // Map form data to API format
    const profileData = {
      name: admin.value.name + ' ' + admin.value.surname,
      email: admin.value.email,
      password: admin.value.password,
      password_confirmation: admin.value.confirmPassword,
      gender: 'male', // set a default or add a field to the form
    };

    // Use authService to update profile for current user
    if (isEditing.value) {
      await authService.updateProfile(profileData);
      showSuccess(t("Admin profile updated successfully!"));
    } else {
      await adminService.create(profileData);
      showSuccess(t("Admin created successfully!"));
      router.push('/admins');
    }
  } catch (error: any) {
    console.error('Profile update failed:', error);
    showError(error.response?.data?.message || t("Failed to save admin data"));
  }
};

// Password change functions
const changePassword = async (): Promise<void> => {
  if (!passwordData.value.current_password || !passwordData.value.password || !passwordData.value.password_confirmation) {
    showError(t("All password fields are required."));
    return;
  }
  
  if (passwordData.value.password !== passwordData.value.password_confirmation) {
    showError(t("New passwords do not match."));
    return;
  }
  
  if (passwordData.value.password.length < 6) {
    showError(t("Password must be at least 6 characters long."));
    return;
  }
  
  try {
    await authService.changePassword(passwordData.value);
    showSuccess(t("Password updated successfully!"));
    cancelPasswordChange();
  } catch (error: any) {
    console.error('Password change failed:', error);
    showError(error.response?.data?.message || t("Failed to change password"));
  }
};

const cancelPasswordChange = (): void => {
  showPasswordForm.value = false;
  passwordData.value = {
    current_password: "",
    password: "",
    password_confirmation: "",
  };
};

// Populate the form if editing an existing user
watch(
  () => userStore.selectedUser,
  (selectedUser) => {
    if (selectedUser) {
      // Deep clone to preserve reactivity and structure
      const userData = JSON.parse(JSON.stringify(selectedUser));
      admin.value = {
        name: userData.first_name || userData.name || "",
        surname: userData.last_name || userData.surname || "",
        dormitory: userData.dormitory_id || userData.dormitory?.id || null,
        email: userData.email || "",
        phoneNumbers: userData.phone_numbers?.length ? [combinePhoneNumber(userData.phone_numbers)] : [""],
      };
    }
  },
  { immediate: true }
);

// Load user from API if editing
const loadUser = async (id: number) => {
  try {
    // Use profile endpoint for current user's own data to avoid permission issues
    const response = await authService.getProfile();
    const userData = response.data;
    
    console.log('Profile API response:', userData);
    
    // Populate form with API data, properly mapping fields
    admin.value = {
      name: userData.first_name || userData.name || "",
      surname: userData.last_name || userData.surname || "",
      dormitory: userData.dormitory_id || userData.dormitory?.id || null,
      email: userData.email || "",
      phoneNumbers: userData.phone_numbers?.length ? [combinePhoneNumber(userData.phone_numbers)] : userData.phone ? [userData.phone] : [""],
    };
    
    console.log('Admin form data after loading:', admin.value);
    
    showSuccess(t("Admin data loaded successfully"));
  } catch (error) {
    console.error('Failed to load user:', error);
    showError(t("Failed to load admin data"));
  }
};

onMounted(async () => {
  // Load dormitories first
  try {
    const response = await dormitoryService.getAll();
    dormitories.value = response.data;
  } catch (error) {
    console.error('Failed to load dormitories:', error);
    showError(t("Failed to load dormitories"));
  }

  // First try to restore from store
  userStore.restoreSelectedUser();
  
  // If editing and no data in store, load from API
  if (isEditing.value && !userStore.selectedUser) {
    await loadUser(userId.value!);
  }
});

// Export for testing
defineExpose({
  combinePhoneNumber,
  splitPhoneNumber,
  submitForm,
  loadUser,
  admin
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>