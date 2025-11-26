<template>
  <form @submit.prevent="handleGuestRegistration" novalidate class="min-h-[60vh] flex flex-col items-stretch h-full">
    <CStepper v-model="currentStep" @finish="handleGuestRegistration">

      <!-- Step 1: Room Selection -->
      <CStep :title="t('Room Selection')" :validator="() => isRoomSelectionStepValid">
        <div class="grid grid-cols-1 gap-4">
          <CSelect id="guest-gender" v-model="guest.gender" :options="genderOptions" :label="t('Gender')" required
            :validationState="validationState.gender" :validationMessage="validationMessage.gender" />
          <div class="grid grid-cols-2 gap-4">
            <CInput id="guest-check-in" v-model="guest.check_in_date" type="date" :label="t('Check-in Date')" required
              :validationState="validationState.check_in_date" :validationMessage="validationMessage.check_in_date" />
            <CInput id="guest-check-out" v-model="guest.check_out_date" type="date" :label="t('Check-out Date')"
              :disabled="!guest.check_in_date" :min="guest.check_in_date" required
              :validationState="validationState.check_out_date" :validationMessage="validationMessage.check_out_date" />
          </div>
          <CSelect id="guest-dormitory" v-model="guest.dormitory_id" :options="dormitoryOptions"
            :label="t('Select Dormitory')" required
            :disabled="!guest.gender || !guest.check_in_date || !guest.check_out_date"
            :placeholder="dormitoryOptions.length === 0 ? t('No Dormitories available') : t('Select Dormitory')"
            :validationState="validationState.dormitory_id" :validationMessage="validationMessage.dormitory_id" />
          <div class="grid grid-cols-2 gap-4">
            <CSelect id="guest-room-type" v-model="guest.room_type_id" :options="roomTypeOptions"
              :label="t('Select Room Type')" :disabled="!guest.dormitory_id"
              :validationState="validationState.room_type_id" :validationMessage="validationMessage.room_type_id" />
            <CSelect id="guest-room" v-model="guest.room_id" :options="roomOptions" :label="t('Select Room')"
              :disabled="!guest.dormitory_id || loadingRooms || !guest.room_type_id"
              :validationState="validationState.room_id" :validationMessage="validationMessage.room_id" required />
          </div>
          <CSelect id="guest-bed" v-model="guest.bed_id" :options="bedOptions" :label="t('Bed')"
            :disabled="!guest.room_id || loadingBeds" :validationState="validationState.bed_id"
            :validationMessage="validationMessage.bed_id" required />
        </div>
        <div v-if="loadingRooms || loadingBeds" class="flex justify-center mt-4">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
        </div>
        <div v-if="!loadingRooms && guest.dormitory_id && availableRooms.length === 0"
          class="text-center text-red-500 p-4 mt-2">
          {{ t('No rooms are available for the selected dormitory and dates.') }}
        </div>
        <div v-if="!loadingBeds && guest.room_id && bedOptions.length === 0" class="text-center text-red-500 p-4 mt-2">
          {{ t('No beds are available for the selected room and dates.') }}
        </div>
      </CStep>

      <!-- Step 2: Personal Information -->
      <CStep :title="t('Account Information')" :validator="() => isAccountInfoStepValid">
        <div class="grid grid-cols-1 gap-4">
          <CInput id="guest-phone" v-model="guest.phone" type="tel" :label="t('Tel no')" required
            :validationState="validationState.phone" :validationMessage="validationMessage.phone" />
          <CInput id="guest-email" v-model="guest.email" type="email" :label="t('Email')" required
            :validationState="validationState.email" :validationMessage="validationMessage.email" />
          <CInput v-model="guest.password" type=password :label="t('Password')" required
            :validationState="validationState.password" :validationMessage="validationMessage.pasword" />
          <CInput v-model="guest.password_confirmation" type=password :label="t('Confirm Password')"
            :validationState="validationState.password_confirmation"
            :validationMessage="validationMessage.pasword_confirmation" />
        </div>
      </CStep>

      <!-- Step 3: Personal Information -->
      <CStep :title="t('Personal Information')" :validator="() => isPersonalInfoStepValid">
        <div class="grid grid-cols-1 gap-4">
          <CInput id="guest-first-name" v-model="guest.first_name" type="text" :label="t('Firstname')" required
            :validationState="validationState.first_name" :validationMessage="validationMessage.first_name" />
          <CInput id="guest-last-name" v-model="guest.last_name" type="text" :label="t('Surname')" required
            :validationState="validationState.last_name" :validationMessage="validationMessage.last_name" />
          <div class="lg:col-span-2">
            <CInput id="guest-purpose" v-model="guest.notes" type="text" :label="t('guest.form.purposeOfVisit')"
              placeholder="Enter purpose of visit" />
          </div>
        </div>
      </CStep>
      <!-- Step 3: Additional Information -->
      <CStep :title="t('Additional Information')" :validator="() => isAdditionalInfoStepValid">
        <div class="grid grid-cols-1 gap-4">
          <CInput id="guest-host-name" v-model="guest.host_name" type="text" :label="t('guest.form.hostName')" />
          <CInput id="guest-host-contact" v-model="guest.host_contact" type="text"
            :label="t('guest.form.hostContact')" />
          <div class="">
            <CTextarea id="guest-reminder" v-model="guest.reminder" :label="t('guest.form.enterInformationOrReminder')"
              :rows="3" />
          </div>
        </div>
      </CStep>

      <!-- Step 4: Identification -->
      <CStep :title="t('Identification')" :validator="() => isIdentificationStepValid">
        <div class="grid grid-cols-1 gap-4">
          <CSelect id="guest-identification-type" v-model="guest.identification_type" :options="identificationOptions"
            :label="t('guest.form.identificationType')" />
          <CInput id="guest-identification-number" v-model="guest.identification_number" type="text"
            :label="t('guest.form.identificationNumber')" />
          <CInput id="guest-emergency-name" v-model="guest.emergency_contact_name" type="text"
            :label="t('guest.form.emergencyName')" />
          <CInput id="guest-emergency-phone" v-model="guest.emergency_contact_phone" type="tel"
            :label="t('guest.form.emergencyPhone')" />
        </div>
      </CStep>

      <!-- Step 5: Payment -->
      <CStep :title="t('Payment')" :validator="() => isPaymentStepValid">
        <div class="flex-1 flex flex-col gap-2">
          <div class="flex gap-2 items-center">
            <span class="text-sm font-medium">{{ t('Total Amount') }}</span> -
            <span class="font-semibold text-gray-900">{{ guest.total_amount.toFixed(2) }} {{ currencySymbol }}</span>
          </div>
          <CTextarea id="dormitory-rules" :label="t('Bank requisites')"
            :model-value="settingsStore.publicSettings?.bank_requisites" readonly additionalClass="h-full flex-1"
            wrapperClass="flex flex-col flex-1" />
          <CFileInput id="guest-bank-paycheck" :label="t('Bank Paycheck') " required
            :allowedExtensions="['jpg', 'jpeg', 'png', 'pdf']" :maxFileSize="2 * 1024 * 1024"
            :validation-message="validationMessage.bank_paycheck" @change="(file) => guest.bank_paycheck = file" />
        </div>
      </CStep>
      <!-- Step 6: Registration Status -->
      <CStep :title="t('Registration & Status')" :validator="() => isDormitoryRulesAccepted">
        <div class="flex-1 flex flex-col gap-4 h-full">
          <CTextarea id="dormitory-rules" :label="t('Dormitory Rules and Regulations')"
            :model-value="settingsStore.publicSettings?.dormitory_rules" readonly additionalClass="h-full flex-1"
            wrapperClass="flex flex-col flex-1" fullscreen />
          <CCheckbox id="registration-agree-rules" v-model="guest.agree_to_dormitory_rules"
            :label="t('I have read and agree to the Dormitory Rules and Regulations')" required />
        </div>
      </CStep>
    </CStepper>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useToast } from '@/composables/useToast';
