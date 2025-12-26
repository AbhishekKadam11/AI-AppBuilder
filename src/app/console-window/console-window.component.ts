import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { WebContainerService } from '../services/web-container.service';
import { AutoScrollDirective } from '../services/auto-scroll.directive';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-console-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule, CommonModule, AutoScrollDirective],
  standalone: true,
  templateUrl: './console-window.component.html',
  styleUrl: './console-window.component.scss'
})
export class ConsoleWindowComponent {

  collectionLogs: string[] = [];
  samelineLogs!: string;
  private readonly userLogService: string = 'UserLogService';
  private serverLogSubscription: Subscription | undefined;
  private socketSubscription: Subscription | undefined;
  messages: any = { "action": "", "path": "" };

  constructor(private webContainerService: WebContainerService, private socketService: SocketService) {
    this.appendLog = this.appendLog.bind(this);
    this.webContainerService.output$.subscribe(log => {
      this.appendLog(log);
    });
    this.fetchServerLogs();
  }


  private appendLog(log: string): void {
    const samelineWords = ['/', '-', '\\', '|', '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const timestamp = `[${new Date().toISOString()}]`;
    if (samelineWords.includes(log.trim().charAt(0))) {
      // Handle carriage return: overwrite the last line
      // console.log('sameline log:', log);
      this.samelineLogs = log != undefined ? `[client] ${timestamp}: ${log.trim()}` : '';
    } else {
      if (log != undefined && log.trim() != '') {
        this.collectionLogs.push(`[client] ${timestamp}: ${log}`);
      }
    }
  }

  private fetchServerLogs(): void {
    if (!this.socketService?.socketStatus.closed) {
      this.socketService.sendMessage(this.userLogService, this.messages);
      const serverReply$ = this.socketService?.on(this.userLogService);
      if (serverReply$) {
        this.serverLogSubscription = serverReply$.subscribe((response: any) => {
          console.log('Received serverLogSubscription from server:', response);
          if (response.data == undefined || response.data.length == 0) return;
          if (!this.collectionLogs.includes(`[server] ${response.data}`)) {
            this.collectionLogs.push(`[server] ${response.data}`)
          }
        });
      }
    }
  }

}
