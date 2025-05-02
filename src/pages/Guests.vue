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

    <!-- Guests Table -->
    <CTable>
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
          <CTableCell>{{ guest.name }}</CTableCell>
          <CTableCell>{{ guest.surname }}</CTableCell>
          <CTableCell>{{ guest.enterDate }}</CTableCell>
          <CTableCell>{{ guest.exitDate }}</CTableCell>
          <CTableCell>{{ guest.telephone }}</CTableCell>
          <CTableCell>{{ guest.room }}</CTableCell>
          <CTableCell>{{ guest.payment }}</CTableCell>
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
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import { useRouter } from "vue-router"; // Import useRouter
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
import { Guest } from "@/models/Guest";

// Initialize router
const router = useRouter();

const { t } = useI18n();

// Guests Data
const guests = ref<Guest[]>([
  new Guest(
    1,
    "Guest1",
    "Guestov1",
    "22-11-2023",
    "25-11-2023",
    "+71234567890",
    "A201",
    "14000T",
  ),
  new Guest(
    2,
    "Guest2",
    "Guestov2",
    "12-01-2024",
    "13-01-2024",
    "+79991234567",
    "A202",
    "0",
  ),
  new Guest(
    3,
    "Guest3",
    "Guestov3",
    "12-01-2023",
    "14-01-2024",
    "+74443456789",
    "A203",
    "25000T",
  ),
]);

// Search Query
const searchQuery = ref<string>("");

// Filtered Guests
const filteredGuests = computed<Guest[]>(() => {
  return guests.value.filter((guest) =>
    `${guest.name} ${guest.surname} ${guest.telephone} ${guest.room}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase()),
  );
});

// Navigate to Add Guest form
const addGuest = (): void => {
  router.push("/guest-form");
};

// Navigate to Edit Guest form
const editGuest = (id: number): void => {
  router.push(`/guest-form/${id}`);
};

// Delete Guest
const deleteGuest = (id: number): void => {
  console.log("Delete Guest with ID:", id);
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
