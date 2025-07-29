<template>
  <div
    class="flex w-full flex-col items-start justify-center"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium"
      :class="labelClass"
    >
      {{ label }}
    </label>

    <!-- File Input Wrapper -->
    <div
      class="focus:ring-primary-300 dark:focus:ring-primary-700 flex w-full cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      tabindex="0"
      @click="focusFileInput"
      @keydown.enter.prevent="focusFileInput"
      @keydown.space.prevent="focusFileInput"
      :class="{ 'bg-blue-50 dark:bg-blue-900': isDragging }"
    >
      <div class="relative px-2.5 py-2 pl-10">
        <!-- File Icon -->
        <PaperClipIcon
          class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
        />
        <p class="text-base text-primary-500 dark:text-primary-400">
          {{ t('Drag and drop your file here, or') }}
          <label
            :for="id"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-800 cursor-pointer"
          >
            {{ t('browse') }}
          </label>
        </p>
      </div>
      <!-- Hidden File Input -->
      <input
        :id="id"
        type="file"
        class="hidden"
        :name="formatName(name)"
        :accept="allowedExtensions.map((ext) => `.${ext}`).join(',')"
        :multiple="multiple"
        @change="handleFileChange"
        ref="fileInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults } from "vue";
import { useI18n } from "vue-i18n";
import { PaperClipIcon } from "@heroicons/vue/24/outline";

// Define props using TypeScript
interface Props {
  id: string;
  label?: string; // Optional label prop
  maxFileSize?: number;
  name?: string;
  allowedExtensions?: string[];
  multiple?: boolean; // Support multiple files
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  allowedExtensions: () => ["jpg", "jpeg", "png", "gif", "pdf"],
  maxFileSize: 5 * 1024 * 1024,
});

// Define emits
const emit = defineEmits<{
  change: [value: File | FileList | null];
}>();

// i18n
const { t } = useI18n();

// State
const selectedFile = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null); // Reference to the file input element
const isDragging = ref<boolean>(false); // State to track drag-and-drop
const validationMessage = ref<string | null>(null); // Validation message for invalid files

// Computed Classes
const labelClass = computed(() => {
  return validationMessage.value
    ? "text-red-700 dark:text-red-500"
    : "text-gray-900 dark:text-white";
});

// Methods
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (props.multiple) {
    validateMultipleFiles(files);
    emit('change', files);
  } else {
    const file = files?.[0] || null;
    validateFile(file);
    emit('change', file);
  }
};

const focusFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click(); // Programmatically trigger the file input
  }
};

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const formatName = (name: string | undefined) => {
  if (!name) return ""; // Return an empty string if name is undefined
  return name.replace(/\s+/g, "_").toLowerCase();
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files || null;
  
  if (props.multiple) {
    validateMultipleFiles(files);
    emit('change', files);
  } else {
    const file = files?.[0] || null;
    validateFile(file);
    emit('change', file);
  }
};

// File Validation for single file
const validateFile = (file: File | null) => {
  if (!file) {
    validationMessage.value = "";
    selectedFile.value = null;
    return;
  }

  const fileSize = file.size;
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

  // Check file size
  if (fileSize > props.maxFileSize) {
    validationMessage.value = t("fileInput.invalidSize", {
      maxSize: props.maxFileSize / (1024 * 1024),
    });
    selectedFile.value = null;
    return;
  }

  // Check file extension
  if (!props.allowedExtensions.includes(fileExtension)) {
    validationMessage.value = t("fileInput.invalidExtension", {
      extensions: props.allowedExtensions.join(", "),
    });
    selectedFile.value = null;
    return;
  }

  // Valid file
  validationMessage.value = "";
  selectedFile.value = file.name;
};

// File Validation for multiple files
const validateMultipleFiles = (files: FileList | null) => {
  if (!files || files.length === 0) {
    validationMessage.value = "";
    selectedFile.value = null;
    return;
  }

  const fileNames: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileSize = file.size;
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    // Check file size
    if (fileSize > props.maxFileSize) {
      validationMessage.value = t("fileInput.invalidSize", {
        maxSize: props.maxFileSize / (1024 * 1024),
      });
      selectedFile.value = null;
      return;
    }

    // Check file extension
    if (!props.allowedExtensions.includes(fileExtension)) {
      validationMessage.value = t("fileInput.invalidExtension", {
        extensions: props.allowedExtensions.join(", "),
      });
      selectedFile.value = null;
      return;
    }

    fileNames.push(file.name);
  }

  // All files are valid
  validationMessage.value = "";
  selectedFile.value = files.length === 1 ? fileNames[0] : `${files.length} files selected`;
};
</script>
