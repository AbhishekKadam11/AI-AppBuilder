import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatShowcaseService {

  constructor() { }

  loadMessages() {
    return [{type: 'text', text: "testing", reply: '', user: {name: "abhi", avatar:''}, date: '', files: '', quote: '', latitude: '', logitude: ''}];
  }

  reply(message: string) {
    return message;
  }
}
