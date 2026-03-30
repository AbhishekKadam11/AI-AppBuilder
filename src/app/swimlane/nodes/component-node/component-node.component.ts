import { Component, input } from '@angular/core';
import { NbCardModule, NbIconModule, NbListModule, NbTagModule } from '@nebular/theme';
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
  selector: 'app-component-node',
  imports: [NbCardModule, NgDiagramBaseNodeTemplateComponent, NbListModule, NbTagModule, CommonModule, NbIconModule],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './component-node.component.html',
  styleUrl: './component-node.component.scss',
})
export class ComponentNodeComponent {
  node = input.required<Node<NodeData>>();
  routes = [];

  constructor(private modelService: NgDiagramModelService) { }

  selectRoute(route: any) {
    console.log('Selected route:', route);
    // You can add your logic here to handle the selected route
  }
}
