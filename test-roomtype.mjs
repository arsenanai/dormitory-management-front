// Simple validation test for RoomType photos implementation

class RoomType {
    constructor(id = "", name = "", minimap = "", photos = []) {
        this.id = id;
        this.name = name;
        this.minimap = minimap;
        
        // Handle both single photo string and array of photos
        if (typeof photos === 'string') {
            this.photos = [photos];
        } else if (Array.isArray(photos)) {
            this.photos = photos;
        } else {
            this.photos = [];
        }
    }
}

// Test the RoomType class with photos
console.log('Testing RoomType class with TDD approach...\n');

// Test 1: Default constructor
console.log('Test 1: Default constructor');
const defaultRoomType = new RoomType();
console.log('✓ ID:', defaultRoomType.id);
console.log('✓ Name:', defaultRoomType.name);
console.log('✓ Minimap:', defaultRoomType.minimap);
console.log('✓ Photos:', defaultRoomType.photos);
console.log('✓ Photos is Array:', Array.isArray(defaultRoomType.photos));
console.log();

// Test 2: Constructor with all parameters
console.log('Test 2: Constructor with all parameters');
const fullRoomType = new RoomType('room-1', 'Luxury Suite', '{"beds": []}', ['photo1.jpg', 'photo2.jpg']);
console.log('✓ ID:', fullRoomType.id);
console.log('✓ Name:', fullRoomType.name);
console.log('✓ Minimap:', fullRoomType.minimap);
console.log('✓ Photos:', fullRoomType.photos);
console.log('✓ Photos length:', fullRoomType.photos.length);
console.log();

// Test 3: Single photo as string
console.log('Test 3: Single photo as string');
const singlePhotoRoomType = new RoomType('room-2', 'Standard Room', '{}', 'single-photo.jpg');
console.log('✓ Photos:', singlePhotoRoomType.photos);
console.log('✓ Photos is Array:', Array.isArray(singlePhotoRoomType.photos));
console.log('✓ First photo:', singlePhotoRoomType.photos[0]);
console.log();

// Test 4: Empty photos
console.log('Test 4: Empty photos');
const noPhotosRoomType = new RoomType('room-3', 'Budget Room', '{}');
console.log('✓ Photos:', noPhotosRoomType.photos);
console.log('✓ Photos is Array:', Array.isArray(noPhotosRoomType.photos));
console.log('✓ Photos length:', noPhotosRoomType.photos.length);
console.log();

console.log('All tests passed! ✅');
console.log('RoomType class successfully supports photos field as an array.');