import { dormitoryService, roomService } from '@/services/api';
import CInput from '@/components/CInput.vue';
import CButton from '@/components/CButton.vue';
import CSelect from '@/components/CSelect.vue';
import CTextarea from '@/components/CTextarea.vue';
import CStepper from '@/components/CStepper.vue';
import CFileInput from '@/components/CFileInput.vue';
import CStep from '@/components/CStep.vue';
import CCheckbox from '@/components/CCheckbox.vue';
import { getCurrencySymbol } from '@/utils/formatters';

const emit = defineEmits<{
  (e: 'registered', message: string): void;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const { showError, showSuccess } = useToast();

const currentStep = ref(0);

const guest = ref({
  user_type: "guest",
  // Step 1
  gender: undefined as 'male' | 'female' | undefined,
  check_in_date: '',
  check_out_date: '',
  dormitory_id: undefined as number | undefined,
  room_type_id: undefined as number | undefined,
  room_id: undefined as number | undefined,
  bed_id: undefined as number | undefined,
  // Step 2
  phone: '',
  email: '',
  password: '',
  password_confirmation: '',
  // Step 3
  first_name: '',
  last_name: '',
  notes: '', // Purpose of visit
  // Step 4
  host_name: '',
  host_contact: '',
  reminder: '', // Information or reminder
  // Step 5
  identification_type: 'national_id',
  identification_number: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  // Step 6
  total_amount: 0,
  bank_paycheck: null as File | null,
  // Step 7
  agree_to_dormitory_rules: false,
});

type ValidationState = 'success' | 'error' | '';
const validationState = ref<Record<keyof typeof guest.value, ValidationState>>({
  gender: '', check_in_date: '', check_out_date: '', dormitory_id: '', room_type_id: '', room_id: '', bed_id: '',
  first_name: '', last_name: '', phone: '', email: '', notes: '',
  host_name: '', host_contact: '', total_amount: '', reminder: '' as ValidationState, bank_paycheck: '',
  identification_type: '', identification_number: '', emergency_contact_name: '', emergency_contact_phone: '',
  password: '', password_confirmation: ''
});
const validationMessage = ref<Record<keyof typeof guest.value, string>>({
  gender: '', check_in_date: '', check_out_date: '', dormitory_id: '', room_type_id: '', room_id: '', bed_id: '',
  first_name: '', last_name: '', phone: '', email: '', notes: '',
  host_name: '', host_contact: '', total_amount: '', reminder: '', bank_paycheck: '',
  identification_type: '', identification_number: '', emergency_contact_name: '', emergency_contact_phone: '',
  password: '', password_confirmation: ''
});

const genderOptions = [{ value: 'male', name: 'Male' }, { value: 'female', name: 'Female' }];
const identificationOptions = [
  { value: "passport", name: "Passport" },
  { value: "national_id", name: "National ID" },
  { value: "drivers_license", name: "Driver's License" },
  { value: "other", name: "Other" },
];

const currencySymbol = computed(() => getCurrencySymbol(settingsStore.publicSettings?.currency_symbol));

// --- Step Validators ---
const isRoomSelectionStepValid = computed(() => {
  return !!guest.value.gender && !!guest.value.check_in_date && !!guest.value.check_out_date &&
    !!guest.value.dormitory_id && !!guest.value.room_id && !!guest.value.bed_id;
});
const isAccountInfoStepValid = computed(() => {
  return /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(guest.value.email)
    && !!guest.value.phone.trim() && !!guest.value.password && guest.value.password === guest.value.password_confirmation;
});
const isPersonalInfoStepValid = computed(() => {
  return !!guest.value.first_name.trim() && !!guest.value.last_name.trim();
});
const isAdditionalInfoStepValid = computed(() => true); // No required fields
const isIdentificationStepValid = computed(() => true); // No required fields
const isPaymentStepValid = computed(() => !!guest.value.bank_paycheck);
const isDormitoryRulesAccepted = computed(() => !!guest.value.agree_to_dormitory_rules);

// --- Data Fetching ---
const allDormitories = ref<any[]>([]);
const availableRooms = ref<any[]>([]);
const loadingRooms = ref(false);
const availableBeds = ref<any[]>([]);
const loadingBeds = ref(false);

const dormitoryOptions = computed(() => {
  if (!guest.value.gender) return [];
  return allDormitories.value
    .filter(d => d.gender === 'mixed' || d.gender === guest.value.gender)
    .map(d => ({ value: d.id, name: d.name }));
});

const roomTypeOptions = computed(() => {
  if (!availableRooms.value.length) return [];
  const roomTypes = new Map<number, { name: string, daily_rate: string | null }>();
  availableRooms.value.forEach(room => {
    if (room.room_type && !roomTypes.has(room.room_type.id) && room.room_type.daily_rate) {
      roomTypes.set(room.room_type.id, { name: room.room_type.name, daily_rate: room.room_type.daily_rate });
    }
  });
  return Array.from(roomTypes, ([id, { name, daily_rate }]) => {
    const priceString = daily_rate != null ? ` - ${Math.round(parseFloat(daily_rate))} ${currencySymbol.value}/${t('day')}` : '';
    return { value: id, name: `${name}${priceString}` };
  });
});

const roomOptions = computed(() => {
  return availableRooms.value
    .filter(r => r.room_type_id === guest.value.room_type_id)
    .map((r) => {
      // Price is now on roomTypeOptions, so just show the room number here.
      return { value: r.id, name: `${r.number}` };
    });
});

const bedOptions = computed(() => {
  if (!guest.value.room_id) return [];
  const selectedRoom = availableRooms.value.find(r => r.id === guest.value.room_id);
  if (!selectedRoom) return [];
  return availableBeds.value.map((b) => {
    return { value: b.id, name: `${selectedRoom.number}-${b.bed_number}` };
  });
});

watch(() => guest.value.gender, async (gender) => {
  guest.value.dormitory_id = undefined;
  guest.value.room_type_id = undefined;
  if (!gender) {
    allDormitories.value = [];
    return;
  }
  try {
    const response = await dormitoryService.getAll();
    allDormitories.value = response.data || [];
  } catch (e) {
    showError(t('Failed to load dormitories.'));
  }
});

watch([() => guest.value.dormitory_id, () => guest.value.check_in_date, () => guest.value.check_out_date], async ([dormId, checkIn, checkOut]) => {
  guest.value.room_type_id = undefined;
  guest.value.room_id = undefined;
  availableRooms.value = [];
  if (!dormId || !checkIn || !checkOut) return;

  loadingRooms.value = true;
  try {
    const response = await roomService.getAvailable({
      dormitory_id: dormId,
      occupant_type: 'guest',
      start_date: checkIn,
      end_date: checkOut,
    });
    availableRooms.value = response.data || [];
  } catch (e) {
    console.error(e);
    showError(t('Failed to load available rooms.'));
  } finally {
    loadingRooms.value = false;
  }
});

watch(() => guest.value.room_type_id, () => {
  guest.value.room_id = undefined;
});

watch([() => guest.value.room_id, () => guest.value.check_in_date, () => guest.value.check_out_date], async ([roomId, checkIn, checkOut]) => {
  guest.value.bed_id = undefined;
  availableBeds.value = [];
  guest.value.total_amount = 0;

  if (!roomId || !checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
    return;
  }

  loadingBeds.value = true;
  try {
    // The beds are already filtered and attached to the room object from the 'available' rooms call
    const selectedRoom = availableRooms.value.find(r => r.id === roomId);
    const response = { data: selectedRoom?.beds || [] }; // Simulate an API response

    availableBeds.value = response.data || [];
  } catch (e) {
    console.error(e);
    showError(t('Failed to check bed availability.'));
    availableBeds.value = [];
  } finally {
    loadingBeds.value = false;
  }
});

// Watch for changes that affect the total amount
watch([() => guest.value.room_id, () => guest.value.check_in_date, () => guest.value.check_out_date], ([roomId, checkIn, checkOut]) => {
  const selectedRoom = availableRooms.value.find(room => room.id === roomId);
  if (selectedRoom?.room_type?.daily_rate && checkIn && checkOut && new Date(checkOut) > new Date(checkIn)) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    guest.value.total_amount = days > 0 ? days * selectedRoom.room_type.daily_rate : 0;
  } else {
    guest.value.total_amount = 0;
  }
});

