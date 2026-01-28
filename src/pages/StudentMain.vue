<template>
  <Navigation :title="t('Student\'s page')">
    <div class="container mx-auto px-4">
      <!-- Profile Section -->
      <div class="mb-6">
        <div class="flex items-center space-x-6">
          <!-- Profile Picture -->
          <div class="flex-shrink-0">
            <div
              v-if="profilePictureUrl"
              class="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg"
            >
              <img
                :src="profilePictureUrl"
                :alt="t('Student Photo (3x4)')"
                class="h-full w-full object-cover"
                style="
                  image-rendering: pixelated;
                  image-rendering: -moz-crisp-edges;
                  image-rendering: crisp-edges;
                "
              />
            </div>
            <div
              v-else
              class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-lg"
            >
              <UserIcon class="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <!-- Student Info -->
          <div class="flex-grow">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ dashboardData.first_name }} {{ dashboardData.last_name }}
            </h1>
            <p class="text-gray-600">{{ dashboardData.email }}</p>
            <p class="text-sm text-gray-500">
              {{ t("Student ID") }}: {{ dashboardData.student_profile?.student_id || "-" }}
            </p>
            <p class="text-sm text-gray-500">
              {{ t("Status") }}:
              <span
                :class="{
                  'font-medium text-yellow-600': studentStatus === 'pending',
                  'font-medium text-green-600': studentStatus === 'active',
                  'font-medium text-red-600': studentStatus === 'suspended',
                }"
              >
                {{ formatStudentStatus(studentStatus) }}
              </span>
            </p>
          </div>
        </div>
      </div>
      <!-- Access status derived from student's status -->
      <!-- <div v-if="dormitoryAccessLoading" class="bg-primary-100 text-primary-800 p-3 rounded animate-pulse">
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
      </div> -->

      <!-- Room Information -->
      <div v-if="roomInfo" class="mb-6">
        <div class="mb-4 flex items-center">
          <BuildingOfficeIcon class="text-secondary-600 mr-3 h-6 w-6" />
          <h2 class="text-xl font-semibold text-gray-900">{{ t("Room Information") }}</h2>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t("Dormitory") }}:</span>
            <span class="font-medium">{{ roomInfo.dormitory_name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t("Floor") }}:</span>
            <span class="font-medium">{{ roomInfo.floor }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t("Room Number") }}:</span>
            <span class="font-medium">{{ roomInfo.room_number }}</span>
          </div>
          <div v-if="dashboardData.student_bed" class="flex justify-between">
            <span class="text-gray-600">{{ t("Bed") }}:</span>
            <span class="font-medium"
              >{{ roomInfo.room_number }}-{{ dashboardData.student_bed.bed_number }}</span
            >
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
              >
                <PhoneIcon class="mr-2 h-4 w-4 text-gray-500" />
                <span>{{ receptionContacts.admin.phone }}</span>
              </a>
              <a
                :href="receptionContacts.admin.emailLink"
                class="flex items-center text-gray-600 hover:text-blue-600"
              >
                <EnvelopeIcon class="mr-2 h-4 w-4 text-gray-500" />
                <span>{{ receptionContacts.admin.email }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- Payment Information -->
      <!-- <div class="bg-green-50 p-4 rounded-lg mb-6">
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
    </div> -->

      <!-- Messages Section -->
      <div class="mb-6">
        <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <ChatBubbleLeftRightIcon class="text-secondary-600 h-6 w-6" /> {{ t("Recent messages") }}
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
    </div>
  </Navigation>

  <!-- Message Detail Modal -->
  <CModal
    :model-value="showMessageModal"
    @update:model-value="showMessageModal = $event"
    :title="selectedMessage?.subject || t('Message')"
  >
    <div v-if="selectedMessage" class="flex h-full flex-col">
      <div class="flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <div class="flex items-center">
            <EnvelopeIcon class="mr-1 h-4 w-4 text-gray-400" />
            <span class="font-medium text-gray-800">{{ t("From") }}:</span>
            <span class="ml-1">{{ selectedMessage.from || t("Administrator") }}</span>
          </div>
          <div class="flex items-center">
            <ClockIcon class="mr-1 h-4 w-4 text-gray-400" />
            <span class="font-medium text-gray-800">{{ t("Date") }}:</span>
            <span class="ml-1">{{ selectedMessage.dateTime }}</span>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 flex-grow flex-col pt-2">
        <label class="mb-1 block flex-shrink-0 text-sm font-medium text-gray-700">{{
          t("Message Content")
        }}</label>
        <div
          class="w-full flex-grow overflow-y-auto rounded-lg border border-gray-300 bg-white p-4"
        >
          <p class="text-base whitespace-pre-wrap text-gray-800">
            {{ selectedMessage.content || t("No content available.") }}
          </p>
        </div>
      </div>
    </div>
  </CModal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTable from "@/components/CTable.vue";
import CTextarea from "@/components/CTextarea.vue";
import CModal from "@/components/CModal.vue";

import { Message } from "@/models/Message"; // Import the Message class
import {
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
} from "@heroicons/vue/24/outline";
import { authService, messageService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { formatDateToLocalString } from "@/utils/formatters";
import CButton from "@/components/CButton.vue";

const { t } = useI18n();
const authStore = useAuthStore();

const formatStudentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: t("Pending"),
    active: t("Active"),
    suspended: t("Suspended"),
  };
  return statusMap[status] || status;
};

