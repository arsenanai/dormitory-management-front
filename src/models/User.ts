import { Role } from "./Role";
import { City } from "./City";
import { Room } from "./Room";
import { Dormitory } from "./Dormitory";

export type UserStatus = "pending" | "active" | "passive";

export interface User {
  id: number;
  name: string; // Full name
  first_name?: string; // Changed to snake_case
  last_name?: string; // Changed to snake_case
  email: string;
  email_verified_at?: string;
  phone_numbers?: string[]; // Changed to snake_case
  dormitory_id?: number | null;
  room_id?: number | null;
  bed_id?: number | null;
  password?: string;
  password_confirmation?: string; // Changed to snake_case
  status: UserStatus;
  role_id?: number;
  role?: Role | string;
  room?: Room;
  room_type?: RoomType;
  city?: City;
  // Student-specific fields (some may be moved to StudentProfile)
  student_id?: string;
  birth_date?: string;
  blood_type?: string;
  course?: string;
  faculty?: string;
  specialty?: string;
  enrollment_year?: number;
  graduation_year?: number;
  gender?: "male" | "female";
  violations?: string;
  // Profile relationships
  student_profile?: StudentProfile;
  admin_profile?: AdminProfile;
  guest_profile?: GuestProfile;
  // Timestamps
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  dormitory?: Dormitory; // Add dormitory to the main User interface
}

// Import types after the interface to avoid circular imports
import type { StudentProfile } from "./StudentProfile";
import type { AdminProfile } from "./AdminProfile";
import type { GuestProfile } from "./GuestProfile";
import { RoomType } from "./RoomType";

// Legacy User class for forms/registration (kept for compatibility)
export class UserRegistration {
  iin: string; // Matches backend
  first_name: string; // Changed to snake_case
  last_name: string; // Changed to snake_case
  faculty: string; // Matches backend
  specialist: string; // Matches backend
  enrollment_year: number; // Changed to snake_case
  gender: string; // Matches backend
  email: string; // Matches backend
  phone_numbers: string[]; // Changed to snake_case
  password: string;
  confirm_password: string; // Changed to snake_case
  deal_number: string; // Changed to snake_case
  country: string; // Matches backend
  region: string; // Matches backend
  city: string; // Matches backend
  parent_name: string; // Changed to snake_case
  parent_phone: string; // Changed to snake_case
  parent_email: string; // Changed to snake_case
  mentor_name: string; // Changed to snake_case
  mentor_email: string; // Changed to snake_case
  emergency_contact_name: string; // Changed to snake_case
  emergency_contact_phone: string; // Changed to snake_case
  blood_type: string; // Changed to snake_case
  allergies: string; // Matches backend
  violations: string; // Matches backend
  dormitory_id: number | null; // Changed to snake_case
  room_id: number | null; // Changed to snake_case
  bed_id: number | null; // Changed to snake_case
  files: (File | null)[];
  agree_to_dormitory_rules: boolean; // Changed to snake_case
  status: UserStatus;
  roles: Role[];

  constructor(
    iin = "",
    first_name = "", // Changed to snake_case
    last_name = "", // Changed to snake_case
    faculty = "",
    specialist = "",
    enrollment_year = new Date().getFullYear(), // Changed to snake_case
    gender = "",
    email = "",
    phone_numbers: string[] = [""], // Changed to snake_case
    password = "",
    confirm_password = "", // Changed to snake_case
    deal_number = "", // Changed to snake_case
    country = "",
    region = "",
    city = "",
    parent_name = "", // Changed to snake_case
    parent_phone = "", // Changed to snake_case
    parent_email = "", // Changed to snake_case
    mentor_name = "", // Changed to snake_case
    mentor_email = "", // Changed to snake_case
    emergency_contact_name = "", // Changed to snake_case
    emergency_contact_phone = "", // Changed to snake_case
    blood_type = "", // Changed to snake_case
    allergies = "",
    violations = "",
    dormitory_id: number | null = null, // Changed to snake_case
    room_id: number | null = null, // Changed to snake_case
    bed_id: number | null = null, // Changed to snake_case
    files: (File | null)[] = [null, null, null, null],
    agree_to_dormitory_rules = false, // Changed to snake_case
    status: UserStatus = "pending",
    roles: Role[] = []
  ) {
    this.iin = iin;
    this.first_name = first_name; // Changed to snake_case
    this.last_name = last_name; // Changed to snake_case
    this.faculty = faculty;
    this.specialist = specialist;
    this.enrollment_year = enrollment_year; // Changed to snake_case
    this.gender = gender;
    this.email = email;
    this.phone_numbers = phone_numbers; // Changed to snake_case
    this.password = password;
    this.confirm_password = confirm_password; // Changed to snake_case
    this.deal_number = deal_number; // Changed to snake_case
    this.country = country;
    this.region = region;
    this.city = city;
    this.parent_name = parent_name; // Changed to snake_case
    this.parent_phone = parent_phone; // Changed to snake_case
    this.parent_email = parent_email; // Changed to snake_case
    this.mentor_name = mentor_name; // Changed to snake_case
    this.mentor_email = mentor_email; // Changed to snake_case
    this.emergency_contact_name = emergency_contact_name; // Changed to snake_case
    this.emergency_contact_phone = emergency_contact_phone; // Changed to snake_case
    this.blood_type = blood_type; // Changed to snake_case
    this.allergies = allergies;
    this.violations = violations;
    this.dormitory_id = dormitory_id; // Changed to snake_case
    this.room_id = room_id; // Changed to snake_case
    this.bed_id = bed_id; // Changed to snake_case
    this.files = files;
    this.agree_to_dormitory_rules = agree_to_dormitory_rules; // Changed to snake_case
    this.status = status;
    this.roles = roles;
  }
}
