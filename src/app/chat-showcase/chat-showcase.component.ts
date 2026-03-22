import { AfterViewInit, Component, signal, WritableSignal } from '@angular/core';
import { ChatShowcaseService } from '../services/chat-showcase.service';
import { NbChatModule, NbIconModule } from '@nebular/theme';
import { CommonModule, NgFor } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MessageSchema } from '../core/message-schema';
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';
import { IChatMessage } from '../core/common';
import { ChatFormComponent } from './chat-form/chat-form.component';

@Component({
  selector: 'app-chat-showcase',
  standalone: true,
  imports: [NbChatModule, NgFor, NbIconModule, CommonModule, ChatFormComponent],
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
  droppedFiles: any[] = [];

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
        if (serverReply$ && !this.socketService?.socketStatus.closed) {
          const serverMessage: MessageSchema = new MessageSchema();
          this.chatSubscription = serverReply$.subscribe((response: any) => {
            console.log('Received chatSource from server:', response);
            serverMessage.setServerMessage(response);
            serverMessage.setComponentMessage(response);
            this.messages.update(currentItems => [...new Set([...currentItems, serverMessage.getMessage()])]);
            if (response.data) {
              response.data.uiMessages = this.messages();
              if (response.data.extraConfig && response.data.extraConfig.projectName && serverMessage.componentDetails.projectName !== response.data.extraConfig.projectName) {
                delete serverMessage.componentDetails.projectName;
              }
              if (serverMessage.componentDetails && serverMessage.componentDetails.projectName) {
                response.data.extraConfig = serverMessage.componentDetails;
              }
              if (this.appObject && this.appObject.data.extraConfig && this.appObject.data.extraConfig.projectName) {
                if (!response.data.extraConfig) {
                  response.data.extraConfig = {};
                }
                response.data.extraConfig.projectName = this.appObject.data.extraConfig.projectName;
              }
              if (!response.data.extraConfig) {
                response.data.extraConfig = {};
                response.data.extraConfig.projectName = new Date().getTime().toString();
              }
            }
            console.log("response.data.extraConfig", response.data.extraConfig)
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
        if (this.appObject && this.appObject.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
          console.log("App details received in chat showcase:", appDetails);
          this.messages.update(currentItems => [...new Set([...currentItems, ...this.appObject.data.uiMessages])]);
        }
      })
    );
  }

  sendMessage(event: any) {

    this.progressControlService.showProgressGif('reseacrhing');

    this.messageSchema.setMessage({
      text: event.message,
      type: this.droppedFiles.length > 0 ? 'file' : 'text',
      files: this.droppedFiles
    });
    this.messages.update(currentItems => [...currentItems, this.messageSchema.getMessage()]);

    this.droppedFiles = [];
    let payload: any = {
      data: this.messages(),
    };

    if (payload.data.length === 0) {
      payload.thread_id = new Date().getTime();
    }

    if (this.appObject && this.appObject.data.extraConfig.projectName) {
      payload.projectName = this.appObject.data.extraConfig.projectName;
      payload.path = this.appObject.data.extraConfig.routePath;
      payload.chat_history = this.appObject.data.messages;
    }

    this.socketService.sendMessage(this.chatSource, payload);
  }

  fileOverEvent(event: any) {
    this.droppedFiles = event;
  }

}
