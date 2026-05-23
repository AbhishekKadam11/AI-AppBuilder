import { Component, signal, computed, afterNextRender, WritableSignal, inject, DestroyRef, ViewChild, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbChatModule, NbIconModule, NbLayoutModule, NbPopoverDirective, NbPopoverModule } from '@nebular/theme';
import { IClippitMessage } from '../../core/common';
import { SocketService } from '../../services/socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageSchema } from '../../core/message-schema';
import { AppWorkflowService } from '../../services/app-workflow.service';
import { Subscription } from 'rxjs';
import { WebContainerService } from '../../services/web-container.service';
import { ChatFormComponent } from '../../chat-showcase/chat-form/chat-form.component';
import { StorageService } from '../../services/storage.service';

// Interface for message structure
interface Message {
  sender: 'user' | 'bot';
  text: string;
  id?: number; // For tracking in @for
}

@Component({
  selector: 'app-clippit-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, NbChatModule, NbIconModule, NbLayoutModule, NbButtonModule, NbPopoverModule, ChatFormComponent],
  templateUrl: './clippit-bot.component.html',
  styleUrls: ['./clippit-bot.component.scss']
})

export class ClippitBotComponent {
  // --- State using Signals ---
  isOpen = signal(false);
  userInput = '';
  isTyping = signal(false);
  assistanceGifUrl = signal<string>('');
  messages: WritableSignal<IClippitMessage[]> = signal([]);
  droppedFiles: any[] = [];
  private appObject: any;
  private readonly codeBuddy = 'codeBuddy';
  private readonly chatSource = 'chatSource';
  private readonly socketNamespace = '/angular-code-assistant';
  private socketSubscription?: Subscription;
  private serverReplySubscription?: Subscription;
  private readonly destroyRef = inject(DestroyRef);
  private readonly socketService = inject(SocketService);
  private readonly appWorkflowService = inject(AppWorkflowService);
  private readonly webContainerService = inject(WebContainerService);
  private readonly storageService = inject(StorageService);
  private messageSchema: MessageSchema;
  private subscriptions: Subscription = new Subscription();
  private readonly directoryManager: string = 'DirectoryManager';
  private directorySubscription: Subscription | undefined;
  @ViewChild(NbPopoverDirective) popover!: NbPopoverDirective;
  isExtensionEnabled: WritableSignal<boolean> = signal(false);
  shouldAnimate = computed(() => !this.isOpen());

  constructor() {
    // Scroll to bottom whenever messages change
    afterNextRender(() => {
      this.scrollToBottom();
    });
    this.extensionStatus();
    this.assistanceGifUrl.set('assets/images/robot_assistant.gif');
    this.messageSchema = new MessageSchema();
  }

  ngAfterViewInit() {
    this.initSocketListener();
    this.socketService.connectSocket(this.socketNamespace);
    this.initAppWorkflowListener();
    // this.chatActions('modify', { filePath: '/', changes: [], content: "113" });
    this.popover?.show();
  }

  private extensionStatus() {
    const storedStatus = this.storageService.getItem('user');
    if (storedStatus) {
      const userPreferences = JSON.parse(storedStatus);
      this.isExtensionEnabled.set(userPreferences.active_extensions?.includes('codeBuddy') || false);
    }
  }

