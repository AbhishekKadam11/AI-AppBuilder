import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuItem, NbMenuModule, NbMenuService, NbSidebarModule } from '@nebular/theme';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';

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
    },
    {
      title: 'Themes',
      icon: 'color-palette-outline',
    },
    {
      title: 'Close',
      icon: 'close-outline',
    },
  ]

  constructor(
    private router: Router,
    private menuService: NbMenuService,
  ) {
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'settingSideMenu'), // Optional: filter by menu tag if multiple menus exist
        map(({ item }) => item.title),
      )
      .subscribe(title => {
        console.log(`Menu item clicked: ${title}`);
        switch (title) {
          case 'Extensions':
            this.router.navigate(['/settings']);
            break;
          case 'Themes':
            this.router.navigate(['/settings']);
            break;
          case 'Close':
            this.router.navigate(['/']);
            break;
          default:
            console.log(`No action defined for menu item: ${title}`);
        }
      });
  }
}
