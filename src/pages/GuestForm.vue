<template>
  <component :is="guestWrapper" v-bind="guestWrapperProps">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Guest First Name -->
      <div>
        <CInput id="guest-first-name" v-model="user.first_name" type="text" :label="t('Firstname')"
          placeholder="Enter Firstname" required
          v-bind="{ validationMessage: fieldErrors['first_name'], validationState: fieldErrors['first_name'] ? 'error' : '' }" />
      </div>

      <!-- Guest Last Name -->
      <div>
        <CInput id="guest-last-name" v-model="user.last_name" type="text" :label="t('Surname')"
          placeholder="Enter Surname" required
          v-bind="{ validationMessage: fieldErrors['last_name'], validationState: fieldErrors['last_name'] ? 'error' : '' }" />
      </div>

      <!-- Phone -->
      <div>
        <CInput id="guest-phone" v-model="phoneNumber" type="tel" :label="t('Tel no')" placeholder="+7(___)_______"
          required
          v-bind="{ validationMessage: fieldErrors['phone'], validationState: fieldErrors['phone'] ? 'error' : '' }" />
      </div>

      <!-- Email -->
      <div>
        <CInput id="guest-email" v-model="user.email" type="email" :label="t('Email')" placeholder="Enter Email"
          required
          v-bind="{ validationMessage: fieldErrors['email'], validationState: fieldErrors['email'] ? 'error' : '' }" />
      </div>

      <!-- Enter Date -->
      <div>
        <CInput id="guest-enter-date" v-model="guestProfile.visit_start_date" type="date" :label="t('Enter date')"
          required
          v-bind="{ validationMessage: fieldErrors['check_in_date'], validationState: fieldErrors['check_in_date'] ? 'error' : '' }" />
      </div>

      <!-- Exit Date -->
      <div>
        <CInput id="guest-exit-date" v-model="guestProfile.visit_end_date" type="date" :label="t('Exit date')" required
          v-bind="{ validationMessage: fieldErrors['check_out_date'], validationState: fieldErrors['check_out_date'] ? 'error' : '' }" />
      </div>

      <!-- Room Selection -->
      <div>
        <CSelect id="guest-room" v-model="user.room_id" :options="roomOptions" :label="t('Select room')" required
          v-bind="{ validationMessage: fieldErrors['room_id'], validationState: fieldErrors['room_id'] ? 'error' : '' }" />
      </div>

      <!-- Bed Selection -->
      <div>
        <CSelect id="guest-bed" v-model="guestProfile.bed_id" :options="bedOptions" :label="t('Select bed')"
          :disabled="!user.room_id" required
          v-bind="{ validationMessage: fieldErrors['bed_id'], validationState: fieldErrors['bed_id'] ? 'error' : '' }" />
      </div>

      <!-- Purpose of Visit -->
      <div>
        <CInput id="guest-purpose" v-model="guestProfile.purpose_of_visit" type="text"
          :label="t('guest.form.purposeOfVisit')" placeholder="Enter purpose of visit" required
          v-bind="{ validationMessage: fieldErrors['notes'], validationState: fieldErrors['notes'] ? 'error' : '' }" />
      </div>

      <!-- Host Name -->
      <div>
        <CInput id="guest-host-name" v-model="guestProfile.host_name" type="text" :label="t('guest.form.hostName')"
          placeholder="Enter host name"
          v-bind="{ validationMessage: fieldErrors['host_name'], validationState: fieldErrors['host_name'] ? 'error' : '' }" />
      </div>

      <!-- Host Contact -->
      <div>
        <CInput id="guest-host-contact" v-model="guestProfile.host_contact" type="text"
          :label="t('guest.form.hostContact')" placeholder="Enter host contact"
          v-bind="{ validationMessage: fieldErrors['host_contact'], validationState: fieldErrors['host_contact'] ? 'error' : '' }" />
      </div>

      <!-- Identification Type -->
      <div>
        <CSelect id="guest-identification-type" v-model="guestProfile.identification_type"
          :options="identificationOptions" :label="t('guest.form.identificationType')"
          placeholder="Select identification type"
          v-bind="{ validationMessage: fieldErrors['identification_type'], validationState: fieldErrors['identification_type'] ? 'error' : '' }" />
      </div>

      <!-- Identification Number -->
      <div>
        <CInput id="guest-identification-number" v-model="guestProfile.identification_number" type="text"
          :label="t('guest.form.identificationNumber')" placeholder="Enter identification number"
          v-bind="{ validationMessage: fieldErrors['identification_number'], validationState: fieldErrors['identification_number'] ? 'error' : '' }" />
      </div>

      <!-- Emergency Contact Name -->
      <div>
        <CInput id="guest-emergency-name" v-model="guestProfile.emergency_contact_name" type="text"
          :label="t('guest.form.emergencyName')" placeholder="Enter emergency contact name"
          v-bind="{ validationMessage: fieldErrors['emergency_contact_name'], validationState: fieldErrors['emergency_contact_name'] ? 'error' : '' }" />
      </div>

      <!-- Emergency Contact Phone -->
      <div>
        <CInput id="guest-emergency-phone" v-model="guestProfile.emergency_contact_phone" type="tel"
          :label="t('guest.form.emergencyPhone')" placeholder="Enter emergency contact phone"
          v-bind="{ validationMessage: fieldErrors['emergency_contact_phone'], validationState: fieldErrors['emergency_contact_phone'] ? 'error' : '' }" />
      </div>

      <!-- Information / Reminder -->
      <div class="col-span-1 lg:col-span-2">
        <CTextarea id="guest-reminder" v-model="guestProfile.reminder"
          :label="t('guest.form.enterInformationOrReminder')" :placeholder="t('guest.form.enterInformationOrReminder')"
          :rows="3"
          v-bind="{ validationMessage: fieldErrors['reminder'], validationState: fieldErrors['reminder'] ? 'error' : '' }" />
      </div>
    </div>

    <!-- Payment section removed -->

    <!-- Submit Button -->
    <div class="mt-6 flex justify-end">
      <CButton variant="primary" @click="submitForm" class="w-full lg:w-auto">
        {{ submitButtonLabel }}
      </CButton>
    </div>
  </component>
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
import { guestService, roomService, personalDataService } from '@/services/api';
import { useSettingsStore } from '@/stores/settings';
import type { User } from "@/models/User";
import type { GuestProfile } from "@/models/GuestProfile";
import CTextarea from "@/components/CTextarea.vue";

