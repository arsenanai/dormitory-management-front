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
          
          <div v-if="guestInfo.room" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('guest.home.livingRoom.roomNumber') }}:</span>
              <span class="font-medium">{{ guestInfo.room.number }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('guest.home.livingRoom.dormitory') }}:</span>
              <span class="font-medium">{{ guestInfo.room.dormitory?.name || $t('common.notAvailable') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('guest.home.livingRoom.floor') }}:</span>
              <span class="font-medium">{{ guestInfo.room.floor || $t('common.notAvailable') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('guest.home.livingRoom.capacity') }}:</span>
              <span class="font-medium">{{ guestInfo.room.capacity || $t('common.notAvailable') }}</span>
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
              <span class="font-medium">{{ formatCurrency(guestInfo.dailyRate || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('guest.home.rental.checkInDate') }}:</span>
              <span class="font-medium">{{ formatDate(guestInfo.checkInDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('guest.home.rental.checkOutDate') }}:</span>
              <span class="font-medium">{{ formatDate(guestInfo.checkOutDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('guest.home.rental.totalDays') }}:</span>
              <span class="font-medium">{{ calculateTotalDays() }}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-gray-900 font-semibold">{{ $t('guest.home.rental.totalAmount') }}:</span>
              <span class="text-lg font-bold text-secondary-600">
                {{ formatCurrency(calculateTotalAmount()) }}
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
                <span class="text-gray-600">{{ receptionContacts.workingHours }}</span>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900">{{ $t('guest.home.reception.emergency') }}</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <PhoneIcon class="h-4 w-4 text-red-500 mr-2" />
                <span class="text-gray-600">{{ receptionContacts.emergencyPhone }}</span>
              </div>
              <div class="flex items-center">
                <ExclamationTriangleIcon class="h-4 w-4 text-red-500 mr-2" />
                <span class="text-gray-600">{{ $t('guest.home.reception.emergencyAvailable') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {{ $t('guest.home.quickActions.title') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CButton
            @click="navigateToMessages"
            variant="outline"
            class="flex items-center justify-center"
          >
            <ChatBubbleLeftRightIcon class="h-5 w-5 mr-2" />
            {{ $t('guest.home.quickActions.messages') }}
          </CButton>
          
          <CButton
            @click="navigateToProfile"
            variant="outline"
            class="flex items-center justify-center"
          >
            <UserIcon class="h-5 w-5 mr-2" />
            {{ $t('guest.home.quickActions.profile') }}
          </CButton>
          
          <CButton
            @click="contactReception"
            variant="outline"
            class="flex items-center justify-center"
          >
            <PhoneIcon class="h-5 w-5 mr-2" />
            {{ $t('guest.home.quickActions.contactReception') }}
          </CButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon
} from '@heroicons/vue/24/outline';
import CButton from '@/components/CButton.vue';

// Define component name for test recognition
defineOptions({ name: 'GuestHome' });

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

// Guest information
const guestInfo = ref({
  room: null as any,
  dailyRate: 0,
  checkInDate: null as string | null,
  checkOutDate: null as string | null
});

// Reception contacts (should be configured by admin)
const receptionContacts = ref({
  mainPhone: '+7 (777) 123-45-67',
  mainEmail: 'reception@sdu.edu.kz',
  workingHours: '24/7',
  emergencyPhone: '+7 (777) 999-99-99'
});

// Load guest information
const loadGuestInfo = async () => {
  try {
    if (authStore.user) {
      // In a real implementation, this would fetch guest-specific data
      // For now, we'll use mock data
      guestInfo.value = {
        room: {
          number: '101',
          dormitory: { name: 'Dormitory A' },
          floor: '1',
          capacity: 2
        },
        dailyRate: 5000,
        checkInDate: '2024-01-15',
        checkOutDate: '2024-01-20'
      };
    }
  } catch (error) {
    console.error('Error loading guest information:', error);
  }
};

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('kk-KZ', {
    style: 'currency',
    currency: 'KZT'
  }).format(amount);
};

const formatDate = (date: string | null) => {
  if (!date) return t('common.notAvailable');
  return new Date(date).toLocaleDateString();
};

const calculateTotalDays = () => {
  if (!guestInfo.value.checkInDate || !guestInfo.value.checkOutDate) return 0;
  const checkIn = new Date(guestInfo.value.checkInDate);
  const checkOut = new Date(guestInfo.value.checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateTotalAmount = () => {
  return calculateTotalDays() * guestInfo.value.dailyRate;
};

// Navigation functions
const navigateToMessages = () => {
  router.push('/messages');
};

const navigateToProfile = () => {
  if (authStore.user) {
    router.push(`/guest-form/${authStore.user.id}`);
  }
};

const contactReception = () => {
  // In a real implementation, this could open a phone dialer or contact form
  window.open(`tel:${receptionContacts.value.mainPhone}`);
};

// Load data on component mount
onMounted(() => {
  loadGuestInfo();
});
</script> 