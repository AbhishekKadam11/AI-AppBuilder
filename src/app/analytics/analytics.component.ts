import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { DynamicChartComponent } from './dynamic-chart/dynamic-chart.component';
import { AppWorkflowService } from '../services/app-workflow.service';

@Component({
  selector: 'app-analytics',
  imports: [NbCardModule, NbIconModule, NbButtonModule, DynamicChartComponent, NbLayoutModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})

export class AnalyticsComponent {

  appDetails: any = [];

  constructor(private appWorkflowService: AppWorkflowService) {
   const appData = this.appWorkflowService.fetchAppObjFromLocalStorage();
    if (appData) {
      for(let app of appData) {
        this.appDetails.push({id: app.id, appName: app.data.extraConfig.projectName, metadata: {
          usage:app.data.messages[app.data.messages.length - 1].kwargs.usage_metadata,
          response: app.data.messages[app.data.messages.length - 1].kwargs.response_metadata
        }});
      }
    }
  }
}
