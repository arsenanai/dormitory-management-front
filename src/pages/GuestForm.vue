<template>
  <Navigation :title="t('Guest page')">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Guest First Name -->
      <div>
        <CInput id="guest-first-name" v-model="user.first_name" type="text" :label="t('Firstname')"
          placeholder="Enter Firstname" required />
      </div>

      <!-- Guest Last Name -->
      <div>
        <CInput id="guest-last-name" v-model="user.last_name" type="text" :label="t('Surname')"
          placeholder="Enter Surname" required />
      </div>

      <!-- Phone -->
      <div>
        <CInput id="guest-phone" v-model="phoneNumber" type="tel" :label="t('Tel no')" placeholder="+7(___)_______"
          required />
      </div>

      <!-- Email -->
      <div>
        <CInput id="guest-email" v-model="user.email" type="email" :label="t('Email')" placeholder="Enter Email"
          required />
      </div>

      <!-- Enter Date -->
      <div>
        <CInput id="guest-enter-date" v-model="guestProfile.visit_start_date" type="date" :label="t('Enter date')"
          required />
      </div>

      <!-- Exit Date -->
      <div>
        <CInput id="guest-exit-date" v-model="guestProfile.visit_end_date" type="date" :label="t('Exit date')"
          required />
      </div>

      <!-- Room Selection -->
      <div>
        <CSelect id="guest-room" v-model="user.room_id" :options="roomOptions" :label="t('Select room')" required />
      </div>

      <!-- Purpose of Visit -->
      <div>
        <CInput id="guest-purpose" v-model="guestProfile.purpose_of_visit" type="text"
          :label="t('guest.form.purposeOfVisit')" placeholder="Enter purpose of visit" required />
      </div>

      <!-- Host Name -->
      <div>
        <CInput id="guest-host-name" v-model="guestProfile.host_name" type="text" :label="t('guest.form.hostName')"
          placeholder="Enter host name" />
      </div>

      <!-- Host Contact -->
      <div>
        <CInput id="guest-host-contact" v-model="guestProfile.host_contact" type="text"
          :label="t('guest.form.hostContact')" placeholder="Enter host contact" />
      </div>

      <!-- Identification Type -->
      <div>
        <CSelect id="guest-identification-type" v-model="guestProfile.identification_type"
          :options="identificationOptions" :label="t('guest.form.identificationType')"
          placeholder="Select identification type" />
      </div>

      <!-- Identification Number -->
      <div>
        <CInput id="guest-identification-number" v-model="guestProfile.identification_number" type="text"
          :label="t('guest.form.identificationNumber')" placeholder="Enter identification number" />
      </div>

      <!-- Emergency Contact Name -->
      <div>
        <CInput id="guest-emergency-name" v-model="guestProfile.emergency_contact_name" type="text"
          :label="t('guest.form.emergencyName')" placeholder="Enter emergency contact name" />
      </div>

      <!-- Emergency Contact Phone -->
      <div>
        <CInput id="guest-emergency-phone" v-model="guestProfile.emergency_contact_phone" type="tel"
          :label="t('guest.form.emergencyPhone')" placeholder="Enter emergency contact phone" />
      </div>

      <!-- Information / Reminder -->
      <div class="col-span-1 lg:col-span-2">
        <CTextarea id="guest-reminder" v-model="guestProfile.reminder"
          :label="t('guest.form.enterInformationOrReminder')" :placeholder="t('guest.form.enterInformationOrReminder')"
          :rows="3" />
      </div>
    </div>

    <hr class="my-4 border-t border-gray-300" />
    <div class="text-lg font-medium text-primary-700">{{ t("guest.form.paymentInformation") }}</div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Daily Rate -->
      <div data-testid="paid-amount-input-container">
        <CInput id="guest-daily-rate" v-model="guestProfile.total_amount" type="number"
          :label="`${t('Total Amount')} (${currencySymbol})`" placeholder="Enter Paid Amount" step="0.01" min="0" />
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
import { guestService, roomService } from '@/services/api';
import { useSettingsStore } from '@/stores/settings';
import type { User } from "@/models/User";
import type { GuestProfile } from "@/models/GuestProfile";
import { getCurrencySymbol } from "@/utils/formatters";
import CTextarea from "@/components/CTextarea.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { showError, showSuccess } = useToast();
const settingsStore = useSettingsStore();

// Check if we're editing (ID in route params)
const guestId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!guestId.value);

