<template>
  <Navigation :title="t('My messages')">
    <!-- Filters -->
    <div
      class="mb-4 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center"
    >
      <CSelect
        id="faculty-filter"
        v-model="filters.faculty"
        :options="facultyOptions"
        :label="t('Faculty')"
        :placeholder="t('Select Faculty')"
        class="lg:w-40"
      />
      <CSelect
        id="room-filter"
        v-model="filters.room"
        :options="roomOptions"
        :label="t('Room')"
        :placeholder="t('Select Room')"
        class="lg:w-40"
      />
      <CSelect
        id="dormitory-filter"
        v-model="filters.dormitory"
        :options="dormitoryOptions"
        :label="t('Dormitory')"
        :placeholder="t('Select Dormitory')"
        class="lg:w-40"
      />
    </div>

    <!-- Message Input -->
    <div class="mb-4">
      <CTextarea
        id="message-input"
        v-model="message"
        :label="t('Message')"
        :placeholder="t('Enter your message here')"
        :validationMessage="t('This field cannot be empty.')"
      />
    </div>

    <!-- Send Button -->
    <div class="mb-6 flex justify-end">
      <CButton variant="primary" @click="sendMessage">
        <PaperAirplaneIcon class="h-5 w-5" /> {{ t("Send") }}
      </CButton>
    </div>

    <!-- Message History -->
    <h2 class="mb-4 text-lg font-bold text-gray-800">
      {{ t("Message History") }}
    </h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4 text-primary-600">
      {{ t("Loading...") }}
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <CTable v-if="!loading && !error">
      <CTableHead>
        <CTableHeadCell>{{ t("FROM") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("TO") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("SUBJECT") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("DATE-TIME") }}</CTableHeadCell>
      </CTableHead>
      <CTableBody>
        <CTableRow
          v-for="(msg, index) in filteredMessages"
          :key="msg.id || index"
          @click="selectMessage(msg, index)"
          :class="{
            'bg-gray-100 text-gray-900': selectedMessageIndex === index,
            'cursor-pointer hover:bg-gray-50': selectedMessageIndex !== index,
          }"
          tabindex="0"
          class=""
        >
          <CTableCell>{{ msg.sender?.name || msg.from || t('System') }}</CTableCell>
          <CTableCell>{{ msg.receiver?.name || msg.to || t('All') }}</CTableCell>
          <CTableCell>{{ msg.subject || t('No Subject') }}</CTableCell>
          <CTableCell>{{ formatDate(msg.created_at || msg.dateTime) }}</CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>

    <!-- Selected Message -->
    <div class="mt-6">
      <CTextarea
        id="selected-message"
        v-model="selectedMessage"
        :label="t('Selected Message')"
        :placeholder="t('No message selected')"
        :rows="5"
        readonly
      />
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CTextarea from "@/components/CTextarea.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import { PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import { messageService, dormitoryService, roomService } from "@/services/api";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const { showError, showSuccess } = useToast();

// Define types for filters
interface Filter {
  faculty: string;
  room: string;
  dormitory: string;
}

// Filters
const filters = ref<Filter>({
  faculty: "",
  room: "",
  dormitory: "",
});

