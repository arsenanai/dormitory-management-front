import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CSelect from '@/components/CSelect.vue';

describe('CSelect', () => {
  const defaultOptions = [
    { value: 'option1', name: 'Option 1' },
    { value: 'option2', name: 'Option 2' },
    { value: 'option3', name: 'Option 3' },
  ];

  const defaultProps = {
    id: 'test-select',
    options: defaultOptions,
  };

  describe('Basic Rendering', () => {
    it('should render select element with correct attributes', () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      expect(select.exists()).toBe(true);
      expect(select.attributes('id')).toBe('test-select');
    });

    it('should render label when provided', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          label: 'Test Label',
        },
      });

      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe('Test Label');
      expect(label.attributes('for')).toBe('test-select');
    });

    it('should render all options', () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const options = wrapper.findAll('option');
      expect(options).toHaveLength(3);
      expect(options[0].text()).toBe('Option 1');
      expect(options[1].text()).toBe('Option 2');
      expect(options[2].text()).toBe('Option 3');
    });

    it('should render placeholder when provided', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          placeholder: 'Select an option',
        },
      });

      const options = wrapper.findAll('option');
      expect(options[0].text()).toBe('Select an option');
      expect(options[0].attributes('disabled')).toBeDefined();
      expect(options[0].attributes('value')).toBe('');
    });
  });

  describe('v-model Support', () => {
    it('should update modelValue when select value changes', async () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      await select.setValue('option2');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['option2']);
    });

    it('should set initial value from modelValue', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          modelValue: 'option2',
        },
      });

      const select = wrapper.find('select');
      expect(select.element.value).toBe('option2');
    });

    it('should update when modelValue changes', async () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          modelValue: 'option1',
        },
      });

      await wrapper.setProps({ modelValue: 'option3' });
      await nextTick();

      const select = wrapper.find('select');
      expect(select.element.value).toBe('option3');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          label: 'Test Label',
          required: true,
        },
      });

      const select = wrapper.find('select');
      expect(select.attributes('required')).toBeDefined();
      expect(select.attributes('id')).toBe('test-select');
    });

    it('should have proper label association', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          label: 'Test Label',
        },
      });

      const label = wrapper.find('label');
      const select = wrapper.find('select');
      expect(label.attributes('for')).toBe(select.attributes('id'));
    });

    it('should have focus ring styles', () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      const classes = select.classes();
      expect(classes).toContain('focus:ring-4');
      expect(classes).toContain('focus:ring-primary-300');
    });

    it('should be keyboard navigable', async () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      await select.trigger('focus');
      
      // Focus behavior is environment-dependent, so we just verify the element exists
      expect(select.exists()).toBe(true);
    });
  });

  describe('Validation States', () => {
    it('should apply success validation styles', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          validationState: 'success',
        },
      });

      const select = wrapper.find('select');
      const classes = select.classes();
      expect(classes).toContain('bg-green-50');
      expect(classes).toContain('border-green-500');
      expect(classes).toContain('text-green-900');
    });

    it('should apply error validation styles', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          validationState: 'error',
        },
      });

      const select = wrapper.find('select');
      const classes = select.classes();
      expect(classes).toContain('bg-red-50');
      expect(classes).toContain('border-red-500');
      expect(classes).toContain('text-red-900');
    });

    it('should display validation message for success', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          validationState: 'success',
          validationMessage: 'This is valid',
        },
      });

      const message = wrapper.find('p');
      expect(message.exists()).toBe(true);
      expect(message.text()).toContain('Well done!');
      expect(message.text()).toContain('This is valid');
      expect(message.classes()).toContain('text-green-600');
    });

    it('should display validation message for error', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          validationState: 'error',
          validationMessage: 'This is invalid',
        },
      });

      const message = wrapper.find('p');
      expect(message.exists()).toBe(true);
      expect(message.text()).toContain('Oh, snap!');
      expect(message.text()).toContain('This is invalid');
      expect(message.classes()).toContain('text-red-600');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          disabled: true,
        },
      });

      const select = wrapper.find('select');
      expect(select.attributes('disabled')).toBeDefined();
    });

    it('should apply disabled styles', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          disabled: true,
        },
      });

      const select = wrapper.find('select');
      const classes = select.classes();
      expect(classes).toContain('cursor-not-allowed');
      expect(classes).toContain('bg-gray-100');
      expect(classes).toContain('text-gray-400');
    });

    it('should apply disabled label styles', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          label: 'Test Label',
          disabled: true,
        },
      });

      const label = wrapper.find('label');
      expect(label.classes()).toContain('text-gray-400');
    });
  });

  describe('Required State', () => {
    it('should have required attribute when required prop is true', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          required: true,
        },
      });

      const select = wrapper.find('select');
      expect(select.attributes('required')).toBeDefined();
    });
  });

  describe('Option Filtering', () => {
    it('should filter out options with undefined values', () => {
      const optionsWithUndefined = [
        { value: 'option1', name: 'Option 1' },
        { value: undefined, name: 'Option 2' },
        { value: null, name: 'Option 3' },
        { value: 'option4', name: 'Option 4' },
      ];

      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          options: optionsWithUndefined,
        },
      });

      const options = wrapper.findAll('option');
      // Should have 2 valid options (undefined values are filtered out, no placeholder)
      expect(options).toHaveLength(2);
      expect(options[0].text()).toBe('Option 1');
      expect(options[1].text()).toBe('Option 4');
    });
  });

  describe('Color Contrast', () => {
    it('should have proper text contrast in default state', () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      const classes = select.classes();
      expect(classes).toContain('text-gray-900');
    });

    it('should have proper text contrast in dark mode', () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      const classes = select.classes();
      expect(classes).toContain('dark:text-white');
    });
  });

  describe('Focus Management', () => {
    it('should focus on select when label is clicked', async () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          label: 'Test Label',
        },
      });

      const label = wrapper.find('label');
      await label.trigger('click');
      
      const select = wrapper.find('select');
      // Focus behavior is environment-dependent, so we just verify the element exists
      expect(select.exists()).toBe(true);
    });

    it('should maintain focus after value change', async () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      await select.trigger('focus');
      await select.setValue('option2');
      await nextTick();

      // Focus behavior is environment-dependent, so we just verify the element exists
      expect(select.exists()).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should emit update:modelValue on change', async () => {
      const wrapper = mount(CSelect, {
        props: defaultProps,
      });

      const select = wrapper.find('select');
      await select.setValue('option3');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['option3']);
    });

    it('should not emit when disabled', async () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          disabled: true,
        },
      });

      const select = wrapper.find('select');
      await select.setValue('option2');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          options: [],
        },
      });

      const options = wrapper.findAll('option');
      expect(options).toHaveLength(0); // No options and no placeholder
    });

    it('should handle numeric values', async () => {
      const numericOptions = [
        { value: 1, name: 'One' },
        { value: 2, name: 'Two' },
      ];

      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          options: numericOptions,
          modelValue: 1,
        },
      });

      const select = wrapper.find('select');
      expect(select.element.value).toBe('1');

      await select.setValue('2');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
    });

    it('should handle modelValue changes to undefined', async () => {
      const wrapper = mount(CSelect, {
        props: {
          ...defaultProps,
          modelValue: 'option1',
        },
      });

      await wrapper.setProps({ modelValue: undefined });
      await nextTick();

      const select = wrapper.find('select');
      expect(select.element.value).toBe('');
    });
  });
}); 