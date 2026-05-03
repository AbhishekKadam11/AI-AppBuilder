import { Component, signal, computed, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbChatModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { ChatFormComponent } from '../../chat-showcase/chat-form/chat-form.component';

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
  messages!: any[];
  // Initial message
  // messages = signal<Message[]>([
  //   {
  //     sender: 'bot',
  //     text: "It looks like you're trying to build an Angular app. Would you like some help?",
  //     id: 0
  //   }
  // ]);

  // Computed signal to check if we should animate (only when closed)
  shouldAnimate = computed(() => !this.isOpen());

  constructor() {
    // Scroll to bottom whenever messages change
    afterNextRender(() => {
      this.scrollToBottom();
    });
    this.assistanceGifUrl.set('assets/images/robot_assistant.gif');
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
    const files = !event.files ? [] : event.files.map((file: any) => {
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
    // const botReply = this.chatShowcaseService.reply(event.message);
    // if (botReply) {
    //   setTimeout(() => { this.messages.push(botReply) }, 500);
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
}
