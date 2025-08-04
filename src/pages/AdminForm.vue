<template>
  <Navigation :title="t('Admin Management')">
    <!-- Form Fields -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Name Field -->
      <CInput
        id="admin-name"
        v-model="user.name"
        :label="t('Name')"
        placeholder="Enter Name"
        required
      />

      <!-- Surname Field -->
      <CInput
        id="admin-surname"
        v-model="user.surname"
        type="text"
        :label="t('Surname')"
        placeholder="Enter Surname"
        required
      />

      <!-- Dormitory Field - Only show for super admins editing other users -->
      <CSelect
        v-if="!isEditingOwnProfile"
        id="admin-dormitory"
        v-model="user.dormitory"
        :options="dormitoryOptions"
        :label="t('Dormitory')"
        placeholder="Select a dormitory"
        required
      />

      <!-- Email Field -->
      <CInput
        id="admin-email"
        v-model="user.email"
        type="email"
        :label="t('E-mail')"
        placeholder="Enter E-mail"
        required
      />

      <!-- Password Fields (only when adding) -->
      <template v-if="!isEditing">
        <CInput
          id="admin-password"
          v-model="user.password"
          type="password"
          :label="t('Password')"
          placeholder="Enter Password"
          required
        />
        <CInput
          id="admin-confirm-password"
          v-model="user.confirmPassword"
          type="password"
          :label="t('Confirm Password')"
          placeholder="Confirm Password"
          required
        />
      </template>

      <!-- Phone Number Field -->
      <div class="col-span-2">
        <label for="admin-phone" class="block text-sm font-medium text-gray-700">
          {{ t("Phone Number") }}
        </label>
        <div class="flex items-center gap-2">
          <CInput
            id="admin-phone"
            v-model="phoneNumber"
            type="tel"
            placeholder="Enter Phone Number"
            required
          />
        </div>
      </div>

      <!-- Admin Profile Fields -->
      <CInput
        id="admin-position"
        v-model="adminProfile.position"
        :label="t('Position')"
        placeholder="Enter Position"
      />
      <CInput
        id="admin-department"
        v-model="adminProfile.department"
        :label="t('Department')"
        placeholder="Enter Department"
      />
      <CInput
        id="admin-office-phone"
        v-model="adminProfile.office_phone"
        :label="t('Office Phone')"
        placeholder="Enter Office Phone"
      />
      <CInput
        id="admin-office-location"
        v-model="adminProfile.office_location"
        :label="t('Office Location')"
        placeholder="Enter Office Location"
      />
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex flex-row items-end justify-end gap-2">
      <CButton v-if="isEditing" data-testid="change-password-btn" @click="showPasswordForm = !showPasswordForm">
        {{ t("Change Password") }}
      </CButton>
      <CButton type="submit" variant="primary" @click="submitForm">
        {{ t("Submit") }}
      </CButton>
    </div>

    <!-- Password Change Section -->
    <div v-if="showPasswordForm" class="mt-6 border-t border-primary-200 pt-6">
      <h3 class="text-lg font-semibold mb-4 text-primary-700">{{ t("Change Password") }}</h3>
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
        <CButton type="button" @click="cancelPasswordChange">
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
import { useAuthStore } from "@/stores/auth";
import { adminService, dormitoryService, userService, authService } from "@/services/api";
import { useToast } from "@/composables/useToast";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { User } from "@/models/User";
import type { AdminProfile } from "@/models/AdminProfile";

// i18n
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const userId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!userId.value);
const isEditingOwnProfile = computed(() => isEditing.value && userId.value === authStore.user?.id);

// Dormitories loaded from API
const dormitories = ref([]);
const dormitoryOptions = computed(() => 
  dormitories.value.map((d: any) => ({
    value: d.id,
    name: d.name,
  }))
);

// Admin Form Data (split into user and adminProfile)
const user = ref<Partial<User>>({
  name: "",
  surname: "",
  email: "",
  phone_numbers: [""],
  password: "",
  confirmPassword: "",
  dormitory: null,
});
const adminProfile = ref<Partial<AdminProfile>>({
  position: "",
  department: "",
  office_phone: "",
  office_location: "",
  dormitory: null,
});

// Password change form
const showPasswordForm = ref(false);
const passwordData = ref({
  current_password: "",
  password: "",
  password_confirmation: "",
});

