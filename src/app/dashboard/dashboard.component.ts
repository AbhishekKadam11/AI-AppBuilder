import { Component, OnInit, signal, ViewChild, ViewContainerRef, effect, ComponentRef, Renderer2, AfterViewInit, untracked } from '@angular/core';
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
import { ConsoleWindowComponent } from '../console-window/console-window.component';

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

export class DashboardComponent implements OnInit, AfterViewInit {

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
  @ViewChild('windowHost', { read: ViewContainerRef }) windowHost!: ViewContainerRef;
  private windowsComponents: Map<string, ComponentRef<WindowComponent>> = new Map();

  constructor(
    private router: Router,
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private socketService: SocketService,
    private appWorkflowService: AppWorkflowService,
    public windowService: WindowService,
    private progressControlService: ProgressControlService,
    private renderer: Renderer2,) {
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
     effect(() =>{ 
      setTimeout(() => this.renderWindows(), 100);
    }); 
    // setTimeout(() => this.renderWindows(), 100);
    // setTimeout(() => this.windowService.renderWindows(this.windowHost, this.windowsComponents, this.renderer),1000);
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

    // this.renderWindows();

    //  this.windowService.processBuffer();

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

    // setTimeout(() => {

    //  setTimeout(() => {
    //   this.renderWindows(); 
    // }, 2000);

    this.openFirstWindow();
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

  // renderWindows(): void {
  //   debugger
  //    if (!this.windowHost) {
  //     return; 
  //   }

  //   const currentWindows = this.windowService.getWindows()();
  //   this.windowHost?.clear();
  //   this.windowsComponents.clear();
  //   currentWindows.forEach((windowConfig, index) => {
  //     // Only render non-minimized windows in the host container
  //     if (!windowConfig.isMinimized()) {
  //       const componentRef = this.windowHost.createComponent(WindowComponent);
  //       componentRef.instance.window = windowConfig;

  //       // Use Renderer2 to add tailwind classes for placement
  //       if (windowConfig.data?.placementClasses) {

  //         console.log("placementClasses", windowConfig.data.placementClasses);
  //         windowConfig.data.placementClasses.split(' ').forEach((cls: string) => {
  //           // Tailwind utilities for absolute positioning (e.g., 'top-0', 'right-0', 'transform', '-translate-x-1/2')
  //           componentRef.location.nativeElement.classList.add(cls);
  //         });
  //       }
  //       this.windowsComponents.set(windowConfig.id, componentRef);
  //     }
  //   });
  // }

  //  renderWindows(): void {
  //   console.log("renderWindows called");
  //   // CRITICAL FIX: Only proceed if the windowHost ViewContainerRef is defined
  //   if (!this.windowHost) return;

  //   const currentWindows = this.windowService.getWindows()();
  //   //  console.log("currentWindows", currentWindows);
  //   // CRITICAL CHANGE: activeWindowIds should only contain IDs of windows that are *not* minimized
  //   const activeWindow = new Set(currentWindows.filter(w => !w.isMinimized()));

  //   // 1. Destroy components that should no longer be in the dashboard area (i.e., they are now minimized or removed)
  //   // this.windowsComponents.forEach((componentRef, id) => {
  //   //   // If the window ID is not in the active list (it's minimized or closed), destroy the component
  //   //   if (!activeWindowIds.has(id)) {
  //   //     componentRef.destroy();
  //   //     this.windowsComponents.delete(id);
  //   //   }
  //   // });

  //   // 2. Create components for windows that should be active and aren't already rendered
  //   currentWindows.forEach((windowConfig, index) => {
  //     // Only act if the window is NOT minimized and NOT already rendered
  //     // if (!windowConfig.isMinimized() && !this.windowsComponents.has(windowConfig.id)) {
  //     let componentRef: ComponentRef<WindowComponent> | undefined;
  //     if (!windowConfig.isMinimized()) {
  //       componentRef = this.windowsComponents.get(windowConfig.id) as ComponentRef<WindowComponent>;
  //       if (componentRef == undefined) {
  //         componentRef = this.windowHost.createComponent(WindowComponent);
  //       }
  //       // const componentRef = this.windowHost.createComponent(WindowComponent);
  //       componentRef.instance.window = windowConfig;
  //       // componentRef
        
  //       // componentRef.instance.minimizeWindowEvent.subscribe(() => {
  //       //   this.minimizeWindowCalled(windowConfig.id); 
  //       // });
  //       // componentRef.instance.maximizeWindowEvent.subscribe(() => {
  //       //   this.maximizeWindowCalled(windowConfig.id);
  //       // });

  //       // Add Tailwind placement classes via the Renderer2
  //       if (windowConfig.data?.placementClasses) {
  //         windowConfig.data.placementClasses.split(' ').forEach((cls: string) => {
  //           this.renderer.addClass(componentRef?.location.nativeElement, cls);
  //         });
  //       }

  //       this.windowsComponents.set(windowConfig.id, componentRef);
  //     }
  //   });
  // }

 renderWindows(): void {
    if (!this.windowHost) return; 

    const currentWindows = this.windowService.getWindows()();
    const activeWindowIds = new Set<string>();

    // CRITICAL FIX: Loop through windows and consume their isMinimized signal
    // to make the effect sensitive to this change.
    currentWindows.forEach(windowConfig => {
      if (!windowConfig.isMinimized()) { // Read the signal here
        activeWindowIds.add(windowConfig.id);
      }
    });

    // 1. Destroy components that should no longer be in the dashboard area
    this.windowsComponents.forEach((componentRef, id) => {
      if (!activeWindowIds.has(id)) {
        componentRef.destroy();
        this.windowsComponents.delete(id);
      }
    });

    // 2. Create components for windows that should be active and aren't already rendered
    // Use `untracked` when iterating for creation, as we only need to track the minimization state change
    untracked(() => {
      currentWindows.forEach((windowConfig, index) => {
        if (!windowConfig.isMinimized() && !this.windowsComponents.has(windowConfig.id)) {
          const componentRef = this.windowHost.createComponent(WindowComponent);
          componentRef.instance.window = windowConfig;
          
          if (windowConfig.data?.placementClasses) {
            windowConfig.data.placementClasses.split(' ').forEach((cls: string) => {
               this.renderer.addClass(componentRef.location.nativeElement, cls);
            });
          }

          this.windowsComponents.set(windowConfig.id, componentRef);
        }
      });
    });
  }

  openFirstWindow(): void {
    this.windowService.openWindow({
      title: 'Console',
      contentComponent: ConsoleWindowComponent,
      // isMaximized: signal(true),
      data: { message: 'Placed via Tailwind CSS', placementClasses: 'absolute top-0 left-0 m-4 w-1/2' }
    });
  }

  minimizeWindowCalled(windowId: string): void {
    console.log("minimizeWindow called", event);
    const windowToMinimize = this.windowsComponents.get(windowId);
    if (windowToMinimize) {
      // windowToMinimize.destroy();
      windowToMinimize.hostView.destroy();
      // this.windowsComponents.delete(windowId);
      this.windowService.minimizeWindow(windowId);
    }
  }

  maximizeWindowCalled(windowId: string): void {
    console.log("maximizeWindow called", event);
    // const currentWindows = this.windowService.getWindows()();
    // // CRITICAL CHANGE: activeWindowIds should only contain IDs of windows that are *not* minimized
    // const activeWindowIds = new Set(currentWindows.filter(w => !w.isMinimized()).map(w => w.id));
    // this.windowsComponents.forEach((componentRef, id) => {
    //   // If the window ID is not in the active list (it's minimized or closed), destroy the component
    //   // if (activeWindowIds.has(id)) {

    //   this.windowService.maximizeWindow(id);
    //   this.renderWindows();
    //   //  }
    // });
    // this.renderWindows();
    const windowToMaximize = this.windowsComponents.get(windowId);
    if (windowToMaximize) {
      this.windowService.maximizeWindow(windowId);
      this.renderWindows();
    }
  }
}
