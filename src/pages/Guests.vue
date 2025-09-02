<template>
  <Navigation :title="t('Guest House')">
    <!-- Search Bar -->
    <div
      class="mb-4 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center"
    >
      <div class="w-auto lg:w-128">
        <CInput
          id="search-guests"
          v-model="searchQuery"
          type="search"
          :placeholder="t('Search')"
          :label="t('Search')"
        />
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <CButton @click="exportGuests" data-testid="export-guests-button">
          <ArrowDownTrayIcon class="h-5 w-5" />
          {{ t('Download') }}
        </CButton>
        <CButton @click="addGuest">
          <UserPlusIcon class="h-5 w-5" />
          {{ t('Add Guest') }}
        </CButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-text text-center py-4">
      {{ t("Loading...") }}
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message text-red-500 text-center py-4">
      {{ error }}
    </div>

    <!-- Guests Table -->
    <div v-if="!loading" class="overflow-x-auto relative border border-gray-300 sm:rounded-lg" data-testid="guests-table">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-primary-700 uppercase bg-primary-50 dark:bg-primary-700 dark:text-primary-400">
          <tr>
            <th class="px-6 py-3">{{ t("Name") }}</th>
            <th class="px-6 py-3">{{ t("Surname") }}</th>
            <th class="px-6 py-3">{{ t("Email") }}</th>
            <th class="px-6 py-3">{{ t("Purpose") }}</th>
            <th class="px-6 py-3">{{ t("Enter Date") }}</th>
            <th class="px-6 py-3">{{ t("Exit Date") }}</th>
            <th class="px-6 py-3">{{ t("Telephone") }}</th>
            <th class="px-6 py-3">{{ t("Room") }}</th>
            <th class="px-6 py-3">{{ t("Payment") }}</th>
            <th class="px-6 py-3 text-right">{{ t("Action") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredGuests.length === 0">
            <td colspan="10" class="px-6 py-4 text-center text-gray-500">
              {{ t("No data available") }}
            </td>
          </tr>
          <tr
            v-for="guest in filteredGuests"
            :key="guest.id"
            class="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            <td class="px-6 py-4">{{ guest.first_name || guest.name }}</td>
            <td class="px-6 py-4">{{ guest.last_name || guest.surname }}</td>
            <td class="px-6 py-4">{{ guest.email || '-' }}</td>
            <td class="px-6 py-4">{{ guest.guest_profile?.purpose_of_visit || guest.notes || '-' }}</td>
            <td class="px-6 py-4">
              {{ guest.guest_profile?.visit_start_date ? new Date(guest.guest_profile.visit_start_date).toLocaleDateString() : '-' }}
              <small class="text-xs text-gray-400">({{ guest.guest_profile?.visit_start_date }})</small>
            </td>
            <td class="px-6 py-4">
              {{ guest.guest_profile?.visit_end_date ? new Date(guest.guest_profile.visit_end_date).toLocaleDateString() : '-' }}
              <small class="text-xs text-gray-400">({{ guest.guest_profile?.visit_end_date }})</small>
            </td>
            <td class="px-6 py-4">{{ guest.phone || guest.telephone || '-' }}</td>
            <td class="px-6 py-4">{{ guest.room?.number || guest.room || '-' }}</td>
            <td class="px-6 py-4">{{ guest.payment_status === 'paid' ? `$${parseFloat(guest.total_amount || 0).toFixed(2)}` : guest.payment_status || '-' }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <CButton @click="editGuest(guest.id)">
                  <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
                </CButton>
                <CButton variant="danger" @click="deleteGuest(guest.id)">
                  <TrashIcon class="h-5 w-5" /> {{ t("Delete") }}
                </CButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4" data-testid="pagination">
      <CButton :disabled="currentPage === 1" @click="currentPage--" :aria-label="t('Previous page')">
        {{ t("Previous") }}
      </CButton>
      <span>
        {{ t("Page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}
      </span>
      <CButton :disabled="currentPage === totalPages" @click="currentPage++" :aria-label="t('Next page')">
        {{ t("Next") }}
      </CButton>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";

import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from "@heroicons/vue/24/outline";
import { guestService } from "@/services/api";
import { useToast } from "@/composables/useToast";

// Initialize router
const router = useRouter();
const { t } = useI18n();
const { showError, showSuccess, showConfirmation } = useToast();

// Guests Data
const guests = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Search Query
const searchQuery = ref<string>("");

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() =>
  Math.ceil(filteredGuests.value.length / itemsPerPage),
);
const paginatedGuests = computed(() =>
  filteredGuests.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage,
  ),
);

// Filtered Guests (fix dependency: base on full guests list)
const filteredGuests = computed(() => {
  const list = guests.value;
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter((guest) =>
    `${guest.first_name || guest.name} ${guest.last_name || guest.surname} ${guest.email || ''} ${guest.guest_profile?.purpose_of_visit || guest.notes || ''} ${guest.phone || guest.telephone} ${guest.room?.number || guest.room}`
      .toLowerCase()
      .includes(q),
  );
});

// Fetch guests from API
const fetchGuests = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Authentication required';
      guests.value = [];
      return;
    }

    const response = await guestService.getAll();
    const firstItem = Array.isArray(response.data?.data)
      ? response.data.data[0]
      : Array.isArray(response.data)
        ? response.data[0]
        : null;
    
    // Handle both paginated and non-paginated responses
    if (response.data.data && Array.isArray(response.data.data)) {
      // Paginated response: { data: [...], current_page: 1, ... }
      guests.value = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Direct array response: [...]
      guests.value = response.data;
    } else {
      // Fallback
      guests.value = [];
    }
    
  } catch (err: any) {
    console.error('Error fetching guests:', err);
    error.value = err?.message || 'Failed to fetch guests';
    guests.value = [];
  } finally {
    loading.value = false;
  }
};

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

const formatPayment = (status: string, amount: number) => {
  if (status === 'paid') {
    return `$${amount?.toFixed(2) || '0.00'}`;
  }
  return status || '-';
};

// Navigate to Add Guest form
const addGuest = (): void => {
  router.push("/guest-form");
};

// Navigate to Edit Guest form
const editGuest = (id: number): void => {
  router.push(`/guest-form/${id}`);
};

// Delete Guest
const deleteGuest = async (id: number): Promise<void> => {
  const confirmed = await showConfirmation(t('Are you sure you want to delete this guest?'));
  if (!confirmed) return;
  try {
    await guestService.delete(id);
    await fetchGuests();
    showSuccess(t('Guest deleted successfully'));
  } catch (err) {
    console.error('Delete error:', err);
    showError(t('Failed to delete guest'));
  }
};

// Export guests
const exportGuests = async (): Promise<void> => {
  try {
    const params: any = {};
    if (searchQuery.value) params.search = searchQuery.value;
    const response = await guestService.export(params);
    const blob = new Blob([
      (response && (response as any).data) ? (response as any).data : response
    ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'guests.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(t('Failed to export guests'));
  }
};

onMounted(async () => {
  await fetchGuests();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
