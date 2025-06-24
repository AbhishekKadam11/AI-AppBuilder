import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatShowcaseService {

  constructor() { }

  loadMessages() {
    return [];
  }

  reply(message: string) {
    return message;
  }
}
