<template>
  <Navigation :title="t('Student\'s page')">
    <!-- Dormitory Access Status (NEW) -->
    <div v-if="dormitoryAccessLoading" class="bg-primary-100 text-primary-800 p-3 rounded animate-pulse">
      {{ t('Loading dormitory access information...') }}
    </div>

    <div v-if="!canAccessDormitory" class="bg-red-100 text-red-800 p-3 rounded">
      {{ t('Access Denied') }}
      <div class="text-xs mt-1">{{ dormitoryAccessReason }}</div>
    </div>
    <div v-else class="bg-green-100 text-green-800 p-3 rounded">
      {{ t('Access Granted') }}
      <div class="text-xs mt-1">{{ t('You have access to the dormitory.') }}</div>
    </div>

    <!-- Room Information -->
    <div v-if="roomInfo" class="bg-blue-50 p-4 rounded-lg mb-6">
      <h3 class="text-lg font-semibold text-blue-800 mb-2">{{ t('Room Information') }}</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">{{ t('Room Number') }}:</span> {{ roomInfo.room_number }}
        </div>
        <div>
          <span class="font-medium">{{ t('Floor') }}:</span> {{ roomInfo.floor }}
        </div>
        <div>
          <span class="font-medium">{{ t('Dormitory') }}:</span> {{ roomInfo.dormitory_name }}
        </div>
        <div>
          <span class="font-medium">{{ t('Room Type') }}:</span> {{ roomInfo.room_type }}
        </div>
      </div>
    </div>

    <!-- Payment Information -->
    <div class="bg-green-50 p-4 rounded-lg mb-6">
      <h3 class="text-lg font-semibold text-green-800 mb-2">{{ t('Payment Information') }}</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">{{ t('My Payments') }}:</span> {{ dashboardData.my_payments || 0 }}
        </div>
        <div>
          <span class="font-medium">{{ t('Upcoming Payments') }}:</span> {{ dashboardData.upcoming_payments || 0 }}
        </div>
        <div>
          <span class="font-medium">{{ t('Payment History') }}:</span> {{ dashboardData.payment_history || 0 }}
        </div>
      </div>
    </div>

    <h2 class="text-lg font-bold text-primary-700 mt-6 mb-4">
      {{ t('Dormitory Information') }}
    </h2>
    <!-- Registration Status -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-primary-600 mb-2">
        {{ t('Registration Status') }}
      </h3>
    </div>

    <!-- Messages Section -->
    <div class="mb-6">
      <h2 class="flex items-center gap-2 text-lg font-bold text-gray-800">
        {{ t("MESSAGES") }}
        <span
          class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-800"
        >
          {{ dashboardData.my_messages || 0 }}
        </span>
        <span v-if="dashboardData.unread_messages_count > 0"
          class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-xs font-semibold text-red-800"
        >
          {{ dashboardData.unread_messages_count }}
        </span>
      </h2>

      <!-- Messages Table -->
      <CTable 
        :columns="messageColumns" 
        :data="messages" 
        :loading="messagesLoading"
        hoverable
        @row-click="handleMessageClick"
      />
    </div>

    <!-- Selected Message -->
    <div v-if="selectedMessage" class="flex flex-col gap-4">
      <h3 class="text-sm font-medium text-gray-700">
        {{ t("From") }}: {{ selectedMessage.from }}
        <span class="mt-4">{{ selectedMessage.dateTime }}</span>
      </h3>
      <div>
        <CTextarea
          id="selected-message"
          v-model="selectedMessage.content"
          :label="t('Selected Message')"
          :placeholder="t('No message selected')"
          :rows="5"
          readonly
        />
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTable from "@/components/CTable.vue";
import CTextarea from "@/components/CTextarea.vue";
import { Message } from "@/models/Message"; // Import the Message class
import { dormitoryAccessService, dashboardService } from '@/services/api';

const { t } = useI18n();

// Message table columns
const messageColumns = [
  { key: 'from', label: t('FROM') },
  { key: 'subject', label: t('SUBJECT') },
  { key: 'dateTime', label: t('DATE-TIME') },
];

// Dashboard Data
const dashboardData = ref<any>({});
const roomInfo = ref<any>(null);
const messagesLoading = ref(false);

// Messages Data - will be populated from API
const messages = ref<Message[]>([]);

// Selected Message
const selectedMessage = ref<Message | null>(null);
const selectedMessageIndex = ref<number | null>(null);

// Dormitory Access Status
const canAccessDormitory = ref<boolean>(true);
const dormitoryAccessChecked = ref<boolean>(false);
const dormitoryAccessReason = ref<string>('');
const dormitoryAccessLoading = ref<boolean>(true);

// Select Message
const selectMessage = (message: Message, index: number): void => {
  selectedMessage.value = message;
  selectedMessageIndex.value = index;
};

// Handle message row click
const handleMessageClick = (message: Message): void => {
  const index = messages.value.findIndex(m => m === message);
  if (index !== -1) {
    selectMessage(message, index);
  }
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    const response = await dashboardService.getStudentStats();
    dashboardData.value = response.data;
    roomInfo.value = response.data.room_info;
    
    // Convert API messages to Message objects if available
    if (response.data.messages && Array.isArray(response.data.messages)) {
      messages.value = response.data.messages.map((msg: any) => 
        new Message(
          msg.sender_name || 'Admin',
          msg.receiver_name || 'All',
          msg.subject || 'No Subject',
          msg.created_at || new Date().toISOString(),
          msg.content || 'No content'
        )
      );
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Fallback to default messages if API fails
    messages.value = [
      new Message(
        "Admin",
        "All",
        "Welcome",
        "01-09-2024 11:34",
        "Welcome to the dormitory management system!",
      ),
      new Message(
        "Admin",
        "All",
        "Reminder",
        "02-09-2024 10:00",
        "Don't forget to complete your registration.",
      ),
    ];
  }
};

// Set the latest message as active on component mount
onMounted(async () => {
  dormitoryAccessLoading.value = true;
  messagesLoading.value = true;
  
  try {
    // Fetch dormitory access status
    const accessResponse = await dormitoryAccessService.check();
    canAccessDormitory.value = !!accessResponse.data.can_access;
    dormitoryAccessReason.value = accessResponse.data.reason || (accessResponse.data.can_access ? '' : t('No current semester payment or payment not approved.'));
    
    // Fetch dashboard data
    await fetchDashboardData();
    
    // Set the latest message as active if available
    if (messages.value.length > 0) {
      const latestIndex = messages.value.length - 1;
      selectMessage(messages.value[latestIndex], latestIndex);
    }
  } catch (e) {
    console.error('Error loading student dashboard:', e);
    canAccessDormitory.value = false;
    dormitoryAccessReason.value = t('Unable to check access status.');
    
    // Set fallback messages
    messages.value = [
      new Message(
        "Admin",
        "All",
        "Welcome",
        "01-09-2024 11:34",
        "Welcome to the dormitory management system!",
      ),
      new Message(
        "Admin",
        "All",
        "Reminder",
        "02-09-2024 10:00",
        "Don't forget to complete your registration.",
      ),
    ];
  } finally {
    dormitoryAccessChecked.value = true;
    dormitoryAccessLoading.value = false;
    messagesLoading.value = false;
  }
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
