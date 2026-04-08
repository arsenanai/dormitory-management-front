import type { User } from "./User";
import type { Transaction } from "./Transaction";

export class Payment {
  id: number;
  user_id: number;
  amount: number;
  paid_amount?: number;
  payment_type?: string;
  date_from: string;
  date_to: string;
  deal_number?: string;
  deal_date?: string;
  status?: "pending" | "partially_paid" | "completed" | "cancelled" | "expired";
  created_at: string;
  updated_at: string;
  user?: User;
  transactions?: Transaction[];
  
  // Computed property for remaining amount
  get remainingAmount(): number {
    return this.amount - (this.paid_amount || 0);
  }
}
