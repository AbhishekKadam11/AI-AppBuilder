import { AfterViewInit, Component } from '@angular/core';
import { ChatShowcaseService } from '../services/chat-showcase.service';
import { NbChatMessageFile, NbChatModule } from '@nebular/theme';
import { NgFor } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';

interface IUser {
  name: string;
  avatar: string;
}

interface IMessage {
  type: string;
  text: string;
  reply: boolean;
  user: IUser;
  date: Date;
  files: NbChatMessageFile[];
  quote: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-chat-showcase',
  standalone: true,
  imports: [NbChatModule, NgFor],
  templateUrl: './chat-showcase.component.html',
  styleUrl: './chat-showcase.component.scss'
})
export class ChatShowcaseComponent implements AfterViewInit {

  messages: IMessage[] = [];
  private messageSubscription: Subscription | undefined;
  
  constructor(protected chatShowcaseService: ChatShowcaseService, private socketService: SocketService) {
   // this.messages = this.chatShowcaseService.loadMessages();
  }

  ngAfterViewInit() {
    this.socketService?.connectSocket('/projectId');
    const serverReply$ = this.socketService?.on('Source');
    if (serverReply$) {
      this.messageSubscription = serverReply$.subscribe((response: any) => {
        console.log('Received message from server:', response);
        // Assuming data is an object with a 'text' property
        this.messages.push(response.data);
      });
    }
  }

  ngOnInit(): void {
    // this.messageSubscription = this.socketService.on('server_reply').subscribe((data: string) => {
    //   this.messages.push(data);
    // });
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
      quote: '',
      latitude: 0,
      longitude: 0,
    });
    this.socketService.sendMessage('Source', this.messages);
    //  this.socketService.onEvent('sendMessage').subscribe((data: any) => {
    //   console.log('Received message from server:', data) ;
    //  })
    // const botReply = this.chatShowcaseService.reply(event.message);
    // if (botReply) {
    //   setTimeout(() => { this.messages.push(botReply) }, 500);
    // }
  }
}
