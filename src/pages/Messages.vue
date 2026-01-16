<template>
  <Navigation :title="t('Messages')">
    <div data-testid="messages-page">
      <!-- Search and Actions Bar -->
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Unified Search Field -->
        <div class="max-w-md flex-1">
          <CInput
            id="unified-search"
            v-model="searchQuery"
            type="text"
            :label="t('Search')"
            :placeholder="t('Search by room or message text...')"
            class="w-full"
          />
        </div>

        <!-- Add Message Button -->
        <div v-if="isAdmin" class="flex-shrink-0">
          <CButton data-testid="add-message-button" @click="openCreateModal">
            <PlusIcon class="h-5 w-5" />
            {{ t("Add Message") }}
          </CButton>
        </div>
      </div>

      <!-- Messages Table -->
      <div class="overflow-hidden rounded-lg bg-white">
        <!-- Loading State -->
        <div v-if="loading" class="text-primary-600 py-8 text-center">
          {{ t("Loading...") }}
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-8 text-center text-red-500">
          {{ error }}
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredMessages.length === 0" class="py-8 text-center text-gray-500">
          <div class="mb-4 text-4xl">📬</div>
          <p class="text-lg">
            {{ isAdmin ? t("No messages yet") : t("No messages received yet") }}
          </p>
          <p class="mt-2 text-sm">
            {{
              isAdmin
                ? t("Create your first message to get started")
                : t("Messages from administrators will appear here")
            }}
          </p>
        </div>

        <!-- Messages Table -->
        <div v-else data-testid="messages-table">
          <CTable :data="paginatedMessages" :columns="tableColumns" :loading="loading" hoverable>
            <template #cell-room="{ row }">
              <div class="font-medium">
                {{ getRoomDisplayName(row) }}
              </div>
              <div v-if="row.type" class="text-xs text-gray-500">
                {{ t(row.type) }}
              </div>
            </template>

            <template #cell-message="{ row }">
              <div class="max-w-md">
                <div class="mb-1 font-medium text-gray-900">
                  {{ row.title || row.subject || t("No Subject") }}
                </div>
                <div class="line-clamp-2 text-sm text-gray-600">
                  {{ row.content }}
                </div>
              </div>
            </template>

            <template #cell-sent="{ row }">
              <div class="text-sm text-gray-500">
                {{ formatDate(row.created_at || row.dateTime) }}
              </div>
            </template>

            <template #cell-actions="{ row }" v-if="isAdmin">
              <div class="flex justify-end gap-2">
                <CButton
                  size="small"
                  @click="openEditModal(row)"
                  data-testid="edit-message-button"
                  class=""
                >
                  <PencilSquareIcon class="h-5 w-5" />
                </CButton>
                <CButton
                  size="small"
                  variant="danger"
                  @click="confirmDelete(row.id)"
                  data-testid="delete-message-button"
                  class=""
                >
                  <TrashIcon class="h-5 w-5" />
                </CButton>
              </div>
            </template>
          </CTable>

          <!-- Pagination Controls -->
          <div
            v-if="totalPages > 1"
            class="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row"
            data-testid="pagination"
          >
            <div class="text-sm text-gray-700">
              <span v-if="totalMessages > 0">
                <span class="font-medium">{{ startIndex + 1 }}</span> -
                <span class="font-medium">{{ endIndex }}</span> /
                <span class="font-medium">{{ totalMessages }}</span>
              </span>
              <span v-else>
                {{ t("No data available") }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <CButton
                :disabled="currentPage === 1"
                @click="goToPrevPage"
                :aria-label="t('Previous page')"
                class="h-10"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </CButton>
              <div class="flex items-center gap-1 text-sm">
                <span>{{ currentPage }} / {{ totalPages }}</span>
              </div>
              <CButton
                :disabled="currentPage === totalPages"
                @click="goToNextPage"
                :aria-label="t('Next page')"
                class="h-10"
              >
                <ChevronRightIcon class="h-5 w-5" />
              </CButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Navigation>

  <!-- Create/Edit Message Modal -->
  <!-- Debug: showForm = {{ showForm }}, isAdmin = {{ isAdmin }} -->
  <CModal v-if="isAdmin" v-model="showForm">
    <div>
      <h2 class="mb-4 text-xl font-bold">
        {{ editingMessage ? t("Edit Message") : t("New Message") }}
      </h2>
      <form @submit.prevent="submitForm">
        <div class="space-y-4">
          <CInput
            id="message-title-input"
            data-testid="message-title-input"
            v-model="form.title"
            :label="t('Title')"
            required
          />
          <CTextarea
            id="message-content-input"
            data-testid="message-content-input"
            v-model="form.content"
            :label="t('Content')"
            required
          />

          <!-- Recipient Type Selection -->
          <CSelect
            id="recipient-type-select"
            data-testid="recipient-type-select"
            v-model="form.recipient_type"
            :label="t('Recipient Type')"
            :options="recipientTypeOptions"
            required
          />

          <!-- Room Selection (only show if recipient_type is room) -->
          <CSelect
            id="room-select"
            v-if="form.recipient_type === 'room'"
            data-testid="room-select"
            v-model="form.room_id"
            :label="t('Room')"
            :options="filteredRoomOptions"
            required
          />
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <CButton @click="closeForm">{{ t("Cancel") }}</CButton>
          <CButton type="submit" variant="primary" data-testid="submit-message-button">
            {{ editingMessage ? t("Update") : t("Create") }}
          </CButton>
        </div>
      </form>
    </div>
  </CModal>

  <!-- Delete Confirmation Modal -->
  <CConfirmationModal
    v-if="isAdmin && showDelete"
    :message="t('Are you sure you want to delete this message? This action cannot be undone.')"
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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
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
import CInput from "@/components/CInput.vue";
import { messageService, roomService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import CModal from "@/components/CModal.vue";
import CConfirmationModal from "@/components/CConfirmationModal.vue";

const { t } = useI18n();
const { showError, showSuccess } = useToast();
const authStore = useAuthStore();
const isAdmin = computed(
  () => authStore.user?.role?.name === "admin" || authStore.user?.role === "admin"
);

// Data
const messages = ref<any[]>([]);
const rooms = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Search
const searchQuery = ref("");

// Form state
const showForm = ref(false);
const editingMessage = ref<any | null>(null);
const showDelete = ref(false);
const messageToDelete = ref<number | null>(null);
const form = ref({
  title: "",
  content: "",
  recipient_type: "all",
  room_id: "",
  type: "general",
});

// Recipient type options
const recipientTypeOptions = computed(() => [
  { value: "all", name: t("All Students") },
  { value: "room", name: t("Specific Room") },
]);

// Filter rooms by admin's dormitory
const filteredRoomOptions = computed(() => {
  // The backend already filters rooms by admin's dormitory when calling roomService.getAll()
  // So we can use all the rooms returned from the API
  return [
    { value: "", name: t("All Rooms") },
    ...rooms.value.map((room) => ({ value: room.id, name: room.number })),
  ];
});

// Load data on component mount
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Check if user is authenticated via auth store
    const isUserAuthenticated = authStore.isAuthenticated && authStore.user;

    if (!isUserAuthenticated) {
      error.value = "Authentication required";
      messages.value = [];
      rooms.value = [];
      return;
    }

    const params: any = {
      page: currentPage.value,
      per_page: itemsPerPage,
    };
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    // For students, fetch their messages (messages sent to their dormitory or room)
    const fetchMessages =
      authStore.user?.role?.name === "student"
        ? messageService.getMyMessages(params)
        : messageService.getAll(params);

    // For admin users, fetch rooms from their assigned dormitory
    const fetchRooms =
      authStore.user?.role?.name === "admin" && authStore.user?.adminProfile?.dormitory_id
        ? roomService.getByDormitory(authStore.user.adminProfile.dormitory_id)
        : roomService.listAll();

    const [messagesResponse, roomsResponse] = await Promise.all([fetchMessages, fetchRooms]);

    // Handle Laravel paginated response structure for messages
    if (messagesResponse?.data) {
      // Laravel paginated response: { data: [...], total: X, ... }
      if (messagesResponse.data.data && Array.isArray(messagesResponse.data.data)) {
        messages.value = messagesResponse.data.data;
        totalMessages.value = messagesResponse.data.total || 0;
      } else if (Array.isArray(messagesResponse.data)) {
        // Non-paginated array response
        messages.value = messagesResponse.data;
        totalMessages.value = messagesResponse.data.length;
      } else {
        messages.value = [];
        totalMessages.value = 0;
      }
    } else {
      messages.value = [];
      totalMessages.value = 0;
    }

    // Handle Laravel paginated response structure for rooms
    if (roomsResponse?.data) {
      if (Array.isArray(roomsResponse.data)) {
        // Direct array response (from getByDormitory)
        rooms.value = roomsResponse.data;
      } else if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
        // Paginated response (from getAll)
        rooms.value = roomsResponse.data.data;
      } else {
        rooms.value = [];
      }
    } else {
      rooms.value = [];
    }

    console.log("Fetched messages:", messages.value.length);
    console.log("Total messages:", totalMessages.value);
    console.log("Total pages:", totalPages.value);
    console.log("Current page:", currentPage.value);
    console.log("Items per page:", itemsPerPage);
    console.log("Calculated total pages:", Math.ceil(totalMessages.value / itemsPerPage));
    console.log("Fetched rooms:", rooms.value.length);
  } catch (err: any) {
    console.error("Error loading messages:", err);
    error.value = "Failed to load messages data";
    showError(t("Failed to load messages data"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;
const totalMessages = ref(0);

// Paginated messages from backend
const paginatedMessages = computed(() => {
  return messages.value; // Backend already returns paginated data
});

// Pagination info
const totalPages = computed(() => Math.ceil(totalMessages.value / itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalMessages.value));

// Visible pages for pagination controls
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Change page function
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadData(); // Reload data with new page
  }
};

// Pagination handlers
const goToPage = (page: number) => {
  currentPage.value = page;
  loadData();
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadData();
  }
};

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadData();
  }
};