const handleGuestRegistration = async () => {
  // Reset validation
  (Object.keys(validationState.value) as Array<keyof typeof guest.value>).forEach(key => {
    validationState.value[key] = '';
    validationMessage.value[key] = '';
  });

  try {
    const formData = new FormData();
    Object.entries(guest.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value as string | Blob);
    });
    const response = await authStore.register(formData);
    showSuccess(response?.message || t('Guest registration successful'));
    emit('registered', response?.message || t('Guest registration successful'));
  } catch (error: any) {
    const response = error.response;
    if (response?.status === 422 && response.data?.errors) {
      const errors = response.data.errors;
      showError(response.data.message || t('Please fix the errors in the form'));

      const fieldToStepMap: Record<string, number> = {
        gender: 0, check_in_date: 0, check_out_date: 0, dormitory_id: 0, room_type_id: 0, room_id: 0, bed_id: 0,
        first_name: 1, last_name: 1, phone: 1, email: 1,
      };

      let firstErrorStep = -1;

      for (const serverKey in errors) {
        const message = errors[serverKey][0];
        if (Object.prototype.hasOwnProperty.call(validationState.value, serverKey)) {
          const key = serverKey as keyof typeof guest.value;
          validationState.value[key] = 'error';
          validationMessage.value[key] = message;

          const step = fieldToStepMap[serverKey];
          if (step !== undefined && (firstErrorStep === -1 || step < firstErrorStep)) {
            firstErrorStep = step;
          }
        }
      }
      if (firstErrorStep !== -1) {
        currentStep.value = firstErrorStep;
      }
    } else {
      showError(response?.data?.message || t('Registration failed'));
    }
  }
};
</script>