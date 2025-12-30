<template>
  <Navigation :title="t('All Messages')">
    <div data-testid="student-messages-page">
      <!-- Search Field -->
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-md flex-1">
          <CInput
            id="unified-search"
            v-model="searchQuery"
            type="text"
            :label="t('Search')"
            :placeholder="t('Search by message text...')"
            class="w-full"
          />
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
          <p class="text-lg">{{ t("No messages received yet") }}</p>
          <p class="mt-2 text-sm">{{ t("Messages from administrators will appear here") }}</p>
        </div>

        <!-- Messages Table -->
        <div v-else data-testid="messages-table">
          <CTable
            :data="paginatedMessages"
            :columns="tableColumns"
            :loading="loading"
            hoverable
            @row-click="handleRowClick"
          >
            <template #cell-message="{ row }">
              <div class="max-w-md">
                <div class="mb-1 font-medium text-gray-900">
                  {{ row.title || row.subject || t("No Subject") }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ limitText(row.content, 125) }}
                </div>
              </div>
            </template>

            <template #cell-sent="{ row }">
              <div class="text-sm text-gray-500">
                {{ formatDate(row.created_at || row.dateTime) }}
              </div>
            </template>
          </CTable>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="mt-4 flex justify-center gap-2">
            <CButton @click="goToPrevPage" :disabled="currentPage === 1 || loading" size="small">
              <ChevronLeftIcon class="h-4 w-4" />
            </CButton>
            <span class="px-4 py-2">
              {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
            </span>
            <CButton
              @click="goToNextPage"
              :disabled="currentPage === totalPages || loading"
              size="small"
            >
              <ChevronRightIcon class="h-4 w-4" />
            </CButton>
          </div>
        </div>
      </div>

      <!-- Message Detail Modal -->
      <CModal
        :model-value="showMessageModal"
        @update:model-value="showMessageModal = $event"
        :title="
          selectedMessage ? selectedMessage.title || selectedMessage.subject || t('Message') : ''
        "
      >
        <div v-if="selectedMessage" class="flex h-full flex-col">
          <div class="flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
              <div class="flex items-center">
                <EnvelopeIcon class="mr-1 h-4 w-4 text-gray-400" />
                <span class="font-medium text-gray-800">{{ t("From") }}:</span>
                <span class="ml-1">{{
                  selectedMessage.sender?.name || selectedMessage.from || t("Administrator")
                }}</span>
              </div>
              <div class="flex items-center">
                <ClockIcon class="mr-1 h-4 w-4 text-gray-400" />
                <span class="font-medium text-gray-800">{{ t("Date") }}:</span>
                <span class="ml-1">{{
                  formatDate(
                    selectedMessage.created_at ||
                      selectedMessage.dateTime ||
                      selectedMessage.sent_at
                  )
                }}</span>
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
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline";
import Navigation from "@/components/CNavigation.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";
import CInput from "@/components/CInput.vue";
import CModal from "@/components/CModal.vue";
import CTextarea from "@/components/CTextarea.vue";
import { messageService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const { showError, showSuccess } = useToast();
const authStore = useAuthStore();

// Data
const messages = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedMessage = ref<any | null>(null);
const showMessageModal = ref(false);

// Search
const searchQuery = ref("");

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
      return;
    }

    // Students should use getMyMessages endpoint
    const messagesResponse = await messageService.getMyMessages({
      page: currentPage.value,
      per_page: itemsPerPage,
      query: searchQuery.value,
    });

    // Handle Laravel paginated response structure for messages
    if (messagesResponse && messagesResponse.data) {
      if (Array.isArray(messagesResponse.data)) {
        messages.value = messagesResponse.data;
        totalMessages.value = messagesResponse.data.length;
      } else if (messagesResponse.data.data && Array.isArray(messagesResponse.data.data)) {
        messages.value = messagesResponse.data.data;
        totalMessages.value = messagesResponse.data.total || 0;
      } else {
        messages.value = [];
        totalMessages.value = 0;
      }
    } else {
      messages.value = [];
      totalMessages.value = 0;
    }

    console.log("Fetched messages:", messages.value.length);
    console.log("Total messages:", totalMessages.value);
    console.log("Total pages:", totalPages.value);
    console.log("Current page:", currentPage.value);
  } catch (err: any) {
    console.error("Error loading messages:", err);
    console.error("Error details:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });

    if (err.response?.status === 403) {
      error.value = "Access denied. You may not have permission to view messages.";
    } else {
      error.value = "Failed to load messages data";
    }
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
const tableColumns = computed(() => [
  { key: "message", label: t("Message") },
  { key: "sent", label: t("Sent") },
]);

// Filtered messages based on search query
const filteredMessages = computed(() => {
  if (!messages.value.length) return [];

  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return messages.value;

  return messages.value.filter((msg) => {
    const titleMatch = (msg.title || msg.subject || "").toLowerCase().includes(query);
    const contentMatch = (msg.content || "").toLowerCase().includes(query);

    return titleMatch || contentMatch;
  });
});

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const limitText = (text: string | null | undefined, maxLength: number = 200): string => {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
};

// Message modal handlers
const handleRowClick = async (message: any) => {
  selectedMessage.value = message;
  showMessageModal.value = true;

  // Mark message as read if it has an id and hasn't been read yet
  if (message.id && !message.read_at) {
    try {
      await messageService.markAsRead(message.id);
      // Update the message in the list
      const index = messages.value.findIndex((m: any) => m.id === message.id);
      if (index !== -1) {
        messages.value[index].read_at = new Date().toISOString();
      }
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  }
};

const closeMessageModal = () => {
  showMessageModal.value = false;
  selectedMessage.value = null;
};
</script>
