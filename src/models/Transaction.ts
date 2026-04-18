import type { User } from "./User";

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  paymentMethod: "bank_check" | "kaspi" | "stripe";
  paymentCheck?: string | null;
  gatewayTransactionId?: string | null;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";
  createdAt: string;
  updatedAt: string;
  user?: User;
  payments?: Array<{
    id: number;
    amount: number;
    pivotAmount: number;
  }>;
}
