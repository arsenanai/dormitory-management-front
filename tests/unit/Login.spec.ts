
import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Login from '../../src/pages/Login.vue';

// Mock the useAuthStore composable and its register method
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    register: vi.fn(async (data: any) => {
      if (data.user_type === 'guest') {
        return { message: 'Guest registration successful. Please check your email for confirmation or further instructions.' };
      }
      return { message: 'Registration successful. Please wait for approval.' };
    }),
    login: vi.fn(),
  })
}));

describe('Login.vue Registration', () => {
  it('shows validation errors for empty registration fields', async () => {
    const wrapper = mount(Login);
    // Set the registration tab active directly
    if ('activeTab' in wrapper.vm) {
      wrapper.vm.activeTab = 'registration';
      await wrapper.vm.$nextTick();
    }
    const form = wrapper.find('form');
    expect(form.exists()).toBe(true, 'Form not found in DOM');
    await form.trigger('submit.prevent');
    expect(wrapper.html()).toContain('required');
  });

  it('submits registration form and shows success message', async () => {
    const wrapper = mount(Login);
    // Set the registration tab active directly
    if ('activeTab' in wrapper.vm) {
      wrapper.vm.activeTab = 'registration';
      await wrapper.vm.$nextTick();
    }
    // Mock availableRooms to provide a valid room object
    const roomObj = { id: 1, number: '101', beds: [] };
    wrapper.vm.availableRooms = [roomObj];
    await wrapper.vm.$nextTick();
    // Set valid values for select fields
    await wrapper.find('#registration-faculty').setValue('engineering');
    await wrapper.find('#registration-specialist').setValue('computer_sciences');
    await wrapper.find('#registration-gender').setValue('male');
    await wrapper.find('#registration-dormitory').setValue('a_block');
    // Set room to the string room ID
    await wrapper.find('#registration-room').setValue('1');
    // Fill other required fields
    await wrapper.find('#registration-iin').setValue('123456789012');
    await wrapper.find('#registration-name').setValue('Test User');
    await wrapper.find('#registration-enrollment-year').setValue('2020');
    await wrapper.find('#registration-email').setValue('test@example.com');
    await wrapper.find('#registration-password').setValue('password123');
    await wrapper.find('#registration-confirm-password').setValue('password123');
    await wrapper.find('#registration-agree-rules').setValue(true);
    const form = wrapper.find('form');
    expect(form.exists()).toBe(true, 'Form not found in DOM');
    await form.trigger('submit.prevent');
    await flushPromises();
    await flushPromises();
    // Check for the English success message in the full HTML
    const html = wrapper.html();
    if (!html.includes('Registration successful. Please wait for approval.')) {
      // eslint-disable-next-line no-console
      console.log('Rendered HTML:', html);
    }
    expect(html).toContain('Registration successful. Please wait for approval.');
  });

  // it('submits guest registration form and shows success message', async () => {
  //   ...
  // });
});
