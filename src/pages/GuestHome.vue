<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('guest.home.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('guest.home.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ $t('Loading...') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Guest Information Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Living Room Information -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <BuildingOfficeIcon class="h-6 w-6 text-secondary-600 mr-3" />
              <h2 class="text-xl font-semibold text-gray-900">
                {{ $t('guest.home.livingRoom.title') }}
              </h2>
            </div>
            
            <div v-if="guestInfo.room_info" class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.livingRoom.roomNumber') }}:</span>
                <span class="font-medium">{{ guestInfo.room_info.room_number }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.livingRoom.dormitory') }}:</span>
                <span class="font-medium">{{ guestInfo.room_info.dormitory_name || $t('common.notAvailable') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.livingRoom.floor') }}:</span>
                <span class="font-medium">{{ guestInfo.room_info.floor || $t('common.notAvailable') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.livingRoom.capacity') }}:</span>
                <span class="font-medium">{{ guestInfo.room_info.capacity || $t('common.notAvailable') }}</span>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              {{ $t('guest.home.livingRoom.noRoomAssigned') }}
            </div>
          </div>

          <!-- Rental Information -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <CurrencyDollarIcon class="h-6 w-6 text-secondary-600 mr-3" />
              <h2 class="text-xl font-semibold text-gray-900">
                {{ $t('guest.home.rental.title') }}
              </h2>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.rental.dailyRate') }}:</span>
                <span class="font-medium">{{ formatCurrency(guestInfo.daily_rate || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.rental.checkInDate') }}:</span>
                <span class="font-medium">{{ formatDate(guestInfo.check_in_date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.rental.checkOutDate') }}:</span>
                <span class="font-medium">{{ formatDate(guestInfo.check_out_date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('guest.home.rental.totalDays') }}:</span>
                <span class="font-medium">{{ guestInfo.total_days || 0 }}</span>
              </div>
              <div class="flex justify-between border-t pt-2">
                <span class="text-gray-900 font-semibold">{{ $t('guest.home.rental.totalAmount') }}:</span>
                <span class="text-lg font-bold text-secondary-600">
                  {{ formatCurrency(guestInfo.total_amount || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reception Contacts -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-4">
            <PhoneIcon class="h-6 w-6 text-secondary-600 mr-3" />
            <h2 class="text-xl font-semibold text-gray-900">
              {{ $t('guest.home.reception.title') }}
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <h3 class="font-medium text-gray-900">{{ $t('guest.home.reception.mainContact') }}</h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <PhoneIcon class="h-4 w-4 text-gray-500 mr-2" />
                  <span class="text-gray-600">{{ receptionContacts.mainPhone }}</span>
                </div>
                <div class="flex items-center">
                  <EnvelopeIcon class="h-4 w-4 text-gray-500 mr-2" />
                  <span class="text-gray-600">{{ receptionContacts.mainEmail }}</span>
                </div>
                <div class="flex items-center">
                  <ClockIcon class="h-4 w-4 text-gray-500 mr-2" />
                  <span class="text-gray-600">{{ receptionContacts.mainHours }}</span>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <h3 class="font-medium text-gray-900">{{ $t('guest.home.reception.emergencyContact') }}</h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <PhoneIcon class="h-4 w-4 text-gray-500 mr-2" />
                  <span class="text-gray-600">{{ receptionContacts.emergencyPhone }}</span>
                </div>
                <div class="flex items-center">
                  <ExclamationTriangleIcon class="h-4 w-4 text-gray-500 mr-2" />
                  <span class="text-gray-600">{{ receptionContacts.emergencyAvailability }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
          <div class="flex items-center mb-4">
            <BoltIcon class="h-6 w-6 text-secondary-600 mr-3" />
            <h2 class="text-xl font-semibold text-gray-900">
              {{ $t('guest.home.quickActions.title') }}
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              @click="navigateToMessages"
              class="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChatBubbleLeftRightIcon class="h-5 w-5 text-blue-600 mr-2" />
              <span class="text-gray-700">{{ $t('guest.home.quickActions.messages') }}</span>
            </button>
            
            <button
              @click="navigateToProfile"
              class="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserIcon class="h-5 w-5 text-green-600 mr-2" />
              <span class="text-gray-700">{{ $t('guest.home.quickActions.profile') }}</span>
            </button>
            
            <button
              @click="contactReception"
              class="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PhoneIcon class="h-5 w-5 text-red-600 mr-2" />
              <span class="text-gray-700">{{ $t('guest.home.quickActions.contact') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
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
} from '@heroicons/vue/24/outline';
import { dashboardService } from '@/services/api';

const { t } = useI18n();
const router = useRouter();

// Reactive data
const loading = ref(true);
const error = ref<string | null>(null);
const guestInfo = ref<any>({});

// Reception contacts (hardcoded for now, could be moved to API later)
const receptionContacts = ref({
  mainPhone: '+7 (777) 123-45-67',
  mainEmail: 'reception@sdu.edu.kz',
  mainHours: '24/7',
  emergencyPhone: '+7 (777) 999-99-99',
  emergencyAvailability: 'Available 24/7',
});

// Methods
const fetchGuestData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await dashboardService.getGuestStats();
    guestInfo.value = response.data;
  } catch (err: any) {
    console.error('Failed to fetch guest data:', err);
    error.value = err.response?.data?.message || t('Failed to load guest information');
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  return `₸${amount.toLocaleString()}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return t('common.notAvailable');
  return new Date(dateString).toLocaleDateString();
};

const navigateToMessages = () => {
  router.push('/messages');
};

const navigateToProfile = () => {
  router.push('/guest-form');
};

const contactReception = () => {
  // Could open a modal or navigate to contact page
  window.open(`tel:${receptionContacts.value.mainPhone}`, '_blank');
};

// Lifecycle
onMounted(() => {
  fetchGuestData();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style> 