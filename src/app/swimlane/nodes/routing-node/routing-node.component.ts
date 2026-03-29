import { Component, input } from '@angular/core';
import { NbCardModule, NbListModule, NbTagModule } from '@nebular/theme';
import {
  NgDiagramBaseNodeTemplateComponent,
  NgDiagramModelService,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram'
import { NodeData } from '../../../core/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-routing-node',
  imports: [NbCardModule, NgDiagramBaseNodeTemplateComponent, NbListModule, NbTagModule, CommonModule],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './routing-node.component.html',
  styleUrl: './routing-node.component.scss',
})
export class RoutingNodeComponent {
  node = input.required<Node<NodeData>>();
  routes = [];

  constructor(private modelService: NgDiagramModelService) { }

  selectRoute(route: any) {
    console.log('Selected route:', route);
    // You can add your logic here to handle the selected route
  }
}
