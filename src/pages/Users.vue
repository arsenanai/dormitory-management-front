<template>
  <Navigation :title="t('User Management')">
    <div class="flex flex-col gap-4 justify-between">
      <h1>Users</h1>
      
      <!-- Filter and Add User Button Section -->
      <div class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-end lg:justify-between w-full">
        <!-- Filter Section -->
        <div class="flex-auto flex flex-col gap-2 lg:flex-row lg:items-end">
          <div>
            <CInput
              id="search"
              v-model="searchTerm"
              :label="t('Search')"
              :placeholder="t('Search users...')"
              class="lg:w-40"
            />
          </div>
          <CSelect 
            id="role-filter" 
            v-model="roleFilter" 
            :options="roleFilterOptions" 
            :label="t('Role')"
            :placeholder="t('All Roles')" 
            class="lg:w-40" 
          />
          <CSelect 
            id="gender-filter" 
            v-model="genderFilter" 
            :options="genderFilterOptions" 
            :label="t('Gender')"
            :placeholder="t('All Genders')" 
            class="lg:w-40" 
          />
          <CSelect 
            id="dormitory-filter" 
            v-model="filters.dormitory" 
            :options="dormitoryOptions" 
            :label="t('Dormitory')"
            :placeholder="t('Select Dormitory')" 
            class="lg:w-40" 
          />
        </div>
        
        <!-- Add User Button -->
        <div class="flex-1 flex justify-end">
          <CButton variant="primary" @click="showUserForm" data-testid="add-user-button">
            <PencilSquareIcon class="h-5 w-5" />
            {{ t("Add User") }}
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

      <!-- Users Table -->
      <CTable v-if="!loading && !error">
        <CTableHead>
          <CTableHeadCell>{{ t("NAME") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("EMAIL") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("ROLE") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("PHONE") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("AGE") }}</CTableHeadCell>
          <CTableHeadCell class="text-right">{{ t("Action") }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="user in paginatedUsers" :key="user.id">
            <CTableCell>{{ user.name || '-' }}</CTableCell>
            <CTableCell>{{ user.email || '-' }}</CTableCell>
            <CTableCell>
              <span :class="`text-${getRoleColor(user.role)}-600`">
                {{ user.role || '-' }}
              </span>
            </CTableCell>
            <CTableCell>{{ formatPhone(user.phone) || '-' }}</CTableCell>
            <CTableCell>{{ calculateAge(user.date_of_birth) || '-' }}</CTableCell>
            <CTableCell class="text-right">
              <div class="flex gap-2 justify-end">
                <CButton @click="editUser(user)" size="small">
                  <PencilSquareIcon class="h-4 w-4" /> {{ t("Edit") }}
                </CButton>
                <CButton @click="deleteUser(user.id)" variant="danger" size="small">
                  {{ t("Delete") }}
                </CButton>
              </div>
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

      <!-- User Stats -->
      <div v-if="userStats" class="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="text-center p-4 bg-gray-100 rounded">
          <div class="text-2xl font-bold">{{ userStats.total }}</div>
          <div class="text-sm text-gray-600">{{ t("Total Users") }}</div>
        </div>
        <div class="text-center p-4 bg-blue-100 rounded">
          <div class="text-2xl font-bold">{{ userStats.students }}</div>
          <div class="text-sm text-gray-600">{{ t("Students") }}</div>
        </div>
        <div class="text-center p-4 bg-red-100 rounded">
          <div class="text-2xl font-bold">{{ userStats.admins }}</div>
          <div class="text-sm text-gray-600">{{ t("Admins") }}</div>
        </div>
        <div class="text-center p-4 bg-green-100 rounded">
          <div class="text-2xl font-bold">{{ userStats.withRooms }}</div>
          <div class="text-sm text-gray-600">{{ t("With Rooms") }}</div>
        </div>
        <div class="text-center p-4 bg-yellow-100 rounded">
          <div class="text-2xl font-bold">{{ userStats.withoutRooms }}</div>
          <div class="text-sm text-gray-600">{{ t("Without Rooms") }}</div>
        </div>
      </div>
    </div>

    <!-- User Form Modal (placeholder) -->
    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h2>{{ selectedUser ? t("Edit User") : t("Add User") }}</h2>
        <div class="mt-4 flex gap-2">
          <CButton @click="closeUserForm" variant="secondary">{{ t("Cancel") }}</CButton>
          <CButton @click="handleFormSubmit({})" variant="primary">{{ t("Save") }}</CButton>
        </div>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
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
import { userService, dormitoryService } from "@/services/api";
import { useUserStore } from "@/stores/user";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const { showError, showSuccess } = useToast();

// Reactive state
const users = ref<any[]>([]);
const dormitories = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showForm = ref(false);
const selectedUser = ref<any>(null);
const searchTerm = ref('');
const roleFilter = ref('');
const genderFilter = ref('');
const sortBy = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Filter state
const filters = ref({
  dormitory: "",
});

// Filter options
const roleFilterOptions = [
  { value: "", name: t("All Roles") },
  { value: "student", name: t("Student") },
  { value: "admin", name: t("Admin") },
  { value: "staff", name: t("Staff") }
];

const genderFilterOptions = [
  { value: "", name: t("All Genders") },
  { value: "male", name: t("Male") },
  { value: "female", name: t("Female") }
];

const dormitoryOptions = computed(() => [
  { value: "", name: t("All Dormitories") },
  ...dormitories.value.map((d) => ({ value: d.id, name: d.name })),
]);

// Load users function
async function loadUsers(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    const [usersResponse, dormitoriesResponse] = await Promise.all([
      userService.getAll(),
      dormitoryService.getAll()
    ]);
    users.value = usersResponse.data || [];
    dormitories.value = dormitoriesResponse.data || [];
  } catch (err) {
    error.value = 'Failed to load users';
    showError(t('Failed to load users'));
  } finally {
    loading.value = false;
  }
}

