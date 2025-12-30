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

          <!-- Reception Contacts -->
          <div>
            <div class="mb-4 flex items-center" data-testid="reception-contacts">
              <PhoneIcon class="text-secondary-600 mr-3 h-6 w-6" />
              <h2 class="text-xl font-semibold text-gray-900">
                {{ $t("guest.home.reception.title") }}
              </h2>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2" v-if="receptionContacts">
              <div class="space-y-3">
                <h3 class="font-medium text-gray-900">
                  {{ $t("guest.home.reception.mainContact") }}
                </h3>
                <div class="space-y-2">
                  <a
                    :href="receptionContacts.whatsappLink"
                    target="_blank"
                    class="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <PhoneIcon class="mr-2 h-4 w-4 text-gray-500" />
                    <span>{{ receptionContacts.phone }}</span>
                  </a>
                  <a
                    :href="receptionContacts.emailLink"
                    class="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <EnvelopeIcon class="mr-2 h-4 w-4 text-gray-500" />
                    <span>{{ receptionContacts.email }}</span>
                  </a>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              {{ $t("guest.home.reception.noContact") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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
  UserIcon,
} from "@heroicons/vue/24/outline";
import { authService } from "@/services/api";
import { useSettingsStore } from "@/stores/settings";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();

// Reactive data
const loading = ref(true);
const error = ref<string | null>(null);
const guestInfo = ref<any>({});

const appName = import.meta.env.VITE_APP_NAME || "Dormitory CRM";

// Reception contacts derived from admin info
const receptionContacts = computed(() => {
  const admin = guestInfo.value.room?.dormitory?.admin;
  if (!admin) return null;

  const phone = admin.phone_numbers?.[0] || admin.phone;
  const email = admin.email;

  const messageBody = encodeURIComponent(t("guest.home.reception.prefilledMessage", { appName }));

  return {
    phone,
    email,
    whatsappLink: phone ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${messageBody}` : "#",
    emailLink: email
      ? `mailto:${email}?subject=${encodeURIComponent(t("guest.home.reception.prefilledSubject"))}&body=${messageBody}`
      : "#",
  };
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
  } catch (err: any) {
    console.error("Failed to fetch guest data:", err);
    error.value = err.response?.data?.message || t("Failed to load guest information");
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  const currencyCode = settingsStore.publicSettings?.currency || "KZT";
  const locale = navigator.language;
  return formatCurrencyUtil(amount, currencyCode, locale);
};

const formatDate = (dateString: string) => {
  if (!dateString) return t("common.notAvailable");
  return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  fetchGuestData();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
