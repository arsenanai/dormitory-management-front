export class RoomType {
    id: string;
    name: string;
    minimap: string;

    constructor(id = "", name = "", minimap = "") {
        this.id = id;
        this.name = name;
        this.minimap = minimap;
    }
}