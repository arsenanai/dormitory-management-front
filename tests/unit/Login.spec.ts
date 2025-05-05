import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '@/pages/Login.vue';
import i18n from '@/i18n';

// Configure vue-router-mock to use Vitest's spy implementation
const router = createRouterMock({
  spy: {
    create: vi.fn,
    reset: vi.fn, // Optional, but you can define how to reset spies if needed
  },
});
injectRouterMock(router);

let wrapper: ReturnType<typeof mount>; // Declare wrapper globally

// Common setup logic for all tests
beforeEach(() => {
  wrapper = mount(Login, {
    global: {
      plugins: [router, i18n],
    },
  });
});

describe('Login.vue', () => {
  it('renders the login form', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input#login-email').exists()).toBe(true);
    expect(wrapper.find('input#login-password').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login');
  });

  it('validates email and password fields', async () => {
    // Trigger form submission with empty fields
    await wrapper.find('form').trigger('submit.prevent');

    // Check validation messages for empty fields
    const emailInput = wrapper.find('input#login-email');
    const passwordInput = wrapper.find('input#login-password');
    const emailError = wrapper.find('#login-email-validation');
    const passwordError = wrapper.find('#login-password-validation');

    expect(emailError.exists()).toBe(true);
    expect(emailError.text()).toBe('Email is required.');
    expect(emailInput.attributes('validationstate')).toBe('error');

    expect(passwordError.exists()).toBe(true);
    expect(passwordError.text()).toBe('Password is required.');
    expect(passwordInput.attributes('validationstate')).toBe('error');

    // Set invalid email and password
    await emailInput.setValue('invalid-email');
    await passwordInput.setValue('123');
    await wrapper.find('form').trigger('submit.prevent');

    // Check validation messages for invalid inputs
    expect(emailError.text()).toBe('Invalid email format.');
    expect(emailInput.attributes('validationstate')).toBe('error');

    expect(passwordError.text()).toBe('Password must be at least 6 characters long.');
    expect(passwordInput.attributes('validationstate')).toBe('error');

    // Set valid email and password
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');

    // Check validation states for valid inputs
    expect(emailInput.attributes('validationstate')).toBe('success');
    expect(passwordInput.attributes('validationstate')).toBe('success');

    // Ensure no validation messages are displayed for valid inputs
    expect(wrapper.find('#login-email-validation').exists()).toBe(false);
    expect(wrapper.find('#login-password-validation').exists()).toBe(false);
  });

  it('navigates to /main on successful login', async () => {
    const routerPushSpy = vi.spyOn(router, 'push'); // Spy on router.push

    await wrapper.find('input#login-email').setValue('test@example.com');
    await wrapper.find('input#login-password').setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');

    expect(routerPushSpy).toHaveBeenCalledWith('/main');
    expect(router.currentRoute.value.path).toBe('/main');

    // Clean up the spy
    routerPushSpy.mockRestore();
  });

  it('renders the language selector', () => {
    const languageSelector = wrapper.find('#language-selector');
    expect(languageSelector.exists()).toBe(true);

    // Get language count from i18n
    const languages = Object.keys(i18n.global.availableLocales);
    expect(languageSelector.findAll('option').length).toBe(languages.length); // English, Қазақша, Русский
  });
});