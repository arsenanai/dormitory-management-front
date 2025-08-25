import { Role } from "./Role";
import { City } from "./City";
import { Room } from "./Room";

export type UserStatus = "pending" | "active" | "passive";

export interface User {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  email_verified_at?: string;
  phone_numbers?: string[];
  room_id?: number;
  password?: string;
  status: UserStatus;
  role_id?: number;
  role?: Role;
  room?: Room;
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
  gender?: 'male' | 'female';
  emergency_contact?: string;
  emergency_phone?: string;
  violations?: string;
  // Profile relationships
  student_profile?: StudentProfile;
  admin_profile?: AdminProfile;
  guest_profile?: GuestProfile;
  // Timestamps
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// Import types after the interface to avoid circular imports
import type { StudentProfile } from './StudentProfile';
import type { AdminProfile } from './AdminProfile';
import type { GuestProfile } from './GuestProfile';

// Legacy User class for forms/registration (kept for compatibility)
export class UserRegistration {
  iin: string;
  name: string;
  faculty: string;
  specialist: string;
  enrollmentYear: string;
  gender: string;
  email: string;
  phoneNumbers: string[];
  room: Room | null;
  password: string;
  confirmPassword: string;
  dealNumber: string;
  country: string;
  region: string;
  city: string;
  files: (File | null)[];
  agreeToDormitoryRules: boolean;
  status: UserStatus;
  roles: Role[];

  constructor(
    iin = "",
    name = "",
    faculty = "",
    specialist = "",
    enrollmentYear = "",
    gender = "",
    email = "",
    phoneNumbers: string[] = [""],
    room: Room | null = null,
    password = "",
    confirmPassword = "",
    dealNumber = "",
    country = "",
    region = "",
    city = "",
    files: (File | null)[] = [null, null, null, null],
    agreeToDormitoryRules = false,
    status: UserStatus = "pending",
    roles: Role[] = []
  ) {
    this.iin = iin;
    this.name = name;
    this.faculty = faculty;
    this.specialist = specialist;
    this.enrollmentYear = enrollmentYear;
    this.gender = gender;
    this.email = email;
    this.phoneNumbers = phoneNumbers;
    this.room = room;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.dealNumber = dealNumber;
    this.country = country;
    this.region = region;
    this.city = city;
    this.files = files;
    this.agreeToDormitoryRules = agreeToDormitoryRules;
    this.status = status;
    this.roles = roles;
  }
}