  private initSocketListener() {
    const serverReply$ = this.socketService?.on(this.chatSource, this.socketNamespace);

    if (!serverReply$) {
      return;
    }

    this.serverReplySubscription = serverReply$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: any) => {
        this.handleServerResponse(response);
      },
      error: (error) => {
        console.error('Received codeBuddy error from server:', error);
        const serverMessage = new MessageSchema();
        serverMessage.setServerMessage(error);
        this.addMessage(serverMessage.getMessage());
      }
    });
  }


  // --- Actions ---

  toggleChat() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      // Focus input slightly after transition starts
      setTimeout(() => {
        const inputEl = document.getElementById('user-input') as HTMLInputElement;
        inputEl?.focus();
      }, 100);
    }
  }

  sendMessage(event: any) {
    this.messageSchema.setMessage({
      text: event.message,
      type: this.droppedFiles.length > 0 ? 'file' : 'text',
      files: this.droppedFiles
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
      // create own chat history for assistant
      // payload.chat_history = this.appObject.data.messages;
    }

    this.socketService.sendMessage(this.chatSource, payload, this.socketNamespace);
  }

  private initAppWorkflowListener(): void {
    this.appWorkflowService.appObject$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((appDetails: any) => this.appObject = appDetails);
  }


  private handleServerResponse(response: any): void {
    console.log('Received codeBuddy from server:', response);
    const serverMessage = new MessageSchema();
    serverMessage.setClippitMessage(response);
    this.addMessage(serverMessage.getMessage());
    debugger;
    const lastMessage = response.data && response.data.messages && response.data.messages.length > 0 ? response.data.messages : [];
    if (lastMessage && lastMessage[lastMessage.length - 1].kwargs && lastMessage[lastMessage.length - 1].kwargs.content) {
      const message = lastMessage[lastMessage.length - 1].kwargs.content;
      if (message.modifiedCode && message.modifiedCode.length > 0) {
        const fileDetails = message.modifiedCode[message.modifiedCode.length - 1];
        const filePath = this.extractFromSrc(fileDetails.filePath);
        const changes = fileDetails.changes;
        this.chatActions('modify', { filePath, changes, content: fileDetails.content });
        // this.webContainerService.webContainerWriteFileContent(filePath, fileDetails.content);
        // this.saveToRemote(filePath, fileDetails.content);
      }
    }
  }

  private scrollToBottom() {
    const container = document.getElementById('messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private addMessage(message: IClippitMessage): void {
    this.messages.update(current => [...new Set([...current, message])]);
  }

  saveToRemote(filePath: string, fileContent: string) {
    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails && appDetails.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
          console.log('Saving file to remote:', appDetails.data.extraConfig.projectName + '/' + filePath);
          const messages = { "action": "save", "path": appDetails.data.extraConfig.projectName + '/' + filePath, content: fileContent };
          this.socketService.sendMessage(this.directoryManager, messages);
          const serverReply$ = this.socketService?.on(this.directoryManager);
          if (serverReply$) {
            this.directorySubscription = serverReply$.subscribe((response: any) => {
              console.log('Received directorySubscription save action from server:', response);
            });
          }
        }
      })
    );
  }

  chatActions(action: string, payload?: any) {
    switch (action) {
      case 'modify':
        // Handle code modification logic here
        console.log('Modifying code with payload:', payload);
        payload.buttonLabel = 'Apply Changes';
        this.promptActions('Do you want it to modify the code for you?', payload);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  promptActions(prompt: string, payload?: any) {
    // Handle prompt actions here
    console.log('Prompt action triggered with prompt:', prompt);
    this.addMessage({
      text: prompt, //`Do you want it to modify the code for you?`,
      type: 'button',
      customMessageData: payload, //{ text: "test", buttonLabel: 'Apply Changes' },
      user: { name: 'System', avatar: 'assets/images/system.png' },
      date: new Date(),
      reply: false,
      files: [],
      quote: ''
    });
  }

  executeButtonAction(payload: any) {
    // Example action for button click
    console.log('Button clicked with payload:', payload);
    this.webContainerService.webContainerWriteFileContent(payload.filePath, payload.content);
    this.saveToRemote(payload.filePath, payload.content);
     this.addMessage({
      text: "Code has been modified", //`Do you want it to modify the code for you?`,
      type: 'text',
      user: { name: 'System', avatar: 'assets/images/system.png' },
      date: new Date(),
      reply: false,
      files: [],
      quote: ''
    });
  }

  private extractFromSrc(fullPath: string): string {
    const srcIndex = fullPath.indexOf('src');
    if (srcIndex === -1) {
      throw new Error("The string 'src' was not found in the path.");
    }
    return fullPath.substring(srcIndex).replace(/\\/g, '/');
  }

  ngOnDestroy(): void {
    // this.socketSubscription?.unsubscribe();
    this.serverReplySubscription?.unsubscribe();
  }
}
