import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbActionsModule, NbIconLibraries, NbIconModule, NbJSThemesRegistry, NbMediaBreakpointsService, NbMenuService, NbOptionModule, NbSelectModule, NbSidebarService, NbThemeService, NbUserModule } from '@nebular/theme';
import { UserData } from '../../../app/core/users';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { AppWorkflowService } from '../../services/app-workflow.service';

export const themes = [
  {
    value: 'default',
    name: 'Light',
  },
  {
    value: 'dark',
    name: 'Dark',
  },
  {
    value: 'aquamarine',
    name: 'Aquamarine',
  },
  {
    value: 'golden-dark',
    name: 'Golden Dark',
  }
];

@Component({
  selector: 'app-header',
  imports: [NbIconModule, NbActionsModule, NbSelectModule, NbUserModule, NbOptionModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  currentTheme = 'default';
  userMenu = [{ title: 'Profile' }, { title: 'Log out' }];
  appList: any[] = [];
  selectedApp: string = '';
  themes: any[] = [];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserData,
    // private layoutService: LayoutService,
    private storageService: StorageService,
    private appWorkflowService: AppWorkflowService,
    private nbThemesRegistry: NbJSThemesRegistry,
    private iconsLibrary: NbIconLibraries,
    private breakpointService: NbMediaBreakpointsService) {
  }

  ngOnInit() {
    this.themes = themes;
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

    this.registerThemeVariables();
    this.themePreference();

     this.iconsLibrary.registerSvgPack('custom-icons', {
      'angular-logo': '<img src="assets/images/angular_gradient.png" width="24px">',
      'bot-avatar': '<img src="assets/images/bot.png" width="24px">',
    });

    this.appList = this.appWorkflowService.fetchAppObjFromLocalStorage();
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

  themePreference() {
    const currentUser = this.storageService.getItem('user');
    if (currentUser) {
      const userTheme = JSON.parse(currentUser);
      this.themeService.changeTheme(userTheme.selectedTheme);

    }
    return;
  }

  registerThemeVariables() {
    for (const theme of this.themes) {
      this.nbThemesRegistry.register({
        name: theme.value, // or 'dark', 'cosmic', etc.
        variables: theme.variables
      }, theme.name, theme.name);
    }
  }

  changeAppObj(appObject: any) {
    console.log("seleced appObject", appObject);
    this.appWorkflowService.processState('appRecived', appObject);
  }
}