// Data
const messages = ref<any[]>([]);
const dormitories = ref<any[]>([]);
const rooms = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Load data on component mount
const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required';
      messages.value = [];
      dormitories.value = [];
      rooms.value = [];
      return;
    }

    const [messagesResponse, dormitoriesResponse, roomsResponse] = await Promise.all([
      messageService.getMyMessages(),
      dormitoryService.getAll(),
      roomService.getAll()
    ]);
    
    // Handle Laravel paginated response structure for messages
    if (messagesResponse && messagesResponse.data) {
      if (messagesResponse.data.data && Array.isArray(messagesResponse.data.data)) {
        messages.value = messagesResponse.data.data;
      } else if (Array.isArray(messagesResponse.data)) {
        messages.value = messagesResponse.data;
      } else {
        messages.value = [];
      }
    } else {
      messages.value = [];
    }
    
    // Handle Laravel paginated response structure for dormitories
    if (dormitoriesResponse && dormitoriesResponse.data) {
      if (dormitoriesResponse.data.data && Array.isArray(dormitoriesResponse.data.data)) {
        dormitories.value = dormitoriesResponse.data.data;
      } else if (Array.isArray(dormitoriesResponse.data)) {
        dormitories.value = dormitoriesResponse.data;
      } else {
        dormitories.value = [];
      }
    } else {
      dormitories.value = [];
    }
    
    // Handle Laravel paginated response structure for rooms
    if (roomsResponse && roomsResponse.data) {
      if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
        rooms.value = roomsResponse.data.data;
      } else if (Array.isArray(roomsResponse.data)) {
        rooms.value = roomsResponse.data;
      } else {
        rooms.value = [];
      }
    } else {
      rooms.value = [];
    }
    
    console.log('Fetched messages:', messages.value);
    console.log('Fetched dormitories:', dormitories.value);
    console.log('Fetched rooms:', rooms.value);
  } catch (err) {
    console.error('Error loading messages:', err);
    error.value = 'Failed to load messages data';
    showError(t('Failed to load messages data'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// Options for filters
const facultyOptions = [
  { value: "", name: t("All Faculties") },
  { value: "engineering", name: t("Engineering") },
  { value: "business", name: t("Business") },
  { value: "law", name: t("Law") },
];

const roomOptions = computed(() => [
  { value: "", name: t("All Rooms") },
  ...rooms.value.map(room => ({ value: room.id, name: room.number }))
]);

const dormitoryOptions = computed(() => [
  { value: "", name: t("All Dormitories") },
  ...dormitories.value.map(dorm => ({ value: dorm.id, name: dorm.name }))
]);

// Message Input
const message = ref<string>("");

// Filtered messages
const filteredMessages = computed(() => {
  if (!messages.value.length) return [];
  return messages.value.filter(msg => {
    const facultyMatch = !filters.value.faculty || msg.faculty === filters.value.faculty;
    const roomMatch = !filters.value.room || msg.room_id === parseInt(filters.value.room);
    const dormMatch = !filters.value.dormitory || msg.dormitory_id === parseInt(filters.value.dormitory);
    return facultyMatch && roomMatch && dormMatch;
  });
});

// Selected Message
const selectedMessage = ref<string>("");
const selectedMessageIndex = ref<number | null>(null);

// Send Message
const sendMessage = async (): Promise<void> => {
  if (!message.value.trim()) return;
  
  try {
    const messageData = {
      content: message.value,
      subject: t('New Message'),
      faculty: filters.value.faculty,
      room_id: filters.value.room ? parseInt(filters.value.room) : null,
      dormitory_id: filters.value.dormitory ? parseInt(filters.value.dormitory) : null,
    };
    
    await messageService.create(messageData);
    message.value = '';
    await loadData(); // Reload messages
    showSuccess(t('Message sent successfully'));
  } catch (err) {
    showError(t('Failed to send message'));
  }
};

// Select Message
const selectMessage = (msg: any, index: number): void => {
  selectedMessage.value = msg.content || msg.message || '';
  selectedMessageIndex.value = index;
  
  // Mark as read if not already read
  if (!msg.is_read && msg.id) {
    const markAsReadPromise = messageService.markAsRead(msg.id);
    if (markAsReadPromise && typeof markAsReadPromise.catch === 'function') {
      markAsReadPromise.catch(err => {
        showError(t('Failed to mark message as read'));
      });
    }
  }
};

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
};

// Set the first message as active on component mount
const setFirstMessageActive = () => {
  if (filteredMessages.value.length > 0) {
    selectMessage(filteredMessages.value[0], 0);
  }
};

// Watch for filtered messages changes
watch(filteredMessages, () => {
  setFirstMessageActive();
}, { immediate: true });
</script>

<style scoped>
/* Add custom styles if needed */
</style>
