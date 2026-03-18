import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { DynamicChartComponent } from './dynamic-chart/dynamic-chart.component';

@Component({
  selector: 'app-analytics',
  imports: [NbCardModule, CommonModule, NbIconModule, NbButtonModule,  DynamicChartComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent {

}
