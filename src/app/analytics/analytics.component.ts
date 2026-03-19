import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { DynamicChartComponent } from './dynamic-chart/dynamic-chart.component';
import { AppWorkflowService } from '../services/app-workflow.service';

interface IAppDetails {
  name: string;
  appDetails: any;
}

@Component({
  selector: 'app-analytics',
  imports: [NbCardModule, CommonModule, NbIconModule, NbButtonModule,  DynamicChartComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent {
  // appDetails = [{ id: 1, appName: 'Analytics' }, { id: 2, appName: 'Analytics' }, { id: 3, appName: 'Analytics' }, { id: 4, appName: 'Analytics' }, { id: 5, appName: 'Analytics' }, { id: 6, appName: 'Analytics' }];
  appDetails: any = [];
  appData: any = []
  constructor(private appWorkflowService: AppWorkflowService) {
    this.appData = this.appWorkflowService.fetchAppObjFromLocalStorage();
    if (this.appData) {
      console.log(this.appData);
      for(let app of this.appData) {
        this.appDetails.push({id: app.id, appName: app.data.extraConfig.projectName, metadata: {
          usage:app.data.messages[app.data.messages.length - 1].kwargs.usage_metadata,
          response: app.data.messages[app.data.messages.length - 1].kwargs.response_metadata
        }});
      }
      // this.appDetails = this.appData.appDetails;
    }
  }
}
