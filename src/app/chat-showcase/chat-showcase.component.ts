import { AfterViewInit, Component, inject, signal, WritableSignal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatShowcaseService } from '../services/chat-showcase.service';
import { NbChatModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { SocketService } from '../services/socket.service';
import { MessageSchema } from '../core/message-schema';
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';
import { IChatMessage } from '../core/common';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { JiraGraberService } from '../services/jira-graber.service';

@Component({
  selector: 'app-chat-showcase',
  standalone: true,
  imports: [NbChatModule, NbIconModule, ChatFormComponent, NbLayoutModule],
  templateUrl: './chat-showcase.component.html',
  styleUrl: './chat-showcase.component.scss'
})

export class ChatShowcaseComponent implements AfterViewInit {
  messages: WritableSignal<IChatMessage[]> = signal([]);
  droppedFiles: any[] = [];

  private readonly chatSource = 'chatSource';
  private messageSchema: MessageSchema;
  private appObject: any;

  // Modern consistent injection
  private readonly chatShowcaseService = inject(ChatShowcaseService);
  private readonly socketService = inject(SocketService);
  private readonly progressControlService = inject(ProgressControlService);
  private readonly appWorkflowService = inject(AppWorkflowService);
  private readonly jiraGraberService = inject(JiraGraberService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.messageSchema = new MessageSchema();
  }

  ngAfterViewInit() {
    this.initSocketListener();
    this.initAppWorkflowListener();
    this.initJiraListener();
  }

  sendMessage(event: any) {
    this.progressControlService.showProgressGif('reseacrhing'); // Note: Check if 'reseacrhing' is a typo

    this.messageSchema.setMessage({
      text: event.message,
      type: this.droppedFiles.length > 0 ? 'file' : 'text',
      files: this.droppedFiles,
      // user: { name: event?.user.name, avatar: event?.user.avatar },
    });

    this.addMessage(this.messageSchema.getMessage());
    this.droppedFiles = [];

    const payload: any = { data: this.messages() };
    if (payload.data.length === 0) {
      payload.thread_id = new Date().getTime();
    }

    const appExtraConfig = this.appObject?.data?.extraConfig;
    if (appExtraConfig?.projectName) {
      payload.projectName = appExtraConfig.projectName;
      payload.path = appExtraConfig.routePath;
      payload.chat_history = this.appObject.data.messages;
    }

    console.log('Payload sent to server:', payload);
    this.socketService.sendMessage(this.chatSource, payload);
  }

  fileOverEvent(event: any) {
    this.droppedFiles = event;
  }

  // --- Private Helper Methods ---

  private initSocketListener(): void {
    this.socketService?.socketStatus.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((message) => {
      if (!message.connected) return;

      const serverReply$ = this.socketService?.on(this.chatSource);
      if (!serverReply$ || this.socketService?.socketStatus.closed) return;

      serverReply$.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (response: any) => {
          console.log('Received chatSource from server:', response);
          this.handleServerResponse(response);
        },
        error: (error) => {
          console.error('Received chatSource error from server:', error);
          const serverMessage = new MessageSchema();
          serverMessage.setServerMessage(error);
          this.addMessage(serverMessage.getMessage());
        }
      });
    });
  }

  private initAppWorkflowListener(): void {
    this.appWorkflowService.appObject$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((appDetails: any) => {
      this.appObject = appDetails;
      const appExtraConfig = this.appObject?.data?.extraConfig;

      if (appExtraConfig?.projectName && !this.socketService?.socketStatus.closed) {
        console.log('App details received in chat showcase:', appDetails);
        this.messages.update(current => [...new Set([...current, ...this.appObject.data.uiMessages])]);
      }
    });
  }

  private initJiraListener(): void {
    this.jiraGraberService.jiraResponse$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((response: any) => {
      console.log("JiraListener response==>", response)
      if (Object.keys(response).length > 0) {
        this.updateMessagesFromExtension(response);
      }
    });
  }

  /** Eliminates duplicated processing logic between Socket and Jira subscriptions */
  private handleServerResponse(response: any): void {
    const serverMessage = new MessageSchema();
    serverMessage.setServerMessage(response);
    serverMessage.setComponentMessage(response);

    this.addMessage(serverMessage.getMessage());

    // Note: 'supervisorMesssage' has 3 's'. Kept as is in case it's dictated by the backend.
    if (response.data?.supervisorMesssage?.length) {
      response.data.uiMessages = this.messages();
      this.applyExtraConfig(response, serverMessage);
      console.log('response.data.extraConfig', response.data.extraConfig);
      this.appWorkflowService.processState('appRecived', response); // Note: 'appRecived' typo kept
    }
  }

  /** Extracts deeply nested extraConfig if/else logic */
  private applyExtraConfig(response: any, serverMessage: MessageSchema): void {
    const serverProjectName = serverMessage.componentDetails?.projectName;
    const responseExtraConfig = response.data.extraConfig;
    const appProjectName = this.appObject?.data?.extraConfig?.projectName;

    // Rule 1: Remove project name from component details if it mismatches response
    if (responseExtraConfig?.projectName && serverProjectName !== responseExtraConfig.projectName) {
      delete serverMessage.componentDetails.projectName;
    }

    // Rule 2: Use component details if server project name exists
    if (serverProjectName) {
      response.data.extraConfig = serverMessage.componentDetails;
    }

    // Rule 3: Override with App object project name if it exists
    if (appProjectName) {
      response.data.extraConfig = response.data.extraConfig || {};
      response.data.extraConfig.projectName = appProjectName;
    }

    // Rule 4: Fallback to timestamp if no project name exists
    if (!response.data.extraConfig?.projectName) {
      response.data.extraConfig = response.data.extraConfig || {};
      response.data.extraConfig.projectName = new Date().getTime().toString();
    }
  }

  /** Reusable signal updater */
  private addMessage(message: IChatMessage): void {
    this.messages.update(current => [...new Set([...current, message])]);
  }

  private updateMessagesFromExtension(response: any) {
    const appProjectName = this.appObject?.data?.extraConfig?.projectName;
    if (!appProjectName) {
      return;
    }
    if (response.projectName === appProjectName) {
      this.sendMessage(response);
    }
  }
}
