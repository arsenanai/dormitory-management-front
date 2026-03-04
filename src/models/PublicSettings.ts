export interface PublicSettings {
  dormitory_rules: Record<string, string> | string;
  currency_symbol: string;
  max_students_per_dormitory?: number;
  registration_enabled?: boolean;
  backup_list_enabled?: boolean;
  payment_deadline_days?: number;
  bank_requisites?: string;
  sdu_enabled?: boolean;
  iin_integration_enabled?: boolean;
}
