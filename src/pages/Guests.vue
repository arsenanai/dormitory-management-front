<template>
  <Navigation :title="t('Guest House')">
    <!-- Search Bar -->
    <div class="mb-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
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
        <CTableRow
          v-for="guest in filteredGuests"
          :key="guest.id"
        >
          <CTableCell>{{ guest.name }}</CTableCell>
          <CTableCell>{{ guest.surname }}</CTableCell>
          <CTableCell>{{ guest.enterDate }}</CTableCell>
          <CTableCell>{{ guest.exitDate }}</CTableCell>
          <CTableCell>{{ guest.telephone }}</CTableCell>
          <CTableCell>{{ guest.room }}</CTableCell>
          <CTableCell>{{ guest.payment }}</CTableCell>
          <CTableCell class="flex gap-2 items-center justify-end">
            <CButton @click="editGuest(guest.id)">
              <PencilSquareIcon class="h-5 w-5" /> {{ t('Edit') }}
            </CButton>
            <CButton class="text-red-600" @click="deleteGuest(guest.id)">
              <TrashIcon class="h-5 w-5" /> {{ t('Delete') }}
            </CButton>
          </CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </Navigation>
</template>

<script setup>
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import CInput from "@/components/CInput.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import { UserPlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";

const { t } = useI18n();
const router = useRouter();

// Guests Data
const guests = ref([
  {
    id: 1,
    name: "Guest1",
    surname: "Guestov1",
    enterDate: "22-11-2023",
    exitDate: "25-11-2023",
    telephone: "+71234567890",
    room: "A201",
    payment: "14000T",
  },
  {
    id: 2,
    name: "Guest2",
    surname: "Guestov2",
    enterDate: "12-01-2024",
    exitDate: "13-01-2024",
    telephone: "+79991234567",
    room: "A202",
    payment: "0",
  },
  {
    id: 3,
    name: "Guest3",
    surname: "Guestov3",
    enterDate: "12-01-2023",
    exitDate: "14-01-2024",
    telephone: "+74443456789",
    room: "A203",
    payment: "25000T",
  },
]);

// Search Query
const searchQuery = ref("");

// Filtered Guests
const filteredGuests = computed(() => {
  return guests.value.filter((guest) =>
    `${guest.name} ${guest.surname} ${guest.telephone} ${guest.room}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase()),
  );
});

// Navigate to Add Guest form
const addGuest = () => {
  router.push("/guest-form");
};

// Navigate to Edit Guest form
const editGuest = (id) => {
  router.push(`/guest-form/${id}`);
};

// Delete Guest
const deleteGuest = (id) => {
  console.log("Delete Guest with ID:", id);
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>