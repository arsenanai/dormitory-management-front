<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/RoomTypes.vue -->
<template>
    <Navigation :title="t('Room Types Management')">
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
          </div>
          <div class="flex-1 flex justify-end">
            <CButton variant="primary" @click="navigateToAddRoomType">
              <PlusIcon class="h-5 w-5" />
              {{ t("Add Room Type") }}
            </CButton>
          </div>
        </div>
  
        <!-- Room Types Table -->
        <CTable>
          <CTableHead>
            <CTableHeadCell>{{ t("Room Type Name") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Dormitory") }}</CTableHeadCell>
            <CTableHeadCell>{{ t("Number of Beds") }}</CTableHeadCell>
            <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(roomType, index) in paginatedRoomTypes" :key="roomType.id">
              <CTableCell>{{ roomType.name }}</CTableCell>
              <CTableCell>{{ roomType.dormitory?.name }}</CTableCell>
              <CTableCell>{{ getBedCount(roomType) }}</CTableCell>
              <CTableCell class="text-right flex gap-2 justify-end">
                <CButton @click="navigateToEditRoomType(roomType.id)">
                  <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
                </CButton>
                <CButton class="text-red-600" @click="deleteRoomType(roomType.id)">
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
  import { ref, computed, onMounted } from "vue";
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
  import { RoomType } from "@/models/RoomType";
  import { Dormitory } from "@/models/Dormitory";
  
  // i18n and router
  const { t } = useI18n();
  const router = useRouter();
  
  // Example dormitories
  const dormitories = [
    new Dormitory("A-BLOCK", 300, "female", "admin1", 267, 33, 75),
    new Dormitory("B-BLOCK", 300, "female", "admin2", 300, 0, 78),
    new Dormitory("C-BLOCK", 293, "male", "admin3", 300, 7, 80),
  ];
  
  // Dormitory options for filter
  const dormitoryOptions = [
    { value: "", name: t("All Dormitories") },
    ...dormitories.map((d) => ({ value: d.name, name: d.name })),
  ];
  
  // Filters
  const filters = ref({
    dormitory: "",
  });
  
  // Example room types with minimap (beds info stored as JSON string)
  const roomTypes = ref([
    {
      id: "1",
      name: "Standard",
      dormitory: dormitories[0],
      minimap: JSON.stringify([
        { id: "b1", number: "1", x: 60, y: 60 },
        { id: "b2", number: "2", x: 120, y: 60 },
      ]),
    },
    {
      id: "2",
      name: "Lux",
      dormitory: dormitories[1],
      minimap: JSON.stringify([
        { id: "b1", number: "1", x: 60, y: 60 },
        { id: "b2", number: "2", x: 120, y: 60 },
        { id: "b3", number: "3", x: 180, y: 60 },
      ]),
    },
  ]);
  
  // Filtered room types
  const filteredRoomTypes = computed(() => {
    if (!filters.value.dormitory) return roomTypes.value;
    return roomTypes.value.filter(
      (rt) => rt.dormitory?.name === filters.value.dormitory
    );
  });
  
  // Pagination
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const totalPages = computed(() =>
    Math.ceil(filteredRoomTypes.value.length / itemsPerPage)
  );
  const paginatedRoomTypes = computed(() =>
    filteredRoomTypes.value.slice(
      (currentPage.value - 1) * itemsPerPage,
      currentPage.value * itemsPerPage
    )
  );
  
  // Get bed count from minimap JSON
  function getBedCount(roomType: any): number {
    try {
      const beds = JSON.parse(roomType.minimap);
      return Array.isArray(beds) ? beds.length : 0;
    } catch {
      return 0;
    }
  }
  
  // Navigation actions
  function navigateToAddRoomType() {
    router.push("/room-type-form");
  }
  function navigateToEditRoomType(id: string) {
    router.push(`/room-type-form/${id}`);
  }
  function deleteRoomType(id: string) {
    // Implement delete logic here
    const idx = roomTypes.value.findIndex(rt => rt.id === id);
    if (idx !== -1) roomTypes.value.splice(idx, 1);
  }
  </script>
  
  <style scoped>
  /* Add custom styles if needed */
  </style>