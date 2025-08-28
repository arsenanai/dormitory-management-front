<template>
  <Navigation :title="t('Guest page')">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Guest First Name -->
      <div>
        <CInput
          id="guest-first-name"
          v-model="user.name"
          type="text"
          :label="t('Firstname')"
          placeholder="Enter Firstname"
          required
        />
      </div>

      <!-- Guest Last Name -->
      <div>
        <CInput
          id="guest-last-name"
          v-model="user.lastName"
          type="text"
          :label="t('Surname')"
          placeholder="Enter Surname"
          required
        />
      </div>

      <!-- Phone -->
      <div>
        <CInput
          id="guest-phone"
          v-model="phoneNumber"
          type="tel"
          :label="t('Tel no')"
          placeholder="+7(___)_______"
          required
        />
      </div>

      <!-- Email -->
      <div>
        <CInput
          id="guest-email"
          v-model="user.email"
          type="email"
          :label="t('Email')"
          placeholder="Enter Email"
          required
        />
      </div>

      <!-- Enter Date -->
      <div>
        <CInput
          id="guest-enter-date"
          v-model="guestProfile.visit_start_date"
          type="date"
          :label="t('Enter date')"
          required
        />
      </div>

      <!-- Exit Date -->
      <div>
        <CInput
          id="guest-exit-date"
          v-model="guestProfile.visit_end_date"
          type="date"
          :label="t('Exit date')"
          required
        />
      </div>

      <!-- Room Selection -->
      <div>
        <CSelect
          id="guest-room"
          v-model="guestProfile.room"
          :options="roomOptions"
          :label="t('Select room')"
          required
        />
      </div>

      <!-- Purpose of Visit -->
      <div>
        <CInput
          id="guest-purpose"
          v-model="guestProfile.purpose_of_visit"
          type="text"
          :label="t('guest.form.purposeOfVisit')"
          placeholder="Enter purpose of visit"
          required
        />
      </div>

      <!-- Host Name -->
      <div>
        <CInput
          id="guest-host-name"
          v-model="guestProfile.host_name"
          type="text"
          :label="t('guest.form.hostName')"
          placeholder="Enter host name"
        />
      </div>

      <!-- Host Contact -->
      <div>
        <CInput
          id="guest-host-contact"
          v-model="guestProfile.host_contact"
          type="text"
          :label="t('guest.form.hostContact')"
          placeholder="Enter host contact"
        />
      </div>

      <!-- Identification Type -->
      <div>
        <CSelect
          id="guest-identification-type"
          v-model="guestProfile.identification_type"
          :options="identificationOptions"
          :label="t('guest.form.identificationType')"
          placeholder="Select identification type"
        />
      </div>

      <!-- Identification Number -->
      <div>
        <CInput
          id="guest-identification-number"
          v-model="guestProfile.identification_number"
          type="text"
          :label="t('guest.form.identificationNumber')"
          placeholder="Enter identification number"
        />
      </div>

      <!-- Emergency Contact Name -->
      <div>
        <CInput
          id="guest-emergency-name"
          v-model="guestProfile.emergency_contact_name"
          type="text"
          :label="t('guest.form.emergencyName')"
          placeholder="Enter emergency contact name"
        />
      </div>

      <!-- Emergency Contact Phone -->
      <div>
        <CInput
          id="guest-emergency-phone"
          v-model="guestProfile.emergency_contact_phone"
          type="tel"
          :label="t('guest.form.emergencyPhone')"
          placeholder="Enter emergency contact phone"
        />
      </div>

      <!-- Information / Reminder -->
      <div class="col-span-1 lg:col-span-2">
        <CTextarea
          id="guest-reminder"
          v-model="guestProfile.reminder"
          :label="t('guest.form.enterInformationOrReminder')"
          :placeholder="t('guest.form.enterInformationOrReminder')"
          :rows="3"
        />
      </div>
    </div>

    <hr class="my-4 border-t border-gray-300" />
    <div class="text-lg font-medium text-primary-700">{{ t("guest.form.paymentInformation") }}</div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Daily Rate -->
      <div>
        <CInput
          id="guest-daily-rate"
          v-model="guestProfile.daily_rate"
          type="number"
          :label="t('guest.form.dailyRate')"
          placeholder="Enter Daily Rate"
          step="0.01"
          min="0"
        />
      </div>


    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex justify-end">
      <CButton variant="primary" @click="submitForm" class="w-full lg:w-auto">
        {{ t("Submit") }}
      </CButton>
    </div>
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
import { useToast } from "@/composables/useToast";
import { guestService } from '@/services/api';
import type { User } from "@/models/User";
import type { GuestProfile } from "@/models/GuestProfile";
import CTextarea from "@/components/CTextarea.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const guestId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!guestId.value);

