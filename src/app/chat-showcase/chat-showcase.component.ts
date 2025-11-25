import { AfterViewInit, Component, effect, signal, WritableSignal } from '@angular/core';
import { ChatShowcaseService } from '../services/chat-showcase.service';
import { NbChatMessageFile, NbChatModule } from '@nebular/theme';
import { NgFor } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MessageSchema } from '../core/message-schema';
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';
import { IChatMessage } from '../core/common';

@Component({
  selector: 'app-chat-showcase',
  standalone: true,
  imports: [NbChatModule, NgFor],
  templateUrl: './chat-showcase.component.html',
  styleUrl: './chat-showcase.component.scss'
})
export class ChatShowcaseComponent implements AfterViewInit {

  messages: WritableSignal<IChatMessage[]> = signal([]);
  private readonly chatSource = 'chatSource';
  private socketSubscription!: Subscription;
  private chatSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();
  messageSchema: MessageSchema;
  private appObject: any;

  constructor(protected chatShowcaseService: ChatShowcaseService,
    private socketService: SocketService,
    private progressControlService: ProgressControlService,
    private appWorkflowService: AppWorkflowService,
  ) {
    this.messageSchema = new MessageSchema();
    // effect(() => {
    //   const currentItems = this.messages();
    //   console.log('Effect running: Array value is now:', currentItems);
    //   if (currentItems.length > 0 && this.appWorkflowService.projectName) {
    //     this.appWorkflowService.saveAppObjInLocalStorage({ data: { chatMessages: [...currentItems] } });
    //   }
    // });
  }

  ngAfterViewInit() {
    this.socketSubscription = this.socketService?.socketStatus.subscribe((message) => {
      if (message.connected) {
        const serverReply$ = this.socketService?.on(this.chatSource);
        if (serverReply$ && !this.socketService?.socketStatus.closed) {
          const serverMessage: MessageSchema = new MessageSchema();
          this.chatSubscription = serverReply$.subscribe((response: any) => {
            console.log('Received chatSource from server:', response);
            serverMessage.setServerMessage(response);
            this.messages.update(currentItems => [...new Set([...currentItems, serverMessage.getMessage()])]);
            response.data.uiMessages = this.messages();
            this.appWorkflowService.processState('appRecived', response);
          }, (error) => {
            console.error("Received chatSource error from server:", error)
            serverMessage.setServerMessage(error);
            this.messages.update(currentItems => [...new Set([...currentItems, serverMessage.getMessage()])]);
          });
        }
      }
    });

    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        this.appObject = appDetails;
        if (this.appObject.projectName && !this.socketService?.socketStatus.closed) {
          console.log("App details received in chat showcase:", appDetails);
          this.messages.update(currentItems => [...new Set([...currentItems, ...this.appObject.data.uiMessages])]);
        }
      })
    );
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
    });
    this.messages.update(currentItems => [...currentItems, this.messageSchema.getMessage()]);
    let payload: any = {
      data: this.messages(),
    };
    if (this.appObject && this.appObject.projectName) { 
      payload.projectName = this.appObject.projectName;
      payload.chat_history = this.appObject.data.chat_history;
    }

    this.socketService.sendMessage(this.chatSource, payload);
    // const botReply = this.chatShowcaseService.reply(event.message);
    // if (botReply) {
    //   setTimeout(() => { this.messages.push(botReply) }, 500);
    // }
  }


}
