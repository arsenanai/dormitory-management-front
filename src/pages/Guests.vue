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
      <CButton variant="primary" @click="addGuest">
        <UserPlusIcon class="h-5 w-5" />
        {{ t("Add Guest") }}
      </CButton>
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
    <CTable v-if="!loading && !error" data-testid="guests-table">
      <CTableHead>
        <CTableHeadCell>{{ t("Name") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("Surname") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("Enter Date") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("Exit Date") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("Telephone") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("Room") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("Payment") }}</CTableHeadCell>
        <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="guest in filteredGuests" :key="guest.id">
          <CTableCell>{{ guest.first_name || guest.name }}</CTableCell>
          <CTableCell>{{ guest.last_name || guest.surname }}</CTableCell>
          <CTableCell>{{ formatDate(guest.check_in_date) }}</CTableCell>
          <CTableCell>{{ formatDate(guest.check_out_date) }}</CTableCell>
          <CTableCell>{{ guest.phone || guest.telephone }}</CTableCell>
          <CTableCell>{{ guest.room?.number || guest.room || '-' }}</CTableCell>
          <CTableCell>{{ formatPayment(guest.payment_status, guest.total_amount) }}</CTableCell>
          <CTableCell class="flex items-center justify-end gap-2">
            <CButton @click="editGuest(guest.id)">
              <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
            </CButton>
            <CButton class="text-red-600" @click="deleteGuest(guest.id)">
              <TrashIcon class="h-5 w-5" /> {{ t("Delete") }}
            </CButton>
          </CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>

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
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
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

// Fetch guests from API
const fetchGuests = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await guestService.getAll();
    console.log('API Response:', response.data);
    
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
    
    console.log('Fetched guests:', guests.value);
    console.log('Number of guests:', guests.value.length);
  } catch (err) {
    console.error('Error fetching guests:', err);
    error.value = err.message || 'Failed to fetch guests';
    guests.value = [];
  } finally {
    loading.value = false;
  }
};

// Filtered Guests
const filteredGuests = computed(() => {
  if (!searchQuery.value) return paginatedGuests.value;
  
  return paginatedGuests.value.filter((guest) =>
    `${guest.first_name || guest.name} ${guest.last_name || guest.surname} ${guest.phone || guest.telephone} ${guest.room?.number || guest.room}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase()),
  );
});

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
  const confirmed = await showConfirmation(
    t('Are you sure you want to delete this guest?'),
    t('Delete Guest')
  );
  
  if (confirmed) {
    try {
      await guestService.delete(id);
      await fetchGuests(); // Reload data
      showSuccess(t('Guest deleted successfully'));
    } catch (err) {
      showError(t('Failed to delete guest'));
    }
  }
};

onMounted(async () => {
  await fetchGuests();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
