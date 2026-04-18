<template>
  <div
    class="relative"
    ref="wrapperRef"
    @keydown.down.prevent="moveDown"
    @keydown.up.prevent="moveUp"
  >
    <CInput
      :id="id"
      v-model="inputText"
      :label="label"
      :placeholder="placeholder || t('Search by name or email...')"
      :disabled="disabled"
      :required="required"
      :loading="loading"
      autocomplete="off"
      @update:model-value="onInput"
      @focus="onFocus"
      @enter="selectHighlighted"
      @escape="close"
    />

    <ul
      v-if="open && suggestions.length > 0"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
    >
      <li
        v-for="(user, index) in suggestions"
        :key="user.id"
        @mousedown.prevent="selectUser(user)"
        @mouseover="highlightedIndex = index"
        :class="[
          'cursor-pointer px-3 py-2 text-sm',
          highlightedIndex === index
            ? 'bg-primary-100 dark:bg-primary-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700',
        ]"
      >
        <div class="font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
      </li>
    </ul>

    <p
      v-if="open && !loading && inputText.length >= 1 && suggestions.length === 0"
      class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-500 shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
    >
      {{ t("No users found") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import CInput from "@/components/CInput.vue";
import { userService } from "@/services/api";

interface UserSuggestion {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Props {
  id?: string;
  label?: string;
  modelValue?: number | string | null;
  initialLabel?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  role?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
  (e: "select", user: UserSuggestion): void;
}>();

const { t } = useI18n();

const inputText = ref("");
const suggestions = ref<UserSuggestion[]>([]);
const open = ref(false);
const loading = ref(false);
const highlightedIndex = ref(-1);
const wrapperRef = ref<HTMLElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  if (props.initialLabel) {
    inputText.value = props.initialLabel;
  }
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  if (debounceTimer) clearTimeout(debounceTimer);
});

watch(
  () => props.initialLabel,
  (val) => {
    if (val && !props.modelValue) {
      inputText.value = val;
    }
  }
);

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      inputText.value = "";
    }
  }
);

function onInput() {
  emit("update:modelValue", null);
  highlightedIndex.value = -1;
  if (debounceTimer) clearTimeout(debounceTimer);

  if (inputText.value.trim().length === 0) {
    suggestions.value = [];
    open.value = false;
    return;
  }

  debounceTimer = setTimeout(fetchSuggestions, 300);
}

function onFocus() {
  if (inputText.value.trim().length > 0 && suggestions.value.length > 0) {
    open.value = true;
  }
}

async function fetchSuggestions() {
  loading.value = true;
  open.value = true;
  try {
    const res = await userService.search(inputText.value.trim(), props.role);
    suggestions.value = res.data as unknown as UserSuggestion[];
  } catch {
    suggestions.value = [];
  } finally {
    loading.value = false;
  }
}

function selectUser(user: UserSuggestion) {
  inputText.value = `${user.name} (${user.email})`;
  emit("update:modelValue", user.id);
  emit("select", user);
  open.value = false;
  suggestions.value = [];
}

function selectHighlighted() {
  if (highlightedIndex.value >= 0 && suggestions.value[highlightedIndex.value]) {
    selectUser(suggestions.value[highlightedIndex.value]);
  }
}

function moveDown() {
  if (highlightedIndex.value < suggestions.value.length - 1) {
    highlightedIndex.value++;
  }
}

function moveUp() {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  }
}

function close() {
  open.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    open.value = false;
  }
}
</script>
