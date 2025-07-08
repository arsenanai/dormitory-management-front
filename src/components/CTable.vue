<template>
  <div class="overflow-x-auto relative border border-gray-300 sm:rounded-lg">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead v-if="columns.length > 0" class="text-xs text-primary-700 uppercase bg-primary-50 dark:bg-primary-700 dark:text-primary-400">
        <tr>
          <th v-if="selectable" class="p-4">
            <input
              type="checkbox"
              v-model="selectAll"
              @change="handleSelectAll"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-6 py-3 cursor-pointer hover:bg-gray-100',
              column.class || ''
            ]"
            @click="column.sortable ? handleSort(column.key) : null"
          >
            {{ column.label }}
            <span v-if="column.sortable && sortBy === column.key">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
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
            'bg-white border-b dark:bg-gray-800 dark:border-gray-700',
            striped && index % 2 === 0 ? 'even' : striped && index % 2 === 1 ? 'odd' : '',
            hoverable ? 'hoverable hover:bg-gray-50 dark:hover:bg-gray-600' : ''
          ]"
          @click="handleRowClick(row)"
        >
          <td v-if="selectable" class="p-4">
            <input
              type="checkbox"
              :checked="selectedRows.includes(row)"
              @change="handleRowSelect(row)"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </td>
          <td
            v-for="column in columns"
            :key="`${getRowKey(row, index)}-${column.key}`"
            :class="['px-6 py-4', column.class || '']"
          >
            <slot :name="`cell-${column.key}`" :row="row" :column="column" :value="getColumnValue(row, column)">
              {{ formatColumnValue(row, column) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Loading spinner -->
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="loading-spinner animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  class?: string
  format?: (value: any) => string
  type?: string
}

interface Props {
  data?: any[]
  columns?: Column[]
  loading?: boolean
  selectable?: boolean
  striped?: boolean
  hoverable?: boolean
  rowKey?: string | ((row: any) => string | number)
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  selectable: false,
  striped: false,
  hoverable: false,
  rowKey: 'id'
})

const emit = defineEmits<{
  'row-click': [row: any]
  'sort': [sortConfig: { column: string; direction: 'asc' | 'desc' }]
  'selection-change': [selectedRows: any[]]
}>()

const sortBy = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const selectedRows = ref<any[]>([])

const selectAll = computed({
  get: () => selectedRows.value.length === props.data.length && props.data.length > 0,
  set: (value: boolean) => {
    selectedRows.value = value ? [...props.data] : []
    emit('selection-change', selectedRows.value)
  }
})

const totalColumns = computed(() => {
  return props.columns.length + (props.selectable ? 1 : 0)
})

function getRowKey(row: any, index: number): string | number {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] || index
}

function getColumnValue(row: any, column: Column): any {
  return row[column.key]
}

function formatColumnValue(row: any, column: Column): string {
  const value = getColumnValue(row, column)
  if (column.format && typeof column.format === 'function') {
    return column.format(value)
  }
  return String(value || '')
}

function handleRowClick(row: any): void {
  emit('row-click', row)
}

function handleSort(columnKey: string): void {
  if (sortBy.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = columnKey
    sortDirection.value = 'asc'
  }
  
  emit('sort', { column: columnKey, direction: sortDirection.value })
}

function handleSelectAll(): void {
  selectedRows.value = selectAll.value ? [...props.data] : []
  emit('selection-change', selectedRows.value)
}

function handleRowSelect(row: any): void {
  const index = selectedRows.value.indexOf(row)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(row)
  }
  emit('selection-change', selectedRows.value)
}

// Watch for external changes to data
watch(() => props.data, () => {
  // Clear selection when data changes
  selectedRows.value = []
  emit('selection-change', selectedRows.value)
})
</script>