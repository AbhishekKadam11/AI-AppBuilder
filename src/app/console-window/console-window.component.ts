import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { WebContainerService } from '../services/web-container.service';

@Component({
  selector: 'app-console-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule, CommonModule],
  standalone: true,
  templateUrl: './console-window.component.html',
  styleUrl: './console-window.component.scss'
})
export class ConsoleWindowComponent {

  collectionLogs: string[] = [];
  samelineLogs!: string;

  constructor(private webContainerService: WebContainerService) {
    this.appendLog = this.appendLog.bind(this);
    this.webContainerService.output$.subscribe(log => {
      this.appendLog(log);
    });
   }

  private appendLog(log: string): void {
    const samelineWords = ['/', '-', '\\', '|', '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    if (samelineWords.includes(log.trim().charAt(0))) {
      // Handle carriage return: overwrite the last line
   
        this.samelineLogs = log.trim();
   
    } else {
      // if (this.samelineLogs) {
      //   this.collectionLogs.push(this.samelineLogs);
      //   this.samelineLogs = '';
      // } 
      this.collectionLogs.push(log);
    }
  }
}
