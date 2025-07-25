export interface AdminProfile {
  id?: number;
  user_id: number;
  position?: string;
  department?: string;
  office_phone?: string;
  office_location?: string;
  [key: string]: any;
} 