export class Dormitory {
  name: string;
  capacity: number | null;
  gender: string;
  admin: string;
  admin_id: number | null;
  registered: number | null;
  freeBeds: number | null;
  rooms: number | null;

  constructor(
    name = "",
    capacity: number | null = null,
    gender = "",
    admin = "",
    admin_id: number | null = null,
    registered: number | null = null,
    freeBeds: number | null = null,
    rooms: number | null = null
  ) {
    this.name = name;
    this.capacity = capacity;
    this.gender = gender;
    this.admin = admin;
    this.admin_id = admin_id;
    this.registered = registered;
    this.freeBeds = freeBeds;
    this.rooms = rooms;
  }
}