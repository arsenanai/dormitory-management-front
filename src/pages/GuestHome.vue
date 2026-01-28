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
  HeartIcon,
} from "@heroicons/vue/24/outline";
import { authService } from "@/services/api";
import { useSettingsStore } from "@/stores/settings";
import { useAuthStore } from "@/stores/auth";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatters";

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();

// Reactive data
const loading = ref(true);
const error = ref<string | null>(null);
const guestInfo = ref<any>({});
const guestStatus = ref<string>("active");

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
  const currencyCode = settingsStore.publicSettings?.currency || "KZT";
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

// Lifecycle
onMounted(() => {
  // Derive status from auth store initially
  guestStatus.value = (authStore.user?.status as string) || "active";
  fetchGuestData();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
