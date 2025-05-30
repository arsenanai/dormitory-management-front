<template>
  <Navigation :title="t('User Management')">
    <div class="flex flex-col gap-4 justify-between">
      <!-- Filter and Add Admin Button Section -->
      <div class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-end lg:justify-between w-full">
        <!-- Filter Section -->
        <div class="flex-auto flex flex-col gap-2 lg:flex-row lg:items-end">
          <CSelect id="dormitory-filter" v-model="filters.dormitory" :options="dormitoryOptions" :label="t('Dormitory')"
            :placeholder="t('Select Dormitory')" class="lg:w-40" />
        </div>
        <!-- Add Admin Button -->
        <div class="flex-1 flex justify-end">
          <CButton variant="primary" @click="navigateToAddAdmin">
            <PencilSquareIcon class="h-5 w-5" />
            {{ t("Add new Admin") }}
          </CButton>
        </div>
      </div>

      <!-- Users Table -->
      <CTable>
        <CTableHead>
          <CTableHeadCell>{{ t("NAME") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("SURNAME") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("DORMITORY") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("TELEPHONE") }}</CTableHeadCell>
          <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="(user, index) in paginatedUsers" :key="index">
            <CTableCell>{{ user.name }}</CTableCell>
            <CTableCell>{{ user.surname }}</CTableCell>
            <CTableCell>{{ user.dormitory?.name }}</CTableCell>
            <CTableCell>
  <div v-for="(phone, phoneIndex) in user.phoneNumbers" :key="phoneIndex">
    {{ phone }}
  </div>
</CTableCell>
            <CTableCell class="text-right">
              <CButton @click="navigateToEditUser(user.id)">
                <PencilSquareIcon class="h-5 w-5" /> {{ t("Edit") }}
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
import { PencilSquareIcon } from "@heroicons/vue/24/outline";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import { User } from "@/models/User";
import { Dormitory } from "@/models/Dormitory";
import { useUserStore } from "@/stores/user";
import { LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY } from "@/Const";

// i18n
const { t } = useI18n();
const router = useRouter();

// store
const userStore = useUserStore();

// Filters
const filters = ref({
  dormitory: "",
});

// Example dormitory list
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

// Example users (dormitory admins)
const users = ref<User[]>([
  Object.assign(new User(), {
    id: 1,
    name: "Ali",
    surname: "Adminov",
    dormitory: dormitories[0],
    phoneNumbers: ["+71234567890", "+71234567891"], // Added multiple phone numbers
    email: "ali.adminov@example.com",
  }),
  Object.assign(new User(), {
    id: 2,
    name: "Sara",
    surname: "Dormova",
    dormitory: dormitories[1],
    phoneNumbers: ["+71234567892", "+71234567893"], // Added multiple phone numbers
    email: "sara.dormova@example.com",
  }),
  Object.assign(new User(), {
    id: 3,
    name: "Ivan",
    surname: "Ivanov",
    dormitory: dormitories[2],
    phoneNumbers: ["+71234567894", "+71234567895"], // Added multiple phone numbers
    email: "ivan.ivanov@example.com",
  }),
]);

const filteredUsers = computed(() => {
  if (!filters.value.dormitory) return users.value;
  return users.value.filter(
    (user) => user.dormitory?.name === filters.value.dormitory
  );
});

const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage)
);
const paginatedUsers = computed(() =>
  filteredUsers.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
);

const navigateToEditUser = (id: number) => {
  const user = users.value.find((u) => u.id === id);
  if (user) {
    userStore.setSelectedUser(user); // Store the user in Pinia
    router.push(`/admin-form/${id}`);
  }
};

const navigateToAddAdmin = () => {
  router.push('/admin-form');
};

onMounted(() => {
  userStore.clearSelectedUser();
});
</script>