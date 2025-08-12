<template>
  <Navigation :title="t('Admin Management')">
    <div class="flex justify-end mb-4">
      <CButton data-testid="add-admin-button" @click="goToAddAdmin">
        {{ t('Add Admin') }}
      </CButton>
    </div>
    <CTable :columns="columns" :data="admins" :loading="loading">
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <CButton @click="goToEditAdmin(row)" size="sm">
            Edit
          </CButton>
          <CButton @click="deleteAdmin(row)" size="sm" variant="danger">
            Delete
          </CButton>
        </div>
      </template>
    </CTable>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Navigation from '@/components/CNavigation.vue';
import CButton from '@/components/CButton.vue';
import CTable from '@/components/CTable.vue';
import { adminService } from '@/services/api';
import { useToast } from '@/composables/useToast';

const { t } = useI18n();
const router = useRouter();
const { showToast } = useToast();
const admins = ref([]);
const loading = ref(false);

const columns = [
  { key: 'name', label: t('Name') },
  { key: 'surname', label: t('Surname') },
  { key: 'email', label: t('E-mail') },
  { key: 'dormitory', label: t('Dormitory') },
  { key: 'actions', label: t('Actions') },
];

const loadAdmins = async () => {
  loading.value = true;
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      admins.value = [];
      return;
    }

    const response = await adminService.getAll();
    console.log('API Response:', response);
    
    // Handle Laravel paginated response structure
    if (response && response.data) {
      // Laravel paginated response: { data: [...], current_page: 1, ... }
      if (response.data.data && Array.isArray(response.data.data)) {
        admins.value = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        admins.value = response.data;
      } else {
        // Fallback - try to find data in the response
        admins.value = [];
      }
    } else {
      admins.value = [];
    }
    
    console.log('Fetched admins:', admins.value);
    console.log('Number of admins:', admins.value.length);
  } catch (e) {
    console.error('Error fetching admins:', e);
    admins.value = [];
  } finally {
    loading.value = false;
  }
};

const goToAddAdmin = () => {
  router.push({ path: '/admin-form' });
};

const goToEditAdmin = (admin) => {
  router.push({ path: `/admin-form/${admin.id}` });
};

const deleteAdmin = async (admin) => {
  if (confirm(`Are you sure you want to delete admin ${admin.name}?`)) {
    try {
      await adminService.delete(admin.id);
      showToast('Admin deleted successfully', 'success');
      await loadAdmins(); // Reload the list
    } catch (error) {
      console.error('Error deleting admin:', error);
      showToast('Failed to delete admin', 'error');
    }
  }
};

onMounted(loadAdmins);
onActivated(loadAdmins);
</script>
