import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePaymentTypesStore } from '@/stores/paymentTypes';
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
    showToast: vi.fn(),
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

describe('PaymentTypes Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('State', () => {
    it('should have initial state', () => {
      const store = usePaymentTypesStore();

      expect(store.paymentTypes).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('fetchPaymentTypes', () => {
    it('should fetch payment types successfully', async () => {
      const { paymentTypeService } = await import('@/services/api');
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
      ];

      vi.mocked(paymentTypeService.getAll).mockResolvedValue({
        data: mockPaymentTypes,
        success: true,
      });

      const store = usePaymentTypesStore();
      await store.fetchPaymentTypes();

      expect(store.paymentTypes).toEqual(mockPaymentTypes);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(paymentTypeService.getAll).toHaveBeenCalledOnce();
    });

    it('should handle fetch error', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const error = new Error('Network error');

      vi.mocked(paymentTypeService.getAll).mockRejectedValue(error);

      const store = usePaymentTypesStore();
      await store.fetchPaymentTypes();

      expect(store.paymentTypes).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe('Failed to load payment types');
    });

    it('should set loading state during fetch', async () => {
      const { paymentTypeService } = await import('@/services/api');

      vi.mocked(paymentTypeService.getAll).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: [], success: true });
            }, 100);
          })
      );

      const store = usePaymentTypesStore();
      const fetchPromise = store.fetchPaymentTypes();

      expect(store.loading).toBe(true);
      await fetchPromise;
      expect(store.loading).toBe(false);
    });
  });

  describe('createPaymentType', () => {
    it('should create payment type successfully', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const newPaymentType: PaymentType = {
        id: 3,
        name: 'guest_stay',
        frequency: 'once',
        calculation_method: 'room_daily_rate',
        fixed_amount: null,
        target_role: 'guest',
        trigger_event: 'registration',
      };

      const createData: Partial<PaymentType> = {
        name: 'guest_stay',
        frequency: 'once',
        calculation_method: 'room_daily_rate',
        target_role: 'guest',
        trigger_event: 'registration',
      };

      vi.mocked(paymentTypeService.create).mockResolvedValue({
        data: newPaymentType,
        success: true,
      });

      const store = usePaymentTypesStore();
      await store.createPaymentType(createData);

      expect(store.paymentTypes).toContainEqual(newPaymentType);
      expect(store.loading).toBe(false);
      expect(paymentTypeService.create).toHaveBeenCalledWith(createData);
    });

    it('should handle create error', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const error = new Error('Validation error');

      vi.mocked(paymentTypeService.create).mockRejectedValue(error);

      const store = usePaymentTypesStore();
      await expect(store.createPaymentType({ name: 'test' })).rejects.toThrow();

      expect(store.loading).toBe(false);
      expect(store.error).toBe('Failed to create payment type');
    });
  });

  describe('updatePaymentType', () => {
    it('should update payment type successfully', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const existingPaymentType: PaymentType = {
        id: 1,
        name: 'renting',
        frequency: 'semesterly',
        calculation_method: 'room_semester_rate',
        fixed_amount: null,
        target_role: 'student',
        trigger_event: 'registration',
      };

      const updatedPaymentType: PaymentType = {
        ...existingPaymentType,
        frequency: 'monthly',
        fixed_amount: 200.0,
        calculation_method: 'fixed',
      };

      vi.mocked(paymentTypeService.update).mockResolvedValue({
        data: updatedPaymentType,
        success: true,
      });

      const store = usePaymentTypesStore();
      store.paymentTypes = [existingPaymentType];

      await store.updatePaymentType(1, {
        frequency: 'monthly',
        fixed_amount: 200.0,
        calculation_method: 'fixed',
      });

      expect(store.paymentTypes[0]).toEqual(updatedPaymentType);
      expect(store.loading).toBe(false);
      expect(paymentTypeService.update).toHaveBeenCalledWith(1, {
        frequency: 'monthly',
        fixed_amount: 200.0,
        calculation_method: 'fixed',
      });
    });

    it('should handle update error', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const error = new Error('Not found');

      vi.mocked(paymentTypeService.update).mockRejectedValue(error);

      const store = usePaymentTypesStore();
      await expect(store.updatePaymentType(999, { name: 'test' })).rejects.toThrow();

      expect(store.loading).toBe(false);
      expect(store.error).toBe('Failed to update payment type');
    });

    it('should not update if payment type not found in store', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const updatedPaymentType: PaymentType = {
        id: 999,
        name: 'test',
        frequency: 'monthly',
        calculation_method: 'fixed',
        fixed_amount: 100.0,
        target_role: 'student',
        trigger_event: null,
      };

      vi.mocked(paymentTypeService.update).mockResolvedValue({
        data: updatedPaymentType,
        success: true,
      });

      const store = usePaymentTypesStore();
      store.paymentTypes = [];

      await store.updatePaymentType(999, { name: 'test' });

      expect(store.paymentTypes).toEqual([]);
    });
  });

  describe('deletePaymentType', () => {
    it('should delete payment type successfully', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const paymentTypeToDelete: PaymentType = {
        id: 1,
        name: 'renting',
        frequency: 'semesterly',
        calculation_method: 'room_semester_rate',
        fixed_amount: null,
        target_role: 'student',
        trigger_event: 'registration',
      };

      const otherPaymentType: PaymentType = {
        id: 2,
        name: 'catering',
        frequency: 'monthly',
        calculation_method: 'fixed',
        fixed_amount: 150.0,
        target_role: 'student',
        trigger_event: 'new_month',
      };

      vi.mocked(paymentTypeService.delete).mockResolvedValue({
        data: { message: 'Deleted' },
        success: true,
      });

      const store = usePaymentTypesStore();
      store.paymentTypes = [paymentTypeToDelete, otherPaymentType];

      await store.deletePaymentType(1);

      expect(store.paymentTypes).not.toContainEqual(paymentTypeToDelete);
      expect(store.paymentTypes).toContainEqual(otherPaymentType);
      expect(store.loading).toBe(false);
      expect(paymentTypeService.delete).toHaveBeenCalledWith(1);
    });

    it('should handle delete error', async () => {
      const { paymentTypeService } = await import('@/services/api');
      const error = new Error('Not found');

      vi.mocked(paymentTypeService.delete).mockRejectedValue(error);

      const store = usePaymentTypesStore();
      await expect(store.deletePaymentType(999)).rejects.toThrow();

      expect(store.loading).toBe(false);
      expect(store.error).toBe('Failed to delete payment type');
    });
  });
});
