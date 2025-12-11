import { Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkbenchComponent } from './dashboard/workbench/workbench.component';
import { ExtensionsComponent } from './settings/extensions/extensions.component';
import { PreferencesComponent } from './settings/preferences/preferences.component';

export const routes: Routes = [
  {
    path: 'workspace', component: DashboardComponent, title: 'Dashboard',
    children: [
      {
        path: 'settings', component: SettingsComponent, title: 'Settings',
        children: [
          { path: '', component: ExtensionsComponent, title: 'Extensions' },
          { path: 'preferences', component: PreferencesComponent, title: 'Preferences' },
          // { path: '', redirectTo: 'extensions', pathMatch: 'full' },
        ]
      },
      { path: '', component: WorkbenchComponent, title: 'Workbench' },
    ],
  }, 
  { path: '', redirectTo: 'workspace', pathMatch: 'full' },
];