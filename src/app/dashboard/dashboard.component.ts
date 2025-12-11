import { Component } from '@angular/core';
import { NbActionsModule, NbButtonModule, NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuItem, NbMenuModule, NbMenuService, NbPopoverModule, NbPosition, NbSidebarModule, NbSidebarService } from '@nebular/theme';
import { Subject } from 'rxjs/internal/Subject';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../common/header/header.component";
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DirectoryListComponent } from './directory-list/directory-list.component';
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';
import { WindowService } from '../services/window.service';
import { WindowComponent } from '../window/window/window.component';
import { FooterComponent } from "../common/footer/footer.component";
import { Router, RouterModule } from '@angular/router';

type FileEvent = {
  data: string;
  success: boolean
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NbLayoutModule, NbSidebarModule, NbIconModule, NbMenuModule, CommonModule, NbActionsModule, HeaderComponent, DirectoryListComponent, WindowComponent, FooterComponent, NbPopoverModule, NbButtonModule, NbContextMenuModule, RouterModule],
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
  fileExplorerMenuItems: NbMenuItem[] = [
    { title: 'Download', icon: 'cloud-download-outline' },
    { title: 'Sonar', icon: 'activity-outline' },
  ];
  isExplorerReady: boolean = false;

  SideItems: NbMenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/workspace',
      home: true,
    },
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
    },
    {
      title: 'Settings',
      icon: 'settings-2-outline',
      link: '/workspace/settings',
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
  contextMenuPlacement = NbPosition.BOTTOM;

  private destroy$ = new Subject<void>();
  private socketSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private socketService: SocketService,
    private appWorkflowService: AppWorkflowService,
    public windowService: WindowService,
    private progressControlService: ProgressControlService) {
    // Sidebar menu item click handling
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'sideMenu'), // Optional: filter by menu tag if multiple menus exist
        map(({ item }) => item),
      )
      .subscribe(item => {
        console.log(`Menu item clicked: ${item}`);
        switch (item.title) {
          case 'Dashboard':

            // this.router.navigate(['/']);
            // item.selected = true;
            break;
          case 'Console':
            //   this.windowService.openWindow('consoleWindow', ConsoleWindowComponent, { title: 'Console', width: '600px', height: '400px' });
            break;
          case 'Browser':
            // this.windowService.openWindow('browserWindow', BrowserWindowComponent, { title: 'Browser', width: '800px', height: '600px' });
            break;
          case 'File Explorer':
            this.toggleSidebar();
            break;
          case 'Chat':
            // Navigate to chat - handled by link property
            break;
          case 'Settings':
            // item.selected = true;
            // this.router.navigate(['/settings']);
            break;
          // Add more cases as needed
          default:
            console.log(`No action defined for menu item: ${item.title}`);
        }
        // Add your custom logic here, e.g., navigate, open a dialog, etc.
      });

    // File Explorer menu item click handling
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'fileExplorerMenu'), // Optional: filter by menu tag if multiple menus exist
        map(({ item }) => item.title),
      )
      .subscribe(title => {
        console.log(`fileExplorerMenu item clicked: ${title}`);
        // if (title === 'Download') {
        //   this.downloadProject();
        // }
        switch (title) {
          case 'Download':
            this.downloadProject();
            break;
          case 'Sonar':
            this.executeSonar();
            break;
          // Add more cases as needed
          default:
            console.log(`No action defined for menu item: ${title}`);
        }

      });

    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails && appDetails.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
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

  getWindowIndex(windowId: string): number {
    const windows = this.windowService.getWindows()();
    return windows.findIndex(w => w.id === windowId);
  }

  downloadProject() {

  }

  executeSonar() {
    this.appWorkflowService.webContainerCommandRunner(['npm', 'run', 'test']);
    setTimeout(() => {
      this.appWorkflowService.webContainerCommandRunner(['npm', 'run', 'sonar']);
    }, 15000);
  }
}
