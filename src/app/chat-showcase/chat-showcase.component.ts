import { AfterViewInit, Component } from '@angular/core';
import { ChatShowcaseService } from '../services/chat-showcase.service';
import { NbChatMessageFile, NbChatModule } from '@nebular/theme';
import { NgFor } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MessageSchema } from '../core/message-schema';
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';

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
  files: NbChatMessageFile[] ;
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
  private readonly chatSource = 'chatSource';
  private socketSubscription!: Subscription;
  private chatSubscription!: Subscription;
  messageSchema: MessageSchema;
  
  constructor(protected chatShowcaseService: ChatShowcaseService, 
    private socketService: SocketService,
    private progressControlService: ProgressControlService,
    private appWorkflowService: AppWorkflowService,
  ) {
   this.messageSchema = new MessageSchema();
  }

  ngAfterViewInit() {
    this.socketSubscription = this.socketService?.socketStatus.subscribe((message) => {
      if (message.connected) {
        const serverReply$ = this.socketService?.on(this.chatSource);
        if (serverReply$) {
          this.chatSubscription = serverReply$.subscribe((response: any) => {
            console.log('Received chatSource from server:', response);
            this.appWorkflowService.processState('appRecived', response);
            const serverMessage: MessageSchema = new MessageSchema();
            serverMessage.setServerMessage(response);
            this.messages.push(serverMessage.getMessage());
          });
        }
      }
    });
  }

  ngOnInit(): void {

  }

  sendMessage(event: any) {

    this.progressControlService.showProgressGif('reseacrhing');
    const files = !event.files ? [] : event.files.map((file: { src: string; type: string; }) => {
      return {
        url: file.src,
        type: file.type,
        icon: 'file-text-outline',
      };
    });

    this.messageSchema.setMessage({
      text: event.message,
      date: new Date(),
      reply: true,
      type: files.length ? 'file' : 'text',
      files: files,
      user: {
        name: 'Creator',
        avatar: 'assets/images/admin.png',
      },
      quote: '',
      latitude: 0,
      longitude: 0,
    });
    this.messages.push(this.messageSchema.getMessage());
    this.socketService.sendMessage(this.chatSource, this.messages);

    // const botReply = this.chatShowcaseService.reply(event.message);
    // if (botReply) {
    //   setTimeout(() => { this.messages.push(botReply) }, 500);
    // }
  }
}
