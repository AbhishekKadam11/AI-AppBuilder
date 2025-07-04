import { Component } from '@angular/core';
import { ChatShowcaseService } from '../services/chat-showcase.service';
import { NbChatModule } from '@nebular/theme';
import { NgFor } from '@angular/common';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-chat-showcase',
  standalone: true,
  imports: [NbChatModule, NgFor],
  templateUrl: './chat-showcase.component.html',
  styleUrl: './chat-showcase.component.scss'
})
export class ChatShowcaseComponent {
messages: any[];

  // constructor(protected chatShowcaseService: ChatShowcaseService, private socketService: SocketService) {
  constructor(protected chatShowcaseService: ChatShowcaseService, private socketService: SocketService) {
    this.messages = this.chatShowcaseService.loadMessages();
  }

  sendMessage(event: any) {
    const files = !event.files ? [] : event.files.map((file: { src: string; type: string; }) => {
      return {
        url: file.src,
        type: file.type,
        icon: 'file-text-outline',
      };
    });

    this.messages.push({
      text: event.message,
      date: new Date(),
      reply: true,
      type: files.length ? 'file' : 'text',
      files: files,
      user: {
        name: 'Jonh Doe',
        avatar: 'https://i.gifer.com/no.gif',
      },
    });
    this.socketService.sendMessage('sendMessage', this.messages);
    // const botReply = this.chatShowcaseService.reply(event.message);
    // if (botReply) {
    //   setTimeout(() => { this.messages.push(botReply) }, 500);
    // }
  }
}
