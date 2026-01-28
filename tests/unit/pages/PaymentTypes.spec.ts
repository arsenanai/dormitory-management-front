import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import PaymentTypes from '@/pages/PaymentTypes.vue';
import { paymentTypeService } from '@/services/api';
import type { PaymentType } from '@/models/PaymentType';

// Mock the API service
vi.mock('@/services/api', () => ({
  paymentTypeService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the toast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Mock the settings store
vi.mock('@/stores/settings', () => ({
  useSettingsStore: () => ({
    publicSettings: {
      currency_symbol: '₸',
    },
  }),
}));

describe('PaymentTypes.vue', () => {
  let wrapper: any;
  let router: any;

  const mockPaymentTypes: PaymentType[] = [
    {
      id: 1,
      name: 'renting',
      frequency: 'semesterly',
      calculation_method: 'room_semester_rate',
      fixed_amount: null,
      target_role: 'student',
      trigger_event: 'registration',
    },
    {
      id: 2,
      name: 'catering',
      frequency: 'monthly',
      calculation_method: 'fixed',
      fixed_amount: 150.0,
      target_role: 'student',
      trigger_event: 'new_month',
    },
    {
      id: 3,
      name: 'guest_stay',
      frequency: 'once',
      calculation_method: 'room_daily_rate',
      fixed_amount: null,
      target_role: 'guest',
      trigger_event: 'registration',
    },
  ];

  beforeEach(() => {
    router = createRouterMock();
    injectRouterMock(router);

    vi.mocked(paymentTypeService.getAll).mockResolvedValue({
      data: mockPaymentTypes,
      success: true,
    });

    wrapper = mount(PaymentTypes, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              paymentTypesStore: {
                paymentTypes: mockPaymentTypes,
                loading: false,
                error: null,
              },
            },
          }),
        ],
      },
    });
  });

  describe('Component Rendering', () => {
    it('renders payment types page correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('[data-testid="add-payment-type-button"]').exists()).toBe(true);
    });

    it('displays payment types table', () => {
      const table = wrapper.findComponent({ name: 'CTable' });
      expect(table.exists()).toBe(true);
    });

    it('renders all payment types in table', async () => {
      await wrapper.vm.$nextTick();
      const store = wrapper.vm.paymentTypesStore;
      expect(store.paymentTypes.length).toBe(3);
    });
  });

  describe('Table Columns', () => {
    it('displays all required columns', async () => {
      await wrapper.vm.$nextTick();
      const columns = wrapper.vm.tableColumns;
      const columnKeys = columns.map((col: any) => col.key);

      expect(columnKeys).toContain('name');
      expect(columnKeys).toContain('frequency');
      expect(columnKeys).toContain('calculation_method');
      expect(columnKeys).toContain('fixed_amount');
      expect(columnKeys).toContain('target_role');
      expect(columnKeys).toContain('trigger_event');
      expect(columnKeys).toContain('actions');
    });
  });

  describe('Create Modal', () => {
    it('opens create modal when add button is clicked', async () => {
      const addButton = wrapper.find('[data-testid="add-payment-type-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showModal).toBe(true);
      expect(wrapper.vm.editingType).toBeNull();
    });

    it('resets form data when opening create modal', async () => {
      const addButton = wrapper.find('[data-testid="add-payment-type-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.frequency).toBe('monthly');
      expect(wrapper.vm.formData.calculation_method).toBe('fixed');
      expect(wrapper.vm.formData.fixed_amount).toBeNull();
      expect(wrapper.vm.formData.target_role).toBe('student');
      expect(wrapper.vm.formData.trigger_event).toBe('');
    });

    it('shows fixed amount field when calculation method is fixed', async () => {
      const addButton = wrapper.find('[data-testid="add-payment-type-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      wrapper.vm.formData.calculation_method = 'fixed';
      await wrapper.vm.$nextTick();

      const fixedAmountInput = wrapper.find('input[type="number"]');
      expect(fixedAmountInput.exists()).toBe(true);
    });

    it('hides fixed amount field when calculation method is not fixed', async () => {
      const addButton = wrapper.find('[data-testid="add-payment-type-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      wrapper.vm.formData.calculation_method = 'room_semester_rate';
      await wrapper.vm.$nextTick();

      const fixedAmountInputs = wrapper.findAll('input[type="number"]');
      // Should not have fixed_amount input visible
      expect(fixedAmountInputs.length).toBe(0);
    });
  });

  describe('Edit Modal', () => {
    it('opens edit modal with payment type data', async () => {
      const store = wrapper.vm.paymentTypesStore;
      const paymentType = store.paymentTypes[0];

      await wrapper.vm.openEditModal(paymentType);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showModal).toBe(true);
      expect(wrapper.vm.editingType).toEqual(paymentType);
      expect(wrapper.vm.formData.name).toBe(paymentType.name);
      expect(wrapper.vm.formData.frequency).toBe(paymentType.frequency);
      expect(wrapper.vm.formData.calculation_method).toBe(paymentType.calculation_method);
      expect(wrapper.vm.formData.fixed_amount).toBe(paymentType.fixed_amount);
      expect(wrapper.vm.formData.target_role).toBe(paymentType.target_role);
      expect(wrapper.vm.formData.trigger_event).toBe(paymentType.trigger_event);
    });
  });

  describe('Form Submission', () => {
    it('creates new payment type on submit', async () => {
      const newPaymentType: PaymentType = {
        id: 4,
        name: 'test_payment',
        frequency: 'monthly',
        calculation_method: 'fixed',
        fixed_amount: 200.0,
        target_role: 'student',
        trigger_event: 'new_month',
      };

      vi.mocked(paymentTypeService.create).mockResolvedValue({
        data: newPaymentType,
        success: true,
      });

      const addButton = wrapper.find('[data-testid="add-payment-type-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      wrapper.vm.formData = {
        name: 'test_payment',
        frequency: 'monthly',
        calculation_method: 'fixed',
        fixed_amount: 200.0,
        target_role: 'student',
        trigger_event: 'new_month',
      };

      await wrapper.vm.handleSubmit();
      await wrapper.vm.$nextTick();

      expect(paymentTypeService.create).toHaveBeenCalledWith({
        name: 'test_payment',
        frequency: 'monthly',
        calculation_method: 'fixed',
        fixed_amount: 200.0,
        target_role: 'student',
        trigger_event: 'new_month',
      });
      expect(wrapper.vm.showModal).toBe(false);
    });

    it('updates existing payment type on submit', async () => {
      const store = wrapper.vm.paymentTypesStore;
      const paymentType = store.paymentTypes[0];

      const updatedPaymentType: PaymentType = {
        ...paymentType,
        frequency: 'monthly',
        fixed_amount: 300.0,
        calculation_method: 'fixed',
      };

      vi.mocked(paymentTypeService.update).mockResolvedValue({
        data: updatedPaymentType,
        success: true,
      });

      await wrapper.vm.openEditModal(paymentType);
      await wrapper.vm.$nextTick();

      wrapper.vm.formData.frequency = 'monthly';
      wrapper.vm.formData.fixed_amount = 300.0;
      wrapper.vm.formData.calculation_method = 'fixed';

      await wrapper.vm.handleSubmit();
      await wrapper.vm.$nextTick();

      expect(paymentTypeService.update).toHaveBeenCalledWith(paymentType.id, {
        name: paymentType.name,
        frequency: 'monthly',
        calculation_method: 'fixed',
        fixed_amount: 300.0,
        target_role: paymentType.target_role,
        trigger_event: paymentType.trigger_event,
      });
      expect(wrapper.vm.showModal).toBe(false);
    });

    it('handles form submission error', async () => {
      vi.mocked(paymentTypeService.create).mockRejectedValue(new Error('Network error'));

      const addButton = wrapper.find('[data-testid="add-payment-type-button"]');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      wrapper.vm.formData.name = 'test_payment';

      await wrapper.vm.handleSubmit();
      await wrapper.vm.$nextTick();

      // Modal should remain open on error
      expect(wrapper.vm.showModal).toBe(true);
    });
  });

  describe('Delete Functionality', () => {
    it('opens delete confirmation modal', async () => {
      const store = wrapper.vm.paymentTypesStore;
      const paymentType = store.paymentTypes[0];

      await wrapper.vm.confirmDelete(paymentType.id);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showDeleteModal).toBe(true);
      expect(wrapper.vm.typeToDelete).toBe(paymentType.id);
    });

    it('deletes payment type on confirmation', async () => {
      vi.mocked(paymentTypeService.delete).mockResolvedValue({
        data: { message: 'Deleted' },
        success: true,
      });

      const store = wrapper.vm.paymentTypesStore;
      const initialCount = store.paymentTypes.length;
      const paymentType = store.paymentTypes[0];

      wrapper.vm.typeToDelete = paymentType.id;
      await wrapper.vm.handleDelete();
      await wrapper.vm.$nextTick();

      expect(paymentTypeService.delete).toHaveBeenCalledWith(paymentType.id);
      expect(wrapper.vm.showDeleteModal).toBe(false);
      expect(store.paymentTypes.length).toBe(initialCount - 1);
    });

    it('handles delete error', async () => {
      vi.mocked(paymentTypeService.delete).mockRejectedValue(new Error('Not found'));

      wrapper.vm.typeToDelete = 999;
      await wrapper.vm.handleDelete();
      await wrapper.vm.$nextTick();

      // Delete modal should close even on error
      expect(wrapper.vm.showDeleteModal).toBe(false);
    });
  });

  describe('Formatting Functions', () => {
    it('formats calculation method correctly', () => {
      expect(wrapper.vm.formatCalculationMethod('room_semester_rate')).toBe('Room Semester Rate');
      expect(wrapper.vm.formatCalculationMethod('room_daily_rate')).toBe('Room Daily Rate');
      expect(wrapper.vm.formatCalculationMethod('fixed')).toBe('Fixed Amount');
    });

    it('formats trigger event correctly', () => {
      expect(wrapper.vm.formatTriggerEvent('registration')).toBe('Registration');
      expect(wrapper.vm.formatTriggerEvent('new_semester')).toBe('New Semester');
      expect(wrapper.vm.formatTriggerEvent('new_month')).toBe('New Month');
      expect(wrapper.vm.formatTriggerEvent('new_booking')).toBe('New Booking');
      expect(wrapper.vm.formatTriggerEvent('room_type_change')).toBe('Room Type Change');
    });

    it('formats currency correctly', () => {
      expect(wrapper.vm.formatCurrency(150.5)).toBe('150.50 ₸');
      expect(wrapper.vm.formatCurrency(0)).toBe('0.00 ₸');
    });
  });

  describe('Calculation Method Change Handler', () => {
    it('clears fixed_amount when calculation method changes from fixed', async () => {
      wrapper.vm.formData.calculation_method = 'fixed';
      wrapper.vm.formData.fixed_amount = 100.0;

      wrapper.vm.formData.calculation_method = 'room_semester_rate';
      wrapper.vm.handleCalculationMethodChange();

      expect(wrapper.vm.formData.fixed_amount).toBeNull();
    });

    it('keeps fixed_amount when calculation method is fixed', async () => {
      wrapper.vm.formData.calculation_method = 'fixed';
      wrapper.vm.formData.fixed_amount = 100.0;

      wrapper.vm.handleCalculationMethodChange();

      expect(wrapper.vm.formData.fixed_amount).toBe(100.0);
    });
  });

  describe('Options Arrays', () => {
    it('has correct frequency options', () => {
      const options = wrapper.vm.frequencyOptions;
      expect(options).toHaveLength(3);
      expect(options.map((o: any) => o.value)).toEqual(['monthly', 'semesterly', 'once']);
    });

    it('has correct calculation method options', () => {
      const options = wrapper.vm.calculationMethodOptions;
      expect(options).toHaveLength(3);
      expect(options.map((o: any) => o.value)).toEqual([
        'room_semester_rate',
        'room_daily_rate',
        'fixed',
      ]);
    });

    it('has correct target role options', () => {
      const options = wrapper.vm.targetRoleOptions;
      expect(options).toHaveLength(2);
      expect(options.map((o: any) => o.value)).toEqual(['student', 'guest']);
    });

    it('has correct trigger event options', () => {
      const options = wrapper.vm.triggerEventOptions;
      expect(options).toHaveLength(6);
      expect(options.map((o: any) => o.value)).toEqual([
        '',
        'registration',
        'new_semester',
        'new_month',
        'new_booking',
        'room_type_change',
      ]);
    });
  });
});
