<template>
  <Teleport to="body">
    <div 
      v-if="isVisible" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="handleCancel"
      data-testid="confirmation-modal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 :id="titleId" class="text-lg font-semibold text-primary-700">
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
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            {{ cancelText || $t?.('Cancel') || 'Cancel' }}
          </button>
          <button
            @click="handleConfirm"
            data-confirm-button
            data-testid="confirm-delete-button"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            {{ confirmText || $t?.('Confirm') || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface ConfirmationModalProps {
  message: string
  title?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

const props = withDefaults(defineProps<ConfirmationModalProps>(), {
  title: '',
  confirmText: '',
  cancelText: ''
})

const isVisible = ref(false)
const titleId = `confirm-title-${Date.now()}`
const messageId = `confirm-message-${Date.now()}`

const handleConfirm = () => {
  props.onConfirm?.()
  close()
}

const handleCancel = () => {
  props.onCancel?.()
  close()
}

const close = () => {
  isVisible.value = false
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleCancel()
  }
}

onMounted(() => {
  isVisible.value = true
  document.addEventListener('keydown', handleEscape)
  // Focus trap - focus the confirm button
  setTimeout(() => {
    const confirmButton = document.querySelector('[data-confirm-button]') as HTMLElement
    confirmButton?.focus()
  }, 100)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>
