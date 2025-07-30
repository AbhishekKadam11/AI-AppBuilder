import { Component } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { NbChatComponent, NbChatModule, NbIconComponent, NbIconModule, NbLayoutComponent, NbLayoutModule, NbSidebarComponent, NbSidebarModule, NbSidebarService, NbThemeModule } from '@nebular/theme';
import { ChatShowcaseComponent } from '../chat-showcase/chat-showcase.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // imports: [ChatShowcaseComponent, NbLayoutModule, ProgressComponent],
  imports: [NbLayoutModule, NbSidebarModule, ChatShowcaseComponent, NbIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
  constructor(private sidebarService: NbSidebarService) {
    // Initialization logic can go here if needed
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
