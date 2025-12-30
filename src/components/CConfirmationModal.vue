<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      @click.self="handleCancel"
      data-testid="confirmation-modal"
    >
      <div
        class="mx-4 w-full max-w-md transform rounded-lg bg-white shadow-xl transition-all duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
      >
        <!-- Header -->
        <div class="border-b border-gray-200 px-6 py-4">
          <h3 :id="titleId" class="text-primary-700 text-lg font-semibold">
            {{ title }}
          </h3>
        </div>

        <!-- Body -->
        <div class="px-6 py-4">
          <p :id="messageId" class="text-primary-600">
            {{ message }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            @click="handleCancel"
            class="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
          >
            {{ cancelText || $t?.("Cancel") || "Cancel" }}
          </button>
          <button
            @click="handleConfirm"
            data-confirm-button
            data-testid="confirm-delete-button"
            class="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            {{ confirmText || $t?.("Confirm") || "Confirm" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

export interface ConfirmationModalProps {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const props = withDefaults(defineProps<ConfirmationModalProps>(), {
  title: "",
  confirmText: "",
  cancelText: "",
});

const isVisible = ref(false);
const titleId = `confirm-title-${Date.now()}`;
const messageId = `confirm-message-${Date.now()}`;

const handleConfirm = () => {
  props.onConfirm?.();
  close();
};

const handleCancel = () => {
  props.onCancel?.();
  close();
};

const close = () => {
  isVisible.value = false;
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    handleCancel();
  }
};

onMounted(() => {
  isVisible.value = true;
  document.addEventListener("keydown", handleEscape);
  // Focus trap - focus the confirm button
  setTimeout(() => {
    const confirmButton = document.querySelector("[data-confirm-button]") as HTMLElement;
    confirmButton?.focus();
  }, 100);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
});
</script>
