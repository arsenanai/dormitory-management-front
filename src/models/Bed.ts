import { User } from "./User";
import { Room } from "./Room";

export type BedUsageStatus = "available" | "reserved" | "occupied";

export interface BedHistoryEntry {
  user: User | null;
  status: BedUsageStatus;
  from: Date;
  to: Date | null;
}

export class Bed {
  id: string;
  number: string;
  status: BedUsageStatus;
  user: User | null; // Current user occupying or reserving
  history: BedHistoryEntry[];
  room: Room | null; // Many-to-one relationship
  reserved_for_staff: boolean; // If true, this bed is reserved for staff and cannot be assigned to students

  constructor(
    id = "",
    number = "",
    status: BedUsageStatus = "available",
    user: User | null = null,
    history: BedHistoryEntry[] = [],
    room: Room | null = null,
    reserved_for_staff: boolean = false
  ) {
    this.id = id;
    this.number = number;
    this.status = status;
    this.user = user;
    this.history = history;
    this.room = room;
    this.reserved_for_staff = reserved_for_staff;
  }
}
