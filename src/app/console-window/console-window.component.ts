import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { WebContainerService } from '../services/web-container.service';
import { AutoScrollDirective } from '../services/auto-scroll.directive';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-console-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule, AutoScrollDirective],
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
  private readonly samelineChars = new Set(['/', '-', '\\', '|', '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']);
  private lastLogWasSameline = false;

  constructor(private webContainerService: WebContainerService, private socketService: SocketService) {
    this.appendLog = this.appendLog.bind(this);
    this.webContainerService.output$.subscribe(log => {
      this.appendLog(log);
    });
    this.fetchServerLogs();
  }


  private appendLog(log: string): void {

    if (!log || log.trim() === '') {
      return;
    }

    const trimmed = log.trim();
    const isSameline = this.samelineChars.has(trimmed.charAt(0));
    const timestamp = `[${new Date().toISOString()}]`;

    if (isSameline) {
      const entry = `[client] ${timestamp}: ${trimmed}`;

      if (this.lastLogWasSameline && this.collectionLogs.length > 0) {
        this.collectionLogs[this.collectionLogs.length - 1] = entry;
      } else {
        this.collectionLogs.push(entry);
        this.lastLogWasSameline = true;
      }
    } else {
      const entry = `[client] ${timestamp}: ${log}`;
      this.collectionLogs.push(entry);
      this.lastLogWasSameline = false;
    }
  }

  private fetchServerLogs(): void {
    if (!this.socketService?.socketStatus.closed) {
      this.socketService.sendMessage(this.userLogService, this.messages);
      const serverReply$ = this.socketService?.on(this.userLogService);
      if (serverReply$) {
        this.serverLogSubscription = serverReply$.subscribe((response: any) => {
          if (response.data == undefined || response.data.length == 0) return;
          if (!this.collectionLogs.includes(`[server] ${response.data}`)) {
            this.collectionLogs.push(`[server] ${response.data}`)
          }
        });
      }
    } else {
      console.warn('Socket is not connected. Cannot fetch server logs.');
    }
  }

}
