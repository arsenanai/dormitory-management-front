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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { Dormitory } from "@/models/Dormitory";

const { t } = useI18n();

// Dormitory Form Data
const dormitory = ref(new Dormitory());

// Gender Options
const genderOptions: { value: string; name: string }[] = [
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") },
  { value: "mixed", name: t("Mixed") },
];

// Submit Dormitory
const submitDormitory = (): void => {
  console.log("Dormitory submitted:", dormitory.value);
  // Add logic to save or update dormitory data
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
