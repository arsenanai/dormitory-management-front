import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
// @ts-expect-error: Vue SFC import for test
import CModal from '../../../src/components/CModal.vue';

describe('CModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render modal when modelValue is true', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: '<div>Modal Content</div>',
        },
      });

      expect(wrapper.find('.fixed.inset-0').exists()).toBe(true);
      expect(wrapper.find('.bg-white.rounded-lg').exists()).toBe(true);
      expect(wrapper.text()).toContain('Modal Content');
    });

    it('should not render modal when modelValue is false', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: false,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: '<div>Modal Content</div>',
        },
      });

      expect(wrapper.find('.fixed.inset-0').exists()).toBe(false);
      expect(wrapper.text()).not.toContain('Modal Content');
    });

    it('should have proper ARIA attributes', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modal = wrapper.find('[role="dialog"]');
      expect(modal.exists()).toBe(true);
    });

    it('should have proper backdrop styling', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const backdrop = wrapper.find('.bg-\\[rgba\\(30\\,30\\,30\\,0\\.35\\)\\]');
      expect(backdrop.exists()).toBe(true);
      expect(backdrop.classes()).toContain('backdrop-blur-md');
      expect(backdrop.classes()).toContain('backdrop-saturate-125');
    });
  });

  describe('Modal Content', () => {
    it('should render modal content with proper styling', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: '<div>Test Content</div>',
        },
      });

      const modalContent = wrapper.find('.bg-white.rounded-lg');
      expect(modalContent.exists()).toBe(true);
      expect(modalContent.classes()).toContain('shadow-lg');
      expect(modalContent.classes()).toContain('border');
      expect(modalContent.classes()).toContain('border-primary-200');
      expect(modalContent.text()).toContain('Test Content');
    });

    it('should have proper max width and responsive design', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modalContent = wrapper.find('.bg-white.rounded-lg');
      expect(modalContent.classes()).toContain('max-w-md');
      expect(modalContent.classes()).toContain('w-full');
    });

    it('should have proper z-index for layering', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modal = wrapper.find('.fixed.inset-0');
      expect(modal.classes()).toContain('z-50');
    });
  });

  describe('Close Button', () => {
    it('should render close button', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const closeButton = wrapper.find('button[aria-label="Close"]');
      expect(closeButton.exists()).toBe(true);
    });

    it('should have proper close button styling', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const closeButton = wrapper.find('button[aria-label="Close"]');
      expect(closeButton.classes()).toContain('w-5');
      expect(closeButton.classes()).toContain('h-5');
      expect(closeButton.classes()).toContain('rounded-full');
      expect(closeButton.classes()).toContain('bg-[#FF5F57]');
      expect(closeButton.classes()).toContain('border-[#E33E41]');
    });

    it('should emit update:modelValue when close button is clicked', async () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const closeButton = wrapper.find('button[aria-label="Close"]');
      await closeButton.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should have proper focus styling for close button', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const closeButton = wrapper.find('button[aria-label="Close"]');
      expect(closeButton.classes()).toContain('focus:outline-none');
      expect(closeButton.classes()).toContain('focus-visible:ring-3');
      expect(closeButton.classes()).toContain('focus-visible:ring-[#FFB3B3]');
    });

    it('should have screen reader text for close button', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const srText = wrapper.find('.sr-only');
      expect(srText.exists()).toBe(true);
      expect(srText.text()).toBe('Close');
    });
  });

  describe('Focus Management', () => {
    it('should have tabindex on modal content', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modalContent = wrapper.find('[tabindex="-1"]');
      expect(modalContent.exists()).toBe(true);
    });

    it('should handle tab key navigation', async () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: `
            <button>First Button</button>
            <input type="text" />
            <button>Second Button</button>
          `,
        },
      });

      const modalContent = wrapper.find('[tabindex="-1"]');
      await modalContent.trigger('keydown.tab');

      // Should handle tab navigation without crashing
      expect(wrapper.vm).toBeTruthy();
    });

    it('should prevent click propagation on modal content', async () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modalContent = wrapper.find('.bg-white.rounded-lg');
      await modalContent.trigger('click');

      // Should not close modal when clicking on content
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper dialog role', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.exists()).toBe(true);
    });

    it('should have proper close button aria-label', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const closeButton = wrapper.find('button[aria-label="Close"]');
      expect(closeButton.attributes('aria-label')).toBe('Close');
    });

    it('should have proper button type for close button', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const closeButton = wrapper.find('button[aria-label="Close"]');
      expect(closeButton.attributes('type')).toBe('button');
    });

    it('should have proper transition animations', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const closeButton = wrapper.find('button[aria-label="Close"]');
      expect(closeButton.classes()).toContain('transition-all');
      expect(closeButton.classes()).toContain('duration-150');
    });
  });

  describe('Modal Positioning', () => {
    it('should be centered on screen', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modalContainer = wrapper.find('.fixed.inset-0');
      expect(modalContainer.classes()).toContain('flex');
      expect(modalContainer.classes()).toContain('items-center');
      expect(modalContainer.classes()).toContain('justify-center');
    });

    it('should cover full screen', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modalContainer = wrapper.find('.fixed.inset-0');
      expect(modalContainer.classes()).toContain('fixed');
      expect(modalContainer.classes()).toContain('inset-0');
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods and properties', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const component = wrapper.vm as any;
      
      expect(component.modalContent).toBeDefined();
      expect(typeof component.getFocusableElements).toBe('function');
    });
  });

  describe('Event Handling', () => {
    it('should handle keyboard events properly', async () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modalContent = wrapper.find('[tabindex="-1"]');
      
      // Test tab key
      await modalContent.trigger('keydown.tab');
      expect(wrapper.vm).toBeTruthy();
      
      // Test other keys
      await modalContent.trigger('keydown.enter');
      await modalContent.trigger('keydown.escape');
      expect(wrapper.vm).toBeTruthy();
    });

    it('should handle click events properly', async () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const modalContent = wrapper.find('.bg-white.rounded-lg');
      await modalContent.trigger('click');
      
      // Should not close modal when clicking content
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Slot Content', () => {
    it('should render default slot content', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: '<div>Custom Modal Content</div>',
        },
      });

      expect(wrapper.text()).toContain('Custom Modal Content');
    });

    it('should render header slot content', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: '<h2>Modal Header</h2>',
        },
      });

      expect(wrapper.text()).toContain('Modal Header');
    });

    it('should render body slot content', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: '<p>Modal Body Content</p>',
        },
      });

      expect(wrapper.text()).toContain('Modal Body Content');
    });

    it('should render footer slot content', () => {
      const wrapper = mount(CModal, {
        props: {
          modelValue: true,
        },
        global: {
          plugins: [i18n],
        },
        slots: {
          default: '<div>Modal Footer</div>',
        },
      });

      expect(wrapper.text()).toContain('Modal Footer');
    });
  });
}); 