export class Payment {
  name: string;
  surname: string;
  dogovorDate: string;
  dogovorNumber: string;
  payment: string;

  constructor(
    name: string,
    surname: string,
    dogovorDate: string,
    dogovorNumber: string,
    payment: string
  ) {
    this.name = name;
    this.surname = surname;
    this.dogovorDate = dogovorDate;
    this.dogovorNumber = dogovorNumber;
    this.payment = payment;
  }
}