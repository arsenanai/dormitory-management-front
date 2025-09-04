<template>
  <Navigation :title="t('Student\'s page')">
    <!-- Access status derived from student's status -->
    <div v-if="dormitoryAccessLoading" class="bg-primary-100 text-primary-800 p-3 rounded animate-pulse">
      {{ t('Loading status...') }}
    </div>
    <div v-else>
      <div v-if="studentStatus === 'inactive'" class="bg-red-100 text-red-800 p-3 rounded">
        {{ t('Access Denied') }}
        <div class="text-xs mt-1">{{ t('Your account is inactive.') }}</div>
      </div>
      <div v-else-if="studentStatus === 'pending'" class="bg-yellow-100 text-yellow-800 p-3 rounded">
        {{ t('Access Pending') }}
        <div class="text-xs mt-1">{{ t('Your account is pending approval.') }}</div>
      </div>
      <div v-else class="bg-green-100 text-green-800 p-3 rounded">
        {{ t('Access Granted') }}
        <div class="text-xs mt-1">{{ t('You have access to the dormitory.') }}</div>
      </div>
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
        {{ t('Recent messages') }}
      </h2>

      <!-- Messages Table -->
      <CTable 
        :columns="messageColumns" 
        :data="messages" 
        :loading="messagesLoading"
        hoverable
        data-testid="messages-table"
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
import { dashboardService, messageService } from '@/services/api';
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const authStore = useAuthStore();

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

// Status banner
const dormitoryAccessChecked = ref<boolean>(false);
const dormitoryAccessLoading = ref<boolean>(true);
const studentStatus = ref<string>('active');

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

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
};

// Fetch dashboard data (do not touch messages loaded from my-messages)
const fetchDashboardData = async () => {
  try {
    const response = await dashboardService.getStudentStats();
    dashboardData.value = response.data;
    roomInfo.value = response.data.room_info;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
};

// Fetch recent admin messages
const fetchRecentAdminMessages = async () => {
  messagesLoading.value = true;
  
  try {
    
    // Check authentication status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      console.error('❌ No authentication token found!');
      return;
    }
    
    // Use the correct endpoint for students to get their messages, limit to 3 recent
    const params = { page: 1, per_page: 3 } as const;
    const response = await messageService.getMyMessages(params as any);
    
    if (response && response.data) {
      
      let messagesArray: any[] = [];
      
      if (Array.isArray(response.data)) {
        messagesArray = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        messagesArray = response.data.data;
      } else {
        messagesArray = [];
      }
      
      // Sort by id desc explicitly, take 3, convert to Message objects
      messages.value = messagesArray
        .sort((a: any, b: any) => (b?.id || 0) - (a?.id || 0))
        .slice(0, 3)
        .map((msg: any) => new Message(
          msg.sender?.name || 'Admin',
          msg.receiver_name || 'All',
          msg.title || msg.subject || 'No Subject',
          msg.created_at || msg.sent_at || new Date().toISOString(),
          msg.content || 'No content'
        ));
    } else {
      messages.value = [];
      
    }
    
  } catch (error) {
    
    messages.value = [];
  } finally {
    messagesLoading.value = false;
  }
};

// Set the latest message as active on component mount
onMounted(async () => {
  dormitoryAccessLoading.value = true;
  messagesLoading.value = true;
  
  try {
    
    // derive status from auth store
    studentStatus.value = (authStore.user?.status as string) || 'active';
    // Fire messages request immediately so it appears in Network panel regardless of profile
    try {
      await fetchRecentAdminMessages();
    } catch (err) {
      
    }
    // Fetch dashboard data and recent messages in parallel
    await Promise.all([
      fetchDashboardData(),
      fetchRecentAdminMessages()
    ]);
    
    
    // Set the latest message as active if available
    if (messages.value.length > 0) {
      const latestIndex = messages.value.length - 1;
      selectMessage(messages.value[latestIndex], latestIndex);
    }
  } catch (e) {
    console.error('❌ Error loading student dashboard:', e);
    
    // Don't set fallback messages - let the API handle it
    messages.value = [];
  } finally {
    dormitoryAccessChecked.value = true;
    dormitoryAccessLoading.value = false;
    messagesLoading.value = false;
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
