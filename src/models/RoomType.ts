export class RoomType {
    id: string;
    name: string;
    minimap: string;
    photos: string[];

    constructor(id = "", name = "", minimap = "", photos: string | string[] = []) {
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