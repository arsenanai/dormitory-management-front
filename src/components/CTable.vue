<template>
  <div class="relative overflow-x-auto border border-gray-300 sm:rounded-lg">
    <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead
        v-if="columns.length > 0"
        class="text-primary-700 bg-primary-50 dark:bg-primary-700 dark:text-primary-400 text-xs uppercase"
      >
        <tr>
          <!-- Checkbox header cell: Render slot if provided, otherwise render default checkbox if selectable -->
          <th v-if="hasCheckboxColumn" class="p-4">
            <slot name="header-checkbox">
              <!-- Fallback for backward compatibility when `selectable` is true but slot is not used -->
              <input
                v-if="selectable"
                type="checkbox"
                v-model="selectAll"
                class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
              />
            </slot>
          </th>
          <th
            v-for="column in dataColumns"
            :key="column.key"
            :class="[
              'px-6 py-3',
              column.sortable ? 'cursor-pointer hover:bg-gray-200' : '',
              column.class || '',
            ]"
            @click="column.sortable ? handleSort(column.key) : null"
          >
            <span>{{ column.label }}</span>
            <span v-if="column.sortable && sortBy === column.key">
              {{ sortDirection === "asc" ? "↑" : "↓" }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody v-if="!loading">
        <tr v-if="data.length === 0">
          <td :colspan="totalColumns" class="px-6 py-4 text-center text-gray-500">
            No data available
          </td>
        </tr>
        <tr
          v-for="(row, index) in data"
          :key="getRowKey(row, index)"
          :class="[
            'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
            striped && index % 2 === 0 ? 'even' : striped && index % 2 === 1 ? 'odd' : '',
            hoverable ? 'hoverable hover:bg-gray-100 dark:hover:bg-gray-600' : '',
          ]"
          @click="handleRowClick(row)"
        >
          <!-- Checkbox body cell -->
          <td v-if="hasCheckboxColumn" class="px-6 py-4">
            <slot :name="`cell-checkbox`" :row="row">
              <!-- Fallback for backward compatibility -->
              <input
                v-if="selectable"
                type="checkbox"
                :checked="selectedRows.includes(row)"
                @change="handleRowSelect(row)"
                class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
              />
            </slot>
          </td>
          <td
            v-for="column in dataColumns"
            :key="`${getRowKey(row, index)}-${column.key}`"
            :class="['px-6 py-4', column.class || '']"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :column="column"
              :value="getColumnValue(row, column)"
            >
              {{ formatColumnValue(row, column) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Loading spinner -->
    <div v-if="loading" class="flex items-center justify-center p-8">
      <div
        class="loading-spinner border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  class?: string;
  format?: (value: any) => string;
  type?: string;
}

interface Props {
  data?: any[];
  columns?: Column[];
  loading?: boolean;
  selectable?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  rowKey?: string | ((row: any) => string | number);
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  selectable: false,
  striped: false,
  hoverable: false,
  rowKey: "id",
});

const emit = defineEmits<{
  "row-click": [row: any];
  sort: [sortConfig: { column: string; direction: "asc" | "desc" }];
  "selection-change": [selectedRows: any[]];
}>();

const sortBy = ref<string>("");
const sortDirection = ref<"asc" | "desc">("asc");
const selectedRows = ref<any[]>([]);

const selectAll = computed({
  get: () => selectedRows.value.length === props.data.length && props.data.length > 0,
  set: (value: boolean) => {
    selectedRows.value = value ? [...props.data] : [];
    emit("selection-change", selectedRows.value);
  },
});

const totalColumns = computed(() => {
  // A column is either defined in `columns` prop or added via `selectable` prop.
  return props.columns.length;
});

const hasCheckboxColumn = computed(() => {
  return props.selectable || props.columns.some((c) => c.key === "checkbox");
});

const dataColumns = computed(() => {
  return props.columns.filter((c) => c.key !== "checkbox");
});

function getRowKey(row: any, index: number): string | number {
  if (typeof props.rowKey === "function") {
    return props.rowKey(row);
  }
  return row[props.rowKey] || index;
}

function getColumnValue(row: any, column: Column): any {
  if (column.key.includes(".")) {
    return column.key
      .split(".")
      .reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), row);
  } else {
    return row[column.key];
  }
}

function formatColumnValue(row: any, column: Column): string {
  const value = getColumnValue(row, column);
  if (column.format && typeof column.format === "function") {
    return column.format(value);
  }
  return String(value || "");
}

function handleRowClick(row: any): void {
  emit("row-click", row);
}

function handleSort(columnKey: string): void {
  if (sortBy.value === columnKey) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = columnKey;
    sortDirection.value = "asc";
  }

  emit("sort", { column: columnKey, direction: sortDirection.value });
}

function handleRowSelect(row: any): void {
  const index = selectedRows.value.indexOf(row);
  if (index > -1) {
    selectedRows.value.splice(index, 1);
  } else {
    selectedRows.value.push(row);
  }
  emit("selection-change", selectedRows.value);
}

// Watch for external changes to data
watch(
  () => props.data,
  () => {
    // Clear selection when data changes
    selectedRows.value = [];
    emit("selection-change", selectedRows.value);
  }
);
</script>