// Reset pagination when search changes
watch(searchQuery, () => {
  currentPage.value = 1;
  loadData(); // Reload data when search changes
});

// Table columns configuration
const tableColumns = computed(() => {
  const columns = [
    { key: "room", label: t("Room") },
    { key: "message", label: t("Message") },
    { key: "sent", label: t("Sent") },
  ];

  if (isAdmin.value) {
    columns.push({ key: "actions", label: t("Actions") });
  }

  return columns;
});

// Filtered messages based on search query
const filteredMessages = computed(() => {
  if (!messages.value.length) return [];

  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return messages.value;

  return messages.value.filter((msg) => {
    const roomMatch = getRoomDisplayName(msg).toLowerCase().includes(query);
    const titleMatch = (msg.title || msg.subject || "").toLowerCase().includes(query);
    const contentMatch = (msg.content || "").toLowerCase().includes(query);

    return roomMatch || titleMatch || contentMatch;
  });
});

// Helper function to get room display name
const getRoomDisplayName = (msg: any) => {
  if (msg.recipient_type === "all") {
    return t("All Rooms");
  }

  if (msg.room_id) {
    const room = rooms.value.find((r) => r.id === msg.room_id);
    return room ? room.number : t("Unknown Room");
  }

  return t("All Rooms");
};

