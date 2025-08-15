export class RoomType {
    id: string;
    name: string;
    minimap: string;
    photos: string[];
    capacity: number;
    price: number;
    beds: any[];

    constructor(
        id = "", 
        name = "", 
        minimap = "", 
        photos: string | string[] = [],
        capacity = 1,
        price = 0,
        beds: any[] = []
    ) {
        this.id = id;
        this.name = name;
        this.minimap = minimap;
        this.capacity = capacity;
        this.price = price;
        this.beds = beds;
        
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