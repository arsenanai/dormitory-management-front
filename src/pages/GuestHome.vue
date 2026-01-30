<template>
  <Navigation :title="t('Guest Home')">
    <!-- Note: This component uses `personalDataService.get()` which fetches from `/users/profile` -->
    <div class="container mx-auto px-4 py-8">
      <div class="mx-auto max-w-4xl">
        <!-- Page Header -->
        <!-- <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ $t('guest.home.title') }}
          </h1>
          <p class="text-gray-600">
            {{ $t('guest.home.subtitle') }}
          </p>
        </div> -->

        <!-- Loading State -->
        <div v-if="loading" class="py-8 text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">{{ $t("Loading...") }}</p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
        >
          {{ error }}
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Profile Section -->
          <div class="mb-6">
            <div class="flex items-center space-x-6">
              <!-- Guest Info -->
              <div class="flex-grow">
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ guestInfo.first_name }} {{ guestInfo.last_name }}
                </h1>
                <p class="text-gray-600">{{ guestInfo.email }}</p>
                <p class="text-sm text-gray-500">
                  {{ t("Status") }}:
                  <span
                    :class="{
                      'font-medium text-yellow-600': guestStatus === 'pending',
                      'font-medium text-green-600': guestStatus === 'active',
                      'font-medium text-red-600': guestStatus === 'passive',
                    }"
                  >
                    {{ formatGuestStatus(guestStatus) }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Guest Information Cards -->
          <div class="mb-8 grid grid-cols-1 gap-6">
            <!-- Living Room Information -->
            <div>
              <div class="mb-4 flex items-center" data-testid="living-room-info">
                <BuildingOfficeIcon class="text-secondary-600 mr-3 h-6 w-6" />
                <h2 class="text-xl font-semibold text-gray-900">
                  {{ $t("guest.home.livingRoom.title") }}
                </h2>
              </div>

              <div v-if="guestInfo.room" class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t("guest.home.livingRoom.roomNumber") }}:</span>
                  <span class="font-medium">{{ guestInfo.room.number }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t("guest.home.livingRoom.dormitory") }}:</span>
                  <span class="font-medium">{{
                    guestInfo.room.dormitory?.name || $t("common.notAvailable")
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t("guest.home.livingRoom.floor") }}:</span>
                  <span class="font-medium">{{
                    guestInfo.room.floor || $t("common.notAvailable")
                  }}</span>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">
                {{ $t("guest.home.livingRoom.noRoomAssigned") }}
              </div>
            </div>

            <!-- Rental Information -->
            <div>
              <div class="mb-4 flex items-center" data-testid="rental-info">
                <CurrencyDollarIcon class="text-secondary-600 mr-3 h-6 w-6" />
                <h2 class="text-xl font-semibold text-gray-900">
                  {{ $t("guest.home.rental.title") }}
                </h2>
              </div>

              <div class="space-y-3">
                <div v-if="guestInfo.guest_profile?.daily_rate" class="flex justify-between">
                  <span class="text-gray-600">{{ $t("guest.home.rental.dailyRate") }}:</span>
                  <span class="font-medium">{{
                    formatCurrency(parseFloat(guestInfo.guest_profile.daily_rate || 0))
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t("guest.home.rental.checkInDate") }}:</span>
                  <span class="font-medium">{{
                    formatDate(guestInfo.guest_profile?.visit_start_date)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t("guest.home.rental.checkOutDate") }}:</span>
                  <span class="font-medium">{{
                    formatDate(guestInfo.guest_profile?.visit_end_date)
                  }}</span>
                </div>
                <div v-if="totalDays" class="flex justify-between">
                  <span class="text-gray-600">{{ $t("guest.home.rental.totalDays") }}:</span>
                  <span class="font-medium">{{ totalDays }}</span>
                </div>
                <div v-if="totalAmount" class="flex justify-between border-t pt-2">
                  <span class="font-semibold text-gray-900"
                    >{{ $t("guest.home.rental.totalAmount") }}:</span
                  >
                  <span class="text-secondary-600 text-lg font-bold">
                    {{ formatCurrency(totalAmount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Book Another Stay Button -->
          <div class="mb-6 flex justify-end">
            <CButton
              @click="showBookingModal = true"
              variant="primary"
              data-testid="book-another-stay-btn"
            >
              {{ t("Book Another Stay") }}
            </CButton>
          </div>

          <!-- Reception Contacts -->
          <div class="mb-6">
            <div class="mb-4 flex items-center" data-testid="reception-contacts">
              <PhoneIcon class="text-secondary-600 mr-3 h-6 w-6" />
              <h2 class="text-xl font-semibold text-gray-900">
                {{ $t("guest.home.reception.title") }}
              </h2>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <!-- Reception Helpdesk -->
              <div
                v-if="receptionContacts.reception"
                class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <h3 class="font-medium text-gray-900">{{ t("Reception Helpdesk") }}</h3>
                <div class="space-y-2">
                  <a
                    :href="`tel:${receptionContacts.reception}`"
                    class="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <PhoneIcon class="mr-2 h-4 w-4 text-gray-500" />
                    <span>{{ receptionContacts.reception }}</span>
                  </a>
                </div>
              </div>

              <!-- Medical Doctor -->
              <div
                v-if="receptionContacts.medical"
                class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <h3 class="font-medium text-gray-900">{{ t("Medical Doctor") }}</h3>
                <div class="space-y-2">
                  <a
                    :href="`tel:${receptionContacts.medical}`"
                    class="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <HeartIcon class="mr-2 h-4 w-4 text-red-500" />
                    <span>{{ receptionContacts.medical }}</span>
                  </a>
                </div>
              </div>

              <!-- Admin Contact -->
              <div
                v-if="receptionContacts.admin"
                class="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <h3 class="font-medium text-gray-900">{{ t("Administrator") }}</h3>
                <div class="space-y-2">
                  <a
                    :href="receptionContacts.admin.whatsappLink"
                    target="_blank"
                    class="flex items-center text-gray-600 hover:text-blue-600"
                    v-if="receptionContacts.admin.phone"
                  >
                    <PhoneIcon class="mr-2 h-4 w-4 text-gray-500" />
                    <span>{{ receptionContacts.admin.phone }}</span>
                  </a>
                  <a
                    :href="receptionContacts.admin.emailLink"
                    v-if="receptionContacts.admin.email"
                    class="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <EnvelopeIcon class="mr-2 h-4 w-4 text-gray-500" />
                    <span>{{ receptionContacts.admin.email }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Another Stay Modal -->
    <CModal v-model="showBookingModal" :title="t('Book Another Stay')">
      <form @submit.prevent="handleNewBooking" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <CInput
            id="new-check-in"
            v-model="newBooking.check_in_date"
            type="date"
            :label="t('Check-in Date')"
            required
            :min="minCheckInDate"
            :validationState="bookingValidationState.check_in_date"
            :validationMessage="bookingValidationMessage.check_in_date"
          />
          <CInput
            id="new-check-out"
            v-model="newBooking.check_out_date"
            type="date"
            :label="t('Check-out Date')"
            :disabled="!newBooking.check_in_date"
            :min="newBooking.check_in_date"
            required
            :validationState="bookingValidationState.check_out_date"
            :validationMessage="bookingValidationMessage.check_out_date"
          />
        </div>
        <CSelect
          id="new-room-type"
          v-model="newBooking.room_type_id"
          :options="roomTypeOptions"
          :label="t('Select Room Type')"
          :disabled="!newBooking.check_in_date || !newBooking.check_out_date || loadingRooms"
          :validationState="bookingValidationState.room_type_id"
          :validationMessage="bookingValidationMessage.room_type_id"
        />
        <CSelect
          id="new-room"
          v-model="newBooking.room_id"
          :options="roomOptions"
          :label="t('Select Room')"
          :disabled="!newBooking.room_type_id || loadingRooms"
          :validationState="bookingValidationState.room_id"
          :validationMessage="bookingValidationMessage.room_id"
          required
        />
        <CSelect
          id="new-bed"
          v-model="newBooking.bed_id"
          :options="bedOptions"
          :label="t('Bed')"
          :disabled="!newBooking.room_id || loadingBeds"
          :validationState="bookingValidationState.bed_id"
          :validationMessage="bookingValidationMessage.bed_id"
          required
        />
        <div v-if="loadingRooms || loadingBeds" class="flex justify-center py-4">
          <div class="border-primary-500 h-5 w-5 animate-spin rounded-full border-b-2"></div>
        </div>
        <div
          v-if="!loadingRooms && newBooking.room_type_id && availableRooms.length === 0"
          class="p-4 text-center text-red-500"
        >
          {{ t("No rooms are available for the selected dates.") }}
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <CButton @click="showBookingModal = false" type="button">
            {{ t("Cancel") }}
          </CButton>
          <CButton type="submit" variant="primary" :disabled="isSubmittingBooking">
            {{ isSubmittingBooking ? t("Booking...") : t("Book Stay") }}
          </CButton>
        </div>
      </form>
    </CModal>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from "@heroicons/vue/24/outline";
import { authService, personalDataService, guestService } from "@/services/api";
import { useSettingsStore } from "@/stores/settings";
import { useAuthStore } from "@/stores/auth";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";
import CModal from "@/components/CModal.vue";
import CButton from "@/components/CButton.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const { showSuccess, showError } = useToast();

// Reactive data
const loading = ref(true);
const error = ref<string | null>(null);
const guestInfo = ref<any>({});
const guestStatus = ref<string>("active");

// Book Another Stay Modal
const showBookingModal = ref(false);
const isSubmittingBooking = ref(false);
const loadingRooms = ref(false);
const loadingBeds = ref(false);
const newBooking = ref({
  check_in_date: "",
  check_out_date: "",
  room_type_id: undefined as number | undefined,
  room_id: undefined as number | undefined,
  bed_id: undefined as number | undefined,
});
const bookingValidationState = ref({
  check_in_date: "" as "success" | "error" | "",
  check_out_date: "" as "success" | "error" | "",
  room_type_id: "" as "success" | "error" | "",
  room_id: "" as "success" | "error" | "",
  bed_id: "" as "success" | "error" | "",
});
const bookingValidationMessage = ref({
  check_in_date: "",
  check_out_date: "",
  room_type_id: "",
  room_id: "",
  bed_id: "",
});
const availableRooms = ref<any[]>([]);
const roomTypeOptions = ref<Array<{ value: number; name: string }>>([]);
const roomOptions = ref<Array<{ value: number; name: string }>>([]);
const bedOptions = ref<Array<{ value: number; name: string }>>([]);

const minCheckInDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split("T")[0];
});

const appName = import.meta.env.VITE_APP_NAME || "Dormitory CRM";

// Reception contacts derived from admin info
const receptionContacts = computed(() => {
  const dormitory = guestInfo.value.room?.dormitory;
  const admin = dormitory?.admin;

  const contacts: any = {
    reception: dormitory?.reception_phone || null,
    medical: dormitory?.medical_phone || null,
    admin: null,
  };

  if (admin) {
    const phone = admin.phone_numbers?.[0] || admin.phone;
    contacts.admin = {
      phone,
      email: admin.email,
      whatsappLink: `https://wa.me/${phone?.replace(/[^0-9]/g, "")}`,
      emailLink: `mailto:${admin.email}`,
    };
  }

  return contacts;
});

const totalDays = computed(() => {
  if (
    !guestInfo.value.guest_profile?.visit_start_date ||
    !guestInfo.value.guest_profile?.visit_end_date
  )
    return 0;
  const start = new Date(guestInfo.value.guest_profile.visit_start_date);
  const end = new Date(guestInfo.value.guest_profile.visit_end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const totalAmount = computed(() => {
  const guestProfile = guestInfo.value.guest_profile;
  const roomType = guestInfo.value.room?.room_type;

  if (guestProfile?.daily_rate) {
    return parseFloat(guestProfile.daily_rate) * totalDays.value;
  }
  return roomType?.semester_rate ? parseFloat(roomType.semester_rate) : 0;
});

// Methods
const fetchGuestData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await authService.getProfile(); // Fetches from /users/profile
    guestInfo.value = response.data;
    // Update guest status from profile data if available
    if (response.data.status) {
      guestStatus.value = response.data.status;
    }
  } catch (err: any) {
    console.error("Failed to fetch guest data:", err);
    error.value = err.response?.data?.message || t("Failed to load guest information");
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  const currencyCode = settingsStore.publicSettings?.currency_symbol || "USD";
  const locale = navigator.language;
  return formatCurrencyUtil(amount, currencyCode, locale);
};

const formatDate = (dateString: string) => {
  if (!dateString) return t("common.notAvailable");
  return new Date(dateString).toLocaleDateString();
};

const formatGuestStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: t("Pending"),
    active: t("Active"),
    passive: t("Passive"),
  };
  return statusMap[status] || status;
};

// Load available rooms when dates and room type are selected
const loadAvailableRooms = async () => {
  if (!newBooking.value.check_in_date || !newBooking.value.check_out_date) {
    availableRooms.value = [];
    roomOptions.value = [];
    bedOptions.value = [];
    return;
  }

  loadingRooms.value = true;
  try {
    const params: any = {
      start_date: newBooking.value.check_in_date,
      end_date: newBooking.value.check_out_date,
    };

    // Add room_type_id filter if backend supports it via query params
    // Note: The backend filters by room_type_id in RoomService, but we'll filter client-side for now
    const response = await guestService.getAvailableRooms(params);

    availableRooms.value = response.data || [];

    // Extract unique room types
    const roomTypesMap = new Map<number, string>();
    availableRooms.value.forEach((room: any) => {
      if (room.room_type && !roomTypesMap.has(room.room_type.id)) {
        roomTypesMap.set(room.room_type.id, room.room_type.name);
      }
    });
    roomTypeOptions.value = Array.from(roomTypesMap.entries()).map(([id, name]) => ({
      value: id,
      name: name,
    }));

    // Filter rooms by selected room type
    if (newBooking.value.room_type_id) {
      const filteredRooms = availableRooms.value.filter(
        (room: any) => room.room_type?.id === newBooking.value.room_type_id
      );
      roomOptions.value = filteredRooms.map((room: any) => ({
        value: room.id,
        name: `${room.number}${room.floor ? ` (${t("Floor")} ${room.floor})` : ""}`,
      }));
    } else {
      roomOptions.value = availableRooms.value.map((room: any) => ({
        value: room.id,
        name: `${room.number}${room.floor ? ` (${t("Floor")} ${room.floor})` : ""}`,
      }));
    }
  } catch (err: any) {
    console.error("Failed to load available rooms:", err);
    showError(err.response?.data?.message || t("Failed to load available rooms"));
  } finally {
    loadingRooms.value = false;
  }
};

// Load available beds when room is selected
const loadAvailableBeds = async () => {
  if (!newBooking.value.room_id) {
    bedOptions.value = [];
    return;
  }

  loadingBeds.value = true;
  try {
    const room = availableRooms.value.find((r: any) => r.id === newBooking.value.room_id);
    if (room && room.beds) {
      const availableBeds = room.beds.filter((bed: any) => !bed.is_occupied);
      bedOptions.value = availableBeds.map((bed: any) => ({
        value: bed.id,
        name: `${t("Bed")} ${bed.number || bed.id}`,
      }));
    } else {
      bedOptions.value = [];
    }
  } catch (err: any) {
    console.error("Failed to load available beds:", err);
    showError(err.response?.data?.message || t("Failed to load available beds"));
  } finally {
    loadingBeds.value = false;
  }
};

// Watch for changes to trigger room/bed loading
watch(
  () => [
    newBooking.value.check_in_date,
    newBooking.value.check_out_date,
    newBooking.value.room_type_id,
  ],
  () => {
    if (newBooking.value.check_in_date && newBooking.value.check_out_date) {
      loadAvailableRooms();
    }
  }
);

watch(
  () => newBooking.value.room_id,
  () => {
    if (newBooking.value.room_id) {
      loadAvailableBeds();
    } else {
      bedOptions.value = [];
      newBooking.value.bed_id = undefined;
    }
  }
);

watch(
  () => newBooking.value.room_type_id,
  () => {
    newBooking.value.room_id = undefined;
    newBooking.value.bed_id = undefined;
    if (newBooking.value.check_in_date && newBooking.value.check_out_date) {
      loadAvailableRooms();
    }
  }
);

// Handle new booking submission
const handleNewBooking = async () => {
  // Validation
  if (!newBooking.value.check_in_date) {
    bookingValidationState.value.check_in_date = "error";
    bookingValidationMessage.value.check_in_date = t("Check-in date is required");
    return;
  }
  if (!newBooking.value.check_out_date) {
    bookingValidationState.value.check_out_date = "error";
    bookingValidationMessage.value.check_out_date = t("Check-out date is required");
    return;
  }
  if (!newBooking.value.bed_id) {
    bookingValidationState.value.bed_id = "error";
    bookingValidationMessage.value.bed_id = t("Bed selection is required");
    return;
  }

  isSubmittingBooking.value = true;
  try {
    await personalDataService.update({
      check_in_date: newBooking.value.check_in_date,
      check_out_date: newBooking.value.check_out_date,
      bed_id: newBooking.value.bed_id,
    });

    showSuccess(t("New booking created successfully. Payment will be generated."));
    showBookingModal.value = false;

    // Reset form
    newBooking.value = {
      check_in_date: "",
      check_out_date: "",
      room_type_id: undefined,
      room_id: undefined,
      bed_id: undefined,
    };

    // Refresh guest data
    await fetchGuestData();
  } catch (err: any) {
    console.error("Failed to create new booking:", err);
    showError(err.response?.data?.message || t("Failed to create new booking"));
  } finally {
    isSubmittingBooking.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // Derive status from auth store initially
  guestStatus.value = (authStore.user?.status as string) || "pending";
  fetchGuestData();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
