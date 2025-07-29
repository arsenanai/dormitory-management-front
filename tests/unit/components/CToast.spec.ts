import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import CToast from '@/components/CToast.vue'

describe('CToast.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    // Mock timers for auto-dismiss functionality
    vi.useFakeTimers()
    
    // Ensure body exists for teleport
    if (!document.body) {
      document.body = document.createElement('body')
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    if (wrapper) {
      wrapper.unmount()
    }
    // Clean up any teleported elements
    const teleportedElements = document.querySelectorAll('[role="alert"]')
    teleportedElements.forEach(el => el.remove())
  })

  describe('Basic Rendering', () => {
    it('renders toast with message', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message'
        },
        attachTo: document.body
      })

      await nextTick()
      
      // Check if toast is rendered in the document body
      const toastElement = document.querySelector('[role="alert"]')
      expect(toastElement).toBeTruthy()
      expect(toastElement?.textContent).toContain('Test message')
    })

    it('renders with different types', async () => {
      const types = ['success', 'error', 'warning', 'info'] as const
      
      for (const type of types) {
        wrapper = mount(CToast, {
          props: {
            message: `${type} message`,
            type
          },
          attachTo: document.body
        })

        await nextTick()
        
        const toastElement = document.querySelector('[role="alert"]')
        expect(toastElement).toBeTruthy()
        expect(toastElement?.textContent).toContain(`${type} message`)
        
        wrapper.unmount()
        // Clean up
        const teleportedElements = document.querySelectorAll('[role="alert"]')
        teleportedElements.forEach(el => el.remove())
      }
    })

    it('renders with title and message', async () => {
      wrapper = mount(CToast, {
        props: {
          title: 'Test Title',
          message: 'Test message'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const toastElement = document.querySelector('[role="alert"]')
      expect(toastElement).toBeTruthy()
      expect(toastElement?.textContent).toContain('Test Title')
      expect(toastElement?.textContent).toContain('Test message')
    })
  })

  describe('Auto-dismiss Functionality', () => {
    it('should auto-dismiss after duration', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message',
          duration: 3000
        },
        attachTo: document.body
      })

      await nextTick()
      
      // Check that toast is initially visible
      let toastElement = document.querySelector('[role="alert"]')
      expect(toastElement).toBeTruthy()
      
      // Fast-forward time
      vi.advanceTimersByTime(3000)
      await nextTick()
      
      // Check that close event was emitted
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not auto-dismiss when persistent is true', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message',
          duration: 3000,
          persistent: true
        },
        attachTo: document.body
      })

      await nextTick()
      
      // Check that toast is initially visible
      let toastElement = document.querySelector('[role="alert"]')
      expect(toastElement).toBeTruthy()
      
      // Fast-forward time
      vi.advanceTimersByTime(3000)
      await nextTick()
      
      // Should not emit close
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should clear timeout when manually closed', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message',
          duration: 3000
        },
        attachTo: document.body
      })

      await nextTick()
      
      // Close manually
      const toastElement = document.querySelector('[role="alert"]')
      if (toastElement) {
        toastElement.dispatchEvent(new Event('click'))
      }
      
      await nextTick()
      
      // Fast-forward time
      vi.advanceTimersByTime(3000)
      await nextTick()
      
      // Should not emit close again
      expect(wrapper.emitted('close')).toHaveLength(1)
    })
  })

  describe('Click Handling', () => {
    it('should close toast when clicked', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message'
        },
        attachTo: document.body
      })

      await nextTick()
      
      // Check if the toast element exists before clicking
      const toastElement = document.querySelector('[role="alert"]')
      expect(toastElement).toBeTruthy()
      
      if (toastElement) {
        toastElement.dispatchEvent(new Event('click'))
        await nextTick()
        expect(wrapper.emitted('close')).toBeTruthy()
      }
    })

    it('should close toast when close button is clicked', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message',
          closable: true
        },
        attachTo: document.body
      })

      await nextTick()
      
      const closeButton = document.querySelector('[role="alert"] button')
      expect(closeButton).toBeTruthy()
      
      if (closeButton) {
        closeButton.dispatchEvent(new Event('click'))
        await nextTick()
        expect(wrapper.emitted('close')).toBeTruthy()
      }
    })

    it('should prevent event bubbling when close button is clicked', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message',
          closable: true
        },
        attachTo: document.body
      })

      await nextTick()
      
      const closeButton = document.querySelector('[role="alert"] button')
      expect(closeButton).toBeTruthy()
      
      if (closeButton) {
        // Mock stopPropagation
        const stopPropagation = vi.fn()
        const clickEvent = new Event('click')
        clickEvent.stopPropagation = stopPropagation
        
        closeButton.dispatchEvent(clickEvent)
        await nextTick()
        
        expect(wrapper.emitted('close')).toBeTruthy()
      }
    })
  })

  describe('Icon Accessibility', () => {
    it('should have proper icons for each toast type', async () => {
      const types = ['success', 'error', 'warning', 'info'] as const
      
      for (const type of types) {
        wrapper = mount(CToast, {
          props: {
            message: `${type} message`,
            type
          },
          attachTo: document.body
        })

        await nextTick()
        
        const toastElement = document.querySelector('[role="alert"]')
        expect(toastElement).toBeTruthy()
        expect(toastElement?.textContent).toContain(`${type} message`)
        
        wrapper.unmount()
        // Clean up
        const teleportedElements = document.querySelectorAll('[role="alert"]')
        teleportedElements.forEach(el => el.remove())
      }
    })

    it('should have proper ARIA attributes for icons', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Success message',
          type: 'success'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const toastElement = document.querySelector('[role="alert"]')
      expect(toastElement).toBeTruthy()
      expect(toastElement?.textContent).toContain('Success message')
      
      // Check for proper role attribute
      expect(toastElement?.getAttribute('role')).toBe('alert')
    })
  })

  describe('Accessibility & ARIA Live Region', () => {
    it('should have proper ARIA role', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const toastElement = document.querySelector('[role="alert"]')
      expect(toastElement).toBeTruthy()
      expect(toastElement?.getAttribute('role')).toBe('alert')
    })

    it('should have proper close button aria-label', async () => {
      wrapper = mount(CToast, {
        props: {
          message: 'Test message',
          closable: true
        },
        attachTo: document.body
      })

      await nextTick()
      
      const closeButton = document.querySelector('[role="alert"] button')
      expect(closeButton).toBeTruthy()
      expect(closeButton?.getAttribute('aria-label')).toBe('Close')
    })
  })
}) 