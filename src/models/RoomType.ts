export class RoomType {
  id: string;
  name: string;
  minimap: string;
  photos: string[];
  capacity: number;
  price: number;
  beds: any[];
  daily_rate: number;
  semester_rate: number;

  constructor(
    id = "",
    name = "",
    minimap = "",
    photos: string | string[] = [],
    capacity = 1,
    price = 0,
    beds: any[] = [],
    daily_rate = 0,
    semester_rate = 0
  ) {
    this.id = id;
    this.name = name;
    this.minimap = minimap;
    this.capacity = capacity;
    this.price = price;
    this.beds = beds;
    this.daily_rate = daily_rate;
    this.semester_rate = semester_rate;

    // Handle both single photo string and array of photos
    if (typeof photos === "string") {
      this.photos = [photos];
    } else if (Array.isArray(photos)) {
      this.photos = photos;
    } else {
      this.photos = [];
    }
  }
}
