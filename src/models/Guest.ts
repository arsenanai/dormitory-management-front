export class Guest {
  id: number;
  name: string;
  surname: string;
  enterDate: string;
  exitDate: string;
  telephone: string;
  room: string;
  payment: string;

  constructor(
    id: number,
    name: string,
    surname: string,
    enterDate: string,
    exitDate: string,
    telephone: string,
    room: string,
    payment: string
  ) {
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.enterDate = enterDate;
    this.exitDate = exitDate;
    this.telephone = telephone;
    this.room = room;
    this.payment = payment;
  }
}