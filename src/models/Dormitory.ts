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
    public rooms_count: number = 0
  ) {}

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
      data.rooms_count || 0
    );
  }
}