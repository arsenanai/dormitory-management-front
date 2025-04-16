<template>
  <Navigation :title="t('Guest House')">
    <!-- Search Bar -->
    <div class="mb-4 flex items-center justify-between">
      <div class="relative w-full max-w-xs">
        <FwbInput
          v-model="searchQuery"
          type="text"
          :placeholder="t('Search')"
          class="pl-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        />
        <div
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
        >
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <FwbButton
        type="button"
        class="ml-4 flex items-center gap-2"
        color="light"
        @click="addGuest"
      >
        <span class="flex flex-row items-center gap-2">
          <UserPlusIcon class="h-5 w-5" />
          {{ t("Add Guest") }}
        </span>
      </FwbButton>
    </div>

    <!-- Responsive Table -->
    <FwbTable hoverable>
      <FwbTableHead>
        <FwbTableHeadCell>{{ t("Name") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Surname") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Enter Date") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Exit Date") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Telephone") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Room") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Payment") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Edit") }}</FwbTableHeadCell>
        <FwbTableHeadCell>{{ t("Delete") }}</FwbTableHeadCell>
      </FwbTableHead>
      <FwbTableBody>
        <FwbTableRow
          v-for="guest in filteredGuests"
          :key="guest.id"
          class="border-gray-300"
        >
          <FwbTableCell>{{ guest.name }}</FwbTableCell>
          <FwbTableCell>{{ guest.surname }}</FwbTableCell>
          <FwbTableCell>{{ guest.enterDate }}</FwbTableCell>
          <FwbTableCell>{{ guest.exitDate }}</FwbTableCell>
          <FwbTableCell>{{ guest.telephone }}</FwbTableCell>
          <FwbTableCell>{{ guest.room }}</FwbTableCell>
          <FwbTableCell>{{ guest.payment }}</FwbTableCell>
          <FwbTableCell>
            <button
              @click="editGuest(guest.id)"
              class="text-blue-500 hover:text-blue-700"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
          </FwbTableCell>
          <FwbTableCell>
            <button
              @click="deleteGuest(guest.id)"
              class="text-red-500 hover:text-red-700"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </FwbTableCell>
        </FwbTableRow>
      </FwbTableBody>
    </FwbTable>
  </Navigation>
</template>

<script setup>
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import {
  FwbInput,
  FwbButton,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
} from "flowbite-vue";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline"; // Import icons
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

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

// Navigate to Add Student form
const addGuest = () => {
  router.push("/guest-form");
};

// Navigate to Edit Student form
const editGuest = (id) => {
  router.push(`/guest-form/${id}`);
};

const deleteGuest = (id) => {
  console.log("Delete Guest with ID:", id);
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
