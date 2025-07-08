import { defineStore } from "pinia";
import { LOCAL_STORAGE_SELECTED_PAYMENT_KEY } from "@/Const";

interface Payment {
  id: number;
  contract_number?: string;
  dogovorNumber?: string;
  amount?: number;
  payment?: number;
  student?: any;
  [key: string]: any;
}

export const usePaymentsStore = defineStore("paymentsStore", {
  state: () => ({
    payments: [] as Payment[],
    selectedPayment: null as Payment | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    setSelectedPayment(payment: Payment) {
      this.selectedPayment = JSON.parse(JSON.stringify(payment));
      localStorage.setItem(LOCAL_STORAGE_SELECTED_PAYMENT_KEY, JSON.stringify(this.selectedPayment));
    },
    restoreSelectedPayment() {
      const saved = localStorage.getItem(LOCAL_STORAGE_SELECTED_PAYMENT_KEY);
      if (saved) {
        this.selectedPayment = JSON.parse(saved);
      }
    },
    clearSelectedPayment() {
      this.selectedPayment = null;
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_PAYMENT_KEY);
    },
    setPayments(payments: Payment[]) {
      this.payments = payments;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
  },
  getters: {
    getPaymentById: (state) => (id: number) => {
      return state.payments.find((payment: Payment) => payment.id === id);
    },
  },
});
