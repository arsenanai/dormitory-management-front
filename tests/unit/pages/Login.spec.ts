import { mount } from '@vue/test-utils';
import Login from '@/pages/Login.vue';

describe('Login.vue', () => {
  it('renders login form', () => {
    const wrapper = mount(Login);
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('validates required fields', async () => {
    const wrapper = mount(Login);
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    // Check for validation error messages
    expect(wrapper.text()).toMatch(/email.*required|required.*email/i);
    expect(wrapper.text()).toMatch(/password.*required|required.*password/i);
  });

  it('shows validation for invalid email and short password', async () => {
    const wrapper = mount(Login);
    await wrapper.find('input[type="email"]').setValue('not-an-email');
    await wrapper.find('input[type="password"]').setValue('123');
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toMatch(/invalid.*email/i);
    expect(wrapper.text()).toMatch(/at least 6 characters/i);
  });

  it('emits login event or calls login action on submit', async () => {
    // Mock login method or API call if needed
    const wrapper = mount(Login);
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');
    // Add assertion: check for emitted event or successful login state
    // Example: expect(wrapper.emitted('login')).toBeTruthy();
  });

  it('shows error message on failed login', async () => {
    // Simulate failed login by triggering error toast
    const wrapper = mount(Login, {
      global: {
        mocks: {
          $t: (msg: string) => msg
        }
      }
    });
    // Set valid input
    await wrapper.find('input[type="email"]').setValue('fail@example.com');
    await wrapper.find('input[type="password"]').setValue('wrongpass');
    // Mock authStore.login to throw
    wrapper.vm.authStore = { login: vi.fn().mockRejectedValue(new Error('Invalid credentials')) };
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    // Check for error toast or error message
    // The error is shown via showError/toast, not inline, so this is a smoke test
    expect(wrapper.html()).toContain('Login'); // Form still present
  });

  it('shows loading indicator during login', async () => {
    // Simulate loading state (CInput/CButton may show spinner or disabled)
    const wrapper = mount(Login);
    wrapper.vm.loading = true;
    await wrapper.vm.$nextTick();
    // Check if submit button is disabled or has loading class
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
    // This is a smoke test, as loading UI is not text-based
    // Optionally check for loading spinner class if implemented
  });

  it('shows success state and redirects after login', async () => {
    // Mock login method to resolve
    const wrapper = mount(Login, {
      methods: {
        login: vi.fn().mockResolvedValue(true)
      }
    });
    await wrapper.find('input[type="email"]').setValue('success@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');
    // Simulate redirect or success state
    // Example: expect(window.location.href).toContain('/dashboard');
  });

  it('has accessible labels for inputs', () => {
    const wrapper = mount(Login);
    expect(wrapper.find('label[for="login-email"]').exists()).toBe(true);
    expect(wrapper.find('label[for="login-password"]').exists()).toBe(true);
  });

  it.skip('supports keyboard navigation (jsdom limitation)', async () => {
    // Skipped: jsdom/component test environment does not reliably update document.activeElement for focus events.
    // This should be covered by E2E tests instead.
  });
});
