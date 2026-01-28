export interface PaymentType {
  id: number;
  name: string;
  frequency: "monthly" | "semesterly" | "once";
  calculation_method: "room_semester_rate" | "room_daily_rate" | "fixed";
  fixed_amount: number | null;
  target_role: "student" | "guest";
  trigger_event:
    | "registration"
    | "new_semester"
    | "new_month"
    | "new_booking"
    | "room_type_change"
    | null;
  created_at?: string;
  updated_at?: string;
}