// Modal functions
const openCreateModal = () => {
  console.log("openCreateModal called");
  editingMessage.value = null;
  form.value = {
    title: "",
    content: "",
    recipient_type: "all",
    room_id: "",
    type: "general",
  };
  showForm.value = true;
  console.log("showForm set to:", showForm.value);
};

const openEditModal = (msg: any) => {
  editingMessage.value = msg;
  form.value = {
    title: msg.title || "",
    content: msg.content || "",
    recipient_type: msg.recipient_type || "all",
    room_id: msg.room_id || "",
    type: msg.type || "general",
  };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  form.value = {
    title: "",
    content: "",
    recipient_type: "all",
    room_id: "",
    type: "general",
  };
};

const submitForm = async () => {
  try {
    if (!form.value.title || !form.value.content) {
      showError(t("Please fill in all required fields"));
      return;
    }

    const messageData = {
      title: form.value.title,
      content: form.value.content,
      type: form.value.type,
      recipient_type: form.value.recipient_type,
      dormitory_id: authStore.user?.adminProfile?.dormitory_id, // Use admin's assigned dormitory
      room_id: form.value.room_id,
      receiver_id: authStore.user?.id,
    };

    if (editingMessage.value) {
      const res = await messageService.update(editingMessage.value.id, messageData);
      const idx = messages.value.findIndex((m: any) => m.id === editingMessage.value.id);
      if (idx !== -1) messages.value[idx] = res.data;
      showSuccess(t("Message updated successfully"));
    } else {
      const res = await messageService.create(messageData);
      messages.value.unshift(res.data);
      showSuccess(t("Message created successfully"));
    }
    showForm.value = false;
    await loadData();
  } catch (e) {
    console.error("Error submitting form:", e);
    showError(t("Failed to save message"));
  }
};

// Delete functions
const confirmDelete = (id: number) => {
  messageToDelete.value = id;
  showDelete.value = true;
};

const deleteMessage = async () => {
  if (!messageToDelete.value) return;
  try {
    await messageService.delete(messageToDelete.value);
    messages.value = messages.value.filter((m: any) => m.id !== messageToDelete.value);
    showSuccess(t("Message deleted successfully"));
  } catch (e) {
    showError(t("Failed to delete message"));
  } finally {
    showDelete.value = false;
    messageToDelete.value = null;
  }
};

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
