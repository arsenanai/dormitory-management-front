<template>
  <Navigation :title="t('All Messages')">
    <div data-testid="student-messages-page">
      <!-- Search Field -->
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1 max-w-md">
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
      <div class="bg-white rounded-lg overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8 text-primary-600">
          {{ t("Loading...") }}
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8 text-red-500">
          {{ error }}
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredMessages.length === 0" class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-4">📬</div>
          <p class="text-lg">{{ t('No messages received yet') }}</p>
          <p class="text-sm mt-2">{{ t('Messages from administrators will appear here') }}</p>
        </div>

        <!-- Messages Table -->
        <div v-else data-testid="messages-table">
          <CTable 
            :data="paginatedMessages"
            :columns="tableColumns"
            :loading="loading"
            hoverable
          >
            <template #cell-message="{ row }">
              <div class="max-w-md">
                <div class="font-medium text-gray-900 mb-1">
                  {{ row.title || row.subject || t('No Subject') }}
                </div>
                <div class="text-sm text-gray-600 line-clamp-2">
                  {{ row.content }}
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
          <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-4">
            <CButton 
              @click="goToPrevPage"
              :disabled="currentPage === 1 || loading"
              size="small"
            >
              <ChevronLeftIcon class="h-4 w-4" />
            </CButton>
            <span class="px-4 py-2">
              {{ t('Page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
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
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import Navigation from "@/components/CNavigation.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";
import CInput from "@/components/CInput.vue";
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
      error.value = 'Authentication required';
      messages.value = [];
      return;
    }

    // Students should use getMyMessages endpoint
    const messagesResponse = await messageService.getMyMessages({ 
      page: currentPage.value, 
      per_page: itemsPerPage 
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
    
    console.log('Fetched messages:', messages.value.length);
    console.log('Total messages:', totalMessages.value);
    console.log('Total pages:', totalPages.value);
    console.log('Current page:', currentPage.value);
  } catch (err: any) {
    console.error('Error loading messages:', err);
    console.error('Error details:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
    
    if (err.response?.status === 403) {
      error.value = 'Access denied. You may not have permission to view messages.';
    } else {
      error.value = 'Failed to load messages data';
    }
    showError(t('Failed to load messages data'));
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
  { key: 'message', label: t('Message') },
  { key: 'sent', label: t('Sent') }
]);

// Filtered messages based on search query
const filteredMessages = computed(() => {
  if (!messages.value.length) return [];
  
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return messages.value;
  
  return messages.value.filter(msg => {
    const titleMatch = (msg.title || msg.subject || '').toLowerCase().includes(query);
    const contentMatch = (msg.content || '').toLowerCase().includes(query);
    
    return titleMatch || contentMatch;
  });
});

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
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
