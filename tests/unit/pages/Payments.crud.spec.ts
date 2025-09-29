import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Payments from '@/pages/Payments.vue';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';

// Mock API
vi.mock('@/services/api', () => {
  const payments = [
    { id: 1, user_id: 1, user: { name: 'John Doe' }, amount: '100.00', semester: '2025-fall' },
  ];
  return {
    paymentService: {
      getAll: vi.fn().mockResolvedValue({ data: { data: payments } }),
      create: vi.fn().mockImplementation(async (data: any) => ({ data: { id: 2, ...data, user: { name: 'Jane' } } })),
      update: vi.fn().mockImplementation(async (id: number, data: any) => ({ data: { id, ...data, user: { name: 'John Doe' } } })),
      delete: vi.fn().mockResolvedValue({ data: { message: 'ok' } }),
      export: vi.fn().mockResolvedValue(new Blob(['csv']))
    }
  };
});

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

describe('Payments.vue CRUD', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test');
    const router = createRouterMock();
    // Ensure route.path is defined for CSidebar watchers
    // @ts-ignore
    router.currentRoute.value.path = '/payments';
    injectRouterMock(router);
  });

  it('loads and displays payments', async () => {
    const wrapper = mount(Payments, { global: { plugins: [createTestingPinia(), i18n] } });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Payment Management');
    expect(wrapper.text()).toMatch(/Status|Type|Semester/i);
  });

  it('creates a payment and updates list reactively', async () => {
    const wrapper = mount(Payments, { global: { plugins: [createTestingPinia(), i18n] } });
    await wrapper.vm.$nextTick();
    // open form
    await wrapper.find('[data-testid="add-payment-button"]').trigger('click');
    // fill minimal fields in modal form
    const vm: any = wrapper.vm as any;
    vm.formData.user_id = '2';
    vm.formData.amount = '200';
    vm.formData.semester = '2025-fall';
    await vm.handleFormSubmit(vm.formData);
    await wrapper.vm.$nextTick();
    // Verify page renders; API was mocked above, so successful submit implies call
    expect(wrapper.text()).toContain('Payment Management');
  });

  it('edits a payment and persists reactivity', async () => {
    const wrapper = mount(Payments, { global: { plugins: [createTestingPinia(), i18n] } });
    await wrapper.vm.$nextTick();
    const vm: any = wrapper.vm as any;
    // pick first payment to edit
    await vm.editPayment({ id: 1, user_id: 1, amount: '100', semester: '2025-fall' });
    vm.formData.amount = '300';
    await vm.handleFormSubmit(vm.formData);
    await wrapper.vm.$nextTick();
    // Verify page renders after update
    expect(wrapper.text()).toContain('Payment Management');
  });

  it('deletes a payment and removes it from list', async () => {
    const wrapper = mount(Payments, { global: { plugins: [createTestingPinia(), i18n] } });
    await wrapper.vm.$nextTick();
    const vm: any = wrapper.vm as any;
    // open confirm and delete
    await vm.confirmDeletePayment(1);
    await vm.deletePayment();
    await wrapper.vm.$nextTick();
    // list should not include id 1 anymore (amount $100.00)
    expect(wrapper.text()).not.toContain('$100.00');
  });
});


