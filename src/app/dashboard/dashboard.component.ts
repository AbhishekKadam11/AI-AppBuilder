import { Component } from '@angular/core';
import { NbActionsModule, NbChatComponent, NbChatModule, NbIconModule, NbLayoutComponent, NbLayoutModule, NbMenuItem, NbMenuModule, NbMenuService, NbSidebarModule, NbSidebarService, NbWindowModule, NbWindowService } from '@nebular/theme';
import { ChatShowcaseComponent } from '../chat-showcase/chat-showcase.component';
import { Subject } from 'rxjs/internal/Subject';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { CommonModule } from '@angular/common';
import { BrowserWindowComponent } from '../browser-window/browser-window.component';
import { ConsoleWindowComponent } from '../console-window/console-window.component';
import { HeaderComponent } from "../common/header/header.component";
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DirectoryListComponent } from './directory-list/directory-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NbLayoutModule, NbSidebarModule, ChatShowcaseComponent, NbIconModule, NbMenuModule, CommonModule, NbWindowModule, BrowserWindowComponent, ConsoleWindowComponent, NbActionsModule, HeaderComponent, DirectoryListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {

  private readonly directoryManager = 'DirectoryManager';
  private directorySubscription: Subscription | undefined;
  messages: any = { "action": "getAll", "path": "newTech" };

  //  menuItems: NbMenuItem[] = [
  //   { title: 'Dashboard', link: '/dashboard', icon: 'home-outline' },
  //   { title: 'Users', link: '/users', icon: 'people-outline' },
  //   { title: 'Settings', link: '/settings', icon: 'settings-2-outline' },
  // ];

  SideItems: NbMenuItem[] = [
    {
      title: 'File Explorer',
      icon: 'folder-outline',
    },
    {
      title: 'Console',
      icon: 'clipboard-outline',
    },
    {
      title: 'Browser',
      icon: { icon: 'browser-outline', pack: 'eva' },
    },
    {
      title: 'Chat',
      icon: 'message-circle-outline',
      link: '/chat',
    },
    {
      title: 'Settings',
      icon: 'settings-2-outline',
    },
    {
      title: 'Logout',
      icon: 'unlock-outline',
    },
  ];

  items: NbMenuItem[] = [
    {
      title: 'Profile',
      icon: 'person-outline',
    },
    {
      title: 'Change Password',
      icon: 'lock-outline',
    },
    {
      title: 'Privacy Policy',
      icon: { icon: 'checkmark-outline', pack: 'eva' },
    },
    {
      title: 'Logout',
      icon: 'unlock-outline',
    },
  ];

  private destroy$ = new Subject<void>();
  selectedItem: string | undefined;
  private socketSubscription!: Subscription;

  constructor(private sidebarService: NbSidebarService, private menuService: NbMenuService, private socketService: SocketService) {
    // Initialization logic can go here if needed
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'sideMenu'), // Optional: filter by menu tag if multiple menus exist
        map(({ item }) => item.title),
      )
      .subscribe(title => {
        this.selectedItem = title;
        console.log(`Menu item clicked: ${title}`);
        if (title === 'File Explorer') {

          this.toggleSidebar();
        }
        // Add your custom logic here, e.g., navigate, open a dialog, etc.
      });

  }

  ngAfterViewInit() {
    this.socketService.connectSocket('/projectId');
    this.socketSubscription = this.socketService?.socketStatus.subscribe((message) => {
      if (message.connected) {
        this.socketService.sendMessage(this.directoryManager, this.messages);
        const serverReply$ = this.socketService?.on(this.directoryManager);
        if (serverReply$) {
          this.directorySubscription = serverReply$.subscribe((response: any) => {
            console.log('Received directorySubscription from server:', response);
          });
        }
      }
    });
  }

  ngOnInit() {
    // this.menuService?.onItemSelect().subscribe((event) => {
    //   // Handle the menu item click event here
    //   debugger
    //   console.log('Menu item clicked:', event.item.title);

    //   // You can access properties of the clicked item, such as:
    //   // event.item.title
    //   // event.item.link
    //   // event.item.tag (if a tag was assigned to the menu)
    //   // event.item.data (if custom data was added to the item)

    //   // Example: Perform an action based on the clicked item's title
    //   if (event.item.title === 'Log out') {
    //     // Perform logout logic
    //   } else if (event.item.link) {
    //     // Navigate to the specified link
    //   }
    // });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    // this.socketService.close();
  }

  toggleSidebar() {
    this.sidebarService.toggle(false, 'dynamicSidebar');
  }


}
