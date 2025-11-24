export interface PublicSettings {
  dormitory_rules: string;
  currency_symbol: string;
  max_students_per_dormitory?: number;
  registration_enabled?: boolean;
  backup_list_enabled?: boolean;
  payment_deadline_days?: number;
  bank_requisites?: string;
}