import type { User } from "./User";

export class Payment {
  id: number;
  user_id: number;
  amount: number;
  payment_type?: string;
  date_from: string;
  date_to: string;
  deal_number?: string;
  deal_date?: string;
  payment_check?: string;
  status?: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" | "expired";
  created_at: string;
  updated_at: string;
  user?: User;
}
