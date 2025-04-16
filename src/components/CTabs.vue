<template>
  <div>
    <!-- Tabs Navigation -->
    <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
      <ul class="flex text-sm font-medium text-center w-full" role="tablist">
        <li
          v-for="(tab, index) in tabs"
          :key="index"
          class="w-full"
          role="presentation"
        >
          <button
            :class="[
              'inline-block w-full p-4 border-b-2 rounded-t-lg focus:outline-none transition-all',
              activeTab === tab.name
                ? 'text-primary-500 border-primary-500'
                : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
              'focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-700',
            ]"
            @click="selectTab(tab.name)"
            type="button"
            role="tab"
            :aria-controls="tab.name"
            :aria-selected="activeTab === tab.name"
          >
            {{ tab.title }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Tabs Content -->
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, provide, watch } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(['update:modelValue']);

// State
const activeTab = ref(props.modelValue);
const tabs = ref([]);

// Provide the active tab and a method to register tabs
provide('activeTab', activeTab);
provide('registerTab', (tab) => {
  tabs.value.push(tab);
});

// Watch for changes in the modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    activeTab.value = newValue;
  },
);

// Methods
const selectTab = (tabName) => {
  activeTab.value = tabName;
  // Emit the updated tab name
  emit('update:modelValue', tabName);
};
</script>