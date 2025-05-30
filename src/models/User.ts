import { Role } from "./Role";
import { City } from "./City";
import { Room } from "./Room";

export type UserStatus = "reserved" | "indoor" | "outdoor";

export class User {
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
    status: UserStatus = "reserved",
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