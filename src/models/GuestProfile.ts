export interface GuestProfile {
  id?: number;
  user_id: number;
  purpose_of_visit?: string;
  host_name?: string;
  host_contact?: string;
  visit_start_date?: string;
  visit_end_date?: string;
  identification_type?: string;
  identification_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_approved?: boolean;
  daily_rate?: number;
  payment_received?: number; // Simple payment received amount
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
} 