const props = defineProps<{
  embedded?: boolean;
  initialGuestId?: number | null;
  redirectOnSubmit?: boolean;
  submitLabel?: string;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { showError, showSuccess } = useToast();
// Field-level validation messages returned by backend
const fieldErrors = ref<Record<string, string>>({});
const settingsStore = useSettingsStore();

// Check if we're editing (ID in route params)
const guestWrapper = computed(() => (props.embedded ? "div" : Navigation));
const guestWrapperProps = computed(() => (props.embedded ? {} : { title: t("Guest page") }));
const submitButtonLabel = computed(() => props.submitLabel || t("Submit"));
const shouldRedirect = computed(() => !props.embedded && props.redirectOnSubmit !== false);

const guestId = computed(() => {
  if (props.initialGuestId !== undefined && props.initialGuestId !== null) {
    return props.initialGuestId;
  }
  return route.params.id ? Number(route.params.id) : null;
});
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
  bed_id: null,
  // payment fields removed
  wifiUsername: "",
  wifiPassword: "",
  reminder: "",
});

// currency symbol/computation removed (payment UI removed)

// Room Options
const roomOptions = ref<{ value: string; name: string }[]>([]);
const allRoomsData = ref<any[]>([]); // To store full room data for rate lookup
const bedOptions = ref<{ value: string; name: string }[]>([]);
const loadingRooms = ref(false);

