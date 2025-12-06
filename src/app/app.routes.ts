import { Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WorkbenchComponent } from './dashboard/workbench/workbench.component';

export const routes: Routes = [
  {
    path: '', component: DashboardComponent, title: 'Dashboard',
    children: [
      { path: 'settings', component: SettingsComponent, title: 'Settings' },
      { path: '', component: WorkbenchComponent, title: 'Workbench' },
    ]
  }
];