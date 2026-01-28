<template>
  <Navigation :title="t('Guest House')">
    <!-- Search Bar -->
    <div
      data-testid="guests-page"
      class="mb-4 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center"
    >
      <div class="w-auto lg:w-128">
        <CInput id="search-guests" v-model="searchQuery" type="search" :placeholder="t('Search')" />
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <CButton @click="exportGuests" data-testid="export-guests-button">
          <ArrowDownTrayIcon class="h-5 w-5" />
          {{ t("Download") }}
        </CButton>
        <CButton @click="addGuest">
          <UserPlusIcon class="h-5 w-5" />
          {{ t("Add Guest") }}
        </CButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-text py-4 text-center">
      {{ t("Loading...") }}
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message py-4 text-center text-red-500">
      {{ error }}
    </div>

    <!-- Guests Table -->
    <CTable
      :columns="tableColumns"
      :data="paginatedGuests"
      :loading="loading"
      v-if="!loading && !error"
      data-testid="guests-table"
    >
      <template #cell-guest="{ row }">
        <div class="flex flex-col gap-1">
          <span class="whitespace-nowrap"> {{ row.first_name }} {{ row.last_name }} <br /> </span>
          <span>
            {{ row.email }}
          </span>
          <span>
            {{ row.phone_numbers?.join(", ") || "" }}
          </span>
        </div>
      </template>
      <template #cell-purpose="{ row }">
        {{ row.guest_profile?.purpose_of_visit || row.notes || "-" }}
      </template>
      <template #cell-date_range="{ row }">
        <span class="whitespace-nowrap"
          >{{
            row.guest_profile?.visit_start_date
              ? new Date(row.guest_profile.visit_start_date).toLocaleDateString()
              : "-"
          }}
          -
          {{
            row.guest_profile?.visit_end_date
              ? new Date(row.guest_profile.visit_end_date).toLocaleDateString()
              : "-"
          }}</span
        >
      </template>
      <template #cell-telephone> </template>
      <template #cell-room="{ row }">
        {{ row.room?.number || row.room || "-" }}
      </template>
      <template #cell-status="{ row }">
        <span
          :class="{
            'rounded px-2 py-1 text-xs font-medium': true,
            'bg-green-100 text-green-800': row.status === 'active',
            'bg-yellow-100 text-yellow-800': row.status === 'pending',
            'bg-red-100 text-red-800': row.status === 'passive',
            'bg-gray-100 text-gray-800':
              !row.status || !['active', 'pending', 'passive'].includes(row.status),
          }"
        >
          {{ formatStatus(row.status) }}
        </span>
      </template>
      <template #cell-payment="{ row }">
        {{ formatPayment(row.payment_status, row.total_amount) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <CButton @click="editGuest(row.id)">
            <PencilSquareIcon class="h-5 w-5" />
          </CButton>
          <CButton variant="danger" @click="deleteGuest(row.id)">
            <TrashIcon class="h-5 w-5" />
          </CButton>
        </div>
      </template>
    </CTable>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row"
      data-testid="pagination"
    >
      <div class="text-sm text-gray-700">
        <span v-if="totalGuests > 0">
          <span class="font-medium">{{ fromGuest }}</span> -
          <span class="font-medium">{{ toGuest }}</span> /
          <span class="font-medium">{{ totalGuests }}</span>
        </span>
        <span v-else>
          {{ t("No data available") }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <CButton
          :disabled="currentPage === 1"
          @click="currentPage--"
          :aria-label="t('Previous page')"
          class="h-10"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </CButton>
        <div class="flex items-center gap-1 text-sm">
          <div class="w-20">
            <CInput
              id="page-input"
              v-model.number="pageInput"
              type="number"
              :min="1"
              :max="totalPages"
              class="h-10 text-center"
              @keyup.enter="goToPage"
            />
          </div>
          <span>/ {{ totalPages }}</span>
        </div>
        <CButton
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          :aria-label="t('Next page')"
          class="h-10"
        >
          <ChevronRightIcon class="h-5 w-5" />
        </CButton>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";

import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { guestService } from "@/services/api";
import { useToast } from "@/composables/useToast";
import { formatCurrency } from "@/utils/formatters";

// Initialize router
const router = useRouter();
const { t } = useI18n();
const { showError, showSuccess, showConfirmation } = useToast();

// Guests Data
const guests = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const currencySymbol = ref("$");
// Search Query
const searchQuery = ref<string>("");

const tableColumns = computed(() => [
  { key: "guest", label: t("Guest") },
  { key: "room", label: t("Room") },
  { key: "status", label: t("Status") },
  { key: "date_range", label: t("Date Range") },
  { key: "purpose", label: t("Purpose") },
  // { key: 'payment', label: t("Payment") },
  { key: "actions", label: t("Action"), class: "text-right" },
]);

// Pagination
const currentPage = ref(1);
const pageInput = ref(1);
const itemsPerPage = 10;

const totalGuests = computed(() => filteredGuests.value.length);

const totalPages = computed(() => Math.ceil(totalGuests.value / itemsPerPage));

const fromGuest = computed(() => {
  if (totalGuests.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const toGuest = computed(() => {
  const end = currentPage.value * itemsPerPage;
  return end > totalGuests.value ? totalGuests.value : end;
});

const paginatedGuests = computed(() =>
  filteredGuests.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
);

watch(currentPage, (newPage) => {
  pageInput.value = newPage;
});

// Filtered Guests (fix dependency: base on full guests list)
const filteredGuests = computed(() => {
  if (!searchQuery.value) return guests.value;
  const q = searchQuery.value.toLowerCase();
  return guests.value.filter((guest) =>
    `${guest.first_name || guest.name} ${guest.last_name || guest.surname} ${guest.email || ""} ${guest.guest_profile?.purpose_of_visit || guest.notes || ""} ${guest.phone || guest.telephone} ${guest.room?.number || guest.room}`
      ?.toLowerCase()
      .includes(q)
  );
});

// Fetch guests from API
const fetchGuests = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      error.value = "Authentication required";
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
    console.error("Error fetching guests:", err);
    error.value = err?.message || "Failed to fetch guests";
    guests.value = [];
  } finally {
    loading.value = false;
  }
};

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const formatPayment = (status: string, amount: number) => {
  return status === "paid" ? formatCurrency(amount, currencySymbol.value) : status || "-";
};

const formatStatus = (status: string | null | undefined): string => {
  if (!status) return "-";
  const statusMap: Record<string, string> = {
    active: t("Active"),
    pending: t("Pending"),
    passive: t("Passive"),
  };
  return statusMap[status] || status;
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
  const confirmed = await showConfirmation(t("Are you sure you want to delete this guest?"));
  if (!confirmed) return;
  try {
    await guestService.delete(id);
    await fetchGuests();
    showSuccess(t("Guest deleted successfully"));
  } catch (err) {
    console.error("Delete error:", err);
    showError(t("Failed to delete guest"));
  }
};

// Export guests
const exportGuests = async (): Promise<void> => {
  try {
    const params: any = {};
    if (searchQuery.value) params.search = searchQuery.value;
    params.format = "csv"; // Request CSV format from backend
    const response = await guestService.export(params);
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "guests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(t("Failed to export guests"));
  }
};

const goToPage = () => {
  const page = Number(pageInput.value);
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  } else {
    // Reset input to current page if value is invalid
    pageInput.value = currentPage.value;
  }
};

onMounted(async () => {
  try {
    const { configurationService } = await import("@/services/api");
    const currencyResponse = await configurationService.getCurrency();
    currencySymbol.value = currencyResponse.data.currency_symbol || "$";
  } catch (err) {
    console.error("Failed to load currency symbol on mount:", err);
  }
  await fetchGuests();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
