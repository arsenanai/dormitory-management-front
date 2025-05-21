import { Region } from "./Region";

export class City {
  id: number;
  name: string;
  region: Region | null;

  constructor(id = 0, name = "", region: Region | null = null) {
    this.id = id;
    this.name = name;
    this.region = region;
  }
}