// Computed property for phone number v-model
const phoneNumber = computed({
  get() {
    return user.value.phone_numbers && user.value.phone_numbers.length > 0 ? user.value.phone_numbers[0] : '';
  },
  set(val: string) {
    if (!user.value.phone_numbers) user.value.phone_numbers = [];
    user.value.phone_numbers[0] = val;
  }
});

// For test compatibility: proxy phone_numbers as phoneNumbers
const phoneNumbers = computed({
  get() {
    return user.value.phone_numbers || [''];
  },
  set(val: string[]) {
    user.value.phone_numbers = val;
  }
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
  if (!user.value.phone_numbers?.length || !user.value.phone_numbers[0]) {
    showError(t("At least one phone number is required."));
    return;
  }
  
  try {
    // Construct payload - AdminController expects flat structure
    const payload = {
      name: user.value.name,
      email: user.value.email,
      phone_numbers: user.value.phone_numbers,
      password: user.value.password,
      password_confirmation: user.value.confirmPassword,
      position: adminProfile.value.position,
      department: adminProfile.value.department,
      office_phone: adminProfile.value.office_phone,
      office_location: adminProfile.value.office_location,
    };
    
    if (isEditing.value) {
      // If editing own profile, use profile endpoint
      if (userId.value === authStore.user?.id) {
        await authService.updateProfile({
          first_name: user.value.name,
          last_name: user.value.surname,
          email: user.value.email,
          phone_numbers: user.value.phone_numbers,
        });
        showSuccess(t("Profile updated successfully!"));
      } else {
        // If editing other admin, use admin service
        await adminService.update(userId.value, payload);
        showSuccess(t("Admin profile updated successfully!"));
      }
    } else {
      await adminService.create(payload);
      showSuccess(t("Admin created successfully!"));
      router.push('/admins');
    }
  } catch (error: any) {
    console.error('Profile update failed:', error);
    showError(error.response?.data?.message || t("Failed to save admin data"));
  }
};

// Profile update method for tests (calls authService.updateProfile)
const updateProfile = async (): Promise<void> => {
  try {
    const payload = {
      first_name: user.value.name,
      last_name: user.value.surname,
      email: user.value.email,
      phone_numbers: user.value.phone_numbers,
      dormitory_id: user.value.dormitory,
    };
    
    await authService.updateProfile(payload);
    showSuccess(t("Profile updated successfully!"));
  } catch (error: any) {
    console.error('Profile update failed:', error);
    showError(error.response?.data?.message || t("Failed to update profile"));
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
      // Populate user fields
      user.value = {
        name: selectedUser.first_name || selectedUser.name || "",
        surname: selectedUser.last_name || selectedUser.surname || "",
        email: selectedUser.email || "",
        phone_numbers: selectedUser.phone_numbers?.length ? [...selectedUser.phone_numbers] : selectedUser.phone ? [selectedUser.phone] : [""],
        password: "", // Clear password when editing
        confirmPassword: "", // Clear confirm password when editing
        dormitory: selectedUser.dormitory || null,
      };
      // Populate adminProfile fields
      adminProfile.value = {
        position: selectedUser.admin_profile?.position || "",
        department: selectedUser.admin_profile?.department || "",
        office_phone: selectedUser.admin_profile?.office_phone || "",
        office_location: selectedUser.admin_profile?.office_location || "",
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
    user.value = {
      name: userData.first_name || userData.name || "",
      surname: userData.last_name || userData.surname || "",
      email: userData.email || "",
      phone_numbers: userData.phone_numbers?.length ? [combinePhoneNumber(userData.phone_numbers)] : userData.phone ? [userData.phone] : [""],
      dormitory: userData.dormitory_id || userData.dormitory || null,
    };
    adminProfile.value = {
      position: userData.admin_profile?.position || "",
      department: userData.admin_profile?.department || "",
      office_phone: userData.admin_profile?.office_phone || "",
      office_location: userData.admin_profile?.office_location || "",
    };
    
    console.log('Admin form data after loading:', user.value);
    
    showSuccess(t("Admin data loaded successfully"));
  } catch (error) {
    console.error('Failed to load user:', error);
    showError(t("Failed to load admin data"));
  }
};

// For test compatibility: expose admin property
const admin = computed(() => user.value);

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
  updateProfile,
  loadUser,
  user,
  admin,
  adminProfile
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>