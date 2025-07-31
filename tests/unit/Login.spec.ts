
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Login from '../../src/pages/Login.vue';

// Mock the useAuthStore composable and its register method
const mockRegister = vi.fn(async (data: any) => {
  if (data.user_type === 'guest') {
    return { message: 'Guest registration successful. Please check your email for confirmation or further instructions.' };
  }
  return { message: 'Registration successful. Please wait for approval.' };
});

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    register: mockRegister,
    login: vi.fn(),
  })
}));

// Mock the useToast composable
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  })
}));

describe('Login.vue Registration', () => {
  beforeEach(() => {
    // Ensure body exists for toast notifications
    if (!document.body) {
      document.body = document.createElement('body');
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any teleported elements
    const teleportedElements = document.querySelectorAll('[role="alert"]');
    teleportedElements.forEach(el => el.remove());
  });

  it('should display success message after successful student registration', async () => {
    const wrapper = mount(Login);
    
    // Set up the registration data directly on the component
    wrapper.vm.registration = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      iin: '123456789012',
      enrollmentYear: '2020',
      faculty: 'engineering',
      specialist: 'computer_sciences',
      gender: 'female',
      phoneNumbers: ['1234567890'],
      dealNumber: 'DEAL123',
      city: null,
      files: [],
      agreeToDormitoryRules: true
    };
    
    // Call the handleRegistration function directly
    await wrapper.vm.handleRegistration();
    
    // Wait for async operations
    await flushPromises();
    
    // Verify that register was called
    expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      iin: '123456789012',
      user_type: 'student'
    }));
    
    // Verify that success message was shown
    expect(mockShowSuccess).toHaveBeenCalledWith('Registration successful. Please wait for approval.');
  });

  it('should display success message after successful guest registration', async () => {
    const wrapper = mount(Login);
    
    // Set up the guest data directly on the component
    wrapper.vm.guest = {
      name: 'John Doe',
      roomType: 'single',
      files: []
    };
    
    // Call the handleGuestRegistration function directly
    await wrapper.vm.handleGuestRegistration();
    
    // Wait for async operations
    await flushPromises();
    
    // Verify that register was called
    expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
      name: 'John Doe',
      user_type: 'guest'
    }));
    
    // Verify that success message was shown
    expect(mockShowSuccess).toHaveBeenCalledWith('Guest registration successful. Please check your email for confirmation or further instructions.');
  });
});
