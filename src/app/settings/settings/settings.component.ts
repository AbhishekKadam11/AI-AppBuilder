import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuItem, NbMenuModule, NbMenuService, NbSidebarModule } from '@nebular/theme';

@Component({
  selector: 'app-settings',
  imports: [RouterModule, NbLayoutModule, NbSidebarModule, NbIconModule, NbMenuModule, CommonModule, NbContextMenuModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  isExplorerReady: boolean = true;

  SideItems: NbMenuItem[] = [
    {
      title: 'Extensions',
      icon: 'cube-outline',
      home: true,
      link: '/workspace/settings'
    },
    {
      title: 'Preferences',
      icon: 'color-palette-outline',
      link: '/workspace/settings/preferences'
    },
     {
      title: 'Developer',
      icon: 'layers-outline',
      link: '/workspace/settings/developer'
    },
    {
      title: 'Close',
      icon: 'close-outline',
      link: '/'
    },
  ]


  constructor(
    private router: Router,
    private menuService: NbMenuService,
  ) {
    // this.menuService.onItemClick()
    //   .pipe(
    //     filter(({ tag }) => tag === 'settingSideMenu'), // Optional: filter by menu tag if multiple menus exist
    //     map(({ item }) => item),
    //   )
    //   .subscribe(item => {
    //     // console.log(`Menu item clicked: ${JSON.stringify(item)} `);
    //     switch (item.title) {
    //       case 'Extensions':
    //         item.selected = true;
    //         this.menuService.onItemSelect().subscribe(selectedItem => {
    //           // selectedItem.selected = false;
    //           console.log(`Selected item: ${JSON.stringify(selectedItem)} `);
    //         });
    //         this.router.navigate(['/settings']);
    //         break;
    //       case 'Themes':
    //         item.selected = true;
    //         this.router.navigate(['/settings']);
    //         break;
    //       case 'Close':
    //         item.selected = true;
    //         this.router.navigate(['/']);
    //         break;
    //       default:
    //         console.log(`No action defined for menu item: ${item.title}`);
    //     }
    //   });
  }
}
