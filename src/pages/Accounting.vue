<template>
  <Navigation :title="t('Accounting page')">
    <!-- Search Bar -->
    <div class="mb-4 flex items-center justify-between">
      <div class="relative w-full max-w-xs">
        <CInput
          id="search-accounting"
          v-model="searchQuery"
          type="search"
          :placeholder="t('Search')"
          :label="t('Search')"
        />
      </div>
    </div>

    <!-- Accounting Table -->
    <CTable>
      <CTableHead>
        <CTableHeadCell>{{ t("NAME") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("SURNAME") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("DOGOVOR DATE") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("DOGOVOR NOMER") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("ОПЛАТА") }}</CTableHeadCell>
      </CTableHead>
      <CTableBody>
        <CTableRow
          v-for="(entry, index) in filteredAccountingEntries"
          :key="index"
        >
          <CTableCell>{{ entry.name }}</CTableCell>
          <CTableCell>{{ entry.surname }}</CTableCell>
          <CTableCell>{{ entry.dogovorDate }}</CTableCell>
          <CTableCell>{{ entry.dogovorNumber }}</CTableCell>
          <CTableCell>{{ entry.payment }}</CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </Navigation>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";

const { t } = useI18n();

// Search Query
const searchQuery = ref("");

// Accounting Data
const accountingEntries = ref([
  {
    name: "Student1",
    surname: "Studentov1",
    dogovorDate: "22-11-2023",
    dogovorNumber: "12345",
    payment: "14000T",
  },
  {
    name: "Student2",
    surname: "Studentov2",
    dogovorDate: "12-01-2024",
    dogovorNumber: "67890",
    payment: "0",
  },
  {
    name: "Student3",
    surname: "Studentov3",
    dogovorDate: "12-01-2023",
    dogovorNumber: "54321",
    payment: "25000T",
  },
]);

// Filtered Accounting Entries
const filteredAccountingEntries = computed(() => {
  return accountingEntries.value.filter((entry) =>
    `${entry.name} ${entry.surname} ${entry.dogovorDate} ${entry.dogovorNumber} ${entry.payment}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase()),
  );
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>