// Guest Form Data
const user = ref<Partial<User>>({
  name: "",
  email: "",
  phone_numbers: [""],
  password: "",
  confirmPassword: "",
});

// Computed property for phone number to handle v-model binding
const phoneNumber = computed({
  get: () => user.value.phone_numbers && user.value.phone_numbers.length > 0 ? user.value.phone_numbers[0] : '',
  set: (val: string) => {
    if (!user.value.phone_numbers) user.value.phone_numbers = [];
    user.value.phone_numbers[0] = val;
  }
});

const guestProfile = ref<Partial<GuestProfile>>({
  purpose_of_visit: "",
  host_name: "",
  host_contact: "",
  visit_start_date: "",
  visit_end_date: "",
  identification_type: "",
  identification_number: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  daily_rate: 0,
  payment_received: 0,
  wifiUsername: "",
  wifiPassword: "",
  reminder: "",
});

// Room Options
const roomOptions: { value: string; name: string }[] = [
  { value: "1", name: "A210" },
  { value: "2", name: "A211" },
  { value: "3", name: "A212" },
];

// Identification Options
const identificationOptions: { value: string; name: string }[] = [
  { value: "passport", name: "Passport" },
  { value: "national_id", name: "National ID" },
  { value: "drivers_license", name: "Driver's License" },
  { value: "other", name: "Other" },
];

// Submit Form
const submitForm = async (): Promise<void> => {
  try {
    // Construct payload to match backend GuestController validation
    const payload = {
      name: `${user.value.name} ${user.value.lastName}`.trim(),
      email: user.value.email,
      phone: phoneNumber.value,
      room_id: guestProfile.value.room ? parseInt(guestProfile.value.room) : undefined,
      check_in_date: guestProfile.value.visit_start_date,
      check_out_date: guestProfile.value.visit_end_date,
      payment_status: 'pending',
      total_amount: guestProfile.value.daily_rate || 0,
      notes: guestProfile.value.purpose_of_visit || undefined, // Send purpose as notes
      host_name: guestProfile.value.host_name || undefined,
      host_contact: guestProfile.value.host_contact || undefined,
      identification_type: guestProfile.value.identification_type || undefined,
      identification_number: guestProfile.value.identification_number || undefined,
      emergency_contact_name: guestProfile.value.emergency_contact_name || undefined,
      emergency_contact_phone: guestProfile.value.emergency_contact_phone || undefined,
    };
    
    if (isEditing.value) {
      await guestService.update(guestId.value, payload);
      showSuccess(t("Guest information updated successfully!"));
      // Redirect to guest index page after successful update
      router.push('/guest-house');
    } else {
      await guestService.create(payload);
      showSuccess(t("Guest information created successfully!"));
      // Redirect to guest index page after successful creation
      console.log('Redirecting to /guest-house...');
      await router.push('/guest-house');
      console.log('Redirect completed');
    }
  } catch (error) {
    showError(t("Failed to save guest information. Please try again."));
  }
};



// Load guest from API if editing
const loadGuest = async (id: number) => {
  try {
    const response = await guestService.getById(id);
    const guestData = response.data;
    
    // Populate user fields
    // Split the combined name into first and last names
    const fullName = guestData.first_name || guestData.name || "";
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(' ') || "";
    
    user.value = {
      name: firstName,
      lastName: lastName,
      email: guestData.email || "",
      phone_numbers: guestData.phone_numbers?.length ? [...guestData.phone_numbers] : guestData.phone ? [guestData.phone] : [""]
    };
    
    // Populate guestProfile fields
    guestProfile.value = {
      purpose_of_visit: guestData.guest_profile?.purpose_of_visit || guestData.notes || "",
      host_name: guestData.guest_profile?.host_name || "",
      host_contact: guestData.guest_profile?.host_contact || "",
      visit_start_date: guestData.guest_profile?.visit_start_date || "",
      visit_end_date: guestData.guest_profile?.visit_end_date || "",
      identification_type: guestData.guest_profile?.identification_type || "",
      identification_number: guestData.guest_profile?.identification_number || "",
      emergency_contact_name: guestData.guest_profile?.emergency_contact_name || "",
      emergency_contact_phone: guestData.guest_profile?.emergency_contact_phone || "",
      daily_rate: guestData.guest_profile?.daily_rate || 0,
      reminder: guestData.guest_profile?.reminder || "",
    };
  } catch (error) {
    showError(t("Failed to load guest data"));
  }
};

onMounted(async () => {
  // If editing, load from API
  if (isEditing.value) {
    await loadGuest(guestId.value!);
  }
});

// Populate the form if editing an existing guest
watch(
  () => guestId.value,
  async (id) => {
    if (id) {
      await loadGuest(id);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* Add custom styles if needed */
</style>
