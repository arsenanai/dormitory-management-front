import { Dormitory } from "./Dormitory";
import { RoomType } from "./RoomType";
import { Bed } from "./Bed";

export class Room {
  number: string;
  floor: number | null;
  notes: string;
  dormitory: Dormitory | null; // Many-to-one
  roomType: RoomType | null;   // Many-to-one
  beds: Bed[];                 // One-to-many
  quota: number | null;        // Room quota

  constructor(
    number = "",
    floor: number | null = null,
    notes = "",
    dormitory: Dormitory | null = null,
    roomType: RoomType | null = null,
    beds: Bed[] = [],
    quota: number | null = null
  ) {
    this.number = number;
    this.floor = floor;
    this.notes = notes;
    this.dormitory = dormitory;
    this.roomType = roomType;
    this.beds = beds;
    this.quota = quota;
  }
}