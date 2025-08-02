import { Component } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { NbChatComponent, NbChatModule, NbIconModule, NbLayoutComponent, NbLayoutModule, NbMenuItem, NbMenuModule, NbMenuService, NbSidebarModule, NbSidebarService } from '@nebular/theme';
import { ChatShowcaseComponent } from '../chat-showcase/chat-showcase.component';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NbLayoutModule, NbSidebarModule, ChatShowcaseComponent, NbIconModule, NbMenuModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {

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

  constructor(private sidebarService: NbSidebarService, private menuService: NbMenuService) {
    // Initialization logic can go here if needed
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'sideMenu'), // Optional: filter by menu tag if multiple menus exist
        map(({ item }) => item.title),
      )
      .subscribe(title => {
        this.selectedItem = title;
        console.log(`Menu item clicked: ${title}`);
        if(title === 'File Explorer') {
  
          this.toggleSidebar();
        }
        // Add your custom logic here, e.g., navigate, open a dialog, etc.
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
  }

  toggleSidebar() {
    this.sidebarService.toggle(false, 'dynamicSidebar');
  }

  
}
