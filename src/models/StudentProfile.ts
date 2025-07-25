export interface StudentProfile {
  id?: number;
  user_id: number;
  iin: string;
  student_id?: string;
  faculty?: string;
  specialist?: string;
  course?: string | number;
  year_of_study?: number;
  enrollment_year?: number;
  gender?: string;
  blood_type?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  deal_number?: string;
  agree_to_dormitory_rules?: boolean;
  has_meal_plan?: boolean;
  [key: string]: any;
} 