// Message table columns
const messageColumns = [
  { key: "from", label: t("FROM") },
  { key: "subject", label: t("SUBJECT") },
  { key: "dateTime", label: t("DATE-TIME") },
];

const appName = import.meta.env.VITE_APP_NAME || "Dormitory CRM";
// Dashboard Data
const dashboardData = ref<any>({});
const roomInfo = ref<any>(null);
const messagesLoading = ref(false);

// Messages Data - will be populated from API
const messages = ref<Message[]>([]);

// Selected Message
const selectedMessage = ref<Message | null>(null);
const selectedMessageIndex = ref<number | null>(null);
const showMessageModal = ref(false);

// Status banner
const dormitoryAccessChecked = ref<boolean>(false);
const dormitoryAccessLoading = ref<boolean>(true);
const studentStatus = ref<string>("active");

// Select Message
const selectMessage = (message: Message, index: number): void => {
  selectedMessage.value = message;
  selectedMessageIndex.value = index;
};

// Handle message row click
const handleMessageClick = (message: Message): void => {
  const index = messages.value.findIndex((m) => m === message);
  if (index !== -1) {
    selectMessage(message, index);
    showMessageModal.value = true;
  }
};

// Reception contacts derived from admin info
const receptionContacts = computed(() => {
  const dormitory = dashboardData.value.room?.dormitory;
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

// Profile picture URL computed property
const profilePictureUrl = computed(() => {
  const profilePicture = dashboardData.value.student_profile?.files?.[2];
  if (!profilePicture) return null;

  // If it's already a full URL, return as is
  if (profilePicture.startsWith("http")) {
    return profilePicture;
  }

  // Use unified download endpoint for avatars
  return `/api/files/download/${profilePicture}`;
});

// Fetch dashboard data (do not touch messages loaded from my-messages)
const fetchDashboardData = async () => {
  try {
    // Use authService to get the full profile, including nested admin data
    const response = await authService.getProfile();
    dashboardData.value = response.data;
    // Update student status from dashboard data if available
    if (response.data.status) {
      studentStatus.value = response.data.status;
    }
    roomInfo.value = response.data.room_info || {
      room_number: response.data.room?.number,
      floor: response.data.room?.floor,
      dormitory_name: response.data.room?.dormitory?.name,
      room_type: response.data.room?.room_type?.name,
    };
  } catch (error) {
    //NOSONAR
    console.error("Failed to fetch dashboard data:", error);
  }
};

// Fetch recent admin messages
const fetchRecentAdminMessages = async () => {
  messagesLoading.value = true;

  try {
    // Check authentication status
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token) {
      console.error("❌ No authentication token found!");
      return;
    }

    // Use the correct endpoint for students to get their messages, limit to 3 recent
    const params = { page: 1, per_page: 3 } as const;
    const response = await messageService.getMyMessages(params as any);

    if (response?.data) {
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
        .map((msg: any) => {
          let created = msg.created_at || msg.sent_at || new Date().toISOString();
          created = formatDateToLocalString(created);
          return new Message(
            msg.sender?.name || "Admin",
            msg.receiver_name || "All",
            msg.title || msg.subject || "No Subject",
            created,
            msg.content || "No content"
          );
        });
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
    studentStatus.value = (authStore.user?.status as string) || "active";
    // Fire messages request immediately so it appears in Network panel regardless of profile
    try {
      await fetchRecentAdminMessages();
    } catch (err) {
      // Ignore errors in fetching recent admin messages
    }
    // Fetch dashboard data and recent messages in parallel
    await Promise.all([fetchDashboardData(), fetchRecentAdminMessages()]);

    // Set the latest message as active if available
    if (messages.value.length > 0) {
      const latestIndex = messages.value.length - 1;
      selectMessage(messages.value[latestIndex], latestIndex);
    }
  } catch (e) {
    console.error("❌ Error loading student dashboard:", e);

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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