// CRUD operations
async function createUser(userData: any): Promise<void> {
  try {
    const response = await userService.create(userData);
    users.value.push(response.data);
    showSuccess(t('User created successfully'));
    showForm.value = false;
  } catch (err) {
    showError(t('Failed to create user'));
  }
}

async function updateUser(id: number, userData: any): Promise<void> {
  try {
    const response = await userService.update(id, userData);
    const index = users.value.findIndex(u => u.id === id);
    if (index !== -1) {
      users.value[index] = response.data;
    }
    showSuccess(t('User updated successfully'));
    showForm.value = false;
  } catch (err) {
    showError(t('Failed to update user'));
  }
}

async function deleteUser(id: number): Promise<void> {
  try {
    await userService.delete(id);
    users.value = users.value.filter(u => u.id !== id);
    showSuccess(t('User deleted successfully'));
  } catch (err) {
    showError(t('Failed to delete user'));
  }
}

// Modal functions
function showUserForm(): void {
  selectedUser.value = null;
  showForm.value = true;
}

function closeUserForm(): void {
  showForm.value = false;
  selectedUser.value = null;
}

function editUser(user: any): void {
  selectedUser.value = user;
  showForm.value = true;
}

async function handleFormSubmit(formData: any): Promise<void> {
  if (selectedUser.value) {
    await updateUser(selectedUser.value.id, formData);
  } else {
    await createUser(formData);
  }
}

// Utility functions
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'admin': return 'red';
    case 'student': return 'blue';
    case 'staff': return 'green';
    default: return 'gray';
  }
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with +1
  if (phone.startsWith('+1') && cleaned.length === 10) {
    // For +1234567890, cleaned is 1234567890, we want +1 (234) 567-890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 10)}`;
  } else if (cleaned.length === 10) {
    // For 1234567890, we want (234) 567-890
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 10)}`;
  }
  
  return phone;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Search term filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(user =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  }

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value);
  }

  // Gender filter
  if (genderFilter.value) {
    filtered = filtered.filter(user => user.gender === genderFilter.value);
  }

  // Dormitory filter
  if (filters.value.dormitory) {
    filtered = filtered.filter(user =>
      user.dormitory_id === parseInt(filters.value.dormitory) ||
      user.dormitory?.id === parseInt(filters.value.dormitory)
    );
  }

  return filtered;
});

const sortedUsers = computed(() => {
  const sorted = [...filteredUsers.value];
  
  sorted.sort((a, b) => {
    let aValue = a[sortBy.value];
    let bValue = b[sortBy.value];
    
    if (sortBy.value === 'name') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }
    
    if (sortOrder.value === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  return sorted;
});

const totalPages = computed(() =>
  Math.ceil(sortedUsers.value.length / itemsPerPage.value)
);

const paginatedUsers = computed(() =>
  sortedUsers.value.slice(
    (currentPage.value - 1) * itemsPerPage.value,
    currentPage.value * itemsPerPage.value
  )
);

const userStats = computed(() => {
  const total = users.value.length;
  const students = users.value.filter(u => u.role === 'student').length;
  const admins = users.value.filter(u => u.role === 'admin').length;
  const withRooms = users.value.filter(u => u.room_id).length;
  const withoutRooms = total - withRooms;

  return {
    total,
    students,
    admins,
    withRooms,
    withoutRooms
  };
});

// Initialize data
onMounted(() => {
  loadUsers();
  userStore.clearSelectedUser();
});
</script>