import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import CFileInput from '@/components/CFileInput.vue';
import i18n from '@/i18n';

describe('CFileInput', () => {
  it('should render with default props', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file-input'
      },
      global: {
        plugins: [i18n]
      }
    });

    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
    expect(wrapper.find('input[type="file"]').attributes('id')).toBe('test-file-input');
  });

  it('should support multiple files when multiple prop is true', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file-input',
        multiple: true
      },
      global: {
        plugins: [i18n]
      }
    });

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.attributes('multiple')).toBeDefined();
  });

  it('should not have multiple attribute when multiple prop is false', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file-input',
        multiple: false
      },
      global: {
        plugins: [i18n]
      }
    });

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.attributes('multiple')).toBeUndefined();
  });

  it('should emit change event with single file when multiple is false', async () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file-input',
        multiple: false
      },
      global: {
        plugins: [i18n]
      }
    });

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = wrapper.find('input[type="file"]');
    
    // Mock the files property
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')?.[0]).toEqual([file]);
  });

  it('should emit change event with FileList when multiple is true', async () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file-input',
        multiple: true
      },
      global: {
        plugins: [i18n]
      }
    });

    const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
    const fileList = [file1, file2] as any as FileList;
    
    const fileInput = wrapper.find('input[type="file"]');
    
    // Mock the files property
    Object.defineProperty(fileInput.element, 'files', {
      value: fileList,
      writable: false,
    });

    await fileInput.trigger('change');
    
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')?.[0]).toEqual([fileList]);
  });

  it('should display label when provided', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file-input',
        label: 'Upload File'
      },
      global: {
        plugins: [i18n]
      }
    });

    expect(wrapper.find('label').text()).toBe('Upload File');
  });
});
