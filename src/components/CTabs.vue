<template>
  <div>
    <!-- Tabs Navigation -->
    <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
      <ul
        v-if="tabs.length > 0"
        class="flex w-full text-center text-sm font-medium"
        role="tablist"
      >
        <li
          v-for="tab in tabs"
          :key="tab.name"
          class="w-full"
          role="presentation"
        >
          <button
            :class="[
              'inline-block w-full rounded-t-lg border-b-2 p-4 transition-all focus:outline-none',
              activeTab === tab.name
                ? 'text-primary-500 border-primary-500'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300',
              'focus:ring-primary-300 dark:focus:ring-primary-700 focus:ring-4',
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
      <p v-else class="text-center text-gray-500 dark:text-gray-400">
        {{ t("tabs.noTabsAvailable") }}
      </p>
    </div>

    <!-- Tabs Content -->
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed } from "vue";
import { useI18n } from "vue-i18n";

// Define the type for a tab
interface Tab {
  name: string;
  title: string;
}

// Props
const props = defineProps<{
  modelValue: string;
}>();

// Emits
const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

// State
const tabs = ref<Tab[]>([]);

// i18n
const { t } = useI18n();

// Provide the active tab and a method to register tabs
provide(
  "activeTab",
  computed(() => props.modelValue),
);
provide("registerTab", (tab: Tab) => {
  if (!tabs.value.some((t) => t.name === tab.name)) {
    tabs.value.push(tab); // Add the tab only if it doesn't already exist
  }
});

// Computed active tab
const activeTab = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    if (value !== props.modelValue) {
      emit("update:modelValue", value); // Only emit if the value has changed
    }
  },
});

// Methods
const selectTab = (tabName: string) => {
  activeTab.value = tabName; // Update the active tab
};
</script>
