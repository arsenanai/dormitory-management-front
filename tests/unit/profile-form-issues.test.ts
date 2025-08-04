/**
 * TDD Tests: Profile Form Issues
 * Issue 2a: User name not saving properly
 * Issue 2b: Phone number display problems (showing multiple fields instead of single combined number)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import AdminForm from '@/pages/AdminForm.vue';
import { useAuthStore } from '@/stores/auth';
import { userService, authService, adminService } from '@/services/api';

// Mock user service
vi.mock('@/services/api', () => ({
  userService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  authService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
  adminService: {
    create: vi.fn(),
    update: vi.fn(),
  }
}));

const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/admin-form/:id?', component: AdminForm }
  ]
});

describe('Profile Form Issues', () => {
  let wrapper: any;
  let authStore: any;

  beforeEach(() => {
    // Mock successful API response with full Axios response structure
    vi.mocked(authService.getProfile).mockResolvedValue({
      data: {
        id: 1,
        name: 'Ibrahim Tuncer',
        first_name: 'Ibrahim',
        last_name: 'Tuncer',
        email: 'ibrahim@example.com',
        phone: '+77001234567',
        phone_numbers: ['+7700', '123', '4567'], // Problematic: multiple parts instead of single number
        role: { name: 'admin' }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as any);

    wrapper = mount(AdminForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: {
                  id: 1,
                  name: 'Ibrahim Tuncer',
                  email: 'ibrahim@example.com',
                  role: { name: 'admin' }
                },
                isAuthenticated: true
              }
            }
          }),
          mockRouter
        ],
        mocks: {
          $t: (key: string) => key
        }
      }
    });

    authStore = useAuthStore();
  });

  describe('Issue 2a: Name Not Saving', () => {
    it('should detect when name changes are not persisted after form submission', async () => {
      // Load profile data
      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();
      
      // Explicitly load the user data
      await wrapper.vm.loadUser(1);
      await wrapper.vm.$nextTick();

      // Verify initial data loaded correctly
      console.log('Profile API response:', wrapper.vm.user);
      console.log('Admin form data after loading:', {
        name: wrapper.vm.user.name,
        surname: wrapper.vm.user.surname,
        email: wrapper.vm.user.email,
        phone_numbers: wrapper.vm.user.phone_numbers,
        dormitory: wrapper.vm.user.dormitory
      });

      // Submit form
      await wrapper.vm.submitForm();

      // When editing own profile (user ID 1), should call authService.updateProfile
      // with proper field mapping (name/surname -> first_name/last_name)
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Ibrahim',
          last_name: 'Tuncer',
          email: 'ibrahim@example.com',
          phone_numbers: ['+77001234567']
        })
      );
    });

    it('should properly map form fields to API fields for profile updates', async () => {
      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();
      
      // Load user data first
      await wrapper.vm.loadUser(1);
      await wrapper.vm.$nextTick();

      // Change form data
      wrapper.vm.user.name = 'Updated';
      wrapper.vm.user.surname = 'Name';
      wrapper.vm.user.email = 'updated@example.com';

      // Call the form submission handler
      await wrapper.vm.submitForm();

      // Verify API called with correct field mapping (name/surname -> first_name/last_name)
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Updated',
          last_name: 'Name',
          email: 'updated@example.com'
        })
      );
    });
  });

  describe('Issue 2b: Phone Number Display Problems', () => {
    it('should display single phone number field instead of multiple separated fields', async () => {
      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();

      // Current problematic behavior: shows ['+7700', '123', '4567'] as separate fields
      // Should show: '+77001234567' as single field
      
      const phoneInputs = wrapper.findAll('input[type="tel"]');
      
      // This test should FAIL initially because we have multiple phone inputs
      // instead of one combined field
      expect(phoneInputs).toHaveLength(1);
      expect(phoneInputs[0].element.value).toBe('+77001234567');
    });

    it('should properly combine phone number parts into single display value', () => {
      const phoneData = ['+7700', '123', '4567'];
      
      // Test the phone number combination logic
      const combinedPhone = wrapper.vm.combinePhoneNumber(phoneData);
      expect(combinedPhone).toBe('+77001234567');
    });

    it('should save phone number as single value to API', async () => {
      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();
      
      // Load user data first
      await wrapper.vm.loadUser(1);
      await wrapper.vm.$nextTick();

      // Set phone number
      wrapper.vm.user.phone_numbers = ['+77001234567'];

      await wrapper.vm.submitForm();

      // Verify phone sent as single value via authService.updateProfile
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          phone_numbers: ['+77001234567']
        })
      );
    });

    it('should handle phone number array from API and display as single field', async () => {
      // API returns phone as array parts (current problematic behavior)
      vi.mocked(authService.getProfile).mockResolvedValue({
        data: {
          id: 1,
          phone_numbers: ['+7700', '123', '4567'],
          phone: '+77001234567'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      } as any);

      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();

      // Should combine array parts and show in single field
      expect(wrapper.vm.user.phone_numbers).toEqual(['+77001234567']);
    });
  });

  describe('Form Data Mapping and API Integration', () => {
    it('should properly load user data from API into form', async () => {
      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();

      // Verify form populated with API data
      expect(wrapper.vm.user.name).toBe('Ibrahim');
      expect(wrapper.vm.user.surname).toBe('Tuncer');
      expect(wrapper.vm.user.email).toBe('ibrahim@example.com');
    });

    it('should handle form submission errors gracefully', async () => {
      // Mock API error
      vi.mocked(authService.updateProfile).mockRejectedValue(new Error('API Error'));

      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();
      
      // Load user data first
      await wrapper.vm.loadUser(1);
      await wrapper.vm.$nextTick();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await wrapper.vm.submitForm();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
