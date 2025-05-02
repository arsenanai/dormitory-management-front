export class Dormitory {
  name: string;
  capacity: number | null;
  gender: string;
  admin: string;
  registered: string;
  freeBeds: string;
  rooms: number | null;

  constructor(
    name = "",
    capacity: number | null = null,
    gender = "",
    admin = "",
    registered = "",
    freeBeds = "",
    rooms: number | null = null
  ) {
    this.name = name;
    this.capacity = capacity;
    this.gender = gender;
    this.admin = admin;
    this.registered = registered;
    this.freeBeds = freeBeds;
    this.rooms = rooms;
  }
}