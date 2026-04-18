import { defineStore } from "pinia";
import type { Transaction } from "@/models/Transaction";

interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
}

export const useTransactionsStore = defineStore("transactionsStore", {
  state: (): TransactionState => ({
    transactions: [],
    selectedTransaction: null,
    loading: false,
    error: null,
  }),
  actions: {
    setSelectedTransaction(transaction: Transaction) {
      this.selectedTransaction = JSON.parse(JSON.stringify(transaction));
    },
    clearSelectedTransaction() {
      this.selectedTransaction = null;
    },
    setTransactions(transactions: Transaction[]) {
      this.transactions = transactions;
    },
    addTransaction(transaction: Transaction) {
      this.transactions.unshift(transaction);
    },
    updateTransaction(id: number, updatedTransaction: Transaction) {
      const index = this.transactions.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.transactions[index] = updatedTransaction;
      }
    },
    removeTransaction(id: number) {
      this.transactions = this.transactions.filter((t) => t.id !== id);
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
  },
  getters: {
    getTransactionById: (state) => (id: number) => {
      return state.transactions.find((transaction: Transaction) => transaction.id === id);
    },
    getTransactionsByStatus: (state) => (status: string) => {
      return state.transactions.filter((transaction: Transaction) => transaction.status === status);
    },
    getTransactionsByUser: (state) => (userId: number) => {
      return state.transactions.filter((transaction: Transaction) => transaction.userId === userId);
    },
  },
});
