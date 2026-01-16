<template>
  <div
    class="flex w-full flex-col items-stretch justify-center"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-medium" :class="labelClass">
      {{ label }}
    </label>

    <!-- File Input Wrapper -->
    <div
      class="focus:ring-primary-300 dark:focus:ring-primary-700 flex w-full cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-200 focus:ring-4 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      tabindex="0"
      @click="focusFileInput"
      @keydown.enter.prevent="focusFileInput"
      @keydown.space.prevent="focusFileInput"
      :class="{ 'bg-blue-50 dark:bg-blue-900': isDragging, 'items-start': !displayFileName }"
    >
      <div class="relative w-full px-2.5 py-2 pl-10">
        <!-- File Icon -->
        <PaperClipIcon
          class="pointer-events-none absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 pl-3 text-gray-500 dark:text-gray-400"
        />

        <!-- Show selected file name, existing file path, or default text -->
        <div
          v-if="displayFileName"
          class="text-primary-500 dark:text-primary-400 flex w-full items-center justify-between text-base"
        >
          <button
            v-if="isDownloadable"
            type="button"
            @click.prevent.stop="downloadFile"
            class="text-primary-600 dark:text-primary-400 grow text-left font-medium hover:underline"
          >
            {{ shortenFileName(displayFileName) }}
          </button>
          <span v-else class="grow text-left font-medium">
            {{ shortenFileName(displayFileName) }}
          </span>
          <button
            type="button"
            @click.stop="clearFile"
            class="ml-2 inline-flex items-center text-red-500 hover:text-red-700"
            :title="t('Remove file')"
          >
            <TrashIcon class="h-5 w-5" />
          </button>
        </div>
        <p
          v-else
          class="flex flex-col text-sm text-gray-500 sm:flex-row sm:text-base dark:text-gray-400"
        >
          <span class="text-primary-600 dark:text-primary-500 hidden sm:inline"
            >{{ t("Drag and drop your file here, or") }}&nbsp;</span
          >
          <span class="text-primary-600 dark:text-primary-500 sm:hidden">{{
            t("Tap to select a file")
          }}</span>
          <span class="text-primary-600 dark:text-primary-500 font-medium hover:underline">
            <label :for="id" class="hidden cursor-pointer sm:inline">
              {{ t("browse") }}
            </label>
          </span>
        </p>
      </div>
      <!-- Hidden File Input -->
      <input
        :id="id"
        type="file"
        class="hidden"
        :name="formatName(name)"
        :accept="allowedExtensions?.map((ext) => `.${ext}`).join(',')"
        :multiple="multiple"
        @change="handleFileChange"
        ref="fileInput"
      />
    </div>

    <!-- Validation Message -->
    <p
      v-if="validationMessage || internalValidationMessage"
      class="mt-1 text-sm text-red-600 dark:text-red-500"
    >
      {{ validationMessage || internalValidationMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults } from "vue";
import { useI18n } from "vue-i18n";
import { PaperClipIcon, ArrowDownTrayIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { resolvedBaseUrl } from "@/services/api"; // Import the resolvedBaseUrl

// Define props using TypeScript
interface Props {
  id: string;
  label?: string; // Optional label prop
  maxFileSize?: number;
  name?: string;
  allowedExtensions?: string[];
  multiple?: boolean; // Support multiple files
  filePath?: string | null; // Prop to show an existing file path
  validationMessage?: string | null; // External validation message
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false, // Keep default for multiple
  maxFileSize: 2 * 1024 * 1024, // Keep default for maxFileSize
  allowedExtensions: () => [],
});

// Define emits
const emit = defineEmits<{
  (e: "change", value: File | FileList | null | string): void;
  (e: "validation", payload: { valid: boolean }): void;
}>();

// i18n
const { t } = useI18n();

// State
const selectedFile = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null); // Reference to the file input element
const isDragging = ref<boolean>(false); // State to track drag-and-drop
const internalValidationMessage = ref<string | null>(null); // Internal validation message for invalid files

// Computed Classes
const labelClass = computed(() => {
  return props.validationMessage || internalValidationMessage.value
    ? "text-red-700 dark:text-red-500"
    : "text-gray-900 dark:text-white";
});

const isDownloadable = computed(() => {
  // A file is downloadable if a filePath is provided and no new file has been selected.
  return !!props.filePath && !selectedFile.value;
});

const displayFileName = computed(() => {
  if (selectedFile.value) {
    return selectedFile.value;
  }
  // Show the base name of the existing file path
  return props.filePath ? props.filePath.split("/").pop() : null;
});

