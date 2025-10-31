<template>
  <div 
    v-if="isVisible" 
    :class="[toastClasses, `toast-${type}`]"
    class="p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out max-w-sm w-full"
    role="alert"
    @click="close"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <CheckCircleIcon v-if="type === 'success'" class="h-5 w-5" />
        <ExclamationTriangleIcon v-else-if="type === 'warning'" class="h-5 w-5" />
        <XCircleIcon v-else-if="type === 'error'" class="h-5 w-5" />
        <InformationCircleIcon v-else class="h-5 w-5" />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p v-if="title" class="text-sm font-medium text-primary-700">{{ title }}</p>
        <p class="text-sm text-primary-600" :class="{ 'mt-1': title }">{{ message }}</p>
      </div>
      
      <!-- Close button -->
      <button 
        v-if="closable"
        @click.stop="close"
        :class="closeButtonClasses"
        aria-label="Close"
      >
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'

export interface ToastProps {
  id?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 5000,
  closable: true,
  persistent: false
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)
let timeoutId: number | null = null

const toastClasses = computed(() => {
  const baseClasses = 'border-l-4'
  
  switch (props.type) {
    case 'success':
      return `${baseClasses} bg-green-50 border-green-400 text-green-800`
    case 'error':
      return `${baseClasses} bg-red-50 border-red-400 text-red-800`
    case 'warning':
      return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800`
    default:
      return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800`
  }
})

const closeButtonClasses = computed(() => {
  const base = 'flex-shrink-0 p-1 rounded-md transition-colors'
  switch (props.type) {
    case 'success':
      return `${base} hover:bg-green-100`
    case 'error':
      return `${base} hover:bg-red-100`
    case 'warning':
      return `${base} hover:bg-yellow-100`
    default:
      return `${base} hover:bg-blue-100`
  }
})

const close = () => {
  isVisible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  emit('close')
}

onMounted(() => {
  if (!props.persistent && props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      close()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>
