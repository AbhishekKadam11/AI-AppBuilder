import { Component, signal, computed, afterNextRender, WritableSignal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbChatModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { IClippitMessage } from '../../core/common';
import { SocketService } from '../../services/socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageSchema } from '../../core/message-schema';
import { AppWorkflowService } from '../../services/app-workflow.service';

// Interface for message structure
interface Message {
  sender: 'user' | 'bot';
  text: string;
  id?: number; // For tracking in @for
}

@Component({
  selector: 'app-clippit-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, NbChatModule, NbIconModule, NbLayoutModule],
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly socketService = inject(SocketService);
  private readonly appWorkflowService = inject(AppWorkflowService);
  private messageSchema: MessageSchema;

  shouldAnimate = computed(() => !this.isOpen());

  constructor() {
    // Scroll to bottom whenever messages change
    afterNextRender(() => {
      this.scrollToBottom();
    });
    this.assistanceGifUrl.set('assets/images/robot_assistant.gif');
    this.messageSchema = new MessageSchema();
  }

  ngAfterViewInit() {
    this.initSocketListener();
    this.socketService.connectSocket(this.socketNamespace);
    this.initAppWorkflowListener();
  }

  private initSocketListener() {
    const serverReply$ = this.socketService?.on(this.chatSource);

    if (!serverReply$) {
       console.log('no serverReply$');
      return;
    }

    serverReply$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: any) => {
        console.log('Received codeBuddy from server:', response);
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
    serverMessage.setServerMessage(response);
    serverMessage.setComponentMessage(response);

    this.addMessage(serverMessage.getMessage());

    // if (response.data?.supervisorMesssage?.length) {
    //   response.data.uiMessages = this.messages();
    //   // this.applyExtraConfig(response, serverMessage);
    //   console.log('response.data.extraConfig', response.data.extraConfig);
    //   this.appWorkflowService.processState('appRecived', response); // Note: 'appRecived' typo kept
    // }
  }

  // --- Helpers ---

  private generateAIResponse(input: string): string {
    const lowerInput = input.toLowerCase();
    const responses = [
      "I can definitely help with that!",
      "Are you sure you want to format that drive?",
      "It looks like you're writing a letter.",
      "Have you tried restarting the server?",
      "That's a great question for an AI.",
      "I'm just a paperclip, but I believe in you!"
    ];

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) return "Hello there! Ready to code?";
    if (lowerInput.includes('angular')) return "Angular Signals make state management so easy!";
    if (lowerInput.includes('help')) return "I am listening. What do you need?";

    return responses[Math.floor(Math.random() * responses.length)];
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
}
