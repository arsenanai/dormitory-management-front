import { ref, createApp, h, type Component } from 'vue'
import CToast, { type ToastProps } from '@/components/CToast.vue'
import CConfirmationModal, { type ConfirmationModalProps } from '@/components/CConfirmationModal.vue'

export interface Toast extends ToastProps {
  id: string
}

const toasts = ref<Toast[]>([])
let toastCounter = 0

const generateId = () => `toast-${++toastCounter}-${Date.now()}`

const addToast = (toast: Omit<Toast, 'id'>): string => {
  const id = generateId()
  const newToast: Toast = { ...toast, id }
  
  toasts.value.push(newToast)
  
  // Create and mount the toast component
  const container = document.createElement('div')
  document.body.appendChild(container)
  
  const app = createApp({
    render() {
      return h(CToast, {
        ...newToast,
        onClose: () => removeToast(id)
      })
    }
  })
  
  app.mount(container)
  
  return id
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
  
  // Find and remove the DOM container
  const containers = document.querySelectorAll('div[role="alert"]')
  containers.forEach(container => {
    if (container.parentElement?.tagName === 'DIV') {
      container.parentElement.remove()
    }
  })
}

const clearAllToasts = () => {
  toasts.value = []
  // Remove all toast containers
  const containers = document.querySelectorAll('div[role="alert"]')
  containers.forEach(container => {
    if (container.parentElement?.tagName === 'DIV') {
      container.parentElement.remove()
    }
  })
}

// Convenience methods
const showSuccess = (message: string, options?: Partial<ToastProps>) => {
  return addToast({ type: 'success', message, ...options })
}

const showError = (message: string, options?: Partial<ToastProps>) => {
  return addToast({ type: 'error', message, persistent: true, ...options })
}

const showWarning = (message: string, options?: Partial<ToastProps>) => {
  return addToast({ type: 'warning', message, ...options })
}

const showInfo = (message: string, options?: Partial<ToastProps>) => {
  return addToast({ type: 'info', message, ...options })
}

// Confirmation dialog using custom modal
const showConfirmation = (message: string, title?: string, options?: { confirmText?: string, cancelText?: string }): Promise<boolean> => {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    const app = createApp({
      render() {
        return h(CConfirmationModal, {
          message,
          title,
          confirmText: options?.confirmText,
          cancelText: options?.cancelText,
          onConfirm: () => {
            resolve(true)
            app.unmount()
            container.remove()
          },
          onCancel: () => {
            resolve(false)
            app.unmount()
            container.remove()
          }
        })
      }
    })
    
    app.mount(container)
  })
}

export const useToast = () => {
  return {
    toasts: toasts.value,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation
  }
}
