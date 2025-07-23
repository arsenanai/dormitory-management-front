<template>
  <Navigation :title="t('Admin Management')">
    <div class="flex justify-end mb-4">
      <CButton data-testid="add-admin-button" @click="goToAddAdmin">
        {{ t('Add Admin') }}
      </CButton>
    </div>
    <CTable :columns="columns" :data="admins" :loading="loading">
      <template #cell-actions="{ row }">
        <CButton @click="goToEditAdmin(row)" size="sm">
          Edit
        </CButton>
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

const { t } = useI18n();
const router = useRouter();
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
    const response = await adminService.getAll();
    admins.value = response.data;
  } catch (e) {
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

onMounted(loadAdmins);
onActivated(loadAdmins);
</script>
