<template>
    <Navigation :title="t('Rooms Management')">
      <div class="flex flex-col gap-4">
        <!-- Filters and Add Button -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex flex-col gap-2 lg:flex-row lg:items-end">
            <CSelect
              id="dormitory-filter"
              v-model="filters.dormitory"
              :options="dormitoryOptions"
              :label="t('Dormitory')"
              :placeholder="t('Select Dormitory')"
              class="lg:w-40"
            />
            <CSelect
              id="room-type-filter"
              v-model="filters.roomType"
              :options="roomTypeOptions"
              :label="t('Room Type')"
              :placeholder="t('Select Room Type')"
              class="lg:w-40"
            />
          </div>
          <div class="flex-1 flex justify-end">
            <CButton variant="primary" @click="navigateToAddRoom">
              <PlusIcon class="h-5 w-5" />
              {{ t("Add Room") }}
            </CButton>
          </div>
        </div>
  
        <!-- Rooms Table -->
        <CTable>
          <CTableHead>
            <CTableHeadCell>{{ t("Room Number") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Dormitory") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Room Type") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Floor") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Beds") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Notes") }}</CTableHeadCell>
            <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(room, index) in paginatedRooms" :key="room.number">
              <CTableCell>{{ room.number }}</CTableCell>
              <CTableCell>{{ room.dormitory?.name }}</CTableCell>
              <CTableCell>{{ room.roomType?.name }}</CTableCell>
              <CTableCell>{{ room.floor }}</CTableCell>
              <CTableCell>{{ room.beds?.length ?? 0 }}</CTableCell>
              <CTableCell>{{ room.notes }}</CTableCell>
              <CTableCell class="text-right flex gap-2 justify-end">
                <CButton @click="navigateToEditRoom(room.number)">
                  <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
                </CButton>
                <CButton class="text-red-600" @click="deleteRoom(room.number)">
                  <TrashIcon class="h-5 w-5" /> {{ t("Delete") }}
                </CButton>
              </CTableCell>
            </CTableRow>
          </CTableBody>
        </CTable>
  
        <!-- Pagination -->
        <div class="flex items-center justify-between">
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
      </div>
    </Navigation>
  </template>
  
  <script setup lang="ts">
  import Navigation from "@/components/CNavigation.vue";
  import { useI18n } from "vue-i18n";
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import CSelect from "@/components/CSelect.vue";
  import CButton from "@/components/CButton.vue";
  import CTable from "@/components/CTable.vue";
  import CTableHead from "@/components/CTableHead.vue";
  import CTableHeadCell from "@/components/CTableHeadCell.vue";
  import CTableBody from "@/components/CTableBody.vue";
  import CTableRow from "@/components/CTableRow.vue";
  import CTableCell from "@/components/CTableCell.vue";
  import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
  import { Room } from "@/models/Room";
  import { Dormitory } from "@/models/Dormitory";
  import { RoomType } from "@/models/RoomType";
  import { Bed } from "@/models/Bed";
  
  // i18n and router
  const { t } = useI18n();
  const router = useRouter();
  
  // Example dormitories
  const dormitories = [
    new Dormitory("A-BLOCK", 300, "female", "admin1", 267, 33, 75),
    new Dormitory("B-BLOCK", 300, "female", "admin2", 300, 0, 78),
    new Dormitory("C-BLOCK", 293, "male", "admin3", 300, 7, 80),
  ];
  
  // Example room types
  const roomTypes = [
    new RoomType("1", "Double Room", JSON.stringify([
      { id: "b1", number: "1", x: 60, y: 60 },
      { id: "b2", number: "2", x: 120, y: 60 },
    ])),
    new RoomType("2", "Triple Room", JSON.stringify([
      { id: "b1", number: "1", x: 60, y: 60 },
      { id: "b2", number: "2", x: 120, y: 60 },
      { id: "b3", number: "3", x: 180, y: 60 },
    ])),
    new RoomType("3", "Suite", JSON.stringify([
      { id: "b1", number: "1", x: 60, y: 60 },
      { id: "b2", number: "2", x: 120, y: 60 },
      { id: "b3", number: "3", x: 180, y: 60 },
      { id: "b4", number: "4", x: 240, y: 60 },
    ])),
  ];
  
  // Dormitory options for filter
  const dormitoryOptions = [
    { value: "", name: t("All Dormitories") },
    ...dormitories.map((d) => ({ value: d.name, name: d.name })),
  ];
  
  // Room type options for filter
  const roomTypeOptions = [
    { value: "", name: t("All Room Types") },
    ...roomTypes.map((rt) => ({ value: rt.name, name: rt.name })),
  ];
  
  // Filters
  const filters = ref({
    dormitory: "",
    roomType: "",
  });
  
  // Example rooms
  const rooms = ref<Room[]>([
    new Room("A210", dormitories[0], 2, "Near the stairs", roomTypes[0], [
      new Bed("b1", "1", "available", null, [], null),
      new Bed("b2", "2", "available", null, [], null),
    ]),
    new Room("A211", dormitories[0], 2, "", roomTypes[1], [
      new Bed("b1", "1", "available", null, [], null),
      new Bed("b2", "2", "available", null, [], null),
      new Bed("b3", "3", "available", null, [], null),
    ]),
    new Room("B101", dormitories[1], 1, "Window view", roomTypes[2], [
      new Bed("b1", "1", "available", null, [], null),
      new Bed("b2", "2", "available", null, [], null),
      new Bed("b3", "3", "available", null, [], null),
      new Bed("b4", "4", "available", null, [], null),
    ]),
  ]);
  
  // Filtered rooms
  const filteredRooms = computed(() => {
    return rooms.value.filter((room) => {
      const dormMatch = !filters.value.dormitory || room.dormitory?.name === filters.value.dormitory;
      const typeMatch = !filters.value.roomType || room.roomType?.name === filters.value.roomType;
      return dormMatch && typeMatch;
    });
  });
  
  // Pagination
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const totalPages = computed(() =>
    Math.ceil(filteredRooms.value.length / itemsPerPage)
  );
  const paginatedRooms = computed(() =>
    filteredRooms.value.slice(
      (currentPage.value - 1) * itemsPerPage,
      currentPage.value * itemsPerPage
    )
  );
  
  // Navigation actions
  function navigateToAddRoom() {
    router.push("/room-form");
  }
  function navigateToEditRoom(number: string) {
    router.push(`/room-form/${number}`);
  }
  function deleteRoom(number: string) {
    const idx = rooms.value.findIndex(r => r.number === number);
    if (idx !== -1) rooms.value.splice(idx, 1);
  }
  </script>
  
  <style scoped>
  /* Add custom styles if needed */
  </style>