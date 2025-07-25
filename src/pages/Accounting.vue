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
      <!-- Summary Table -->
      <CTable>
        <CTableHead>
          <CTableHeadCell>{{ t('Student') }}</CTableHeadCell>
          <CTableHeadCell>{{ t('Semester') }}</CTableHeadCell>
          <CTableHeadCell>{{ t('Total Paid') }}</CTableHeadCell>
          <CTableHeadCell>{{ t('Outstanding') }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
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
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
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

// Mock data for now
const rows = ref([
  { id: 1, student: 'Alice Smith', semester: '2024-fall', totalPaid: 120000, outstanding: 0 },
  { id: 2, student: 'Bob Lee', semester: '2024-fall', totalPaid: 60000, outstanding: 60000 },
  { id: 3, student: 'Charlie Kim', semester: '2024-spring', totalPaid: 120000, outstanding: 0 },
]);

const studentFilter = ref('');
const semesterFilter = ref('');
const startDate = ref('');
const endDate = ref('');

const studentOptions = [
  { value: '', name: t('All Students') },
  { value: 'Alice Smith', name: 'Alice Smith' },
  { value: 'Bob Lee', name: 'Bob Lee' },
  { value: 'Charlie Kim', name: 'Charlie Kim' },
];

const filteredRows = computed(() => {
  return rows.value.filter(row => {
    return (
      (!studentFilter.value || row.student === studentFilter.value) &&
      (!semesterFilter.value || row.semester === semesterFilter.value)
      // Date range filtering can be added when real data is used
    );
  });
});

function exportAccounting() {
  // Placeholder for export logic
  alert('Exporting accounting data as .xlsx (not yet implemented)');
}
</script> 