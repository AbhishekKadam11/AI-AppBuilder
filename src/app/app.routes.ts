import { Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkbenchComponent } from './dashboard/workbench/workbench.component';
import { ExtensionsComponent } from './settings/extensions/extensions.component';

export const routes: Routes = [
  {
    path: '', component: DashboardComponent, title: 'Dashboard',
    children: [
      { path: 'settings', component: SettingsComponent, title: 'Settings',
        children: [
          { path: '', component: ExtensionsComponent, title: 'Extensions' },
        ]
       },
      { path: '', component: WorkbenchComponent, title: 'Workbench' },
    ]
  }
];