import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuItem, NbMenuModule, NbSidebarModule } from '@nebular/theme';


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
      selected: true,
      link: '/settings'
    },
    {
      title: 'Themes',
      icon: 'color-palette-outline',
      link: '/settings'
    },
    {
      title: 'Close',
      icon: 'close-outline',
      link: '/'
    },
  ]

  constructor(

  ) {
    
  }
}