const shortenFileName = (fileName: string | null): string | null => {
  if (!fileName) return null;

  const MAX_DISPLAY_LENGTH = 30; // Max total characters for the displayed file name

  if (fileName.length <= MAX_DISPLAY_LENGTH) {
    return fileName;
  }

  const lastDotIndex = fileName.lastIndexOf(".");
  let baseName = fileName;
  let extension = "";

  if (lastDotIndex !== -1) {
    baseName = fileName.substring(0, lastDotIndex);
    extension = fileName.substring(lastDotIndex + 1);
  }

  // Calculate available space for the base name after accounting for extension and ellipsis
  // +1 for the dot before the extension
  const availableSpaceForBase = MAX_DISPLAY_LENGTH - (extension ? extension.length + 1 : 0) - 3; // 3 for '...'

  if (availableSpaceForBase <= 0) {
    // If extension + ellipsis is already too long, just truncate the whole thing
    return fileName.substring(0, MAX_DISPLAY_LENGTH - 3) + "...";
  }

  const charsFromStart = Math.floor(availableSpaceForBase / 2);
  const charsFromEnd = availableSpaceForBase - charsFromStart;

  const shortenedBaseName =
    baseName.substring(0, charsFromStart) +
    "..." +
    baseName.substring(baseName.length - charsFromEnd);
  return shortenedBaseName + (extension ? "." + extension : "");
};

// Methods
const downloadFile = async () => {
  if (!isDownloadable.value || !props.filePath) return;

  // Use the unified file download endpoint with the full relative path
  const fileUrl = `${resolvedBaseUrl}/files/download/${encodeURIComponent(props.filePath)}`;

  internalValidationMessage.value = null; // Clear previous errors

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    // Best practice: Try to get filename from Content-Disposition header first.
    const contentDisposition = response.headers.get("Content-Disposition");
    let downloadFilename = displayFileName.value || "download";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        downloadFilename = filenameMatch[1];
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename; // Use the determined filename
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error: any) {
    console.error("Download error:", error);
    internalValidationMessage.value = t("Failed to download file. Please try again.");
  }
};

// Methods
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (props.multiple) {
    validateMultipleFiles(files);
    emit("change", files);
  } else {
    const file = files?.[0] || null;
    validateFile(file);
    emit("change", file);
  }
};

const focusFileInput = (): void => {
  if (fileInput.value) {
    fileInput.value.click(); // Programmatically trigger the file input
  }
};

const clearFile = () => {
  if (fileInput.value) {
    fileInput.value.value = ""; // Clear the file input
  }
  selectedFile.value = null;
  emit("change", null); // Emit null to signify removal
};

const handleDragOver = (): void => {
  isDragging.value = true;
};

const handleDragLeave = (): void => {
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
    emit("change", files);
  } else {
    const file = files?.[0] || null;
    validateFile(file);
    emit("change", file);
  }
};

// File Validation for single file
const validateFile = (file: File | null) => {
  if (!file) {
    internalValidationMessage.value = "";
    selectedFile.value = null;
    emit("validation", { valid: true });
    return;
  }

  const fileSize = file.size;
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

  // Check file size
  if (fileSize > props.maxFileSize) {
    internalValidationMessage.value = t("fileInput.invalidSize", {
      maxSize: props.maxFileSize / (1024 * 1024),
    });
    selectedFile.value = null;
    emit("validation", { valid: false });
    return;
  }

  // Check file extension
  if (props.allowedExtensions.length > 0 && !props.allowedExtensions.includes(fileExtension)) {
    internalValidationMessage.value = t("fileInput.invalidExtension", {
      extensions: props.allowedExtensions.join(", "),
    });
    selectedFile.value = null;
    emit("validation", { valid: false });
    return;
  }

  // Valid file
  internalValidationMessage.value = "";
  selectedFile.value = shortenFileName(file.name);
  emit("validation", { valid: true });
};

// File Validation for multiple files
const validateMultipleFiles = (files: FileList | null) => {
  if (!files || files.length === 0) {
    internalValidationMessage.value = "";
    selectedFile.value = null;
    emit("validation", { valid: true });
    return;
  }

  const fileNames: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileSize = file.size;
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    // Check file size
    if (fileSize > props.maxFileSize) {
      internalValidationMessage.value = t("fileInput.invalidSize", {
        maxSize: props.maxFileSize / (1024 * 1024),
      });
      selectedFile.value = null;
      emit("validation", { valid: false });
      return;
    }

    // Check file extension
    if (props.allowedExtensions.length > 0 && !props.allowedExtensions.includes(fileExtension)) {
      internalValidationMessage.value = t("fileInput.invalidExtension", {
        extensions: props.allowedExtensions.join(", "),
      });
      selectedFile.value = null;
      emit("validation", { valid: false });
      return;
    }

    fileNames.push(file.name);
  }

  // All files are valid
  internalValidationMessage.value = "";
  selectedFile.value =
    files.length === 1 ? shortenFileName(fileNames[0]) : `${files.length} files selected`;
  emit("validation", { valid: true });
};
</script>
