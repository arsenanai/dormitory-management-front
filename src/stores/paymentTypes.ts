import { defineStore } from "pinia";
import { paymentTypeService } from "@/services/api";
import type { PaymentType } from "@/models/PaymentType";

export const usePaymentTypesStore = defineStore("paymentTypesStore", {
  state: () => ({
    paymentTypes: [] as PaymentType[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPaymentTypes() {
      this.loading = true;
      try {
        const response = await paymentTypeService.getAll();
        this.paymentTypes = response.data;
      } catch (err) {
        this.error = "Failed to load payment types";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async createPaymentType(data: Partial<PaymentType>) {
      this.loading = true;
      try {
        const response = await paymentTypeService.create(data);
        this.paymentTypes.push(response.data);
      } catch (err) {
        this.error = "Failed to create payment type";
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updatePaymentType(id: number, data: Partial<PaymentType>) {
      this.loading = true;
      try {
        const response = await paymentTypeService.update(id, data);
        const index = this.paymentTypes.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.paymentTypes[index] = response.data;
        }
      } catch (err) {
        this.error = "Failed to update payment type";
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deletePaymentType(id: number) {
      this.loading = true;
      try {
        await paymentTypeService.delete(id);
        this.paymentTypes = this.paymentTypes.filter((t) => t.id !== id);
      } catch (err) {
        this.error = "Failed to delete payment type";
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
