export class Dormitory {
  name: string;
  capacity: number | null;
  gender: string;
  admin: string;
  registered: number | null;
  freeBeds: number | null;
  rooms: number | null;

  constructor(
    name = "",
    capacity: number | null = null,
    gender = "",
    admin = "",
    registered: number | null = null,
    freeBeds: number | null = null,
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