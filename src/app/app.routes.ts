import { Routes } from '@angular/router';
import { ProgressComponent } from './progress/progress.component';

export const routes: Routes = [
     {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        children: [
            {
                path: '',
                component: ProgressComponent
            }
        ]
      }
];
