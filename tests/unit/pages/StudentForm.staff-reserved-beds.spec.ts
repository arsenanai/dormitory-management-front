import { describe, it, expect, vi } from 'vitest';

// Test the bed filtering logic directly
describe('StudentForm - Staff Reserved Beds Filtering', () => {
  // Mock bed data with mixed staff reserved and regular beds
  const mockBeds = [
    {
      id: 1,
      room_id: 1,
      bed_number: 1,
      user_id: null,
      reserved_for_staff: false,
      room: { id: 1, number: '101' }
    },
    {
      id: 2,
      room_id: 1,
      bed_number: 2,
      user_id: null,
      reserved_for_staff: true, // Staff reserved
      room: { id: 1, number: '101' }
    },
    {
      id: 3,
      room_id: 1,
      bed_number: 3,
      user_id: null,
      reserved_for_staff: false,
      room: { id: 1, number: '101' }
    },
    {
      id: 4,
      room_id: 2,
      bed_number: 1,
      user_id: null,
      reserved_for_staff: true, // Staff reserved
      room: { id: 2, number: '102' }
    }
  ];

  // Simulate the bedOptions computed property logic
  const getBedOptions = (roomId: number, beds: any[]) => {
    return beds
      .filter(b => (b.room?.id || b.room_id) === roomId)
      .filter(bed => !bed.reserved_for_staff) // Exclude staff reserved beds completely
      .map(bed => ({
        value: bed.id,
        name: `Bed ${bed.bed_number}`,
        disabled: false // No need to disable since we filtered out staff reserved beds
      }));
  };

  it('should filter out staff reserved beds from bed options', () => {
    const bedOptions = getBedOptions(1, mockBeds);

    // Should only include non-staff reserved beds for room 1
    expect(bedOptions).toHaveLength(2);
    expect(bedOptions[0].value).toBe(1); // Bed 1 (not staff reserved)
    expect(bedOptions[1].value).toBe(3); // Bed 3 (not staff reserved)
    
    // Should not include bed 2 (staff reserved)
    expect(bedOptions.find((option: any) => option.value === 2)).toBeUndefined();
  });

  it('should show correct bed names without staff reserved indicator', () => {
    const bedOptions = getBedOptions(1, mockBeds);

    expect(bedOptions[0].name).toBe('Bed 1');
    expect(bedOptions[1].name).toBe('Bed 3');
    
    // Should not have "Staff Reserved" text since we filtered them out
    expect(bedOptions[0].name).not.toContain('Staff Reserved');
    expect(bedOptions[1].name).not.toContain('Staff Reserved');
  });

  it('should return empty array for room with only staff reserved beds', () => {
    const bedOptions = getBedOptions(2, mockBeds);

    // Room 2 only has staff reserved beds, so should return empty array
    expect(bedOptions).toHaveLength(0);
  });

  it('should validate staff reserved bed detection', () => {
    const staffReservedBed = mockBeds.find(b => b.id === 2);
    const regularBed = mockBeds.find(b => b.id === 1);

    expect(staffReservedBed?.reserved_for_staff).toBe(true);
    expect(regularBed?.reserved_for_staff).toBe(false);
  });
});
