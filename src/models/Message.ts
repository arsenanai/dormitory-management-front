export class Message {
  from: string;
  to: string;
  subject: string;
  dateTime: string;
  content: string;

  constructor(from: string, to: string, subject: string, dateTime: string, content: string) {
    this.from = from;
    this.to = to;
    this.subject = subject;
    this.dateTime = dateTime;
    this.content = content;
  }
}
