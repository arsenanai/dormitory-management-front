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
            <CTableCell>{{ row.student }}</CTableCell>
            <CTableCell>{{ row.semester }}</CTableCell>
            <CTableCell>${{ row.totalPaid.toFixed(2) }}</CTableCell>
            <CTableCell>${{ row.outstanding.toFixed(2) }}</CTableCell>
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

// Mock data as fallback
const mockRows = [
  { id: 1, student: 'Alice Smith', semester: '2024-fall', totalPaid: 120000, outstanding: 0 },
  { id: 2, student: 'Bob Lee', semester: '2024-fall', totalPaid: 60000, outstanding: 60000 },
  { id: 3, student: 'Charlie Kim', semester: '2024-spring', totalPaid: 120000, outstanding: 0 },
];

const rows = ref(mockRows);
const loading = ref(false);
const error = ref('');

const studentFilter = ref('');
const semesterFilter = ref('');
const startDate = ref('');
const endDate = ref('');

const studentOptions = computed(() => [
  { value: '', name: t('All Students') },
  { value: 'Alice Smith', name: 'Alice Smith' },
  { value: 'Bob Lee', name: 'Bob Lee' },
  { value: 'Charlie Kim', name: 'Charlie Kim' },
]);

const filteredRows = computed(() => {
  return rows.value.filter(row => {
    const studentMatch = !studentFilter.value || row.student === studentFilter.value;
    const semesterMatch = !semesterFilter.value || row.semester === semesterFilter.value;
    
    // For now, always return true for date range since we're using mock data
    // In a real implementation, this would check against actual payment dates
    const dateMatch = true;
    
    return studentMatch && semesterMatch && dateMatch;
  });
});

// Load accounting data from API
const loadAccountingData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const filters = {
      student: studentFilter.value || undefined,
      semester: semesterFilter.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
    };
    
    const data = await accountingApi.getAccountingOverview(filters);
    rows.value = data || mockRows;
  } catch (err) {
    console.warn('Failed to load accounting data from API, using mock data:', err);
    // Fallback to mock data if API fails
    rows.value = mockRows;
    error.value = t('Failed to load accounting data. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Export accounting data
const exportAccounting = async () => {
  try {
    const filters = {
      student: studentFilter.value || undefined,
      semester: semesterFilter.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
    };
    
    const blob = await accountingApi.exportAccounting(filters);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Exporting accounting data as .xlsx');
  } catch (err) {
    console.error('Failed to export accounting data:', err);
    // Fallback to alert for now
    alert('Exporting accounting data as .xlsx (not yet implemented)');
  }
};

// Load data on mount
onMounted(() => {
  loadAccountingData();
});
</script> 