import { Component } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { NbChatComponent, NbChatModule, NbThemeModule } from '@nebular/theme';
import { ChatShowcaseComponent } from '../chat-showcase/chat-showcase.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChatShowcaseComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
