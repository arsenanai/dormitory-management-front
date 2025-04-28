<template>
  <div
    v-show="isActive"
    role="tabpanel"
    :aria-labelledby="`${name}-tab`"
    class="rounded-lg p-4"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, computed, Ref } from "vue";

// Define props using TypeScript
interface Props {
  name: string;
  title: string;
}

const props = defineProps<Props>();

// Inject activeTab and registerTab from the parent Tabs component
const activeTab = inject<Ref<string>>("activeTab");
const registerTab =
  inject<(tab: { name: string; title: string }) => void>("registerTab");

// Ensure the injected values are defined
if (!activeTab || !registerTab) {
  throw new Error(
    "CTab must be used within a Tabs component that provides activeTab and registerTab.",
  );
}

// Register this tab with the parent Tabs component
onMounted(() => {
  registerTab({ name: props.name, title: props.title });
});

// Computed property to check if this tab is active
const isActive = computed(() => activeTab.value === props.name);
</script>
