<template>
  <Navigation :title="t('Admin Management')">
    <!-- Form Fields -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Name Field -->
      <CInput
        id="admin-name"
        v-model="user.first_name"
        :label="t('Firstname')"
        placeholder="Enter Firstname"
        required
      />

      <!-- Surname Field -->
      <CInput
        id="admin-surname"
        v-model="user.last_name"
        type="text"
        :label="t('Lastname')"
        placeholder="Enter Lastname"
        required
      />

      <!-- Dormitory Field - Show when editing -->
      <CSelect
        id="admin-dormitory"
        v-model="user.dormitory_id"
        :options="dormitoryOptions"
        :label="t('Dormitory')"
        placeholder="Select a dormitory"
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
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex flex-row items-end justify-end gap-2">
      <CButton
        v-if="isEditing"
        data-testid="change-password-btn"
        @click="showPasswordForm = !showPasswordForm"
      >
        {{ t("Change Password") }}
      </CButton>
      <CButton type="submit" variant="primary" @click="submitForm">
        {{ t("Submit") }}
      </CButton>
    </div>

    <!-- Password Change Section -->
    <div v-if="showPasswordForm" class="border-primary-200 mt-6 border-t pt-6">
      <h3 class="text-primary-700 mb-4 text-lg font-semibold">{{ t("Change Password") }}</h3>
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
        <CButton type="button" @click="changePassword">
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
import { ref, watch, onMounted, computed, nextTick } from "vue";
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
const userId = computed(() => (route.params.id ? Number(route.params.id) : null));
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
  first_name: "",
  last_name: "",
  email: "",
  phone_numbers: [""],
  password: "",
  confirmPassword: "",
  dormitory_id: null,
});
const adminProfile = ref<Partial<AdminProfile>>({
  dormitory_id: null,
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
    return user.value.phone_numbers && user.value.phone_numbers.length > 0
      ? user.value.phone_numbers[0]
      : "";
  },
  set(val: string) {
    if (!user.value.phone_numbers) user.value.phone_numbers = [];
    user.value.phone_numbers[0] = val;
  },
});

// For test compatibility: proxy phone_numbers as phoneNumbers
const phoneNumbers = computed({
  get() {
    return user.value.phone_numbers || [""];
  },
  set(val: string[]) {
    user.value.phone_numbers = val;
  },
});

// Maximum number of phone numbers (from .env)
const maxPhoneNumbers = parseInt(import.meta.env.VITE_MAX_PHONE_NUMBERS || "3");

// Combine phone number parts into single phone number
const combinePhoneNumber = (phoneArray: string[]): string => {
  if (!phoneArray || phoneArray.length === 0) return "";
  return phoneArray.join("");
};

// Split combined phone number into parts for display
const splitPhoneNumber = (phoneNumber: string): string[] => {
  // For now, just return as single entry
  return phoneNumber ? [phoneNumber] : [""];
};

// Submit the form
const submitForm = async (): Promise<void> => {
  // Ensure we have a clean array of phone numbers (filter out empty strings)
  const cleanPhoneNumbers =
    user.value.phone_numbers?.filter((phone) => phone?.trim()) || [];

  if (cleanPhoneNumbers.length === 0) {
    showError(t("At least one phone number is required."));
    return;
  }

  try {
    if (isEditing.value) {
      // If editing own profile, use profile endpoint
      if (userId.value === authStore.user?.id) {
        const updatePayload = {
          first_name: user.value.first_name,
          last_name: user.value.last_name,
          name: user.value.first_name + " " + user.value.last_name,
          email: user.value.email,
          phone_numbers: cleanPhoneNumbers,
          dormitory_id: user.value.dormitory_id,
        };
        await authService.updateProfile(updatePayload);
        showSuccess(t("Profile updated successfully!"));
      } else {
        // If editing other admin, use admin service
        const updatePayload = {
          first_name: user.value.first_name,
          last_name: user.value.last_name,
          name: user.value.first_name + " " + user.value.last_name,
          email: user.value.email,
          phone_numbers: cleanPhoneNumbers,
          dormitory_id: user.value.dormitory_id,
        };
        await adminService.update(userId.value, updatePayload);
        showSuccess(t("Admin profile updated successfully!"));
        router.push("/admins");
      }
    } else {
      // For new admin creation, include password fields
      const createPayload = {
        first_name: user.value.first_name,
        last_name: user.value.last_name,
        name: user.value.first_name + " " + user.value.last_name,
        email: user.value.email,
        phone_numbers: cleanPhoneNumbers,
        password: user.value.password,
        password_confirmation: user.value.confirmPassword,
        dormitory_id: user.value.dormitory_id,
      };
      await adminService.create(createPayload);
      showSuccess(t("Admin created successfully!"));
      router.push("/admins");
    }
  } catch (error: any) {
    showError(error.response?.data?.message || t("Failed to save admin data"));
  }
};

