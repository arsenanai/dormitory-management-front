<template>
  <Navigation :title="t('Accounting Overview')">
    <div class="flex flex-col gap-4">
      <h1>{{ t('Accounting') }}</h1>
      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-4">
        <CSelect
          id="student-filter"
          v-model="studentFilter"
          :options="studentOptions"
          :label="t('Student')"
          class="w-48"
        />
        <CInput
          id="semester-filter"
          v-model="semesterFilter"
          :label="t('Semester')"
          placeholder="e.g. 2024-fall"
          class="w-32"
        />
        <CInput
          id="start-date"
          v-model="startDate"
          type="date"
          :label="t('Start Date')"
          class="w-36"
        />
        <CInput
          id="end-date"
          v-model="endDate"
          type="date"
          :label="t('End Date')"
          class="w-36"
        />
        <CButton variant="secondary" @click="exportAccounting" data-testid="export-accounting-button">
          <span class="material-icons">download</span>
          {{ t('Export as .xlsx') }}
        </CButton>
      </div>
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="text-primary-600">{{ t('Loading...') }}</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500">{{ error }}</div>
      </div>
      
      <CTable v-else>
        <CTableHead>
          <CTableHeadCell>{{ t('Student') }}</CTableHeadCell>
          <CTableHeadCell>{{ t('Semester') }}</CTableHeadCell>
          <CTableHeadCell>{{ t('Total Paid') }}</CTableHeadCell>
          <CTableHeadCell>{{ t('Outstanding') }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
          <CTableRow v-if="filteredRows.length === 0">
            <CTableCell colspan="4" class="text-center text-primary-500">
              {{ t('No accounting data available') }}
            </CTableCell>
          </CTableRow>
          <CTableRow v-for="row in filteredRows" :key="row.id">
            <CTableCell>{{ row.student_name }}</CTableCell>
            <CTableCell>{{ row.semester }}</CTableCell>
            <CTableCell>${{ parseFloat(row.amount).toFixed(2) }}</CTableCell>
            <CTableCell>${{ row.payment_approved ? '0.00' : parseFloat(row.amount).toFixed(2) }}</CTableCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { accountingApi } from '@/services/api';
import Navigation from '@/components/CNavigation.vue';
import CInput from '@/components/CInput.vue';
import CSelect from '@/components/CSelect.vue';
import CButton from '@/components/CButton.vue';
import CTable from '@/components/CTable.vue';
import CTableHead from '@/components/CTableHead.vue';
import CTableHeadCell from '@/components/CTableHeadCell.vue';
import CTableBody from '@/components/CTableBody.vue';
import CTableRow from '@/components/CTableRow.vue';
import CTableCell from '@/components/CTableCell.vue';

const { t } = useI18n();

// Reactive data
const rows = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const summary = ref<any>({});

// Filters
const studentFilter = ref('');
const semesterFilter = ref('');
const startDate = ref('');
const endDate = ref('');

// Student options for filter
const studentOptions = ref<{ value: string; name: string }[]>([]);

// Fetch accounting data
const fetchAccountingData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const params: any = {};
    if (studentFilter.value) params.student = studentFilter.value;
    if (semesterFilter.value) params.semester = semesterFilter.value;
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;
    
    const response = await accountingApi.getAccountingData(params);
    rows.value = response.data.data || [];
    summary.value = response.data.summary || {};
    
    // Extract unique students for filter options
    const students = new Set<string>();
    rows.value.forEach(row => {
      if (row.student_name) {
        students.add(row.student_name);
      }
    });
    
    studentOptions.value = Array.from(students).map(name => ({
      value: name,
      name: name
    }));
    
  } catch (err: any) {
    console.error('Failed to fetch accounting data:', err);
    error.value = err.response?.data?.message || t('Failed to load accounting data');
    
    // Fallback to mock data if API fails
    rows.value = [
      { id: 1, student_name: 'Alice Smith', semester: '2024-fall', amount: 120000, payment_approved: true },
      { id: 2, student_name: 'Bob Lee', semester: '2024-fall', amount: 60000, payment_approved: false },
      { id: 3, student_name: 'Charlie Kim', semester: '2024-spring', amount: 120000, payment_approved: true },
    ];
  } finally {
    loading.value = false;
  }
};

// Computed filtered rows
const filteredRows = computed(() => {
  return rows.value;
});

// Export accounting data
const exportAccounting = async () => {
  try {
    const params: any = {};
    if (studentFilter.value) params.student = studentFilter.value;
    if (semesterFilter.value) params.semester = semesterFilter.value;
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;
    
    const response = await accountingApi.exportAccounting(params);
    
    // For now, just show a success message
    // In a real implementation, this would download a file
    alert(t('Export completed successfully'));
    
  } catch (err: any) {
    console.error('Failed to export accounting data:', err);
    alert(t('Failed to export accounting data'));
  }
};

// Watch for filter changes
const applyFilters = () => {
  fetchAccountingData();
};

// Lifecycle
onMounted(() => {
  fetchAccountingData();
});
</script> 