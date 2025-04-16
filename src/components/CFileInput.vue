<template>
  <div
    class="flex items-center justify-center w-full"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <label
      :for="id"
      class="flex flex-row items-center justify-between w-full border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-700"
      tabindex="0"
      @keydown.enter.prevent="focusFileInput"
      @keydown.space.prevent="focusFileInput"
      :class="{ 'bg-blue-50 dark:bg-blue-900': isDragging }"
    >
      <div class="relative px-2.5 py-2 pl-10">
        <!-- File Icon -->
        <PaperClipIcon class="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-8 text-gray-500 dark:text-gray-400 pointer-events-none pl-3" />
        <p class="text-base text-gray-500 dark:text-gray-400">
          <!-- Selected File Name -->
          <span v-if="selectedFile && !validationMessage" class="text-gray-900 dark:text-gray-50">
            {{ selectedFile }}
          </span>
          <!-- Validation message -->
          <span v-else-if="validationMessage" class="text-red-600 dark:text-red-500">
            {{ validationMessage }}
          </span>
          <!-- Instructional Text -->
          <span v-else-if="isDragging">
            {{ t('fileInput.dropHere') }}
          </span>
          <!-- Instructional Text -->
          <span v-else>
            {{ t('fileInput.clickOrDrag') }}
          </span>
        </p>
      </div>
      <!-- Hidden File Input -->
      <input
        :id="id"
        type="file"
        class="hidden"
        :accept="allowedExtensions.map(ext => `.${ext}`).join(',')"
        @change="handleFileChange"
        ref="fileInput"
      />
    </label>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PaperClipIcon } from '@heroicons/vue/24/outline';

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024, // Default max file size: 5MB
  },
  allowedExtensions: {
    type: Array,
    default: () => ['jpg', 'jpeg', 'png', 'gif', 'pdf'], // Default allowed extensions
  },
});

// i18n
const { t } = useI18n();

// State
const selectedFile = ref('');
const fileInput = ref(null); // Reference to the file input element
const isDragging = ref(false); // State to track drag-and-drop
const validationMessage = ref(''); // Validation message for invalid files

// Methods
const handleFileChange = (event) => {
  const file = event.target.files[0];
  validateFile(file);
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

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  validateFile(file);
};

// File Validation
const validateFile = (file) => {
  if (!file) {
    validationMessage.value = '';
    selectedFile.value = '';
    return;
  }

  const fileSize = file.size;
  const fileExtension = file.name.split('.').pop().toLowerCase();

  // Check file size
  if (fileSize > props.maxFileSize) {
    validationMessage.value = t('fileInput.invalidSize', { maxSize: props.maxFileSize / (1024 * 1024) });
    selectedFile.value = '';
    return;
  }

  // Check file extension
  if (!props.allowedExtensions.includes(fileExtension)) {
    validationMessage.value = t('fileInput.invalidExtension', { extensions: props.allowedExtensions.join(', ') });
    selectedFile.value = '';
    return;
  }

  // Valid file
  validationMessage.value = '';
  selectedFile.value = file.name;
};
</script>