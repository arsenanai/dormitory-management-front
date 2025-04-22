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
      <CButton variant="primary" @click="submitDormitory" class="w-full lg:w-auto">
        {{ t("Submit") }}
      </CButton>
    </div>
  </Navigation>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";

const { t } = useI18n();

// Dormitory Form Data
const dormitory = ref({
  name: "",
  capacity: "",
  gender: "",
  admin: "",
  registered: "",
  freeBeds: "",
  rooms: "",
});

// Gender Options
const genderOptions = [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
];

// Submit Dormitory
const submitDormitory = () => {
  console.log("Dormitory submitted:", dormitory.value);
  // Add logic to save or update dormitory data
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>