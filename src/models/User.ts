import { Role } from "./Role";
import { City } from "./City";

export class User {
  iin: string;
  name: string;
  faculty: string;
  specialist: string;
  enrollmentYear: string;
  gender: string;
  email: string;
  phoneNumbers: string[];
  dormitory: string;
  room: string;
  password: string;
  confirmPassword: string;
  dealNumber: string;
  city: City | null;
  files: (File | null)[];
  agreeToDormitoryRules: boolean;
  addToReserveList: boolean;
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
    dormitory = "",
    room = "",
    password = "",
    confirmPassword = "",
    dealNumber = "",
    city: City | null = null,
    files: (File | null)[] = [null, null, null, null],
    agreeToDormitoryRules = false,
    addToReserveList = false,
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
    this.dormitory = dormitory;
    this.room = room;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.dealNumber = dealNumber;
    this.city = city;
    this.files = files;
    this.agreeToDormitoryRules = agreeToDormitoryRules;
    this.addToReserveList = addToReserveList;
    this.roles = roles;
  }
}