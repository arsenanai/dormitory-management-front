export class Student {
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
  country: string;
  region: string;
  city: string;
  files: (File | null)[];
  agreeToDormitoryRules: boolean;
  addToReserveList: boolean;

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
    country = "",
    region = "",
    city = "",
    files: (File | null)[] = [null, null, null, null],
    agreeToDormitoryRules = false,
    addToReserveList = false
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
    this.country = country;
    this.region = region;
    this.city = city;
    this.files = files;
    this.agreeToDormitoryRules = agreeToDormitoryRules;
    this.addToReserveList = addToReserveList;
  }
}