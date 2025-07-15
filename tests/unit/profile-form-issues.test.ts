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
import { userService, authService } from '@/services/api';

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
      expect(wrapper.vm.admin.name).toBe('Ibrahim');
      expect(wrapper.vm.admin.surname).toBe('Tuncer');

      // Simulate user changing name
      await wrapper.find('#admin-name').setValue('John');
      await wrapper.find('#admin-surname').setValue('Doe');

      // Mock profile update API call
      vi.mocked(authService.updateProfile).mockResolvedValue({
        data: {
          id: 1,
          name: 'John Doe',
          first_name: 'John',
          last_name: 'Doe',
          email: 'ibrahim@example.com'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      } as any);

      // Submit form
      await wrapper.find('button[type="submit"]').trigger('click');

      // This test should FAIL initially because the form doesn't properly map
      // name/surname to first_name/last_name for API calls
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe'
        })
      );
    });

    it('should properly map form fields to API fields for profile updates', async () => {
      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();

      // Change form data
      wrapper.vm.admin.name = 'Updated';
      wrapper.vm.admin.surname = 'Name';
      wrapper.vm.admin.email = 'updated@example.com';

      // Call the form submission handler
      await wrapper.vm.submitForm();

      // Verify API called with correct field mapping
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

      // Set phone number
      wrapper.vm.admin.phoneNumbers = ['+77001234567'];

      await wrapper.vm.submitForm();

      // Verify phone sent as single value, not array
      expect(authService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+77001234567'
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
      expect(wrapper.vm.admin.phoneNumbers).toEqual(['+77001234567']);
    });
  });

  describe('Form Data Mapping and API Integration', () => {
    it('should properly load user data from API into form', async () => {
      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();

      // Verify form populated with API data
      expect(wrapper.vm.admin.name).toBe('Ibrahim');
      expect(wrapper.vm.admin.surname).toBe('Tuncer');
      expect(wrapper.vm.admin.email).toBe('ibrahim@example.com');
    });

    it('should handle form submission errors gracefully', async () => {
      // Mock API error
      vi.mocked(authService.updateProfile).mockRejectedValue(new Error('API Error'));

      await mockRouter.push('/admin-form/1');
      await wrapper.vm.$nextTick();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await wrapper.vm.submitForm();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