// Profile update method for tests (calls authService.updateProfile)
const updateProfile = async (): Promise<void> => {
  try {
    // Ensure we have a clean array of phone numbers
    const cleanPhoneNumbers =
      user.value.phone_numbers?.filter((phone) => phone?.trim()) || [];

    const payload = {
      first_name: user.value.first_name,
      last_name: user.value.last_name,
      name: user.value.first_name + " " + user.value.last_name,
      email: user.value.email,
      phone_numbers: cleanPhoneNumbers,
      dormitory_id: user.value.admin_dormitory?.id,
    };

    await authService.updateProfile(payload);
    showSuccess(t("Profile updated successfully!"));
  } catch (error: any) {
    showError(error.response?.data?.message || t("Failed to update profile"));
  }
};

// Password change functions
const changePassword = async (): Promise<void> => {
  if (
    !passwordData.value.current_password ||
    !passwordData.value.password ||
    !passwordData.value.password_confirmation
  ) {
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
      // Update each field individually to ensure reactivity
      user.value.first_name = selectedUser.first_name || "";
      user.value.last_name = selectedUser.last_name || "";
      user.value.email = selectedUser.email || "";
      user.value.phone_numbers = selectedUser.phone_numbers?.length
        ? selectedUser.phone_numbers
        : selectedUser.phone
          ? [selectedUser.phone]
          : [""];
      user.value.password = ""; // Clear password when editing
      user.value.confirmPassword = ""; // Clear confirm password when editing
      user.value.dormitory_id = selectedUser.admin_dormitory.id || null;

      // Populate adminProfile fields
      // adminProfile.value = {
      //   dormitory_id: selectedUser.admin_dormitory.id || null,
      // };
    }
  },
  { immediate: true }
);

// Load user from API if editing
const loadUser = async (id: number) => {
  try {
    let userData;

    // If editing own profile, use profile endpoint
    if (id === authStore.user?.id) {
      const response = await authService.getProfile();
      userData = response.data;
    } else {
      const response = await adminService.getById(id);
      userData = response.data;
    }

    // Populate form with API data, properly mapping fields
    const updatedUser = {
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      email: userData.email || "",
      phone_numbers: (() => {
        // Always ensure we have an array of phone numbers
        if (
          userData.phone_numbers &&
          Array.isArray(userData.phone_numbers) &&
          userData.phone_numbers.length > 0
        ) {
          return userData.phone_numbers;
        } else if (userData.phone?.trim()) {
          return [userData.phone];
        } else {
          return [""]; // Default to empty string in array
        }
      })(),
      dormitory_id: userData.admin_dormitory?.id || null,
    };

    // Update each field individually to ensure reactivity
    user.value.first_name = updatedUser.first_name;
    user.value.last_name = updatedUser.last_name;
    user.value.email = updatedUser.email;
    user.value.phone_numbers = updatedUser.phone_numbers;
    user.value.dormitory_id = updatedUser.dormitory_id;

    // Force a re-render to ensure components update
    await nextTick();

    showSuccess(t("Admin data loaded successfully"));
  } catch (error) {
    showError(t("Failed to load admin data"));
  }
};

// For test compatibility: expose admin property
const admin = computed(() => user.value);

onMounted(async () => {
  // Load dormitories first
  try {
    const response = await dormitoryService.getAll();

    // Handle different response formats
    if (response?.data) {
      if (Array.isArray(response.data)) {
        // Direct array response
        dormitories.value = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Laravel paginated response
        dormitories.value = response.data.data;
      } else {
        // Fallback - try to find data in the response
        dormitories.value = [];
      }
    } else {
      dormitories.value = [];
    }
  } catch (error) {
    showError(t("Failed to load dormitories"));
    dormitories.value = [];
  }

  // If editing, always load from API to ensure fresh data
  if (isEditing.value) {
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
  adminProfile,
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
