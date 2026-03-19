import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NbButtonModule, NbCardModule } from "@nebular/theme";
// import { MatButton } from '@angular/material/button';
// import { ChartHostComponent } from '../chart-host/chart-host.component';

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: function (chart: any) {
    if (chart.config.type !== 'doughnut') return;

    var width = chart.width,
      height = chart.height,
      ctx = chart.ctx;

    ctx.restore();

    // Adjust font size based on chart height
    var fontSize = (height / 180).toFixed(2);
    ctx.font = "bold " + fontSize + "em sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#666"; // Color of the center text

    // Get the custom 'totalText' property we added to the dataset
    // We cast to 'any' here to avoid TypeScript errors regarding custom properties
    var text = (chart.data.datasets[0] as any).totalText;

    var textX = Math.round((width - ctx.measureText(text).width) / 2) - 1.5;
    var textY = height / 2 - 10;

    ctx.fillText(text, textX, textY);
    ctx.save();
  }
};

@Component({
  selector: 'app-dynamic-chart',
  templateUrl: './dynamic-chart.component.html',
  styleUrls: ['./dynamic-chart.component.scss'],
  standalone: true,
  imports: [BaseChartDirective, NbButtonModule, NbButtonModule, NbCardModule],
})
export class DynamicChartComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  // @Input() data: any;

  @Input() set data(data: any) {
    if (data) {
      this.updateChartData(data);
    }
  }


  constructor() {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

 public doughnutChartType: ChartType = 'doughnut';

  // 2. Register the plugin in a public array to bind in HTML
  public chartPlugins = [centerTextPlugin];

  // 3. Chart Options contains ONLY configuration objects, not the plugin array
  public doughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    //@ts-ignore
    // cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            let value = context.raw;
            let total = context.chart._metasets[context.datasetIndex].total;
            let percentage = Math.round((value / total) * 100) + '%';
            return label + value + ' (' + percentage + ')';
          }
        }
      }
    }
  };

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Input Tokens', 'Output Tokens'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#36A2EB', '#FF6384'],
      hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      //@ts-ignore
      totalText: '0' // Custom property for our plugin
    }]
  };

  updateChartData(data: any) {
    console.log("data-->", data);
    this.doughnutChartData.datasets[0].data = [
      data.metadata.usage.input_tokens,
      data.metadata.usage.output_tokens
    ];

    // Update the text to be displayed in the center
    //@ts-ignore
    this.doughnutChartData.datasets[0].totalText =  data.metadata.usage.total_tokens.toString();
  }
}
