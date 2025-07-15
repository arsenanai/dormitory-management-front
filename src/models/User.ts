import { Role } from "./Role";
import { City } from "./City";
import { Room } from "./Room";

export type UserStatus = "pending" | "active" | "passive";

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  phone_numbers?: string | null; // JSON string from backend
  role: Role;
  room?: Room | null;
  dormitory?: any | null; // Can be typed more specifically later
  status: UserStatus;
  created_at: string;
  updated_at: string;
  
  // Student-specific fields (present when user role is 'student')
  student_id?: string | null;
  faculty?: string | null;
  specialty?: string | null;
  course?: number | null;
  year_of_study?: number | null;
  enrollment_year?: string | null;
  graduation_year?: string | null;
  blood_type?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  has_meal_plan?: number | boolean;
  violations?: any | null;
}

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
  city: City | null;
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
    city: City | null = null,
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
    this.city = city;
    this.files = files;
    this.agreeToDormitoryRules = agreeToDormitoryRules;
    this.status = status;
    this.roles = roles;
  }
}