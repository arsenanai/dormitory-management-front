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
        <CTableHeadCell /> <!-- For the action column -->
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
          <CTableCell>
            <RouterLink
              class="text-primary-700 hover:underline"
              :to="{
                name: 'Payment Form',
                params: { id: entry.dogovorNumber }
              }"
            >
              {{ t('Open') }}
            </RouterLink>
          </CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </Navigation>
</template>

<script setup lang="ts">
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
import { Payment } from "@/models/Payment"; // Import the Payment class

const { t } = useI18n();

// Search Query
const searchQuery = ref<string>("");

// Accounting Data
const accountingEntries = ref<Payment[]>([
  new Payment("Student1", "Studentov1", "22-11-2023", "12345", "14000T"),
  new Payment("Student2", "Studentov2", "12-01-2024", "67890", "0"),
  new Payment("Student3", "Studentov3", "12-01-2023", "54321", "25000T"),
]);

// Filtered Accounting Entries
const filteredAccountingEntries = computed<Payment[]>(() => {
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
