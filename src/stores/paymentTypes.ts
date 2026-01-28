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
      this.error = null;
      try {
        const response = await paymentTypeService.getAll();
        const raw = response.data as { data?: PaymentType[] } | PaymentType[];
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        this.paymentTypes = Array.isArray(list) ? list : [];
      } catch (err) {
        this.error = "Failed to load payment types";
        this.paymentTypes = [];
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async createPaymentType(data: Partial<PaymentType>) {
      this.loading = true;
      try {
        const response = await paymentTypeService.create(data);
        const raw = response.data as { data?: PaymentType } | PaymentType;
        const created = (
          raw && typeof raw === "object" && "data" in raw ? raw.data : raw
        ) as PaymentType;
        if (created) this.paymentTypes.push(created);
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
        const raw = response.data as { data?: PaymentType } | PaymentType;
        const updated = (
          raw && typeof raw === "object" && "data" in raw ? raw.data : raw
        ) as PaymentType;
        const index = this.paymentTypes.findIndex((t) => t.id === id);
        if (index !== -1 && updated) {
          this.paymentTypes[index] = updated;
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
