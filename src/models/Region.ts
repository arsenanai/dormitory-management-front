import { Country } from "./Country";

export class Region {
  id: number;
  name: string;
  country: Country | null;

  constructor(id = 0, name = "", country: Country | null = null) {
    this.id = id;
    this.name = name;
    this.country = country;
  }
}