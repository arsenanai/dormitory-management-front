
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
// Mock the api module before importing the component
import * as api from '@/services/api';
// @ts-expect-error: Vue SFC import for test
import RoomTypeForm from '../../src/pages/RoomTypeForm.vue';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import i18n from '@/i18n';

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

describe('RoomTypeForm', () => {
  it('should initialize with empty photos array', () => {
    const wrapper = mount(RoomTypeForm, {
      global: {
        plugins: [router, i18n]
      }
    });

    // Access the component's internal roomType
    const component = wrapper.vm as any;
    expect(component.roomType.photos).toEqual([]);
    expect(Array.isArray(component.roomType.photos)).toBe(true);
  });

  it('should have file input for room photos', () => {
    const wrapper = mount(RoomTypeForm, {
      global: {
        plugins: [router, i18n]
      }
    });

    const photoInput = wrapper.find('#room-photos');
    expect(photoInput.exists()).toBe(true);
  });

  it('should display uploaded photos when photos array is not empty', async () => {
    const wrapper = mount(RoomTypeForm, {
      global: {
        plugins: [router, i18n]
      }
    });

    // Manually add photos to test display
    const component = wrapper.vm as any;
    component.roomType.photos = ['data:image/jpeg;base64,test1', 'data:image/jpeg;base64,test2'];
    
    await wrapper.vm.$nextTick();
    
    const photoGrid = wrapper.find('.grid');
    expect(photoGrid.exists()).toBe(true);
    
    const images = wrapper.findAll('img');
    // Filter out the bed icons and focus on uploaded photos
    const photoImages = images.filter(img => img.attributes('alt')?.includes('Room photo'));
    expect(photoImages.length).toBe(2);
  });

  it('validates required fields', async () => {
    const wrapper = mount(RoomTypeForm, {
      global: { plugins: [router, i18n] }
    });
    const component = wrapper.vm as any;
    component.roomType.name = '';
    component.roomType.description = '';
    const isValid = component.validateForm();
    expect(isValid).toBe(false);
    expect(component.errors.name).toBe('Name is required');
    expect(component.errors.description).toBe('Description is required');
  });

  it('submits form and handles success', async () => {
    const createSpy = vi.spyOn(api.roomTypeService, 'create').mockResolvedValue({
      data: { id: 1, name: 'Deluxe' },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: { headers: {} },
    });
    router.setParams({});
    try {
      const wrapper = mount(RoomTypeForm, {
        props: { roomTypeService: api.roomTypeService },
        global: { plugins: [router, i18n] }
      });
      const component = wrapper.vm as any;
      component.existingNames = [];
      await wrapper.find('#room-type-name').setValue('Deluxe');
      await wrapper.find('#room-type-description').setValue('Spacious');
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect(createSpy).toHaveBeenCalled();
    } finally {
      createSpy.mockRestore();
    }
  });

  it('handles form submission error', async () => {
    const createSpy = vi.spyOn(api.roomTypeService, 'create').mockRejectedValue(new Error('API Error'));
    router.setParams({});
    try {
      const wrapper = mount(RoomTypeForm, {
        props: { roomTypeService: api.roomTypeService },
        global: { plugins: [router, i18n] }
      });
      const component = wrapper.vm as any;
      component.existingNames = [];
      await wrapper.find('#room-type-name').setValue('Deluxe');
      await wrapper.find('#room-type-description').setValue('Spacious');
      await wrapper.find('form').trigger('submit.prevent');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      const errorBox = wrapper.find('.bg-red-100');
      expect(errorBox.exists()).toBe(true);
      expect(errorBox.text()).toMatch(/API Error/);
    } finally {
      createSpy.mockRestore();
    }
  });

  it('validates file type and size', async () => {
    const wrapper = mount(RoomTypeForm, {
      global: { plugins: [router, i18n] }
    });
    const component = wrapper.vm as any;
    // Simulate invalid file type
    const invalidFile = { type: 'text/plain', size: 1000 };
    const valid = component.validatePhoto(invalidFile);
    expect(valid).toBe(false);
    expect(component.errors.photos).toBe('Invalid file type');
    // Simulate large file
    const largeFile = { type: 'image/jpeg', size: 10 * 1024 * 1024 };
    const valid2 = component.validatePhoto(largeFile);
    expect(valid2).toBe(false);
    expect(component.errors.photos).toBe('File is too large');
  });

  it('has accessible labels for inputs', () => {
    const wrapper = mount(RoomTypeForm, {
      global: { plugins: [router, i18n] }
    });
    expect(wrapper.find('label[for="room-type-name"]').exists()).toBe(true);
    expect(wrapper.find('label[for="room-type-description"]').exists()).toBe(true);
    expect(wrapper.find('label[for="room-photos"]').exists()).toBe(true);
  });

  it('prevents duplicate room type names', async () => {
    const wrapper = mount(RoomTypeForm, {
      global: { plugins: [router, i18n] }
    });
    const component = wrapper.vm as any;
    component.existingNames = ['Deluxe'];
    component.roomType.name = 'Deluxe';
    const isValid = component.validateForm();
    expect(isValid).toBe(false);
    expect(component.errors.name).toBe('Room type name already exists');
  });
});
