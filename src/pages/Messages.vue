<template>
  <Navigation :title="t('My messages')">
    <div data-testid="messages-page">
    <!-- Filters -->
    <div
      class="mb-4 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center"
    >
      <CInput
        id="faculty-filter"
        v-model="filters.faculty"
        type="text"
        :label="t('Faculty')"
        :placeholder="t('Enter Faculty Name')"
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

    <!-- Admin Actions -->
    <div v-if="isAdmin" class="mb-4 flex justify-end gap-2">
      <CButton data-testid="add-message-button" @click="openCreateModal">{{ t('Add Message') }}</CButton>
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

    <div v-if="!loading && !error" data-testid="messages-table">
    <CTable>
      <CTableHead>
        <CTableHeadCell>{{ t("FROM") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("TO") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("SUBJECT") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("DATE-TIME") }}</CTableHeadCell>
        <CTableHeadCell v-if="isAdmin">{{ t('Actions') }}</CTableHeadCell>
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
          <CTableCell v-if="isAdmin">
            <div class="flex gap-2 justify-end">
              <CButton size="small" @click.stop="openEditModal(msg)" data-testid="edit-message-button">{{ t('Edit') }}</CButton>
              <CButton size="small" variant="danger" @click.stop="confirmDelete(msg.id)" data-testid="delete-message-button">{{ t('Delete') }}</CButton>
            </div>
          </CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>
    </div>

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
    </div>
  </Navigation>

  <!-- Create/Edit Modal -->
  <CModal v-if="isAdmin" v-model="showForm">
    <template #header>
      <h2 class="text-xl font-bold">{{ editingMessage ? t('Edit Message') : t('Add Message') }}</h2>
    </template>
    <form @submit.prevent="submitForm">
      <div class="space-y-4">
        <CInput data-testid="message-title-input" v-model="form.title" :label="t('Title')" required />
        <CTextarea data-testid="message-content-input" v-model="form.content" :label="t('Content')" required />
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <CButton @click="closeForm">{{ t('Cancel') }}</CButton>
        <CButton type="submit" variant="primary" data-testid="message-submit-button">{{ editingMessage ? t('Update') : t('Create') }}</CButton>
      </div>
    </form>
  </CModal>

  <!-- Delete Confirmation -->
  <CConfirmationModal
    v-if="isAdmin && showDelete"
    :message="t('Are you sure? This change is not recoverable')"
    :title="t('Delete Message')"
    :confirm-text="t('Delete')"
    :cancel-text="t('Cancel')"
    @confirm="deleteMessage"
    @cancel="showDelete = false"
  />
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
import CInput from "@/components/CInput.vue"; // Added CInput import
import { PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import { messageService, dormitoryService, roomService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import CModal from "@/components/CModal.vue";
import CConfirmationModal from "@/components/CConfirmationModal.vue";

const { t } = useI18n();
const { showError, showSuccess } = useToast();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role?.name === 'admin' || authStore.user?.role === 'admin');

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

    const authStore = useAuthStore();
    const fetchMessages = authStore.user?.role?.name === 'student'
      ? messageService.getMyMessages()
      : messageService.getAll();

    const [messagesResponse, dormitoriesResponse, roomsResponse] = await Promise.all([
      fetchMessages,
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

// Admin CRUD state
const showForm = ref(false);
const showDelete = ref(false);
const editingMessage = ref<any|null>(null);
const messageToDelete = ref<number|null>(null);
const form = ref({ title: '', content: '' });

const openCreateModal = () => { editingMessage.value = null; form.value = { title: '', content: '' }; showForm.value = true; };
const openEditModal = (msg: any) => { editingMessage.value = msg; form.value = { title: msg.title || '', content: msg.content || '' }; showForm.value = true; };
const closeForm = () => { showForm.value = false; };
const submitForm = async () => {
  try {
    if (!form.value.title || !form.value.content) return; // minimal validation
    if (editingMessage.value) {
      const res = await messageService.update(editingMessage.value.id, { title: form.value.title, content: form.value.content, type: 'general', receiver_id: editingMessage.value.receiver_id || authStore.user?.id });
      // Update in local list
      const idx = messages.value.findIndex((m: any) => m.id === editingMessage.value.id);
      if (idx !== -1) messages.value[idx] = res.data;
      showSuccess(t('Message updated successfully'));
    } else {
      const res = await messageService.create({ title: form.value.title, content: form.value.content, type: 'general', receiver_id: authStore.user?.id });
      // Append to list
      messages.value.unshift(res.data);
      showSuccess(t('Message created successfully'));
    }
    showForm.value = false;
  } catch (e) {
    showError(t('Failed to save message'));
  }
};

const confirmDelete = (id: number) => { messageToDelete.value = id; showDelete.value = true; };
const deleteMessage = async () => {
  if (!messageToDelete.value) return;
  try {
    await messageService.delete(messageToDelete.value);
    messages.value = messages.value.filter((m: any) => m.id !== messageToDelete.value);
    showSuccess(t('Message deleted successfully'));
  } catch (e) {
    showError(t('Failed to delete message'));
  } finally {
    showDelete.value = false; messageToDelete.value = null;
  }
};

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

// Admin CRUD state
const isAdmin = computed(() => {
  const authStore = useAuthStore();
  return authStore.user?.role?.name === 'admin';
});

const showForm = ref(false);
const editingMessage = ref<any>(null);
const form = ref({
  title: '',
  content: '',
});

const openCreateModal = () => {
  editingMessage.value = null;
  form.value = { title: '', content: '' };
  showForm.value = true;
};

const openEditModal = (message: any) => {
  editingMessage.value = message;
  form.value = { title: message.subject || '', content: message.content || '' };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingMessage.value = null;
};

const submitForm = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    showError(t('Title and content are required'));
    return;
  }

  try {
    if (editingMessage.value) {
      await messageService.update(editingMessage.value.id, form.value);
      showSuccess(t('Message updated successfully'));
    } else {
      await messageService.create(form.value);
      showSuccess(t('Message created successfully'));
    }
    await loadData();
    closeForm();
  } catch (err) {
    showError(t('Failed to save message'));
  }
};

const showDelete = ref(false);
const deleteMessage = async () => {
  if (!editingMessage.value?.id) return;
  try {
    await messageService.delete(editingMessage.value.id);
    showSuccess(t('Message deleted successfully'));
    await loadData();
    closeForm();
  } catch (err) {
    showError(t('Failed to delete message'));
  }
};

const confirmDelete = (id: number) => {
  editingMessage.value = { id };
  showDelete.value = true;
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
