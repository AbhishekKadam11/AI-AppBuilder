import { Component } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { NbChatComponent, NbChatModule, NbIconModule, NbLayoutComponent, NbLayoutModule, NbMenuItem, NbMenuModule, NbSidebarModule, NbSidebarService } from '@nebular/theme';
import { ChatShowcaseComponent } from '../chat-showcase/chat-showcase.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // imports: [ChatShowcaseComponent, NbLayoutModule, ProgressComponent],
  imports: [NbLayoutModule, NbSidebarModule, ChatShowcaseComponent, NbIconModule,  NbMenuModule,],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {

   menuItems: NbMenuItem[] = [
    { title: 'Dashboard', link: '/dashboard', icon: 'home-outline' },
    { title: 'Users', link: '/users', icon: 'people-outline' },
    { title: 'Settings', link: '/settings', icon: 'settings-2-outline' },
  ];
  
  constructor(private sidebarService: NbSidebarService) {
    // Initialization logic can go here if needed
  }

  toggleSidebar() {
    this.sidebarService.toggle(true);
  }
}