const fetchAvailableRooms = async () => {
  if (!guestProfile.value.visit_start_date || !guestProfile.value.visit_end_date) {
    roomOptions.value = [];
    allRoomsData.value = [];
    return;
  }
  loadingRooms.value = true;
  try {
    const params: { occupant_type: string; start_date: string; end_date: string; guest_id?: number } = {
      occupant_type: 'guest',
      start_date: guestProfile.value.visit_start_date,
      end_date: guestProfile.value.visit_end_date,
    };
    if (isEditing.value && guestId.value) {
      params.guest_id = guestId.value;
    }
    const availableRoomsResponse = await roomService.getAvailable(params);
    let allRooms = availableRoomsResponse.data || [];
    allRoomsData.value = allRooms;

    // If editing, ensure the guest's current room is in the list
    if (isEditing.value && guestId.value && user.value.room_id) {
      const guestResponse = await guestService.getById(guestId.value);
      const currentRoom = guestResponse.data.room;
      if (currentRoom && !allRooms.some(room => room.id === currentRoom.id)) {
        allRooms.push(currentRoom);
      }
    }

    roomOptions.value = allRooms.map((room: any) => ({
      value: room.id.toString(),
      name: `${room.number} (${room.room_type?.name})`,
    }));
  } catch (err) {
    console.error('Error fetching available rooms:', err);
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
  // clear previous errors
  fieldErrors.value = {};
  try {
    // Construct payload to match backend GuestController validation
    const payload = {
      first_name: `${user.value.first_name}`.trim(),
      last_name: `${user.value.last_name}`.trim(),
      email: user.value.email,
      phone: phoneNumber.value,
      room_id: user.value.room_id,
      bed_id: guestProfile.value.bed_id,
      check_in_date: guestProfile.value.visit_start_date,
      check_out_date: guestProfile.value.visit_end_date,
      notes: guestProfile.value.purpose_of_visit || undefined, // Send purpose as notes
      host_name: guestProfile.value.host_name || undefined,
      host_contact: guestProfile.value.host_contact || undefined,
      identification_type: guestProfile.value.identification_type || undefined,
      identification_number: guestProfile.value.identification_number || undefined,
      emergency_contact_name: guestProfile.value.emergency_contact_name || undefined,
      emergency_contact_phone: guestProfile.value.emergency_contact_phone || undefined,
    };

    if (props.embedded) {
      await personalDataService.update(payload);
      showSuccess(t("Guest information updated successfully!"));
      if (shouldRedirect.value) {
        await loadSelfGuest();
      }
      return;
    }

    if (isEditing.value) {
      await guestService.update(guestId.value!, payload);
      showSuccess(t("Guest information updated successfully!"));
      if (shouldRedirect.value) {
        router.push('/guest-house');
      }
    } else {
      await guestService.create(payload);
      showSuccess(t("Guest information created successfully!"));
      if (shouldRedirect.value) {
        await router.push('/guest-house');
      }
    }
  } catch (error: any) {
    // If backend returned validation errors, map them to fields
    const resp = error?.response?.data;
    if (resp && resp.errors && typeof resp.errors === 'object') {
      Object.entries(resp.errors).forEach(([key, messages]) => {
        // messages is an array of strings
        if (Array.isArray(messages)) {
          fieldErrors.value[key] = (messages as string[]).join(' ');
        } else if (typeof messages === 'string') {
          fieldErrors.value[key] = messages;
        }
      });
      // Show top-level message if present
      if (resp.message) {
        showError(resp.message);
      }
      return;
    }

    showError(t("Failed to save guest information. Please try again."));
  }
};



// Load guest from API if editing
const hydrateGuestFromApi = async (guestData: User): Promise<void> => {
  user.value = {
    first_name: guestData.first_name,
    last_name: guestData.last_name,
    email: guestData.email || "",
    phone_numbers: guestData.phone_numbers?.length ? [...guestData.phone_numbers] : guestData.phone ? [guestData.phone] : [""],
    room_id: guestData.room_id,
  };

  guestProfile.value = {
    purpose_of_visit: guestData.guest_profile?.purpose_of_visit || guestData.notes || "",
    host_name: guestData.guest_profile?.host_name || guestData.host_name || "",
    host_contact: guestData.guest_profile?.host_contact || "",
    visit_start_date: guestData.guest_profile?.visit_start_date?.substring(0, 10) || "",
    visit_end_date: guestData.guest_profile?.visit_end_date?.substring(0, 10) || "",
    identification_type: guestData.guest_profile?.identification_type || "",
    identification_number: guestData.guest_profile?.identification_number || "",
    emergency_contact_name: guestData.guest_profile?.emergency_contact_name || "",
    emergency_contact_phone: guestData.guest_profile?.emergency_contact_phone || "",
    bed_id: guestData.guest_profile?.bed_id ? guestData.guest_profile?.bed_id.toString() : null,
    reminder: guestData.guest_profile?.reminder || "",
  };

  await fetchAvailableRooms();
  updateBedOptions(user.value.room_id);
};

const loadGuest = async (id: number): Promise<void> => {
  try {
    const response = await guestService.getById(id);
    await hydrateGuestFromApi(response.data);
  } catch (error) {
    showError(t("Failed to load guest data"));
  }
};

const loadSelfGuest = async (): Promise<void> => {
  try {
    const response = await personalDataService.get();
    await hydrateGuestFromApi(response.data);
  } catch (error) {
    showError(t("Failed to load guest data"));
  }
};

const updateBedOptions = (roomId: number | string | null) => {
  bedOptions.value = [];
  const selectedRoom = allRoomsData.value.find(room => room.id == roomId); // Use '==' for loose comparison
  if (selectedRoom && selectedRoom.beds) {
    bedOptions.value = selectedRoom.beds.map((bed: any) => ({
      value: bed.id.toString(), // Ensure value is a string for consistency
      name: `${selectedRoom.number}-${bed.bed_number}`,
    }));
  }
};

// calculateTotalAmount removed (payment calculation disabled)

// Watch for changes in room selection, start date, or end date to calculate total amount
watch([() => guestProfile.value.visit_start_date, () => guestProfile.value.visit_end_date], () => {
  // When dates change, we must re-fetch rooms.
  // Only reset the room/bed selection if we are NOT in the middle of loading an existing guest.
  if (!isEditing.value) {
    user.value.room_id = null;
  }
  fetchAvailableRooms();
});

watch(() => user.value.room_id, (newRoomId, oldRoomId) => {
  // if (oldRoomId !== undefined && newRoomId !== oldRoomId) {
  //   guestProfile.value.bed_id = null;
  // }
  updateBedOptions(newRoomId ?? null);
}, { deep: true });

onMounted(() => {
  if (props.embedded) {
    loadSelfGuest();
    return;
  }

  if (isEditing.value) {
    loadGuest(guestId.value!);
  }
});

// Clear field-specific errors when user edits the corresponding fields
watch(() => user.value.first_name, () => { delete fieldErrors.value['first_name']; });
watch(() => user.value.last_name, () => { delete fieldErrors.value['last_name']; });
watch(() => user.value.email, () => { delete fieldErrors.value['email']; });
watch(() => phoneNumber.value, () => { delete fieldErrors.value['phone']; });
watch(() => guestProfile.value.visit_start_date, () => { delete fieldErrors.value['check_in_date']; });
watch(() => guestProfile.value.visit_end_date, () => { delete fieldErrors.value['check_out_date']; });
watch(() => user.value.room_id, () => { delete fieldErrors.value['room_id']; });
watch(() => guestProfile.value.bed_id, () => { delete fieldErrors.value['bed_id']; });
watch(() => guestProfile.value.purpose_of_visit, () => { delete fieldErrors.value['notes']; });
watch(() => guestProfile.value.host_name, () => { delete fieldErrors.value['host_name']; });
watch(() => guestProfile.value.host_contact, () => { delete fieldErrors.value['host_contact']; });
watch(() => guestProfile.value.identification_type, () => { delete fieldErrors.value['identification_type']; });
watch(() => guestProfile.value.identification_number, () => { delete fieldErrors.value['identification_number']; });
watch(() => guestProfile.value.emergency_contact_name, () => { delete fieldErrors.value['emergency_contact_name']; });
watch(() => guestProfile.value.emergency_contact_phone, () => { delete fieldErrors.value['emergency_contact_phone']; });
watch(() => guestProfile.value.reminder, () => { delete fieldErrors.value['reminder']; });
</script>

<style scoped>
/* Add custom styles if needed */
</style>
