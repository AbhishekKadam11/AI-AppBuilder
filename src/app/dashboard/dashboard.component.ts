import { Component } from '@angular/core';
import { NbActionsModule, NbChatComponent, NbChatModule, NbIconModule, NbLayoutComponent, NbLayoutModule, NbMenuItem, NbMenuModule, NbMenuService, NbSidebarModule, NbSidebarService, NbWindowControlButtonsConfig, NbWindowModule, NbWindowService } from '@nebular/theme';
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
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';
import { WindowService } from '../services/window.service';
import { WindowComponent } from '../window/window/window.component';

type FileEvent = {
  data: string;
  success: boolean
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NbLayoutModule, NbSidebarModule, ChatShowcaseComponent, NbIconModule, NbMenuModule, CommonModule, BrowserWindowComponent, ConsoleWindowComponent, NbActionsModule, HeaderComponent, DirectoryListComponent, WindowComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {

  private readonly directoryManager = 'DirectoryManager';
  private directorySubscription: Subscription | undefined;
  messages: any = { "action": "getAll", "path": "newTech" };
  minimize = true;
  maximize = true;
  fullScreen = true;
  close = true;
  //  menuItems: NbMenuItem[] = [
  //   { title: 'Dashboard', link: '/dashboard', icon: 'home-outline' },
  //   { title: 'Users', link: '/users', icon: 'people-outline' },
  //   { title: 'Settings', link: '/settings', icon: 'settings-2-outline' },
  // ];
  isExplorerReady: boolean = false;

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
  private subscriptions: Subscription = new Subscription();

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private socketService: SocketService,
    // private windowService: NbWindowService,
    private appWorkflowService: AppWorkflowService,
    public windowService: WindowService,
    private progressControlService: ProgressControlService) {
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

    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails.projectName && !this.socketService?.socketStatus.closed) {
          // this.messages = { "action": "getAll", "path": appDetails.projectName };
          this.isExplorerReady = true;
        }
      })
    );

  }

  ngAfterViewInit() {
    this.socketService.connectSocket('/projectId');
    // this.socketSubscription = this.socketService?.socketStatus.subscribe((message) => {
    //   if (message.connected) {
    //     this.socketService.sendMessage(this.directoryManager, this.messages);
    //     const serverReply$ = this.socketService?.on(this.directoryManager);
    //     if (serverReply$) {
    //       this.directorySubscription = serverReply$.subscribe((response: any) => {
    //         console.log('Received directorySubscription from server:', response);
    //       });
    //     }
    //   }
    // });
  }

  ngOnInit() {

    this.progressControlService.showProgressGif('init');

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

  onFileClick(event: any) {
    console.log("event", event);
  }
}
