import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbActionsModule, NbIconModule, NbMediaBreakpointsService, NbMenuService, NbOptionModule, NbSelectModule, NbSidebarService, NbThemeService, NbUserModule } from '@nebular/theme';

import { UserData } from '../../../app/core/users';
// import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NgFor } from '@angular/common';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-header',
  imports: [NbIconModule, NbActionsModule, NbSelectModule, NbUserModule, NgFor, NbOptionModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    }
  ];

  currentTheme = 'default';

  userMenu = [{ title: 'Profile' }, { title: 'Log out' }];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserData,
    // private layoutService: LayoutService,
    private storageService: StorageService,
    private breakpointService: NbMediaBreakpointsService) {
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => this.user = users.nick);

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

    this.themePreference();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
    this.storageService.setItem('user', JSON.stringify({ selectedTheme: this.currentTheme }));
  }

  toggleSidebar(): boolean {
    // this.sidebarService.toggle(true, 'menu-sidebar');
    // this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  themePreference() {
    const currentUser = this.storageService.getItem('user');
    if (currentUser) {
      const userTheme = JSON.parse(currentUser);
      this.themeService.changeTheme(userTheme.selectedTheme);

    }
    return;
  }
}
