import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RoomTypeForm from '@/pages/RoomTypeForm.vue';
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
});