// Guest Form Data
const user = ref<Partial<User>>({
  first_name: "",
  last_name: "",
  email: "",
  phone_numbers: [""],
  password: "",
  room_id: null,
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
  total_amount: 0,
  payment_received: 0,
  wifiUsername: "",
  wifiPassword: "",
  reminder: "",
});

const currencySymbol = computed(() => {
  return getCurrencySymbol(settingsStore.publicSettings?.currency_symbol);
});

// Room Options
const roomOptions = ref<{ value: string; name: string }[]>([]);
const allRoomsData = ref<any[]>([]); // To store full room data for rate lookup
const loadingRooms = ref(false);

const fetchAvailableRooms = async () => {
  loadingRooms.value = true;
  try {
    const availableRoomsResponse = await guestService.getAvailableRooms();
    let allRooms = availableRoomsResponse.data || [];
    allRoomsData.value = allRooms;
    // If editing, ensure the guest's current room is in the list
    if (isEditing.value && guestId.value) {
      const guestResponse = await guestService.getById(guestId.value);
      const currentRoom = guestResponse.data.room;
      if (currentRoom && !allRooms.some(room => room.id === currentRoom.id)) {
        allRooms.push(currentRoom);
        if (!allRoomsData.value.some(r => r.id === currentRoom.id)) {
          allRoomsData.value.push(currentRoom);
        }
      }
    }

    roomOptions.value = allRooms.map((room: any) => ({
      value: room.id.toString(),
      name: `${room.number}`,
    }));
  } catch (err) {
    showError(t('Failed to load room options'));
  } finally {
    loadingRooms.value = false;
  }
};

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
      first_name: `${user.value.first_name}`.trim(),
      last_name: `${user.value.last_name}`.trim(),
      email: user.value.email,
      phone: phoneNumber.value,
      room_id: user.value.room_id,
      check_in_date: guestProfile.value.visit_start_date,
      check_out_date: guestProfile.value.visit_end_date,
      payment_status: 'pending',
      total_amount: guestProfile.value.total_amount || 0,
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
    const fullName = guestData.first_name || guestData.last_name || "";
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(' ') || "";

    user.value = {
      first_name: guestData.first_name,
      last_name: guestData.last_name,
      email: guestData.email || "",
      phone_numbers: guestData.phone_numbers?.length ? [...guestData.phone_numbers] : guestData.phone ? [guestData.phone] : [""],
      room_id: guestData.room_id,
    };

    // Populate guestProfile fields
    guestProfile.value = {
      purpose_of_visit: guestData.guest_profile?.purpose_of_visit || guestData.notes || "",
      host_name: guestData.guest_profile?.host_name || guestData.host_name || "",
      host_contact: guestData.guest_profile?.host_contact || "",
      visit_start_date: guestData.guest_profile?.visit_start_date || "",
      visit_end_date: guestData.guest_profile?.visit_end_date || "",
      identification_type: guestData.guest_profile?.identification_type || "",
      identification_number: guestData.guest_profile?.identification_number || "",
      emergency_contact_name: guestData.guest_profile?.emergency_contact_name || "",
      emergency_contact_phone: guestData.guest_profile?.emergency_contact_phone || "",
      total_amount: guestData.total_amount || guestData.guest_profile?.daily_rate || 0,
      reminder: guestData.guest_profile?.reminder || "",
    };
  } catch (error) {
    showError(t("Failed to load guest data"));
  }
};

onMounted(async () => {
  // If editing, load from API
  // Fetch rooms first, which now handles including the current guest's room in edit mode
  await fetchAvailableRooms();
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

// Watch for changes in room selection, start date, or end date to calculate total amount
watch([() => user.value.room_id, () => guestProfile.value.visit_start_date, () => guestProfile.value.visit_end_date], () => {
  if (user.value.room_id && guestProfile.value.visit_start_date && guestProfile.value.visit_end_date) {
    const selectedRoom = allRoomsData.value.find(room => room.id === user.value.room_id);
    if (selectedRoom && selectedRoom.room_type?.daily_rate) {
      const startDate = new Date(guestProfile.value.visit_start_date);
      const endDate = new Date(guestProfile.value.visit_end_date);
      if (endDate > startDate) {
        const timeDiff = endDate.getTime() - startDate.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        guestProfile.value.total_amount = days * selectedRoom.room_type.daily_rate;
      } else {
        guestProfile.value.total_amount = 0;
      }
    } else {
      guestProfile.value.total_amount = 0;
    }
  }
}, { deep: true });
</script>

<style scoped>
/* Add custom styles if needed */
</style>
