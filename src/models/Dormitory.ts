import { Room } from "./Room";

export class Dormitory {
  constructor(
    public name: string = '',
    public capacity: number = 0,
    public gender: string = '',
    public admin: string = '',
    public admin_id: number | null = null,
    public address: string = '',
    public description: string = '',
    public quota: number = 0,
    public phone: string = '',
    // Computed fields (read-only, calculated by backend)
    public registered: number = 0,
    public freeBeds: number = 0,
    public rooms_count: number = 0,
    // Rooms array for dormitory form
    public rooms: Room[] = []
  ) {}

  // Method to get only the updatable fields for submission
  toSubmissionData() {
    return {
      name: this.name,
      capacity: this.capacity,
      gender: this.gender,
      admin_id: this.admin_id,
      address: this.address,
      description: this.description,
      quota: this.quota,
      phone: this.phone,
      rooms: this.rooms,
    };
  }

  // Calculate total capacity based on all beds in rooms
  calculateTotalCapacity(): number {
    return this.rooms.reduce((total, room) => {
      return total + (room.beds?.length || 0);
    }, 0);
  }

  // Calculate total rooms count
  calculateTotalRooms(): number {
    return this.rooms.length;
  }

  // Calculate free beds count
  calculateFreeBeds(): number {
    return this.rooms.reduce((total, room) => {
      const availableBeds = room.beds?.filter(bed => bed.status === 'available' && !bed.reserved_for_staff) || [];
      return total + availableBeds.length;
    }, 0);
  }

  // Calculate registered students count
  calculateRegisteredStudents(): number {
    return this.rooms.reduce((total, room) => {
      const occupiedBeds = room.beds?.filter(bed => bed.status === 'occupied' && !bed.reserved_for_staff) || [];
      return total + occupiedBeds.length;
    }, 0);
  }

  static fromApi(data: any): Dormitory {
    return new Dormitory(
      data.name || '',
      data.capacity || 0,
      data.gender || '',
      data.admin?.name || data.admin || '',
      data.admin_id || null,
      data.address || '',
      data.description || '',
      data.quota || 0,
      data.phone || '',
      // Computed fields
      data.registered || 0,
      data.freeBeds || 0,
      data.rooms_count || 0,
      // Rooms array
      data.rooms || []
    );
  }
}