import { describe, it, expect } from 'vitest';
import { RoomType } from '@/models/RoomType';

describe('RoomType', () => {
  it('should create a RoomType instance with default values', () => {
    const roomType = new RoomType();
    
    expect(roomType.id).toBe('');
    expect(roomType.name).toBe('');
    expect(roomType.minimap).toBe('');
    expect(roomType.photos).toEqual([]);
    expect(Array.isArray(roomType.photos)).toBe(true);
  });

  it('should create a RoomType instance with provided values', () => {
    const id = 'room-1';
    const name = 'Standard Room';
    const minimap = '{"beds": []}';
    const photos = ['photo1.jpg', 'photo2.jpg'];
    
    const roomType = new RoomType(id, name, minimap, photos);
    
    expect(roomType.id).toBe(id);
    expect(roomType.name).toBe(name);
    expect(roomType.minimap).toBe(minimap);
    expect(roomType.photos).toEqual(photos);
    expect(roomType.photos).toHaveLength(2);
  });

  it('should handle empty photos array when not provided', () => {
    const roomType = new RoomType('1', 'Test Room', '{}');
    
    expect(roomType.photos).toEqual([]);
    expect(Array.isArray(roomType.photos)).toBe(true);
  });

  it('should handle single photo as string and convert to array', () => {
    const roomType = new RoomType('1', 'Test Room', '{}', 'single-photo.jpg');
    
    expect(roomType.photos).toEqual(['single-photo.jpg']);
    expect(Array.isArray(roomType.photos)).toBe(true);
  });

  it('should handle photos as array when provided', () => {
    const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
    const roomType = new RoomType('1', 'Test Room', '{}', photos);
    
    expect(roomType.photos).toEqual(photos);
    expect(roomType.photos).toHaveLength(3);
  });
});
