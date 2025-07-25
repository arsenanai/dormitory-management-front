export interface GuestProfile {
  id?: number;
  user_id: number;
  room_type?: string;
  files?: string[];
  [key: string]: any;
} 