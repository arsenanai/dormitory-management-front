
import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Login from '../../src/pages/Login.vue';

describe('Login.vue Registration', () => {
  it('shows validation errors for empty registration fields', async () => {
    const wrapper = mount(Login);
    // Switch to registration tab
    await wrapper.find('button[role="tab"]:nth-child(2)').trigger('click');
    await wrapper.find('form').trigger('submit.prevent');
    // Check for validation error messages
    expect(wrapper.html()).toContain('required');
  });

  it('submits registration form with valid student data', async () => {
    const wrapper = mount(Login);
    await wrapper.find('button[role="tab"]:nth-child(2)').trigger('click');
    // Fill registration fields
    await wrapper.find('#registration-iin').setValue('123456789012');
    await wrapper.find('#registration-name').setValue('Test Student');
    await wrapper.find('#registration-faculty').setValue('engineering');
    await wrapper.find('#registration-specialist').setValue('computer_sciences');
    await wrapper.find('#registration-enrollment-year').setValue('2023');
    await wrapper.find('#registration-gender').setValue('male');
    await wrapper.find('#registration-email').setValue('student@example.com');
    await wrapper.find('#registration-password').setValue('password');
    await wrapper.find('#registration-confirm-password').setValue('password');
    await wrapper.find('#registration-dormitory').setValue('a_block');
    await wrapper.find('#registration-room').setValue('a210');
    await wrapper.find('#registration-agree-rules').setValue(true);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    // Check for success toast or message
    expect(wrapper.html()).toMatch(/success|registered|pending/i);
  });

  it('submits guest registration form with valid data', async () => {
    const wrapper = mount(Login);
    await wrapper.find('button[role="tab"]:nth-child(3)').trigger('click');
    await wrapper.find('#guest-room-type').setValue('single');
    await wrapper.find('#guest-name').setValue('Guest User');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    expect(wrapper.html()).toMatch(/success|booked|pending/i);
  });
});
